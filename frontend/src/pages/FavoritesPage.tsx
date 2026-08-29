import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import type { SubmitEventHandler } from 'react';

interface FavoritePhrase {
  id: string;
  text: string;
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoritePhrase[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFavorites(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleAddManual: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: newText.trim() }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || 'Eroare la salvare.');
      }

      const saved: FavoritePhrase = await res.json();
      setFavorites([saved, ...favorites]);
      setNewText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la adăugare');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ștergi această frază din favorite? Acțiunea nu poate fi anulată.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.id !== id));
      }
    } catch {
      alert('Eroare la ștergerea frazei.');
    }
  };

  const handleOpenInReconstruct = (text: string) => {
    navigate('/reconstruct', { state: { initialText: text } });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}>Se încarcă frazele...</div>;

  return (
    <div style={{ maxWidth: 760, width: '100%', boxSizing: 'border-box', margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#202124', marginBottom: 8 }}>
        Fraze favorite
      </h1>
      <p style={{ color: '#5f6368', marginBottom: 24, marginTop: 30 }}>
        Salvează aici expresii utile
      </p>

      <form onSubmit={handleAddManual} style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'flex-end' }}>
        <textarea
          value={newText}
          onChange={handleTextareaChange}
          placeholder="Adaugă o frază nouă..."
          rows={1}
          style={{
            flex: 1, minWidth: 0, padding: '12px 16px', borderRadius: 8,
            border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit',
            resize: 'none', overflow: 'hidden', lineHeight: 1.4,
          }}
        />
        <button
          type="submit"
          style={{ padding: '12px 20px', borderRadius: 8, border: 'none', background: '#0b4299', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '1.05rem' }}
        >
          + Salvează
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: -16, marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {favorites.length === 0 ? (
          <p style={{ color: '#70757a', textAlign: 'center', padding: 24 }}>Nu ai nicio frază favorită salvată încă.</p>
        ) : (
          favorites.map((f) => (
            <div
              key={f.id}
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: 12,
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '1.05rem', fontWeight: 500, color: '#202124', margin: '0 0 6px 0',
                  overflowWrap: 'break-word', whiteSpace: 'pre-wrap',
                }}>
                  {f.text}
                </p>
                <span style={{ fontSize: '0.8rem', color: '#80868b' }}>
                  Adăugată: {new Date(f.createdAt).toLocaleDateString('ro-RO')}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => handleCopy(f.text, f.id)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '2px solid #d1d5db',
                    borderRadius: 6,
                    background: '#fff',
                    color: copiedId === f.id ? '#137333' : '#374151',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {copiedId === f.id ? 'Copiat!' : '📋 Copiază'}
                </button>
                <button
                  onClick={() => handleOpenInReconstruct(f.text)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '2px solid #0b4299',
                    borderRadius: 6,
                    background: '#fff',
                    color: '#0b4299',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  📝 Reconstruiește
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '2px solid #e7aba7',
                    borderRadius: 6,
                    background: '#ffe2e0',
                    color: '#c01c14',
                    cursor: 'pointer',
                  }}
                >
                  Șterge
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}