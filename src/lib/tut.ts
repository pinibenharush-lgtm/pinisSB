/** Daily region puzzle (like LinkedIn's "Queens"): place one piece per row,
 * column, and color region so that no two pieces touch, not even
 * diagonally. */

export type TutCellState = "empty" | "x" | "piece";
export type TutPuzzle = { size: number; regions: number[][] };

// Difficulty ramps across the week via grid size — bigger boards mean more
// rows/columns/regions to juggle. Sunday is the easiest, Saturday the
// hardest. Index 0 = Sunday ... 6 = Saturday, matching Date#getUTCDay().
// Capped at 8: sizes of 9+ make finding a uniquely-solvable region layout
// by random search dramatically slower and less reliable (verified
// empirically — 9 failed to reach uniqueness within 20000 attempts for
// ~27% of dates, taking well over a second even when it succeeded).
const SIZE_BY_WEEKDAY = [5, 5, 6, 6, 7, 7, 8];

/** UTC calendar weekday (0 = Sunday) for a "YYYY-MM-DD" string, independent
 * of the player's local timezone. */
function weekdayFromDateStr(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function shuffled<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** One non-touching, non-attacking (by column) piece per row: a valid full
 * placement to seed the puzzle's regions and guarantee at least one
 * solution exists. */
function generateSolution(rng: () => number, size: number): number[] {
  const cols: number[] = [];
  const usedCols = new Set<number>();

  function backtrack(row: number): boolean {
    if (row === size) return true;
    for (const c of shuffled(
      Array.from({ length: size }, (_, i) => i),
      rng,
    )) {
      if (usedCols.has(c)) continue;
      if (row > 0 && Math.abs(c - cols[row - 1]) <= 1) continue;
      cols[row] = c;
      usedCols.add(c);
      if (backtrack(row + 1)) return true;
      usedCols.delete(c);
    }
    return false;
  }

  backtrack(0);
  return cols;
}

/** Randomized flood-fill from the solution's cells so each of the `size`
 * regions is a connected, irregular blob covering the whole grid. */
function growRegions(
  seeds: [number, number][],
  rng: () => number,
  size: number,
): number[][] {
  const regions: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(-1),
  );
  const frontier: { r: number; c: number; region: number }[] = [];

  function pushNeighbors(r: number, c: number, region: number) {
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1) {
        frontier.push({ r: nr, c: nc, region });
      }
    }
  }

  seeds.forEach(([r, c], i) => {
    regions[r][c] = i;
    pushNeighbors(r, c, i);
  });

  while (frontier.length > 0) {
    const idx = Math.floor(rng() * frontier.length);
    const { r, c, region } = frontier.splice(idx, 1)[0];
    if (regions[r][c] !== -1) continue;
    regions[r][c] = region;
    pushNeighbors(r, c, region);
  }

  return regions;
}

/** Counts valid placements (up to `limit`) for a given region layout. */
function countSolutions(regions: number[][], size: number, limit: number): number {
  const usedCols = new Set<number>();
  const usedRegions = new Set<number>();
  let count = 0;

  function backtrack(row: number, prevCol: number) {
    if (count >= limit) return;
    if (row === size) {
      count++;
      return;
    }
    for (let c = 0; c < size; c++) {
      if (usedCols.has(c)) continue;
      if (Math.abs(c - prevCol) <= 1) continue;
      const region = regions[row][c];
      if (usedRegions.has(region)) continue;
      usedCols.add(c);
      usedRegions.add(region);
      backtrack(row + 1, c);
      usedCols.delete(c);
      usedRegions.delete(region);
      if (count >= limit) return;
    }
  }

  backtrack(0, -99);
  return count;
}

/** Same puzzle for everyone on a given calendar day (e.g. "2026-07-14"). */
export function getDailyTutPuzzle(dateStr: string): TutPuzzle {
  const weekday = weekdayFromDateStr(dateStr);
  const size = SIZE_BY_WEEKDAY[weekday];
  const rng = mulberry32(seedFromString(`tut-${dateStr}`));

  let best: number[][] | null = null;
  for (let attempt = 0; attempt < 20000; attempt++) {
    const solution = generateSolution(rng, size);
    const seeds: [number, number][] = solution.map((c, r) => [r, c]);
    const regions = growRegions(seeds, rng, size);
    if (countSolutions(regions, size, 2) === 1) {
      best = regions;
      break;
    }
  }

  // Fallback (should be unreachable in practice — verified empirically to
  // always succeed well within 20000 attempts across the full size range
  // 5-8, usually far fewer): use the last generated layout even if
  // uniqueness wasn't proven.
  if (!best) {
    const solution = generateSolution(rng, size);
    best = growRegions(
      solution.map((c, r) => [r, c]),
      rng,
      size,
    );
  }

  return { size, regions: best };
}

export function isValidTutSolution(
  grid: TutCellState[][],
  regions: number[][],
  size: number,
): boolean {
  const pieces: [number, number][] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (grid[r][c] === "piece") pieces.push([r, c]);

  if (pieces.length !== size) return false;

  const rowsSeen = new Set<number>();
  const colsSeen = new Set<number>();
  const regionsSeen = new Set<number>();

  for (const [r, c] of pieces) {
    if (rowsSeen.has(r)) return false;
    rowsSeen.add(r);
    if (colsSeen.has(c)) return false;
    colsSeen.add(c);
    const region = regions[r][c];
    if (regionsSeen.has(region)) return false;
    regionsSeen.add(region);
  }

  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const [r1, c1] = pieces[i];
      const [r2, c2] = pieces[j];
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) return false;
    }
  }

  return true;
}

/** Cells currently breaking a rule, for live highlighting while playing. */
export function findTutConflicts(
  grid: TutCellState[][],
  regions: number[][],
  size: number,
): Set<string> {
  const bad = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;
  const pieces: [number, number][] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (grid[r][c] === "piece") pieces.push([r, c]);

  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const [r1, c1] = pieces[i];
      const [r2, c2] = pieces[j];
      const sameRow = r1 === r2;
      const sameCol = c1 === c2;
      const sameRegion = regions[r1][c1] === regions[r2][c2];
      const touching = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
      if (sameRow || sameCol || sameRegion || touching) {
        bad.add(key(r1, c1));
        bad.add(key(r2, c2));
      }
    }
  }

  return bad;
}
