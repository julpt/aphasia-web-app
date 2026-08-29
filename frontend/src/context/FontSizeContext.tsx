import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type FontSize = 'normal' | 'large' | 'extra-large';

const SIZES: Record<FontSize, string> = {
  normal: '18px',
  large: '22px',
  'extra-large': '28px',
};

interface FontSizeState {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeState | undefined>(undefined);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved as FontSize) || 'large';
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', SIZES[fontSize]);
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  function setFontSize(size: FontSize) {
    setFontSizeState(size);
  }

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const ctx = useContext(FontSizeContext);
  if (!ctx) throw new Error('useFontSize nu e in FontSizeProvider');
  return ctx;
}