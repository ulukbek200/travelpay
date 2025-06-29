// src/components/ThemeToggle.js
import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button onClick={toggleTheme} style={{
      backgroundColor: 'transparent',
      border: '2px solid white',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      cursor: 'pointer',
      marginRight: '10px',
    }}>
      {theme === 'light' ? '🌞 Светлая' : '🌙 Тёмная'}
    </button>
  );
};

export default ThemeToggle;
