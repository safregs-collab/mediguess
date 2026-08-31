export function MetaSkeleton() {
  return (
    <div className="meta-skeleton" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#a78bfa' }}>
      <div className="skeleton-meta-content">
        <div className="skeleton-line skeleton-meta-title" style={{ width: 280, height: 28, marginBottom: 16 }} />
        <div className="skeleton-line skeleton-meta-subtitle" style={{ width: 180, height: 16, marginBottom: 32 }} />
        <div className="skeleton-meta-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-line skeleton-meta-card" style={{ width: 120, height: 80 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
