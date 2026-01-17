/**
 * Carbon impact analysis utilities
 * Based on lifetime carbon footprint equivalent
 * Accounts for full lifecycle: production, usage, and disposal
 */

export interface CarbonImpactMetrics {
  equivalentDays: number; // Equivalent days of ideal carbon footprint
  equivalentWeeks: number; // Equivalent weeks of ideal carbon footprint
  equivalentMonths: number; // Equivalent months of ideal carbon footprint
  annualPercent: number; // Percentage of ideal annual carbon footprint
  lifetimePercent: number; // Percentage of ideal lifetime carbon footprint
  label: string; // e.g., "Low Impact", "High Impact"
  color: string; // Tailwind color class
  description: string; // e.g., "Equivalent to 8.6 days of ideal carbon footprint"
  severity: 'excellent' | 'good' | 'moderate' | 'high' | 'very-high' | 'extreme';
}

/**
 * Ideal carbon footprint targets
 * - Daily: 11kg CO2e/day (based on 4 tons/year target)
 * - Annual: 4000kg CO2e/year (4 tons)
 * - Lifetime: 320,000kg CO2e (4 tons/year × 80 years)
 */
const IDEAL_DAILY_FOOTPRINT = 11000; // grams CO2e per day
const IDEAL_ANNUAL_FOOTPRINT = 4000000; // grams CO2e per year (4 tons)
const IDEAL_LIFETIME_FOOTPRINT = 320000000; // grams CO2e per lifetime (80 years)

/**
 * Calculate equivalent days, weeks, months based on carbon value
 */
function calculateEquivalents(carbonValue: number): {
  days: number;
  weeks: number;
  months: number;
  annualPercent: number;
  lifetimePercent: number;
} {
  const days = carbonValue / IDEAL_DAILY_FOOTPRINT;
  const weeks = days / 7;
  const months = days / 30.44; // Average days per month
  const annualPercent = (carbonValue / IDEAL_ANNUAL_FOOTPRINT) * 100;
  const lifetimePercent = (carbonValue / IDEAL_LIFETIME_FOOTPRINT) * 100;
  
  return { days, weeks, months, annualPercent, lifetimePercent };
}

/**
 * Format equivalent time description
 */
function formatTimeDescription(days: number, weeks: number, months: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    if (hours < 1) {
      return `Less than 1 hour of ideal carbon footprint`;
    }
    return `Equivalent to ${hours} ${hours === 1 ? 'hour' : 'hours'} of ideal carbon footprint`;
  } else if (days < 7) {
    return `Equivalent to ${days.toFixed(1)} ${days === 1 ? 'day' : 'days'} of ideal carbon footprint`;
  } else if (weeks < 4) {
    return `Equivalent to ${weeks.toFixed(1)} ${weeks === 1 ? 'week' : 'weeks'} of ideal carbon footprint`;
  } else if (months < 12) {
    return `Equivalent to ${months.toFixed(1)} ${months === 1 ? 'month' : 'months'} of ideal carbon footprint`;
  } else {
    const years = months / 12;
    return `Equivalent to ${years.toFixed(1)} ${years === 1 ? 'year' : 'years'} of ideal carbon footprint`;
  }
}

/**
 * Get impact label and color based on equivalent days
 */
function getImpactLabel(days: number, annualPercent: number): { 
  label: string; 
  color: string; 
  description: string;
  severity: 'excellent' | 'good' | 'moderate' | 'high' | 'very-high' | 'extreme';
} {
  if (days < 0.1) {
    return {
      label: 'Minimal Impact',
      color: 'bg-emerald-500',
      description: `Less than 2.4 hours of ideal carbon footprint`,
      severity: 'excellent'
    };
  } else if (days < 1) {
    return {
      label: 'Low Impact',
      color: 'bg-green-500',
      description: `Equivalent to ${(days * 24).toFixed(0)} hours of ideal carbon footprint`,
      severity: 'good'
    };
  } else if (days < 7) {
    return {
      label: 'Moderate Impact',
      color: 'bg-yellow-500',
      description: `Equivalent to ${days.toFixed(1)} ${days === 1 ? 'day' : 'days'} of ideal carbon footprint`,
      severity: 'moderate'
    };
  } else if (days < 30) {
    return {
      label: 'High Impact',
      color: 'bg-orange-500',
      description: `Equivalent to ${(days / 7).toFixed(1)} ${days < 14 ? 'weeks' : 'weeks'} of ideal carbon footprint (${annualPercent.toFixed(1)}% of annual budget)`,
      severity: 'high'
    };
  } else if (days < 90) {
    return {
      label: 'Very High Impact',
      color: 'bg-red-500',
      description: `Equivalent to ${(days / 30.44).toFixed(1)} ${days < 60 ? 'months' : 'months'} of ideal carbon footprint (${annualPercent.toFixed(1)}% of annual budget)`,
      severity: 'very-high'
    };
  } else {
    return {
      label: 'Extreme Impact',
      color: 'bg-red-700',
      description: `Equivalent to ${(days / 365).toFixed(1)} ${days < 730 ? 'years' : 'years'} of ideal carbon footprint (${annualPercent.toFixed(1)}% of annual budget)`,
      severity: 'extreme'
    };
  }
}

/**
 * Generate bell curve data points for visualization
 * Shows distribution of typical product carbon footprints in kg
 * Most products fall in the 0-50kg range
 */
export function generateBellCurveData(
  mean: number, 
  stdDev: number, 
  min: number, 
  max: number, 
  points: number = 100
): Array<{ x: number; y: number }> {
  const data: Array<{ x: number; y: number }> = [];
  const step = (max - min) / points;
  
  for (let i = 0; i <= points; i++) {
    const x = min + (i * step);
    // Normal distribution formula: y = (1 / (σ * √(2π))) * e^(-0.5 * ((x - μ) / σ)²)
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    data.push({ x, y });
  }
  
  return data;
}

/**
 * Get comprehensive carbon impact metrics based on lifetime footprint
 */
export function getCarbonImpactMetrics(
  carbonValue: number
): CarbonImpactMetrics {
  const equivalents = calculateEquivalents(carbonValue);
  const impactInfo = getImpactLabel(equivalents.days, equivalents.annualPercent);
  
  return {
    equivalentDays: equivalents.days,
    equivalentWeeks: equivalents.weeks,
    equivalentMonths: equivalents.months,
    annualPercent: equivalents.annualPercent,
    lifetimePercent: equivalents.lifetimePercent,
    label: impactInfo.label,
    color: impactInfo.color,
    description: impactInfo.description,
    severity: impactInfo.severity
  };
}

/**
 * Get ideal footprint constants
 */
export function getIdealDailyFootprint(): number {
  return IDEAL_DAILY_FOOTPRINT;
}

export function getIdealAnnualFootprint(): number {
  return IDEAL_ANNUAL_FOOTPRINT;
}

export function getIdealLifetimeFootprint(): number {
  return IDEAL_LIFETIME_FOOTPRINT;
}
