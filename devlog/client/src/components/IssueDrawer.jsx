import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { PriorityDot } from './PriorityBadge';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const STATUSES   = ['backlog', 'in-progress', 'review', 'done'];
const STATUS_LBL = { backlog: 'Backlog', 'in-progress': 'In Progress', review: 'Review', done: 'Done' };
const STATUS_DOT = { backlog: '#6b7280', 'in-progress': '#6C63FF', review: '#a855f7', done: '#4ade80' };
const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const PRIO_COLOR = { low: '#9ca3af', medium: '#a5b4fc', high: '#fcd34d', critical: '#fca5a5' };

function MetaDropdown({ label, value, options, onChange, renderValue, renderOption }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '7px 28px 7px 10px',
            background: 'var(--color-surface-low)', border: '1px solid var(--color-border)',
            borderRadius: 4, color: 'var(--color-on-surface)', fontSize: 13,
            fontFamily: 'Inter, sans-serif', cursor: 'pointer', outline: 'none',
            appearance: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="material-symbols-outlined ms-xs" style={{
          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--color-subtle)', pointerEvents: 'none',
        }}>expand_more</span>
      </div>
    </div>
  );
}

export default function IssueDrawer({ issue, onClose, onUpdate, onDelete, members }) {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState(issue?.title ?? '');
  const [description, setDescription] = useState(issue?.description ?? '');
  const titleRef = useRef(null);

  useEffect(() => {
    setTitle(issue?.title ?? '');
    setDescription(issue?.description ?? '');
  }, [issue?._id]);

  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  // Auto-grow title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
    }
  }, [title]);

  if (!issue) return null;

  const handleField = async (field, value) => {
    try { await onUpdate(issue._id, { [field]: value }); }
    catch { toast.error('Failed to update'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onUpdate(issue._id, {}, comment.trim());
      setComment('');
    } catch { toast.error('Failed to post comment'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${issue.title}"?`)) return;
    await onDelete(issue._id);
    onClose();
    toast.success('Issue deleted');
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeAgo = d => {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)', zIndex: 40,
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 480,
          background: 'var(--color-surface)', zIndex: 50,
          display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          borderLeft: '1px solid var(--color-border)',
          animation: 'slideInDrawer 0.28s cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        <style>{`
          @keyframes slideInDrawer {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-subtle)' }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>{issue.issueId}</span>
            <span className="material-symbols-outlined ms-xs">chevron_right</span>
            <span>Issue Detail</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {[
              { icon: 'link', title: 'Copy link' },
              { icon: 'more_vert', title: 'More' },
            ].map(({ icon, title }) => (
              <button key={icon} title={title}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: 'var(--color-subtle)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-high)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span className="material-symbols-outlined ms-sm">{icon}</span>
              </button>
            ))}
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4, color: 'var(--color-subtle)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-high)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span className="material-symbols-outlined ms-sm">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }} className="custom-scroll">
          {/* Editable title */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <textarea
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== issue.title && handleField('title', title.trim())}
              rows={1}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                color: 'var(--color-on-surface)', fontSize: 20, fontWeight: 700,
                fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none',
                lineHeight: 1.3, padding: '0 0 4px',
              }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 1, background: 'var(--color-border)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--color-border)'}
            />
          </div>

          {/* Metadata grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            padding: '16px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)',
            marginBottom: 20,
          }}>
            <MetaDropdown
              label="Status"
              value={issue.status}
              options={STATUSES.map(s => ({ value: s, label: STATUS_LBL[s] }))}
              onChange={v => handleField('status', v)}
            />
            <MetaDropdown
              label="Priority"
              value={issue.priority}
              options={PRIORITIES.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
              onChange={v => handleField('priority', v)}
            />
            <MetaDropdown
              label="Assignee"
              value={issue.assignee?._id ?? ''}
              options={[{ value: '', label: 'Unassigned' }, ...(members ?? []).map(m => ({ value: m._id, label: m.name }))]}
              onChange={v => handleField('assignee', v || null)}
            />
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Reporter</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', background: 'var(--color-surface-low)',
                border: '1px solid var(--color-border)', borderRadius: 4,
              }}>
                <Avatar user={issue.reporter} size="xs" />
                <span style={{ fontSize: 13, color: 'var(--color-on-surface)' }}>{issue.reporter?.name ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</span>
              <button
                onClick={() => {}}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-primary)', fontFamily: 'Inter, sans-serif' }}
              >
                Edit
              </button>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={() => description !== issue.description && handleField('description', description)}
              placeholder="Add a description..."
              rows={5}
              style={{
                width: '100%', background: 'var(--color-surface-low)',
                border: '1px solid var(--color-border)', borderRadius: 8,
                padding: 12, color: 'var(--color-muted)', fontSize: 13,
                fontFamily: 'Inter, sans-serif', lineHeight: 1.6,
                resize: 'none', outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; description !== issue.description && handleField('description', description); }}
            />
          </div>

          {/* Activity */}
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
              fontSize: 11, fontWeight: 500, color: 'var(--color-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <span className="material-symbols-outlined ms-xs">history</span>
              Activity
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {issue.comments?.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--color-subtle)', fontStyle: 'italic' }}>No comments yet.</p>
              )}
              {issue.comments?.map(c => (
                <div key={c._id} style={{ display: 'flex', gap: 12 }}>
                  <Avatar user={c.user} size="sm" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>{c.user?.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-subtle)' }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.5, margin: 0 }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates + Delete */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: 11, color: 'var(--color-subtle)' }}>Created {formatDate(issue.createdAt)}</span>
            {user?.role === 'admin' && (
              <button
                onClick={handleDelete}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#f87171', fontSize: 12, fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 8px', borderRadius: 4, transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span className="material-symbols-outlined ms-xs">delete</span>
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Comment input — sticky bottom */}
        <div style={{ padding: 16, borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <form onSubmit={handleComment}>
            <div style={{ position: 'relative' }}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleComment(e); }}
                placeholder="Add a comment..."
                rows={2}
                style={{
                  width: '100%', background: 'var(--color-input-bg)',
                  border: '1px solid var(--color-border)', borderRadius: 8,
                  padding: '10px 44px 10px 12px', color: 'var(--color-on-surface)',
                  fontSize: 13, fontFamily: 'Inter, sans-serif',
                  resize: 'none', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 1px var(--color-primary)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="submit"
                disabled={!comment.trim() || submitting}
                style={{
                  position: 'absolute', bottom: 10, right: 10,
                  width: 28, height: 28, borderRadius: 4,
                  background: comment.trim() ? 'var(--color-primary)' : 'var(--color-border)',
                  border: 'none', cursor: comment.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <span className="material-symbols-outlined ms-xs" style={{ color: '#fff' }}>send</span>
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--color-subtle)' }}>Press ⌘ + Enter to post</span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
