import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_BASE = 'https://travelpay-backend-production.up.railway.app';

  const handleRegister = async () => {
    const newUser = {
      name,
      email,
      password,
      balance: 0,
      isLoggedIn: true,
    };

    try {
      // Проверка: есть ли пользователь с таким email
      const res = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
      const users = await res.json();

      if (users.length > 0) {
        setError('Такой email уже зарегистрирован');
        return;
      }

      // Добавление нового пользователя
      const addRes = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (!addRes.ok) throw new Error('Ошибка при регистрации');

      const savedUser = await addRes.json();
      localStorage.setItem('currentUser', JSON.stringify(savedUser));
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Ошибка при регистрации. Попробуйте позже.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Регистрация</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleRegister} style={styles.button}>
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f4f8',
  },
  box: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '6px',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#1d3557',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
};

export default RegisterPage;
