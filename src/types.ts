export type PostStatus = 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'publishing' | 'published' | 'failed';

export type PostFormat = 'single_image' | 'carousel' | 'reel';

export interface PostSlide {
  id: string;
  slideNumber: number;
  title: string;
  body: string;
  visualPrompt?: string;
  imageUrl?: string;
  callToAction?: string;
}

export interface Post {
  id: string;
  title: string;
  theme: string;
  format: PostFormat;
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  slides?: PostSlide[];
  status: PostStatus;
  scheduledFor?: string; // ISO date string
  publishedAt?: string;
  tone: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  metaContainerId?: string;
  instagramPostId?: string;
  errorMessage?: string;
  metrics?: {
    likes: number;
    comments: number;
    reach: number;
    impressions: number;
    saves: number;
    shares: number;
    engagementRate: number;
  };
}

export interface ScheduleSlot {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  time: string; // HH:mm format, e.g. "09:00"
  label?: string;
  enabled: boolean;
}

export interface MetaSettings {
  isConfigured: boolean;
  mode: 'simulation' | 'live';
  appId: string;
  appSecret: string;
  accessToken: string;
  tokenExpiresAt?: string;
  facebookPageId: string;
  facebookPageName?: string;
  instagramBusinessId: string;
  instagramUsername?: string;
  autoRefreshTokens: boolean;
  lastTestedAt?: string;
  connectionStatus: 'connected' | 'disconnected' | 'token_expired' | 'error';
  errorMessage?: string;
}

export interface PublicationLog {
  id: string;
  postId: string;
  postTitle: string;
  timestamp: string;
  status: 'success' | 'failed' | 'simulated';
  details: string;
  metaResponseId?: string;
}

export interface TrendTopic {
  id: string;
  category: string;
  topic: string;
  hook: string;
  angle: string;
  suggestedFormat: PostFormat;
  viralityScore: number; // 1-100
  trendingHashtags: string[];
  sourceSummary: string;
}

export interface ContentTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  format: PostFormat;
  defaultTone: string;
  defaultGoal: string;
  slideTemplates?: {
    slideNumber: number;
    header: string;
    description: string;
  }[];
  captionStructure: string;
  recommendedHashtags: string[];
}
