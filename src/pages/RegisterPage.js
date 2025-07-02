import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      setError('Пользователь с таким email уже существует');
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setError('');
    alert('Регистрация успешна! Теперь войдите в аккаунт.');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <video
        autoPlay
        muted
        loop
        style={styles.video}
        src="https://cdn.pixabay.com/video/2024/12/24/248445_large.mp4"
        type="video/webm"
      >
        Ваш браузер не поддерживает видео.
      </video>

      <div style={styles.formBox}>
        <h2 style={styles.title}>
          Регистрация в{' '}
          <span
            style={styles.logoClickable}
            onClick={() => navigate('/')}
            role="button"
          >
            TravelPay
          </span>
        </h2>
        <p style={styles.subtitle}>Создайте новый аккаунт</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Имя"
            value={formData.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Подтвердите пароль"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Зарегистрироваться
          </button>
        </form>

        <p style={styles.footerText}>
          Уже есть аккаунт?
          <a href="/login" style={styles.link}>
            Войти
          </a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: `'Poppins', sans-serif`,
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
    filter: 'brightness(0.6) contrast(1.1) saturate(1.2)',
  },
  formBox: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'rgba(255, 245, 225, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '20px 50px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
    width: '100%',
    maxWidth: '420px',
    marginTop: '-60px',
    color: '#fbe9d0',
    textAlign: 'center',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '10px',
    color: 'white',
    textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
  },
  logoClickable: {
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '30px',
    color: 'white',
    textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
  },
  error: {
    backgroundColor: '#e53935',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '14px',
    fontWeight: 600,
    marginBottom: '24px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
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
    background:
      'linear-gradient(90deg, #f57c00 0%, #ef6c00 100%)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245, 124, 0, 0.7)',
    transition: 'background 0.3s ease',
  },
  footerText: {
    marginTop: '28px',
    fontSize: '14px',
    color: '#ffecb3',
  },
  link: {
    marginLeft: '6px',
    color: '#ffd54f',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default RegisterPage;
