import { hashPassword, verifyPassword, evaluatePasswordStrength, generateSecureRandomToken } from '../security/crypto';
import { sanitizeString, isValidEmail } from '../security/sanitizer';
import { rateLimiter } from '../security/rateLimiter';
import { csrfService } from '../security/csrf';
import { UserRole } from '../types';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  event:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILURE'
    | 'REGISTRATION'
    | 'LOGOUT'
    | 'PASSWORD_RESET_REQUEST'
    | 'PASSWORD_CHANGED'
    | 'CSRF_BLOCKED'
    | 'RATE_LIMIT_BLOCKED'
    | 'UNAUTHORIZED_ACCESS_BLOCKED';
  email: string;
  ip: string;
  userAgent: string;
  details: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
  companyName?: string;
}

export interface UserSession {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  expiresAt: number;
  companyName?: string;
}

const USERS_STORAGE_KEY = 'speedjobs_secure_users_v2';
const SESSION_STORAGE_KEY = 'speedjobs_secure_session_v2';
const AUDIT_LOGS_KEY = 'speedjobs_security_logs_v2';

class AuthService {
  private users: Map<string, UserAccount> = new Map();
  private auditLogs: SecurityAuditLog[] = [];
  private activeSession: UserSession | null = null;
  private resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();

  constructor() {
    this.initDatabase();
    this.loadSession();
    this.loadAuditLogs();
  }

  private async initDatabase() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const list: UserAccount[] = JSON.parse(raw);
        list.forEach((u) => this.users.set(u.email.toLowerCase(), u));
        return;
      }
    } catch {}

    // 1. Seed demo candidate: Alex Rivera (role: funcionario)
    const candidateCreds = await hashPassword('SpeedJobs@2026!');
    const candidateUser: UserAccount = {
      id: 'usr-cand-alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@speedtalent.dev',
      passwordHash: candidateCreds.hash,
      salt: candidateCreds.salt,
      role: 'funcionario',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    this.users.set(candidateUser.email.toLowerCase(), candidateUser);

    // 2. Seed demo employer: Sarah Vance (role: empresa)
    const employerCreds = await hashPassword('SpeedJobs@2026!');
    const employerUser: UserAccount = {
      id: 'usr-emp-sarah',
      name: 'Sarah Vance',
      email: 'recrutador@hyperscale.com',
      passwordHash: employerCreds.hash,
      salt: employerCreds.salt,
      role: 'empresa',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      companyName: 'HyperScale Labs',
    };
    this.users.set(employerUser.email.toLowerCase(), employerUser);

    this.persistUsers();
  }

  private persistUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(Array.from(this.users.values())));
    } catch {}
  }

  private loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const session: UserSession = JSON.parse(raw);
        if (session.expiresAt > Date.now()) {
          this.activeSession = session;
        } else {
          this.activeSession = null;
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {}
  }

  private persistSession(rememberMe: boolean = true) {
    if (!this.activeSession) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    const val = JSON.stringify(this.activeSession);
    if (rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, val);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, val);
    }
  }

  private loadAuditLogs() {
    try {
      const raw = localStorage.getItem(AUDIT_LOGS_KEY);
      if (raw) {
        this.auditLogs = JSON.parse(raw);
        return;
      }
    } catch {}
    this.logAuditEvent({
      event: 'LOGIN_SUCCESS',
      email: 'system@speedjobs.com',
      details: 'Plataforma SpeedJobs inicializada com segurança RBAC ativa',
    });
  }

  private logAuditEvent(entry: Omit<SecurityAuditLog, 'id' | 'timestamp' | 'ip' | 'userAgent'>) {
    const log: SecurityAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleString(),
      ip: '127.0.0.1 (Local Client)',
      userAgent: navigator.userAgent.slice(0, 70),
      ...entry,
    };
    this.auditLogs = [log, ...this.auditLogs.slice(0, 49)];
    try {
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(this.auditLogs));
    } catch {}
  }

  public getSecurityLogs(): SecurityAuditLog[] {
    return this.auditLogs;
  }

  public getCurrentSession(): UserSession | null {
    if (this.activeSession && this.activeSession.expiresAt < Date.now()) {
      this.logout();
      return null;
    }
    return this.activeSession;
  }

  /**
   * RBAC: Valida se o usuário tem permissão para publicar vagas (Apenas Empresa)
   */
  public canPostJobs(session: UserSession | null): boolean {
    return session?.role === 'empresa';
  }

  /**
   * RBAC: Valida se o usuário tem permissão para se candidatar (Apenas Funcionário)
   */
  public canApplyJobs(session: UserSession | null): boolean {
    return session?.role === 'funcionario';
  }

  /**
   * RBAC Backend / Service Guard: Lança erro de acesso negado se tentar publicar sem ser Empresa
   */
  public assertCanPostJobs(session: UserSession | null): { allowed: boolean; error?: string } {
    if (!session) {
      this.logAuditEvent({
        event: 'UNAUTHORIZED_ACCESS_BLOCKED',
        email: 'anonymous',
        details: 'Tentativa de criar vaga sem autenticação',
      });
      return { allowed: false, error: 'Acesso negado: Você precisa estar logado como Empresa para publicar vagas.' };
    }
    if (session.role !== 'empresa') {
      this.logAuditEvent({
        event: 'UNAUTHORIZED_ACCESS_BLOCKED',
        email: session.email,
        details: `Usuário do tipo ${session.role} tentou publicar vaga`,
      });
      return { allowed: false, error: 'Acesso restrito: Contas de Funcionário/Candidato não têm permissão para publicar vagas.' };
    }
    return { allowed: true };
  }

  /**
   * RBAC Backend / Service Guard: Lança erro de acesso negado se tentar se candidatar sendo Empresa
   */
  public assertCanApplyJobs(session: UserSession | null): { allowed: boolean; error?: string } {
    if (session && session.role === 'empresa') {
      this.logAuditEvent({
        event: 'UNAUTHORIZED_ACCESS_BLOCKED',
        email: session.email,
        details: 'Conta de Empresa tentou se candidatar a uma vaga',
      });
      return { allowed: false, error: 'Acesso restrito: Contas de Empresa/Contratante não podem se candidatar a vagas.' };
    }
    return { allowed: true };
  }

  /**
   * Login Seguro com PBKDF2, anti-CSRF e anti-brute force
   */
  public async login(
    emailRaw: string,
    passwordRaw: string,
    csrfToken: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; error?: string; remainingAttempts?: number; lockoutSeconds?: number }> {
    if (!csrfService.validateToken(csrfToken)) {
      this.logAuditEvent({
        event: 'CSRF_BLOCKED',
        email: emailRaw,
        details: 'Tentativa de login bloqueada: Token CSRF inválido ou expirado',
      });
      return { success: false, error: 'csrfError' };
    }

    const email = sanitizeString(emailRaw).toLowerCase();
    const password = passwordRaw;

    if (!isValidEmail(email) || !password) {
      return { success: false, error: 'genericAuthError' };
    }

    const rateCheck = rateLimiter.isBlocked(email);
    if (rateCheck.blocked) {
      this.logAuditEvent({
        event: 'RATE_LIMIT_BLOCKED',
        email,
        details: `Rate limiting ativo: login bloqueado por ${rateCheck.remainingSeconds}s`,
      });
      return {
        success: false,
        error: 'rateLimitBlocked',
        lockoutSeconds: rateCheck.remainingSeconds,
      };
    }

    const user = this.users.get(email);
    if (!user) {
      const fail = rateLimiter.recordFailure(email);
      this.logAuditEvent({
        event: 'LOGIN_FAILURE',
        email,
        details: 'Falha de autenticação: usuário não encontrado',
      });
      return {
        success: false,
        error: fail.locked ? 'rateLimitBlocked' : 'genericAuthError',
        remainingAttempts: fail.remainingAttempts,
        lockoutSeconds: fail.lockoutSeconds,
      };
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash, user.salt);
    if (!isPasswordValid) {
      const fail = rateLimiter.recordFailure(email);
      this.logAuditEvent({
        event: 'LOGIN_FAILURE',
        email,
        details: 'Falha de autenticação: hash de senha incompatível',
      });
      return {
        success: false,
        error: fail.locked ? 'rateLimitBlocked' : 'genericAuthError',
        remainingAttempts: fail.remainingAttempts,
        lockoutSeconds: fail.lockoutSeconds,
      };
    }

    rateLimiter.recordSuccess(email);

    user.lastLoginAt = new Date().toISOString();
    this.users.set(email, user);
    this.persistUsers();

    csrfService.rotateToken();

    this.activeSession = {
      token: generateSecureRandomToken(32),
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      expiresAt: Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000),
    };

    this.persistSession(rememberMe);

    this.logAuditEvent({
      event: 'LOGIN_SUCCESS',
      email,
      details: `Login autorizado com sucesso como ${user.role.toUpperCase()}`,
    });

    return { success: true };
  }

  /**
   * Registro com escolha explícita de perfil (Empresa vs Funcionário)
   */
  public async register(
    nameRaw: string,
    emailRaw: string,
    passwordRaw: string,
    role: UserRole,
    csrfToken: string,
    companyNameRaw?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!csrfService.validateToken(csrfToken)) {
      return { success: false, error: 'csrfError' };
    }

    const name = sanitizeString(nameRaw);
    const email = sanitizeString(emailRaw).toLowerCase();
    const companyName = companyNameRaw ? sanitizeString(companyNameRaw) : undefined;

    if (!name || name.length < 2) {
      return { success: false, error: 'Nome inválido (mínimo de 2 caracteres)' };
    }

    if (!isValidEmail(email)) {
      return { success: false, error: 'E-mail em formato inválido' };
    }

    if (role !== 'funcionario' && role !== 'empresa') {
      return { success: false, error: 'Selecione um tipo de conta válido (Funcionário ou Empresa)' };
    }

    const strength = evaluatePasswordStrength(passwordRaw);
    if (strength.score < 2) {
      return { success: false, error: 'weakPassword' };
    }

    if (this.users.has(email)) {
      return { success: false, error: 'genericAuthError' };
    }

    const creds = await hashPassword(passwordRaw);
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      email,
      passwordHash: creds.hash,
      salt: creds.salt,
      role,
      companyName: role === 'empresa' ? companyName || name : undefined,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    this.users.set(email, newUser);
    this.persistUsers();

    csrfService.rotateToken();

    this.activeSession = {
      token: generateSecureRandomToken(32),
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      companyName: newUser.companyName,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    this.persistSession(true);

    this.logAuditEvent({
      event: 'REGISTRATION',
      email,
      details: `Novo cadastro como ${role.toUpperCase()} (PBKDF2-SHA256)`,
    });

    return { success: true };
  }

  public async requestPasswordReset(emailRaw: string, csrfToken: string): Promise<{ success: boolean; error?: string; simulatedToken?: string }> {
    if (!csrfService.validateToken(csrfToken)) {
      return { success: false, error: 'csrfError' };
    }

    const email = sanitizeString(emailRaw).toLowerCase();
    if (!isValidEmail(email)) {
      return { success: false, error: 'genericAuthError' };
    }

    const resetToken = generateSecureRandomToken(16);
    this.resetTokens.set(resetToken, {
      email,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    this.logAuditEvent({
      event: 'PASSWORD_RESET_REQUEST',
      email,
      details: 'Código de recuperação de senha gerado com sucesso',
    });

    return { success: true, simulatedToken: resetToken };
  }

  public async resetPassword(token: string, newPassword: string, csrfToken: string): Promise<{ success: boolean; error?: string }> {
    if (!csrfService.validateToken(csrfToken)) {
      return { success: false, error: 'csrfError' };
    }

    const record = this.resetTokens.get(token);
    if (!record || record.expiresAt < Date.now()) {
      return { success: false, error: 'Código de recuperação expirado ou inválido' };
    }

    const strength = evaluatePasswordStrength(newPassword);
    if (strength.score < 2) {
      return { success: false, error: 'weakPassword' };
    }

    const user = this.users.get(record.email);
    if (!user) {
      return { success: false, error: 'genericAuthError' };
    }

    const creds = await hashPassword(newPassword);
    user.passwordHash = creds.hash;
    user.salt = creds.salt;
    this.users.set(record.email, user);
    this.persistUsers();

    this.resetTokens.delete(token);

    this.logAuditEvent({
      event: 'PASSWORD_CHANGED',
      email: record.email,
      details: 'Senha redefinida com sucesso com nova derivação de salt PBKDF2',
    });

    return { success: true };
  }

  public logout(): void {
    if (this.activeSession) {
      this.logAuditEvent({
        event: 'LOGOUT',
        email: this.activeSession.email,
        details: 'Sessão encerrada com sucesso',
      });
    }
    this.activeSession = null;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    csrfService.rotateToken();
  }
}

export const authService = new AuthService();
