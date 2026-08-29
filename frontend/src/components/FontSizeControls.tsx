import { useFontSize } from '../context/FontSizeContext';

function FontSizeControls() {
  const { fontSize, setFontSize } = useFontSize();

  const options: { value: 'normal' | 'large' | 'extra-large'; label: string; size: string }[] = [
    { value: 'normal', label: 'A', size: '0.7rem' },
    { value: 'large', label: 'A+', size: '0.75rem' },
    { value: 'extra-large', label: 'A++', size: '0.85rem' }
  ];

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFontSize(opt.value)}
          aria-label={`Dimensiune text: ${opt.label}`}
          style={{
            padding: '4px 10px',
            fontWeight: fontSize === opt.value ? 'bold' : 'normal',
            fontSize: opt.size,
            borderRadius: 6,
            cursor: 'pointer',
            backgroundColor: fontSize === opt.value ? '#f7c204' : '#e0e0e0',
            color: fontSize === opt.value ? '#060604' : '#334155',
            border: fontSize === opt.value ? '2px solid #060604' : '1px solid #cbd5e1',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default FontSizeControls;