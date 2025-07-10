import React from 'react';

const HowItWorks = () => {
  const styles = {
    section: {
      maxWidth: '900px',
      margin: '60px auto',
      padding: '0 15px',
      marginLeft:'190px',
      fontFamily: "'Poppins', sans-serif",
      color: '#2c3e50',
      textAlign: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '45px',
      color: '#1e293b',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    stepsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '30px',
    },
    step: {
      background: '#ffffff',
      padding: '22px 18px 30px',
      borderRadius: '18px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      cursor: 'default',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    stepHover: {
      transform: 'translateY(-6px)',
      boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
    },
    icon: {
      fontSize: '2.6rem',
      backgroundColor: '#fbbf24',
      color: '#fff',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '18px',
      boxShadow: '0 6px 15px rgba(251, 191, 36, 0.5)',
    },
    stepTitle: {
      fontSize: '1.2rem',
      fontWeight: 700,
      marginBottom: '12px',
      color: '#1e293b',
    },
    stepText: {
      fontSize: '0.9rem',
      color: '#475569',
      marginBottom: '24px',
      lineHeight: 1.5,
      maxWidth: '230px',
    },
    button: {
      padding: '10px 24px',
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#fff',
      backgroundColor: '#f59e0b',
      border: 'none',
      borderRadius: '14px',
      boxShadow: '0 5px 14px rgba(245, 158, 11, 0.5)',
      cursor: 'pointer',
      transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
      outline: 'none',
    },
    buttonHover: {
      backgroundColor: '#d97706',
      boxShadow: '0 7px 20px rgba(217, 119, 6, 0.7)',
    },
  };

  const [hoveredIndex, setHoveredIndex] = React.useState(null);
  const [btnHoveredIndex, setBtnHoveredIndex] = React.useState(null);

  const steps = [
    {
      icon: '📍',
      title: 'Выберите направление',
      text: 'Просмотрите туры, круизы или апартаменты в любимом городе или стране.',
      button: 'Перейти к турам',
    },
    {
      icon: '🧾',
      title: 'Забронируйте онлайн',
      text: 'Быстрое и удобное бронирование без скрытых платежей.',
      button: 'Перейти к бронированию',
    },
    {
      icon: '🧳',
      title: 'Отправляйтесь в путешествие',
      text: 'Соберите чемоданы и наслаждайтесь — мы позаботимся обо всём остальном.',
      button: 'Готов к путешествию',
    },
    {
      icon: '💰',
      title: 'Накопите на поездку',
      text: 'Соберите нужную сумму за срок и забронируйте без переплат.',
      button: 'Начать копить',
    },
    {
      icon: '📦',
      title: 'Управляйте планом',
      text: 'Контролируйте накопления и редактируйте план в любое время.',
      button: 'Управление планом',
    },
    {
      icon: '🌍',
      title: 'Консультация с экспертом',
      text: 'Наши специалисты помогут выбрать направление и составят расчёт.',
      button: 'Связаться с экспертом',
    },
  ];

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Как мы работаем</h2>
      <div style={styles.stepsContainer}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              ...styles.step,
              ...(hoveredIndex === i ? styles.stepHover : {}),
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div style={styles.icon}>{step.icon}</div>
            <h3 style={styles.stepTitle}>{step.title}</h3>
            <p style={styles.stepText}>{step.text}</p>
            <button
              style={{
                ...styles.button,
                ...(btnHoveredIndex === i ? styles.buttonHover : {}),
              }}
              onMouseEnter={() => setBtnHoveredIndex(i)}
              onMouseLeave={() => setBtnHoveredIndex(null)}
              onClick={() => alert(`Вы нажали: ${step.button}`)}
            >
              {step.button}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
