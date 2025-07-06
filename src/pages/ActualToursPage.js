import React from 'react';

const ToursPage = () => {
  const tours = [
    {
      title: 'Летний тур на Иссык-Куль',
      description: 'Купание, солнце и природа самого известного озера Кыргызстана.',
      duration: '4 дня',
      price: 'от 14 000 сом',
      image: 'https://sputnik.kg/img/102749/78/1027497816_0:0:5241:3494_600x0_80_0_0_1de71c91552a01c3bc55f0df20f16329.jpg',
    },
    {
      title: 'Исторический тур в Бурана',
      description: 'Посети одну из самых древних башен Великого Шёлкового пути.',
      duration: '1 день',
      price: 'от 2 500 сом',
      image: 'https://central-asia.live/_next/image?url=https%3A%2F%2Fcentral-asia.live%2Fuploads%2Fburana-tower.jpg&w=3840&q=75',
    },
    {
      title: 'Приключение в Беш-Арал',
      description: 'Горы, реки и водопады в дикой красоте юга Кыргызстана.',
      duration: '3 дня',
      price: 'от 9 000 сом',
      image: 'https://rivers.help/wp-content/uploads/2024/07/besh-aral.jpg',
    },
    {
      title: 'Озеро Сон-Куль',
      description: 'Живописное озеро на высоте 3000 м и ночёвка в юртах.',
      duration: '3 дня',
      price: 'от 12 000 сом',
      image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/12/24/52/road-to-song-kul.jpg?w=500&h=-1&s=1',
    },
    {
      title: 'Горы Тянь-Шань',
      description: 'Горы и невероятные пейзажи для настоящих искателей приключений.',
      duration: '5 дней',
      price: 'от 18 000 сом',
      image: 'https://cdn.tripzaza.com/ru/destinations/wp-content/uploads/2018/05/2-The-Issyk-Kul-_ake-e1527736626675.jpg',
    },
    {
      title: 'Поездка в Алай',
      description: 'Место силы, невероятные горы и гостеприимство.',
      duration: '4 дня',
      price: 'от 13 000 сом',
      image: 'https://cdn.tripster.ru/thumbs2/46a3ce6e-bc28-11ed-ab44-ee2fa366151b.1220x600.jpeg',
    },
    {
      title: 'Культурный тур Чуй',
      description: 'Открой для себя культурное наследие и жизнь местных жителей.',
      duration: '2 дня',
      price: 'от 7 500 сом',
      image: 'https://mustvisit.ru/wa-data/public/shop/products/85/10/21085/images/16211/16211.970.jpg',
    },
    {
      title: 'Башня Бурана',
      description: 'Посети древнюю башню и узнай историю Великого Шёлкового пути.',
      duration: '1 день',
      price: 'от 2 000 сом',
      image: 'https://zstrela.ru/sites/default/files/images/news/07-19/zstrela_kyrgyz_2.jpg',
    },
    {
      title: 'Кёк-Джайык',
      description: 'Горный треккинг и пастбища на высоте.',
      duration: '3 дня',
      price: 'от 11 000 сом',
      image: 'https://marakandatravel.asia/wp-content/uploads/2019/11/obshhaya-kartina.jpg',
    },
    {
      title: 'Нарын и Таш-Рабат',
      description: 'Средневековый караван-сарай среди гор.',
      duration: '2 дня',
      price: 'от 8 000 сом',
      image: 'https://modo.kg/wp-content/uploads/2023/07/22-1024x599.jpg',
    },
  ];
  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: #f0f8ff;
          color: #333;
        }

        header {
          position: relative;
          height: 320px;
          overflow: hidden;
        }
        header video {
          position: absolute;
          top: 0;
          left: 0;
          object-fit: cover;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
        .header-overlay {
          position: relative;
          text-align: center;
          padding-top: 90px;
          color: white;
          background: rgba(0, 0, 0, 0.4);
          height: 100%;
        }
        .header-overlay h1 {
          font-size: 42px;
          margin: 0;
        }
        .header-overlay p {
          font-size: 18px;
          margin-top: 10px;
        }

        .search-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          padding: 30px 20px;
          max-width: 900px;
          margin: auto;
        }
        .search-bar input {
          padding: 12px 16px;
          border: 1px solid #ccc;
          border-radius: 12px;
          font-size: 16px;
          flex: 1;
          min-width: 200px;
        }
        .search-bar button {
          background: linear-gradient(to right, #1e88e5, #1565c0);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .search-bar button:hover {
          background: linear-gradient(to right, #1565c0, #0d47a1);
        }

        .tour-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          padding: 30px;
          max-width: 1200px;
          margin: auto;
        }
        .tour-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tour-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.12);
        }
        .tour-card img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        .tour-content {
          padding: 20px;
        }
        .tour-content h3 {
          margin: 0 0 12px;
          color: #1d3557;
        }
        .tour-content p {
          margin-bottom: 12px;
          font-size: 14px;
          color: #555;
        }
        .tour-meta {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 16px;
          color: #777;
        }
        .tour-buttons {
          display: flex;
          gap: 10px;
        }
        .book-btn {
          background: linear-gradient(to right, #ffa726, #fb8c00);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px;
          flex: 1;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .book-btn:hover {
          background: linear-gradient(to right, #fb8c00, #ef6c00);
        }
        .fav-btn {
          background: #e3f2fd;
          color: #1976d2;
          border: none;
          border-radius: 10px;
          padding: 10px;
          flex: 1;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .fav-btn:hover {
          background: #bbdefb;
        }

        @media (max-width: 500px) {
          .search-bar {
            flex-direction: column;
          }
        }
      `}</style>

      <header>
        <video autoPlay muted loop playsInline>
          <source
            src="https://cdn.pixabay.com/video/2024/06/28/218541_tiny.mp4"
            type="video/mp4"
          />
        </video>
        <div className="header-overlay">
          <h1>Туры по Кыргызстану</h1>
          <p>Открой неизведанные уголки с TravelPay</p>
        </div>
      </header>

      <div className="search-bar">
        <input type="text" placeholder="Название тура..." />
        <input type="text" placeholder="Регион..." />
        <button>🔍 Найти</button>
      </div>

      <section className="tour-list">
        {tours.map((tour, index) => (
          <div className="tour-card" key={index}>
            <img src={tour.image} alt={tour.title} />
            <div className="tour-content">
              <h3>{tour.title}</h3>
              <p>{tour.description}</p>
              <div className="tour-meta">
                <span>{tour.duration}</span>
                <span>{tour.price}</span>
              </div>
              <div className="tour-buttons">
                <button className="book-btn">Забронировать</button>
                <button className="fav-btn">♥️ В избранное</button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ToursPage;