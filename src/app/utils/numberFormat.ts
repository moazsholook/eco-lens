/**
 * Formats a number with dynamic decimal places based on its magnitude
 * - Values < 100: 2 decimal places (default)
 * - Values < 1000: 1 decimal place
 * - Values >= 1000: 0 decimal places (whole numbers)
 * 
 * @param value - The number to format
 * @param defaultDecimals - Override default decimal places (default: 2)
 * @returns Formatted string with appropriate decimal places
 */
export function formatNumber(value: number, defaultDecimals: number = 2): string {
  if (value === 0 || isNaN(value) || !isFinite(value)) {
    return value.toFixed(defaultDecimals);
  }

  const absValue = Math.abs(value);

  // Determine decimal places based on magnitude
  let decimals: number;
  if (absValue < 100) {
    decimals = defaultDecimals; // Default to 2 for small values
  } else if (absValue < 1000) {
    decimals = 1; // 1 decimal for medium values
  } else {
    decimals = 0; // Whole numbers for large values
  }

  return value.toFixed(decimals);
}

/**
 * Formats carbon footprint value with appropriate unit (g or kg)
 * 
 * @param value - Carbon value in grams
 * @returns Formatted string with unit (e.g., "82.8g CO₂e" or "2.5kg CO₂e")
 */
export function formatCarbonFootprint(value: number): string {
  if (value < 1000) {
    return `${formatNumber(value)}g CO₂e`;
  }
  const kg = value / 1000;
  return `~${formatNumber(kg, 1)}kg CO₂e`;
}
