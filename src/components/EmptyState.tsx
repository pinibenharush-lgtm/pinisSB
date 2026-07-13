import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  message,
}: {
  icon?: ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-aegean-200 bg-aegean-50/50 px-4 py-8 text-center">
      {icon && <div className="text-stone-400">{icon}</div>}
      <p className="text-sm text-stone-500">{message}</p>
    </div>
  );
}
