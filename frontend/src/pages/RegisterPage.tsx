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

function RegisterPage() {
  const [method, setMethod] = useState<'magic' | 'password'>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handlePasswordRegister: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Eroare la crearea contului.');
      }
      await refresh();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicRegister: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Eroare la trimiterea linkului.');
      setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'A apărut o eroare.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Creează cont</h1>
      <p style={{ color: '#626771', marginBottom: 32, marginTop: 40 }}>Alege o metodă</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, backgroundColor: '#a1a1a1', padding: 6, borderRadius: 14 }}>
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
            border: method === 'magic' ? '1px solid #e6e6e6' : 'none',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: method === 'magic' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          Fără Parolă (Link prin email)
        </button>
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
      </div>

      {method === 'magic' && (
        <div>
          {magicSent ? (
            <div style={{ padding: 24, backgroundColor: '#f0fff4', border: '2px solid #68d391', borderRadius: 12, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#22543d' }}>Verifică-ți emailul! 📬</h3>
              <p style={{ margin: 0, color: '#276749' }}>
                Ți-am trimis un link pe <strong>{email}</strong>. Fă clic pe el pentru a intra direct în noul tău cont.
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicRegister} style={{ textAlign: 'left' }}>
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

      {method === 'password' && (
        <form onSubmit={handlePasswordRegister} style={{ textAlign: 'left' }}>
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
            placeholder="Alege o parolă sigură"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? 'Se creează...' : 'Finalizează înregistrarea'}
          </button>
        </form>
      )}

      {error && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, color: '#c53030' }}>
          {error}
        </div>
      )}

      <p style={{ marginTop: 32, fontSize: '0.95rem', color: '#626771' }}>
        Ai deja un cont?{' '}
        <Link to="/login" style={{ color: '#47750e', fontWeight: 'bold', textDecoration: 'underline' }}>
          Autentifică-te
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;