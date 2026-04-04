import React, { createContext, useContext, useState } from 'react';

const DesignContext = createContext(undefined);

export function DesignProvider({ children }) {
  const [mode, setMode] = useState('hifi');

  const toggleMode = () => {
    setMode((prev) => (prev === 'lofi' ? 'hifi' : 'lofi'));
  };

  return (
    <DesignContext.Provider value={{ mode, toggleMode }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}
