export default function StarRating({
  value,
  onChange,
  size = "text-lg",
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: string;
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex gap-0.5 ${size}`}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={`leading-none ${onChange ? "cursor-pointer" : ""} ${
            star <= value ? "text-amber-400" : "text-slate-200"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
