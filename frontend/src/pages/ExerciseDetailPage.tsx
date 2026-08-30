import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { getSeenIds, addSeenId, clearSeenIds } from '../utils/sessionTracking';

interface MultipleChoiceContent {
  prompt: string;
  options: string[];
}

interface FillInBlankContent {
  promptWithBlank: string;
}

interface ExerciseDetail {
  id: string;
  exerciseType: string;
  difficulty: string;
  content: MultipleChoiceContent | FillInBlankContent;
}

interface AttemptResult {
  correct: boolean;
  correctAnswer: string;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy: { label: 'Ușor', color: '#08a62f' },
  medium: { label: 'Mediu', color: '#c87603' },
  hard: { label: 'Dificil', color: '#c51616' },
};

function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<{ text: string; originalIndex: number }[]>([]);

  const navigate = useNavigate();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setExercise(null);
    setLoadError(null);
    setResult(null);
    setSelectedIndex(null);
    setTextAnswer('');

    fetch(`${API_BASE_URL}/api/exercises/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Eroare ${res.status} -- exercițiul nu a putut fi încărcat`);
        return res.json();
      })
      .then(setExercise)
      .catch((err) => setLoadError(err.message));
  }, [id]);

  useEffect(() => {
    if (exercise?.exerciseType === 'multiple_choice') {
      const opts = (exercise.content as MultipleChoiceContent).options;
      const withIndex = opts.map((text, originalIndex) => ({ text, originalIndex }));
      for (let i = withIndex.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [withIndex[i], withIndex[j]] = [withIndex[j], withIndex[i]];
      }
      setShuffledOptions(withIndex);
    }
  }, [exercise]);

  if (!exercise) return <p>Se încarcă...</p>;

  async function handleNext() {
    if (!exercise) return;
    addSeenId(exercise.exerciseType, exercise.id);
    const seenIds = getSeenIds(exercise.exerciseType);
    const query = `?type=${exercise.exerciseType}&exclude=${seenIds.join(',')}`;
    const res = await fetch(`${API_BASE_URL}/api/exercises/random${query}`);

    if (res.status === 204) {
        setFinished(true);
        return;
    }
    const data = await res.json();
    navigate(`/exercises/${data.id}`);
    }

    function handleRestart() {
    if (!exercise) return;
    clearSeenIds(exercise.exerciseType);
    navigate('/exercises');
    }
  
  const diffKey = exercise.difficulty.toLowerCase();
  const diffInfo = DIFFICULTY_CONFIG[diffKey] || { 
    label: exercise.difficulty, 
    color: '#2368d7' 
  };

  async function handleSubmit() {
    setError(null);
    if (exercise?.exerciseType === 'multiple_choice' && selectedIndex === null) {
        setError('Alege o variantă.');
        return;
    }

    const answer = exercise?.exerciseType === 'multiple_choice' ? String(selectedIndex) : textAnswer;

    const res = await fetch(`${API_BASE_URL}/api/exercises/${id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answer }),
    });

    if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        setError(errBody?.message || 'Eroare la trimiterea răspunsului.');
        return;
    }

    setResult(await res.json());
  }

  if (loadError) return <p style={{ color: 'red' }}>Eroare la încărcare: {loadError}</p>;
  if (!exercise) return <p>Se încarcă...</p>;

  return (
    <div style={{ maxWidth: 600, width: '100%', boxSizing: 'border-box', margin: '40px auto', fontFamily: 'sans-serif'}}>
      <Link to="/exercises" style={{textDecoration: 'none', fontWeight: 500, fontSize: '1.25rem', color:'#10327d'}}
      >← Înapoi la exerciții</Link>
      <h1>Exercițiu</h1>
      <p style={{ margin: '20px 0', fontSize: '1rem', color: '#64748b' }}>
        Dificultate:{' '}
        <span
            style={{
            color: diffInfo.color,
            backgroundColor: `${diffInfo.color}15`,
            border: `1px solid ${diffInfo.color}`,
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 'bold',
            textTransform: 'capitalize'
            }}
        >
            {exercise.difficulty}
        </span>
        </p>

      {exercise.exerciseType === 'multiple_choice' && (
        <>
          <p style={{ fontSize: '1.3rem' }}>{(exercise.content as MultipleChoiceContent).prompt}</p>
          <div style={{  margin: '20px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shuffledOptions.map((opt) => (
              <label
                key={opt.originalIndex}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, cursor: 'pointer',
                    fontSize: '1.05rem', transition: 'all 0.2s ease',

                    color: selectedIndex === opt.originalIndex ? '#074ca6' : '#1e293b',
                    fontWeight: selectedIndex === opt.originalIndex ? 600 : 400,
                    backgroundColor: selectedIndex === opt.originalIndex ? '#eff6ff' : '#ffffff',
                    border: selectedIndex === opt.originalIndex ? '2px solid #074ca6' : '2px solid #cbd5e1',
                  }}
                >
                <input
                    type="radio"
                    name="option"
                    checked={selectedIndex === opt.originalIndex}
                    onChange={() => setSelectedIndex(opt.originalIndex)}
                    style={{ accentColor: '#074ca6', width: 18, height: 18, cursor: 'pointer' }}
                />
                {opt.text}
                </label>
            ))}
          </div>
        </>
      )}

      {exercise.exerciseType === 'fill_in_blank' && (
        <>
          <p style={{ fontSize: '1.3rem' }}>{(exercise.content as FillInBlankContent).promptWithBlank}</p>
          <input
            type="text" value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Completează spațiul liber"
            style={{ width: '100%', padding: 8, fontSize: '1.1rem' }}
          />
        </>
      )}

      {!result && <button onClick={handleSubmit} style={{ margin: '20px 0',  fontSize: '1.3rem', 
      backgroundColor: '#abdd72', color: '#1d1d1d', border: '3px solid #6aaa21', 
      borderRadius: 14,  padding: '12px 24px', cursor: 'pointer' }}
      >
        Trimite răspunsul</button>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && !finished && (
        <>
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: result.correct ? '#d4f7d4' : '#f7d4d4' }}>
                <p>{result.correct ? '✅ Corect!' : '❌ Greșit.'}</p>
                {!result.correct && <p>Răspunsul corect: <strong>{result.correctAnswer}</strong></p>}
            </div>
            <button onClick={handleNext} 
            style={{ margin: '20px 0',  fontSize: '1.3rem'  , backgroundColor: '#f1cf53', color: '#1d1d1d', border: 'none', borderRadius: 12,  padding: '12px 24px', cursor: 'pointer'}}
            >
                Exercițiul următor</button>
        </>
        )}

        {finished && (
        <>
            <div style={{ marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#c9dbf3' }}>
                <p>Ai parcurs toate exercițiile disponibile de acest tip!</p> 
            </div>
            <button onClick={handleRestart}
            style={{ margin: '20px 0',  fontSize: '1.3rem'  , backgroundColor: '#f1cf53', color: '#1d1d1d', border: 'none', borderRadius: 12,  padding: '12px 24px', cursor: 'pointer'}}
            >Reia de la început</button>
        </>
        )}
    </div>
  );
}

export default ExerciseDetailPage;