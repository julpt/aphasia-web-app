import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';

const cardStyle: CSSProperties = {
  display: 'block', padding: '20px 24px', fontSize: '1.5rem',
  border: '2px solid #333', borderRadius: 12,
  textDecoration: 'none', color: '#111', backgroundColor: '#f7f7f7',
};

function HomePage() {
  const { authenticated } = useAuth();

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Bine ai venit!</h1>
      <p style={{ fontSize: '1rem', margin: '40px', color: '#626771' }}>Alege ce vrei să faci:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
        <Link to="/reconstruct" style={cardStyle}>📝 Reconstrucție text</Link>
        <Link to="/exercises" style={cardStyle}>Exerciții</Link>

        {authenticated && (
          <Link to="/favorites" style={cardStyle}>★ Fraze favorite</Link>
        )}

        {!authenticated && (
          <>
            <Link to="/login" style={cardStyle}>Autentificare</Link>
            <Link to="/register" style={cardStyle}>Creează cont</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;