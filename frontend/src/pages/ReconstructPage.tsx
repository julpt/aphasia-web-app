import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';

interface ReconstructionResponse {
  id: string | null;
  inputText: string;
  outputText: string;
  modelUsed: string;
  createdAt: string;
}

const MODELS = [
  { key: 'gpt-oss-120b-groq', label: 'GPT-OSS 120B (Groq)' },
  { key: 'gpt-5.6-luna', label: 'GPT-5.6 Luna (OpenAI)' },
  { key: 'gemini-3.5-flash-lite', label: 'Gemini-3.5-flash-lite (GeminiAPI)' },
  { key: 'deepseek-v4-flash-together', label: 'Deepseek V4 Flash 0731 (TogetherAI)' },
];

function ReconstructPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [modelKey, setModelKey] = useState(MODELS[0].key);
  const [parentId, setParentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.initialText) {
      setInputText(location.state.initialText);
      if (location.state.parentId) {
        setParentId(location.state.parentId);
      }
    }
  }, [location.state]);

  async function handleReconstruct() {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch(`${API_BASE_URL}/api/reconstruct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inputText, modelKey, parentReconstructionId: parentId }),
        });

        if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || `Eroare ${res.status}`);
        }

        const data: ReconstructionResponse = await res.json();
        setOutputText(data.outputText);
        setParentId(data.id);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare');
    } finally {
        setLoading(false);
    }
  }

  function handleEdit() {
    setInputText(outputText);
    setOutputText('');
    setCopied(false);
  }

  function handleNew() {
    setInputText('');
    setOutputText('');
    setParentId(null);
    setError(null);
    setCopied(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, maxWidth: 760, width: '100%', boxSizing: 'border-box', 
    margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#202124' }}>
        Reconstrucție text
      </h1>
      <p style={{ color: '#5f6368', marginBottom: 28, marginTop: 8 }}>
        Scrie o propoziție și alege un model pentru reconstrucție
      </p>



      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md, maxWidth: 760, width: '100%'}}>
            <label htmlFor="model-select" style={{ display: 'block', fontSize: '1rem', fontWeight: 600, color: '#5f6368' }}>
            Model:
        </label>
        <select
            id="model-select"
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
            style={{
            width: '85%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc',
            fontSize: '0.75rem', fontFamily: 'inherit', color: '#202124', background: '#fff',
            boxSizing: 'border-box', marginLeft: 'auto'
            }}
        >
            {MODELS.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
            ))}
        </select>

     </div>

      
      <label htmlFor="input-text" style={{ display: 'block', fontSize: '1.25rem', fontWeight: 600, color: '#262626' }}>
        Textul tău
      </label>
      <textarea
        id="input-text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Scrie aici..."
        rows={4}
        style={{
          width: '100%', boxSizing: 'border-box', display: 'block', 
          padding: '12px 16px', borderRadius: 8, border: '1px solid #ccc',
          fontSize: '1rem', fontFamily: 'inherit', lineHeight: 1.4, resize: 'vertical',
        }}
      />

      <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
        <button
            onClick={handleReconstruct}
            disabled={loading || !inputText.trim()}
            style={{
            flex: 1, minWidth: 160, padding: '12px 20px', borderRadius: 8, border: 'none',
            fontWeight: 600, fontSize: '1rem',
            background: loading || !inputText.trim() ? '#a9b8d6' : '#0b4299',
            color: '#fff',
            cursor: loading || !inputText.trim() ? 'default' : 'pointer',
            }}
        >
            {loading ? 'Se reconstruiește...' : 'Reconstruiește'}
        </button>
        <button
            onClick={handleNew}
            style={{
            flex: 1, minWidth: 160, padding: '12px 20px', borderRadius: 8, fontWeight: 600, fontSize: '1rem',
            border: '2px solid #0b4299', background: '#fff', color: '#0b4299', cursor: 'pointer',
            }}
        >
            Propoziție nouă
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: 8, marginBottom: 16 }}>{error}</p>}

      {outputText && (
        <div style={{ marginTop: spacing.lg }}>
            <strong style={{ color: '#0b4299', display: 'block', fontSize: '1.25rem', marginBottom: spacing.md }}>
              Rezultat
            </strong>
          <div style={{
            background: '#e7f0fe', borderLeft: '6px solid #0b4299', borderRadius: '0 12px 12px 0',
            padding: '16px 20px',
          }}>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500, color: '#202124', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
              {outputText}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: spacing.lg, flexWrap: 'wrap' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 8, fontSize: '1rem', border: '2px solid #d1d5db',
                background: '#fff', color: copied ? '#137333' : '#374151', cursor: 'pointer', fontWeight: 500,
              }}
            >
              {copied ? '📋 Copiat!' : '📋 Copiază'}
            </button>
            <button
              onClick={handleEdit}
              style={{
                flex: 1, minWidth: 160, padding: '8px 10px', borderRadius: 8, fontSize: '1rem', border: 'none',
                background: '#629454', color: '#fff', cursor: 'pointer', fontWeight: 500,
              }}
            >
              ✏️ Editează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReconstructPage;