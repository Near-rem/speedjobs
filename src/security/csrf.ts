import { generateSecureRandomToken } from './crypto';

const CSRF_STORAGE_KEY = 'speedjobs_csrf_token_v1';

class CsrfProtectionService {
  private currentToken: string | null = null;

  constructor() {
    this.initToken();
  }

  private initToken(): void {
    try {
      const stored = sessionStorage.getItem(CSRF_STORAGE_KEY);
      if (stored && stored.length === 64) {
        this.currentToken = stored;
      } else {
        this.rotateToken();
      }
    } catch {
      this.currentToken = generateSecureRandomToken(32);
    }
  }

  /**
   * Returns current active anti-CSRF token
   */
  public getToken(): string {
    if (!this.currentToken) {
      this.rotateToken();
    }
    return this.currentToken!;
  }

  /**
   * Rotates CSRF token upon privilege boundary change (e.g. login, logout)
   */
  public rotateToken(): string {
    const newToken = generateSecureRandomToken(32);
    this.currentToken = newToken;
    try {
      sessionStorage.setItem(CSRF_STORAGE_KEY, newToken);
    } catch {}
    return newToken;
  }

  /**
   * Validates incoming request token against session token
   */
  public validateToken(candidateToken?: string | null): boolean {
    if (!candidateToken || !this.currentToken) return false;
    // Constant-time check
    if (candidateToken.length !== this.currentToken.length) return false;
    let diff = 0;
    for (let i = 0; i < this.currentToken.length; i++) {
      diff |= candidateToken.charCodeAt(i) ^ this.currentToken.charCodeAt(i);
    }
    return diff === 0;
  }
}

export const csrfService = new CsrfProtectionService();
