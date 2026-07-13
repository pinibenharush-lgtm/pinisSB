export default function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-2xl font-semibold tracking-tight text-stone-900">
        {title}
      </h1>
      {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
    </div>
  );
}
