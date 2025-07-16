import React, { useState } from 'react';

const VisaPaymentPage = () => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    const cardRegex = /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3}$/;

    if (!cardRegex.test(formData.cardNumber)) {
      newErrors.cardNumber = 'Неверный номер карты';
    }
    if (formData.cardName.trim().length < 3) {
      newErrors.cardName = 'Введите имя владельца';
    }
    if (!expiryRegex.test(formData.expiry)) {
      newErrors.expiry = 'Неверный формат (MM/YY)';
    }
    if (!cvvRegex.test(formData.cvv)) {
      newErrors.cvv = 'CVV должен состоять из 3 цифр';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      alert('Оплата успешно прошла!');
      setFormData({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1f71, #ffffff)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Poppins', sans-serif",
    },
    container: {
      background: '#fff',
      padding: '40px',
      borderRadius: '16px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
      color: '#1a1f71',
    },
    title: {
      textAlign: 'center',
      fontSize: '28px',
      marginBottom: '10px',
    },
    logo: {
      display: 'block',
      height: '40px',
      margin: '0 auto 10px',
    },
    formGroup: {
      marginBottom: '18px',
    },
    label: {
      display: 'block',
      fontWeight: 600,
      marginBottom: '6px',
      marginLeft:'-5px'
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      fontSize: '16px',
      border: '1px solid #ccc',
      outline: 'none',
      marginLeft:'-10px'
    },
    error: {
      color: 'red',
      fontSize: '13px',
      marginTop: '4px',
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(to right, #1a1f71, #ffc107)',
      color: '#fff',
      fontSize: '16px',
      fontWeight: 'bold',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    icons: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '20px',
      gap: '20px',
    },
    icon: {
      height: '32px',
      opacity: 0.8,
      transition: '0.3s',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
          alt="Visa"
          style={styles.logo}
        />
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

          <button type="submit" style={styles.button}>
            Оплатить тур
          </button>
        </form>

        <div style={styles.icons}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg"
            alt="Visa"
            style={styles.icon}
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
            alt="Mastercard"
            style={styles.icon}
          />
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/%D0%9C%D0%B8%D1%80_%D0%A2%D0%92_logo.svg/2048px-%D0%9C%D0%B8%D1%80_%D0%A2%D0%92_logo.svg.png"
            alt="МИР"
            style={styles.icon}
          />
        </div>
      </div>
    </div>
  );
};

export default VisaPaymentPage;