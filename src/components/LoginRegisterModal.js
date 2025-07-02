import React from 'react';


const LoginRegisterModal = ({ show, onClose, isLogin, toggleMode }) => {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        <form style={styles.form}>
          <input type="email" placeholder="Email" required style={styles.input} />
          <input type="password" placeholder="Пароль" required style={styles.input} />
          {!isLogin && <input type="password" placeholder="Повторите пароль" required style={styles.input} />}
          <button type="submit" style={styles.button}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <p>
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button onClick={toggleMode} style={styles.switch}>
            {isLogin ? 'Регистрация' : 'Войти'}
          </button>
        </p>
        <button onClick={onClose} style={styles.close}>✕</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    width: '90%',
    maxWidth: '400px',
    position: 'relative',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '20px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#1d3557',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  switch: {
    background: 'none',
    border: 'none',
    color: '#fca311',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
};

export default LoginRegisterModal;
