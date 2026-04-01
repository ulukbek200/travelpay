import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const fontFamily = "'Poppins', sans-serif";
const API_BASE_URL = "http://localhost:10000";

const SAVING_PERIODS = [3, 6, 9, 12];

const TravelBot = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [finalPlan, setFinalPlan] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState(6);

  const chatRef = useRef(null);
  const timerRef = useRef(null);

  const questions = [
    {
      key: 'budget',
      text: 'Какой у тебя примерный бюджет на поездку? (в долларах)',
      type: 'input'
    },
    {
      key: 'nature',
      text: 'Что тебе ближе?',
      type: 'options',
      options: ['Горы', 'Озеро', 'Лес', 'Город + прогулки']
    },
    {
      key: 'activity',
      text: 'Какой отдых тебе нравится?',
      type: 'options',
      options: ['Активный', 'Спокойный', 'Смешанный']
    },
    {
      key: 'company',
      text: 'С кем ты хочешь поехать?',
      type: 'options',
      options: ['Один', 'С друзьями', 'С семьёй', 'С парой']
    },
    {
      key: 'comfort',
      text: 'Какой уровень комфорта ты предпочитаешь?',
      type: 'options',
      options: ['Эконом', 'Стандарт', 'Комфорт']
    },
    {
      key: 'preferences',
      text: 'Что для тебя важно в поездке? Напиши через запятую. Например: природа, фото, тишина, экскурсии, юрты, лошади',
      type: 'input'
    },
    {
      key: 'health',
      text: 'Есть ли аллергии или особенности здоровья, которые нужно учитывать?',
      type: 'input'
    }
  ];

  const totalSteps = questions.length;

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (step === -1 && messages.length === 0) {
      setIsTyping(true);
      timerRef.current = setTimeout(() => {
        setMessages([
          {
            sender: 'bot',
            text: 'Привет! Я помогу подобрать тебе направление по Кыргызстану и рассчитаю удобный накопительный план ✨'
          }
        ]);
        setIsTyping(false);
        setStep(0);
      }, 700);
      return;
    }

    if (step >= 0 && step < totalSteps) {
      const currentQuestion = questions[step]?.text;
      const lastMessage = messages[messages.length - 1];

      if (lastMessage?.sender === 'bot' && lastMessage?.text === currentQuestion) {
        return;
      }

      setIsTyping(true);
      timerRef.current = setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', text: currentQuestion }]);
        setIsTyping(false);
      }, 500);
    }
  }, [open, step, messages, totalSteps]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping, loadingAi, finalPlan, selectedMonths]);

  const progress = useMemo(() => {
    if (step < 0) return 0;
    if (step >= totalSteps) return 100;
    return Math.round((step / totalSteps) * 100);
  }, [step, totalSteps]);

  const hideBot = scrollY > 500;

  const validateInput = (value) => {
    if (!value || value.trim().length < 2) {
      return 'Пожалуйста, введите более точный ответ.';
    }

    if (questions[step]?.key === 'budget') {
      const num = Number(value.replace(/[^\d.]/g, ''));
      if (Number.isNaN(num) || num <= 0) {
        return 'Пожалуйста, введи бюджет числом, например: 300';
      }
    }

    return null;
  };

  const normalizeAnswer = (questionKey, value) => {
    let result = value.trim();

    if (questionKey === 'budget') {
      result = String(Number(result.replace(/[^\d.]/g, '')));
    }

    if (questionKey === 'health' && /нет|none|no|не[т ]*имею/i.test(result)) {
      result = 'Нет особенностей';
    }

    return result;
  };

  const getRecommendation = (finalAnswers) => {
    const userBudget = Number(finalAnswers.budget || 0);
    const nature = finalAnswers.nature || '';
    const activity = finalAnswers.activity || '';
    const company = finalAnswers.company || '';
    const comfort = finalAnswers.comfort || '';
    const preferences = (finalAnswers.preferences || '').toLowerCase();

    let plan = {
      destination: 'Иссык-Куль',
      subtitle: 'Озеро, отдых и красивые виды',
      reason: 'это универсальное направление для отдыха в Кыргызстане',
      format: 'Смешанный отдых',
      estimatedBudget: userBudget > 0 ? userBudget : 250,
      duration: '3–5 дней',
      badge: 'Популярный выбор',
      emoji: '🏝',
      image: '/images/issyk-kul.jpg'
    };

    if (nature === 'Горы' && activity === 'Активный') {
      plan = {
        destination: 'Ала-Арча',
        subtitle: 'Горы, треки и активный отдых',
        reason: 'тебе нравится активный отдых и горные направления',
        format: 'Активный',
        estimatedBudget: userBudget > 0 ? userBudget : 180,
        duration: '1–3 дня',
        badge: 'Для активных',
        emoji: '⛰',
        image: '/images/ala-archa.jpg'
      };
    }

    if (nature === 'Лес' || preferences.includes('лес') || preferences.includes('природа')) {
      plan = {
        destination: 'Арсланбоб',
        subtitle: 'Лес, воздух и спокойствие',
        reason: 'тебе подходит более спокойная природная атмосфера',
        format: 'Спокойный отдых',
        estimatedBudget: userBudget > 0 ? userBudget : 220,
        duration: '2–4 дня',
        badge: 'Природа',
        emoji: '🌿',
        image: '/images/arslanbob.jpg'
      };
    }

    if (
      preferences.includes('юрты') ||
      preferences.includes('лошади') ||
      preferences.includes('тишина')
    ) {
      plan = {
        destination: 'Сон-Куль',
        subtitle: 'Юрты, кони и аутентичная атмосфера',
        reason: 'тебе может понравиться тишина, этно-отдых и настоящая природа',
        format: 'Этно + релакс',
        estimatedBudget: userBudget > 0 ? userBudget : 280,
        duration: '2–4 дня',
        badge: 'Аутентично',
        emoji: '🐎',
        image: '/images/son-kul.jpg'
      };
    }

    if (
      nature === 'Город + прогулки' ||
      preferences.includes('экскурсии') ||
      preferences.includes('город')
    ) {
      plan = {
        destination: 'Бишкек + Ала-Арча',
        subtitle: 'Городской комфорт и короткий выезд на природу',
        reason: 'тебе подходят прогулки, кафе, экскурсии и не слишком сложный маршрут',
        format: 'Город + природа',
        estimatedBudget: userBudget > 0 ? userBudget : 160,
        duration: '1–3 дня',
        badge: 'Удобно',
        emoji: '🏙',
        image: '/images/bishkek-alaarcha.jpg'
      };
    }

    if (company === 'С парой' && (preferences.includes('фото') || comfort === 'Комфорт')) {
      plan = {
        destination: 'Каракол + Джети-Огуз',
        subtitle: 'Атмосферная поездка вдвоём',
        reason: 'для пары это красивое и запоминающееся направление',
        format: 'Романтичный + природа',
        estimatedBudget: userBudget > 0 ? userBudget : 350,
        duration: '3–5 дней',
        badge: 'Для двоих',
        emoji: '❤️',
        image: '/images/karakol-jeti-oguz.jpg'
      };
    }

    if (company === 'С семьёй' && nature === 'Озеро') {
      plan = {
        destination: 'Иссык-Куль',
        subtitle: 'Комфортный семейный отдых у озера',
        reason: 'это удобное и понятное направление для семейной поездки',
        format: 'Семейный отдых',
        estimatedBudget: userBudget > 0 ? userBudget : 300,
        duration: '3–6 дней',
        badge: 'Для семьи',
        emoji: '👨‍👩‍👧‍👦',
        image: '/images/issyk-kul-family.jpg'
      };
    }

    return plan;
  };

  const getSavingsPlan = (planBudget, months) => {
    const totalBudget = Number(planBudget || 0);

    let initialPercent = 0.2;
    if (months === 3) initialPercent = 0.35;
    if (months === 6) initialPercent = 0.25;
    if (months === 9) initialPercent = 0.2;
    if (months === 12) initialPercent = 0.15;

    const initialPayment = Math.ceil(totalBudget * initialPercent);
    const remainingAmount = Math.max(totalBudget - initialPayment, 0);
    const monthlyPayment = months > 0 ? Math.ceil(remainingAmount / months) : remainingAmount;

    return {
      totalBudget,
      initialPayment,
      remainingAmount,
      monthlyPayment,
      months
    };
  };

  const generateTravelPlan = async (finalAnswers) => {
    const localPlan = getRecommendation(finalAnswers);
    setFinalPlan(localPlan);

    try {
      setLoadingAi(true);

      const response = await fetch(`${API_BASE_URL}/api/travel-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: finalAnswers.budget || '',
          nature: finalAnswers.nature || '',
          activity: finalAnswers.activity || '',
          company: finalAnswers.company || '',
          comfort: finalAnswers.comfort || '',
          preferences: finalAnswers.preferences || '',
          health: finalAnswers.health || '',
          recommendedDestination: localPlan.destination
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка сервера');
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text:
            data.reply ||
            `Я рекомендую тебе ${localPlan.destination}, потому что ${localPlan.reason}.`
        }
      ]);
    } catch (error) {
      console.error('AI error:', error);

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text:
            `Я рекомендую тебе ${localPlan.destination}, потому что ${localPlan.reason}. ` +
            `Ниже я уже подготовил пример накопительного плана.`
        }
      ]);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAnswer = async (rawInput) => {
    const currentQuestion = questions[step];
    if (!currentQuestion) return;

    const errorText = validateInput(rawInput);
    if (errorText) {
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: rawInput?.trim() || '...' },
        { sender: 'bot', text: errorText }
      ]);
      return;
    }

    const normalized = normalizeAnswer(currentQuestion.key, rawInput);

    const updatedAnswers = {
      ...answers,
      [currentQuestion.key]: normalized
    };

    setMessages(prev => [
      ...prev,
      { sender: 'user', text: normalized },
      {
        sender: 'bot',
        text:
          step === totalSteps - 1
            ? 'Отлично! Сейчас подберу для тебя направление и рассчитаю план накопления 💡'
            : 'Отлично, записал 👌'
      }
    ]);

    setAnswers(updatedAnswers);
    setInputValue('');

    if (step === totalSteps - 1) {
      setStep(totalSteps);
      await generateTravelPlan(updatedAnswers);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleOption = async (value) => {
    await handleAnswer(value);
  };

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      await handleAnswer(inputValue);
    }
  };

  const resetChat = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessages([]);
    setAnswers({});
    setStep(-1);
    setIsTyping(false);
    setLoadingAi(false);
    setInputValue('');
    setFinalPlan(null);
    setSelectedMonths(6);
  };

  const recommendation = finalPlan || getRecommendation(answers);
  const savingsPlan = getSavingsPlan(recommendation?.estimatedBudget || 0, selectedMonths);

  return (
    <>
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        whileTap={{ scale: 0.96 }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #1d3557, #274c77)',
          color: '#fff',
          border: 'none',
          borderRadius: '999px',
          padding: '13px 20px',
          fontSize: '15px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 12px 24px rgba(0,0,0,0.20)',
          opacity: hideBot ? 0 : 1,
          pointerEvents: hideBot ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
          fontFamily,
          fontWeight: 700
        }}
      >
        ✈️ Подобрать поездку
      </motion.button>

      <AnimatePresence>
        {open && !hideBot && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              bottom: '82px',
              right: '20px',
              width: '410px',
              maxHeight: '720px',
              background: '#ffffff',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.24)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              fontFamily
            }}
          >
            <div
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #1d3557, #457b9d)',
                color: '#fff'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 700 }}>TravelPay AI</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    Умный подбор поездки по Кыргызстану
                  </div>
                </div>

                <button
                  onClick={resetChat}
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.18)',
                    color: '#fff',
                    borderRadius: '10px',
                    padding: '7px 10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontFamily
                  }}
                >
                  Сброс
                </button>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255,255,255,0.22)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: '#fca311',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            <div
              ref={chatRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                background: '#f8fafc'
              }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '10px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '82%',
                      background: msg.sender === 'user' ? '#1d3557' : '#fff',
                      color: msg.sender === 'user' ? '#fff' : '#1f2937',
                      padding: '10px 14px',
                      borderRadius: msg.sender === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      boxShadow: msg.sender === 'user'
                        ? '0 8px 20px rgba(29,53,87,0.18)'
                        : '0 8px 18px rgba(15,23,42,0.06)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div style={{ fontStyle: 'italic', fontSize: '13px', color: '#64748b' }}>
                  Бот печатает...
                </div>
              )}

              {loadingAi && (
                <div style={{ fontStyle: 'italic', fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
                  Анализирую ответы и готовлю рекомендацию...
                </div>
              )}

              {step >= totalSteps && recommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    marginTop: '14px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#fff',
                    boxShadow: '0 14px 30px rgba(15,23,42,0.10)',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={recommendation.image}
                      alt={recommendation.destination}
                      style={{
                        width: '100%',
                        height: '170px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-trip.jpg';
                      }}
                    />

                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: '#fca311',
                        color: '#1d3557',
                        borderRadius: '999px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      {recommendation.badge}
                    </div>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '6px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#1d3557' }}>
                          {recommendation.emoji} {recommendation.destination}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {recommendation.subtitle}
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#eef4ff',
                          color: '#1d3557',
                          padding: '6px 10px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {recommendation.duration}
                      </div>
                    </div>

                    <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, marginBottom: '12px' }}>
                      {recommendation.reason}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '14px'
                      }}
                    >
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '14px',
                          padding: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Формат
                        </div>
                        <div style={{ fontWeight: 700, color: '#1d3557', fontSize: '14px' }}>
                          {recommendation.format}
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '14px',
                          padding: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Общий бюджет
                        </div>
                        <div style={{ fontWeight: 700, color: '#1d3557', fontSize: '14px' }}>
                          {savingsPlan.totalBudget} $
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1d3557',
                          marginBottom: '8px'
                        }}
                      >
                        Выбери срок накопления
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {SAVING_PERIODS.map((months) => (
                          <button
                            key={months}
                            onClick={() => setSelectedMonths(months)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '999px',
                              border: selectedMonths === months ? '1px solid #1d3557' : '1px solid #cbd5e1',
                              background: selectedMonths === months ? '#1d3557' : '#fff',
                              color: selectedMonths === months ? '#fff' : '#1d3557',
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '13px',
                              fontFamily
                            }}
                          >
                            {months} мес.
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '14px'
                      }}
                    >
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '14px',
                          padding: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Первоначальный взнос
                        </div>
                        <div style={{ fontWeight: 700, color: '#1d3557', fontSize: '14px' }}>
                          {savingsPlan.initialPayment} $
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '14px',
                          padding: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Остаток
                        </div>
                        <div style={{ fontWeight: 700, color: '#1d3557', fontSize: '14px' }}>
                          {savingsPlan.remainingAmount} $
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '14px',
                          padding: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Платёж в месяц
                        </div>
                        <div style={{ fontWeight: 700, color: '#1d3557', fontSize: '14px' }}>
                          {savingsPlan.monthlyPayment} $
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '14px',
                          padding: '12px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                          Уровень
                        </div>
                        <div style={{ fontWeight: 700, color: '#1d3557', fontSize: '14px' }}>
                          {answers.comfort || 'Стандарт'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'linear-gradient(135deg, #fff7e6, #fff2cc)',
                        border: '1px solid #fde68a',
                        borderRadius: '14px',
                        padding: '12px',
                        marginBottom: '14px'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '4px', fontSize: '13px' }}>
                        Накопительный план TravelPay
                      </div>
                      <div style={{ fontSize: '13px', color: '#78350f', lineHeight: 1.5 }}>
                        Для тура <strong>{recommendation.destination}</strong> можно начать с{' '}
                        <strong>{savingsPlan.initialPayment} $</strong>, а затем откладывать по{' '}
                        <strong>{savingsPlan.monthlyPayment} $ в месяц</strong> в течение{' '}
                        <strong>{savingsPlan.months} мес.</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/savings-plan?destination=${encodeURIComponent(
                          recommendation.destination
                        )}&budget=${savingsPlan.totalBudget}&months=${savingsPlan.months}&initial=${savingsPlan.initialPayment}&monthly=${savingsPlan.monthlyPayment}`}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          textDecoration: 'none',
                          background: '#1d3557',
                          color: '#fff',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          fontWeight: 700,
                          fontSize: '14px'
                        }}
                      >
                        💰 Начать копить
                      </Link>

                      <Link
                        to="/tours"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          textDecoration: 'none',
                          background: '#fca311',
                          color: '#1d3557',
                          padding: '12px 14px',
                          borderRadius: '14px',
                          fontWeight: 700,
                          fontSize: '14px'
                        }}
                      >
                        📍 Смотреть туры
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div
              style={{
                padding: '14px 16px 16px',
                borderTop: '1px solid #e5e7eb',
                background: '#fff'
              }}
            >
              {step >= 0 && step < totalSteps ? (
                <>
                  {questions[step]?.type === 'options' && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {questions[step].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOption(option)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '999px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#1d3557',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            fontFamily
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {questions[step]?.type === 'input' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Введите ответ..."
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          borderRadius: '14px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          outline: 'none',
                          fontFamily
                        }}
                      />
                      <button
                        onClick={() => handleAnswer(inputValue)}
                        disabled={!inputValue.trim()}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '14px',
                          border: 'none',
                          background: inputValue.trim() ? '#1d3557' : '#cbd5e1',
                          color: '#fff',
                          cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                          fontWeight: 700,
                          fontFamily
                        }}
                      >
                        Отпр.
                      </button>
                    </div>
                  )}
                </>
              ) : (
                step >= totalSteps && (
                  <button
                    onClick={resetChat}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '12px 14px',
                      background: '#eef2f7',
                      color: '#1d3557',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily
                    }}
                  >
                    Пройти опрос заново
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TravelBot;