import React, { useState } from 'react';

const FAQ = () => {
  const questions = [
    {
      question: 'Как я могу забронировать тур?',
      answer: 'Вы можете забронировать тур через наш сайт или связавшись с менеджером по телефону или WhatsApp.',
    },
    {
      question: 'Какие документы мне нужны для поездки?',
      answer: 'Для большинства стран нужен загранпаспорт. Мы также помогаем в оформлении визы, если это требуется.',
    },
    {
      question: 'Есть ли у вас туры с русскоязычным гидом?',
      answer: 'Да, во многих странах у нас есть туры с русскоязычным сопровождением.',
    },
    {
      question: 'Какие способы оплаты вы принимаете?',
      answer: 'Мы принимаем оплату банковскими картами, наличными, а также онлайн-оплату через QR и электронные кошельки.',
    },
    {
      question: 'Могу ли я вернуть деньги при отмене поездки?',
      answer: 'Условия возврата зависят от тура. В большинстве случаев возможен частичный или полный возврат в зависимости от даты отмены.',
    },
    {
      question: 'Есть ли скидки для групп?',
      answer: 'Да, для групп от 4 человек предоставляются индивидуальные скидки. Свяжитесь с нами для расчёта.',
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section style={styles.section} id="faq">
      <h2 style={styles.title}>Часто задаваемые вопросы</h2>
      <div style={styles.list}>
        {questions.map((item, index) => (
          <div key={index} style={styles.item}>
            <button
              style={{
                ...styles.questionButton,
                color: openIndex === index ? '#fca311' : '#1d3557',
                borderColor: openIndex === index ? '#fca311' : '#ddd',
              }}
              onClick={() => toggle(index)}
              aria-expanded={openIndex === index}
            >
              <span>{item.question}</span>
              <span style={{ ...styles.arrow, transform: openIndex === index ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                ▶️
              </span>
            </button>
            <div
              style={{
                ...styles.answer,
                maxHeight: openIndex === index ? '500px' : '0',
                opacity: openIndex === index ? 1 : 0,
                padding: openIndex === index ? '15px 20px' : '0 20px',
              }}
            >
              {item.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 20px',
    backgroundColor: '#f0f4f8',
    marginTop: '-50px',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '36px',
    color: '#1d3557',
    marginBottom: '70px',
    marginLeft: '70px',
  },
  list: {
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'left',
    marginLeft: '185px',
  },
  item: {
    marginBottom: '20px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.07)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s ease',
  },
  questionButton: {
    width: '100%',
    padding: '20px',
    background: 'none',
    border: '2px solid #ddd',
    borderRadius: '12px',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'color 0.3s, border-color 0.3s',
  },
  arrow: {
    display: 'inline-block',
    transition: 'transform 0.3s ease',
    fontSize: '20px',
  },
  answer: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '17px',
    lineHeight: '1.6',
    color: '#555',
    overflow: 'hidden',
    transition: 'max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease',
  },
};

export default FAQ;
