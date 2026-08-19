const CARDS = [
  { key: "total", label: "Total Participants" },
  { key: "spins", label: "Wheel Spins" },
  { key: "completed", label: "Task Completed" },
  { key: "failed", label: "Task Failed" },
  { key: "coinRound", label: "Coin Round" },
  { key: "winners", label: "Coupon Winners" },
  { key: "betterLuck", label: "Better Luck Next Time" },
] as const;

export function ReportStats({
  stats,
  loading,
}: {
  stats: Record<string, number>;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
      {CARDS.map((card) => (
        <div key={card.key} className="glass-panel rounded-xl px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{card.label}</p>
          {loading ? (
            <div className="shimmer mt-2 h-7 w-12 rounded" />
          ) : (
            <p className="display-font mt-1 text-3xl gold-text">{stats[card.key] ?? 0}</p>
          )}
        </div>
      ))}
    </div>
  );
}
