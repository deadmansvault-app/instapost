import React, { useState, useEffect } from 'react';
import { Post, PostSlide, PostFormat, ContentTemplate } from '../types';
import { CONTENT_TEMPLATES } from '../data/templates';
import { InstagramPreview } from './InstagramPreview';
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  Hash,
  CheckCircle2,
  Calendar,
  Send,
  Upload,
  Plus,
  Trash2,
  Copy,
  BookmarkCheck,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sliders,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface ContentStudioProps {
  currentPost: Post;
  setCurrentPost: React.Dispatch<React.SetStateAction<Post>>;
  onSavePost: (post: Post) => Promise<void>;
  onApprovePost: (post: Post) => Promise<void>;
  onQueuePost: (post: Post) => Promise<void>;
  onPublishNow: (post: Post) => Promise<void>;
  onSchedulePost: (post: Post, dateStr: string) => Promise<void>;
  isSaving: boolean;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({
  currentPost,
  setCurrentPost,
  onSavePost,
  onApprovePost,
  onQueuePost,
  onPublishNow,
  onSchedulePost,
  isSaving,
}) => {
  const [activeStudioTab, setActiveStudioTab] = useState<'text' | 'slides' | 'media' | 'hashtags' | 'templates'>('text');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [scheduleDateInput, setScheduleDateInput] = useState<string>('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [generatedHashtagCategories, setGeneratedHashtagCategories] = useState<{
    highVolume?: string[];
    niche?: string[];
    longTail?: string[];
  } | null>(null);

  // Suggested high-res visuals
  const curatedImages = [
    { label: 'Foco & Trabalho', url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80' },
    { label: 'Calma & Mente', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
    { label: 'Café & Manhã', url: 'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?auto=format&fit=crop&w=800&q=80' },
    { label: 'Natureza & Respiração', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80' },
    { label: 'Leitura & Livros', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80' },
    { label: 'Estratégia & Notas', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleGenerateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: currentPost.theme || currentPost.title,
          tone: currentPost.tone,
          goal: currentPost.goal,
          format: currentPost.format,
        }),
      });
      const data = await res.json();
      if (data.caption) {
        setCurrentPost((prev) => ({
          ...prev,
          caption: data.caption,
          hashtags: prev.hashtags.length > 0 ? prev.hashtags : (data.recommendedHashtags || []),
        }));
        showToast('Legenda gerada com sucesso pela IA!');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao comunicar com a IA');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleGenerateCarousel = async () => {
    setIsGeneratingCarousel(true);
    try {
      const res = await fetch('/api/ai/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: currentPost.theme || currentPost.title,
          numSlides: 5,
          tone: currentPost.tone,
          goal: currentPost.goal,
        }),
      });
      const data = await res.json();
      if (data.slides && Array.isArray(data.slides)) {
        const mappedSlides: PostSlide[] = data.slides.map((s: any, idx: number) => ({
          id: `slide-${Date.now()}-${idx}`,
          slideNumber: s.slideNumber || idx + 1,
          title: s.title || `Slide ${idx + 1}`,
          body: s.body || '',
          visualPrompt: s.visualPrompt || '',
        }));
        setCurrentPost((prev) => ({
          ...prev,
          format: 'carousel',
          slides: mappedSlides,
        }));
        setActiveStudioTab('slides');
        showToast('Roteiro de carrossel de 5 slides gerado com sucesso!');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao gerar carrossel');
    } finally {
      setIsGeneratingCarousel(false);
    }
  };

  const handleGenerateHashtags = async () => {
    setIsGeneratingHashtags(true);
    try {
      const res = await fetch('/api/ai/generate-hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: currentPost.theme || currentPost.title,
          niche: currentPost.theme,
        }),
      });
      const data = await res.json();
      if (data.all) {
        setGeneratedHashtagCategories({
          highVolume: data.highVolume,
          niche: data.niche,
          longTail: data.longTail,
        });
        showToast('Hashtags categorizadas geradas!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setCurrentPost((prev) => ({
            ...prev,
            mediaUrls: [dataUrl, ...prev.mediaUrls],
          }));
          showToast('Imagem carregada com sucesso!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadTemplate = (template: ContentTemplate) => {
    setCurrentPost((prev) => ({
      ...prev,
      title: template.name,
      theme: template.category,
      format: template.format,
      tone: template.defaultTone,
      goal: template.defaultGoal,
      caption: template.captionStructure,
      hashtags: template.recommendedHashtags,
      slides: template.slideTemplates
        ? template.slideTemplates.map((st) => ({
            id: `slide-tpl-${st.slideNumber}`,
            slideNumber: st.slideNumber,
            title: st.header,
            body: st.description,
          }))
        : prev.slides,
    }));
    setActiveStudioTab('text');
    showToast(`Template "${template.name}" aplicado!`);
  };

  const addSlide = () => {
    const currentSlides = currentPost.slides || [];
    const nextNum = currentSlides.length + 1;
    const newSlide: PostSlide = {
      id: `slide-${Date.now()}`,
      slideNumber: nextNum,
      title: `Slide ${nextNum}`,
      body: 'Texto do novo slide...',
    };
    setCurrentPost((prev) => ({
      ...prev,
      slides: [...(prev.slides || []), newSlide],
    }));
  };

  const updateSlide = (slideId: string, field: keyof PostSlide, value: any) => {
    setCurrentPost((prev) => ({
      ...prev,
      slides: (prev.slides || []).map((s) => (s.id === slideId ? { ...s, [field]: value } : s)),
    }));
  };

  const removeSlide = (slideId: string) => {
    setCurrentPost((prev) => ({
      ...prev,
      slides: (prev.slides || [])
        .filter((s) => s.id !== slideId)
        .map((s, idx) => ({ ...s, slideNumber: idx + 1 })),
    }));
  };

  const addHashtag = (tag: string) => {
    const clean = tag.startsWith('#') ? tag : `#${tag}`;
    if (!currentPost.hashtags.includes(clean)) {
      setCurrentPost((prev) => ({
        ...prev,
        hashtags: [...prev.hashtags, clean],
      }));
    }
  };

  const removeHashtag = (tag: string) => {
    setCurrentPost((prev) => ({
      ...prev,
      hashtags: prev.hashtags.filter((t) => t !== tag),
    }));
  };

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  const captionCharCount = currentPost.caption?.length || 0;
  const isOverLimit = captionCharCount > 2200;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">{statusNotification}</span>
        </div>
      )}

      {/* Header bar with Status & Approval Actions */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200/80 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Estúdio de Criação com IA</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                  currentPost.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentPost.status === 'approved'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : currentPost.status === 'scheduled'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                Status: {currentPost.status === 'draft' ? 'Rascunho' : currentPost.status === 'approved' ? 'Aprovado para Publicação' : currentPost.status === 'scheduled' ? 'Agendado' : currentPost.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Gere conteúdo com IA, edite os detalhes e aprove manualmente antes de agendar ou publicar.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Save Draft */}
            <button
              id="save-draft-btn"
              onClick={() => onSavePost(currentPost)}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Salvar Rascunho
            </button>

            {/* Manual Approval Button (User Prompt mandate: "Antes de publicar, deve haver sempre um passo de revisão/aprovação manual") */}
            <button
              id="approve-post-btn"
              onClick={() => onApprovePost(currentPost)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentPost.status === 'approved'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{currentPost.status === 'approved' ? 'Post Aprovado ✓' : 'Aprovar Post Manualmente'}</span>
            </button>

            {/* Add to Automated Queue (Auto-slotting) */}
            <button
              id="queue-post-btn"
              onClick={() => onQueuePost(currentPost)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
              title="Calcula e preenche o próximo horário livre na sua grade pré-configurada"
            >
              <Layers className="w-4 h-4" />
              <span>Adicionar à Fila</span>
            </button>

            {/* Schedule for specific date */}
            <button
              id="schedule-modal-trigger-btn"
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Agendar Data</span>
            </button>

            {/* Publish Immediately */}
            <button
              id="publish-now-btn"
              onClick={() => onPublishNow(currentPost)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Publicar Agora</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Configuration & AI / Right Instagram Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Post Parameters & Studio Tools */}
        <div className="lg:col-span-7 space-y-5">
          {/* Post Metadata Card */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-500" /> Parâmetros do Post
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tema / Assunto Principal</label>
                <input
                  type="text"
                  value={currentPost.theme}
                  onChange={(e) => setCurrentPost({ ...currentPost, theme: e.target.value, title: e.target.value })}
                  placeholder="Ex: 5 Hábitos Noturnos, Fadiga de Decisão, Vieses..."
                  className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Formato do Instagram</label>
                <select
                  value={currentPost.format}
                  onChange={(e) => setCurrentPost({ ...currentPost, format: e.target.value as PostFormat })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                >
                  <option value="carousel">Carrossel (Slides Múltiplos - Maior Alcance)</option>
                  <option value="single_image">Imagem Única (1080x1080)</option>
                  <option value="reel">Reels / Roteiro de Vídeo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Tom de Voz</label>
                <select
                  value={currentPost.tone}
                  onChange={(e) => setCurrentPost({ ...currentPost, tone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                >
                  <option value="Profissional e Prático">Profissional e Prático</option>
                  <option value="Inspiracional e Motivador">Inspiracional e Motivador</option>
                  <option value="Educativo e Científico">Educativo e Científico</option>
                  <option value="Descontraído e Conectivo">Descontraído e Conectivo</option>
                  <option value="Provocador e Desafiador">Provocador e Desafiador</option>
                  <option value="Storytelling Pessoal">Storytelling Pessoal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Objetivo Estratégico</label>
                <select
                  value={currentPost.goal}
                  onChange={(e) => setCurrentPost({ ...currentPost, goal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                >
                  <option value="Educar e Gerar Salvamentos">Educar e Gerar Salvamentos</option>
                  <option value="Engajar e Receber Comentários">Engajar e Receber Comentários</option>
                  <option value="Vender e Gerar Conversas no Direct">Vender / Leads no Direct</option>
                  <option value="Viralizar e Atrair Novos Seguidores">Viralizar / Compartilhamentos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Studio Tab Navigation */}
          <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveStudioTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeStudioTab === 'text' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Legenda & Texto</span>
            </button>

            {currentPost.format === 'carousel' && (
              <button
                onClick={() => setActiveStudioTab('slides')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeStudioTab === 'slides' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Roteiro de Carrossel ({currentPost.slides?.length || 0} slides)</span>
              </button>
            )}

            <button
              onClick={() => setActiveStudioTab('media')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeStudioTab === 'media' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Imagens & Media ({currentPost.mediaUrls?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('hashtags')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeStudioTab === 'hashtags' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Hashtags ({currentPost.hashtags?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveStudioTab('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeStudioTab === 'templates' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Templates Prontos</span>
            </button>
          </div>

          {/* Tab 1: Caption Generator & Editor */}
          {activeStudioTab === 'text' && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Legenda do Post</h3>
                  <p className="text-xs text-neutral-500">
                    Otimizada com gancho de primeira linha, espaçamento e CTA claro.
                  </p>
                </div>
                <button
                  id="generate-caption-ai-btn"
                  onClick={handleGenerateCaption}
                  disabled={isGeneratingCaption}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-rose-600 text-white hover:opacity-95 transition-opacity disabled:opacity-50 shadow-xs"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCaption ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingCaption ? 'Gerando com Gemini...' : 'Gerar Legenda com IA'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  id="post-caption-textarea"
                  rows={9}
                  value={currentPost.caption}
                  onChange={(e) => setCurrentPost({ ...currentPost, caption: e.target.value })}
                  placeholder="Escreva ou gere com IA a legenda completa para o Instagram..."
                  className="w-full p-3.5 rounded-xl text-xs font-sans border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 leading-relaxed resize-y"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                  <span>
                    Dica: Use quebras de linha com ponto invisível para parágrafos limpos.
                  </span>
                  <span className={`font-mono font-medium ${isOverLimit ? 'text-red-600 font-bold' : 'text-neutral-500'}`}>
                    {captionCharCount} / 2200 caracteres
                  </span>
                </div>
              </div>

              {/* Quick Actions for Caption */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 flex-wrap">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentPost.caption);
                    showToast('Legenda copiada para a área de transferência!');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                >
                  <Copy className="w-3 h-3" /> Copiar Texto
                </button>
                <button
                  onClick={() => {
                    // Clean Instagram line breaks
                    const cleaned = currentPost.caption
                      .split('\n')
                      .map((l) => (l.trim() === '' ? '.\n' : l))
                      .join('\n');
                    setCurrentPost({ ...currentPost, caption: cleaned });
                    showToast('Formatado com quebras limpas!');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                >
                  <Sliders className="w-3 h-3" /> Ajustar Quebras de Linha
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Carousel Slides Editor */}
          {activeStudioTab === 'slides' && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Roteiro de Carrossel Slide por Slide</h3>
                  <p className="text-xs text-neutral-500">
                    Construa a narrativa slide a slide para maximizar retenção e salvamentos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="generate-carousel-ai-btn"
                    onClick={handleGenerateCarousel}
                    disabled={isGeneratingCarousel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-rose-600 text-white hover:opacity-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingCarousel ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingCarousel ? 'Criando Roteiro...' : 'Gerar Roteiro com IA'}</span>
                  </button>
                  <button
                    onClick={addSlide}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Slide
                  </button>
                </div>
              </div>

              {/* Slide List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {(currentPost.slides || []).map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="p-3.5 rounded-xl border border-neutral-200/90 bg-neutral-50/50 space-y-2 hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-neutral-800">
                          {idx === 0 ? 'Capa / Gancho Magnético' : idx === (currentPost.slides?.length || 1) - 1 ? 'Slide Final / Call To Action' : `Slide ${idx + 1} de Conteúdo`}
                        </span>
                      </div>
                      {(currentPost.slides?.length || 0) > 1 && (
                        <button
                          onClick={() => removeSlide(slide.id)}
                          className="text-neutral-400 hover:text-red-600 p-1"
                          title="Remover este slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                        placeholder="Título ou chamada do slide"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-neutral-200 bg-white focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={slide.body}
                        onChange={(e) => updateSlide(slide.id, 'body', e.target.value)}
                        placeholder="Texto conciso (máx 30 palavras para leitura agradável)"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-neutral-200 bg-white focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}

                {(!currentPost.slides || currentPost.slides.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-xl">
                    <Layers className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-xs text-neutral-600 font-medium">Nenhum slide estruturado ainda.</p>
                    <button
                      onClick={handleGenerateCarousel}
                      className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Gerar 5 Slides com IA
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Media & Images */}
          {activeStudioTab === 'media' && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Mídia e Imagens</h3>
                  <p className="text-xs text-neutral-500">
                    Faça upload da sua própria foto ou selecione imagens selecionadas em alta definição.
                  </p>
                </div>
                {/* Manual upload */}
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white cursor-pointer hover:bg-neutral-800">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload do Computador</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {/* Selected Media Grid */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">Imagens do Post Atual</label>
                <div className="grid grid-cols-3 gap-3">
                  {currentPost.mediaUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-200">
                      <img src={url} alt={`Media ${i}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const updated = currentPost.mediaUrls.filter((_, idx) => idx !== i);
                          setCurrentPost({ ...currentPost, mediaUrls: updated });
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover imagem"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curated Unsplash Stock Presets */}
              <div className="pt-3 border-t border-neutral-100">
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Biblioteca de Estilos Recomendados (1-Click)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {curatedImages.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setCurrentPost((prev) => ({
                          ...prev,
                          mediaUrls: [img.url, ...prev.mediaUrls],
                        }));
                        showToast(`Imagem "${img.label}" adicionada!`);
                      }}
                      className="cursor-pointer group relative aspect-square rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-900 transition-colors"
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] text-white text-center font-medium truncate">
                        {img.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Hashtags */}
          {activeStudioTab === 'hashtags' && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Gerador Estratégico de Hashtags</h3>
                  <p className="text-xs text-neutral-500">
                    Organizadas por alcance estimado (Alto Volume, Nicho e Cauda Longa).
                  </p>
                </div>
                <button
                  id="generate-hashtags-btn"
                  onClick={handleGenerateHashtags}
                  disabled={isGeneratingHashtags}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-rose-600 text-white hover:opacity-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingHashtags ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingHashtags ? 'Analisando Alcance...' : 'Gerar Hashtags com IA'}</span>
                </button>
              </div>

              {/* Current Post Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-700">
                    Hashtags Selecionadas ({currentPost.hashtags.length}/30 limite)
                  </span>
                  <button
                    onClick={() => setCurrentPost({ ...currentPost, hashtags: [] })}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Limpar todas
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50">
                  {currentPost.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white border border-neutral-200 font-medium text-neutral-800 shadow-2xs"
                    >
                      {tag}
                      <button onClick={() => removeHashtag(tag)} className="text-neutral-400 hover:text-neutral-700">
                        &times;
                      </button>
                    </span>
                  ))}
                  {currentPost.hashtags.length === 0 && (
                    <span className="text-xs text-neutral-400 italic">Nenhuma hashtag adicionada ainda.</span>
                  )}
                </div>
              </div>

              {/* Categorized Hashtags Output */}
              {generatedHashtagCategories && (
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  {/* High Volume */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Alto Volume (+500k posts) — Máxima Exposição
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedHashtagCategories.highVolume?.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => addHashtag(t)}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Niche */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Nicho Específico (50k a 500k posts) — Público Alvo
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedHashtagCategories.niche?.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => addHashtag(t)}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Long Tail */}
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                      Cauda Longa / Comunidade (&lt;50k posts) — Alta Conversão
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedHashtagCategories.longTail?.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => addHashtag(t)}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          + {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Template Library */}
          {activeStudioTab === 'templates' && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Biblioteca de Templates por Categoria</h3>
                <p className="text-xs text-neutral-500">
                  Estruturas validadas para Psicologia, Produtividade, Motivação, Curiosidades e Negócios.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {CONTENT_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 transition-all bg-neutral-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900 text-white">
                          {tpl.category}
                        </span>
                        <span className="text-xs font-semibold text-neutral-500">
                          {tpl.format === 'carousel' ? 'Carrossel' : 'Imagem'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleLoadTemplate(tpl)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center gap-1"
                      >
                        Carregar Template <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900">{tpl.name}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed">{tpl.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High-Fidelity Instagram Mockup & Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full flex flex-col items-center">
            <InstagramPreview post={currentPost} />
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Agendar Publicação</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <p className="text-xs text-neutral-600">
              Escolha a data e o horário em que o job/cron do servidor publicará este post automaticamente na Meta Graph API.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Data e Hora de Publicação</label>
              <input
                type="datetime-local"
                value={scheduleDateInput}
                onChange={(e) => setScheduleDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-neutral-300 text-neutral-700"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (scheduleDateInput) {
                    await onSchedulePost(currentPost, new Date(scheduleDateInput).toISOString());
                    setShowScheduleModal(false);
                    showToast('Post agendado com sucesso no calendário!');
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
