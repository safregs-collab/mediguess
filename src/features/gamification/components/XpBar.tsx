import { getLevelInfo, getLevelTitle } from '../xpLogic';

interface XpBarProps {
  totalXp: number;
  compact?: boolean;
}

export function XpBar({ totalXp, compact = false }: XpBarProps) {
  const info = getLevelInfo(totalXp);
  const title = getLevelTitle(info.level);
  const pct = Math.round(info.progress * 100);

  if (compact) {
    return (
      <div className="xp-bar-compact">
        <span className="xp-level">Lv.{info.level}</span>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="xp-bar">
      <div className="xp-bar-header">
        <span className="xp-bar-title">{title}</span>
        <span className="xp-bar-level">Уровень {info.level}</span>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="xp-bar-footer">
        <span>{info.current} / {info.next} XP</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
