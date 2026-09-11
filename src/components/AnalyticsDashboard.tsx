import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Legend } from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Users,
  Eye,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ posts, onSelectPost }) => {
  const publishedPosts = posts.filter((p) => p.status === 'published');

  const totalLikes = publishedPosts.reduce((acc, p) => acc + (p.metrics?.likes || 0), 0);
  const totalComments = publishedPosts.reduce((acc, p) => acc + (p.metrics?.comments || 0), 0);
  const totalReach = publishedPosts.reduce((acc, p) => acc + (p.metrics?.reach || 0), 0);
  const totalImpressions = publishedPosts.reduce((acc, p) => acc + (p.metrics?.impressions || 0), 0);
  const totalSaves = publishedPosts.reduce((acc, p) => acc + (p.metrics?.saves || 0), 0);
  const avgEngagement =
    publishedPosts.length > 0
      ? +(publishedPosts.reduce((acc, p) => acc + (p.metrics?.engagementRate || 0), 0) / publishedPosts.length).toFixed(1)
      : 0;

  // Aggregate by theme
  const themeMap: Record<string, { name: string; likes: number; saves: number; reach: number; count: number }> = {};
  publishedPosts.forEach((p) => {
    const t = p.theme || 'Outro';
    if (!themeMap[t]) {
      themeMap[t] = { name: t, likes: 0, saves: 0, reach: 0, count: 0 };
    }
    themeMap[t].likes += p.metrics?.likes || 0;
    themeMap[t].saves += p.metrics?.saves || 0;
    themeMap[t].reach += p.metrics?.reach || 0;
    themeMap[t].count += 1;
  });

  const themeChartData = Object.values(themeMap).map((item) => ({
    name: item.name.length > 18 ? `${item.name.substring(0, 16)}...` : item.name,
    Curtidas: item.likes,
    Salvamentos: item.saves,
    AlcanceMédio: Math.round(item.reach / item.count),
  }));

  // Aggregate by format (Carousel vs Single Image vs Reels)
  const formatMap: Record<string, { format: string; avgEngagement: number; totalSaves: number; count: number }> = {};
  publishedPosts.forEach((p) => {
    const f = p.format === 'carousel' ? 'Carrossel' : p.format === 'single_image' ? 'Imagem Única' : 'Reels';
    if (!formatMap[f]) {
      formatMap[f] = { format: f, avgEngagement: 0, totalSaves: 0, count: 0 };
    }
    formatMap[f].avgEngagement += p.metrics?.engagementRate || 0;
    formatMap[f].totalSaves += p.metrics?.saves || 0;
    formatMap[f].count += 1;
  });

  const formatChartData = Object.values(formatMap).map((item) => ({
    name: item.format,
    TaxaEngajamento: +(item.avgEngagement / item.count).toFixed(1),
    Salvamentos: item.totalSaves,
  }));

  const COLORS = ['#F43F5E', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-rose-500" /> Analytics de Desempenho & Comparativo
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Compare o impacto de temas e formatos para descobrir o que gera mais engajamento e salvamentos.
          </p>
        </div>
        <div className="text-xs font-semibold bg-neutral-100 px-3 py-1.5 rounded-xl text-neutral-700 self-start sm:self-auto">
          {publishedPosts.length} posts publicados analisados
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Alcance Total</span>
            <Users className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{totalReach.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Contas únicas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Impressões</span>
            <Eye className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{totalImpressions.toLocaleString()}</p>
          <span className="text-[10px] text-neutral-500">Visualizações totais</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Gostos / Likes</span>
            <Heart className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{totalLikes.toLocaleString()}</p>
          <span className="text-[10px] text-neutral-500">Interações</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Salvamentos</span>
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{totalSaves.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Métrica de autoridade</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Comentários</span>
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{totalComments.toLocaleString()}</p>
          <span className="text-[10px] text-neutral-500">Conversas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold">Taxa de Engajamento</span>
            <Award className="w-3.5 h-3.5 text-yellow-500" />
          </div>
          <p className="text-lg font-bold text-neutral-900">{avgEngagement}%</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Média por post</span>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Performance by Theme */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Desempenho por Tema / Nicho</h2>
            <p className="text-xs text-neutral-500">
              Comparação de curtidas e salvamentos por categoria de conteúdo publicado.
            </p>
          </div>

          <div className="h-[280px] w-full">
            {themeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={themeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFF',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Curtidas" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Salvamentos" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                Ainda não há dados suficientes para este gráfico.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Format Comparison (Carousel vs Single Image) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Engajamento por Formato</h2>
            <p className="text-xs text-neutral-500">
              Taxa média de engajamento (%) entre Carrossel e Imagem Única.
            </p>
          </div>

          <div className="h-[280px] w-full">
            {formatChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFF',
                      borderRadius: '12px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="TaxaEngajamento" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                    {formatChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400">
                Aguardando publicações com métricas.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Best Posts Table */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900">Tabela de Posts Publicados & Métricas Detalhadas</h2>
          <p className="text-xs text-neutral-500">
            Acompanhe o retorno sobre cada post gerado pela plataforma.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-neutral-50 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Post</th>
                <th className="py-2.5 px-3">Formato</th>
                <th className="py-2.5 px-3">Tema</th>
                <th className="py-2.5 px-3 text-right">Alcance</th>
                <th className="py-2.5 px-3 text-right">Gostos</th>
                <th className="py-2.5 px-3 text-right">Salvamentos</th>
                <th className="py-2.5 px-3 text-right">Comentários</th>
                <th className="py-2.5 px-3 text-right">Engajamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {publishedPosts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className="hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-semibold text-neutral-900 max-w-[240px] truncate">
                    {post.title}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                      {post.format === 'carousel' ? 'Carrossel' : 'Imagem'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-600">{post.theme}</td>
                  <td className="py-3 px-3 text-right font-mono font-medium">{post.metrics?.reach?.toLocaleString() || 0}</td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-rose-600">
                    {post.metrics?.likes?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-purple-600">
                    {post.metrics?.saves?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-emerald-600">
                    {post.metrics?.comments?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">
                    {post.metrics?.engagementRate || 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
