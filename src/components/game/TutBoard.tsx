"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TutCellState, TutPuzzle, findTutConflicts, isValidTutSolution } from "@/lib/tut";
import { formatSeconds } from "@/lib/format";

const CELL_PX = 38;

const REGION_COLORS = [
  "#FDE68A", // amber
  "#BFDBFE", // blue
  "#BBF7D0", // green
  "#FBCFE8", // pink
  "#DDD6FE", // violet
  "#FED7AA", // orange
  "#A5F3FC", // cyan
  "#E5E7EB", // gray (fallback for larger sizes)
];

export default function TutBoard({
  puzzle,
  onSolved,
}: {
  puzzle: TutPuzzle;
  onSolved: (seconds: number) => void;
}) {
  const [grid, setGrid] = useState<TutCellState[][]>(() =>
    Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill("empty")),
  );
  const [solved, setSolved] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const solvedRef = useRef(false);

  useEffect(() => {
    if (solved) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [solved, startedAt]);

  const conflicts = useMemo(
    () => findTutConflicts(grid, puzzle.regions, puzzle.size),
    [grid, puzzle],
  );

  function cycle(r: number, c: number) {
    if (solvedRef.current) return;

    const next = grid.map((row) => row.slice());
    const cur = next[r][c];
    next[r][c] = cur === "empty" ? "x" : cur === "x" ? "piece" : "empty";
    setGrid(next);

    if (isValidTutSolution(next, puzzle.regions, puzzle.size)) {
      solvedRef.current = true;
      // eslint-disable-next-line react-hooks/purity -- runs inside the click handler, not during render
      const seconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
      setElapsed(seconds);
      setSolved(true);
      onSolved(seconds);
    }
  }

  /** Marks a single cell "x" without cycling — used while dragging across
   * several cells, so passing over the same cell twice doesn't advance it
   * further. Only touches cells that are still empty (never overwrites an
   * "x" or a placed piece). */
  function paintX(r: number, c: number) {
    setGrid((g) => {
      if (g[r][c] !== "empty") return g;
      const next = g.map((row) => row.slice());
      next[r][c] = "x";
      return next;
    });
  }

  function resetBoard() {
    if (solvedRef.current) return;
    setGrid(Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill("empty")));
  }

  // Drag-to-mark: press on a cell (normal tap/cycle), then drag across
  // other cells to mark them "x" in one stroke, instead of tapping each
  // one individually. Uses elementFromPoint rather than per-cell hover
  // events, since touch browsers implicitly capture the pointer to the
  // cell where the drag started and won't fire hover events on the cells
  // passed over otherwise.
  const draggingRef = useRef(false);
  const lastPaintedRef = useRef<string | null>(null);

  function cellAtPoint(x: number, y: number): { r: number; c: number } | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const cellEl = el?.closest('[data-testid="tut-cell"]') as HTMLElement | null;
    if (!cellEl) return null;
    const r = Number(cellEl.dataset.r);
    const c = Number(cellEl.dataset.c);
    if (Number.isNaN(r) || Number.isNaN(c)) return null;
    return { r, c };
  }

  function handlePointerDown(r: number, c: number, e: React.PointerEvent) {
    if (solvedRef.current) return;
    e.preventDefault();
    draggingRef.current = true;
    lastPaintedRef.current = `${r},${c}`;
    cycle(r, c);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingRef.current || solvedRef.current) return;
    const cell = cellAtPoint(e.clientX, e.clientY);
    if (!cell) return;
    const key = `${cell.r},${cell.c}`;
    if (key === lastPaintedRef.current) return;
    lastPaintedRef.current = key;
    paintX(cell.r, cell.c);
  }

  function handlePointerUp() {
    draggingRef.current = false;
    lastPaintedRef.current = null;
  }

  const size = puzzle.size;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-center gap-3">
        <p className="text-sm font-semibold text-stone-500 tabular-nums">
          ⏱ {formatSeconds(elapsed)}
        </p>
        {!solved && (
          <button
            type="button"
            onClick={resetBoard}
            className="text-xs font-medium text-aegean-700"
          >
            ↺ Reset
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <div
          className="grid select-none mx-auto w-max border-2 border-stone-500"
          style={{
            gridTemplateColumns: `repeat(${size}, ${CELL_PX}px)`,
            gridTemplateRows: `repeat(${size}, ${CELL_PX}px)`,
            touchAction: "none",
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {grid.map((row, r) =>
            row.map((val, c) => {
              const region = puzzle.regions[r][c];
              const isConflict = conflicts.has(`${r},${c}`);
              const borderTop = r === 0 || puzzle.regions[r - 1][c] !== region;
              const borderLeft = c === 0 || puzzle.regions[r][c - 1] !== region;
              const borderBottom =
                r === size - 1 || puzzle.regions[r + 1][c] !== region;
              const borderRight =
                c === size - 1 || puzzle.regions[r][c + 1] !== region;

              return (
                <button
                  key={`cell-${r}-${c}`}
                  type="button"
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  disabled={solved}
                  data-testid="tut-cell"
                  data-r={r}
                  data-c={c}
                  style={{
                    backgroundColor: REGION_COLORS[region % REGION_COLORS.length],
                    borderTopWidth: borderTop ? 2 : 1,
                    borderLeftWidth: borderLeft ? 2 : 1,
                    borderBottomWidth: borderBottom ? 2 : 1,
                    borderRightWidth: borderRight ? 2 : 1,
                  }}
                  className={`flex items-center justify-center border-stone-500/60 text-lg ${
                    isConflict ? "ring-2 ring-inset ring-red-500" : ""
                  }`}
                >
                  {val === "piece" ? (
                    "🍓"
                  ) : val === "x" ? (
                    <span className="text-sm text-stone-500">✕</span>
                  ) : (
                    ""
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {solved ? (
        <p className="text-sm font-semibold text-emerald-600">
          Solved in {formatSeconds(elapsed)}! 🎉
        </p>
      ) : (
        <p className="text-xs text-stone-400">
          Tap a cell to cycle: empty → ✕ → 🍓 → empty. Drag across cells to
          mark several ✕ at once.
        </p>
      )}
    </div>
  );
}
