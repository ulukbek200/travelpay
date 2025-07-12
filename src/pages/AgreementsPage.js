import React, { useState, useRef } from 'react';

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

  const accordionData = [
    {
      title: '📘 Договор о туристических услугах',
      content:
        'Вы соглашаетесь с программой тура, сроками, обязанностями сторон. Условия касаются маршрутов, сроков отмены, страхования и безопасности. Все обязательства сторон регулируются действующим законодательством.',
    },
    {
      title: '📝 Договор-оферта',
      content:
        'Договор вступает в силу с момента бронирования. Условия оплаты, изменение маршрута, отмена регулируются стандартами оферты. Покупка тура означает полное согласие с условиями.',
    },
    {
      title: '🤝 Агентский договор',
      content:
        'TravelPay действует от вашего имени при бронировании транспорта, отелей и других услуг. Мы обязуемся действовать добросовестно и в интересах клиента. Вы соглашаетесь с этим представлением.',
    },
    {
      title: '🔐 Пользовательское соглашение',
      content:
        'Вы используете сайт в соответствии с правилами. Персональные данные защищаются в соответствии с законом. Несанкционированное копирование материалов запрещено.',
    },
    {
      title: '💸 Политика возврата и отмены бронирования',
      content:
        'Бесплатная отмена — за 7 дней до начала тура. При отмене по вине агентства — полный возврат или замена. Меньше 7 дней — частичный возврат, по договору.',
    },
  ];

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Соглашения и условия TravelPay</h1>

        <div style={styles.accordion}>
          {accordionData.map((item, index) => (
            <div key={index} style={styles.accordionItem}>
              <div
                style={{
                  ...styles.accordionHeader,
                  ...(openIndex === index ? styles.activeHeader : {}),
                }}
                onClick={() => toggleAccordion(index)}
              >
                {item.title}
                <span
                  style={{
                    ...styles.toggleIcon,
                    transform:
                      openIndex === index
                        ? 'rotate(135deg)'
                        : 'rotate(45deg)',
                  }}
                />
              </div>
              <div
                style={{
                  ...styles.accordionContent,
                  maxHeight: openIndex === index ? '300px' : '0',
                  padding:
                    openIndex === index ? '20px 24px' : '0px 24px',
                }}
              >
                <p style={{ margin: 0 }}>{item.content}</p>
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
            ✅ Подтвердить и продолжить
          </button>
          {submitted && (
            <div style={styles.success}>
              Спасибо, всё подтверждено!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: 'Inter, sans-serif',
    background: 'linear-gradient(135deg, #e0f7fa, #e3f2fd)',
    margin: 0,
    color: '#333',
    minHeight: '100vh',
  },
  container: {
    maxWidth: '960px',
    margin: '50px auto',
    padding: '40px',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  },
  heading: {
    textAlign: 'center',
    fontSize: '34px',
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
    fontWeight: '600',
    fontSize: '18px',
    color: '#1565c0',
    transition: 'background 0.3s ease',
    userSelect: 'none',
  },
  activeHeader: {
    background: '#f0faff',
  },
  toggleIcon: {
    width: '12px',
    height: '12px',
    borderRight: '3px solid #42a5f5',
    borderBottom: '3px solid #42a5f5',
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
  checkboxGroup: {
    marginTop: '30px',
  },
  label: {
    fontSize: '15px',
    display: 'block',
    marginBottom: '10px',
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
    transition: '0.3s ease',
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

export default AgreementsPage;