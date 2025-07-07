import React, { useState } from 'react';

const TourBookingPage = () => {
  const [people, setPeople] = useState(2);
  const [total, setTotal] = useState(14000 * 2);

  const handlePeopleChange = (e) => {
    const qty = parseInt(e.target.value);
    setPeople(qty);
    setTotal(qty * 14000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Спасибо за бронирование! Наш менеджер свяжется с вами.');
  };

  return (
    <div className="container">
      <style>{`
        .container {
          max-width: 900px;
          margin: 40px auto;
          padding: 20px;
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          font-family: 'Poppins', sans-serif;
        }
        .tour-info {
          flex: 1 1 400px;
        }
        .tour-info img {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        .tour-info h2 {
          margin-top: 0;
          color: #1d3557;
        }
        .tour-info p {
          line-height: 1.6;
        }
        .tour-info ul {
          padding-left: 20px;
        }
        .price {
          font-weight: bold;
          margin-top: 10px;
        }
        .booking-form {
          flex: 1 1 300px;
          background: #ffffff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        .booking-form h3 {
          margin-top: 0;
          color: #1d3557;
        }
        .booking-form label {
          display: block;
          margin: 10px 0 5px;
          font-weight: 500;
        }
        .booking-form select,
        .booking-form input,
        .booking-form textarea {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .summary {
          font-weight: bold;
          margin: 10px 0;
        }
        .booking-form button {
          background: linear-gradient(to right, #1e88e5, #1565c0);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
        }
      `}</style>

      <div className="tour-info">
        <img
          src="https://cdn.tripzaza.com/ru/destinations/wp-content/uploads/2018/05/2-The-Issyk-Kul-_ake-e1527736626675.jpg"
          alt="Иссык-Куль"
        />
        <h2>Иссык-Куль: 4-дневный тур</h2>
        <p>
          Отправьтесь в путешествие к главному сокровищу Кыргызстана — озеру Иссык-Куль.
          Наслаждайтесь пляжем, горами и культурой.
        </p>
        <ul>
          <li>Проживание 3 ночи в отеле</li>
          <li>Групповой трансфер Бишкек–Чолпон-Ата</li>
          <li>Экскурсии и посещение достопримечательностей</li>
          <li>Завтраки + 2 обеда</li>
          <li>Русскоязычный гид</li>
        </ul>
        <p className="price">от 14 000 сом / человек</p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <h3>Забронировать и оплатить</h3>

        <label>Количество участников:</label>
        <select value={people} onChange={handlePeopleChange}>
          {[1, 2, 3, 4].map((n) => (
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

        <button type="submit">💳 Оплатить тур</button>
      </form>
    </div>
  );
};

export default TourBookingPage;
