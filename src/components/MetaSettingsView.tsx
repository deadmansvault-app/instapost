import React, { useState } from 'react';
import { MetaSettings } from '../types';
import {
  Settings,
  ShieldCheck,
  Key,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Instagram,
  Facebook,
  Lock,
  Zap,
  Info,
} from 'lucide-react';

interface MetaSettingsViewProps {
  settings: MetaSettings;
  onUpdateSettings: (newSettings: Partial<MetaSettings>) => Promise<void>;
  onTestConnection: () => Promise<void>;
  onExchangeToken: (shortToken: string) => Promise<void>;
  onUpdatePin: (currentPin: string, newPin: string) => Promise<void>;
  isTesting: boolean;
}

export const MetaSettingsView: React.FC<MetaSettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onTestConnection,
  onExchangeToken,
  onUpdatePin,
  isTesting,
}) => {
  const [formData, setFormData] = useState<MetaSettings>({ ...settings });
  const [shortTokenInput, setShortTokenInput] = useState('');
  const [isExchanging, setIsExchanging] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(formData);
    setSaveMessage('Configurações salvas com sucesso no servidor!');
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleExchange = async () => {
    if (!shortTokenInput) return;
    setIsExchanging(true);
    try {
      await onExchangeToken(shortTokenInput);
      setShortTokenInput('');
    } finally {
      setIsExchanging(false);
    }
  };

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdatePin(currentPin, newPin);
      setPinMessage('PIN atualizado com sucesso!');
      setCurrentPin('');
      setNewPin('');
      setTimeout(() => setPinMessage(null), 4000);
    } catch (err: any) {
      setPinMessage(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Instagram className="w-5 h-5 text-rose-500" /> Ligação com Instagram Graph API & Segurança
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure as credenciais da sua conta Meta for Developers, tokens de longa duração e segurança da aplicação.
          </p>
        </div>

        {/* Test Connection Button */}
        <button
          id="test-meta-connection-btn"
          onClick={onTestConnection}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-xs"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Testando Conexão...' : 'Testar Conexão / Validar Token'}</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {saveMessage}
        </div>
      )}

      {/* Mode Switcher Banner */}
      <div className="p-5 rounded-2xl border border-neutral-200/80 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-0.5">
              Ambiente de Execução
            </span>
            <h2 className="text-sm font-bold text-neutral-900">
              {formData.mode === 'live' ? 'Modo Produção Real (Graph API Ativa)' : 'Modo Simulação & Desenvolvimento Local'}
            </h2>
            <p className="text-xs text-neutral-500">
              {formData.mode === 'live'
                ? 'Os posts agendados serão publicados diretamente na sua conta oficial do Instagram via Meta Graph API.'
                : 'Permite testar 100% da criação, IA, agendador e interface sem consumir limites da Meta ou depender de tokens reais.'}
            </p>
          </div>

          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200 self-start sm:self-auto">
            <button
              onClick={() => setFormData({ ...formData, mode: 'simulation' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                formData.mode === 'simulation' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Simulação (Dev)
            </button>
            <button
              onClick={() => setFormData({ ...formData, mode: 'live' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                formData.mode === 'live' ? 'bg-rose-600 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Live Graph API
            </button>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          <span className="text-neutral-500 font-medium">Status da Conexão:</span>
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
              settings.connectionStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${settings.connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {settings.connectionStatus === 'connected' ? 'Conectado e Válido' : 'Desconectado ou Erro'}
          </span>
          {settings.tokenExpiresAt && (
            <span className="text-neutral-400 text-[11px]">
              (Token expira em: {new Date(settings.tokenExpiresAt).toLocaleDateString('pt-PT')})
            </span>
          )}
        </div>
      </div>

      {/* Meta API Credentials Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-neutral-700" /> Credenciais da App Meta
            </h2>
            <p className="text-xs text-neutral-500">
              Obtidas em <strong>developers.facebook.com</strong> na aba Configurações &gt; Básico.
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
          >
            Salvar Credenciais
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Meta App ID</label>
            <input
              type="text"
              value={formData.appId}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
              placeholder="Ex: 849204918239012"
              className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Meta App Secret (Segredo)</label>
            <input
              type="password"
              value={formData.appSecret}
              onChange={(e) => setFormData({ ...formData, appSecret: e.target.value })}
              placeholder="Chave secreta da aplicação"
              className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">ID da Página do Facebook</label>
            <input
              type="text"
              value={formData.facebookPageId}
              onChange={(e) => setFormData({ ...formData, facebookPageId: e.target.value })}
              placeholder="Ex: 109283748291024"
              className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Instagram Business Account ID</label>
            <input
              type="text"
              value={formData.instagramBusinessId}
              onChange={(e) => setFormData({ ...formData, instagramBusinessId: e.target.value })}
              placeholder="Ex: 17841405309281745"
              className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Access Token (Long-Lived User / Page Access Token)
            </label>
            <textarea
              rows={2}
              value={formData.accessToken}
              onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
              placeholder="EAACEdEose0cBA..."
              className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono"
            />
          </div>
        </div>
      </form>

      {/* Long-Lived Token Exchanger & Auto-Refresh Card */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-purple-600" /> Renovação e Troca para Long-Lived Token (60 Dias)
          </h2>
          <p className="text-xs text-neutral-500">
            Troque tokens de curta duração (gerados no Graph API Explorer) pelo token definitivo de 60 dias renovável.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={shortTokenInput}
            onChange={(e) => setShortTokenInput(e.target.value)}
            placeholder="Cole aqui o Short-Lived Access Token..."
            className="flex-1 px-3 py-2 rounded-xl text-xs border border-neutral-200 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <button
            type="button"
            onClick={handleExchange}
            disabled={isExchanging || !shortTokenInput}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {isExchanging ? 'Renovando...' : 'Obter Token de 60 Dias'}
          </button>
        </div>
      </div>

      {/* Security PIN Manager (User Prompt mandate: "Login simples (apenas eu, sem sistema de registo público)") */}
      <form onSubmit={handlePinChange} className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-700" /> PIN de Acesso Pessoal
          </h2>
          <p className="text-xs text-neutral-500">
            Protege o seu painel de criação e publicação contra acessos indesejados. (PIN padrão inicial: 1234)
          </p>
        </div>

        {pinMessage && (
          <div className="p-2.5 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-800">
            {pinMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">PIN Atual</label>
            <input
              type="password"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="****"
              className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Novo PIN (min 4 dígitos)</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="****"
              className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          Atualizar PIN Pessoal
        </button>
      </form>
    </div>
  );
};
