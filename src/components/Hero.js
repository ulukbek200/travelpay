import React, { useState, useEffect } from 'react';
import heroVideo from '../video/hero.mp4';

const messages = [
  'Открой мир с',
  'Путешествуй легко с',
  'Бронируй туры через',
];

const Hero = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Начинаем затемнение

      setTimeout(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setFade(true); // Появление новой фразы
      }, 500); // Время затемнения
    }, 3000); // Каждые 3 секунды

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.root}>
      <section style={styles.hero}>
        <video autoPlay loop muted playsInline style={styles.video}>
          <source src={heroVideo} type="video/mp4" />
          Ваш браузер не поддерживает видео.
        </video>

        <div style={styles.heroText}>
          <h2 style={{ ...styles.title, opacity: fade ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
            {messages[messageIndex]} <span style={styles.orange}>TravelPay</span>
          </h2>
          <p style={styles.subtitle}>Легкое и надежное бронирование</p>
          <button style={styles.button} onClick={() => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
              aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}>
            Узнать больше
          </button>
        </div>
      </section>
    </div>
  );
};

const styles = {
  root: {
    overflowX: 'hidden',
  },
  hero: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    padding: 0,
    margin: 0,
    zIndex: 1,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
    zIndex: -1,
  },
  heroText: {
    animation: 'fadeIn 2s ease-in-out',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    textAlign: 'center',
    zIndex: 2,
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  orange: {
    color: '#fca311',
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 24px',
    fontSize: '16px',
    backgroundColor: '#fca311',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default Hero;
