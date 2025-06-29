// src/pages/ActualToursPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ActualToursPage = () => {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axios.get('http://localhost:3000/tours');
        setTours(res.data);
      } catch (error) {
        console.error('Ошибка при получении туров:', error);
      }
    };

    fetchTours();
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <h2>Актуальные туры</h2>
      <div style={gridStyle}>
        {tours.map((tour) => (
          <div key={tour.id} style={cardStyle}>
            <img src={tour.image} alt={tour.title} style={imageStyle} />
            <h3>{tour.title}</h3>
            <p>{tour.description}</p>
            <p><strong>{tour.price} ₽</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
};

const imageStyle = {
  width: '100%',
  height: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
};

export default ActualToursPage;
