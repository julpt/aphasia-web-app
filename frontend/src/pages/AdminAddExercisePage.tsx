import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

const EXERCISE_TYPES = [
  { value: 'multiple_choice', label: 'Alegere multiplă' },
  { value: 'fill_in_blank', label: 'Completează propoziția' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Ușor' },
  { value: 'medium', label: 'Mediu' },
  { value: 'hard', label: 'Dificil' },
];

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

function AdminAddExercisePage() {
  const navigate = useNavigate();

  const [exerciseType, setExerciseType] = useState('multiple_choice');
  const [difficulty, setDifficulty] = useState('easy');

  // multiple_choice
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  // fill_in_blank
  const [promptWithBlank, setPromptWithBlank] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setPrompt('');
    setOptions(['', '']);
    setCorrectIndex(0);
    setPromptWithBlank('');
    setCorrectAnswer('');
  }

  function handleOptionChange(idx: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? value : o)));
  }

  function handleAddOption() {
    setOptions((prev) => [...prev, '']);
  }

  function handleRemoveOption(idx: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
    if (correctIndex >= options.length - 1) setCorrectIndex(0);
  }

  function validate(): string | null {
    if (exerciseType === 'multiple_choice') {
      if (!prompt.trim()) return 'Introdu întrebarea.';
      if (options.some((o) => !o.trim())) return 'Toate opțiunile trebuie completate.';
      if (correctIndex < 0 || correctIndex >= options.length) return 'Alege răspunsul corect.';
    } else {
      if (!promptWithBlank.trim()) return 'Introdu propoziția cu spațiu liber.';
      if (!promptWithBlank.includes('___')) return 'Propoziția trebuie să conțină "___" pentru spațiul liber.';
      if (!correctAnswer.trim()) return 'Introdu răspunsul corect.';
    }
    return null;
  }

  async function handleSubmit() {
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const content =
      exerciseType === 'multiple_choice'
        ? { prompt: prompt.trim(), options: options.map((o) => o.trim()), correctIndex }
        : { promptWithBlank: promptWithBlank.trim(), correctAnswer: correctAnswer.trim() };

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ exerciseType, difficulty, content }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || `Eroare ${res.status}`);
      }

      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la salvare.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, maxWidth: 760, width: '100%', boxSizing: 'border-box', margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#202124', margin: 0 }}>
          Adaugă exercițiu
        </h1>
        <p style={{ color: '#5f6368', margin: `${spacing.sm}px 0 0` }}>
          Doar administratorii pot adăuga exerciții noi.
        </p>
      </div>

      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="exercise-type" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#5f6368', marginBottom: spacing.xs }}>
            Tip exercițiu
          </label>
          <select
            id="exercise-type"
            value={exerciseType}
            onChange={(e) => { setExerciseType(e.target.value); setError(null); }}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit', color: '#202124', background: '#fff', boxSizing: 'border-box' }}
          >
            {EXERCISE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="difficulty" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#5f6368', marginBottom: spacing.xs }}>
            Dificultate
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit', color: '#202124', background: '#fff', boxSizing: 'border-box' }}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {exerciseType === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <div>
            <label htmlFor="mc-prompt" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#5f6368', marginBottom: spacing.xs }}>
              Întrebare
            </label>
            <textarea
              id="mc-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="Care este forma corectă a verbului...?"
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit', lineHeight: 1.4, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#5f6368', marginBottom: spacing.xs }}>
              Opțiuni (bifează răspunsul corect)
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <input
                    type="radio"
                    name="correct-option"
                    checked={correctIndex === idx}
                    onChange={() => setCorrectIndex(idx)}
                    style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0b4299', flexShrink: 0 }}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Opțiunea ${idx + 1}`}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    disabled={options.length <= 2}
                    style={{
                      padding: '8px 12px', fontSize: '0.85rem', border: '1px solid #e7aba7', borderRadius: 6,
                      background: options.length <= 2 ? '#f5f5f5' : '#ffe2e0',
                      color: options.length <= 2 ? '#aaa' : '#c01c14',
                      cursor: options.length <= 2 ? 'default' : 'pointer', flexShrink: 0,
                    }}
                  >
                    Șterge
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              style={{ marginTop: spacing.sm, padding: '8px 12px', fontSize: '0.85rem', border: '1px solid #0b4299', borderRadius: 6, background: '#fff', color: '#0b4299', cursor: 'pointer', fontWeight: 600 }}
            >
              + Adaugă opțiune
            </button>
          </div>
        </div>
      )}

      {exerciseType === 'fill_in_blank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          <div>
            <label htmlFor="fib-prompt" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#5f6368', marginBottom: spacing.xs }}>
              Scrie propoziția: ("___" pentru spațiul liber)
            </label>
            <textarea
              id="fib-prompt"
              value={promptWithBlank}
              onChange={(e) => setPromptWithBlank(e.target.value)}
              rows={2}
              placeholder="Propoziția ___ un cuvânt lipsă."
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit', lineHeight: 1.4, resize: 'vertical' }}
            />
          </div>
          <div>
            <label htmlFor="fib-answer" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#5f6368', marginBottom: spacing.xs }}>
              Răspuns corect
            </label>
            <input
              id="fib-answer"
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="are"
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc', fontSize: '1rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>
      )}

      {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
      {success && <p style={{ color: '#137333', margin: 0, fontWeight: 600 }}>✅ Exercițiu salvat cu succes.</p>}

      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            flex: 1, minWidth: 160, padding: '12px 20px', borderRadius: 8, border: 'none',
            fontWeight: 600, fontSize: '1.05rem',
            background: submitting ? '#a9b8d6' : '#0b4299', color: '#fff',
            cursor: submitting ? 'default' : 'pointer',
          }}
        >
          {submitting ? 'Se salvează...' : 'Salvează exercițiul'}
        </button>
        <button
          onClick={() => navigate('/exercises')}
          style={{
            flex: 1, minWidth: 160, padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: '1.05rem',
            border: '1px solid #0b4299', background: '#fff', color: '#0b4299', cursor: 'pointer',
          }}
        >
          Înapoi la exerciții
        </button>
      </div>
    </div>
  );
}

export default AdminAddExercisePage;