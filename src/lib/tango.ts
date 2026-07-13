/** Daily binary logic puzzle (like LinkedIn's "Tango"): fill a 6x6 grid with
 * two cats (0 and 1) so each row/column has 3 of each, no 3 in a row
 * anywhere, and every "=" / "x" link between cells is respected. */

export type Cell = 0 | 1;
export type EdgeType = "eq" | "neq";
export type Edge = { a: [number, number]; b: [number, number]; type: EdgeType };
export type DailyPuzzle = {
  size: number;
  givens: (Cell | null)[][];
  edges: Edge[];
};

const SIZE = 6;

// Difficulty ramps across the week: Sunday is the easiest (most givens,
// fewest constraint links), Saturday the hardest (fewest givens, most
// links). Index 0 = Sunday ... 6 = Saturday, matching Date#getUTCDay().
const GIVENS_BY_WEEKDAY = [14, 13, 12, 11, 10, 9, 7];
const EDGES_BY_WEEKDAY = [5, 6, 6, 7, 7, 8, 9];

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

function emptyGrid(size: number): (Cell | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

/** Randomized backtracking fill of a full, rule-valid solution. */
function generateSolution(rng: () => number, size: number): Cell[][] {
  const grid: (Cell | null)[][] = emptyGrid(size);
  const half = size / 2;

  function isValid(r: number, c: number, v: Cell): boolean {
    if (c >= 2 && grid[r][c - 1] === v && grid[r][c - 2] === v) return false;
    if (r >= 2 && grid[r - 1][c] === v && grid[r - 2][c] === v) return false;

    let rowCount = 0;
    for (let cc = 0; cc < c; cc++) if (grid[r][cc] === v) rowCount++;
    if (rowCount >= half) return false;

    let colCount = 0;
    for (let rr = 0; rr < r; rr++) if (grid[rr][c] === v) colCount++;
    if (colCount >= half) return false;

    return true;
  }

  function backtrack(r: number, c: number): boolean {
    if (r === size) return true;
    const [nr, nc] = c === size - 1 ? [r + 1, 0] : [r, c + 1];
    const order: Cell[] = rng() < 0.5 ? [0, 1] : [1, 0];
    for (const v of order) {
      if (isValid(r, c, v)) {
        grid[r][c] = v;
        if (backtrack(nr, nc)) return true;
        grid[r][c] = null;
      }
    }
    return false;
  }

  backtrack(0, 0);
  return grid as Cell[][];
}

function pickEdges(
  solution: Cell[][],
  rng: () => number,
  size: number,
  count: number,
): Edge[] {
  const allPairs: [[number, number], [number, number]][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c < size - 1) allPairs.push([[r, c], [r, c + 1]]);
      if (r < size - 1) allPairs.push([[r, c], [r + 1, c]]);
    }
  }
  for (let i = allPairs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allPairs[i], allPairs[j]] = [allPairs[j], allPairs[i]];
  }
  return allPairs.slice(0, count).map(([a, b]) => ({
    a,
    b,
    type: (solution[a[0]][a[1]] === solution[b[0]][b[1]]
      ? "eq"
      : "neq") as EdgeType,
  }));
}

function buildEdgeMap(edges: Edge[], size: number) {
  const map: { r: number; c: number; type: EdgeType }[][][] = Array.from(
    { length: size },
    () => Array.from({ length: size }, () => []),
  );
  for (const e of edges) {
    map[e.a[0]][e.a[1]].push({ r: e.b[0], c: e.b[1], type: e.type });
    map[e.b[0]][e.b[1]].push({ r: e.a[0], c: e.a[1], type: e.type });
  }
  return map;
}

/** Counts solutions (up to `limit`) for a puzzle given fixed givens + edges. */
function countSolutions(
  givens: (Cell | null)[][],
  edges: Edge[],
  size: number,
  limit: number,
): number {
  const grid = givens.map((row) => row.slice());
  const edgeMap = buildEdgeMap(edges, size);
  const half = size / 2;
  let count = 0;

  function isValid(r: number, c: number, v: Cell): boolean {
    if (c >= 2 && grid[r][c - 1] === v && grid[r][c - 2] === v) return false;
    if (c >= 1 && c < size - 1 && grid[r][c - 1] === v && grid[r][c + 1] === v)
      return false;
    if (c <= size - 3 && grid[r][c + 1] === v && grid[r][c + 2] === v)
      return false;

    if (r >= 2 && grid[r - 1][c] === v && grid[r - 2][c] === v) return false;
    if (r >= 1 && r < size - 1 && grid[r - 1][c] === v && grid[r + 1][c] === v)
      return false;
    if (r <= size - 3 && grid[r + 1][c] === v && grid[r + 2][c] === v)
      return false;

    let rowCount = 0;
    for (let cc = 0; cc < size; cc++) if (cc !== c && grid[r][cc] === v) rowCount++;
    if (rowCount >= half) return false;

    let colCount = 0;
    for (let rr = 0; rr < size; rr++) if (rr !== r && grid[rr][c] === v) colCount++;
    if (colCount >= half) return false;

    for (const n of edgeMap[r][c]) {
      const other = grid[n.r][n.c];
      if (other == null) continue;
      if (n.type === "eq" && other !== v) return false;
      if (n.type === "neq" && other === v) return false;
    }

    return true;
  }

  function findEmpty(): [number, number] | null {
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++) if (grid[r][c] == null) return [r, c];
    return null;
  }

  function backtrack() {
    if (count >= limit) return;
    const pos = findEmpty();
    if (!pos) {
      count++;
      return;
    }
    const [r, c] = pos;
    for (const v of [0, 1] as Cell[]) {
      if (isValid(r, c, v)) {
        grid[r][c] = v;
        backtrack();
        grid[r][c] = null;
        if (count >= limit) return;
      }
    }
  }

  backtrack();
  return count;
}

function buildUniqueGivens(
  solution: Cell[][],
  edges: Edge[],
  rng: () => number,
  size: number,
  targetGivens: number,
): (Cell | null)[][] {
  const givens = emptyGrid(size);
  const positions: [number, number][] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) positions.push([r, c]);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let idx = 0;
  while (countSolutions(givens, edges, size, 2) !== 1) {
    if (idx >= positions.length) break;
    const [r, c] = positions[idx++];
    givens[r][c] = solution[r][c];
  }

  // Trim down towards a target given count (not a fully-minimal/expert
  // puzzle): drop givens one at a time as long as the puzzle stays uniquely
  // solvable AND we're still above the target. The target itself varies by
  // day of week so difficulty ramps up toward the weekend.
  const filled = positions.filter(([r, c]) => givens[r][c] != null);
  for (let i = filled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [filled[i], filled[j]] = [filled[j], filled[i]];
  }
  let givenCount = filled.length;
  for (const [r, c] of filled) {
    if (givenCount <= targetGivens) break;
    const backup = givens[r][c];
    givens[r][c] = null;
    if (countSolutions(givens, edges, size, 2) === 1) {
      givenCount--;
    } else {
      givens[r][c] = backup;
    }
  }

  return givens;
}

/** Same puzzle for everyone on a given calendar day (e.g. "2026-07-14"). */
export function getDailyPuzzle(dateStr: string): DailyPuzzle {
  const weekday = weekdayFromDateStr(dateStr);
  const rng = mulberry32(seedFromString(dateStr));
  const solution = generateSolution(rng, SIZE);
  const edges = pickEdges(solution, rng, SIZE, EDGES_BY_WEEKDAY[weekday]);
  const givens = buildUniqueGivens(
    solution,
    edges,
    rng,
    SIZE,
    GIVENS_BY_WEEKDAY[weekday],
  );
  return { size: SIZE, givens, edges };
}

export function isComplete(grid: (Cell | null)[][]): boolean {
  return grid.every((row) => row.every((v) => v != null));
}

/** Whether a fully-filled grid satisfies every rule (i.e. is the/a solution). */
export function isValidSolution(
  grid: (Cell | null)[][],
  edges: Edge[],
  size: number,
): boolean {
  const half = size / 2;
  if (!isComplete(grid)) return false;

  for (let r = 0; r < size; r++) {
    let zeros = 0;
    for (let c = 0; c < size; c++) if (grid[r][c] === 0) zeros++;
    if (zeros !== half) return false;
  }
  for (let c = 0; c < size; c++) {
    let zeros = 0;
    for (let r = 0; r < size; r++) if (grid[r][c] === 0) zeros++;
    if (zeros !== half) return false;
  }
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size - 2; c++)
      if (grid[r][c] === grid[r][c + 1] && grid[r][c + 1] === grid[r][c + 2])
        return false;
  for (let c = 0; c < size; c++)
    for (let r = 0; r < size - 2; r++)
      if (grid[r][c] === grid[r + 1][c] && grid[r + 1][c] === grid[r + 2][c])
        return false;
  for (const e of edges) {
    const va = grid[e.a[0]][e.a[1]];
    const vb = grid[e.b[0]][e.b[1]];
    if (e.type === "eq" && va !== vb) return false;
    if (e.type === "neq" && va === vb) return false;
  }
  return true;
}

/** Cells currently breaking a rule, for live highlighting while playing. */
export function findConflicts(
  grid: (Cell | null)[][],
  edges: Edge[],
  size: number,
): Set<string> {
  const half = size / 2;
  const bad = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  for (let r = 0; r < size; r++) {
    const idx: Record<Cell, number[]> = { 0: [], 1: [] };
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (v != null) idx[v].push(c);
    }
    for (const v of [0, 1] as Cell[])
      if (idx[v].length > half) idx[v].forEach((c) => bad.add(key(r, c)));
  }
  for (let c = 0; c < size; c++) {
    const idx: Record<Cell, number[]> = { 0: [], 1: [] };
    for (let r = 0; r < size; r++) {
      const v = grid[r][c];
      if (v != null) idx[v].push(r);
    }
    for (const v of [0, 1] as Cell[])
      if (idx[v].length > half) idx[v].forEach((r) => bad.add(key(r, c)));
  }

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size - 2; c++) {
      const a = grid[r][c],
        b = grid[r][c + 1],
        d = grid[r][c + 2];
      if (a != null && a === b && b === d) {
        bad.add(key(r, c));
        bad.add(key(r, c + 1));
        bad.add(key(r, c + 2));
      }
    }
  for (let c = 0; c < size; c++)
    for (let r = 0; r < size - 2; r++) {
      const a = grid[r][c],
        b = grid[r + 1][c],
        d = grid[r + 2][c];
      if (a != null && a === b && b === d) {
        bad.add(key(r, c));
        bad.add(key(r + 1, c));
        bad.add(key(r + 2, c));
      }
    }

  for (const e of edges) {
    const va = grid[e.a[0]][e.a[1]];
    const vb = grid[e.b[0]][e.b[1]];
    if (va != null && vb != null) {
      if (e.type === "eq" && va !== vb) {
        bad.add(key(...e.a));
        bad.add(key(...e.b));
      }
      if (e.type === "neq" && va === vb) {
        bad.add(key(...e.a));
        bad.add(key(...e.b));
      }
    }
  }

  return bad;
}
