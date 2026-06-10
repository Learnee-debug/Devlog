import { Droppable } from '@hello-pangea/dnd';
import IssueCard from './IssueCard';

const COLUMN_META = {
  backlog:      { label: 'BACKLOG',      countStyle: { background: 'var(--color-surface-high)', color: 'var(--color-on-surface)' } },
  'in-progress':{ label: 'IN PROGRESS',  countStyle: { background: 'rgba(108,99,255,0.2)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' } },
  review:       { label: 'REVIEW',        countStyle: { background: 'var(--color-surface-high)', color: 'var(--color-on-surface)' } },
  done:         { label: 'DONE',          countStyle: { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' } },
};

export default function KanbanColumn({ status, issues, onIssueClick, onAddIssue }) {
  const meta = COLUMN_META[status];
  const isInProgress = status === 'in-progress';

  return (
    <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--color-muted)', textTransform: 'uppercase',
          }}>
            {meta.label}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 9999,
            fontSize: 10, fontWeight: 700,
            ...meta.countStyle,
          }}>
            {issues.length}
          </span>
        </div>
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-subtle)', padding: 2 }}
          onClick={() => onAddIssue(status)}
          title="Add issue"
        >
          <span className="material-symbols-outlined ms-sm">add</span>
        </button>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              minHeight: 80, padding: 4, borderRadius: 8,
              background: snapshot.isDraggingOver ? 'rgba(108,99,255,0.04)' : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            {issues.map((issue, i) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                index={i}
                onClick={onIssueClick}
                isInProgress={isInProgress}
              />
            ))}
            {provided.placeholder}

            {/* Add Card button */}
            <button
              onClick={() => onAddIssue(status)}
              style={{
                width: '100%', padding: '8px 0',
                border: '1px dashed var(--color-border)',
                borderRadius: 8, background: 'none', cursor: 'pointer',
                color: 'var(--color-subtle)', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-border-hover)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'none'; }}
            >
              <span className="material-symbols-outlined ms-xs">add</span>
              Add Card
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}
