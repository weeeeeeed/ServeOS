/**
 * Global Currency Configuration & Utilities for BitePoint SaaS
 * Standardized to Indian Rupees (₹ / INR)
 */

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

export interface FormatCurrencyOptions {
  showCents?: boolean;
  compact?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Formats a numeric price or revenue value into Indian Rupees (₹)
 * Example: 199 -> "₹199", 48290.5 -> "₹48,290.50", 120000 (compact) -> "₹1.2L"
 */
export function formatCurrency(
  amount: number | null | undefined,
  options?: FormatCurrencyOptions
): string {
  const val = Number(amount) || 0;
  const showCents = options?.showCents ?? (val % 1 !== 0);

  if (options?.compact && Math.abs(val) >= 1000) {
    if (Math.abs(val) >= 10000000) {
      return `${CURRENCY_SYMBOL}${(val / 10000000).toFixed(1)}Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `${CURRENCY_SYMBOL}${(val / 100000).toFixed(1)}L`;
    }
    if (Math.abs(val) >= 1000) {
      return `${CURRENCY_SYMBOL}${(val / 1000).toFixed(1)}k`;
    }
  }

  // Format using Indian locale grouping standard (en-IN)
  const formattedNumber = showCents
    ? val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return `${CURRENCY_SYMBOL}${formattedNumber}`;
}

export function formatPrice(amount: number): string {
  return formatCurrency(amount);
}
