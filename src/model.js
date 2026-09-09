export function mean(values) {
  if (!Array.isArray(values) || values.length === 0) return NaN;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function graphStats(records) {
  const values = records.map((record) => record.waitSeconds);
  return {
    count: values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    mean: round(mean(values), 1),
    change: values.at(-1) - values[0]
  };
}

export function createPopulation() {
  const blocks = [
    { name: 'Opening hour', base: 2.8 },
    { name: 'Mid-session', base: 3.2 },
    { name: 'Late session', base: 3.6 },
    { name: 'Closing hour', base: 4.2 }
  ];
  const offsets = [-0.4, -0.2, 0, 0.1, 0.2, 0.3];
  const population = [];
  for (const block of blocks) {
    for (let i = 0; i < 60; i += 1) {
      const raw = block.base + offsets[i % offsets.length];
      population.push({
        id: `${block.name.slice(0, 2).toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
        timeBlock: block.name,
        rating: Math.max(1, Math.min(5, round(raw, 1)))
      });
    }
  }
  return population;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(items, random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function drawSample(population, method, size, seed = 2026) {
  const random = mulberry32(seed);
  if (method === 'closing-only') {
    const frame = population.filter((record) => record.timeBlock === 'Closing hour');
    return shuffled(frame, random).slice(0, Math.min(size, frame.length));
  }
  if (method === 'all-window-stratified') {
    const blocks = [...new Set(population.map((record) => record.timeBlock))];
    const base = Math.floor(size / blocks.length);
    let remainder = size % blocks.length;
    const sample = [];
    for (const block of blocks) {
      const target = base + (remainder > 0 ? 1 : 0);
      remainder -= remainder > 0 ? 1 : 0;
      const stratum = population.filter((record) => record.timeBlock === block);
      sample.push(...shuffled(stratum, random).slice(0, target));
    }
    return sample;
  }
  throw new Error(`Unknown sampling method: ${method}`);
}

export function summarizeRatings(records) {
  const counts = {};
  for (const record of records) counts[record.timeBlock] = (counts[record.timeBlock] || 0) + 1;
  return {
    size: records.length,
    mean: round(mean(records.map((record) => record.rating)), 2),
    composition: counts
  };
}

export function createCorrelationData() {
  const groups = [
    { difficulty: 'Easy', hintBase: 0, timeBase: 100 },
    { difficulty: 'Medium', hintBase: 3, timeBase: 190 },
    { difficulty: 'Hard', hintBase: 6, timeBase: 280 }
  ];
  const data = [];
  for (const group of groups) {
    for (let i = 0; i < 15; i += 1) {
      const band = i % 5;
      const noise = ((i * 7) % 11) - 5;
      data.push({
        session: `${group.difficulty[0]}-${String(i + 1).padStart(2, '0')}`,
        difficulty: group.difficulty,
        hints: group.hintBase + band,
        seconds: group.timeBase - band * 5 + noise
      });
    }
  }
  return data;
}

export function pearson(records, xKey = 'hints', yKey = 'seconds') {
  const xs = records.map((r) => r[xKey]);
  const ys = records.map((r) => r[yKey]);
  const xMean = mean(xs);
  const yMean = mean(ys);
  let numerator = 0;
  let xDenom = 0;
  let yDenom = 0;
  for (let i = 0; i < records.length; i += 1) {
    const dx = xs[i] - xMean;
    const dy = ys[i] - yMean;
    numerator += dx * dy;
    xDenom += dx ** 2;
    yDenom += dy ** 2;
  }
  return round(numerator / Math.sqrt(xDenom * yDenom), 3);
}

export function correlationSummary(records) {
  const groups = [...new Set(records.map((record) => record.difficulty))];
  const byDifficulty = Object.fromEntries(groups.map((group) => [
    group,
    pearson(records.filter((record) => record.difficulty === group))
  ]));
  return { overall: pearson(records), byDifficulty };
}
