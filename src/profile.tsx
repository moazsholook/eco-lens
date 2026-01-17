import { createRoot } from 'react-dom/client';
import './styles/index.css';
import {
  ProfileDashboard,
  type UsageMetrics,
  type UsageInsight,
  type UsagePeriod,
  type UsageTrendPoint,
} from './app/components/ProfileDashboard';

const periods: Record<UsagePeriod, UsageMetrics> = {
  weekly: {
    label: 'Weekly',
    totalScans: 12,
    footprintKg: 5.6,
    improvementPercent: 8,
    topCategory: 'Food',
    topItem: 'Takeout containers',
  },
  monthly: {
    label: 'Monthly',
    totalScans: 46,
    footprintKg: 22.4,
    improvementPercent: 14,
    topCategory: 'Fashion',
    topItem: 'Cotton T-shirts',
  },
  yearly: {
    label: 'Yearly',
    totalScans: 410,
    footprintKg: 198.2,
    improvementPercent: 21,
    topCategory: 'Electronics',
    topItem: 'Phone upgrades',
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

function ProfileDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <ProfileDashboard
        displayName="Amina"
        humanFillPercent={62}
        selectedPeriod="monthly"
        periods={periods}
        trendSeries={trendSeries}
        insights={insights}
      />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<ProfileDemo />);
