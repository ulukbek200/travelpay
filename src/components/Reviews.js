import React, { useRef } from 'react';

const Reviews = () => {
  const reviews = [
    {
      name: 'Анна Петрова',
      text: 'TravelPay помог мне организовать лучший отдых в моей жизни! Всё чётко, быстро и без стресса.',
      avatar: 'https://i.pravatar.cc/100?img=45',
      rating: 5,
      location: 'Москва, Россия',
    },
    {
      name: 'Игорь Захаров',
      text: 'Профессиональная команда! Получил поддержку на каждом этапе. Рекомендую друзьям!',
      avatar: 'https://i.pravatar.cc/100?img=49',
      rating: 4,
      location: 'Казань, Россия',
    },
    {
      name: 'Мария Орлова',
      text: 'Пользовалась TravelPay для поездки в Европу. Отличные предложения и выгодные цены!',
      avatar: 'https://i.pravatar.cc/100?img=52',
      rating: 5,
      location: 'Алматы, Казахстан',
    },
    {
      name: 'Тимур Ахмедов',
      text: 'Отличный сервис, удобный интерфейс и поддержка 24/7. Остался доволен!',
      avatar: 'https://i.pravatar.cc/100?img=53',
      rating: 5,
      location: 'Ташкент, Узбекистан',
    },
    {
      name: 'Екатерина Белова',
      text: 'Быстрое бронирование, прозрачные цены и надёжные партнёры. Всё супер!',
      avatar: 'https://i.pravatar.cc/100?img=54',
      rating: 4,
      location: 'Минск, Беларусь',
    },
  ];

  const renderStars = (count) => '★'.repeat(count) + '☆'.repeat(5 - count);
  const scrollRef = useRef(null);

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section id="reviews" style={styles.section}>
      <h2 style={styles.title}>Что говорят наши клиенты</h2>
      <div style={styles.scrollContainerWrapper}>
        <div style={styles.scrollContainer} ref={scrollRef}>
          <div style={styles.cards}>
            {reviews.map((review, i) => (
              <div key={i} style={styles.card}>
                <img src={review.avatar} alt={review.name} style={styles.avatar} />
                <p style={styles.text}>“{review.text}”</p>
                <p style={styles.name}>{review.name}</p>
                <p style={styles.location}>{review.location}</p>
                <div style={styles.stars}>{renderStars(review.rating)}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.navButton} onClick={() => scroll(-300)}>&larr;</button>
          <button style={styles.navButton} onClick={() => scroll(300)}>&rarr;</button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '60px 20px',
    backgroundColor: '#f1f1f1',
    textAlign: 'center',
  },
  title: {
    fontFamily: `'Poppins', sans-serif`,
    fontSize: '36px',
    marginBottom: '70px',
    marginLeft:'50px',
    color: '#1d3557',
  },
  scrollContainerWrapper: {
    position: 'relative',
    marginLeft:'60px'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '20px',
    marginLeft:'-30px'
  },
  navButton: {
    padding: '10px 20px',
    fontSize: '18px',
    backgroundColor: '#1d3557',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  scrollContainer: {
    overflowX: 'auto',
    paddingBottom: '10px',
  },
  cards: {
    display: 'flex',
    gap: '30px',
    padding: '10px',
    width: 'max-content',
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '16px',
    width: '280px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
    transition: 'transform 0.3s',
    flexShrink: 0,
  },
  avatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '15px',
  },
  text: {
    fontStyle: 'italic',
    color: '#444',
    marginBottom: '15px',
  },
  name: {
    fontWeight: '600',
    fontSize: '16px',
    color: '#fca311',
    marginBottom: '4px',
  },
  location: {
    fontSize: '14px',
    color: '#1d3557',
    marginBottom: '8px',
  },
  stars: {
    color: '#FFD700',
    fontSize: '25px',
  },
};

export default Reviews;
