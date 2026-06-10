import { useState } from 'react';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES   = ['backlog', 'in-progress', 'review', 'done'];
const S_LBL      = { backlog: 'Backlog', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };

const inputStyle = {
  width: '100%', background: 'var(--color-input-bg)',
  border: '1px solid var(--color-border)', borderRadius: 4,
  padding: '8px 12px', color: 'var(--color-on-surface)',
  fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};
const labelStyle = { fontSize: 11, fontWeight: 500, color: 'var(--color-subtle)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5, display: 'block' };

export default function NewIssueModal({ onClose, onCreate, defaultStatus = 'backlog', members }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: defaultStatus, assignee: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const focus = e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 1px var(--color-primary)'; };
  const blur  = e => { e.target.style.borderColor = 'var(--color-border)';  e.target.style.boxShadow = 'none'; };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setLoading(true);
    try {
      await onCreate({ title: form.title.trim(), description: form.description, priority: form.priority, status: form.status, assignee: form.assignee || undefined });
      toast.success('Issue created');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create issue');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-on-surface)' }}>New Issue</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-subtle)', padding: 4, borderRadius: 4 }}>
            <span className="material-symbols-outlined ms-sm">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input autoFocus value={form.title} onChange={set('title')} placeholder="Short, descriptive title" style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="What needs to be done? (optional)" rows={3} style={{ ...inputStyle, resize: 'none' }} onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { key: 'status',   label: 'Status',   options: STATUSES.map(s => ({ v: s, l: S_LBL[s] })) },
              { key: 'priority', label: 'Priority',  options: PRIORITIES.map(p => ({ v: p, l: p.charAt(0).toUpperCase() + p.slice(1) })) },
              { key: 'assignee', label: 'Assignee',  options: [{ v: '', l: 'Unassigned' }, ...(members ?? []).map(m => ({ v: m._id, l: m.name }))] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <select value={form[key]} onChange={set(key)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                  {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="dl-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={loading} className="dl-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Creating…' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
