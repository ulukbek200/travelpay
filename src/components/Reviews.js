import React, { useRef } from 'react';

const Reviews = () => {
  const reviews = [
    {
      name: 'Анна Петрова',
      text: 'TravelPay помог мне организовать лучший отдых!',
      avatar: 'https://i.pravatar.cc/100?img=45',
      rating: 5,
      location: 'Москва, Россия',
      date: 'Январь 2024',
    },
    {
      name: 'Игорь Захаров',
      text: 'Профессиональная команда, поддержка на каждом шаге!',
      avatar: 'https://i.pravatar.cc/100?img=49',
      rating: 4,
      location: 'Казань, Россия',
      date: 'Март 2024',
    },
    {
      name: 'Мария Орлова',
      text: 'Отличный сервис и выгодные предложения! Всем советую.',
      avatar: 'https://i.pravatar.cc/100?img=52',
      rating: 5,
      location: 'Алматы, Казахстан',
      date: 'Май 2024',
    },
    {
      name: 'Тимур Ахмедов',
      text: 'Очень удобный сервис и оперативная поддержка. Спасибо!',
      avatar: 'https://i.pravatar.cc/100?img=53',
      rating: 5,
      location: 'Ташкент, Узбекистан',
      date: 'Июнь 2024',
    },
    {
      name: 'Екатерина Белова',
      text: 'Честные цены, удобный сайт, всё быстро и удобно.',
      avatar: 'https://i.pravatar.cc/100?img=54',
      rating: 4,
      location: 'Минск, Беларусь',
      date: 'Апрель 2024',
    },
  ];

  const scrollRef = useRef(null);
  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="reviews" style={styles.section}>
      <h2 style={styles.title}>Отзывы наших клиентов</h2>
      <p style={styles.subtitle}>
        Нам доверяют тысячи туристов по всему миру
      </p>
      <div style={styles.sliderWrapper}>
        <button style={styles.arrow} onClick={() => scroll(-320)}>&#10094;</button>
        <div style={styles.slider} ref={scrollRef}>
          {reviews.map((review, i) => (
            <div key={i} style={styles.card}>
              <img src={review.avatar} alt={review.name} style={styles.avatar} />
              <p style={styles.text}>"{review.text}"</p>
              <p style={styles.name}>{review.name}</p>
              <p style={styles.location}>{review.location} • {review.date}</p>
              <p style={styles.stars}>{renderStars(review.rating)}</p>
            </div>
          ))}
        </div>
        <button style={styles.arrow} onClick={() => scroll(320)}>&#10095;</button>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 20px',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
    marginLeft:'50px'
  },
  title: {
    fontSize: '32px',
    color: '#1d3557',
    marginBottom: '10px',
    fontFamily: "'Poppins', sans-serif",

  },
  subtitle: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '40px',
    fontFamily: "'Poppins', sans-serif",
  },
  sliderWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  slider: {
    display: 'flex',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    gap: '30px',
    padding: '10px',
    scrollbarWidth: 'none',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '30px 20px',
    minWidth: '280px',
    flex: '0 0 auto',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    transition: 'transform 0.3s ease',
    textAlign: 'left',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '20px',
  },
  text: {
    fontSize: '18px',
    color: '#444',
    fontStyle: 'italic',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  name: {
    fontWeight: '600',
    color: '#1d3557',
    fontSize: '18px',
    marginBottom: '5px',
  },
  location: {
    fontSize: '14px',
    color: '#777',
    marginBottom: '10px',
  },
  stars: {
    fontSize: '25px',
    color: '#FFD700',
  },
  arrow: {
    background: 'transparent',
    color: '#1d3557',
    border: '2px solid #1d3557',
    borderRadius: '50%',
    width: '50px',
    height: '36px',
    fontSize: '22px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    margin: '0 10px',
  },
};

export default Reviews;

