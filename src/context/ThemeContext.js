// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('travelpay_theme') || localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
    localStorage.setItem('travelpay_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event?.detail === 'dark' || event?.detail === 'light') {
        setTheme(event.detail);
      }
    };

    window.addEventListener('travelpay-theme-change', handleThemeChange);
    return () => window.removeEventListener('travelpay-theme-change', handleThemeChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);


