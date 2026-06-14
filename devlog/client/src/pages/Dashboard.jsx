import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Avatar from '../components/Avatar';
import NewIssueModal from '../components/NewIssueModal';
import toast from 'react-hot-toast';
import api from '../utils/api';

const METRIC_ICONS = [
  { key: 'open',     label: 'Open Issues',        icon: 'warning',       color: '#ffb4ab', bg: 'rgba(255,180,171,0.1)' },
  { key: 'progress', label: 'In Progress',         icon: 'sync',          color: '#c4c0ff', bg: 'rgba(196,192,255,0.1)' },
  { key: 'done',     label: 'Resolved This Week',  icon: 'check_circle',  color: '#ffb785', bg: 'rgba(255,183,133,0.1)' },
];

function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const focus = e => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 1px #6C63FF'; };
  const blur  = e => { e.target.style.borderColor = '#1E1E22'; e.target.style.boxShadow = 'none'; };

  const submit = async e => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name required');
    setLoading(true);
    try { await onCreate(name.trim(), desc); onClose(); toast.success('Project created'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#141416', border: '1px solid #1E1E22', borderRadius: 8, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1E1E22' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#e4e1ee' }}>New Project</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#918fa1', padding: 4, borderRadius: 4 }}>
            <span className="material-symbols-outlined ms-sm">close</span>
          </button>
        </div>
        <form onSubmit={submit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: '#918fa1', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Project Name *</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Cloud API" onFocus={focus} onBlur={blur}
              style={{ width: '100%', background: '#09090B', border: '1px solid #1E1E22', borderRadius: 4, padding: '8px 12px', color: '#e4e1ee', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: '#918fa1', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' }}>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this project about? (optional)" rows={3} onFocus={focus} onBlur={blur}
              style={{ width: '100%', background: '#09090B', border: '1px solid #1E1E22', borderRadius: 4, padding: '8px 12px', color: '#e4e1ee', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="dl-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={loading} className="dl-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, loading, createProject } = useProjects();
  const navigate = useNavigate();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [issuesByProject, setIssuesByProject] = useState({});

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (!projects.length) return;
    let cancelled = false;
    Promise.all(
      projects.map(p =>
        api.get(`/issues?projectId=${p._id}`)
          .then(r => ({ id: p._id, issues: r.data }))
          .catch(() => ({ id: p._id, issues: [] }))
      )
    ).then(results => {
      if (cancelled) return;
      const map = {};
      results.forEach(({ id, issues }) => { map[id] = issues; });
      setIssuesByProject(map);
    });
    return () => { cancelled = true; };
  }, [projects]);

  const allIssues = Object.values(issuesByProject).flat();
  const openCount = allIssues.filter(i => i.status === 'backlog').length;
  const inProgressCount = allIssues.filter(i => i.status === 'in-progress').length;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const resolvedCount = allIssues.filter(i => i.status === 'done' && new Date(i.updatedAt) >= oneWeekAgo).length;
  const metricValues = [openCount, inProgressCount, resolvedCount];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D0F', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar onNewIssue={() => setShowNewIssue(true)} />

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top header */}
        <header style={{
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: '#0D0D0F', borderBottom: '1px solid #1E1E22',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined ms-sm" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#918fa1' }}>search</span>
            <input placeholder="Search issues, projects..." style={{
              background: '#09090B', border: '1px solid #1E1E22', borderRadius: 8,
              padding: '6px 12px 6px 34px', color: '#e4e1ee', fontSize: 13,
              fontFamily: 'Inter, sans-serif', outline: 'none', width: 260,
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#6C63FF'}
            onBlur={e => e.target.style.borderColor = '#1E1E22'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c7c4d8', padding: 8, borderRadius: 8, transition: 'color 0.15s' }}>
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 16, borderLeft: '1px solid #1E1E22' }}>
              <Avatar user={user} size="sm" />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#e4e1ee' }}>{user?.name}</span>
            </div>
          </div>
        </header>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {/* Greeting */}
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e4e1ee', margin: 0, letterSpacing: '-0.02em' }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </h2>
            <p style={{ fontSize: 13, color: '#c7c4d8', marginTop: 4 }}>
              You have {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace.
            </p>
          </section>

          {/* Metric cards */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
            {METRIC_ICONS.map(({ label, icon, color, bg }, i) => (
              <div key={label} style={{
                background: '#141416', border: '1px solid #1E1E22',
                padding: 20, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c7c4d8', marginBottom: 6 }}>{label}</p>
                    <h3 style={{ fontSize: 36, fontWeight: 800, color: '#e4e1ee', lineHeight: 1 }}>{metricValues[i]}</h3>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: 4, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                    <span className="material-symbols-outlined ms-fill">{icon}</span>
                  </div>
                </div>
                {/* Decorative bg icon */}
                <div style={{ position: 'absolute', right: -8, bottom: -8, opacity: 0.04 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 80 }}>{icon}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Projects */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e4e1ee', margin: 0, letterSpacing: '-0.01em' }}>Active Projects</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowNewProject(true)} className="dl-btn-primary" style={{ fontSize: 12, padding: '7px 12px' }}>
                  <span className="material-symbols-outlined ms-xs">add</span>
                  New Project
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
                <div style={{ width: 24, height: 24, border: '2px solid #6C63FF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed #1E1E22', borderRadius: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#2a2933', display: 'block', marginBottom: 12 }}>folder_open</span>
                <p style={{ color: '#918fa1', fontSize: 14, marginBottom: 16 }}>No projects yet</p>
                <button onClick={() => setShowNewProject(true)} className="dl-btn-primary">Create your first project</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {projects.map(p => {
                  const pIssues = issuesByProject[p._id] || [];
                  const pTotal = pIssues.length;
                  const pDone = pIssues.filter(i => i.status === 'done').length;
                  const pct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
                  return (
                    <div
                      key={p._id}
                      onClick={() => navigate(`/projects/${p._id}/board`)}
                      style={{
                        background: '#141416', border: '1px solid #1E1E22',
                        padding: 16, cursor: 'pointer', transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#2E2E32'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E22'}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#e4e1ee', margin: 0 }}>{p.name}</h4>
                          <p style={{ fontSize: 12, color: '#918fa1', margin: '2px 0 0' }}>{p.description || 'No description'}</p>
                        </div>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#918fa1', padding: 4, borderRadius: 4, height: 28, alignSelf: 'flex-start', flexShrink: 0 }}
                          onClick={e => e.stopPropagation()}
                        >
                          <span className="material-symbols-outlined ms-sm">more_vert</span>
                        </button>
                      </div>

                      {/* Issue count + progress */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <span className="material-symbols-outlined ms-xs" style={{ color: '#6C63FF' }}>bug_report</span>
                          <span style={{ fontSize: 13, color: '#e4e1ee' }}>Issues tracked</span>
                        </div>
                        <div style={{ height: 4, background: '#1E1E22', borderRadius: 9999, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#6C63FF', width: `${pct}%`, transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                          <span style={{ fontSize: 10, color: '#918fa1', fontWeight: 700, textTransform: 'uppercase' }}>Progress</span>
                          <span style={{ fontSize: 10, color: '#e4e1ee', fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </div>

                      {/* Members + status chip */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex' }}>
                          {p.members.slice(0, 4).map(m => (
                            <div key={m._id} style={{ marginRight: -6 }}>
                              <Avatar user={m} size="xs" borderColor="#141416" />
                            </div>
                          ))}
                          {p.members.length > 4 && (
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%',
                              background: '#2a2933', border: '2px solid #141416',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, color: '#c7c4d8', marginRight: -6,
                            }}>+{p.members.length - 4}</div>
                          )}
                        </div>
                        <span style={{
                          fontSize: 11, color: '#c7c4d8', background: '#2a2933',
                          padding: '2px 8px', borderRadius: 4,
                        }}>Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowNewProject(true)}
        className="dl-btn-primary"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%', padding: 0,
          boxShadow: '0 4px 20px rgba(108,99,255,0.4)', zIndex: 30,
        }}
      >
        <span className="material-symbols-outlined ms-lg" style={{ fontVariationSettings: '"wght" 600' }}>add</span>
      </button>

      {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onCreate={createProject} />}
      {showNewIssue && (
        <NewIssueModal
          defaultStatus="backlog"
          members={[]}
          onClose={() => setShowNewIssue(false)}
          onCreate={async () => { toast('Select a project first'); setShowNewIssue(false); }}
        />
      )}
    </div>
  );
}
