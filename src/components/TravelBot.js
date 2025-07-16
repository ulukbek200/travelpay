import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fontFamily = "'Poppins', sans-serif";

const TravelBot = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const chatRef = useRef(null);

  const questions = [
    'Куда ты хочешь поехать?',
    'Когда ты планируешь поездку?',
    'Какой у тебя бюджет (в долларах)?',
    'Что бы ты хотел включить в поездку? (море, горы, экскурсии и т.д.)',
    'Есть ли у тебя аллергии или особенности здоровья, которые нужно учитывать?',
    'Что тебе больше нравится: активный отдых, релакс или смешанный?'
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (open && step === -1) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{ sender: 'bot', text: 'Привет! Я помогу тебе спланировать путешествие 😊' }]);
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
    if (!input || input.length < 2) {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: input },
        { sender: 'bot', text: 'Пожалуйста, введите корректный ответ (дату, город, бюджет и т.д.)' }
      ]);
      return;
    }
  
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

  const handleOption = (value) => handleAnswer(value);

  const resetChat = () => {
    setMessages([]);
    setAnswers({});
    setStep(-1);
    setIsTyping(false);
  };

  const hideBot = scrollY > 500;

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#1d3557',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          padding: '12px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          opacity: hideBot ? 0 : 1,
          pointerEvents: hideBot ? 'none' : 'auto',
          transition: 'opacity 0.4s ease-in-out',
          fontFamily
        }}
      >
        🧭 Спланировать путешествие
      </motion.button>

      <AnimatePresence>
        {open && !hideBot && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, y: -scrollY * 0.2 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '20px',
              width: '340px',
              background: '#ffffff',
              borderRadius: '18px',
              padding: '20px 15px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '520px',
              overflow: 'hidden',
              fontFamily
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
                        backgroundColor: '#e5e5e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                      fontSize: '14px',
                      lineHeight: '1.4',
                      fontFamily
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
                        backgroundColor: '#1d3557',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                          border: '1px solid #1d3557',
                          backgroundColor: '#fca311',
                          color: '#1d3557',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          fontFamily
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
                    fontSize: '14px',
                    width: '100%',
                    fontFamily
                  }}
                />
              </>
            ) : (
              step >= questions.length && (
                <div style={{ fontSize: '14px', fontFamily }}>
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
                      fontWeight: '500',
                      fontFamily
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
                      fontSize: '14px',
                      fontFamily
                    }}
                  >
                    📍 Перейти к турам
                  </a>
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TravelBot;