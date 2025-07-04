import React, { useState, useEffect } from 'react';

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
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setFade(true);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.root}>
      <section style={styles.hero}>
        <video autoPlay loop muted playsInline style={styles.video}>
          <source
            src="https://cdn.pixabay.com/video/2021/07/18/81945-577442929_tiny.mp4"
            type="video/mp4"
          />
          Ваш браузер не поддерживает видео.
        </video>

        <div style={styles.heroText}>
          <h2
            style={{
              ...styles.title,
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out',
            }}
          >
            {messages[messageIndex]} <span style={styles.orange}>TravelPay</span>
          </h2>
          <p style={styles.subtitle}>Мечтай, Копи, Путешествуй</p>
          <button
            style={styles.button}
            onClick={() => {
              window.open('https://travelpay.kg', '_blank');
            }}
          >
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
    fontFamily: "'Poppins', sans-serif",
  },
  hero: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    fontFamily: "'Poppins', sans-serif",
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
    filter: 'brightness(0.6)',
  },
  heroText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    textAlign: 'center',
    zIndex: 2,
    maxWidth: '90%',
    padding: '0 20px',
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    marginBottom: '10px',
  },
  orange: {
    color: '#fca311',
  },
  subtitle: {
    fontSize: '20px',
    marginBottom: '30px',
  },
  button: {
    padding: '17px',
    borderRadius: '40px',
    border: 'none',
    background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '17px',
    cursor: 'pointer',
    transition: 'background 0.3s ease, transform 0.2s ease',
  },
};

export default Hero;
