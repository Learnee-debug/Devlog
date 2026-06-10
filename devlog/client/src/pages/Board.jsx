import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import { useIssues } from '../hooks/useIssues';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import KanbanColumn from '../components/KanbanColumn';
import IssueDrawer from '../components/IssueDrawer';
import NewIssueModal from '../components/NewIssueModal';
import Avatar from '../components/Avatar';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLUMNS = ['backlog', 'in-progress', 'review', 'done'];

export default function Board() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { issues, loading, createIssue, updateIssue, deleteIssue, addComment, reorderIssues } = useIssues(projectId);

  const [project, setProject]     = useState(null);
  const [selected, setSelected]   = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [search, setSearch]       = useState('');
  const [filterPrio, setFilterPrio] = useState('');

  useEffect(() => {
    api.get(`/projects/${projectId}`)
      .then(({ data }) => setProject(data))
      .catch(() => { toast.error('Project not found'); navigate('/dashboard'); });
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;
    setConnected(socket.connected);
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => { socket.off('connect'); socket.off('disconnect'); };
  }, [socket]);

  // Sync selected issue with live updates
  useEffect(() => {
    if (selected) {
      const up = issues.find(i => i._id === selected._id);
      if (up) setSelected(up);
    }
  }, [issues]);

  const getColIssues = status => {
    let list = issues.filter(i => i.status === status);
    if (filterPrio) list = list.filter(i => i.priority === filterPrio);
    if (search)     list = list.filter(i =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.issueId.toLowerCase().includes(search.toLowerCase())
    );
    return list.sort((a, b) => a.order - b.order);
  };

  const onDragEnd = async ({ draggableId, destination, source }) => {
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newSt = destination.droppableId;
    const newOrd = destination.index;

    const updated = issues.map(i =>
      i._id === draggableId ? { ...i, status: newSt, order: newOrd } : i
    );
    const reindexed = updated.map(i => {
      if (i._id === draggableId) return i;
      if (i.status === newSt && i.order >= newOrd) return { ...i, order: i.order + 1 };
      return i;
    });
    await reorderIssues(reindexed, draggableId, newSt, newOrd);
  };

  const handleUpdate = async (id, payload, comment) => {
    if (comment) await addComment(id, comment);
    else await updateIssue(id, payload);
  };

  const totalIssues = issues.length;
  const doneCount   = issues.filter(i => i.status === 'done').length;
  const pct         = totalIssues > 0 ? Math.round((doneCount / totalIssues) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0F', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar onNewIssue={() => setNewStatus('backlog')} />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          height: 64, padding: '0 24px', background: '#0D0D0F',
          borderBottom: '1px solid #1E1E22', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#918fa1', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <span className="material-symbols-outlined ms-sm">account_tree</span>
              <span>Projects</span>
              <span style={{ color: '#464555' }}>/</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e4e1ee', margin: 0, letterSpacing: '-0.02em' }}>
              {project?.name ?? '…'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined ms-xs" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#918fa1' }}>search</span>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Filter issues..."
                style={{
                  background: '#09090B', border: '1px solid #1E1E22', borderRadius: 8,
                  padding: '6px 12px 6px 30px', color: '#e4e1ee', fontSize: 13,
                  fontFamily: 'Inter, sans-serif', outline: 'none', width: 220,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#6C63FF'}
                onBlur={e => e.target.style.borderColor = '#1E1E22'}
              />
            </div>

            {/* Priority filter */}
            <select
              value={filterPrio} onChange={e => setFilterPrio(e.target.value)}
              style={{
                background: '#09090B', border: '1px solid #1E1E22', borderRadius: 8,
                padding: '6px 10px', color: filterPrio ? '#e4e1ee' : '#918fa1',
                fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">All priorities</option>
              {['low','medium','high','critical'].map(p => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>

            {/* Live status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: connected ? '#4ade80' : '#6b7280' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#4ade80' : '#6b7280', flexShrink: 0 }} />
              {connected ? 'Live' : 'Offline'}
            </div>

            {/* Member avatars */}
            <div style={{ display: 'flex' }}>
              {project?.members?.slice(0, 4).map(m => (
                <div key={m._id} style={{ marginRight: -5 }}>
                  <Avatar user={m} size="xs" borderColor="#0D0D0F" />
                </div>
              ))}
            </div>

            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c7c4d8', padding: 8, borderRadius: 8 }}>
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>

        {/* Progress bar strip */}
        {totalIssues > 0 && (
          <div style={{ height: 3, background: '#1E1E22' }}>
            <div style={{ height: '100%', background: '#6C63FF', width: `${pct}%`, transition: 'width 0.5s ease' }} />
          </div>
        )}

        {/* Kanban */}
        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
              <div style={{ width: 28, height: 28, border: '2px solid #6C63FF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: 'flex', gap: 24, padding: 24, minWidth: 'max-content' }}>
                {COLUMNS.map(status => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    issues={getColIssues(status)}
                    onIssueClick={setSelected}
                    onAddIssue={s => setNewStatus(s)}
                  />
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      </main>

      {selected && (
        <IssueDrawer
          issue={selected}
          members={project?.members}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={deleteIssue}
        />
      )}

      {newStatus && (
        <NewIssueModal
          defaultStatus={newStatus}
          members={project?.members}
          onClose={() => setNewStatus(null)}
          onCreate={createIssue}
        />
      )}
    </div>
  );
}
