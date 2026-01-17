import { useId, useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './ui/chart';

export type UsagePeriod = 'weekly' | 'monthly' | 'yearly';

export interface UsageMetrics {
  label: string;
  totalScans: number;
  footprintKg: number;
  improvementPercent: number;
  topCategory: string;
  topItem: string;
  comparisonText?: string;
}

export interface UsageInsight {
  title: string;
  detail: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface UsageTrendPoint {
  label: string;
  value: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  total?: number;
}

export interface RecentScan {
  id: string;
  itemName: string;
  category: string;
  impactKg: number;
  scannedAt: string;
  imageUrl?: string;
}

export interface CategoryBreakdown {
  category: string;
  percentage: number;
  impactKg: number;
  color: string;
}

export interface ProfileDashboardProps {
  displayName: string;
  avatarUrl?: string;
  humanFillPercent: number;
  selectedPeriod: UsagePeriod;
  periods: Record<UsagePeriod, UsageMetrics>;
  trendSeries: Record<UsagePeriod, UsageTrendPoint[]>;
  insights: UsageInsight[];
  badges?: Badge[];
  recentScans?: RecentScan[];
  categoryBreakdown?: CategoryBreakdown[];
  streakDays?: number;
  tips?: string[];
  onPeriodChange?: (period: UsagePeriod) => void;
}

const PERIOD_LABELS: Record<UsagePeriod, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

function TrendIndicator({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        Down
      </span>
    );
  }
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Up
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-gray-500 font-medium">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
      Flat
    </span>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Food: 'bg-emerald-100 text-emerald-700',
    Fashion: 'bg-indigo-100 text-indigo-700',
    Electronics: 'bg-amber-100 text-amber-700',
    Lifestyle: 'bg-pink-100 text-pink-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
}

export function ProfileDashboard({
  displayName,
  avatarUrl,
  humanFillPercent,
  selectedPeriod,
  periods,
  trendSeries,
  insights,
  badges = [],
  recentScans = [],
  categoryBreakdown = [],
  streakDays = 0,
  tips = [],
  onPeriodChange,
}: ProfileDashboardProps) {
  const activeMetrics = periods[selectedPeriod];
  const trendData = trendSeries[selectedPeriod];
  const [animatedFill, setAnimatedFill] = useState(0);
  const fillPercent = clampPercent(humanFillPercent);
  const clipId = useId();

  // Animate the fill on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedFill(fillPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [fillPercent]);

  const earnedBadges = badges.filter((b) => b.earned);
  const inProgressBadges = badges.filter((b) => !b.earned);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl relative min-h-[calc(100vh-80px)]">
      {/* Header with Navigation */}
      <header className="mb-8 pb-4 border-b border-emerald-200">
        {/* Top row: Back button and user info */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 -ml-2 px-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Button>
          <div className="h-6 w-px bg-emerald-200" />
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover border-2 border-emerald-200" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-emerald-900 truncate">
              {displayName}'s Dashboard
            </h1>
          </div>
          {streakDays > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
              <span className="text-base">🔥</span>
              <span className="text-xs font-medium text-amber-700">{streakDays}d</span>
            </div>
          )}
        </div>

        {/* Bottom row: Period selector */}
        <div className="flex gap-1.5">
          {(Object.keys(PERIOD_LABELS) as UsagePeriod[]).map((period) => (
            <Button
              key={period}
              variant={period === selectedPeriod ? 'default' : 'outline'}
              size="sm"
              className={`flex-1 ${period === selectedPeriod ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
              onClick={() => onPeriodChange?.(period)}
            >
              {PERIOD_LABELS[period]}
            </Button>
          ))}
        </div>
      </header>

      {/* Comparison Banner */}
      {activeMetrics.comparisonText && (
        <div className="mb-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <p className="font-medium">{activeMetrics.comparisonText}</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Top Row: Carbon Human + Stats + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Eco Score Human */}
          <Card className="p-5 border-emerald-200 bg-white/70 backdrop-blur overflow-hidden flex flex-col">
            <div className="text-center mb-2">
              <p className="text-xs uppercase tracking-wide text-emerald-500">
                Eco Score
              </p>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-4xl font-bold text-emerald-600">
                  {fillPercent}
                </span>
                <span className="text-lg text-emerald-400">/100</span>
              </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center py-4">
              <svg
                viewBox="0 0 100 180"
                className="h-64 w-auto"
                aria-label="Eco score human meter"
              >
                <defs>
                  {/* Clip path for the human silhouette */}
                  <clipPath id={`${clipId}-human`}>
                    {/* Head */}
                    <circle cx="50" cy="20" r="14" />
                    {/* Body */}
                    <rect x="32" y="36" width="36" height="55" rx="12" />
                    {/* Left arm */}
                    <rect x="16" y="42" width="14" height="38" rx="7" />
                    {/* Right arm */}
                    <rect x="70" y="42" width="14" height="38" rx="7" />
                    {/* Left leg */}
                    <rect x="32" y="93" width="14" height="50" rx="7" />
                    {/* Right leg */}
                    <rect x="54" y="93" width="14" height="50" rx="7" />
                  </clipPath>

                  {/* Gradient for fill - bottom to top */}
                  <linearGradient id={`${clipId}-gradient`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>

                  {/* Subtle glow effect */}
                  <filter id={`${clipId}-glow`}>
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background silhouette (empty state) */}
                <g opacity="0.15">
                  <circle cx="50" cy="20" r="14" fill="#10b981" />
                  <rect x="32" y="36" width="36" height="55" rx="12" fill="#10b981" />
                  <rect x="16" y="42" width="14" height="38" rx="7" fill="#10b981" />
                  <rect x="70" y="42" width="14" height="38" rx="7" fill="#10b981" />
                  <rect x="32" y="93" width="14" height="50" rx="7" fill="#10b981" />
                  <rect x="54" y="93" width="14" height="50" rx="7" fill="#10b981" />
                </g>

                {/* Filled portion - clips to human shape and fills from bottom */}
                <rect
                  x="0"
                  y={143 - (143 * animatedFill) / 100}
                  width="100"
                  height={(143 * animatedFill) / 100}
                  fill={`url(#${clipId}-gradient)`}
                  clipPath={`url(#${clipId}-human)`}
                  filter={`url(#${clipId}-glow)`}
                  style={{ transition: 'y 1.2s ease-out, height 1.2s ease-out' }}
                />

                {/* Outline of human shape */}
                <g fill="none" stroke="#a7f3d0" strokeWidth="1.5">
                  <circle cx="50" cy="20" r="14" />
                  <rect x="32" y="36" width="36" height="55" rx="12" />
                  <rect x="16" y="42" width="14" height="38" rx="7" />
                  <rect x="70" y="42" width="14" height="38" rx="7" />
                  <rect x="32" y="93" width="14" height="50" rx="7" />
                  <rect x="54" y="93" width="14" height="50" rx="7" />
                </g>
              </svg>
            </div>

            <div className="text-center mt-2 space-y-1">
              <p className="text-xs font-medium text-emerald-700">
                {fillPercent < 30 ? 'Just getting started' :
                 fillPercent < 50 ? 'Building momentum' :
                 fillPercent < 70 ? 'Making an impact' :
                 fillPercent < 90 ? 'Eco champion' : 'Planet hero!'}
              </p>
              <p className="text-[11px] text-emerald-500">
                Based on scans, improvements & sustainable swaps
              </p>
            </div>
          </Card>

          {/* Stats Snapshot */}
          <Card className="p-6 border-emerald-200 bg-white/70 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-emerald-500 mb-4">
              {activeMetrics.label} Snapshot
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-emerald-900">
                  {activeMetrics.totalScans}
                </p>
                <p className="text-xs text-emerald-600 mt-1">Total scans</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-emerald-900">
                  {activeMetrics.footprintKg.toFixed(1)}
                  <span className="text-lg font-normal ml-1">kg</span>
                </p>
                <p className="text-xs text-emerald-600 mt-1">CO2e tracked</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-emerald-900">
                    {activeMetrics.improvementPercent}%
                  </p>
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <p className="text-xs text-emerald-600 mt-1">Improvement</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xl font-bold text-emerald-900">
                  {activeMetrics.topCategory}
                </p>
                <p className="text-xs text-emerald-600 mt-1">Top category</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-500 uppercase tracking-wide">Top Impact Item</p>
              <p className="text-sm font-semibold text-emerald-900 mt-1">{activeMetrics.topItem}</p>
            </div>
          </Card>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <Card className="p-6 border-emerald-200 bg-white/70 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-emerald-500 mb-4">
                Category Breakdown
              </p>
              <div className="flex items-center justify-center">
                <ChartContainer
                  className="h-40 w-40"
                  config={{
                    category: { label: 'Category' },
                  }}
                >
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      dataKey="percentage"
                      nameKey="category"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="mt-4 space-y-2">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-emerald-700">{cat.category}</span>
                    </div>
                    <span className="font-medium text-emerald-900">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Trend Chart */}
        <Card className="p-6 border-emerald-200 bg-white/70 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-emerald-500">
                {activeMetrics.label} Trend
              </p>
              <h2 className="text-lg font-semibold text-emerald-900">
                Footprint Over Time
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-600">Total CO2e</p>
              <p className="text-lg font-semibold text-emerald-900">
                {activeMetrics.footprintKg.toFixed(1)} kg
              </p>
            </div>
          </div>
          <ChartContainer
            className="h-56 w-full"
            config={{
              impact: {
                label: 'CO2e',
                color: 'hsl(160 84% 39%)',
              },
            }}
          >
            <AreaChart data={trendData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={`${clipId}-area`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-impact)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-impact)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={30}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="value"
                type="monotone"
                stroke="var(--color-impact)"
                strokeWidth={2}
                fill={`url(#${clipId}-area)`}
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Insights with Trend Indicators */}
        <Card className="p-6 border-emerald-200 bg-white/70 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-emerald-900">
              Insights
            </h2>
            <p className="text-xs text-emerald-500">
              {activeMetrics.label}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.title}
                className={`rounded-xl border p-4 ${
                  insight.trend === 'down'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : insight.trend === 'up'
                    ? 'border-amber-200 bg-amber-50/50'
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-emerald-900">
                    {insight.title}
                  </p>
                  {insight.trend && <TrendIndicator trend={insight.trend} />}
                </div>
                <p className="text-xs text-emerald-700">
                  {insight.detail}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tips Section */}
        {tips.length > 0 && (
          <Card className="p-6 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💡</span>
              <h2 className="text-lg font-semibold text-emerald-900">
                Tips for {activeMetrics.topCategory}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                  <span className="text-emerald-500 mt-0.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <p className="text-sm text-emerald-700">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Badges Section */}
        {badges.length > 0 && (
          <Card className="p-6 border-emerald-200 bg-white/70 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏆</span>
              <h2 className="text-lg font-semibold text-emerald-900">
                Achievements
              </h2>
              <span className="ml-auto text-sm text-emerald-600">
                {earnedBadges.length} of {badges.length} earned
              </span>
            </div>

            {/* Earned Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center"
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-sm font-semibold text-emerald-900 mt-2">{badge.name}</p>
                  <p className="text-xs text-emerald-600 mt-1">{badge.description}</p>
                  {badge.earnedDate && (
                    <p className="text-[10px] text-emerald-500 mt-2">
                      Earned {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* In Progress Badges */}
            {inProgressBadges.length > 0 && (
              <>
                <p className="text-xs uppercase tracking-wide text-emerald-500 mb-3">In Progress</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {inProgressBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center opacity-75"
                    >
                      <span className="text-3xl grayscale">{badge.icon}</span>
                      <p className="text-sm font-semibold text-gray-700 mt-2">{badge.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                      {badge.progress !== undefined && badge.total !== undefined && (
                        <div className="mt-2">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all"
                              style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {badge.progress} / {badge.total}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card className="p-6 border-emerald-200 bg-white/70 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h2 className="text-lg font-semibold text-emerald-900">
                  Recent Scans
                </h2>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-emerald-100">
                      {scan.imageUrl ? (
                        <img src={scan.imageUrl} alt={scan.itemName} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <span className="text-emerald-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-900">{scan.itemName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getCategoryColor(scan.category)}`}>
                          {scan.category}
                        </span>
                        <span className="text-xs text-emerald-500">{formatRelativeTime(scan.scannedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-900">{scan.impactKg.toFixed(1)} kg</p>
                    <p className="text-xs text-emerald-500">CO2e</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
