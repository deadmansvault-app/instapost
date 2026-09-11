import React, { useState } from 'react';
import { Lock, Instagram, ArrowRight, ShieldCheck, Key } from 'lucide-react';

interface PinLockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) return;
    setIsVerifying(true);
    setError(null);
    try {
      const ok = await onUnlock(pin);
      if (!ok) {
        setError('PIN incorreto. Tente novamente.');
      }
    } catch {
      setError('Erro ao validar o PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-950">
          <Instagram className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white tracking-tight">InstaFlow AI</h1>
          <p className="text-xs text-neutral-400">Plataforma Pessoal de Gestão de Conteúdo</p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-neutral-300 block">Insira o seu PIN de Acesso</label>
            <div className="relative">
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-center font-mono text-xl tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-neutral-600"
              />
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isVerifying || !pin}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <span>{isVerifying ? 'A validar...' : 'Entrar no Painel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-neutral-400" />
          <span>PIN padrão de fábrica: <strong>1234</strong></span>
        </div>
      </div>
    </div>
  );
};
