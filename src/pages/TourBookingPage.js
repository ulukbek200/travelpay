import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TourBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tour } = location.state || {};

  const pricePerPerson = tour ? Number(tour.price.replace(/[^0-9]/g, '')) : 0;
  const [people, setPeople] = useState(2);
  const [total, setTotal] = useState(pricePerPerson * 2);

  if (!tour) {
    return (
      <div style={{ padding: 40, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <h2>Ошибка</h2>
        <p>Данные тура не были переданы. Пожалуйста, вернитесь на страницу туров.</p>
        <button onClick={() => navigate('/tours')}>Назад к турам</button>
      </div>
    );
  }

  const handlePeopleChange = (e) => {
    const qty = parseInt(e.target.value);
    setPeople(qty);
    setTotal(qty * pricePerPerson);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Спасибо за бронирование тура "${tour.title}"!`);
    navigate('/');
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", maxWidth: 960, margin: '40px auto', padding: 20, position: 'relative' }}>
      {/* Логотип в верхнем левом углу */}
      <div
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: 24,
          color: '#1e40af',
          userSelect: 'none',
          zIndex: 1000,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
        aria-label="Перейти на главную"
        title="Перейти на главную"
      >
        TravelPay
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background-color: #f9fafb;
        }
        .container {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          margin-top: -10px;
        }
        .tour-info {
          flex: 1 1 420px;
          color: #374151;
        }
        .tour-info img {
          width: 100%;
          height: 280px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          transition: transform 0.3s ease;
        }
        .tour-info img:hover {
          transform: scale(1.04);
        }
        .tour-info h2 {
          margin-top: 20px;
          font-weight: 700;
          font-size: 28px;
          color: #000000;
          text-align: center;
        }
        .tour-info p.description {
          font-size: 16px;
          margin: 12px 0 16px;
          line-height: 1.6;
          text-align: center;
          color: #374151;
        }
        .tour-info .price {
          font-weight: 700;
          font-size: 22px;
          color: #2563eb;
          margin-top: 10px;
          margin-bottom: 25px;
          text-align: center;
        }
        .tour-info ul {
          list-style: disc inside;
          margin-bottom: 25px;
          font-size: 15px;
          color: black;
          line-height: 1.5;
          padding-left: 20px;
        }
        .tour-info ul li {
          margin-bottom: 8px;
        }
        .booking-form {
          flex: 1 1 400px;
        }
        .booking-form h3 {
          font-weight: 700;
          font-size: 26px;
          margin-bottom: 30px;
          color: black;
          text-align: center;
        }
        .booking-form label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
          font-size: 15px;
        }
        .booking-form input,
        .booking-form select,
        .booking-form textarea {
          width: 100%;
          padding: 12px 15px;
          border: 1.5px solid #d1d5db;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 16px;
          transition: border-color 0.3s ease;
          font-family: inherit;
        }
        .booking-form input:focus,
        .booking-form select:focus,
        .booking-form textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
        }
        .summary {
          font-weight: 700;
          font-size: 20px;
          color: #1e40af;
          margin-bottom: 25px;
          text-align: center;
        }
        .booking-form button {
          width: 100%;
          background-color: #2563eb;
          color: white;
          padding: 15px 0;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          user-select: none;
        }
        .booking-form button:hover {
          background-color: #1e40af;
        }
        @media (max-width: 720px) {
          .container {
            flex-direction: column;
            padding: 30px 20px;
          }
          .tour-info,
          .booking-form {
            flex: 1 1 100%;
          }
          .booking-form h3 {
            font-size: 22px;
          }
          .tour-info h2 {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="container">
        <div className="tour-info">
          <img src="https://cabar.asia/wp-content/uploads/2024/09/Zapovednik-Kyrgyz-Ata-Oshskaya-oblast-Kyrgyzstan.-Foto-PROON-Kyrgyzstan.jpeg" alt={tour.title} />
          <h2>{tour.title}</h2>
          <p className="description">{tour.description || 'Описание тура отсутствует.'}</p>

          <ul>
            <li><strong>Страна:</strong> {tour.country || 'Кыргызстан'}</li>
            <li><strong>Длительность:</strong> {tour.duration}</li>
            <li><strong>Цена:</strong> от {tour.price} / человек</li>
            <li><strong>Места посещения:</strong> {tour.visitedPlaces || 'включает основные достопримечательности региона'}</li>
            <li><strong>Включено питание:</strong> {tour.meals || 'завтраки и обеды'}</li>
            <li><strong>Уровень сложности:</strong> {tour.difficulty || 'средний'}</li>
            <li><strong>Рекомендуемые вещи:</strong> {tour.recommendedItems || 'удобная обувь, головной убор, вода'}</li>
            <li><strong>Контакты для вопросов:</strong> {tour.contact || '+996 555 123 456'}</li>
          </ul>

          <p className="price">от {tour.price} / человек</p>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <h3>Забронировать и оплатить</h3>

          <label>Количество участников:</label>
          <select value={people} onChange={handlePeopleChange}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label>Дата начала тура:</label>
          <input type="date" required />

          <label>Желаемое время выезда:</label>
          <input type="time" />

          <label>Тип транспорта:</label>
          <select>
            <option>Минивэн</option>
            <option>Комфорт-класс</option>
            <option>Джип</option>
          </select>

          <label>Гид:</label>
          <select>
            <option>Групповой</option>
            <option>Персональный</option>
          </select>

          <label>Пожелания:</label>
          <textarea placeholder="Например: вегетарианское питание, место у окна..." />

          <div className="summary">Итого: {total.toLocaleString()} сом</div>

          <button type="submit"> Оплатить тур</button>
        </form>
      </div>
    </div>
  );
};

export default TourBookingPage;

