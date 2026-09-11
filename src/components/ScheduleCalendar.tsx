import React, { useState } from 'react';
import { Post, ScheduleSlot, PublicationLog } from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
} from 'lucide-react';

interface ScheduleCalendarProps {
  posts: Post[];
  slots: ScheduleSlot[];
  logs: PublicationLog[];
  onAddSlot: (slot: Partial<ScheduleSlot>) => Promise<void>;
  onDeleteSlot: (slotId: string) => Promise<void>;
  onToggleSlot: (slotId: string) => Promise<void>;
  onSelectPost: (post: Post) => void;
  onPublishNow: (post: Post) => Promise<void>;
  onRefresh: () => void;
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  posts,
  slots,
  logs,
  onAddSlot,
  onDeleteSlot,
  onToggleSlot,
  onSelectPost,
  onPublishNow,
  onRefresh,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'queue' | 'slots' | 'logs'>('calendar');
  const [newSlotDay, setNewSlotDay] = useState(1);
  const [newSlotTime, setNewSlotTime] = useState('09:00');
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month and total days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Group posts by day key YYYY-MM-DD
  const postsByDate: Record<string, Post[]> = {};
  posts.forEach((p) => {
    const targetDate = p.scheduledFor || p.publishedAt;
    if (targetDate) {
      const d = new Date(targetDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!postsByDate[key]) postsByDate[key] = [];
      postsByDate[key].push(p);
    }
  });

  // Upcoming scheduled posts in queue
  const scheduledQueue = posts
    .filter((p) => p.status === 'scheduled' && p.scheduledFor)
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime());

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotTime) return;
    await onAddSlot({
      dayOfWeek: Number(newSlotDay),
      time: newSlotTime,
      label: newSlotLabel || `${DAYS_OF_WEEK[newSlotDay]} às ${newSlotTime}`,
      enabled: true,
    });
    setNewSlotLabel('');
    setIsAddingSlot(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-rose-500" /> Calendário Editorial & Fila Automática
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Defina horários pré-definidos de publicação e acompanhe a fila cronológica de posts agendados.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'calendar' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Calendário Mensal
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'queue' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3 h-3" /> Fila ({scheduledQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'slots' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3 h-3" /> Horários ({slots.filter((s) => s.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'logs' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-3 h-3" /> Logs & Avisos ({logs.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: Interactive Monthly Calendar */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          {/* Month Control Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 capitalize">
                {monthNames[month]} de {year}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              >
                Hoje
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Grid Header */}
          <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-xl overflow-hidden text-center text-xs font-semibold text-neutral-600">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
              <div key={i} className="bg-neutral-100 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] p-1 bg-neutral-50/40 rounded-xl border border-transparent" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayPosts = postsByDate[dateStr] || [];
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={dayNum}
                  className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-rose-500 text-white' : 'text-neutral-800'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] font-semibold text-neutral-500">{dayPosts.length} post(s)</span>
                    )}
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => onSelectPost(post)}
                        className={`p-1.5 rounded-lg text-[10px] font-semibold cursor-pointer truncate transition-colors border ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : post.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                            : post.status === 'failed'
                            ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                        title={`${post.title} (${post.status})`}
                      >
                        {post.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Status Legend */}
          <div className="flex items-center gap-4 text-xs text-neutral-600 pt-3 border-t border-neutral-100 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Agendado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Publicado no Instagram
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Rascunho / Pendente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Falha na Publicação
            </span>
          </div>
        </div>
      )}

      {/* VIEW 2: Content Queue (Fila Cronológica) */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Fila de Publicação Automática</h2>
              <p className="text-xs text-neutral-500">
                Estes posts serão publicados automaticamente no Instagram pelo serviço de scheduler nos horários indicados.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
              {scheduledQueue.length} post(s) na fila
            </span>
          </div>

          <div className="space-y-3">
            {scheduledQueue.map((post, idx) => (
              <div
                key={post.id}
                className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-neutral-900">{post.title}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-200 text-neutral-700">
                        {post.format === 'carousel' ? 'Carrossel' : 'Imagem'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 mt-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>
                        Previsto para:{' '}
                        <strong>{post.scheduledFor ? new Date(post.scheduledFor).toLocaleString('pt-PT') : 'N/A'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onSelectPost(post)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 text-neutral-700 hover:bg-white transition-colors"
                  >
                    Editar no Estúdio
                  </button>
                  <button
                    onClick={() => onPublishNow(post)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Play className="w-3 h-3 text-emerald-400" /> Publicar Agora
                  </button>
                </div>
              </div>
            ))}

            {scheduledQueue.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-neutral-200 rounded-xl space-y-2">
                <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-800">Fila vazia no momento</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Vá até o Estúdio de Criação, crie ou gere um post com IA, aprove-o e clique em "Adicionar à Fila" para preencher a sua grade.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Schedule Slots Configuration */}
      {activeTab === 'slots' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Grade de Horários Pré-definidos</h2>
              <p className="text-xs text-neutral-500">
                Configure os dias da semana e horários fixos de publicação (ex: 3x por semana, às 09h e 19h).
              </p>
            </div>
            <button
              onClick={() => setIsAddingSlot(!isAddingSlot)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Horário
            </button>
          </div>

          {/* Add Slot Form */}
          {isAddingSlot && (
            <form onSubmit={handleCreateSlot} className="p-4 rounded-xl border border-neutral-300 bg-neutral-50/80 space-y-3">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Novo Slot de Publicação</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Dia da Semana</label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 bg-white"
                  >
                    {DAYS_OF_WEEK.map((day, i) => (
                      <option key={i} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Horário (HH:mm)</label>
                  <input
                    type="time"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Rótulo / Estratégia (Opcional)</label>
                  <input
                    type="text"
                    value={newSlotLabel}
                    onChange={(e) => setNewSlotLabel(e.target.value)}
                    placeholder="Ex: Pico Matinal, Carrossel Educativo..."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-neutral-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingSlot(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-neutral-300 text-neutral-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white"
                >
                  Salvar Horário
                </button>
              </div>
            </form>
          )}

          {/* Slots List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="p-3.5 rounded-xl border border-neutral-200 bg-white flex items-center justify-between gap-2 shadow-2xs hover:border-neutral-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{DAYS_OF_WEEK[slot.dayOfWeek]}</span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-neutral-100 text-neutral-800">
                      {slot.time}
                    </span>
                  </div>
                  {slot.label && <p className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-[180px]">{slot.label}</p>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleSlot(slot.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      slot.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {slot.enabled ? 'Ativo' : 'Pausado'}
                  </button>
                  <button
                    onClick={() => onDeleteSlot(slot.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 rounded-md"
                    title="Excluir slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Activity Log & Scheduler Diagnostics */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Histórico de Publicações e Notificações</h2>
              <p className="text-xs text-neutral-500">
                Registro de eventos da Instagram Graph API, IDs de container gerados e notificações do scheduler.
              </p>
            </div>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 hover:bg-neutral-100"
            >
              <RotateCw className="w-3.5 h-3.5" /> Atualizar
            </button>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'simulated'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : log.status === 'simulated' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {log.status}
                    </span>
                    <span className="text-xs font-bold text-neutral-900">{log.postTitle}</span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{log.details}</p>
                  {log.metaResponseId && (
                    <span className="text-[10px] font-mono text-neutral-500 block">
                      Container / Post ID: {log.metaResponseId}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400 whitespace-nowrap self-end sm:self-auto font-mono">
                  {new Date(log.timestamp).toLocaleString('pt-PT')}
                </span>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-10 text-neutral-500 text-xs">
                Nenhum log registrado ainda. As publicações agendadas aparecerão aqui.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
