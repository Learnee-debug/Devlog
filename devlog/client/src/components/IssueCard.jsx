import { Draggable } from '@hello-pangea/dnd';
import { PriorityDot } from './PriorityBadge';
import Avatar from './Avatar';

export default function IssueCard({ issue, index, onClick, isInProgress }) {
  return (
    <Draggable draggableId={issue._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(issue)}
          style={{
            ...provided.draggableProps.style,
            background: 'var(--color-surface)',
            border: `1px solid ${
              snapshot.isDragging ? 'var(--color-primary)' :
              isInProgress ? 'rgba(108,99,255,0.45)' :
              'var(--color-border)'
            }`,
            borderRadius: 8,
            padding: 12,
            cursor: 'pointer',
            userSelect: 'none',
            transition: snapshot.isDragging ? 'none' : 'border-color 0.15s',
            boxShadow: isInProgress && !snapshot.isDragging
              ? '0 0 15px rgba(108,99,255,0.05)' : 'none',
            transform: snapshot.isDragging
              ? (provided.draggableProps.style?.transform ?? '') + ' rotate(1deg)'
              : provided.draggableProps.style?.transform,
          }}
          className="group"
        >
          {/* Top row: issue ID + priority dot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className={`issue-id${isInProgress ? ' issue-id-active' : ''}`}>
              {issue.issueId}
            </span>
            <PriorityDot priority={issue.priority} />
          </div>

          {/* Title */}
          <p style={{
            fontSize: 14, fontWeight: 500, color: 'var(--color-on-surface)',
            lineHeight: 1.4, marginBottom: 12,
            textDecoration: issue.status === 'done' ? 'line-through' : 'none',
            opacity: issue.status === 'done' ? 0.6 : 1,
          }}>
            {issue.title}
          </p>

          {/* Bottom row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-subtle)' }}>
              <span className="material-symbols-outlined ms-xs">chat_bubble</span>
              <span style={{ fontSize: 11 }}>{issue.comments?.length ?? 0}</span>
            </div>
            {issue.assignee
              ? <Avatar user={issue.assignee} size="xs" borderColor="var(--color-surface)" />
              : <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: '1px dashed var(--color-border)',
                }} />
            }
          </div>
        </div>
      )}
    </Draggable>
  );
}
