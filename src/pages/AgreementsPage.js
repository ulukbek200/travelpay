import React, { useState } from 'react';

const AgreementsPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const agreements = [
    {
      title: 'Договор о туристических услугах',
      content:
        'Вы соглашаетесь с программой тура, сроками, обязанностями сторон. Условия касаются маршрутов, сроков отмены, страхования и безопасности.',
    },
    {
      title: 'Договор-оферта',
      content:
        'Договор вступает в силу с момента бронирования. Условия оплаты, изменение маршрута, отмена регулируются стандартами оферты.',
    },
    {
      title: 'Агентский договор',
      content:
        'TravelPay действует от вашего имени при бронировании транспорта, отелей и других услуг. Мы обязуемся действовать добросовестно и в интересах клиента.',
    },
    {
      title: 'Пользовательское соглашение',
      content:
        'Вы используете сайт в соответствии с правилами. Персональные данные защищаются по закону. Несанкционированное копирование запрещено.',
    },
    {
      title: 'Политика возврата и отмены',
      content:
        'Бесплатная отмена за 7 дней до начала тура. Меньше — частичный возврат. При отмене по вине агентства — полный возврат.',
    },
  ];

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Соглашения и условия TravelPay</h1>

        <div style={styles.accordion}>
          {agreements.map((item, index) => (
            <div key={index} style={styles.accordionItem}>
              <div
                onClick={() => toggleAccordion(index)}
                style={{
                  ...styles.accordionHeader,
                  ...(openIndex === index ? styles.activeHeader : {}),
                }}
              >
                {item.title}
                <span
                  style={{
                    ...styles.toggleIcon,
                    transform:
                      openIndex === index ? 'rotate(135deg)' : 'rotate(45deg)',
                  }}
                />
              </div>
              <div
                style={{
                  ...styles.accordionContent,
                  maxHeight: openIndex === index ? '300px' : '0',
                  padding:
                    openIndex === index ? '18px 24px' : '0px 24px',
                }}
              >
                <p style={styles.accordionText}>{item.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.checkboxGroup}>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={agree1}
              onChange={() => setAgree1(!agree1)}
              style={styles.checkbox}
            />
            Я ознакомлен(а) со всеми условиями
          </label>
          <label style={styles.label}>
            <input
              type="checkbox"
              checked={agree2}
              onChange={() => setAgree2(!agree2)}
              style={styles.checkbox}
            />
            Соглашаюсь на обработку персональных данных
          </label>
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(agree1 && agree2 ? {} : styles.buttonDisabled),
            }}
            disabled={!(agree1 && agree2)}
          >
            Подтвердить и продолжить
          </button>
          {submitted && <div style={styles.success}>Спасибо, всё подтверждено!</div>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "'Poppins', sans-serif",
    background: '#ffffff',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    color: '#333',
  },
  container: {
    maxWidth: '900px',
    margin: '50px auto',
    padding: '40px',
    paddingLeft: '60px',          
    marginLeft: '155px',        
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)', 
  },
  heading: {
    textAlign: 'center',
    fontSize: '32px',
    color: '#0d47a1',
    marginBottom: '40px',
  },
  accordion: {
    borderRadius: '16px',
    overflow: 'hidden',
  },
  accordionItem: {
    borderBottom: '1px solid #e0e0e0',
  },
  accordionHeader: {
    background: 'linear-gradient(135deg, #ffffff, #e3f2fd)',
    padding: '20px 24px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '17px',
    color: '#1565c0',
    userSelect: 'none',
    transition: 'background 0.3s ease',
  },
  activeHeader: {
    backgroundColor: '#e0f7fa',
  },
  toggleIcon: {
    width: '12px',
    height: '12px',
    borderRight: '3px solid #42a5f5',
    borderBottom: '3px solid #42a5f5',
    transform: 'rotate(45deg)',
    transition: 'transform 0.3s ease',
    marginLeft: '10px',
  },
  accordionContent: {
    overflow: 'hidden',
    background: '#ffffff',
    fontSize: '15px',
    color: '#444',
    transition: 'max-height 0.4s ease, padding 0.4s ease',
  },
  accordionText: {
    margin: 0,
    lineHeight: '1.6',
  },
  checkboxGroup: {
    marginTop: '30px',
  },
  label: {
    fontSize: '15px',
    display: 'block',
    marginBottom: '10px',
    fontWeight: 500,
  },
  checkbox: {
    marginRight: '10px',
    transform: 'scale(1.2)',
    accentColor: '#2196f3',
  },
  button: {
    marginTop: '25px',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(to right, #ffa726, #fb8c00)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  buttonDisabled: {
    background: '#ccc',
    cursor: 'not-allowed',
  },
  success: {
    marginTop: '20px',
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default AgreementsPage;
