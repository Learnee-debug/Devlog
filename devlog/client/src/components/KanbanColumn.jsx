import { Droppable } from '@hello-pangea/dnd';
import IssueCard from './IssueCard';

const COLUMN_META = {
  backlog:       { label: 'BACKLOG',     countClass: 'bg-surface-high text-on-surface' },
  'in-progress': { label: 'IN PROGRESS', countClass: 'bg-[rgba(108,99,255,0.2)] text-[#6C63FF] border border-[rgba(108,99,255,0.3)]' },
  review:        { label: 'REVIEW',      countClass: 'bg-surface-high text-on-surface' },
  done:          { label: 'DONE',        countClass: 'bg-[rgba(74,222,128,0.1)] text-[#4ade80] border border-[rgba(74,222,128,0.2)]' },
};

export default function KanbanColumn({ status, issues, onIssueClick, onAddIssue }) {
  const meta = COLUMN_META[status];
  const isInProgress = status === 'in-progress';

  return (
    <div className="w-[300px] shrink-0 flex flex-col gap-[12px]">
      {/* Header */}
      <div className="flex items-center justify-between px-[4px]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase">
            {meta.label}
          </span>
          <span className={`px-[8px] py-[2px] rounded-full text-[10px] font-bold ${meta.countClass}`}>
            {issues.length}
          </span>
        </div>
        <button
          className="bg-transparent border-0 cursor-pointer text-subtle p-[2px]"
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
            className="flex flex-col gap-[10px] min-h-[80px] p-[4px] rounded-[8px] transition-colors duration-150"
            style={{ background: snapshot.isDraggingOver ? 'rgba(108,99,255,0.04)' : 'transparent' }}
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
              className="w-full py-[8px] border border-dashed border-border rounded-[8px] bg-transparent cursor-pointer text-subtle text-[12px] font-bold flex items-center justify-center gap-[6px] transition-colors duration-150 hover:border-border-hover hover:bg-surface"
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
