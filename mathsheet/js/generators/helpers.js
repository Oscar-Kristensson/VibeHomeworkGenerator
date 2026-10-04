// Shared helpers that keep generated math free of ugly cases ("1x", "+ -3", "(-3)x", ...).
export const gcd = (a, b) => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

/** Wraps negative numbers in parentheses: 3 -> "3", -3 -> "(-3)". */
export const paren = (n) => (n < 0 ? `(${n})` : String(n));

/** Coefficient in front of a variable: 1 -> "", -1 -> "-", 5 -> "5". */
export const coef = (c) => (c === 1 ? '' : c === -1 ? '-' : String(c));
export const linear = (c, v = 'x') => `${coef(c)}${v}`;

/** "first + b" or "first - |b|"; nothing is added when b is 0. */
export function withConstant(first, b) {
  if (b === 0) return first;
  return b > 0 ? `${first} + ${b}` : `${first} - ${-b}`;
}

export const frac = (n, d) => `\\dfrac{${n}}{${d}}`;

/** Fraction in lowest terms, or a whole number when the denominator is 1. */
export function fracOrInt(n, d) {
  const g = gcd(n, d);
  const p = n / g;
  const q = d / g;
  return q === 1 ? String(p) : frac(p, q);
}

/**
 * Number range from params.min / params.max. Values are at least 1 so generators never produce 0,
 * and a reversed range is repaired instead of failing.
 */
export function bounds(params) {
  let lo = Math.max(1, Math.min(params.min, params.max));
  const hi = Math.max(lo, params.min, params.max);
  return { lo, hi };
}

export const math = (tex) => `$${tex}$`;
