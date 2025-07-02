import React, { useState, useEffect, useRef } from 'react';

const TravelBot = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef(null);

  const questions = [
    'Куда планируете поехать?',
    'Когда вы планируете поездку?',
    'Какой у вас бюджет (в долларах)?',
    'Что бы вы хотели включить в поездку? (море, горы, экскурсии и т.д.)',
    'Есть ли у вас аллергии или особенности здоровья, которые нужно учитывать?',
    'Что вы предпочитаете: активный отдых, релакс или смешанный?'
  ];

  useEffect(() => {
    if (open && step === -1) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{ sender: 'bot', text: 'Привет! Я помогу вам спланировать путешествие 😊' }]);
        setIsTyping(false);
        setStep(0);
      }, 1000);
    } else if (open && step >= 0 && step < questions.length) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text: questions[step] }]);
        setIsTyping(false);
      }, 800);
    }
  }, [step, open]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleAnswer = (input) => {
    if (step === 1 && /не знаю|не определил|не решил|не уверен/i.test(input)) {
      input = 'Будет определено позже';
    }

    setMessages(prev => [
      ...prev,
      { sender: 'user', text: input },
      { sender: 'bot', text: 'Отлично, понял!' }
    ]);
    setAnswers(prev => ({ ...prev, [step]: input }));
    setStep(prev => prev + 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      handleAnswer(e.target.value.trim());
      e.target.value = '';
    }
  };

  const handleOption = (value) => {
    handleAnswer(value);
  };

  const resetChat = () => {
    setMessages([]);
    setAnswers({});
    setStep(-1);
    setIsTyping(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#1d3557',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          padding: '12px 20px',
          fontFamily: `'Poppins', sans-serif`,
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s',
        }}
      >
        🧭 Спланировать путешествие
      </button>

      <div
        style={{
          position: 'fixed',
          bottom: open ? '80px' : '20px',
          right: '20px',
          width: '340px',
          background: '#ffffff',
          borderRadius: '18px',
          padding: '20px 15px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          transform: open ? 'translateY(0)' : 'translateY(20px)',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transition: 'all 0.4s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '520px',
          overflow: 'hidden',
          fontFamily: `'Poppins', sans-serif`,
        }}
      >
        <div
          ref={chatRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '10px',
            paddingRight: '5px'
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end',
                marginBottom: '8px'
              }}
            >
              {msg.sender === 'bot' && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#FFA500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: `'Poppins', sans-serif`,
                    fontSize: '16px',
                    marginRight: '6px'
                  }}
                >
                  🤖
                </div>
              )}

              <div
                style={{
                  background: msg.sender === 'user' ? '#1d3557' : '#f1f1f1',
                  color: msg.sender === 'user' ? 'white' : '#222',
                  padding: '8px 14px',
                  borderRadius: '16px',
                  maxWidth: '80%',
                  fontFamily: `'Poppins', sans-serif`,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}
              >
                {msg.text}
              </div>

              {msg.sender === 'user' && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#FFA500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: `'Poppins', sans-serif`,
                    fontSize: '16px',
                    color: 'white',
                    marginLeft: '6px'
                  }}
                >
                  👤
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div style={{ fontStyle: 'italic', fontSize: '13px', color: '#555' }}>
              Бот печатает...
            </div>
          )}
        </div>

        {step >= 0 && step < questions.length ? (
          <>
            {step === 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                {['Париж', 'Бали', 'Турция'].map((place, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOption(place)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px #FFA500',
                      backgroundColor: '#fca311',
                      color: '#1d3557',
                      cursor: 'pointer',
                      fontFamily: `'Poppins', sans-serif`,
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    {place}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              onKeyDown={handleKeyDown}
              placeholder="Ваш ответ..."
              style={{
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontFamily: `'Poppins', sans-serif`,
                fontSize: '14px',
               
              }}
            />
          </>
        ) : (
          step >= questions.length && (
            <div style={{ fontSize: '14px' }}>
              🎉 Спасибо! Ты выбрал:
              <ul style={{ paddingLeft: '18px', marginTop: '5px' }}>
                <li>📍 Место: {answers[0]}</li>
                <li>📅 Дата: {answers[1]}</li>
                <li>💵 Бюджет: {answers[2]} $</li>
                <li>🌍 Предпочтения: {answers[3]}</li>
                <li>🩺 Ограничения / аллергии: {answers[4]}</li>
                <li>🏖 Стиль отдыха: {answers[5]}</li>
              </ul>
              <p style={{ marginTop: '10px' }}>
                💸 Рекомендуем откладывать по {(answers[2] && !isNaN(answers[2]) ? Math.ceil(answers[2] / 6) : 150)} $ в месяц для комфортной поездки.
              </p>
              <button
                onClick={resetChat}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#f1f1f1',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                🔄 Начать заново
              </button>
              <a
                href="/tours"
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  backgroundColor: '#fca311',
                  color: '#1d3557',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 'bold',           
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                📍 Перейти к турам
              </a>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default TravelBot;
