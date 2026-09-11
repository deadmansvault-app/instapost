import React, { useState, useEffect } from 'react';
import { Post, ScheduleSlot, MetaSettings, PublicationLog, TrendTopic } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { ContentStudio } from './components/ContentStudio';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { TrendsTracker } from './components/TrendsTracker';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MetaSettingsView } from './components/MetaSettingsView';
import { DeliverablesDoc } from './components/DeliverablesDoc';
import { PinLockScreen } from './components/PinLockScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default unlocked for seamless preview, but lockable
  const [activeTab, setActiveTab] = useState<ActiveTab>('studio');

  // Core Data States
  const [posts, setPosts] = useState<Post[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [settings, setSettings] = useState<MetaSettings>({
    mode: 'simulation',
    appId: '',
    appSecret: '',
    accessToken: '',
    facebookPageId: '',
    instagramBusinessId: '',
    instagramUsername: '@meu.instagram.creator',
    connectionStatus: 'connected',
    autoRefreshToken: true,
  });
  const [logs, setLogs] = useState<PublicationLog[]>([]);
  const [trends, setTrends] = useState<TrendTopic[]>([]);

  // Studio Active Post State
  const [currentPost, setCurrentPost] = useState<Post>({
    id: `post-${Date.now()}`,
    title: '5 Hábitos que Reconfiguram o Teu Cérebro',
    theme: 'Psicologia & Hábitos',
    format: 'carousel',
    caption: `A ciência do comportamento prova que a consistência vence a intensidade em 100% das vezes. 👇\n\nQuando tentas mudar tudo de uma só vez, a tua amígdala cerebral interpreta isso como ameaça. O segredo está nos micro-passos diários.\n\nSalva este post para reler sempre que precisares de foco e disciplina!`,
    hashtags: ['#psicologia', '#produtividade', '#habitos', '#desenvolvimentopessoal', '#foco', '#neurociencia'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    ],
    tone: 'Educativo e Prático',
    goal: 'Educar e Gerar Salvamentos',
    status: 'draft',
    slides: [
      {
        id: 's1',
        slideNumber: 1,
        title: '5 Hábitos que Reconfiguram o Teu Cérebro',
        body: 'Desliza para entender a neurociência por trás da tua produtividade diária.',
      },
      {
        id: 's2',
        slideNumber: 2,
        title: '1. A Regra dos 2 Minutos',
        body: 'Se uma tarefa demora menos de 120 segundos, faz agora. Vence a inércia mental.',
      },
      {
        id: 's3',
        slideNumber: 3,
        title: '2. Luz Solar nos Primeiros 30 Minutos',
        body: 'Regula o ciclo circadiano e corta os picos de adenosina matinais.',
      },
      {
        id: 's4',
        slideNumber: 4,
        title: '3. Foco em Blocos de 50 Minutos',
        body: 'O córtex pré-frontal atinge fadiga após 50 minutos. Faça pausas sem ecrãs.',
      },
      {
        id: 's5',
        slideNumber: 5,
        title: 'Gostaste desta análise prática?',
        body: 'Toca em Salvar 🔖 para consultar quando o teu foco falhar.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Loading flags
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);

  // Initial Load from Backend
  const loadAllData = async () => {
    try {
      const [postsRes, slotsRes, settingsRes, logsRes, trendsRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/schedule-slots'),
        fetch('/api/settings'),
        fetch('/api/logs'),
        fetch('/api/trends'),
      ]);

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData);
        if (postsData.length > 0 && !currentPost.id) {
          setCurrentPost(postsData[0]);
        }
      }

      if (slotsRes.ok) {
        const slotsData = await slotsRes.json();
        setSlots(slotsData);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData);
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData);
      }
    } catch (err) {
      console.error('Error fetching data from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Poll for background scheduled posts changes every 15 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [postsRes, logsRes] = await Promise.all([fetch('/api/posts'), fetch('/api/logs')]);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData);
        }
      } catch (e) {
        // silent background polling
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleSavePost = async (postToSave: Post) => {
    setIsSaving(true);
    try {
      const isExisting = posts.some((p) => p.id === postToSave.id);
      const url = isExisting ? `/api/posts/${postToSave.id}` : '/api/posts';
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postToSave),
      });

      if (res.ok) {
        const saved = await res.json();
        setCurrentPost(saved);
        setPosts((prev) => {
          const idx = prev.findIndex((p) => p.id === saved.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprovePost = async (post: Post) => {
    const updated: Post = { ...post, status: 'approved' };
    setCurrentPost(updated);
    await handleSavePost(updated);
  };

  const handleQueuePost = async (post: Post) => {
    try {
      // First save to ensure server has latest copy
      await handleSavePost(post);
      const res = await fetch(`/api/posts/${post.id}/queue`, { method: 'POST' });
      if (res.ok) {
        const queuedPost = await res.json();
        setCurrentPost(queuedPost);
        setPosts((prev) => prev.map((p) => (p.id === queuedPost.id ? queuedPost : p)));
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSchedulePost = async (post: Post, dateStr: string) => {
    const updated: Post = { ...post, status: 'scheduled', scheduledFor: dateStr };
    setCurrentPost(updated);
    await handleSavePost(updated);
  };

  const handlePublishNow = async (post: Post) => {
    try {
      await handleSavePost(post);
      const res = await fetch(`/api/posts/${post.id}/publish-now`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        if (result.post) {
          setCurrentPost(result.post);
          setPosts((prev) => prev.map((p) => (p.id === result.post.id ? result.post : p)));
        }
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSlot = async (slotData: Partial<ScheduleSlot>) => {
    try {
      const res = await fetch('/api/schedule-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotData),
      });
      if (res.ok) {
        const newSlot = await res.json();
        setSlots((prev) => [...prev, newSlot]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const res = await fetch(`/api/schedule-slots/${slotId}`, { method: 'DELETE' });
      if (res.ok) {
        setSlots((prev) => prev.filter((s) => s.id !== slotId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSlot = async (slotId: string) => {
    const target = slots.find((s) => s.id === slotId);
    if (!target) return;
    try {
      const res = await fetch(`/api/schedule-slots/${slotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !target.enabled }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSlots((prev) => prev.map((s) => (s.id === slotId ? updated : s)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<MetaSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const saved = await res.json();
        setSettings(saved);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestMetaConnection = async () => {
    setIsTestingConnection(true);
    try {
      const res = await fetch('/api/settings/test-connection', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleExchangeToken = async (shortToken: string) => {
    try {
      const res = await fetch('/api/settings/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortLivedToken: shortToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePin = async (currPin: string, newPin: string) => {
    const res = await fetch('/api/auth/update-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPin: currPin, newPin }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Erro ao mudar PIN');
    }
  };

  const handleUnlockPin = async (enteredPin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: enteredPin }),
      });
      const data = await res.json();
      if (data.valid) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleAnalyzeTrends = async (category: string, focusNiche: string) => {
    setIsAnalyzingTrends(true);
    try {
      const res = await fetch('/api/ai/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, focusNiche }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.trends && Array.isArray(data.trends)) {
          setTrends((prev) => [...data.trends, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingTrends(false);
    }
  };

  const handleCreatePostFromTrend = (trend: TrendTopic) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: trend.topic,
      theme: trend.category,
      format: 'carousel',
      caption: `${trend.hook}\n\n${trend.angle}\n\nSalva este post e partilha com quem precisa deste insight!`,
      hashtags: trend.trendingHashtags,
      mediaUrls: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'],
      tone: 'Educativo e Prático',
      goal: 'Educar e Gerar Salvamentos',
      status: 'draft',
      slides: [
        {
          id: `s1-${Date.now()}`,
          slideNumber: 1,
          title: trend.hook,
          body: 'Deslize para conferir os principais pontos sobre este tema.',
        },
        {
          id: `s2-${Date.now()}`,
          slideNumber: 2,
          title: 'O Problema Silencioso',
          body: trend.angle,
        },
        {
          id: `s3-${Date.now()}`,
          slideNumber: 3,
          title: 'Como Aplicar Hoje',
          body: 'Substitua o impulso pelo hábito intencional.',
        },
        {
          id: `s4-${Date.now()}`,
          slideNumber: 4,
          title: 'Conclusão Prática',
          body: 'Guarde este lembrete na sua rotina diária.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentPost(newPost);
    setActiveTab('studio');
  };

  const handleOpenNewPost = () => {
    const freshPost: Post = {
      id: `post-${Date.now()}`,
      title: 'Novo Post sem Título',
      theme: 'Psicologia',
      format: 'carousel',
      caption: '',
      hashtags: ['#instagram', '#conteudo'],
      mediaUrls: ['https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'],
      tone: 'Profissional e Prático',
      goal: 'Educar e Gerar Salvamentos',
      status: 'draft',
      slides: [
        {
          id: `s-${Date.now()}-1`,
          slideNumber: 1,
          title: 'Título do Gancho',
          body: 'Texto magnético para reter a atenção.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentPost(freshPost);
    setActiveTab('studio');
  };

  // If locked, render PIN screen
  if (!isAuthenticated) {
    return <PinLockScreen onUnlock={handleUnlockPin} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        onLockSession={() => setIsAuthenticated(false)}
        onOpenNewPost={handleOpenNewPost}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'studio' && (
          <ContentStudio
            currentPost={currentPost}
            setCurrentPost={setCurrentPost}
            onSavePost={handleSavePost}
            onApprovePost={handleApprovePost}
            onQueuePost={handleQueuePost}
            onPublishNow={handlePublishNow}
            onSchedulePost={handleSchedulePost}
            isSaving={isSaving}
          />
        )}

        {activeTab === 'calendar' && (
          <ScheduleCalendar
            posts={posts}
            slots={slots}
            logs={logs}
            onAddSlot={handleAddSlot}
            onDeleteSlot={handleDeleteSlot}
            onToggleSlot={handleToggleSlot}
            onSelectPost={(p) => {
              setCurrentPost(p);
              setActiveTab('studio');
            }}
            onPublishNow={handlePublishNow}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsTracker
            trends={trends}
            onAnalyzeCategory={handleAnalyzeTrends}
            onCreatePostFromTrend={handleCreatePostFromTrend}
            isAnalyzing={isAnalyzingTrends}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            posts={posts}
            onSelectPost={(p) => {
              setCurrentPost(p);
              setActiveTab('studio');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <MetaSettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onTestConnection={handleTestMetaConnection}
            onExchangeToken={handleExchangeToken}
            onUpdatePin={handleUpdatePin}
            isTesting={isTestingConnection}
          />
        )}

        {activeTab === 'docs' && <DeliverablesDoc />}
      </main>
    </div>
  );
}
