import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const hasRun = useRef(false);
  const { refresh } = useAuth();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/verify?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setStatus('success');
        setTimeout(async () => {
          await refresh();
          navigate('/');
        }, 1000);
      })
      .catch(() => setStatus('error'));
  }, [searchParams, navigate]);

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      {status === 'loading' && <p>Se verifică link-ul...</p>}
      {status === 'success' && <p>Autentificat cu succes! Redirecționare...</p>}
      {status === 'error' && (
        <>
          <p>Link invalid sau expirat.</p>
          <Link to="/login">Încearcă din nou</Link>
        </>
      )}
    </div>
  );
}

export default VerifyPage;