import { useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ReconstructionItem {
  id: string;
  inputText: string;
  outputText: string;
  modelUsed: string;
  createdAt: string;
  isFavorited: boolean;
}

interface AttemptItem {
  id: string;
  exerciseType: string;
  difficulty: string;
  userAnswer: string;
  correct: boolean;
  attemptedAt: string;
}

interface DailyAttemptSummary {
  date: string;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
}

interface ReconstructionDayGroup {
  dateKey: string;
  items: ReconstructionItem[];
}

function getDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'Astăzi';
  if (isSameDay(date, yesterday)) return 'Ieri';

  return date.toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProfilePage() {
  const [reconstructions, setReconstructions] = useState<ReconstructionItem[]>([]);
  const [attempts, setAttempts] = useState<AttemptItem[]>([]);
  const [activeTab, setActiveTab] = useState<'recon' | 'exercises'>('recon');
  const [loading, setLoading] = useState(true);
  const [dailySummaries, setDailySummaries] = useState<DailyAttemptSummary[]>([]);
  const { email } = useAuth();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const hasInitializedExpanded = useRef(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenInReconstruct = (text: string, id: string) => {
    navigate('/reconstruct', { state: { initialText: text, parentId: id } });
  };

  const handleAddToFavorites = async (r: ReconstructionItem) => {
    if (r.isFavorited) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: r.outputText, reconstructionId: r.id }),
      });

      if (res.ok || res.status === 400) {
        setReconstructions((prev) =>
          prev.map((item) => (item.id === r.id ? { ...item, isFavorited: true } : item))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDay = (dateKey: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) next.delete(dateKey);
      else next.add(dateKey);
      return next;
    });
  };

  const groupedReconstructions = useMemo<ReconstructionDayGroup[]>(() => {
    const groups: ReconstructionDayGroup[] = [];
    const indexByKey = new Map<string, number>();

    for (const r of reconstructions) {
      const key = getDateKey(r.createdAt);
      if (!indexByKey.has(key)) {
        indexByKey.set(key, groups.length);
        groups.push({ dateKey: key, items: [] });
      }
      groups[indexByKey.get(key)!].items.push(r);
    }

    return groups;
  }, [reconstructions]);

  // expandă implicit doar prima zi (cea mai recentă), o singură dată la încărcare
  useEffect(() => {
    if (!hasInitializedExpanded.current && groupedReconstructions.length > 0) {
      setExpandedDays(new Set([groupedReconstructions[0].dateKey]));
      hasInitializedExpanded.current = true;
    }
  }, [groupedReconstructions]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/reconstructions/mine`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/api/exercises/attempts/mine`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/api/exercises/attempts/daily-summary`, { credentials: 'include' }).then((r) => r.ok ? r.json() : []).then((data) => setDailySummaries(Array.isArray(data) ? data : [])),
    ])
      .then(([reconData, attemptData]) => {
        setReconstructions(Array.isArray(reconData) ? reconData : []);
        setAttempts(Array.isArray(attemptData) ? attemptData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalAttempts = attempts.length;

  if (loading) return <div style={{ textAlign: 'center', marginTop: 50, fontSize: '1.1rem' }}>Se încarcă profilul...</div>;

  return (
    <div style={{ maxWidth: 760, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', boxSizing: 'border-box', }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#202124', margin: 40 }}>
          Profilul Meu
        </h1>
        {email && (
          <p style={{ fontSize: '1rem', color: '#5f6368', margin: '50px 0px 50px 0px', display: 'flex', alignItems: 'center', gap: 6 }}>
            Adresă de email: {email}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>Reconstrucții</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '4px 0 0', color: '#0b4299' }}>{reconstructions.length}</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12, padding: 16, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>Exerciții Rezolvate</span>
          <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '4px 0 0', color: '#238708' }}>{totalAttempts}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #e8eaed', marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('recon')}
          style={{
            flex: 1, textAlign: 'center', background: 'none', border: 'none',
            borderBottom: activeTab === 'recon' ? '3px solid #0b4299' : '3px solid transparent',
            padding: '10px 16px', fontSize: '1rem', fontWeight: 600,
            color: activeTab === 'recon' ? '#0b4299' : '#5f6368', cursor: 'pointer',
          }}
        >
          Istoric reconstrucții ({reconstructions.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          style={{
            flex: 1, textAlign: 'center', background: 'none', border: 'none',
            borderBottom: activeTab === 'exercises' ? '3px solid #238708' : '3px solid transparent',
            padding: '10px 16px', fontSize: '1rem', fontWeight: 600,
            color: activeTab === 'exercises' ? '#238708' : '#5f6368', cursor: 'pointer',
          }}
        >
          Istoric exerciții ({attempts.length})
        </button>
      </div>

      {activeTab === 'recon' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reconstructions.length === 0 ? (
            <p style={{ color: '#70757a', textAlign: 'center', padding: 20 }}>Nu există nicio reconstrucție înregistrată.</p>
          ) : (
            groupedReconstructions.map((group) => {
              const isExpanded = expandedDays.has(group.dateKey);
              return (
                <div key={group.dateKey}>
                  <button
                    onClick={() => toggleDay(group.dateKey)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#bfd6fb', border: 'none', borderRadius: 8, padding: '12px 16px',
                      cursor: 'pointer', fontWeight: 600, color: '#202124', fontSize: '0.95rem',
                      textTransform: 'capitalize',
                    }}
                  >
                    <span>{formatDayLabel(group.dateKey)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500, color: '#5f6368', fontSize: '0.85rem' }}>
                      {group.items.length} {group.items.length === 1 ? 'reconstrucție' : 'reconstrucții'}
                      <span style={{ display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                        ▾
                      </span>
                    </span>
                  </button>

                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 10, marginBottom: 4 }}>
                      {group.items.map((r) => (
                        <div
                          key={r.id}
                          style={{
                            background: '#fff', border: '1px solid #889cbd', borderRadius: 12,
                            padding: 16, textAlign: 'left',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: '0.7rem', background: '#f6f7f7', padding: '0px 8px', borderRadius: 6, color: '#5f6368', fontWeight: 500 }}>
                              {r.modelUsed}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#80868b' }}>
                              {new Date(r.createdAt).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontSize: '0.95rem' }}>
                            <strong style={{ color: '#5f6368', display: 'block', fontSize: '0.8rem', marginBottom: 2 }}>ORIGINAL:</strong>
                            <span style={{ color: '#3c4043' }}>{r.inputText}</span>
                          </div>

                          <div style={{ background: '#e7f0fe', borderLeft: '6px solid #0b4299', borderRadius: '0 8px 8px 0', padding: '10px 12px', fontSize: '1rem' }}>
                            <strong style={{ color: '#0b4299', display: 'block', fontSize: '0.8rem', marginBottom: 2 }}>RECONSTRUIT:</strong>
                            <span style={{ color: '#202124', fontWeight: 500 }}>{r.outputText}</span>
                          </div>

                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                            <button
                              onClick={() => handleCopy(r.outputText, r.id)}
                              style={{
                                padding: '6px 12px', fontSize: '0.85rem', border: '1px solid #d1d5db',
                                borderRadius: 6, background: '#fff', cursor: 'pointer',
                                color: copiedId === r.id ? '#137333' : '#374151', fontWeight: 500,
                              }}
                            >
                              {copiedId === r.id ? 'Copiat!' : '📋 Copiază'}
                            </button>

                            <button
                              onClick={() => handleOpenInReconstruct(r.outputText, r.id)}
                              style={{
                                padding: '6px 12px', fontSize: '0.85rem', border: 'none',
                                borderRadius: 6, background: '#629454', color: '#fff',
                                cursor: 'pointer', fontWeight: 500,
                              }}
                            >
                              ✏️ Deschide în editor
                            </button>
                            <button
                              onClick={() => handleAddToFavorites(r)}
                              disabled={r.isFavorited}
                              style={{
                                padding: '6px 12px', fontSize: '0.85rem', border: '1px solid #d1d5db',
                                borderRadius: 6, background: r.isFavorited ? '#fff8e1' : '#fff',
                                color: r.isFavorited ? '#b06000' : '#374151',
                                cursor: r.isFavorited ? 'default' : 'pointer', fontWeight: 500,
                              }}
                            >
                              {r.isFavorited ? '★ Salvat' : '☆ Salvează'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'exercises' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dailySummaries.length === 0 ? (
            <p style={{ color: '#70757a', textAlign: 'center', padding: 20 }}>
              Nu există activitate înregistrată.
            </p>
          ) : (
            dailySummaries.map((day) => {
              const formattedDate = new Date(day.date).toLocaleDateString('ro-RO', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              });
              const successRate = Math.round((day.correctCount / day.totalAttempts) * 100);

              return (
                <div
                  key={day.date}
                  style={{
                    background: '#fff', border: '1px solid #e0e0e0', borderRadius: 12,
                    padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#202124', textTransform: 'capitalize' }}>
                      {formattedDate}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#5f6368', margin: 8 }}>
                      Total exerciții: <strong>{day.totalAttempts}</strong> ({successRate}% acuratețe)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, margin: 10 }}>
                    <span style={{ background: '#e6f4ea', color: '#137333', padding: '6px 12px', borderRadius: 20, fontSize: '0.9rem', fontWeight: 600 }}>
                      {day.correctCount} corecte
                    </span>
                    {day.incorrectCount > 0 && (
                      <span style={{ background: '#fce8e6', color: '#c5221f', padding: '6px 12px', borderRadius: 20, fontSize: '0.9rem', fontWeight: 600 }}>
                        {day.incorrectCount} greșite
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}