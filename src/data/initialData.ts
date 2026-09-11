import { Post, ScheduleSlot, MetaSettings, PublicationLog, TrendTopic } from '../types';

export const INITIAL_SCHEDULE_SLOTS: ScheduleSlot[] = [
  { id: 'slot-mon-09', dayOfWeek: 1, time: '09:00', label: 'Segunda Matinal (Início da Semana)', enabled: true },
  { id: 'slot-mon-19', dayOfWeek: 1, time: '19:00', label: 'Segunda Noturna', enabled: true },
  { id: 'slot-wed-09', dayOfWeek: 3, time: '09:00', label: 'Quarta Matinal (Pico de Engajamento)', enabled: true },
  { id: 'slot-wed-19', dayOfWeek: 3, time: '19:00', label: 'Quarta Noturna', enabled: true },
  { id: 'slot-fri-09', dayOfWeek: 5, time: '09:00', label: 'Sexta Educativa', enabled: true },
  { id: 'slot-fri-19', dayOfWeek: 5, time: '19:00', label: 'Sexta Descompressão', enabled: true },
];

export const INITIAL_SETTINGS: MetaSettings = {
  isConfigured: true,
  mode: 'simulation',
  appId: '849204918239012',
  appSecret: '••••••••••••••••••••••••••••••••',
  accessToken: 'EAACEdEose0cBA...[Long-Lived Meta Graph Token]',
  tokenExpiresAt: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000).toISOString(),
  facebookPageId: '109283748291024',
  facebookPageName: 'Minha Página Pessoal - Criador',
  instagramBusinessId: '17841405309281745',
  instagramUsername: '@meu.instagram.creator',
  autoRefreshTokens: true,
  lastTestedAt: new Date().toISOString(),
  connectionStatus: 'connected',
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    title: '5 Hábitos Noturnos que Destroem a Tua Energia Matinal',
    theme: 'Produtividade e Sono',
    format: 'carousel',
    caption: `😴 Acordas sempre cansado mesmo tendo dormido 8 horas? O problema não é a duração do sono, mas sim a qualidade neuroquímica da tua noite.\n\nNeste carrossel, reuni os 5 erros clássicos que a maioria das pessoas comete entre as 20h e as 23h — e os ajustes simples para acordares com a mente afiada.\n\nArrasta para o lado e verifica quantos destes ainda fazes hoje 👉\n\nQual destes hábitos é o teu maior desafio de largar? Deixa nos comentários! 👇\n.\n.\n.`,
    hashtags: ['#produtividade', '#sono', '#qualidadedevida', '#rotinasaudavel', '#foco', '#neurociencia', '#biohacking'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
    ],
    slides: [
      { id: 's1', slideNumber: 1, title: '5 Hábitos Noturnos', body: 'Que silenciosamente roubam a tua energia do dia seguinte.' },
      { id: 's2', slideNumber: 2, title: '1. Luz azul após as 21h', body: 'A luz de telemóveis e tablets bloqueia a síntese natural de melatonina.' },
      { id: 's3', slideNumber: 3, title: '2. Comer perto de deitar', body: 'A digestão pesada eleva a temperatura corporal e impede o sono profundo REM.' },
      { id: 's4', slideNumber: 4, title: '3. Cafeína tardia (após as 14h)', body: 'A meia-vida da cafeína é de 5 a 7 horas no teu organismo.' },
      { id: 's5', slideNumber: 5, title: 'Ajuste Imediato', body: 'Cria uma barreira de 60 minutos sem ecrãs antes de deitar. Salva este post!' },
    ],
    status: 'published',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    tone: 'Educativo e Prático',
    goal: 'Educar e Gerar Salvamentos',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    instagramPostId: '17992019482710492',
    metrics: {
      likes: 412,
      comments: 63,
      reach: 5820,
      impressions: 7490,
      saves: 341,
      shares: 98,
      engagementRate: 8.8,
    }
  },
  {
    id: 'post-2',
    title: 'A Armadilha da Produtividade Tóxica',
    theme: 'Psicologia e Saúde Mental',
    format: 'single_image',
    caption: `🧠 Sentir culpa por descansar não é disciplina. É ansiedade disfarçada de ambição.\n\nDurante muito tempo vendemos a narrativa de que o descanso só é merecido após a exaustão total. Mas o descanso não é uma recompensa: é uma pré-condição biológica para a criatividade e lucidez.\n\nSe precisas de autorização hoje: para um pouco. O mundo não vai desabar se responderes àquele email amanhã.\n\nMarca alguém que precisa desesperadamente de ler isto hoje. 🤍`,
    hashtags: ['#saudemental', '#psicologia', '#autocuidado', '#produtividadeconsciente', '#ansiedade', '#desacelerar'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tone: 'Empático e Acolhedor',
    goal: 'Engajar e Compartilhar',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-3',
    title: 'Como Superar a Síndrome do Impostor com a Ciência',
    theme: 'Psicologia',
    format: 'carousel',
    caption: `👀 Achar que és uma farsa e que a qualquer momento alguém vai descobrir a verdade? Cerca de 70% dos profissionais de alto rendimento sofrem deste mesmo fenómeno.\n\nNeste guia prático, desconstruo o ciclo da síndrome do impostor segundo a psicologia comportamental e mostro como reestruturar os teus pensamentos automáticos.\n\nDesliza para entender a raiz do problema 👉`,
    hashtags: ['#sindromedimpostor', '#psicologia', '#autoconfiança', '#carreira', '#desenvolvimentopessoal'],
    mediaUrls: [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    ],
    slides: [
      { id: 's3-1', slideNumber: 1, title: 'Síndrome do Impostor', body: 'A ciência por trás do medo de ser desmascarado.' },
      { id: 's3-2', slideNumber: 2, title: 'O Efeito Dunning-Kruger Invertido', body: 'Quanto mais competente és, mais consciente ficas do que ainda não sabes.' },
      { id: 's3-3', slideNumber: 3, title: 'Diário de Factos', body: 'Substitui sentimentos por evidências verificáveis de realizações anteriores.' },
    ],
    status: 'pending_approval',
    tone: 'Informativo e Profissional',
    goal: 'Educar e Conectar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_TRENDS: TrendTopic[] = [
  {
    id: 'trend-1',
    category: 'Psicologia & Saúde Mental',
    topic: 'Fadiga de Decisão e Desconexão Digital',
    hook: 'Porque estás tão cansado às 16h mesmo sem ter feito esforço físico?',
    angle: 'Explicar a sobrecarga sensorial provocada por micro-decisões em feeds e notificações e como aplicar o minimalismo de escolhas.',
    suggestedFormat: 'carousel',
    viralityScore: 94,
    trendingHashtags: ['#fadiga', '#saudemental', '#minimalismodigital', '#psicologiacognitiva'],
    sourceSummary: 'Aumento de 48% em pesquisas sobre "burnout cognitivo" e "dopamine detox" em plataformas de conteúdo.'
  },
  {
    id: 'trend-2',
    category: 'Produtividade',
    topic: 'Monotarefa e o Fim do Mito Multitasking',
    hook: 'Fazer 3 coisas ao mesmo tempo está a diminuir o teu QI em 10 pontos.',
    angle: 'Apresentar dados neurológicos sobre o custo cognitivo de alternância de contexto (context switching tax) com protocolo prático de 1 tarefa por bloco.',
    suggestedFormat: 'carousel',
    viralityScore: 89,
    trendingHashtags: ['#foco', '#produtividade', '#monotarefa', '#altaperformance'],
    sourceSummary: 'Pesquisas recentes de neurociência do trabalho destacam a monotarefa como o diferencial dos criadores mais eficientes.'
  },
  {
    id: 'trend-3',
    category: 'Comportamento & Ciência',
    topic: 'O Efeito Halo nas Redes Sociais',
    hook: 'Como a primeira impressão digital manipula as tuas compras e julgamentos.',
    angle: 'Desconstruir como fotos estéticas, cores e design criam uma sensação inconsciente de credibilidade que nem sempre é real.',
    suggestedFormat: 'single_image',
    viralityScore: 82,
    trendingHashtags: ['#psicologiasocial', '#efeitohalo', '#comportamentohumano', '#viesescognitivos'],
    sourceSummary: 'Debate em alta sobre autenticidade vs polimento artificial em perfis pessoais no Instagram.'
  }
];

export const INITIAL_LOGS: PublicationLog[] = [
  {
    id: 'log-1',
    postId: 'post-1',
    postTitle: '5 Hábitos Noturnos que Destroem a Tua Energia Matinal',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'success',
    details: 'Container publicado na Instagram Graph API com sucesso via endpoint POST /{ig-user-id}/media_publish.',
    metaResponseId: '17992019482710492'
  },
  {
    id: 'log-2',
    postId: 'post-test',
    postTitle: 'Verificação de Token e Permissões Meta',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'simulated',
    details: 'Permissões validadas: instagram_content_publish, pages_show_list, instagram_basic. Token válido por 52 dias.',
    metaResponseId: 'SIM-OAUTH-VALIDATE-991'
  }
];
