import React, { useRef } from 'react';
import Slider from 'react-slick';

import italy from '../images/italy.jpg';
import spain from '../images/spain.webp';
import greece from '../images/greece.jpeg';
import france from  '../images/france.jpg'
import kyrgyz from '../images/kyrgyz.jpg';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const destinations = [
  { name: 'Италия', image: italy, description: 'Город искусства и вкусной еды.', rating: 5, price: 'от $399', type: 'Групповой тур', label: 'Хит продаж', duration: '7 дней', availability: 'Осталось 3 места' },
  { name: 'Испания', image: spain, description: 'Страна солнца и фламенко.', rating: 4, price: 'от $350', type: 'Пляжный тур', label: 'Новинка', duration: '10 дней', availability: 'Доступно' },
  { name: 'Греция', image: greece, description: 'Исторические руины и пляжи.', rating: 4, price: 'от $320', type: 'Культурный тур', duration: '6 дней', availability: 'Осталось 1 место' },
  { name: 'Франция', image: france, description: 'Романтика Парижа и винные туры.', rating: 5, price: 'от $450', type: 'Экскурсионный тур', duration: '8 дней', availability: 'Осталось 2 места' },
  { name: 'Кыргызстан', image: kyrgyz, description: 'Горы, озёра и природа.', rating: 5, price: 'от $200', type: 'Природный тур', duration: '5 дней', availability: 'Места есть' },
];

const PopularDestinations = () => {
  const sliderRef = useRef(null);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true,
    centerPadding: '30px',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerPadding: '20px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: '10px',
        },
      },
    ],
  };

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

  const handleMoreClick = (name) => {
    alert(`Подробнее о: ${name}`);
  };

  return (
    <section style={styles.section} id="destinations">
      <h2 style={styles.title}>Популярные направления</h2>

      <div style={styles.sliderContainer}>
        <Slider ref={sliderRef} {...settings}>
          {destinations.map((dest) => (
            <div key={dest.name} style={styles.cardWrapper}>
              <div
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {dest.label && <div style={styles.label}>{dest.label}</div>}
                <img src={dest.image} alt={dest.name} style={styles.image} />
                <div style={styles.cardContent}>
                  <h3 style={styles.name}>{dest.name}</h3>
                  <p style={styles.type}>{dest.type}</p>
                  <p style={styles.description}>{dest.description}</p>
                  <p style={styles.duration}>Длительность: {dest.duration}</p>
                  <p style={styles.availability}>{dest.availability}</p>
                  <p style={styles.price}>{dest.price}</p>
                  <div style={styles.rating}>{renderStars(dest.rating)}</div>
                  <div style={styles.buttonGroup}>
                    <button
                      style={styles.moreButton}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fca311'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#1d3557'}
                      onClick={() => handleMoreClick(dest.name)}
                    >
                      Подробнее
                    </button>
                    <button
                      style={styles.bookButton}
                      onClick={() => alert('Переход к бронированию')}
                    >
                      Забронировать
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <div style={styles.buttons}>
        <button style={styles.button} onClick={() => sliderRef.current.slickPrev()}>
          ← Назад
        </button>
        <button style={styles.button} onClick={() => sliderRef.current.slickNext()}>
          Вперёд →
        </button>
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
    fontSize: '35px',
    color: '#4169E1	',
    fontFamily: `'Poppins', sans-serif`,
    marginBottom: '50px',
  },
  sliderContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  cardWrapper: {
    boxSizing: 'border-box',
    padding: '0 10px',
  },
  card: {
    position: 'relative',
    border: '1px solid #e0e0e0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    height: '100%',
    marginBottom: '30px',
  },
  label: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: '#fca311',
    color: '#fff',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderRadius: '6px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
  },
  image: {
    width: '100%',
    height: '240px',
    objectFit: 'cover',
    transition: 'all 0.3s ease',
  },
  cardContent: {
    padding: '20px',
    textAlign: 'left',
  },
  name: {
    fontSize: '22px',
    color: '#fca311',
    margin: '0 0 10px 0',
  },
  type: {
    fontSize: '14px',
    color: '#1d3557',
    marginBottom: '6px',
    fontStyle: 'italic',
  },
  description: {
    fontFamily: `'Poppins', sans-serif`,
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px',
  },
  duration: {
    fontFamily: `'Poppins', sans-serif`,
    fontSize: '14px',
    color: '#555',
    marginBottom: '6px',
  },
  availability: {
    fontSize: '14px',
    color: '#e63946',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  price: {
    fontFamily: `'Poppins', sans-serif`,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1d3557',
    marginBottom: '10px',
  },
  rating: {
    fontFamily: `'Poppins', sans-serif`,
    fontSize: '18px',
    color: '#FFD700',
    marginBottom: '15px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  moreButton: {
    padding: '8px 16px',
    fontSize: '15px',
    backgroundColor: '#1d3557',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  bookButton: {
    padding: '8px 16px',
    fontSize: '15px',
    backgroundColor: '#fca311',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  buttons: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '18px',
    backgroundColor: '#fca31',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
};

export default PopularDestinations;
