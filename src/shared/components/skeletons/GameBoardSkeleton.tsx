export function GameBoardSkeleton() {
  return (
    <section className="section active">
      <div className="game-card skeleton-card">
        <div className="game-header">
          <div className="game-title">
            <div className="skeleton-line skeleton-title" />
          </div>
          <div className="skeleton-badge skeleton-tag" />
        </div>
        <div className="skeleton-attempts">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-dot" />
          ))}
        </div>
        <div className="skeleton-clues">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-line" style={{ width: `${70 + (i % 3) * 15}%` }} />
          ))}
        </div>
        <div className="skeleton-input" />
      </div>
    </section>
  );
}
