// src/components/BenefitsSection.js
import React from 'react';

const benefits = [
  { icon: '✅', title: 'Надёжность', desc: 'Гарантированная безопасность ваших поездок.' },
  { icon: '💸', title: 'Доступные цены', desc: 'Прозрачные тарифы без скрытых платежей.' },
  { icon: '🌐', title: 'Мировые направления', desc: 'Выбирайте из сотен стран и городов.' },
  { icon: '📱', title: 'Удобное приложение', desc: 'Планируй поездку прямо с телефона.' },
];

const BenefitsSection = () => (
  <section style={styles.wrapper}>
    <h3 style={styles.title}>Почему выбирают TravelPay?</h3>
    <div style={styles.cards}>
      {benefits.map((item, idx) => (
        <div key={idx} style={styles.card}>
          <span style={styles.icon}>{item.icon}</span>
          <h4>{item.title}</h4>
          <p>{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const styles = {
  wrapper: { padding: '60px 20px', textAlign: 'center', backgroundColor: '#f0f9ff' },
  title: { marginBottom: '40px' },
  cards: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    width: '220px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  icon: {
    fontSize: '32px',
    marginBottom: '10px',
    display: 'block',
  },
};

export default BenefitsSection;
