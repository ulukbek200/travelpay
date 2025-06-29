import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ActualToursAdmin = () => {
  const [tours, setTours] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    price: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await axios.get('http://localhost:3000/tours');
      setTours(res.data);
    } catch (err) {
      console.error('Ошибка при загрузке туров:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.price || !formData.image) {
      setError('Пожалуйста, заполните все поля и выберите изображение.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/tours', formData);
      fetchTours();
      setFormData({ title: '', description: '', image: '', price: '' });
      setError('');
    } catch (err) {
      console.error('Ошибка при добавлении тура:', err);
      setError('Ошибка при добавлении тура.');
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Управление актуальными турами</h2>

      {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Название"
          required
          style={inputStyle}
        />
        <input
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Цена"
          required
          style={inputStyle}
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Описание"
          required
          style={inputStyle}
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Добавить тур</button>
      </form>

      <div style={gridStyle}>
        {tours.map((tour) => (
          <div key={tour.id} style={cardStyle}>
            <img
              src={tour.image}
              alt={tour.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <h3>{tour.title}</h3>
            <p>{tour.description}</p>
            <p><strong>{tour.price} ₽</strong></p>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#1d3557',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px'
};

const cardStyle = {
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

export default ActualToursAdmin;
