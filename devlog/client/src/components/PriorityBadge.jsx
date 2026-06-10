export function PriorityDot({ priority }) {
  return <div className={`priority-dot priority-${priority}`} />;
}

const LABELS = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };
const COLORS = {
  low:      { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  medium:   { color: '#a5b4fc', bg: 'rgba(108,99,255,0.1)' },
  high:     { color: '#fcd34d', bg: 'rgba(245,158,11,0.1)' },
  critical: { color: '#fca5a5', bg: 'rgba(239,68,68,0.1)' },
};

export default function PriorityBadge({ priority }) {
  const c = COLORS[priority] ?? COLORS.medium;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '2px 8px', borderRadius: 9999,
        fontSize: 11, fontWeight: 600,
        background: c.bg, color: c.color,
      }}
    >
      <PriorityDot priority={priority} />
      {LABELS[priority] ?? priority}
    </span>
  );
}
