import React from 'react';

const ContactUs = () => {
  return (
    <section style={styles.section} id="contact">
      <h2 style={styles.title}>Связаться с нами</h2>
      <p style={styles.text}>Вы можете связаться с нами через любые из этих платформ:</p>
      <div style={styles.icons}>
        <a href="https://instagram.com/010105ml" target="_blank" rel="noopener noreferrer" style={styles.iconLink} aria-label="Instagram">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174855.png" alt="Instagram" style={styles.icon} />
        </a>
        <a href="https://wa.me/+996990909109" target="_blank" rel="noopener noreferrer" style={styles.iconLink} aria-label="WhatsApp">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp" style={styles.icon} />
        </a>
        <a href="https://t.me/uli77701" target="_blank" rel="noopener noreferrer" style={styles.iconLink} aria-label="Telegram">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram" style={styles.icon} />
        </a>
        <a href="https://www.tiktok.com/@yourusername" target="_blank" rel="noopener noreferrer" style={styles.iconLink} aria-label="TikTok">
          <img src="https://cdn-icons-png.flaticon.com/512/3046/3046123.png" alt="TikTok" style={styles.icon} />
        </a>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '60px 20px',
    backgroundColor: '#1d3557',
    color: 'white',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
  },
  text: {
    fontSize: '18px',
    marginBottom: '30px',
  },
  icons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
  },
  iconLink: {
    display: 'inline-block',
    width: '50px',
    height: '50px',
    transition: 'transform 0.3s',
  },
  icon: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
};

export default ContactUs;
