// Seeded random numbers: the same seed always gives the same sequence (mulberry32).
export function mulberry32(seed) {
  let a = seed | 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed) {
  const next = mulberry32(seed);
  return {
    next,
    /** Whole number from min to max, both included. */
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (list) => list[Math.floor(next() * list.length)],
    sign: () => (next() < 0.5 ? -1 : 1),
    chance: (p = 0.5) => next() < p,
  };
}

/** A fresh seed that is safe to store in JSON. */
export function newSeed() {
  return Math.floor(Math.random() * 2147483647);
}
