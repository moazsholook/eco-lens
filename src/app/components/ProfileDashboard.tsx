import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

export interface ProfileDashboardProps {
  displayName: string;
  humanFillPercent: number;
  selectedPeriod: UsagePeriod;
  periods: Record<UsagePeriod, UsageMetrics>;
  trendSeries: Record<UsagePeriod, UsageTrendPoint[]>;
  insights: UsageInsight[];
  onPeriodChange?: (period: UsagePeriod) => void;
}

const PERIOD_LABELS: Record<UsagePeriod, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

export function ProfileDashboard({
  displayName,
  humanFillPercent,
  selectedPeriod,
  periods,
  trendSeries,
  insights,
  onPeriodChange,
}: ProfileDashboardProps) {
  const activeMetrics = periods[selectedPeriod];
  const trendData = trendSeries[selectedPeriod];
  const fillPercent = clampPercent(humanFillPercent);
  const clipId = useId();
  const silhouetteMinY = 6;
  const silhouetteMaxY = 176;
  const silhouetteHeight = silhouetteMaxY - silhouetteMinY;
  const fillHeight = (silhouetteHeight * fillPercent) / 100;
  const fillY = silhouetteMaxY - fillHeight;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl relative min-h-[calc(100vh-80px)]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
              Profile Dashboard
            </div>
            <h1 className="text-3xl font-semibold text-emerald-900">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-emerald-700">
              Track your footprint and discover simple wins.
            </p>
          </div>
          <div className="flex gap-2">
            {(Object.keys(PERIOD_LABELS) as UsagePeriod[]).map((period) => (
              <Button
                key={period}
                variant={period === selectedPeriod ? 'default' : 'outline'}
                className="text-sm border-emerald-200"
                onClick={() => onPeriodChange?.(period)}
              >
                {PERIOD_LABELS[period]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          <Card className="p-6 border-emerald-200 bg-white/70 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-500">
                  Carbon Human
                </p>
                <h2 className="text-lg font-semibold text-emerald-900">
                  Your Progress Meter
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-600">Completion</p>
                <p className="text-2xl font-semibold text-emerald-900">
                  {fillPercent}%
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-52 h-80">
              <svg
                viewBox="0 0 100 200"
                className="w-full h-full"
                aria-label="Carbon human progress meter"
              >
                <defs>
                  <clipPath id={clipId}>
                    <circle cx="50" cy="22" r="16" />
                    <rect x="30" y="40" width="40" height="70" rx="16" />
                    <rect x="18" y="48" width="10" height="50" rx="5" />
                    <rect x="72" y="48" width="10" height="50" rx="5" />
                    <rect x="32" y="112" width="16" height="64" rx="8" />
                    <rect x="52" y="112" width="16" height="64" rx="8" />
                  </clipPath>
                  <linearGradient id={`${clipId}-fill`} x1="0" x2="0" y1="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="55%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#6ee7b7" />
                  </linearGradient>
                </defs>
                <rect
                  x="6"
                  y="4"
                  width="88"
                  height="192"
                  rx="40"
                  fill="#ecfdf5"
                  stroke="#a7f3d0"
                />
                <ellipse cx="50" cy="190" rx="26" ry="4" fill="#d1fae5" />
                <rect
                  x="6"
                  y={fillY}
                  width="88"
                  height={fillHeight}
                  fill={`url(#${clipId}-fill)`}
                  clipPath={`url(#${clipId})`}
                />
                <circle cx="50" cy="22" r="16" fill="#ffffff" stroke="#a7f3d0" />
                <rect x="30" y="40" width="40" height="70" rx="16" fill="#ffffff" stroke="#a7f3d0" />
                <rect x="18" y="48" width="10" height="50" rx="5" fill="#ffffff" stroke="#a7f3d0" />
                <rect x="72" y="48" width="10" height="50" rx="5" fill="#ffffff" stroke="#a7f3d0" />
                <rect x="32" y="112" width="16" height="64" rx="8" fill="#ffffff" stroke="#a7f3d0" />
                <rect x="52" y="112" width="16" height="64" rx="8" fill="#ffffff" stroke="#a7f3d0" />
              </svg>
            </div>

            <p className="mt-4 text-sm text-emerald-700">
              Fill grows as you scan more items and make lower-impact choices.
            </p>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            <Card className="p-5 border-emerald-200 bg-white/70 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-emerald-500">
                {activeMetrics.label} Snapshot
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-semibold text-emerald-900">
                    {activeMetrics.totalScans}
                  </p>
                  <p className="text-xs text-emerald-700">Total scans</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-emerald-900">
                    {activeMetrics.footprintKg.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-emerald-700">CO2e tracked</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-emerald-900">
                    {activeMetrics.improvementPercent}%
                  </p>
                  <p className="text-xs text-emerald-700">Improvement</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-emerald-900">
                    {activeMetrics.topCategory}
                  </p>
                  <p className="text-xs text-emerald-700">Top category</p>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <p className="text-xs uppercase tracking-wide text-emerald-500">
                Top Insight
              </p>
              <h3 className="mt-2 text-lg font-semibold text-emerald-900">
                {activeMetrics.topItem}
              </h3>
              <p className="text-sm text-emerald-700">
                This item drives most of your {activeMetrics.label.toLowerCase()} impact.
              </p>
            </Card>
          </div>
        </div>

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
                className="rounded-xl border border-emerald-200 bg-white/70 p-4"
              >
                <p className="text-sm font-semibold text-emerald-900">
                  {insight.title}
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  {insight.detail}
                </p>
                {insight.trend && (
                  <p className="text-[11px] uppercase tracking-wide text-emerald-500 mt-3">
                    Trend: {insight.trend}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
