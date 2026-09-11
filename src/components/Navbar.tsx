import React from 'react';
import { Sparkles, Calendar, TrendingUp, BarChart3, Settings, BookOpen, Lock, ShieldCheck, Instagram } from 'lucide-react';
import { MetaSettings } from '../types';

export type ActiveTab = 'studio' | 'calendar' | 'trends' | 'analytics' | 'settings' | 'docs';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: MetaSettings;
  onLockSession: () => void;
  onOpenNewPost: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  onLockSession,
  onOpenNewPost,
}) => {
  const tabs = [
    { id: 'studio' as ActiveTab, label: 'Estúdio de Criação', icon: Sparkles },
    { id: 'calendar' as ActiveTab, label: 'Calendário & Fila', icon: Calendar },
    { id: 'trends' as ActiveTab, label: 'Tendências & Nichos', icon: TrendingUp },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Ligação Meta API', icon: Settings },
    { id: 'docs' as ActiveTab, label: 'Documentação & Entregáveis', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-rose-200">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 tracking-tight text-lg">InstaFlow AI</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-neutral-100 text-neutral-700 rounded-full border border-neutral-200">
                  Pessoal
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block">Gestor de Conteúdo & Agendamento Meta</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-neutral-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Status Indicators & Fast Actions */}
          <div className="flex items-center gap-2.5">
            {/* Meta Connection Pill */}
            <div
              onClick={() => setActiveTab('settings')}
              className="cursor-pointer hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors"
              title="Clique para configurar credenciais Meta Graph API"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-neutral-700 font-semibold">{settings.instagramUsername || '@instagram'}</span>
              <span className="text-[10px] text-neutral-500 uppercase">
                ({settings.mode === 'live' ? 'Graph API Real' : 'Simulação'})
              </span>
            </div>

            {/* Quick Create Button */}
            <button
              id="quick-create-post-btn"
              onClick={onOpenNewPost}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Novo Post</span>
            </button>

            {/* Lock / Logout session */}
            <button
              id="lock-session-btn"
              onClick={onLockSession}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              title="Bloquear sessão com PIN"
              aria-label="Bloquear sessão"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Scroller */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 no-scrollbar border-t border-neutral-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
