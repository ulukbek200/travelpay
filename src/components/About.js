import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import years from '../images/years.jpg';
import team from '../images/team.jpg';
import members from '../images/members.jpg';

const directionsData = [
  { country: 'Россия', tours: 120 },
  { country: 'Казахстан', tours: 98 },
  { country: 'Греция', tours: 85 },
  { country: 'Узбекистан', tours: 90 },
  { country: 'Таджикистан', tours: 70 },
];

const clientsData = [
  { name: 'СНГ', value: 50 },
  { name: 'Азия', value: 25 },
  { name: 'Европа', value: 15 },
  { name: 'Америка', value: 10 },
];

const BUSINESS_COLORS = [
  '#1F77B4', 
  '#FF7F0E', 
  '#2CA02C', 
  '#D62728', 
  '#9467BD', 
];

const AboutSection = () => {
  return (
    <section style={styles.section} id="about">
      <h2 style={styles.title}>О компании TravelPay</h2>

      <p style={styles.description} className="fade-in">
        TravelPay — ваш надёжный партнёр в сфере туризма. Мы предлагаем лучшие условия для бронирования туров, круизов и апартаментов по всему миру. Более 10 лет на рынке, более 150 партнёров и тысячи довольных клиентов.
      </p>

      <div style={styles.statsContainer}>
        <div style={styles.statCard} className="fade-in">
          <h3 style={styles.statNumber}>10+</h3>
          <p>Лет на рынке</p>
        </div>
        <div style={styles.statCard} className="fade-in">
          <h3 style={styles.statNumber}>150+</h3>
          <p>Сотрудников и партнёров</p>
        </div>
        <div style={styles.statCard} className="fade-in">
          <h3 style={styles.statNumber}>50 000+</h3>
          <p>Довольных клиентов</p>
        </div>
      </div>

      <div style={styles.photoGallery}>
        <img src={years} alt="Годы работы" style={styles.photo} className="fade-in" />
        <img src={team} alt="Команда" style={styles.photo} className="fade-in" />
        <img src={members} alt="Партнёры" style={styles.photo} className="fade-in" />
      </div>

      <div style={styles.chartBlock}>
        <div style={styles.textBlock}>
          <h3 style={styles.chartTitle}>Наши направления:</h3>
          <p style={styles.chartDescription}>
            Мы работаем по всему миру — от Европы до Азии и СНГ. Тысячи туров и направлений под любой вкус.
          </p>
        </div>
        <div style={styles.chartContent}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={directionsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tours" radius={[4, 4, 0, 0]}>
                {directionsData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={BUSINESS_COLORS[index % BUSINESS_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.chartBlock}>
        <div style={styles.textBlock}>
          <h3 style={styles.chartTitle}>Откуда наши клиенты:</h3>
          <p style={styles.chartDescription}>
            Более 50 000 клиентов со всего мира. Прозрачная статистика и рост доверия.
          </p>
        </div>
        <div style={styles.chartContent}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clientsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {clientsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BUSINESS_COLORS[index % BUSINESS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    padding: '80px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
    marginLeft:'70px',
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: '38px',
    marginBottom: '25px',
    color: '#1d3557',
    textAlign: 'center',
  },
  description: {
    maxWidth: '850px',
    margin: '0 auto 40px',
    fontSize: '18px',
    color: '#555',
    lineHeight: '1.7',
    textAlign: 'center',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '45px',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 6px 14px rgba(0,0,0,0.06)',
    width: '200px',
  },
  statNumber: {
    fontSize: '30px',
    color: '#fca311',
  },
  photoGallery: {
    display: 'flex',
    justifyContent: 'center',
    gap: '18px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  photo: {
    width: '255px',
    height: '170px',
    borderRadius: '12px',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  chartBlock: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '60px',
    flexWrap: 'wrap',
    background: 'linear-gradient(135deg, #f5f7fa, #e8edf3)',
    borderRadius: '24px',
    boxShadow: '0 12px 32px rgba(0,0,0,0.05)',
    padding: '40px',
  },
  textBlock: {
    flex: '1 1 400px',
  },
  chartTitle: {
    fontSize: '28px',
    color: '#1d3557',
    marginBottom: '16px',
  },
  chartDescription: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#555',
  },
  chartContent: {
    flex: '1 1 500px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
    padding: '20px',
  },
};

export default AboutSection;
