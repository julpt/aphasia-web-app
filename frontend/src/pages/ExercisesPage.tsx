import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { getSeenIds } from '../utils/sessionTracking';
import { clearSeenIds } from '../utils/sessionTracking';
import { useAuth } from '../context/AuthContext';

const TYPES = [
  { value: 'multiple_choice', label: '🔤 Alegere multiplă' },
  { value: 'fill_in_blank', label: '✏️ Completează propoziția' },
];

function ExercisesPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [completedType, setCompletedType] = useState<string | null>(null);

  async function handlePickType(type: string) {
  setError(null);
  setCompletedType(null);
  const seenIds = getSeenIds(type);
  const query = seenIds.length > 0 ? `&exclude=${seenIds.join(',')}` : '';
  const res = await fetch(`${API_BASE_URL}/api/exercises/random?type=${type}${query}`);

  if (res.status === 204) {
    setError('Ai parcurs toate exercițiile de acest tip!');
    setCompletedType(type);
    return;
  }
  if (!res.ok) {
    setError('Nu există exerciții de acest tip momentan.');
    return;
  }
  const data = await res.json();
  navigate(`/exercises/${data.id}`);
}

  function handleResetCategory(type: string) {
    clearSeenIds(type);
    handlePickType(type);
  }


  return (
    <div style={{ maxWidth: 600, width: '100%', boxSizing: 'border-box', margin: '40px auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Exerciții</h1>
      <p style={{ fontSize: '1.2rem', color: '#555' }}>Alege un tip de exercițiu</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => handlePickType(t.value)}
            style={{
              padding: '20px 24px', fontSize: '1.3rem',
              border: '2px solid #333', borderRadius: 12,
              backgroundColor: '#6d9a58', cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: '#2563eb', fontWeight: 'bold' }}>{error}</p>
          {completedType && (
            <button
              onClick={() => handleResetCategory(completedType)}
              style={{
                marginTop: 30,
                padding: '20px 20px',
                backgroundColor: '#3999bf',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              🔄 Reia exercițiile de la început
            </button>
          )}
        </div>
      )}

      {role === 'ADMIN' && (
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #e0e0e0' }}>
          <Link
            to="/admin/exercises/new"
            style={{
              display: 'inline-block', textDecoration: 'none', fontSize: '0.95rem',
              fontWeight: 600, color: '#0b4299', border: '1px solid #0b4299',
              borderRadius: 8, padding: '10px 18px',
            }}
          >
            + Adaugă exercițiu
          </Link>
        </div>
      )}
    </div>
  );
}

export default ExercisesPage;