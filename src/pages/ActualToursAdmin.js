// AdminToursPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://travelpay-backend-production.up.railway.app/tours';

const AdminToursPage = () => {
  const [tours, setTours] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    duration: '',
    description: '',
    price: '',
    image: '',
    sales: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const res = await axios.get(API_URL);
      setTours(res.data);
    } catch (err) {
      console.error('Ошибка загрузки туров:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        setEditingId(null);
      } else {
        await axios.post(API_URL, formData);
      }
      setFormData({ title: '', country: '', duration: '', description: '', price: '', image: '', sales: 0 });
      fetchTours();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  const handleEdit = (tour) => {
    setFormData(tour);
    setEditingId(tour.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить тур?')) {
      await axios.delete(`${API_URL}/${id}`);
      fetchTours();
    }
  };

  const sortedTours = [...tours].sort((a, b) => b.sales - a.sales);

  return (
    <div style={styles.wrapper}>
      <h1 style={styles.heading}>Админ: Управление турами</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input name="title" placeholder="Название тура" value={formData.title} onChange={handleChange} required />
        <input name="country" placeholder="Страна" value={formData.country} onChange={handleChange} required />
        <input name="duration" placeholder="Длительность" value={formData.duration} onChange={handleChange} required />
        <textarea name="description" placeholder="Описание" value={formData.description} onChange={handleChange} required />
        <input name="price" placeholder="Цена" value={formData.price} onChange={handleChange} required />
        <input name="image" placeholder="Ссылка на изображение" value={formData.image} onChange={handleChange} required />
        <button type="submit" style={styles.submitBtn}>
          {editingId ? 'Сохранить изменения' : 'Добавить тур'}
        </button>
      </form>

      <h2 style={styles.subheading}>Статистика по продажам</h2>
      <ul style={styles.statsList}>
        {sortedTours.map(t => (
          <li key={t.id}>{t.title} — <b>{t.sales}</b> продаж</li>
        ))}
      </ul>

      <div style={styles.cardGrid}>
        {tours.map((tour) => (
          <div key={tour.id} style={styles.card}>
            <img src={tour.image} alt={tour.title} style={styles.image} />
            <h3>{tour.title}</h3>
            <p><b>Страна:</b> {tour.country}</p>
            <p><b>Длительность:</b> {tour.duration}</p>
            <p><b>Цена:</b> {tour.price} сом</p>
            <p><b>Продажи:</b> {tour.sales}</p>
            <p>{tour.description}</p>
            <div style={styles.cardActions}>
              <button onClick={() => handleEdit(tour)} style={styles.editBtn}>✏️</button>
              <button onClick={() => handleDelete(tour.id)} style={styles.deleteBtn}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/admin')} style={styles.backBtn}>
        ← Назад в админ-панель
      </button>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: '30px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '25px',
    color: '#1d3557',
  },
  subheading: {
    fontSize: '22px',
    marginTop: '40px',
    marginBottom: '15px',
    color: '#333',
  },
  statsList: {
    listStyle: 'none',
    paddingLeft: 0,
    marginBottom: '30px',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
    marginBottom: '40px',
  },
  submitBtn: {
    gridColumn: '1/-1',
    padding: '12px',
    backgroundColor: '#1d3557',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#ffffff',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
  },
  editBtn: {
    backgroundColor: '#fbc02d',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#e63946',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  backBtn: {
    marginTop: '40px',
    padding: '12px 20px',
    backgroundColor: '#a8dadc',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default AdminToursPage;
