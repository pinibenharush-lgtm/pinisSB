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

  const size = puzzle.size;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-stone-500 tabular-nums">
        ⏱ {formatSeconds(elapsed)}
      </p>

      <div className="w-full overflow-x-auto">
        <div
          className="grid select-none mx-auto w-max border-2 border-stone-500"
          style={{
            gridTemplateColumns: `repeat(${size}, ${CELL_PX}px)`,
            gridTemplateRows: `repeat(${size}, ${CELL_PX}px)`,
          }}
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
                  onClick={() => cycle(r, c)}
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
          Tap a cell to cycle: empty → ✕ → 🍓 → empty
        </p>
      )}
    </div>
  );
}
