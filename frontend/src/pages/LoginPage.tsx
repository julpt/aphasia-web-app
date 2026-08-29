import { useState } from 'react';
import type { CSSProperties, SubmitEventHandler } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

const containerStyle: CSSProperties = {
  maxWidth: 480,
  margin: '60px auto',
  fontFamily: 'sans-serif',
  padding: '0 20px',
  textAlign: 'center',
};

const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '14px 16px',
  fontSize: '1rem',
  marginBottom: 16,
  borderRadius: 12,
  border: '2px solid #e2e8f0',
  backgroundColor: '#fff',
  color: '#1a202c',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

const primaryButtonStyle: CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  borderRadius: 12,
  border: '2px solid #333',
  backgroundColor: '#333',
  color: '#fff',
  cursor: 'pointer',
  marginTop: 8,
  boxSizing: 'border-box',
};

function LoginPage() {
  const [method, setMethod] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handlePasswordLogin: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe: false }),
      });
      if (!res.ok) throw new Error('Email sau parolă incorectă.');
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare la autentificare.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('A apărut o eroare la trimiterea linkului.');
      setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare necunoscută.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '2rem', marginBottom: 20 }}>Autentificare</h1>
      <p style={{ color: '#626771', marginBottom: 32 }}>Alege cum dorești să te conectezi:</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, backgroundColor: '#a1a1a1', padding: 6, borderRadius: 14 }}>
        <button
          type="button"
          onClick={() => { setMethod('password'); setMagicSent(false); setError(null); }}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: '0.9rem',
            fontWeight: method === 'password' ? 'bold' : 'normal',
            backgroundColor: method === 'password' ? '#fff' : 'transparent',
            color: method === 'password' ? '#303030' : '#ffffff',
            border: method === 'password' ? '1px solid #cbd5e0' : 'none',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: method === 'password' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          Cu Parolă
        </button>
        <button
          type="button"
          onClick={() => { setMethod('magic'); setMagicSent(false); setError(null); }}
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: '0.9rem',
            fontWeight: method === 'magic' ? 'bold' : 'normal',
            backgroundColor: method === 'magic' ? '#fff' : 'transparent',
            color: method === 'magic' ? '#303030' : '#ffffff',
            border: method === 'magic' ? '1px solid #cbd5e0' : 'none',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: method === 'magic' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          Fără Parolă
        </button>
      </div>

      {/* Formular Parolă */}
      {method === 'password' && (
        <form onSubmit={handlePasswordLogin} style={{ textAlign: 'left' }}>
          <input
            type="email"
            placeholder="Adresa de email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Parola ta"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Se autentifică...' : 'Intră în cont'}
          </button>
        </form>
      )}

      {/* Formular Magic Link */}
      {method === 'magic' && (
        <div>
          {magicSent ? (
            <div style={{ padding: 24, backgroundColor: '#f0fff4', border: '2px solid #68d391', borderRadius: 12, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#22543d' }}>Link trimis cu succes! 📬</h3>
              <p style={{ margin: 0, color: '#276749' }}>
                Verifică căsuța de email pentru <strong>{email}</strong> și apasă pe link pentru a intra în cont.
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} style={{ textAlign: 'left' }}>
              <input
                type="email"
                placeholder="Introdu adresa ta de email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <button type="submit" disabled={loading} style={primaryButtonStyle}>
                {loading ? 'Se trimite...' : 'Trimite link de conectare'}
              </button>
            </form>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, color: '#c53030' }}>
          {error}
        </div>
      )}

      <p style={{ marginTop: 32, fontSize: '0.95rem', color: '#626771' }}>
        Nu ai cont încă?{' '}
        <Link to="/register" style={{ color: '#47750e', fontWeight: 'bold', textDecoration: 'underline' }}>
          Creează cont
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;