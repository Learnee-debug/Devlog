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
          className="bg-surface rounded-[8px] p-[12px] cursor-pointer select-none"
          style={{
            ...provided.draggableProps.style,
            border: `1px solid ${
              snapshot.isDragging ? 'var(--color-primary)' :
              isInProgress ? 'rgba(108,99,255,0.45)' :
              'var(--color-border)'
            }`,
            transition: snapshot.isDragging ? 'none' : 'border-color 0.15s',
            boxShadow: isInProgress && !snapshot.isDragging
              ? '0 0 15px rgba(108,99,255,0.05)' : 'none',
            transform: snapshot.isDragging
              ? (provided.draggableProps.style?.transform ?? '') + ' rotate(1deg)'
              : provided.draggableProps.style?.transform,
          }}
        >
          {/* Top row: issue ID + priority dot */}
          <div className="flex justify-between items-center mb-[8px]">
            <span className={`issue-id${isInProgress ? ' issue-id-active' : ''}`}>
              {issue.issueId}
            </span>
            <PriorityDot priority={issue.priority} />
          </div>

          {/* Title */}
          <p className={`text-[14px] font-medium text-on-surface leading-[1.4] mb-[12px]${issue.status === 'done' ? ' line-through opacity-60' : ''}`}>
            {issue.title}
          </p>

          {/* Bottom row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-[5px] text-subtle">
              <span className="material-symbols-outlined ms-xs">chat_bubble</span>
              <span className="text-[11px]">{issue.comments?.length ?? 0}</span>
            </div>
            {issue.assignee
              ? <Avatar user={issue.assignee} size="xs" borderColor="var(--color-surface)" />
              : <div className="w-[20px] h-[20px] rounded-full border border-dashed border-border" />
            }
          </div>
        </div>
      )}
    </Draggable>
  );
}
