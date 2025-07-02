import React from 'react';

const JoinTravelPay = () => {
  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.backgroundWrapper}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.title}>Присоединяйся к TravelPay и познавай мир!</h2>
          <button style={styles.button} onClick={handleScrollToAbout}>
            Узнать больше
          </button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    position: 'relative',
    width: '100%',
    height: '600px', // увеличиваем высоту секции
    overflow: 'hidden',
    fontFamily: `'Poppins', sans-serif`,
  },
  backgroundWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundImage:
      'url("https://cdnn1.img.sputnik.tj/img/07e5/03/0c/1032994480_0:0:1920:1080_1920x0_80_0_0_8fa2f519a076be85c4b32cb565a67c5d.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    textAlign: 'center',
    color: 'white',
    zIndex: 2,
    maxWidth: '600px',
    padding: '20px',
  },
  title: {
    fontSize: '42px',
    marginBottom: '60px',
    fontWeight: '700',
    textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
  },
  button: {
    backgroundColor: '#fca311',
    border: 'none',
    padding: '16px 50px',
    fontSize: '20px',
    borderRadius: '30px',
    cursor: 'pointer',
    color: '#1d3557',
    fontWeight: 'bold',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
    transition: 'background-color 0.3s ease',
  },
};

export default JoinTravelPay;
