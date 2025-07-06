import React, { useState } from 'react';

const sampleTours = [
  {
    id: 1,
    name: 'Париж — Город огней',
    country: 'Франция',
    price: '1200$',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    duration: '7 дней',
  },
  {
    id: 2,
    name: 'Магия Бали',
    country: 'Индонезия',
    price: '1500$',
    image: 'https://images.unsplash.com/photo-1578898888145-b3a9c8d5124e',
    duration: '10 дней',
  },
  {
    id: 3,
    name: 'Зимняя сказка в Швейцарии',
    country: 'Швейцария',
    price: '1800$',
    image: 'https://images.unsplash.com/photo-1608889175768-620ffbdaac87',
    duration: '6 дней',
  },
];

const ToursPage = () => {
  const [search, setSearch] = useState('');
  const [filteredTours, setFilteredTours] = useState(sampleTours);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = sampleTours.filter((tour) =>
      tour.name.toLowerCase().includes(search.toLowerCase()) ||
      tour.country.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTours(filtered);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Поиск туров</h1>

      <form style={styles.searchForm} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Введите страну или название тура"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Найти</button>
      </form>

      <div style={styles.toursGrid}>
        {filteredTours.map((tour) => (
          <div key={tour.id} style={styles.card}>
            <img src={tour.image} alt={tour.name} style={styles.image} />
            <div style={styles.cardContent}>
              <h3 style={styles.cardTitle}>{tour.name}</h3>
              <p style={styles.cardText}>{tour.country} — {tour.duration}</p>
              <p style={styles.price}>{tour.price}</p>
              <div style={styles.actions}>
                <button style={styles.favBtn}>♡</button>
                <button style={styles.detailsBtn}>Подробнее</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const styles = {
    page: {
      padding: '40px 20px',
      fontFamily: 'Poppins, sans-serif',
      backgroundColor: '#f2f8fa',
      minHeight: '100vh',
    },
    title: {
      fontSize: '32px',
      color: '#1d3557',
      textAlign: 'center',
      marginBottom: '30px',
    },
    searchForm: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '40px',
    },
    input: {
      padding: '10px 15px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      width: '280px',
      fontSize: '16px',
    },
    button: {
      backgroundColor: '#fca311',
      color: '#fff',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      cursor: 'pointer',
    },
    toursGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '14px',
      boxShadow: '0 6px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    image: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
    },
    cardContent: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    cardTitle: {
      fontSize: '20px',
      color: '#1d3557',
    },
    cardText: {
      fontSize: '15px',
      color: '#666',
    },
    price: {
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#fca311',
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '10px',
    },
    favBtn: {
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '6px',
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: '18px',
    },
    detailsBtn: {
      backgroundColor: '#1d3557',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 14px',
      cursor: 'pointer',
    },
  };
  
  export default ToursPage;