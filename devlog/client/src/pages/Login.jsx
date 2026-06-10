import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const focus = e => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 1px #6C63FF'; };
  const blur  = e => { e.target.style.borderColor = '#1E1E22'; e.target.style.boxShadow = 'none'; };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server — make sure the backend is running on port 5000');
      } else {
        toast.error(err.response.data?.message || 'Invalid credentials');
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0F', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Decorative bottom-left */}
      <div style={{ position: 'fixed', bottom: 16, left: 16, pointerEvents: 'none', opacity: 0.25 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#c7c4d8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          System: Stable // build_742
        </span>
      </div>

      <div style={{
        background: '#141416', border: '1px solid #1E1E22',
        width: '100%', maxWidth: 400, padding: 40, borderRadius: 0,
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: '#6C63FF',
            margin: '0 auto 10px',
          }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e4e1ee', letterSpacing: '-0.03em', margin: 0 }}>DevLog</h1>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#c7c4d8', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginTop: 4 }}>
            Technical Tracker
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#c7c4d8', marginLeft: 2 }}>Email address</label>
            <input
              type="email" required value={form.email} onChange={set('email')}
              placeholder="name@company.com"
              onFocus={focus} onBlur={blur}
              style={{ background: '#09090B', border: '1px solid #1E1E22', borderRadius: 0, padding: '10px 12px', color: '#e4e1ee', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', height: 44, transition: 'border-color 0.15s, box-shadow 0.15s' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: 2, marginRight: 2 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#c7c4d8' }}>Password</label>
              <a href="#" style={{ fontSize: 12, color: '#6C63FF', textDecoration: 'none' }}>Forgot?</a>
            </div>
            <input
              type="password" required value={form.password} onChange={set('password')}
              placeholder="••••••••"
              onFocus={focus} onBlur={blur}
              style={{ background: '#09090B', border: '1px solid #1E1E22', borderRadius: 0, padding: '10px 12px', color: '#e4e1ee', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', height: 44, transition: 'border-color 0.15s, box-shadow 0.15s' }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              background: '#6C63FF', color: '#fff', border: 'none',
              height: 48, fontSize: 16, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              borderRadius: 0, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 4, transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <span className="material-symbols-outlined ms-sm">arrow_forward</span>}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1E1E22', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#c7c4d8', margin: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6C63FF', fontWeight: 500, textDecoration: 'none' }}>Register</Link>
          </p>

          <div style={{ marginTop: 16, padding: '12px', background: '#09090B', border: '1px solid #1E1E22', borderRadius: 4, textAlign: 'left' }}>
            <p style={{ fontSize: 10, color: '#918fa1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Demo credentials</p>
            <p style={{ fontSize: 12, color: '#c7c4d8', margin: '2px 0', fontFamily: 'monospace' }}>admin@devlog.com · password123</p>
            <p style={{ fontSize: 12, color: '#c7c4d8', margin: '2px 0', fontFamily: 'monospace' }}>dev@devlog.com · password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
