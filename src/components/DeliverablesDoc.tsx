import React, { useState } from 'react';
import {
  Layers,
  Database,
  Calendar,
  Code,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Terminal,
  Server,
  Cpu,
  Smartphone,
} from 'lucide-react';

export const DeliverablesDoc: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<'architecture' | 'phases' | 'database' | 'scaffold' | 'meta_guide'>('architecture');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const postgresSchemaSQL = `-- ==========================================================
-- INSTAFLOW AI - ESQUEMA DE BASE DE DADOS RELACIONAL (POSTGRESQL)
-- ==========================================================

-- Extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Utilizadores (Uso individual / Admin)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Contas e Tokens do Instagram / Meta Graph API
CREATE TABLE instagram_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id VARCHAR(100) NOT NULL,
    app_secret_encrypted TEXT NOT NULL,
    access_token_encrypted TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    facebook_page_id VARCHAR(100) NOT NULL,
    facebook_page_name VARCHAR(150),
    instagram_business_id VARCHAR(100) NOT NULL,
    instagram_username VARCHAR(100),
    mode VARCHAR(20) DEFAULT 'simulation' CHECK (mode IN ('simulation', 'live')),
    auto_refresh_tokens BOOLEAN DEFAULT TRUE,
    last_tested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Posts
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    theme VARCHAR(100) NOT NULL,
    format VARCHAR(30) DEFAULT 'carousel' CHECK (format IN ('single_image', 'carousel', 'reel')),
    caption TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    media_urls TEXT[] DEFAULT '{}',
    tone VARCHAR(50),
    goal VARCHAR(50),
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'publishing', 'published', 'failed')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    meta_container_id VARCHAR(150),
    instagram_post_id VARCHAR(150),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Slides do Carrossel (1 para N com posts)
CREATE TABLE post_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    slide_number INT NOT NULL,
    title VARCHAR(255),
    body TEXT,
    visual_prompt TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_post_slide UNIQUE (post_id, slide_number)
);

-- 5. Grade de Horários Pré-definidos de Publicação (Scheduler Slots)
CREATE TABLE schedule_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 1=Segunda...
    time_slot TIME NOT NULL,
    label VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Logs de Publicação e Auditoria da Graph API
CREATE TABLE publication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('success', 'failed', 'simulated')),
    details TEXT NOT NULL,
    meta_response_id VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Métricas de Analytics por Post
CREATE TABLE post_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    reach INT DEFAULT 0,
    impressions INT DEFAULT 0,
    saves INT DEFAULT 0,
    shares INT DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0.00,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de performance
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_for ON posts(scheduled_for);
CREATE INDEX idx_schedule_slots_day ON schedule_slots(day_of_week);`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-500" /> Documentação do Projeto & Entregáveis Técnicos
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Todos os 5 entregáveis especificados no prompt estruturados para consulta e replicação em qualquer ambiente.
          </p>
        </div>

        {/* Deliverables Sub-Navigation */}
        <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 overflow-x-auto no-scrollbar">
          {[
            { id: 'architecture', label: '1. Arquitetura' },
            { id: 'phases', label: '2. Fases / Roadmap' },
            { id: 'database', label: '3. Base de Dados SQL' },
            { id: 'scaffold', label: '4. Scaffold Código' },
            { id: 'meta_guide', label: '5. Guia Meta Console' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDocTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeDocTab === tab.id ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DELIVERABLE 1: Arquitetura da Solução */}
      {activeDocTab === 'architecture' && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900">1. Arquitetura da Solução</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Visão geral dos componentes, fluxo de dados, comunicação assíncrona e limites de segurança.
            </p>
          </div>

          {/* Interactive Architecture Flow Diagram */}
          <div className="p-6 rounded-2xl bg-neutral-900 text-white space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-mono text-neutral-400">DIAGRAMA DE COMPONENTES & FLUXO DE DADOS</span>
              <span className="text-[11px] font-mono text-emerald-400">REST + Background Jobs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              {/* Box 1: Client */}
              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center mx-auto">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Frontend SPA</h3>
                <p className="text-[11px] text-neutral-400">
                  React 19, Tailwind CSS, Recharts, Preview Fiel do Instagram, Fluxo de Aprovação Manual
                </p>
              </div>

              {/* Box 2: Node/Express Server */}
              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mx-auto">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Backend Node.js / Express</h3>
                <p className="text-[11px] text-neutral-400">
                  API REST segura, Scheduler Cron (a cada 20s), Auto-slotting, Criptografia de tokens
                </p>
              </div>

              {/* Box 3: AI Engine */}
              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center mx-auto">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Motor de IA Gemini</h3>
                <p className="text-[11px] text-neutral-400">
                  Legendas com ganchos, Roteiros de Carrossel de 5 slides, Hashtags categorizadas, Análise de Tendências
                </p>
              </div>

              {/* Box 4: Meta Graph API */}
              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white">Meta Graph API (v19)</h3>
                <p className="text-[11px] text-neutral-400">
                  POST /media (Containers), POST /media_publish, GET /insights, Token Exchange (60 dias)
                </p>
              </div>
            </div>

            {/* Step-by-step Flow Pipeline */}
            <div className="p-4 rounded-xl bg-black/40 border border-neutral-800 text-left space-y-2 text-xs text-neutral-300">
              <div className="font-bold text-white mb-1">Fluxo de Publicação de Ponta a Ponta:</div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-300">
                <li>O criador seleciona um tema ou clica em uma tendência emergente sugerida pela IA.</li>
                <li>O Gemini gera a legenda de alta retenção, hashtags categorizadas e roteiro de carrossel.</li>
                <li>O criador revisa a pré-visualização fiel do Instagram e aprova manualmente o post.</li>
                <li>O post é adicionado à fila inteligente e o agendador atribui o próximo slot pré-configurado.</li>
                <li>Na hora exata, o background worker envia o container para a Meta Graph API e confirma a publicação.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE 2: Plano de Implementação por Fases */}
      {activeDocTab === 'phases' && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900">2. Plano de Implementação por Fases (Roadmap)</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Divisão estratégica do projeto desde o MVP funcional até à automação completa com analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Phase 1 */}
            <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white">
                  FASE 1 — MVP
                </span>
                <span className="text-[11px] font-bold text-emerald-600">✓ Concluído</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Criação com IA + Aprovação Manual</h3>
              <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
                <li>Login simples pessoal por PIN</li>
                <li>Gerador de legendas com ganchos e CTAs</li>
                <li>Gerador de roteiros de carrossel e hashtags</li>
                <li>Preview realista do Instagram (Feed e Carrossel)</li>
                <li>Passo de aprovação manual obrigatório</li>
                <li>Modo Simulação & Conector Meta Graph API</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  FASE 2 — AUTOMATION
                </span>
                <span className="text-[11px] font-bold text-emerald-600">✓ Concluído</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Agendamento & Fila Inteligente</h3>
              <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
                <li>Grade de horários fixos (ex: 3x por semana, 09h e 19h)</li>
                <li>Calendário editorial mensal visual</li>
                <li>Fila de conteúdo com Auto-Slotting automático</li>
                <li>Scheduler ativo em Node.js com polling contínuo</li>
                <li>Histórico de disparos e logs de execução</li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                  FASE 3 — ADVANCED
                </span>
                <span className="text-[11px] font-bold text-emerald-600">✓ Concluído</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Tendências & Analytics Recharts</h3>
              <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
                <li>Monitorização de tendências por nicho (Psicologia, etc.)</li>
                <li>1-Click transfer para o Estúdio de Criação</li>
                <li>Analytics comparativo por tema e formato</li>
                <li>Métricas de alcance, impressões, likes e saves</li>
                <li>Renovação automática de Long-Lived Token (60 dias)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE 3: Base de Dados PostgreSQL DDL */}
      {activeDocTab === 'database' && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">3. Estrutura da Base de Dados Relacional (PostgreSQL)</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Esquema DDL completo com chaves primárias UUID, chaves estrangeiras, restrições e índices.
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(postgresSchemaSQL, 'sql')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSection === 'sql' ? 'Copiado!' : 'Copiar SQL DDL'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-neutral-950 p-4 font-mono text-[11px] text-neutral-200 overflow-x-auto max-h-[480px]">
            <pre>{postgresSchemaSQL}</pre>
          </div>
        </div>
      )}

      {/* DELIVERABLE 4: Scaffold Código Inicial */}
      {activeDocTab === 'scaffold' && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">4. Código Inicial e Arquitetura de Ficheiros</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Estrutura modular em TypeScript com separação estrita entre UI, API e modelo de dados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-600" /> Backend (Node.js & Express)
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Localizado em <code>server.ts</code>. Contém o motor do scheduler de agendamento em background, integração com o SDK oficial <code>@google/genai</code>, endpoints CRUD de posts e handlers da Meta Graph API.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-rose-600" /> Frontend (React 19 & Tailwind)
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Componentes isolados em <code>/src/components/</code>:
                <br />• <code>InstagramPreview.tsx</code>: Mockup fiel do feed/carrossel
                <br />• <code>ContentStudio.tsx</code>: Redação com IA e aprovação manual
                <br />• <code>ScheduleCalendar.tsx</code>: Grade de horários e fila
                <br />• <code>TrendsTracker.tsx</code>: Análise de nichos e tendências
                <br />• <code>AnalyticsDashboard.tsx</code>: Gráficos Recharts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERABLE 5: Instruções Meta Developer Console */}
      {activeDocTab === 'meta_guide' && (
        <div className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              5. Guia Passo a Passo: Configuração na Meta Developer Console
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Como configurar a App da Meta, associar a conta Business/Creator do Instagram e obter tokens sem necessidade de App Review para uso individual.
            </p>
          </div>

          <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-neutral-900">Pré-Requisitos Obrigatórios na Conta do Instagram</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-6 text-neutral-600">
                <li>
                  Mude a sua conta do Instagram para <strong>Conta Profissional</strong> (Empresarial ou Criador de Conteúdo).
                </li>
                <li>
                  Crie uma <strong>Página do Facebook</strong> e vincule-a à sua conta do Instagram nas definições da página (obrigatório pela arquitetura da Meta).
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-neutral-900">Criar Aplicação no Meta for Developers</h3>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-6 text-neutral-600">
                <li>Aceda a <strong>developers.facebook.com</strong> e clique em "Criar Aplicação".</li>
                <li>Selecione o tipo de aplicação <strong>"Outro" &gt; "Negócios" (Business)</strong>.</li>
                <li>Dê um nome à aplicação (ex: <em>InstaFlow Pessoal</em>) e defina o seu email de contacto.</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-neutral-900">Adicionar Produtos e Permissões Necessárias</h3>
              </div>
              <p className="pl-6 text-neutral-600">
                No painel da aplicação, adicione os produtos <strong>"API do Graph do Instagram"</strong> e <strong>"Início de sessão do Facebook para Empresas"</strong>. As permissões exigidas são:
              </p>
              <div className="pl-6 flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-neutral-200 text-neutral-800">
                  instagram_content_publish
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-neutral-200 text-neutral-800">
                  pages_show_list
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-neutral-200 text-neutral-800">
                  instagram_basic
                </span>
                <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-neutral-200 text-neutral-800">
                  pages_read_engagement
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-neutral-900">Como Operar em Modo de Desenvolvimento (Sem App Review)</h3>
              </div>
              <p className="pl-6 text-neutral-600">
                Como a plataforma é de <strong>uso pessoal estrito</strong>, NÃO precisa de submeter a app para a revisão pública da Meta (App Review). Basta:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-6 text-neutral-600">
                <li>Manter a aplicação no estado <strong>Em Desenvolvimento</strong>.</li>
                <li>Na secção <strong>Funções da Aplicação (Roles)</strong>, certifique-se de que o seu perfil do Facebook é Administrador ou Tester da App.</li>
                <li>Com isto, a sua conta tem permissão total para publicar em nome da sua própria página e conta do Instagram!</li>
              </ul>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center">
                  5
                </span>
                <h3 className="font-bold text-neutral-900">Geração do Token de Longa Duração (60 Dias)</h3>
              </div>
              <p className="pl-6 text-neutral-600">
                Aceda ao <strong>Graph API Explorer</strong> no menu Ferramentas, selecione a sua aplicação e a sua página do Facebook com as permissões acima, e gere o token de utilizador. De seguida, cole-o na aba <strong>"Ligação Meta API"</strong> desta plataforma para convertê-lo automaticamente em Long-Lived Token de 60 dias!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
