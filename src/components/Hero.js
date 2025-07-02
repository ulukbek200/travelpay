import React, { useState, useEffect } from 'react';

const messages = [
  'Открой мир с',
  'Путешествуй легко с',
  'Бронируй туры через',
];

const Hero = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isHover, setIsHover] = useState(false);

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
        {/* 🔄 Новый видеофон */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={styles.video}
        >
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
          <p style={styles.subtitle}>Легкое и надежное бронирование</p>
          <button
            style={isHover ? { ...styles.button, ...styles.buttonHover } : styles.button}
            onClick={() => {
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
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
  },
  hero: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    margin: 0,
    padding: 0,
    fontFamily: `'Poppins', 'Montserrat', sans-serif`,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
    zIndex: -1,
    filter: 'brightness(0.6)', // затемнение для читаемости текста
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
  },
  title: {
    fontSize: '48px',
    fontWeight: 700,
    marginBottom: '30px',
    lineHeight: '1.2',
  },
  orange: {
    color: '#fca311',
  },
  subtitle: {
    fontSize: '22px',
    marginBottom: '40px',
    fontWeight: 500,
  },
  button: {
    padding: '14px 50px',
    fontSize: '18px',
    backgroundColor: '#fca311',
    color: '#1d3557',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(252,163,17,0.5)',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
  buttonHover: {
    backgroundColor: '#e5940f',
    transform: 'scale(1.05)',
  },
};

export default Hero;

