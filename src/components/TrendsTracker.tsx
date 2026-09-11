import React, { useState } from 'react';
import { TrendTopic, Post } from '../types';
import { TrendingUp, Sparkles, Flame, ArrowRight, Filter, Search, Tag, ExternalLink, BookmarkPlus } from 'lucide-react';

interface TrendsTrackerProps {
  trends: TrendTopic[];
  onAnalyzeCategory: (category: string, focusNiche: string) => Promise<void>;
  onCreatePostFromTrend: (trend: TrendTopic) => void;
  isAnalyzing: boolean;
}

export const TrendsTracker: React.FC<TrendsTrackerProps> = ({
  trends,
  onAnalyzeCategory,
  onCreatePostFromTrend,
  isAnalyzing,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [focusNiches, setFocusNiches] = useState<string[]>([
    'Psicologia & Comportamento',
    'Produtividade & Foco',
    'Saúde Mental & Ansiedade',
    'Curiosidades Científicas',
  ]);
  const [newNicheInput, setNewNicheInput] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const categories = ['Todos', 'Psicologia & Saúde Mental', 'Produtividade', 'Comportamento & Ciência', 'Negócios'];

  const filteredTrends = trends.filter((t) => {
    const matchesCategory = selectedCategory === 'Todos' || t.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      searchFilter === '' ||
      t.topic.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.hook.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddNiche = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNicheInput.trim() && !focusNiches.includes(newNicheInput.trim())) {
      setFocusNiches([...focusNiches, newNicheInput.trim()]);
      setNewNicheInput('');
    }
  };

  const handleRemoveNiche = (niche: string) => {
    setFocusNiches(focusNiches.filter((n) => n !== niche));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" /> Tracking de Tendências & Sugestões de Conteúdo
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Monitore tópicos em ascensão, hashtags virais e gere ideias prontas para o seu público-alvo com apoio do Gemini.
          </p>
        </div>

        <button
          id="analyze-trends-ai-btn"
          onClick={() => onAnalyzeCategory(selectedCategory === 'Todos' ? 'Psicologia e Produtividade' : selectedCategory, focusNiches.join(', '))}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-rose-600 text-white hover:opacity-95 disabled:opacity-50 shadow-xs"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Analisando Tendências com Gemini...' : 'Descobrir Novas Tendências com IA'}</span>
        </button>
      </div>

      {/* Focus Niches / Priority Topics Manager (User Prompt mandate: "Permitir eu escolher/priorizar temas fixos...") */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Os Teus Nichos Prioritários</h2>
            <p className="text-xs text-neutral-500">
              A IA filtra e direciona as pesquisas da web e de redes sociais focando especificamente nestes pilares editoriais.
            </p>
          </div>

          <form onSubmit={handleAddNiche} className="flex items-center gap-1.5">
            <input
              type="text"
              value={newNicheInput}
              onChange={(e) => setNewNicheInput(e.target.value)}
              placeholder="Adicionar nicho fixo..."
              className="px-3 py-1.5 rounded-lg text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
            >
              Adicionar
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {focusNiches.map((niche, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200/80"
            >
              <Tag className="w-3 h-3 text-rose-500" />
              {niche}
              <button
                onClick={() => handleRemoveNiche(niche)}
                className="text-neutral-400 hover:text-red-600 ml-1 text-sm font-bold leading-none"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Pesquisar tendências ou ganchos..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTrends.map((trend) => (
          <div
            key={trend.id}
            className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-all hover:shadow-md"
          >
            <div className="space-y-3">
              {/* Category & Virality Score */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase tracking-wider">
                  {trend.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Score: {trend.viralityScore}%
                </span>
              </div>

              {/* Topic Title */}
              <h3 className="text-base font-bold text-neutral-900 leading-snug">{trend.topic}</h3>

              {/* Viral Hook */}
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  Gancho de Alta Retenção (Headline)
                </span>
                <p className="text-xs font-semibold text-neutral-800 italic leading-relaxed">
                  "{trend.hook}"
                </p>
              </div>

              {/* Angle & Why Trending */}
              <div className="space-y-1.5 text-xs text-neutral-600">
                <p>
                  <strong className="text-neutral-900">Abordagem:</strong> {trend.angle}
                </p>
                <p className="text-[11px] text-neutral-500">
                  <strong className="text-neutral-700">Origem:</strong> {trend.sourceSummary}
                </p>
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1">
                {trend.trendingHashtags.map((tag, i) => (
                  <span key={i} className="text-[11px] text-blue-700 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 1-Click Action to Studio */}
            <button
              onClick={() => onCreatePostFromTrend(trend)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs group"
            >
              <span>Gerar Post a partir Deste Tema</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {filteredTrends.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 space-y-3">
          <TrendingUp className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800">Nenhuma tendência encontrada para este filtro</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Experimente mudar a categoria ou clique em "Descobrir Novas Tendências com IA" para fazer uma nova análise com o Gemini.
          </p>
        </div>
      )}
    </div>
  );
};
