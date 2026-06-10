import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { icon: 'dashboard',       label: 'Dashboard', to: '/dashboard' },
  { icon: 'folder_open',     label: 'Projects',  to: '/projects' },
  { icon: 'assignment_late', label: 'My Issues', to: '/my-issues' },
  { icon: 'group',           label: 'Team',      to: '/team' },
];

export default function Sidebar({ onNewIssue }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg)',
        borderRight: '1px solid var(--color-border)',
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32, height: 32,
              background: 'var(--color-primary)',
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: 18 }}>developer_board</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-on-surface)', lineHeight: 1.2 }}>DevLog</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-subtle)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Technical Tracker</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px' }}>
        {NAV.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined ms-sm">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* New Issue CTA */}
      <div style={{ padding: '0 12px 16px' }}>
        <button
          onClick={onNewIssue}
          className="dl-btn-primary"
          style={{ width: '100%', justifyContent: 'center', gap: 6, padding: '10px 0' }}
        >
          <span className="material-symbols-outlined ms-sm" style={{ fontVariationSettings: '"wght" 600' }}>add</span>
          New Issue
        </button>
      </div>

      {/* Footer nav */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '8px 8px 12px' }}>
        <button className="nav-item" style={{ width: '100%', background: 'none', border: 'none' }}>
          <span className="material-symbols-outlined ms-sm">settings</span>
          Settings
        </button>
        <button
          className="nav-item"
          style={{ width: '100%', background: 'none', border: 'none' }}
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined ms-sm">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
