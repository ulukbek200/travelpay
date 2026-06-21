import React, { useState } from 'react';
import { Button } from 'antd';

const VisaPaymentPage = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.id]: event.target.value,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(formData.cardNumber)) {
      nextErrors.cardNumber = 'Неверный номер карты';
    }
    if (formData.cardName.trim().length < 3) {
      nextErrors.cardName = 'Введите имя владельца';
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiry)) {
      nextErrors.expiry = 'Неверный формат (MM/YY)';
    }
    if (!/^\d{3}$/.test(formData.cvv)) {
      nextErrors.cvv = 'CVV должен состоять из 3 цифр';
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      window.alert('Оплата успешно прошла!');
      setFormData({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logo}>VISA</div>
        <h2 style={styles.title}>Оплата тура через Visa</h2>

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.formGroup}>
            <label style={styles.label}>Номер карты</label>
            <input
              style={styles.input}
              type="text"
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={formData.cardNumber}
              onChange={handleChange}
            />
            {errors.cardNumber && <div style={styles.error}>{errors.cardNumber}</div>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Имя владельца</label>
            <input
              style={styles.input}
              type="text"
              id="cardName"
              placeholder="IVAN IVANOV"
              value={formData.cardName}
              onChange={handleChange}
            />
            {errors.cardName && <div style={styles.error}>{errors.cardName}</div>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Срок действия</label>
            <input
              style={styles.input}
              type="text"
              id="expiry"
              placeholder="MM/YY"
              maxLength={5}
              value={formData.expiry}
              onChange={handleChange}
            />
            {errors.expiry && <div style={styles.error}>{errors.expiry}</div>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>CVV</label>
            <input
              style={styles.input}
              type="password"
              id="cvv"
              placeholder="123"
              maxLength={3}
              value={formData.cvv}
              onChange={handleChange}
            />
            {errors.cvv && <div style={styles.error}>{errors.cvv}</div>}
          </div>

          <Button htmlType="submit" type="primary" size="large" className="travelpay-primary-button" style={styles.button}>
            Оплатить тур
          </Button>
        </form>

        <div style={styles.icons}>
          <span style={styles.icon}>VISA</span>
          <span style={styles.icon}>Mastercard</span>
          <span style={styles.icon}>MIR</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1A1F71, #FFFFFF)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '"Poppins", sans-serif',
  },
  container: {
    background: '#FFFFFF',
    padding: '40px',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    color: '#1A1F71',
  },
  title: {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '10px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '42px',
    margin: '0 auto 10px',
    color: '#1A1F71',
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: 0,
  },
  formGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '16px',
    border: '1px solid #CCD5DF',
    outline: 'none',
  },
  error: {
    color: '#C62828',
    fontSize: '13px',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: '14px',
    marginTop: 8,
  },
  icons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    gap: '20px',
  },
  icon: {
    minWidth: '74px',
    padding: '8px 10px',
    borderRadius: '10px',
    background: '#F2F5FA',
    color: '#1A1F71',
    fontSize: '13px',
    fontWeight: 700,
    textAlign: 'center',
  },
};

export default VisaPaymentPage;
