import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: '#0a1a2f',
      width: '100%',
      marginTop: 'auto',
      fontFamily: "'Poppins', sans-serif",
    },
    footerContainer: {
      padding: '40px 30px 20px',
      textAlign: 'center',
    },
    sectionTitle: {
      color: 'white',
      fontSize: '1.8em',
      marginBottom: '50px',
      fontWeight: '500',
    },
    socialIcons: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '40px',
    },
    socialLink: {
      textDecoration: 'none',
      padding: '13px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: '0.5s',
    },
    icon: {
      fontSize: '2em',
      color: '#0a1a2f',
    },
    footerBottom: {
      backgroundColor: '#081421',
      padding: '10px 0',
      textAlign: 'center',
    },
    bottomText: {
      color: 'white',
      fontSize: '13px',
    },
    designer: {
      opacity: 0.7,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontWeight: 400,
      marginLeft: '5px',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.footerContainer}>
        <h3 style={styles.sectionTitle}>Связаться с нами</h3>

        <div style={styles.socialIcons}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <i className="fa-brands fa-facebook" style={styles.icon}></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <i className="fa-brands fa-instagram" style={styles.icon}></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <i className="fa-brands fa-twitter" style={styles.icon}></i>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
            <i className="fa-brands fa-youtube" style={styles.icon}></i>
          </a>
        </div>
      </div>

      <div style={styles.footerBottom}>
        <p style={styles.bottomText}>
          &copy; 2025 TravelPay
          <span style={styles.designer}> — Все права защищены</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
