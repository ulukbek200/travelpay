import React from 'react';

const HowItWorks = () => {
  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Как мы работаем</h2>
      <div style={styles.stepsContainer}>
        <div style={styles.step}>
          <div style={styles.icon}>📍</div>
          <h3 style={styles.stepTitle}>Выберите направление</h3>
          <p style={styles.stepText}>Просмотрите туры, круизы или апартаменты в любимом городе или стране.</p>
          <button style={styles.button}>Перейти к турам</button>
        </div>
        <div style={styles.step}>
          <div style={styles.icon}>🧾</div>
          <h3 style={styles.stepTitle}>Забронируйте онлайн</h3>
          <p style={styles.stepText}>Быстрое и удобное бронирование без скрытых платежей.</p>
          <button style={styles.button}>Перейти к бронированию</button>
        </div>
        <div style={styles.step}>
          <div style={styles.icon}>🧳</div>
          <h3 style={styles.stepTitle}>Отправляйтесь в путешествие</h3>
          <p style={styles.stepText}>Соберите чемоданы и наслаждайтесь — мы позаботимся обо всём остальном.</p>
          <button style={styles.button}>Готов к путешествию</button>
        </div>
        <div style={styles.step}>
          <div style={styles.icon}>💰</div>
          <h3 style={styles.stepTitle}>Накопите на поездку</h3>
          <p style={styles.stepText}>Соберите нужную сумму за срок и забронируйте без переплат.</p>
          <button style={styles.button}>Начать копить</button>
        </div>
        <div style={styles.step}>
          <div style={styles.icon}>📦</div>
          <h3 style={styles.stepTitle}>Управляйте планом</h3>
          <p style={styles.stepText}>Контролируйте накопления и редактируйте план в любое время.</p>
          <button style={styles.button}>Управление планом</button>
        </div>
        <div style={styles.step}>
          <div style={styles.icon}>🌍</div>
          <h3 style={styles.stepTitle}>Консультация с экспертом</h3>
          <p style={styles.stepText}>Наши специалисты помогут выбрать направление и составят расчёт.</p>
          <button style={styles.button}>Связаться с экспертом</button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '60px 20px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    marginBottom: '40px',
    color: '#1d3557',
  },
  stepsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '30px',
    justifyContent: 'center',
  },
  step: {
    backgroundColor: '#f5f5f5',
    padding: '30px 20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
  },
  icon: {
    fontSize: '40px',
    marginBottom: '15px',
  },
  stepTitle: {
    fontSize: '22px',
    marginBottom: '10px',
    color: '#fca311',
    fontWeight: '600',
  },
  stepText: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '15px',
  },
  button: {
    backgroundColor: '#1d3557',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
};

export default HowItWorks;
