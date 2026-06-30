import React, { useState } from 'react';
import { Button } from 'antd';

const agreements = [
  {
    title: 'Пользовательское соглашение',
    content: 'Используя TravelPay, пользователь подтверждает достоверность данных, соблюдает правила сервиса и принимает условия бронирования, оплаты и возврата.',
  },
  {
    title: 'Договор-оферта по турам',
    content: 'Тур оформляется по условиям опубликованной оферты. В ней фиксируются программа, стоимость, дата выезда, порядок оплаты, отмены и возврата.',
  },
  {
    title: 'Договор для компаний',
    content: 'Тур-компания принимает условия размещения в TravelPay Business, подтверждает право продавать свои туры и соглашается с подпиской на 30 календарных дней.',
  },
  {
    title: 'Политика конфиденциальности',
    content: 'TravelPay обрабатывает персональные данные только для регистрации, бронирования, оплаты, уведомлений и клиентской поддержки.',
  },
  {
    title: 'Возврат и отмена',
    content: 'Условия возврата зависят от типа тура, даты отмены и правил компании. Финальное решение по возврату отображается в деталях бронирования.',
  },
];

const AgreementsPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeData, setAgreeData] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!agreeRules || !agreeData) return;
    setSubmitted(true);
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Соглашения и условия TravelPay</h1>
        <p style={styles.lead}>
          Здесь собраны основные условия для клиентов и тур-компаний: работа платформы, оферта, подписка и правила обработки данных.
        </p>

        <div style={styles.accordion}>
          {agreements.map((item, index) => (
            <div key={item.title} style={styles.accordionItem}>
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  ...styles.accordionHeader,
                  ...(openIndex === index ? styles.activeHeader : {}),
                }}
              >
                <span>{item.title}</span>
                <span
                  style={{
                    ...styles.toggleIcon,
                    transform: openIndex === index ? 'rotate(135deg)' : 'rotate(45deg)',
                  }}
                />
              </button>

              <div
                style={{
                  ...styles.accordionContent,
                  maxHeight: openIndex === index ? '220px' : '0',
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
            <input type="checkbox" checked={agreeRules} onChange={() => setAgreeRules(!agreeRules)} style={styles.checkbox} />
            Я ознакомился(ась) с условиями сервиса и договорами
          </label>
          <label style={styles.label}>
            <input type="checkbox" checked={agreeData} onChange={() => setAgreeData(!agreeData)} style={styles.checkbox} />
            Я согласен(на) на обработку персональных данных
          </label>

          <Button
            htmlType="submit"
            type="primary"
            size="large"
            className="travelpay-primary-button"
            style={{
              ...styles.button,
              ...(!(agreeRules && agreeData) ? styles.buttonDisabled : {}),
            }}
            disabled={!(agreeRules && agreeData)}
          >
            Подтвердить
          </Button>

          {submitted && <div style={styles.success}>Спасибо, согласие сохранено.</div>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: '"Poppins", sans-serif',
    background: '#f4f8ff',
    minHeight: '100vh',
    color: '#1f2937',
    padding: '24px',
  },
  container: {
    maxWidth: '920px',
    margin: '32px auto',
    padding: '40px',
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)',
  },
  heading: {
    textAlign: 'center',
    fontSize: '32px',
    color: '#0f4aa1',
    marginBottom: '12px',
  },
  lead: {
    margin: '0 auto 32px',
    maxWidth: '700px',
    textAlign: 'center',
    lineHeight: 1.6,
    color: '#4b5563',
  },
  accordion: {
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid #dbe7ff',
  },
  accordionItem: {
    borderBottom: '1px solid #e5e7eb',
  },
  accordionHeader: {
    width: '100%',
    background: 'linear-gradient(135deg, #ffffff, #eef5ff)',
    padding: '20px 24px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '17px',
    color: '#1565c0',
    border: 'none',
    textAlign: 'left',
  },
  activeHeader: {
    background: 'linear-gradient(135deg, #eef7ff, #e0f2fe)',
  },
  toggleIcon: {
    width: '12px',
    height: '12px',
    borderRight: '3px solid #3b82f6',
    borderBottom: '3px solid #3b82f6',
    transition: 'transform 0.3s ease',
    marginLeft: '10px',
    flexShrink: 0,
  },
  accordionContent: {
    overflow: 'hidden',
    background: '#ffffff',
    fontSize: '15px',
    color: '#374151',
    transition: 'max-height 0.35s ease, padding 0.35s ease',
  },
  accordionText: {
    margin: 0,
    lineHeight: 1.7,
  },
  checkboxGroup: {
    marginTop: '30px',
  },
  label: {
    fontSize: '15px',
    display: 'block',
    marginBottom: '12px',
    fontWeight: 500,
  },
  checkbox: {
    marginRight: '10px',
    transform: 'scale(1.2)',
    accentColor: '#2563eb',
  },
  button: {
    marginTop: '24px',
    width: '100%',
    height: 48,
    borderRadius: '14px',
    fontWeight: 700,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  success: {
    marginTop: '18px',
    color: '#15803d',
    fontWeight: 700,
    textAlign: 'center',
  },
};

export default AgreementsPage;
