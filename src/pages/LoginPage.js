import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      <video autoPlay muted loop style={styles.video}>
        <source src="/background.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>

      <div style={styles.overlay}></div>

      <div style={styles.formBox}>
        <h2>Вход</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Войти
          </button>
        </form>
        <p>
          Нет аккаунта? <a href="/register" style={{ color: '#fff' }}>Зарегистрируйтесь</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  formBox: {
    position: 'relative',
    zIndex: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    color: '#fff',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px',
  },
  input: {
    padding: '10px 14px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#1d3557',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};

export default LoginPage;
