import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  KeyRound,
  FileText,
  Activity,
  AlertTriangle,
  RefreshCw,
  Server,
  Terminal,
  Fingerprint
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { authService, SecurityAuditLog } from '../../services/authService';
import { csrfService } from '../../security/csrf';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [csrfToken, setCsrfToken] = useState('');
  const session = authService.getCurrentSession();

  useEffect(() => {
    if (isOpen) {
      setLogs(authService.getSecurityLogs());
      setCsrfToken(csrfService.getToken());
    }
  }, [isOpen]);

  const handleRotateCsrf = () => {
    const newToken = csrfService.rotateToken();
    setCsrfToken(newToken);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {t('security.dashboardTitle')}
              </h3>
              <p className="text-xs text-slate-400">OWASP Top 10 Compliance & Cryptographic Integrity</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Active Security Controls Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Algoritmo de Hash</span>
              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>PBKDF2-SHA256</span>
              </div>
              <p className="text-[11px] text-slate-500">100,000 iterações com salt criptográfico único</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Anti-CSRF Defense</span>
              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Token de Uso Único</span>
              </div>
              <p className="text-[11px] text-slate-500">Validado em tempo constante contra timing attacks</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Anti-Brute Force</span>
              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Rate Limiting</span>
              </div>
              <p className="text-[11px] text-slate-500">Bloqueio automático após 5 tentativas falhas</p>
            </div>
          </div>

          {/* Active Session & CSRF Token Box */}
          <div className="bg-slate-900 text-white p-4.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <span>Sessão Criptografada Ativa</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                {session ? 'AUTENTICADO' : 'SESSÃO ANÔNIMA'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-400">Usuário:</span> {session?.name || 'Visitante'} ({session?.email || 'N/A'})
              </div>
              <div>
                <span className="text-slate-400">Perfil:</span> {session?.role || 'Guest'}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-[11px]">Token de Proteção CSRF Atual:</span>
                <button
                  onClick={handleRotateCsrf}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Rotacionar Token
                </button>
              </div>
              <code className="block bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-400 truncate select-all">
                {csrfToken}
              </code>
            </div>
          </div>

          {/* Audit Logs Trail */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{t('security.auditLogs')}</span>
              </h4>
              <span className="text-slate-400 text-[11px]">Últimos eventos registrados</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-slate-400">Nenhum evento registrado ainda.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 hover:bg-slate-50 transition-colors space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          log.event === 'LOGIN_SUCCESS' || log.event === 'REGISTRATION'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.event === 'LOGIN_FAILURE' || log.event === 'RATE_LIMIT_BLOCKED' || log.event === 'CSRF_BLOCKED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.event}
                      </span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-600 font-medium">{log.details}</div>
                    <div className="text-[10px] text-slate-400">
                      Alvo: {log.email} • IP: {log.ip}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            SpeedJobs Security Engine v2.4 • OWASP Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
