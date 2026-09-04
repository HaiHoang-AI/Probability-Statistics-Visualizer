// Mathematical utility functions for Probability & Statistics Visualizer

// Standard Normal PDF
export function normalPdf(x: number, mean: number = 0, std: number = 1): number {
  if (std <= 0) return 0;
  const z = (x - mean) / std;
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

// Standard Normal CDF using Error Function approximation
export function normalCdf(x: number, mean: number = 0, std: number = 1): number {
  if (std <= 0) return x < mean ? 0 : 1;
  const z = (x - mean) / (std * Math.sqrt(2));
  // erf approximation
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-z * z);
  const sign = z >= 0 ? 1 : -1;
  return 0.5 * (1 + sign * erf);
}

// Inverse standard normal (quantile) approximation (Abramowitz & Stegun)
export function standardNormalInv(p: number): number {
  if (p <= 0) return -6;
  if (p >= 1) return 6;
  if (p < 0.5) {
    return -rationalApproximation(Math.sqrt(-2.0 * Math.log(p)));
  } else {
    return rationalApproximation(Math.sqrt(-2.0 * Math.log(1 - p)));
  }
}

function rationalApproximation(t: number): number {
  const c = [2.515517, 0.802853, 0.010328];
  const d = [1.432788, 0.189269, 0.001308];
  return t - ((c[2] * t + c[1]) * t + c[0]) / (((d[2] * t + d[1]) * t + d[0]) * t + 1.0);
}

// Lanczos approximation for log-gamma function
export function logGamma(z: number): number {
  const p = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
  }
  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) {
    x += p[i] / (z + i + 1);
  }
  const t = z + p.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

// Student's t distribution PDF
export function studentTPdf(t: number, nu: number): number {
  if (nu <= 0) return 0;
  const factor = Math.exp(logGamma((nu + 1) / 2) - logGamma(nu / 2)) / (Math.sqrt(nu * Math.PI));
  return factor * Math.pow(1 + (t * t) / nu, -(nu + 1) / 2);
}

// Beta distribution PDF
export function betaPdf(x: number, a: number, b: number): number {
  if (x <= 0 || x >= 1 || a <= 0 || b <= 0) return 0;
  const logBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const logPdf = (a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logBeta;
  return Math.exp(logPdf);
}

// Combinations (n choose k)
export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let c = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    c = (c * (n - i + 1)) / i;
  }
  return c;
}

// Binomial PMF
export function binomialPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n || p < 0 || p > 1) return 0;
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Poisson PMF
export function poissonPmf(k: number, lambda: number): number {
  if (k < 0 || lambda <= 0) return 0;
  // use log to prevent overflow
  let logP = -lambda + k * Math.log(lambda);
  for (let i = 2; i <= k; i++) {
    logP -= Math.log(i);
  }
  return Math.exp(logP);
}

// Box-Muller transform for generating standard normal random numbers
export function randomNormal(mean = 0, std = 1): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * std;
}

// Format number with clean precision
export function fmt(num: number, digits: number = 2): string {
  if (isNaN(num)) return '0.00';
  return Number(num.toFixed(digits)).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}
