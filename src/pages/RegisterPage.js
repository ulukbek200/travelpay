import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = "https://travelpay-backend-2.onrender.com";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      // ✅ Проверяем существующего пользователя
      const existing = await axios.get(`${API}/users`, {
        params: { email }
      });

      if (existing.data.length > 0) {
        setError('Пользователь с таким email уже существует');
        return;
      }

      // ✅ Новый пользователь
      const newUser = {
        name,
        email,
        password,
        balance: 0,
        avatar: 'https://www.w3schools.com/howto/img_avatar.png',
        isLoggedIn: true,
      };

      const response = await axios.post(`${API}/users`, newUser);

      localStorage.setItem('currentUser', JSON.stringify(response.data));

      window.location.href = '/profile';

    } catch (err) {
      console.error(err);
      setError('Ошибка при регистрации. Попробуйте позже.');
    }
  };

  return (
    <div style={styles.container}>
      <video
        autoPlay
        muted
        loop
        style={styles.video}
        src="https://cdn.pixabay.com/video/2024/12/24/248445_large.mp4"
      />

      <div style={styles.formBox}>
        <h2 style={styles.title}>
          Регистрация в{' '}
          <span
            style={styles.logoClickable}
            onClick={() => navigate('/')}
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
    fontFamily: "'Poppins', sans-serif",
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    filter: 'brightness(0.6)',
  },

  formBox: {
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
    padding: '30px',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '400px',
    color: 'white',
    textAlign: 'center',
  },

  title: {
    fontSize: '26px',
    fontWeight: '700',
  },

  logoClickable: {
    cursor: 'pointer',
    fontWeight: '700',
  },

  subtitle: {
    marginBottom: '20px',
  },

  error: {
    backgroundColor: '#e53935',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '15px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  input: {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
  },

  button: {
    padding: '12px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#f57c00',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
  },

  footerText: {
    marginTop: '15px',
  },

  link: {
    marginLeft: '5px',
    color: '#ffd54f',
    textDecoration: 'none',
  },
};

export default RegisterPage;