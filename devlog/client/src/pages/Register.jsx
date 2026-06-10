import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const focus = e => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 1px #6C63FF'; };
  const blur  = e => { e.target.style.borderColor = '#1E1E22'; e.target.style.boxShadow = 'none'; };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fieldStyle = {
    background: '#09090B', border: '1px solid #1E1E22', borderRadius: 0,
    padding: '10px 12px', color: '#e4e1ee', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none', height: 44,
    width: '100%', transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0F', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ background: '#141416', border: '1px solid #1E1E22', width: '100%', maxWidth: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C63FF', margin: '0 auto 10px' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e4e1ee', letterSpacing: '-0.03em', margin: 0 }}>DevLog</h1>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#c7c4d8', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6, marginTop: 4 }}>Create Account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'name',  type: 'text',     label: 'Full Name',  ph: 'Jane Smith' },
            { key: 'email', type: 'email',    label: 'Email',       ph: 'name@company.com' },
            { key: 'password', type: 'password', label: 'Password', ph: 'Min. 6 characters' },
          ].map(({ key, type, label, ph }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#c7c4d8', marginLeft: 2 }}>{label}</label>
              <input type={type} required value={form[key]} onChange={set(key)} placeholder={ph} style={fieldStyle} onFocus={focus} onBlur={blur} />
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#c7c4d8', marginLeft: 2 }}>Role</label>
            <select value={form.role} onChange={set('role')} style={{ ...fieldStyle, appearance: 'none', cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              background: '#6C63FF', color: '#fff', border: 'none', height: 48,
              fontSize: 16, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              borderRadius: 0, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {loading ? 'Creating account…' : 'Create account'}
            {!loading && <span className="material-symbols-outlined ms-sm">arrow_forward</span>}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #1E1E22', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#c7c4d8', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6C63FF', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
