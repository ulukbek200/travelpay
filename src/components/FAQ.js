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
    <section style={styles.section} id="faq" data-aos="fade-up">
      <h2 style={styles.title}>Часто задаваемые вопросы</h2>
      <div style={styles.list}>
        {questions.map((item, index) => (
          <div key={index} style={styles.item}>
            <div style={styles.question}>{item.question}</div>
            <button style={styles.button} onClick={() => toggle(index)}>
              {openIndex === index ? 'Скрыть ответ' : 'Показать ответ'}
            </button>
            {openIndex === index && <div style={styles.answer}>{item.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 20px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    color: '#1d3557',
    marginBottom: '50px',
  },
  list: {
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'left',
  },
  item: {
    marginBottom: '30px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  question: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  answer: {
    marginTop: '15px',
    fontSize: '17px',
    lineHeight: '1.6',
    color: '#555',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#fca311',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'background-color 0.3s',
  },
};

export default FAQ;
