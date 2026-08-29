import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FontSizeControls from './FontSizeControls';

function Navbar() {
  const { authenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const linkStyle = {
    color: 'inherit',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '1.25rem'
  };

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 24px', borderBottom: '1px solid var(--border-color)', fontFamily: 'sans-serif',
      color: '#262626'
    }}>
      <Link to="/" style={{ ...linkStyle, fontWeight: 'bold' }}>Acasă</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontSize: '1rem'}}>Dimensiune text:</span>
        <FontSizeControls />

        <div style={{ width: 1, height: 24, backgroundColor: '#cbd5e1', margin: '0 12px' }} />
        {authenticated ? (
          <>
            <Link
                to="/profile"
                style={{ ...linkStyle, fontWeight: 'bold' }}
                >
                Profilul Meu
            </Link>

            <div style={{ width: 1, height: 24, backgroundColor: '#cbd5e1', margin: '0 12px' }} />
            
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: '#b35d4c',
                color: '#ffffff',        
                border: '1px solid #ccc',
                padding: '3px 8px',
                borderRadius: '6px',
                cursor: 'pointer', 
                fontSize: '1.25rem'
              }}
            >Deconectare
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Autentificare</Link>
            <Link to="/register" style={linkStyle}>Creează cont</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;