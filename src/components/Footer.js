import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} TravelPay. Все права защищены.</p>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#1d3557',
    color: 'white',
    textAlign: 'center',
    padding: '20px'
  }
};

export default Footer;
