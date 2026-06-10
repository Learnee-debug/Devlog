import { useState } from 'react';
import Sidebar from './Sidebar';
import NewIssueModal from './NewIssueModal';

export default function Shell({ children, project, onIssueCreated }) {
  const [showNewIssue, setShowNewIssue] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar onNewIssue={() => setShowNewIssue(true)} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {showNewIssue && project && (
        <NewIssueModal
          defaultStatus="backlog"
          members={project.members}
          onClose={() => setShowNewIssue(false)}
          onCreate={async (payload) => {
            if (onIssueCreated) await onIssueCreated(payload);
            setShowNewIssue(false);
          }}
        />
      )}
    </div>
  );
}
