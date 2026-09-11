import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_POSTS, INITIAL_SCHEDULE_SLOTS, INITIAL_SETTINGS, INITIAL_TRENDS, INITIAL_LOGS } from './src/data/initialData';
import { Post, ScheduleSlot, MetaSettings, PublicationLog, TrendTopic } from './src/types';

dotenv.config();

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// Initialize Gemini SDK with User-Agent header as required
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

interface AppStore {
  authPin: string;
  settings: MetaSettings;
  posts: Post[];
  scheduleSlots: ScheduleSlot[];
  trends: TrendTopic[];
  logs: PublicationLog[];
}

// Load or initialize store
function loadStore(): AppStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading data store, using initial defaults:', err);
  }
  const defaultStore: AppStore = {
    authPin: '1234',
    settings: INITIAL_SETTINGS,
    posts: INITIAL_POSTS,
    scheduleSlots: INITIAL_SCHEDULE_SLOTS,
    trends: INITIAL_TRENDS,
    logs: INITIAL_LOGS,
  };
  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(store: AppStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving data store:', err);
  }
}

let store: AppStore = loadStore();

// Background Scheduler Engine
// Runs every 20 seconds to check for scheduled posts that need publishing
setInterval(async () => {
  const now = new Date();
  let modified = false;

  for (const post of store.posts) {
    if (post.status === 'scheduled' && post.scheduledFor) {
      const scheduledTime = new Date(post.scheduledFor);
      if (scheduledTime <= now) {
        post.status = 'publishing';
        modified = true;
        saveStore(store);

        console.log(`[Scheduler] Executing scheduled publication for post: ${post.id} ("${post.title}")`);

        // Execute publication (Simulation or Live Meta Graph API)
        try {
          if (store.settings.mode === 'live' && store.settings.accessToken && store.settings.instagramBusinessId) {
            // Live Meta Graph API publishing
            // 1. Create container
            const igId = store.settings.instagramBusinessId;
            const containerUrl = `https://graph.facebook.com/v19.0/${igId}/media`;
            const containerParams = new URLSearchParams();
            containerParams.append('access_token', store.settings.accessToken);
            containerParams.append('caption', `${post.caption}\n\n${post.hashtags.join(' ')}`);

            if (post.mediaUrls.length > 0) {
              containerParams.append('image_url', post.mediaUrls[0]);
            }

            const cRes = await fetch(containerUrl, { method: 'POST', body: containerParams });
            const cData = await cRes.json();

            if (!cRes.ok || !cData.id) {
              throw new Error(cData.error?.message || 'Falha ao criar container no Instagram');
            }

            // 2. Publish container
            const publishUrl = `https://graph.facebook.com/v19.0/${igId}/media_publish`;
            const publishParams = new URLSearchParams();
            publishParams.append('creation_id', cData.id);
            publishParams.append('access_token', store.settings.accessToken);

            const pRes = await fetch(publishUrl, { method: 'POST', body: publishParams });
            const pData = await pRes.json();

            if (!pRes.ok || !pData.id) {
              throw new Error(pData.error?.message || 'Falha ao publicar media container');
            }

            post.status = 'published';
            post.publishedAt = new Date().toISOString();
            post.instagramPostId = pData.id;
            post.metaContainerId = cData.id;

            store.logs.unshift({
              id: `log-${Date.now()}`,
              postId: post.id,
              postTitle: post.title,
              timestamp: new Date().toISOString(),
              status: 'success',
              details: `Publicado com sucesso via Instagram Graph API. ID: ${pData.id}`,
              metaResponseId: pData.id,
            });
          } else {
            // Simulated publication
            const simContainerId = `sim_cnt_${Math.random().toString(36).substring(2, 9)}`;
            const simPostId = `179${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;

            post.status = 'published';
            post.publishedAt = new Date().toISOString();
            post.metaContainerId = simContainerId;
            post.instagramPostId = simPostId;
            post.metrics = {
              likes: Math.floor(Math.random() * 20) + 5,
              comments: Math.floor(Math.random() * 5),
              reach: Math.floor(Math.random() * 300) + 100,
              impressions: Math.floor(Math.random() * 450) + 150,
              saves: Math.floor(Math.random() * 15) + 2,
              shares: Math.floor(Math.random() * 8),
              engagementRate: +(Math.random() * 4 + 3).toFixed(1),
            };

            store.logs.unshift({
              id: `log-${Date.now()}`,
              postId: post.id,
              postTitle: post.title,
              timestamp: new Date().toISOString(),
              status: 'simulated',
              details: `[Agendador Automático] Publicado com sucesso no feed simulado do Instagram. ID: ${simPostId}`,
              metaResponseId: simPostId,
            });
          }
        } catch (pubError: any) {
          post.status = 'failed';
          post.errorMessage = pubError?.message || 'Erro ao publicar no Instagram';
          store.logs.unshift({
            id: `log-${Date.now()}`,
            postId: post.id,
            postTitle: post.title,
            timestamp: new Date().toISOString(),
            status: 'failed',
            details: `Falha no agendamento: ${post.errorMessage}`,
          });
        }
        saveStore(store);
      }
    }
  }
}, 20000);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: 'PIN obrigatório' });
    }
    if (pin === store.authPin) {
      return res.json({ success: true, message: 'Autenticado com sucesso' });
    }
    return res.status(401).json({ error: 'PIN incorreto. Tente novamente.' });
  });

  app.post('/api/auth/update-pin', (req: Request, res: Response) => {
    const { currentPin, newPin } = req.body;
    if (currentPin !== store.authPin) {
      return res.status(401).json({ error: 'PIN atual inválido' });
    }
    if (!newPin || newPin.length < 4) {
      return res.status(400).json({ error: 'O novo PIN deve ter pelo menos 4 dígitos' });
    }
    store.authPin = newPin;
    saveStore(store);
    res.json({ success: true, message: 'PIN atualizado com sucesso' });
  });

  // --- INSTAGRAM & META SETTINGS ---
  app.get('/api/instagram/settings', (req: Request, res: Response) => {
    // Return settings with partially masked secrets for security
    const safeSettings = {
      ...store.settings,
      appSecret: store.settings.appSecret ? '••••••••••••••••' : '',
      accessToken: store.settings.accessToken ? `${store.settings.accessToken.substring(0, 10)}...${store.settings.accessToken.slice(-6)}` : '',
    };
    res.json(safeSettings);
  });

  app.post('/api/instagram/settings', (req: Request, res: Response) => {
    const incoming = req.body;
    store.settings = {
      ...store.settings,
      ...incoming,
      // If client didn't change masked values, keep original
      appSecret: incoming.appSecret && !incoming.appSecret.includes('••••') ? incoming.appSecret : store.settings.appSecret,
      accessToken: incoming.accessToken && !incoming.accessToken.includes('...') ? incoming.accessToken : store.settings.accessToken,
    };
    saveStore(store);
    res.json({ success: true, settings: store.settings });
  });

  app.post('/api/instagram/test-connection', async (req: Request, res: Response) => {
    try {
      if (store.settings.mode === 'live' && store.settings.accessToken) {
        // Real Graph API test
        const testUrl = `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${store.settings.accessToken}`;
        const resp = await fetch(testUrl);
        const data = await resp.json();
        if (!resp.ok || data.error) {
          store.settings.connectionStatus = 'error';
          store.settings.errorMessage = data.error?.message || 'Erro na validação do token';
          saveStore(store);
          return res.status(400).json({ success: false, error: store.settings.errorMessage });
        }
        store.settings.connectionStatus = 'connected';
        store.settings.lastTestedAt = new Date().toISOString();
        store.settings.errorMessage = undefined;
        saveStore(store);
        return res.json({ success: true, user: data, message: 'Conectado com sucesso à Meta Graph API!' });
      } else {
        // Simulation mode test
        store.settings.connectionStatus = 'connected';
        store.settings.lastTestedAt = new Date().toISOString();
        store.settings.errorMessage = undefined;
        saveStore(store);
        return res.json({
          success: true,
          simulated: true,
          account: {
            username: store.settings.instagramUsername || '@meu.instagram.creator',
            page: store.settings.facebookPageName || 'Minha Página Pessoal',
            permissions: ['instagram_content_publish', 'pages_show_list', 'instagram_basic', 'instagram_manage_insights'],
          },
          message: 'Ambiente de Simulação / Modo de Desenvolvimento validado com sucesso!',
        });
      }
    } catch (err: any) {
      store.settings.connectionStatus = 'error';
      store.settings.errorMessage = err.message;
      saveStore(store);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/instagram/exchange-token', async (req: Request, res: Response) => {
    const { shortLivedToken } = req.body;
    const appId = store.settings.appId;
    const appSecret = store.settings.appSecret;

    if (!shortLivedToken) {
      return res.status(400).json({ error: 'Token de curta duração não informado' });
    }

    if (store.settings.mode === 'live') {
      try {
        const exchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
        const resp = await fetch(exchangeUrl);
        const data = await resp.json();
        if (!resp.ok || data.error) {
          throw new Error(data.error?.message || 'Falha ao trocar token');
        }
        store.settings.accessToken = data.access_token;
        store.settings.tokenExpiresAt = new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString();
        store.settings.connectionStatus = 'connected';
        saveStore(store);
        return res.json({ success: true, message: 'Long-lived Token renovado para 60 dias!', expiresAt: store.settings.tokenExpiresAt });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      // Simulation mode exchange
      store.settings.accessToken = `EAACEdEose0cBA_${Date.now()}_long_lived_token`;
      store.settings.tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
      store.settings.connectionStatus = 'connected';
      saveStore(store);
      return res.json({
        success: true,
        simulated: true,
        message: 'Token Long-Lived de 60 dias gerado e renovado com sucesso!',
        expiresAt: store.settings.tokenExpiresAt,
      });
    }
  });

  // --- POSTS CRUD ---
  app.get('/api/posts', (req: Request, res: Response) => {
    res.json(store.posts);
  });

  app.post('/api/posts', (req: Request, res: Response) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      title: req.body.title || 'Novo Post',
      theme: req.body.theme || 'Geral',
      format: req.body.format || 'single_image',
      caption: req.body.caption || '',
      hashtags: req.body.hashtags || [],
      mediaUrls: req.body.mediaUrls || [],
      slides: req.body.slides || [],
      status: req.body.status || 'draft',
      tone: req.body.tone || 'Profissional',
      goal: req.body.goal || 'Educar',
      scheduledFor: req.body.scheduledFor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.posts.unshift(newPost);
    saveStore(store);
    res.status(201).json(newPost);
  });

  app.put('/api/posts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = store.posts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    store.posts[index] = {
      ...store.posts[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);
    res.json(store.posts[index]);
  });

  app.delete('/api/posts/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    store.posts = store.posts.filter((p) => p.id !== id);
    saveStore(store);
    res.json({ success: true, message: 'Post excluído' });
  });

  // Manual Review & Approval Flow
  app.post('/api/posts/:id/approve', (req: Request, res: Response) => {
    const { id } = req.params;
    const post = store.posts.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }
    post.status = 'approved';
    post.updatedAt = new Date().toISOString();
    saveStore(store);
    res.json({ success: true, post });
  });

  // Auto-slot to next available schedule slot
  app.post('/api/posts/:id/queue', (req: Request, res: Response) => {
    const { id } = req.params;
    const post = store.posts.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    // Find enabled schedule slots
    const slots = store.scheduleSlots.filter((s) => s.enabled);
    if (slots.length === 0) {
      return res.status(400).json({ error: 'Nenhum horário de publicação configurado. Configure horários na aba de Agendamento.' });
    }

    // Calculate next available slot
    const existingScheduledTimes = store.posts
      .filter((p) => p.status === 'scheduled' && p.scheduledFor && p.id !== id)
      .map((p) => new Date(p.scheduledFor!).getTime());

    let candidate = new Date();
    candidate.setMinutes(candidate.getMinutes() + 10); // at least 10 min in the future

    let assignedTime: Date | null = null;
    // Look ahead up to 30 days
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + dayOffset);
      const dayOfWeek = checkDate.getDay();

      const daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek);
      for (const slot of daySlots) {
        const [hour, minute] = slot.time.split(':').map(Number);
        const slotDate = new Date(checkDate);
        slotDate.setHours(hour, minute, 0, 0);

        if (slotDate.getTime() > candidate.getTime()) {
          // Check if slotDate is not already taken (within 30 mins)
          const isTaken = existingScheduledTimes.some((t) => Math.abs(t - slotDate.getTime()) < 30 * 60 * 1000);
          if (!isTaken) {
            assignedTime = slotDate;
            break;
          }
        }
      }
      if (assignedTime) break;
    }

    if (!assignedTime) {
      // Fallback: tomorrow at 09:00
      assignedTime = new Date();
      assignedTime.setDate(assignedTime.getDate() + 1);
      assignedTime.setHours(9, 0, 0, 0);
    }

    post.status = 'scheduled';
    post.scheduledFor = assignedTime.toISOString();
    post.updatedAt = new Date().toISOString();
    saveStore(store);

    res.json({ success: true, post, scheduledFor: assignedTime.toISOString() });
  });

  // Immediate Publish Action
  app.post('/api/posts/:id/publish-now', async (req: Request, res: Response) => {
    const { id } = req.params;
    const post = store.posts.find((p) => p.id === id);
    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' });
    }

    try {
      if (store.settings.mode === 'live' && store.settings.accessToken && store.settings.instagramBusinessId) {
        const igId = store.settings.instagramBusinessId;
        const containerUrl = `https://graph.facebook.com/v19.0/${igId}/media`;
        const containerParams = new URLSearchParams();
        containerParams.append('access_token', store.settings.accessToken);
        containerParams.append('caption', `${post.caption}\n\n${post.hashtags.join(' ')}`);

        if (post.mediaUrls.length > 0) {
          containerParams.append('image_url', post.mediaUrls[0]);
        }

        const cRes = await fetch(containerUrl, { method: 'POST', body: containerParams });
        const cData = await cRes.json();
        if (!cRes.ok || !cData.id) {
          throw new Error(cData.error?.message || 'Falha ao criar container no Instagram');
        }

        const publishUrl = `https://graph.facebook.com/v19.0/${igId}/media_publish`;
        const publishParams = new URLSearchParams();
        publishParams.append('creation_id', cData.id);
        publishParams.append('access_token', store.settings.accessToken);

        const pRes = await fetch(publishUrl, { method: 'POST', body: publishParams });
        const pData = await pRes.json();
        if (!pRes.ok || !pData.id) {
          throw new Error(pData.error?.message || 'Falha ao publicar media container');
        }

        post.status = 'published';
        post.publishedAt = new Date().toISOString();
        post.instagramPostId = pData.id;
        post.metaContainerId = cData.id;
        post.metrics = {
          likes: 0,
          comments: 0,
          reach: 0,
          impressions: 0,
          saves: 0,
          shares: 0,
          engagementRate: 0,
        };

        store.logs.unshift({
          id: `log-${Date.now()}`,
          postId: post.id,
          postTitle: post.title,
          timestamp: new Date().toISOString(),
          status: 'success',
          details: `Publicado instantaneamente no Instagram via Graph API. Post ID: ${pData.id}`,
          metaResponseId: pData.id,
        });
      } else {
        // Simulated instant publish
        const simContainerId = `sim_cnt_${Math.random().toString(36).substring(2, 9)}`;
        const simPostId = `179${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;

        post.status = 'published';
        post.publishedAt = new Date().toISOString();
        post.metaContainerId = simContainerId;
        post.instagramPostId = simPostId;
        post.metrics = {
          likes: Math.floor(Math.random() * 30) + 10,
          comments: Math.floor(Math.random() * 8) + 1,
          reach: Math.floor(Math.random() * 450) + 200,
          impressions: Math.floor(Math.random() * 600) + 250,
          saves: Math.floor(Math.random() * 20) + 5,
          shares: Math.floor(Math.random() * 10) + 2,
          engagementRate: +(Math.random() * 5 + 4).toFixed(1),
        };

        store.logs.unshift({
          id: `log-${Date.now()}`,
          postId: post.id,
          postTitle: post.title,
          timestamp: new Date().toISOString(),
          status: 'simulated',
          details: `[Publicação Imediata] Post publicado com sucesso no feed simulado do Instagram. ID: ${simPostId}`,
          metaResponseId: simPostId,
        });
      }
      saveStore(store);
      res.json({ success: true, post });
    } catch (err: any) {
      post.status = 'failed';
      post.errorMessage = err.message;
      store.logs.unshift({
        id: `log-${Date.now()}`,
        postId: post.id,
        postTitle: post.title,
        timestamp: new Date().toISOString(),
        status: 'failed',
        details: `Erro na publicação: ${err.message}`,
      });
      saveStore(store);
      res.status(500).json({ error: err.message });
    }
  });

  // --- SCHEDULE SLOTS ---
  app.get('/api/schedule/slots', (req: Request, res: Response) => {
    res.json(store.scheduleSlots);
  });

  app.post('/api/schedule/slots', (req: Request, res: Response) => {
    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      dayOfWeek: req.body.dayOfWeek,
      time: req.body.time,
      label: req.body.label,
      enabled: req.body.enabled !== false,
    };
    store.scheduleSlots.push(newSlot);
    saveStore(store);
    res.status(201).json(newSlot);
  });

  app.delete('/api/schedule/slots/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    store.scheduleSlots = store.scheduleSlots.filter((s) => s.id !== id);
    saveStore(store);
    res.json({ success: true });
  });

  app.put('/api/schedule/slots/:id/toggle', (req: Request, res: Response) => {
    const { id } = req.params;
    const slot = store.scheduleSlots.find((s) => s.id === id);
    if (slot) {
      slot.enabled = !slot.enabled;
      saveStore(store);
      return res.json(slot);
    }
    res.status(404).json({ error: 'Slot não encontrado' });
  });

  // --- LOGS & ANALYTICS ---
  app.get('/api/logs', (req: Request, res: Response) => {
    res.json(store.logs);
  });

  app.get('/api/analytics', (req: Request, res: Response) => {
    const published = store.posts.filter((p) => p.status === 'published');
    const totalLikes = published.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0);
    const totalComments = published.reduce((acc, p) => acc + (p.metrics?.comments || 0), 0);
    const totalReach = published.reduce((acc, p) => acc + (p.metrics?.reach || 0), 0);
    const totalImpressions = published.reduce((acc, p) => acc + (p.metrics?.impressions || 0), 0);
    const totalSaves = published.reduce((acc, p) => acc + (p.metrics?.saves || 0), 0);
    const avgEngagement = published.length > 0
      ? +(published.reduce((acc, p) => acc + (p.metrics?.engagementRate || 0), 0) / published.length).toFixed(1)
      : 0;

    // Performance by theme
    const themeMap: Record<string, { theme: string; count: number; totalLikes: number; totalSaves: number; avgReach: number }> = {};
    published.forEach((p) => {
      const t = p.theme || 'Outro';
      if (!themeMap[t]) {
        themeMap[t] = { theme: t, count: 0, totalLikes: 0, totalSaves: 0, avgReach: 0 };
      }
      themeMap[t].count += 1;
      themeMap[t].totalLikes += p.metrics?.likes || 0;
      themeMap[t].totalSaves += p.metrics?.saves || 0;
      themeMap[t].avgReach += p.metrics?.reach || 0;
    });
    const themePerformance = Object.values(themeMap).map((item) => ({
      ...item,
      avgReach: Math.round(item.avgReach / item.count),
    }));

    // Performance by format
    const formatMap: Record<string, { format: string; count: number; avgLikes: number; avgSaves: number; avgEngagement: number }> = {};
    published.forEach((p) => {
      const f = p.format === 'carousel' ? 'Carrossel' : p.format === 'single_image' ? 'Imagem Única' : 'Reels';
      if (!formatMap[f]) {
        formatMap[f] = { format: f, count: 0, avgLikes: 0, avgSaves: 0, avgEngagement: 0 };
      }
      formatMap[f].count += 1;
      formatMap[f].avgLikes += p.metrics?.likes || 0;
      formatMap[f].avgSaves += p.metrics?.saves || 0;
      formatMap[f].avgEngagement += p.metrics?.engagementRate || 0;
    });
    const formatPerformance = Object.values(formatMap).map((item) => ({
      format: item.format,
      count: item.count,
      avgLikes: Math.round(item.avgLikes / item.count),
      avgSaves: Math.round(item.avgSaves / item.count),
      avgEngagement: +(item.avgEngagement / item.count).toFixed(1),
    }));

    res.json({
      summary: {
        totalPosts: store.posts.length,
        publishedCount: published.length,
        scheduledCount: store.posts.filter((p) => p.status === 'scheduled').length,
        draftCount: store.posts.filter((p) => p.status === 'draft' || p.status === 'pending_approval').length,
        totalLikes,
        totalComments,
        totalReach,
        totalImpressions,
        totalSaves,
        avgEngagement,
      },
      themePerformance,
      formatPerformance,
      recentPosts: published.slice(0, 5),
    });
  });

  // --- TRENDS TRACKING ---
  app.get('/api/trends', (req: Request, res: Response) => {
    res.json(store.trends);
  });

  app.post('/api/trends/analyze', async (req: Request, res: Response) => {
    const { category, focusNiche } = req.body;
    try {
      const ai = getAi();
      const prompt = `Como estrategista de conteúdo para Instagram em Portugal e no Brasil especializado em ${category || 'Psicologia e Produtividade'}, analise as tendências emergentes e comportamentos de busca recentes.
Foco específico: ${focusNiche || 'Geral'}.

Gere 3 ideias de conteúdo virais e práticas com base no que as pessoas mais pesquisam hoje nas redes.
Responda EXCLUSIVAMENTE em formato JSON com o seguinte schema:
[
  {
    "id": "trend-generated-1",
    "category": "${category || 'Psicologia'}",
    "topic": "Título claro do tema em alta",
    "hook": "Gancho magnético de primeira linha (headline)",
    "angle": "Abordagem única ou científica para explicar o tema",
    "suggestedFormat": "carousel",
    "viralityScore": 92,
    "trendingHashtags": ["#tag1", "#tag2", "#tag3"],
    "sourceSummary": "Justificativa de por que este tema está em alta no momento"
  }
]`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = aiResponse.text || '[]';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Add to store
        store.trends = [...parsed, ...store.trends].slice(0, 15);
        saveStore(store);
        return res.json(parsed);
      }
      res.json(store.trends);
    } catch (err: any) {
      console.warn('AI trends generation failed, falling back to cached trends:', err.message);
      res.json(store.trends);
    }
  });

  // --- GEMINI AI GENERATORS ---

  // 1. Generate Caption & Hook
  app.post('/api/ai/generate-caption', async (req: Request, res: Response) => {
    const { theme, tone, goal, format, context } = req.body;
    try {
      const ai = getAi();
      const prompt = `És um copywriter de elite para Instagram especializado em perfis profissionais, psicologia, produtividade e desenvolvimento pessoal.
Cria uma legenda magnética, humana e de alta retenção para um post do Instagram.

Parâmetros:
- Tema: ${theme || 'Psicologia e Hábitos'}
- Tom de voz: ${tone || 'Inspiracional e Profissional'}
- Objetivo: ${goal || 'Educar e Gerar Salvamentos'}
- Formato: ${format || 'Carrossel'}
- Contexto adicional: ${context || 'Nenhum'}

Diretrizes de redação:
1. Gancho irresistível na 1ª linha (para que o leitor clique em "... mais").
2. Parágrafos curtos com espaçamento limpo (quebras de linha elegantes para o Instagram).
3. Emojis pontuais e sofisticados (sem poluição visual).
4. Desenvolvimento de alto valor percebido (sem enrolação teórica, foque na aplicação prática).
5. Chamada para Ação (CTA) clara alinhada ao objetivo (ex: "Salva para consultar mais tarde", "Qual destes te custa mais? Comenta abaixo").

Retorne EXCLUSIVAMENTE um objeto JSON:
{
  "hook": "Gancho da primeira linha",
  "caption": "Texto completo da legenda devidamente formatado com \\n\\n para quebras de linha",
  "recommendedHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.75,
        },
      });

      const result = JSON.parse(aiResponse.text || '{}');
      res.json(result);
    } catch (err: any) {
      console.error('Error generating caption:', err);
      // High quality fallback
      res.json({
        hook: `🧠 A maior mentira que te contaram sobre ${theme || 'sucesso'}...`,
        caption: `🧠 A maior mentira que te contaram sobre ${theme || 'sucesso'} é que a motivação vem antes da ação.\n\nNa verdade, a neurociência comprova que a dopamina é disparada após o primeiro pequeno movimento. Quando esperamos sentir vontade para começar, caímos na armadilha da inércia mental.\n\nSe queres mudar os teus resultados esta semana, foca em apenas 5 minutos de compromisso inegociável.\n\nQual é o teu maior obstáculo hoje? Deixa o teu comentário abaixo e salva este post para reler quando a preguiça bater! 👇`,
        recommendedHashtags: ['#psicologia', '#produtividade', '#habitos', '#foco', '#desenvolvimentopessoal'],
      });
    }
  });

  // 2. Generate Carousel Slides & Script
  app.post('/api/ai/generate-carousel', async (req: Request, res: Response) => {
    const { theme, numSlides = 5, tone, goal } = req.body;
    try {
      const ai = getAi();
      const prompt = `Atue como designer de narrativa e roteirista de carrosséis virais para o Instagram.
Crie um roteiro completo de carrossel de ${numSlides} slides sobre o tema "${theme}".
Tom de voz: ${tone || 'Educativo e Prático'}.
Objetivo: ${goal || 'Educar e Gerar Salvamentos'}.

Estrutura esperada:
- Slide 1: Capa com Gancho magnético + subtítulo instigante
- Slides intermediários: Dicas práticas, contrastes antes/depois, dados científicos ou passos fáceis de aplicar
- Slide final: Resumo de ouro + Chamada para Ação forte (Salvar/Compartilhar)

Responda em formato JSON:
{
  "title": "Título Geral do Carrossel",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Título/Gancho do Slide",
      "body": "Texto conciso do slide (máx 35 palavras por slide para leitura agradável no telemóvel)",
      "visualPrompt": "Descrição da direção de arte ou ilustração minimalista sugerida para este slide"
    }
  ]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Error generating carousel:', err);
      res.json({
        title: `Guia Essencial: ${theme || 'Produtividade sem Esgotamento'}`,
        slides: [
          { slideNumber: 1, title: 'O Erro Silencioso', body: 'Por que trabalhar mais horas está na verdade a destruir os teus resultados.', visualPrompt: 'Fundo escuro minimalista com tipografia clean em destaque' },
          { slideNumber: 2, title: '1. O Custo da Troca de Contexto', body: 'Cada notificação rouba até 23 minutos de foco profundo do teu cérebro.', visualPrompt: 'Gráfico minimalista de curva de concentração' },
          { slideNumber: 3, title: '2. Blocos Ultradianos', body: 'Trabalhe em picos de 90 minutos seguidos por 15 minutos de descompressão sem telas.', visualPrompt: 'Cronômetro clean com esquema de cores calmo' },
          { slideNumber: 4, title: '3. A Regra do Não Negociável', body: 'Defina a sua única vitória do dia antes de abrir qualquer email ou mensagem.', visualPrompt: 'Ícone de alvo com estética elegante' },
          { slideNumber: 5, title: 'Aplique Amanhã', body: 'Salva este carrossel para implementar na tua próxima manhã de trabalho.', visualPrompt: 'Botão de salvar do Instagram destacado elegantemente' },
        ],
      });
    }
  });

  // 3. Generate Hashtags by Reach/Volume
  app.post('/api/ai/generate-hashtags', async (req: Request, res: Response) => {
    const { theme, niche } = req.body;
    try {
      const ai = getAi();
      const prompt = `Gere uma lista de 25 hashtags altamente eficazes no Instagram para o tema "${theme}" e nicho "${niche || 'Geral'}".
Divida em 3 categorias de alcance para maximizar a distribuição orgânica pelo algoritmo do Instagram:
- Alto Volume (mais de 500k posts): amplitude geral
- Nicho Específico (50k a 500k posts): público qualificado
- Cauda Longa / Comunidade (menos de 50k posts): alta taxa de conversão e engajamento

Responda em JSON:
{
  "highVolume": ["#tag1", "#tag2"],
  "niche": ["#tag3", "#tag4"],
  "longTail": ["#tag5", "#tag6"],
  "all": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6"]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Error generating hashtags:', err);
      res.json({
        highVolume: ['#psicologia', '#produtividade', '#desenvolvimentopessoal', '#habitos', '#foco'],
        niche: ['#saudementalpt', '#autoconhecimentocura', '#disciplinainteligente', '#rotinadesucesso'],
        longTail: ['#psicologiacomportamentalaplicada', '#produtividaderadiante', '#gestaodotempocompropósito'],
        all: ['#psicologia', '#produtividade', '#desenvolvimentopessoal', '#habitos', '#foco', '#saudementalpt', '#autoconhecimentocura', '#disciplinainteligente'],
      });
    }
  });

  // 4. Generate Visual Image Concept or Art
  app.post('/api/ai/generate-visual-concept', async (req: Request, res: Response) => {
    const { topic, format } = req.body;
    try {
      const ai = getAi();
      const prompt = `Para um post de Instagram de alta conversão sobre "${topic}" (formato: ${format || 'imagem única'}),
crie 3 opções de direção de arte visual recomendadas (ex: fotografia editorial, ilustração 3D minimalista, infográfico tipográfico moderno) com paleta de cores hexadecimais sugeridas e descrição do estilo.

Responda em JSON:
{
  "concepts": [
    {
      "name": "Nome do Estilo",
      "description": "Descrição detalhada do visual e iluminação",
      "colors": ["#1E293B", "#3B82F6", "#F8FAFC"],
      "mood": "Sentimento transmitido",
      "recommendedUnsplashKeywords": "search keywords for high quality unsplash photos"
    }
  ]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      res.json({
        concepts: [
          {
            name: 'Editorial Minimalista',
            description: 'Composição limpa com espaço negativo generoso, luz natural suave e tipografia serifada moderna.',
            colors: ['#0F172A', '#E2E8F0', '#38BDF8'],
            mood: 'Sofisticação e Clareza Mental',
            recommendedUnsplashKeywords: 'minimal architecture workspace light shadows',
          },
        ],
      });
    }
  });

  // Serve Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[InstaFlow Server] Rodando em http://localhost:${PORT}`);
  });
}

startServer();
