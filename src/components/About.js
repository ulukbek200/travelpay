import React from 'react';
import DirectionsChart from './DirectionsChart';
import ClientsChart from './ClientsChart';
import years from '../images/years.avif'
import team from '../images/team.webp'
import members from '../images/members.jpg'


const AboutSection = () => {
  return (
    <section style={styles.section} id="about">
      <h2 style={styles.title}>О компании TravelPay</h2>

      <p style={styles.description} className="fade-in">
        TravelPay — ваш надежный партнер в сфере туризма. Мы предоставляем лучшие условия для бронирования туров, круизов и апартаментов по всему миру. Более 10 лет на рынке, более 150 партнеров и тысяч довольных клиентов.
      </p>

      <div style={styles.statsContainer}>
        <div style={styles.statCard} className="fade-in"> <h3 style={styles.statNumber}>10+</h3><p>Лет на рынке</p> </div>
        <div style={styles.statCard} className="fade-in"> <h3 style={styles.statNumber}>150+</h3><p>Сотрудников и партнёров</p> </div>
        <div style={styles.statCard} className="fade-in"> <h3 style={styles.statNumber}>50 000+</h3><p>Довольных клиентов</p> </div>
      </div>

      <div style={styles.photoGallery}>
        <img src={years} alt="Команда" style={styles.photo} className="fade-in" />
        <img src={team} alt="Руководитель" style={styles.photo} className="fade-in" />
        <img src={members} alt="Работа в офисе" style={styles.photo} className="fade-in" />
      </div>

      <div style={styles.innovationBlock} className="fade-in">
        <h3 style={styles.valuesTitle}>Что делает нас особенными?</h3>
        <div style={styles.innovationItems}>
          <div style={styles.innovationItem}>🚢 Собственная система бронирования круизов</div>
          <div style={styles.innovationItem}>💡 Уникальные предложения только для наших клиентов</div>
          <div style={styles.innovationItem}>📈 AI-помощник для подбора идеального тура</div>
          <div style={styles.innovationItem}>🎥 Виртуальные туры по направлениям</div>
          <div style={styles.innovationItem}>🧭 Быстрый поиск по предпочтениям</div>
          <div style={styles.innovationItem}>📊 Гибкая система аналитики и отчётов</div>
          <div style={styles.innovationItem}>🎫 Мгновенное бронирование и подтверждение</div>
          <div style={styles.innovationItem}>🎉 Программы лояльности и бонусы</div>
        </div>
      </div>

      <div style={styles.whyUs} className="fade-in">
        <h3 style={styles.valuesTitle}>Почему выбирают нас</h3>
        <div style={styles.reasons}>
          <div style={styles.reasonCard} className="pulse">🌐 Работаем по всему миру</div>
          <div style={styles.reasonCard} className="pulse">🔐 Безопасные платежи</div>
          <div style={styles.reasonCard} className="pulse">💬 Поддержка 24/7</div>
          <div style={styles.reasonCard} className="pulse">🎯 Индивидуальный подход</div>
        </div>
      </div>

      <div style={styles.chartsContainer} className="fade-in">
        <div style={styles.chartWrapper}>
          <h3 style={styles.chartTitle}>Наши направления</h3>
          <DirectionsChart />
        </div>
        <div style={styles.chartWrapper}>
          <h3 style={styles.chartTitle}>Откуда наши клиенты</h3>
          <ClientsChart />
        </div>
      </div>

      <div style={styles.timeline} className="fade-in">
        <h3 style={styles.valuesTitle}>Ключевые этапы развития</h3>
        <div style={styles.timelineGrid}>
          <div style={styles.timelineItem}><strong>2013</strong><p>Основание компании и первые шаги в сфере туризма</p></div>
          <div style={styles.timelineItem}><strong>2015</strong><p>Достигнута отметка в 100 постоянных клиентов</p></div>
          <div style={styles.timelineItem}><strong>2018</strong><p>Выход на международный рынок и новые партнёры</p></div>
          <div style={styles.timelineItem}><strong>2020</strong><p>Открытие филиалов в 3 странах</p></div>
          <div style={styles.timelineItem}><strong>2022</strong><p>Запуск новой платформы TravelPay</p></div>
          <div style={styles.timelineItem}><strong>2024</strong><p>Более 50 000 активных пользователей</p></div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '60px 0px',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
    fontFamily: `'Poppins', sans-serif`,
  },
  title: {
    fontSize: '36px',
    marginBottom: '30px',
    marginLeft:'60px',
    color: '#1d3557',
    fontFamily: `'Poppins', sans-serif`,
  },
  description: {
    maxWidth: '800px',
    margin: '45px',
    marginLeft:'260px',
    fontFamily: `'Poppins', sans-serif`,
    fontSize: '18px',
    color: '#333',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '40px',
    marginLeft:'70px',
    flexWrap: 'wrap',
    fontFamily: `'Poppins', sans-serif`,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '17px',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '200px',
    fontFamily: `'Poppins', sans-serif`,
  },
  statNumber: {
    fontSize: '28px',
    color: '#fca311',
    fontFamily: `'Poppins', sans-serif`,
  },
  photoGallery: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  photo: {
    width: '200px',
    height: '190px',
    marginLeft:'70px',
    borderRadius: '12px',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },


  innovationBlock: {
    padding: '30px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '1px',
    marginBottom: '40px',
    marginLeft: '50px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    fontFamily: `'Poppins', sans-serif`,
  },
  innovationItems: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '50px',
    marginTop: '40px',
    marginLeft:'20px'
  },
  innovationItem: {
    backgroundColor: '#1d3557',
    color: '#fff',
    padding: '19px',
    borderRadius: '15px',
    fontSize: '15px',
    transition: 'transform 0.3s ease',
    fontFamily: `'Poppins', sans-serif`,
  },
  valuesTitle: {
    fontSize: '28px',
    color: '#1d3557',
    marginBottom: '18px',
    fontFamily: `'Poppins', sans-serif`,
  },
  whyUs: {
    padding: '20px 90px',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
    marginBottom: '40px',
    marginLeft:'60px',
    fontFamily: `'Poppins', sans-serif`,
  },
  reasons: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '20px',
  },
  reasonCard: {
    backgroundColor: '#fca311',
    color: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '220px',
    fontSize: '16px',
    fontFamily: `'Poppins', sans-serif`,
  },
  chartsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '60px',
    marginBottom: '60px',
    flexWrap: 'wrap',
    fontFamily: `'Poppins', sans-serif`,
  },
  chartWrapper: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '320px',
    fontFamily: `'Poppins', sans-serif`,
  },
  chartTitle: {
    color: '#1d3557',
    marginBottom: '20px',
    marginLeft:'60px',
    fontFamily: `'Poppins', sans-serif`,
  },
  timeline: {
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto 70px',
    fontSize: '16px',
    marginLeft: '60px',
    color: '#444',
      
  },
  timelineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '30px',
    marginTop: '60px',
    marginLeft: '20px'
  },
  timelineItem: {
    backgroundColor:' #1d3557', // элегантный, нейтральный,
    color: '#fff',
    padding: '17px',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s ease',
    fontFamily: `'Poppins', sans-serif`,
  },
};

export default AboutSection;