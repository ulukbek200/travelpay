import React, { useState } from 'react';

const AdminPanel = () => {
  const [tours, setTours] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: '',
    price: '',
    image: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTour = () => {
    if (!form.title || !form.description || !form.image) return;
    setTours([...tours, form]);
    setForm({ title: '', description: '', duration: '', price: '', image: '' });
  };

  const deleteTour = (index) => {
    const newTours = [...tours];
    newTours.splice(index, 1);
    setTours(newTours);
  };

  return (
    <div>
      <style>{`
        body {
          font-family: 'Poppins', sans-serif;
          background: #f4f7fa;
          margin: 0;
          padding: 0;
        }
        .admin-container {
          max-width: 1000px;
          margin: auto;
          padding: 40px 20px;
        }
        h1 {
          text-align: center;
          color: #1d3557;
        }
        .form {
          background: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          margin-bottom: 30px;
        }
        .form input, .form textarea {
          width: 100%;
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 16px;
        }
        .form button {
          background: linear-gradient(to right, #1e88e5, #1565c0);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .tour-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        .tour-card {
          background: white;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .tour-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .tour-info {
          padding: 16px;
        }
        .tour-info h3 {
          margin: 0 0 8px;
          color: #1d3557;
        }
        .tour-info p {
          font-size: 14px;
          color: #555;
        }
        .tour-meta {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-top: 10px;
        }
        .delete-btn {
          background: #e57373;
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          margin-top: 12px;
          cursor: pointer;
        }
      `}</style>
      <div className="admin-container">
        <h1>Админка туров</h1>

        <div className="form">
          <input
            type="text"
            placeholder="Название тура"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <textarea
            placeholder="Описание"
            name="description"
            value={form.description}
            onChange={handleChange}
          ></textarea>
          <input
            type="text"
            placeholder="Продолжительность (напр. 3 дня)"
            name="duration"
            value={form.duration}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="Цена (напр. от 9000 сом)"
            name="price"
            value={form.price}
            onChange={handleChange}
          />
          <input
            type="text"
            placeholder="URL картинки"
            name="image"
            value={form.image}
            onChange={handleChange}
          />
          <button onClick={addTour}>Добавить тур</button>
        </div>

        <div className="tour-list">
          {tours.map((tour, index) => (
            <div key={index} className="tour-card">
              <img src={tour.image} alt={tour.title} />
              <div className="tour-info">
                <h3>{tour.title}</h3>
                <p>{tour.description}</p>
                <div className="tour-meta">
                  <span>{tour.duration}</span>
                  <span>{tour.price}</span>
                </div>
                <button className="delete-btn" onClick={() => deleteTour(index)}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;  