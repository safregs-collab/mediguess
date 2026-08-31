/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Guarantees reproducible sequences for the same seed string.
 * Used by the case generator so that every (crId + scenario + seed)
 * combination always produces the identical case.
 */
export class SeededRng {
  private state: number;

  constructor(seed: string) {
    // Simple string hash → 32-bit integer seed
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
      h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    this.state = (h >>> 0) || 1;
  }

  /** Return float in [0, 1) */
  next(): number {
    let t = (this.state += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max) */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /** Pick random element from array */
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length)];
  }

  /** Pick n unique elements ( Fisher-Yates slice ) */
  pickN<T>(arr: T[], n: number): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  }

  /** Gaussian (Box-Muller) with mean/stdDev */
  gaussian(mean: number, stdDev: number): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /** Lognormal: sample normal then exp */
  lognormal(mean: number, stdDev: number): number {
    // mean/stdDev are of the underlying normal distribution
    const v = this.gaussian(mean, stdDev);
    return Math.exp(v);
  }

  /** Uniform between min and max */
  uniform(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Boolean with given probability */
  chance(p: number): boolean {
    return this.next() < p;
  }
}
