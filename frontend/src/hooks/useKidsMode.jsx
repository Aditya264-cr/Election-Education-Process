import { createContext, useContext, useState, useCallback } from 'react';

const KidsModeContext = createContext();

export function KidsModeProvider({ children }) {
  const [isKidsMode, setIsKidsMode] = useState(false);

  const toggleKidsMode = useCallback(() => {
    setIsKidsMode(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.add('kids-mode');
      } else {
        document.body.classList.remove('kids-mode');
      }
      return next;
    });
  }, []);

  return (
    <KidsModeContext.Provider value={{ isKidsMode, toggleKidsMode }}>
      {children}
    </KidsModeContext.Provider>
  );
}

export function useKidsMode() {
  const context = useContext(KidsModeContext);
  if (!context) throw new Error('useKidsMode must be used within KidsModeProvider');
  return context;
}
