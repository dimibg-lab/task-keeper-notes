
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Проверяваме запазената тема в localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Проверяваме предпочитанията на потребителя за тъмна/светла тема
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Използваме запазената тема ако има такава, иначе използваме предпочитанията на потребителя
    return (savedTheme as Theme) || (prefersDark ? 'dark' : 'light');
  });

  useEffect(() => {
    // Запазваме темата в localStorage
    localStorage.setItem('theme', theme);
    
    // Прилагаме темата към HTML елемента
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
