// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    try {
      const response = await axios.get(
        'https://travelpay-backend-production.up.railway.app/users',
        { params: { email, password } }
      );

      if (response.data.length === 0) {
        setError('Неверный email или пароль');
        return;
      }

      const user = response.data[0];
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Ошибка при входе. Попробуйте позже.');
    }
  };

  return (
    <div style={styles.container}>
      <video
        autoPlay
        muted
        loop
        style={styles.video}
        src="https://cdn.pixabay.com/video/2019/09/12/26818-361092071_large.mp4"
        type="video/webm"
      >
        Ваш браузер не поддерживает видео.
      </video>

      <div style={styles.overlay}></div>

      <div style={styles.formBox}>
        <h2 style={styles.title}>
          Добро пожаловать в{' '}
          <span
            style={styles.logoClickable}
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') navigate('/'); }}
          >
            TravelPay
          </span>
        </h2>
        <p style={styles.subtitle}>Пожалуйста, войдите в свой аккаунт</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Войти
          </button>
        </form>

        <p style={styles.footerText}>
          Нет аккаунта?{' '}
          <a href="/register" style={styles.link}>
            Зарегистрируйтесь
          </a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#000',
  },
  video: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    filter: 'brightness(0.65) contrast(1.1) saturate(1.2)',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 1,
  },
  formBox: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(12px)',
    padding: '48px 40px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '400px',
    marginTop: '-50px',
    color: '#fff',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    color: 'white',
    textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
  },
  logoClickable: {
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    textShadow: '1px 1px 4px rgba(0,0,0,0.5)',
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '30px',
    color: '#cfd8dc',
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
  },
  error: {
    backgroundColor: '#e63946',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '14px',
    fontWeight: 600,
    marginBottom: '24px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
    zIndex: 3,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  input: {
    padding: '14px 18px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    outline: 'none',
    fontWeight: '500',
    color: '#333',
  },
  button: {
    padding: '14px',
    borderRadius: '40px',
    border: 'none',
    background: 'linear-gradient(90deg, #FF6F3C 0%, #FFA500 100%)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 111, 60, 0.6)',
    transition: 'background 0.3s ease',
  },
  footerText: {
    marginTop: '28px',
    fontSize: '14px',
    color: '#ddd',
  },
  link: {
    marginLeft: '6px',
    color: '#FF6F3C',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default LoginPage;
