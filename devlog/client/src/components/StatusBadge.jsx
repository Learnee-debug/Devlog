const CONFIG = {
  backlog:     { label: 'Backlog',     dot: '#6b7280', cls: 'status-backlog' },
  'in-progress':{ label: 'In Progress', dot: '#6C63FF', cls: 'status-in-progress' },
  review:      { label: 'Review',      dot: '#a855f7', cls: 'status-review' },
  done:        { label: 'Done',        dot: '#4ade80', cls: 'status-done' },
};

export default function StatusBadge({ status }) {
  const c = CONFIG[status] ?? CONFIG.backlog;
  return (
    <span className={`status-pill ${c.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0, display: 'inline-block' }} />
      {c.label}
    </span>
  );
}
