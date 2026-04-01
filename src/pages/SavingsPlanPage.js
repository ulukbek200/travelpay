import React, { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const fontFamily = "'Poppins', sans-serif";

const formatMoney = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString()} $`;
};

const SavingsPlanPage = () => {
  const [searchParams] = useSearchParams();

  const destination = searchParams.get('destination') || 'Не выбрано';
  const budget = Number(searchParams.get('budget') || 0);
  const months = Number(searchParams.get('months') || 6);
  const initial = Number(searchParams.get('initial') || 0);
  const monthly = Number(searchParams.get('monthly') || 0);

  const [savedAmount, setSavedAmount] = useState(initial);
  const [customAdd, setCustomAdd] = useState('');

  const remainingAmount = useMemo(() => {
    return Math.max(budget - savedAmount, 0);
  }, [budget, savedAmount]);

  const progress = useMemo(() => {
    if (!budget || budget <= 0) return 0;
    return Math.min(Math.round((savedAmount / budget) * 100), 100);
  }, [savedAmount, budget]);

  const monthsLeft = useMemo(() => {
    if (!monthly || monthly <= 0) return 0;
    return Math.ceil(remainingAmount / monthly);
  }, [remainingAmount, monthly]);

  const handleAddMonthly = () => {
    setSavedAmount((prev) => Math.min(prev + monthly, budget));
  };

  const handleAddCustom = () => {
    const value = Number(customAdd);
    if (!value || value <= 0) return;
    setSavedAmount((prev) => Math.min(prev + value, budget));
    setCustomAdd('');
  };

  const handleReset = () => {
    setSavedAmount(initial);
    setCustomAdd('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)',
        padding: '40px 20px',
        fontFamily
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: '24px'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
              border: '1px solid #e5e7eb'
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: '#fca311',
                color: '#1d3557',
                fontWeight: 700,
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '999px',
                marginBottom: '16px'
              }}
            >
              TravelPay Savings Plan
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                color: '#1d3557',
                lineHeight: 1.2
              }}
            >
              План накопления на поездку
            </h1>

            <p
              style={{
                marginTop: '12px',
                color: '#475569',
                fontSize: '16px',
                lineHeight: 1.7
              }}
            >
              Здесь пользователь видит, сколько уже накоплено, сколько осталось,
              и какой ежемесячный платеж нужен для поездки в <strong>{destination}</strong>.
            </p>

            <div
              style={{
                marginTop: '24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px'
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '18px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Направление
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1d3557' }}>
                  {destination}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '18px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Общий бюджет
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1d3557' }}>
                  {formatMoney(budget)}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '18px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Первоначальный взнос
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1d3557' }}>
                  {formatMoney(initial)}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '18px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  Ежемесячный платеж
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#1d3557' }}>
                  {formatMoney(monthly)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '24px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '20px',
                padding: '20px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Накоплено</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1d3557' }}>
                    {formatMoney(savedAmount)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Осталось</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#1d3557' }}>
                    {formatMoney(remainingAmount)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '14px',
                  borderRadius: '999px',
                  background: '#e2e8f0',
                  overflow: 'hidden',
                  marginTop: '14px',
                  marginBottom: '10px'
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #1d3557, #fca311)',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: '14px',
                  color: '#475569',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <span>Прогресс: <strong>{progress}%</strong></span>
                <span>Срок плана: <strong>{months} мес.</strong></span>
                <span>Осталось месяцев: <strong>{monthsLeft}</strong></span>
              </div>
            </div>

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <button
                onClick={handleAddMonthly}
                style={{
                  background: '#1d3557',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Добавить месячный платеж
              </button>

              <button
                onClick={handleReset}
                style={{
                  background: '#eef2f7',
                  color: '#1d3557',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Сбросить
              </button>
            </div>

            <div
              style={{
                marginTop: '18px',
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <input
                type="number"
                value={customAdd}
                onChange={(e) => setCustomAdd(e.target.value)}
                placeholder="Добавить сумму вручную"
                style={{
                  flex: 1,
                  minWidth: '220px',
                  border: '1px solid #d1d5db',
                  borderRadius: '14px',
                  padding: '14px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />

              <button
                onClick={handleAddCustom}
                style={{
                  background: '#fca311',
                  color: '#1d3557',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Добавить
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
                border: '1px solid #e5e7eb'
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: '14px',
                  color: '#1d3557',
                  fontSize: '22px'
                }}
              >
                Краткий план
              </h2>

              <div style={{ display: 'grid', gap: '12px' }}>
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Шаг 1</div>
                  <div style={{ fontWeight: 700, color: '#1d3557', marginTop: '4px' }}>
                    Внести первый взнос
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
                    Начни с {formatMoney(initial)}
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Шаг 2</div>
                  <div style={{ fontWeight: 700, color: '#1d3557', marginTop: '4px' }}>
                    Откладывать каждый месяц
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
                    По {formatMoney(monthly)} в течение {months} месяцев
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '16px',
                    padding: '14px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Шаг 3</div>
                  <div style={{ fontWeight: 700, color: '#1d3557', marginTop: '4px' }}>
                    Забронировать поездку
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px' }}>
                    Когда сумма будет полностью накоплена
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 18px 45px rgba(15,23,42,0.08)',
                border: '1px solid #e5e7eb'
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: '14px',
                  color: '#1d3557',
                  fontSize: '22px'
                }}
              >
                Действия
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  to="/register"
                  style={{
                    textDecoration: 'none',
                    textAlign: 'center',
                    background: '#1d3557',
                    color: '#fff',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    fontWeight: 700
                  }}
                >
                  Перейти к регистрации
                </Link>

                <Link
                  to="/tours"
                  style={{
                    textDecoration: 'none',
                    textAlign: 'center',
                    background: '#fca311',
                    color: '#1d3557',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    fontWeight: 700
                  }}
                >
                  Смотреть все туры
                </Link>

                <Link
                  to="/"
                  style={{
                    textDecoration: 'none',
                    textAlign: 'center',
                    background: '#eef2f7',
                    color: '#1d3557',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    fontWeight: 700
                  }}
                >
                  Вернуться на главную
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsPlanPage;