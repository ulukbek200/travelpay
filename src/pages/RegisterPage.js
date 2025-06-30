import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    const user = {
      name,
      email,
      password,
      balance: 0,
      isLoggedIn: true, // 🟡 Добавлено поле isLoggedIn
    };

    try {
      const API_BASE = "https://travelpay-backend-production.up.railway.app";
      const res = await fetch(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
            const existingUsers = await res.json();
    
      if (existingUsers.length > 0) {
        alert('Такой email уже зарегистрирован');
        return;
      }
    
      const addRes = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      
    

      if (!addRes.ok) throw new Error('Ошибка при регистрации');

      const savedUser = await addRes.json();
      localStorage.setItem('currentUser', JSON.stringify(savedUser));
      navigate('/profile');
    } catch (error) {
      console.error(error);
      alert('Ошибка при регистрации');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Регистрация</h2>
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
        <button style={styles.button} onClick={handleRegister}>
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
};

export default RegisterPage;
