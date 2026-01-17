import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import {
  ProfileDashboard,
  type UsageMetrics,
  type UsageInsight,
  type UsagePeriod,
  type UsageTrendPoint,
  type Badge,
  type RecentScan,
  type CategoryBreakdown,
} from './app/components/ProfileDashboard';

const periods: Record<UsagePeriod, UsageMetrics> = {
  weekly: {
    label: 'Weekly',
    totalScans: 12,
    footprintKg: 5.6,
    improvementPercent: 8,
    topCategory: 'Food',
    topItem: 'Takeout containers',
    comparisonText: "You're 12% better than last week!",
  },
  monthly: {
    label: 'Monthly',
    totalScans: 46,
    footprintKg: 22.4,
    improvementPercent: 14,
    topCategory: 'Fashion',
    topItem: 'Cotton T-shirts',
    comparisonText: "You're 14% better than last month!",
  },
  yearly: {
    label: 'Yearly',
    totalScans: 410,
    footprintKg: 198.2,
    improvementPercent: 21,
    topCategory: 'Electronics',
    topItem: 'Phone upgrades',
    comparisonText: "You're 21% better than last year!",
  },
};

const insights: UsageInsight[] = [
  {
    title: 'Best swap this week',
    detail: 'Reusable cup scans cut your footprint by 1.2 kg CO2e.',
    trend: 'down',
  },
  {
    title: 'Most improved category',
    detail: 'Food impacts dropped 9% with more home cooking scans.',
    trend: 'down',
  },
  {
    title: 'Watchlist',
    detail: 'Fast fashion items are trending up in your scans.',
    trend: 'up',
  },
];

const trendSeries: Record<UsagePeriod, UsageTrendPoint[]> = {
  weekly: [
    { label: 'Mon', value: 0.9 },
    { label: 'Tue', value: 1.1 },
    { label: 'Wed', value: 0.7 },
    { label: 'Thu', value: 1.3 },
    { label: 'Fri', value: 0.8 },
    { label: 'Sat', value: 0.6 },
    { label: 'Sun', value: 0.4 },
  ],
  monthly: [
    { label: 'W1', value: 6.2 },
    { label: 'W2', value: 5.1 },
    { label: 'W3', value: 4.6 },
    { label: 'W4', value: 6.5 },
  ],
  yearly: [
    { label: 'Jan', value: 18.2 },
    { label: 'Feb', value: 16.8 },
    { label: 'Mar', value: 19.4 },
    { label: 'Apr', value: 17.9 },
    { label: 'May', value: 15.6 },
    { label: 'Jun', value: 14.2 },
    { label: 'Jul', value: 16.1 },
    { label: 'Aug', value: 13.5 },
    { label: 'Sep', value: 12.8 },
    { label: 'Oct', value: 14.9 },
    { label: 'Nov', value: 15.7 },
    { label: 'Dec', value: 13.1 },
  ],
};

const badges: Badge[] = [
  {
    id: 'first-scan',
    name: 'First Scan',
    description: 'Completed your first product scan',
    icon: '🎯',
    earned: true,
    earnedDate: '2024-01-15',
  },
  {
    id: 'week-streak',
    name: '7-Day Streak',
    description: 'Scanned items for 7 consecutive days',
    icon: '🔥',
    earned: true,
    earnedDate: '2024-01-22',
  },
  {
    id: 'eco-warrior',
    name: 'Eco Warrior',
    description: 'Reduced footprint by 20% in a month',
    icon: '🌍',
    earned: true,
    earnedDate: '2024-02-10',
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Reached 100 total scans',
    icon: '💯',
    earned: true,
    earnedDate: '2024-03-05',
  },
  {
    id: 'food-hero',
    name: 'Food Hero',
    description: 'Scan 50 food items',
    icon: '🥗',
    earned: false,
    progress: 35,
    total: 50,
  },
  {
    id: 'fashion-forward',
    name: 'Fashion Forward',
    description: 'Make 10 sustainable fashion swaps',
    icon: '👕',
    earned: false,
    progress: 6,
    total: 10,
  },
];

const recentScans: RecentScan[] = [
  {
    id: '1',
    itemName: 'Organic Cotton T-Shirt',
    category: 'Fashion',
    impactKg: 2.1,
    scannedAt: '2024-03-15T10:30:00Z',
    imageUrl: undefined,
  },
  {
    id: '2',
    itemName: 'Reusable Water Bottle',
    category: 'Lifestyle',
    impactKg: 0.3,
    scannedAt: '2024-03-15T09:15:00Z',
    imageUrl: undefined,
  },
  {
    id: '3',
    itemName: 'Takeout Container (Plastic)',
    category: 'Food',
    impactKg: 0.8,
    scannedAt: '2024-03-14T19:45:00Z',
    imageUrl: undefined,
  },
  {
    id: '4',
    itemName: 'Wireless Earbuds',
    category: 'Electronics',
    impactKg: 4.2,
    scannedAt: '2024-03-14T14:20:00Z',
    imageUrl: undefined,
  },
  {
    id: '5',
    itemName: 'Glass Food Storage',
    category: 'Lifestyle',
    impactKg: 0.5,
    scannedAt: '2024-03-13T11:00:00Z',
    imageUrl: undefined,
  },
];

const categoryBreakdown: CategoryBreakdown[] = [
  { category: 'Food', percentage: 35, impactKg: 7.84, color: '#10b981' },
  { category: 'Fashion', percentage: 28, impactKg: 6.27, color: '#6366f1' },
  { category: 'Electronics', percentage: 22, impactKg: 4.93, color: '#f59e0b' },
  { category: 'Lifestyle', percentage: 15, impactKg: 3.36, color: '#ec4899' },
];

const tips: Record<string, string[]> = {
  Food: [
    'Try meal prepping to reduce takeout packaging waste',
    'Bring reusable containers when ordering takeout',
    'Choose locally sourced produce to cut transport emissions',
  ],
  Fashion: [
    'Consider secondhand clothing options',
    'Look for sustainable fabric certifications',
    'Extend garment life with proper care',
  ],
  Electronics: [
    'Consider refurbished devices',
    'Recycle old electronics properly',
    'Extend device lifespan with cases and care',
  ],
  Lifestyle: [
    'Switch to reusable alternatives',
    'Buy products with minimal packaging',
    'Choose items made from recycled materials',
  ],
};

function ProfileDemo() {
  const [selectedPeriod, setSelectedPeriod] = useState<UsagePeriod>('monthly');
  const activeMetrics = periods[selectedPeriod];
  const currentTips = tips[activeMetrics.topCategory] || tips['Lifestyle'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <ProfileDashboard
        displayName="Amina"
        avatarUrl={undefined}
        humanFillPercent={62}
        selectedPeriod={selectedPeriod}
        periods={periods}
        trendSeries={trendSeries}
        insights={insights}
        badges={badges}
        recentScans={recentScans}
        categoryBreakdown={categoryBreakdown}
        streakDays={14}
        tips={currentTips}
        onPeriodChange={setSelectedPeriod}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<ProfileDemo />);
