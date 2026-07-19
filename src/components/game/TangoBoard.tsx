"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Cell, DailyPuzzle, findConflicts, isValidSolution } from "@/lib/tango";
import { formatSeconds } from "@/lib/format";

const CELL_PX = 40;
const GAP_PX = 13;

export default function TangoBoard({
  puzzle,
  onSolved,
}: {
  puzzle: DailyPuzzle;
  onSolved: (seconds: number) => void;
}) {
  const [grid, setGrid] = useState<(Cell | null)[][]>(() =>
    puzzle.givens.map((row) => row.slice()),
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
    () => findConflicts(grid, puzzle.edges, puzzle.size),
    [grid, puzzle],
  );

  const edgeByPair = useMemo(() => {
    const map = new Map<string, "eq" | "neq">();
    for (const e of puzzle.edges) {
      map.set(`${e.a[0]},${e.a[1]}-${e.b[0]},${e.b[1]}`, e.type);
    }
    return map;
  }, [puzzle]);

  function edgeAt(r1: number, c1: number, r2: number, c2: number) {
    return (
      edgeByPair.get(`${r1},${c1}-${r2},${c2}`) ??
      edgeByPair.get(`${r2},${c2}-${r1},${c1}`)
    );
  }

  function cycle(r: number, c: number) {
    if (puzzle.givens[r][c] != null || solvedRef.current) return;

    // Compute the next grid here (in the event handler) rather than inside
    // the setGrid updater — updater functions must stay pure, and calling
    // onSolved (which updates a *different* component's state) from inside
    // one triggers "setState while rendering another component".
    const next = grid.map((row) => row.slice());
    const cur = next[r][c];
    next[r][c] = cur == null ? 0 : cur === 0 ? 1 : null;
    setGrid(next);

    if (isValidSolution(next, puzzle.edges, puzzle.size)) {
      solvedRef.current = true;
      // eslint-disable-next-line react-hooks/purity -- runs inside the click handler, not during render
      const seconds = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
      setElapsed(seconds);
      setSolved(true);
      onSolved(seconds);
    }
  }

  function resetBoard() {
    if (solvedRef.current) return;
    setGrid(puzzle.givens.map((row) => row.slice()));
  }

  const size = puzzle.size;
  const trackSizes = Array.from({ length: size * 2 - 1 }, (_, i) =>
    i % 2 === 0 ? `${CELL_PX}px` : `${GAP_PX}px`,
  ).join(" ");

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
        className="grid select-none mx-auto w-max"
        style={{ gridTemplateColumns: trackSizes, gridTemplateRows: trackSizes }}
      >
        {grid.map((row, r) =>
          row.map((val, c) => {
            const given = puzzle.givens[r][c] != null;
            const isConflict = conflicts.has(`${r},${c}`);
            return (
              <button
                key={`cell-${r}-${c}`}
                type="button"
                onClick={() => cycle(r, c)}
                disabled={given || solved}
                data-testid="tango-cell"
                data-r={r}
                data-c={c}
                style={{ gridColumn: 2 * c + 1, gridRow: 2 * r + 1 }}
                className={`flex items-center justify-center rounded-md border text-xl ${
                  given
                    ? "border-stone-300 bg-stone-100"
                    : isConflict
                      ? "border-red-300 bg-red-50"
                      : "border-stone-300 bg-white active:bg-aegean-50"
                }`}
              >
                {val === 0 ? "🐱" : val === 1 ? "🐈‍⬛" : ""}
              </button>
            );
          }),
        )}

        {Array.from({ length: size }).map((_, r) =>
          Array.from({ length: size - 1 }).map((_, c) => {
            const type = edgeAt(r, c, r, c + 1);
            if (!type) return null;
            return (
              <div
                key={`h-${r}-${c}`}
                style={{ gridColumn: 2 * c + 2, gridRow: 2 * r + 1 }}
                className="flex items-center justify-center text-xs font-bold text-stone-400"
              >
                {type === "eq" ? "=" : "×"}
              </div>
            );
          }),
        )}

        {Array.from({ length: size - 1 }).map((_, r) =>
          Array.from({ length: size }).map((_, c) => {
            const type = edgeAt(r, c, r + 1, c);
            if (!type) return null;
            return (
              <div
                key={`v-${r}-${c}`}
                style={{ gridColumn: 2 * c + 1, gridRow: 2 * r + 2 }}
                className="flex items-center justify-center text-xs font-bold text-stone-400"
              >
                {type === "eq" ? "=" : "×"}
              </div>
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
          Tap a cell to cycle: 🐱 → 🐈‍⬛ → empty
        </p>
      )}
    </div>
  );
}
