import React, { useState } from 'react';
import { Post, PostSlide } from '../types';
import { Heart, MessageCircle, Send, Bookmark, ChevronLeft, ChevronRight, MoreHorizontal, CheckCircle2, Clock } from 'lucide-react';

interface InstagramPreviewProps {
  post: Partial<Post>;
  username?: string;
  avatarUrl?: string;
}

export const InstagramPreview: React.FC<InstagramPreviewProps> = ({
  post,
  username = 'meu.instagram.creator',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const slides: PostSlide[] = post.slides && post.slides.length > 0 ? post.slides : [];
  const mediaUrls = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls : [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'
  ];

  const hasMultipleSlides = post.format === 'carousel' && (slides.length > 1 || mediaUrls.length > 1);
  const totalSlides = post.format === 'carousel' ? Math.max(slides.length, mediaUrls.length) : 1;

  const currentMedia = mediaUrls[currentSlideIndex % mediaUrls.length];
  const currentSlideData = slides[currentSlideIndex];

  return (
    <div id="instagram-mockup-wrapper" className="flex flex-col items-center">
      {/* Mobile Device Frame */}
      <div
        id="instagram-phone-frame"
        className="w-full max-w-[375px] bg-white rounded-[38px] shadow-2xl border-[8px] border-neutral-900 overflow-hidden text-neutral-900 font-sans relative"
      >
        {/* iOS Dynamic Island / Speaker Notch */}
        <div className="bg-neutral-900 pt-2 pb-1 px-6 flex justify-between items-center text-white text-[11px] font-medium tracking-tight">
          <span>09:41</span>
          <div className="w-20 h-4 bg-black rounded-full mx-auto -mt-1"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-5 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-white rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Instagram Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
              <img
                src={avatarUrl}
                alt={username}
                className="w-7 h-7 rounded-full object-cover border border-white"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold tracking-tight">{username}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              </div>
              <span className="text-[10px] text-neutral-500 block leading-none">Original Audio</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.status === 'approved' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5" /> Aprovado
              </span>
            )}
            {post.status === 'scheduled' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] bg-blue-50 text-blue-700 font-medium border border-blue-200">
                <Clock className="w-2.5 h-2.5" /> Agendado
              </span>
            )}
            <MoreHorizontal className="w-4 h-4 text-neutral-600 cursor-pointer" />
          </div>
        </div>

        {/* Media / Visual Stage */}
        <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
          {currentMedia ? (
            <img
              src={currentMedia}
              alt="Post preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
              <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider mb-2">
                Slide {currentSlideIndex + 1} de {totalSlides}
              </span>
              <h3 className="text-base font-bold leading-snug mb-2">
                {currentSlideData?.title || post.title || 'Título do Post'}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-[260px]">
                {currentSlideData?.body || 'Texto ilustrativo do slide ou imagem selecionada para este post.'}
              </p>
            </div>
          )}

          {/* Slide Overlay text if carousel has structured text on top */}
          {post.format === 'carousel' && currentSlideData && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  Slide {currentSlideIndex + 1}/{totalSlides}
                </span>
                {currentSlideData.callToAction && (
                  <span className="text-[9px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full">
                    {currentSlideData.callToAction}
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5 leading-tight">{currentSlideData.title}</h4>
              <p className="text-[11px] text-neutral-200 line-clamp-2 leading-snug">{currentSlideData.body}</p>
            </div>
          )}

          {/* Carousel Badge Counter */}
          {hasMultipleSlides && (
            <div className="absolute top-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {currentSlideIndex + 1}/{totalSlides}
            </div>
          )}

          {/* Carousel Controls */}
          {hasMultipleSlides && currentSlideIndex > 0 && (
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {hasMultipleSlides && currentSlideIndex < totalSlides - 1 && (
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Carousel Pagination Dots */}
        {hasMultipleSlides && (
          <div className="flex justify-center items-center gap-1 py-1.5 bg-white">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-200 rounded-full ${
                  idx === currentSlideIndex
                    ? 'w-2 h-2 bg-blue-600'
                    : 'w-1.5 h-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Interaction Actions Bar */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="text-neutral-800 hover:text-red-500 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button className="text-neutral-800 hover:text-neutral-600 transition-colors">
              <MessageCircle className="w-5 h-5 -rotate-90" />
            </button>
            <button className="text-neutral-800 hover:text-neutral-600 transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="text-neutral-800 hover:text-neutral-600 transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-neutral-900' : ''}`} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="px-3 text-xs font-semibold text-neutral-900">
          {post.metrics?.likes ? `${post.metrics.likes} gostos` : '412 gostos'}
        </div>

        {/* Caption & Hashtags Section */}
        <div className="px-3 py-1.5 text-xs text-neutral-800 leading-relaxed max-h-[160px] overflow-y-auto">
          <span className="font-semibold text-neutral-900 mr-1.5">{username}</span>
          <span className="whitespace-pre-line">
            {isCaptionExpanded
              ? post.caption || 'Aqui aparecerá a legenda completa gerada pela IA para o teu post.'
              : (post.caption ? `${post.caption.slice(0, 95)}...` : 'Aqui aparecerá a legenda gerada pela IA...')}
          </span>
          {post.caption && post.caption.length > 95 && (
            <button
              onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
              className="text-neutral-500 font-medium ml-1 hover:text-neutral-700"
            >
              {isCaptionExpanded ? 'menos' : 'mais'}
            </button>
          )}

          {/* Hashtags display */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] text-blue-800">
              {post.hashtags.map((tag, i) => (
                <span key={i} className="hover:underline cursor-pointer">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comments Prompt */}
        <div className="px-3 pb-3 pt-0.5 text-[11px] text-neutral-400">
          Ver todos os {post.metrics?.comments || 18} comentários
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="pb-1.5 pt-0.5 flex justify-center bg-white">
          <div className="w-28 h-1 bg-neutral-300 rounded-full"></div>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-neutral-500 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
        Pré-visualização Fiel da Meta Graph API (1080x1080px)
      </div>
    </div>
  );
};
