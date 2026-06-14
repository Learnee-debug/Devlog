import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../hooks/useProjects';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import api from '../utils/api';
import toast from 'react-hot-toast';

function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 3,
      background: isAdmin ? 'rgba(255,183,133,0.15)' : 'rgba(196,192,255,0.1)',
      color: isAdmin ? '#ffb785' : '#c4c0ff',
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {role}
    </span>
  );
}

function AddMemberPanel({ project, onAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/users?search=${encodeURIComponent(query.trim())}`);
        setResults(data);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleAdd = async (u) => {
    setAddingId(u._id);
    try {
      await onAdd(project._id, u._id, u.name);
      setQuery('');
      setResults([]);
    } finally { setAddingId(null); }
  };

  const alreadyMemberIds = new Set(project.members.map(m => m._id));

  return (
    <div style={{ marginBottom: 16, padding: 16, background: '#0D0D0F', borderRadius: 8, border: '1px solid #1E1E22' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#918fa1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Search by name or email
      </div>
      <input
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="e.g. john@example.com"
        style={{
          width: '100%', background: '#09090B', border: '1px solid #1E1E22',
          borderRadius: 6, padding: '8px 12px', color: '#e4e1ee', fontSize: 13,
          fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = '#6C63FF'}
        onBlur={e => e.target.style.borderColor = '#1E1E22'}
      />

      {searching && (
        <p style={{ fontSize: 12, color: '#918fa1', margin: '8px 0 0' }}>Searching…</p>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {results.map(u => {
            const isMember = alreadyMemberIds.has(u._id);
            return (
              <div key={u._id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', background: '#141416', borderRadius: 6, border: '1px solid #1E1E22',
              }}>
                <Avatar user={u} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e1ee' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#918fa1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                <RoleBadge role={u.role} />
                {isMember ? (
                  <span style={{ fontSize: 11, color: '#918fa1', flexShrink: 0 }}>Already added</span>
                ) : (
                  <button
                    onClick={() => handleAdd(u)}
                    disabled={addingId === u._id}
                    className="dl-btn-primary"
                    style={{ fontSize: 11, padding: '4px 12px', flexShrink: 0 }}
                  >
                    {addingId === u._id ? '…' : 'Add'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!searching && query.trim().length >= 2 && results.length === 0 && (
        <p style={{ fontSize: 12, color: '#918fa1', margin: '8px 0 0' }}>No users found for "{query}"</p>
      )}
    </div>
  );
}

export default function Team() {
  const { user } = useAuth();
  const { projects, loading, addMember } = useProjects();
  const [openPanel, setOpenPanel] = useState(null); // projectId with open add-member panel

  const handleAddMember = async (projectId, userId, name) => {
    try {
      await addMember(projectId, userId);
      toast.success(`${name} added to project`);
      setOpenPanel(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  // Deduplicate all members across all projects
  const allMembers = [...new Map(
    projects.flatMap(p => p.members).map(m => [m._id, m])
  ).values()];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0F', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar onNewIssue={() => {}} />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: '#0D0D0F', borderBottom: '1px solid #1E1E22',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#e4e1ee', margin: 0, letterSpacing: '-0.02em' }}>Team</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid #1E1E22' }}>
            <Avatar user={user} size="sm" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#e4e1ee' }}>{user?.name}</span>
          </div>
        </header>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

          {/* Workspace members overview */}
          <section style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e4e1ee', margin: 0, letterSpacing: '-0.01em' }}>
                Workspace Members
              </h2>
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#918fa1',
                background: '#1E1E22', padding: '2px 8px', borderRadius: 4,
              }}>
                {allMembers.length}
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: 24, height: 24, border: '2px solid #6C63FF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {allMembers.map(m => (
                  <div key={m._id} style={{
                    background: '#141416', border: '1px solid #1E1E22', borderRadius: 8,
                    padding: 16, display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <Avatar user={m} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e4e1ee', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {m.name}
                        {m._id === user?._id && (
                          <span style={{ fontSize: 10, background: 'rgba(108,99,255,0.15)', color: '#6C63FF', padding: '1px 6px', borderRadius: 3, fontWeight: 700 }}>
                            You
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#918fa1', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.email}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <RoleBadge role={m.role} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Per-project member management */}
          <section>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e4e1ee', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
              Projects
            </h2>

            {!loading && projects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed #1E1E22', borderRadius: 8 }}>
                <p style={{ color: '#918fa1', fontSize: 14 }}>No projects yet. Create one from the Dashboard.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {projects.map(p => {
                const creatorId = p.createdBy?._id ?? p.createdBy;
                const isCreator = creatorId?.toString() === user?._id?.toString();
                const panelOpen = openPanel === p._id;

                return (
                  <div key={p._id} style={{
                    background: '#141416', border: '1px solid #1E1E22', borderRadius: 8, padding: 20,
                  }}>
                    {/* Project header row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#e4e1ee', margin: 0 }}>{p.name}</h3>
                        <p style={{ fontSize: 12, color: '#918fa1', margin: '3px 0 0' }}>
                          {p.members.length} member{p.members.length !== 1 ? 's' : ''}
                          {isCreator && (
                            <span style={{ marginLeft: 6, color: '#6C63FF', fontWeight: 600 }}>· You own this</span>
                          )}
                        </p>
                      </div>
                      {isCreator && (
                        <button
                          onClick={() => setOpenPanel(panelOpen ? null : p._id)}
                          className={panelOpen ? 'dl-btn-ghost' : 'dl-btn-primary'}
                          style={{ fontSize: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
                        >
                          <span className="material-symbols-outlined ms-xs">
                            {panelOpen ? 'close' : 'person_add'}
                          </span>
                          {panelOpen ? 'Cancel' : 'Add Member'}
                        </button>
                      )}
                    </div>

                    {/* Add member search panel */}
                    {panelOpen && (
                      <AddMemberPanel project={p} onAdd={handleAddMember} />
                    )}

                    {/* Member rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {p.members.map(m => {
                        const memberCreatorId = p.createdBy?._id ?? p.createdBy;
                        const isOwner = memberCreatorId?.toString() === m._id?.toString();
                        return (
                          <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar user={m} size="sm" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e1ee', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {m.name}
                                {m._id === user?._id && (
                                  <span style={{ fontSize: 10, color: '#6C63FF' }}>(you)</span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: '#918fa1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {m.email}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <RoleBadge role={m.role} />
                              {isOwner && (
                                <span style={{
                                  fontSize: 10, color: '#918fa1', background: '#1E1E22',
                                  padding: '2px 6px', borderRadius: 3, fontWeight: 600,
                                }}>
                                  Owner
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
