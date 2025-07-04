import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Админ Панель</h1>

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate('/admin/tours')}>
          <h3>Управление турами</h3>
          <p>Добавляй, редактируй и удаляй туры</p>
        </div>

        <div style={styles.card} onClick={() => alert('Скоро будет доступно')}>
          <h3>Пользователи</h3>
          <p>Просмотр и управление пользователями</p>
        </div>

        <div style={styles.card} onClick={() => navigate('/admin/tours')}> {/* Повторно можно перенаправить туда */}
          <h3>Статистика</h3>
          <p>Популярные туры и аналитика</p>
        </div>
      </div>

      <button onClick={() => navigate('/')} style={styles.logout}>
        Выйти из админ панели
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    fontFamily: 'sans-serif',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    textAlign: 'center',
  },
  heading: {
    fontSize: '32px',
    marginBottom: '30px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out',
  },
  logout: {
    backgroundColor: '#1d3557',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    cursor: 'pointer',
  }
};

export default AdminDashboard;
