import React, { useState } from 'react';
import { Button } from 'antd';

const agreements = [
  {
    title: 'Договор о туристических услугах',
    content: 'Вы соглашаетесь с программой тура, сроками, обязанностями сторон, условиями страхования и безопасностью маршрута.',
  },
  {
    title: 'Договор-оферта',
    content: 'Оферта вступает в силу с момента бронирования. Оплата, изменения маршрута и условия отмены регулируются правилами оферты.',
  },
  {
    title: 'Агентский договор',
    content: 'TravelPay действует от вашего имени при бронировании транспорта, отелей и сопутствующих сервисов.',
  },
  {
    title: 'Пользовательское соглашение',
    content: 'Сайт используется по правилам сервиса. Персональные данные защищаются по закону, а копирование без разрешения запрещено.',
  },
  {
    title: 'Политика возврата и отмены',
    content: 'Бесплатная отмена доступна за 7 дней до начала тура. При более поздней отмене применяется частичный возврат.',
  },
];

const AgreementsPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Соглашения и условия TravelPay</h1>

        <div style={styles.accordion}>
          {agreements.map((item, index) => (
            <div key={item.title} style={styles.accordionItem}>
              <div
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  ...styles.accordionHeader,
                  ...(openIndex === index ? styles.activeHeader : {}),
                }}
              >
                {item.title}
                <span
                  style={{
                    ...styles.toggleIcon,
                    transform: openIndex === index ? 'rotate(135deg)' : 'rotate(45deg)',
                  }}
                />
              </div>

              <div
                style={{
                  ...styles.accordionContent,
                  maxHeight: openIndex === index ? '300px' : '0',
                  padding: openIndex === index ? '18px 24px' : '0 24px',
                }}
              >
                <p style={styles.accordionText}>{item.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.checkboxGroup}>
          <label style={styles.label}>
            <input type="checkbox" checked={agree1} onChange={() => setAgree1(!agree1)} style={styles.checkbox} />
            Я ознакомлен(а) со всеми условиями
          </label>
          <label style={styles.label}>
            <input type="checkbox" checked={agree2} onChange={() => setAgree2(!agree2)} style={styles.checkbox} />
            Соглашаюсь на обработку персональных данных
          </label>

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            className="travelpay-primary-button"
            style={{
              ...styles.button,
              ...(agree1 && agree2 ? {} : styles.buttonDisabled),
            }}
            disabled={!(agree1 && agree2)}
          >
            Подтвердить и продолжить
          </Button>

          {submitted && <div style={styles.success}>Спасибо, всё подтверждено.</div>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: '"Poppins", sans-serif',
    background: '#FFFFFF',
    minHeight: '100vh',
    color: '#333333',
    padding: '24px',
  },
  container: {
    maxWidth: '900px',
    margin: '50px auto',
    padding: '40px',
    background: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    fontSize: '32px',
    color: '#0D47A1',
    marginBottom: '40px',
  },
  accordion: {
    borderRadius: '16px',
    overflow: 'hidden',
  },
  accordionItem: {
    borderBottom: '1px solid #E0E0E0',
  },
  accordionHeader: {
    background: 'linear-gradient(135deg, #FFFFFF, #E3F2FD)',
    padding: '20px 24px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '17px',
    color: '#1565C0',
    userSelect: 'none',
  },
  activeHeader: {
    backgroundColor: '#E0F7FA',
  },
  toggleIcon: {
    width: '12px',
    height: '12px',
    borderRight: '3px solid #42A5F5',
    borderBottom: '3px solid #42A5F5',
    transition: 'transform 0.3s ease',
    marginLeft: '10px',
  },
  accordionContent: {
    overflow: 'hidden',
    background: '#FFFFFF',
    fontSize: '15px',
    color: '#444444',
    transition: 'max-height 0.4s ease, padding 0.4s ease',
  },
  accordionText: {
    margin: 0,
    lineHeight: 1.6,
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
    accentColor: '#2196F3',
  },
  button: {
    marginTop: '25px',
    width: '100%',
    height: 48,
    borderRadius: '14px',
    fontWeight: 700,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  success: {
    marginTop: '20px',
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default AgreementsPage;
