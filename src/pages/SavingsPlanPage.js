import React, { useMemo, useState } from 'react';
import { Button, Card, Col, InputNumber, Progress, Row, Space, Statistic, Steps, Tag, Timeline, Typography, message } from 'antd';
import { BankOutlined, CalendarOutlined, CheckCircleOutlined, CompassOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} сом`;

const SavingsPlanPage = () => {
  const [searchParams] = useSearchParams();

  const destination = searchParams.get('destination') || 'Выберите тур';
  const budget = Number(searchParams.get('budget') || 45000);
  const months = Number(searchParams.get('months') || 6);
  const initial = Number(searchParams.get('initial') || 8000);
  const monthly = Number(searchParams.get('monthly') || Math.ceil((budget - initial) / months));

  const [savedAmount, setSavedAmount] = useState(initial);
  const [customAdd, setCustomAdd] = useState(null);

  const remainingAmount = useMemo(() => Math.max(budget - savedAmount, 0), [budget, savedAmount]);
  const progress = useMemo(() => {
    if (!budget || budget <= 0) return 0;
    return Math.min(Math.round((savedAmount / budget) * 100), 100);
  }, [savedAmount, budget]);
  const monthsLeft = useMemo(() => {
    if (!monthly || monthly <= 0) return 0;
    return Math.ceil(remainingAmount / monthly);
  }, [remainingAmount, monthly]);
  const isGoalReady = progress >= 100;

  const addAmount = (value) => {
    if (!value || value <= 0) return;
    setSavedAmount((prev) => Math.min(prev + value, budget));
    message.success(`Добавлено ${formatMoney(value)}`);
  };

  const handleCustomAdd = () => {
    addAmount(customAdd);
    setCustomAdd(null);
  };

  const resetPlan = () => {
    setSavedAmount(initial);
    setCustomAdd(null);
    message.info('План сброшен к стартовой сумме');
  };

  const stepItems = [
    { title: 'Старт', description: formatMoney(initial) },
    { title: 'Накопление', description: `${formatMoney(monthly)} / месяц` },
    { title: 'Бронирование', description: isGoalReady ? 'Готово' : `осталось ${monthsLeft} мес.` },
  ];

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <Tag color="gold" style={styles.heroTag}>TravelPay Savings</Tag>
          <Title level={1} style={styles.heroTitle}>План накопления на поездку</Title>
          <Paragraph style={styles.heroText}>
            Реалистичный план, который показывает цель, прогресс, ежемесячный взнос и дату, когда поездку можно бронировать.
          </Paragraph>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={styles.goalCard}>
          <Text style={styles.goalLabel}>Цель</Text>
          <Title level={2} style={styles.goalAmount}>{formatMoney(budget)}</Title>
          <Text style={styles.goalDestination}><CompassOutlined /> {destination}</Text>
        </motion.div>
      </section>

      <section style={styles.content}>
        <Row gutter={[18, 18]}>
          <Col xs={24} md={8}>
            <Card style={styles.metricCard}>
              <Statistic title="Накоплено" value={savedAmount} suffix="сом" prefix={<BankOutlined />} valueStyle={{ color: BRAND_BLUE }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={styles.metricCard}>
              <Statistic title="Осталось" value={remainingAmount} suffix="сом" prefix={<DollarOutlined />} valueStyle={{ color: BRAND_GOLD }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card style={styles.metricCard}>
              <Statistic title="До цели" value={monthsLeft} suffix="мес." prefix={<CalendarOutlined />} valueStyle={{ color: BRAND_BLUE }} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[18, 18]} style={{ marginTop: 18 }}>
          <Col xs={24} lg={15}>
            <Card style={styles.mainCard}>
              <Space direction="vertical" size={22} style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ color: BRAND_BLUE }}>Прогресс цели</Text>
                  <Progress
                    percent={progress}
                    strokeColor={{ '0%': BRAND_BLUE, '100%': BRAND_GOLD }}
                    trailColor="#e8edf5"
                    size={[undefined, 16]}
                    style={{ marginTop: 10 }}
                  />
                  <div style={styles.progressMeta}>
                    <span>Срок плана: <strong>{months} мес.</strong></span>
                    <span>Платеж: <strong>{formatMoney(monthly)}</strong></span>
                  </div>
                </div>

                <Steps current={isGoalReady ? 2 : progress > 0 ? 1 : 0} items={stepItems} />

                <div style={styles.actionPanel}>
                  <Button type="primary" size="large" onClick={() => addAmount(monthly)} style={styles.primaryButton}>
                    Добавить месячный взнос
                  </Button>
                  <Button size="large" onClick={() => addAmount(Math.ceil(monthly / 2))}>
                    + половина взноса
                  </Button>
                  <Button size="large" onClick={resetPlan}>
                    Сбросить
                  </Button>
                </div>

                <div style={styles.customAdd}>
                  <InputNumber
                    min={1}
                    value={customAdd}
                    onChange={setCustomAdd}
                    placeholder="Своя сумма"
                    style={{ flex: 1, minWidth: 180 }}
                    size="large"
                  />
                  <Button size="large" onClick={handleCustomAdd} style={styles.goldButton}>
                    Добавить
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card title="Финансовый маршрут" style={styles.mainCard}>
              <Timeline
                items={[
                  {
                    dot: <CheckCircleOutlined style={{ color: BRAND_GOLD }} />,
                    children: (
                      <>
                        <Text strong>Стартовый взнос</Text>
                        <Paragraph type="secondary">{formatMoney(initial)} уже в плане.</Paragraph>
                      </>
                    ),
                  },
                  {
                    dot: <RiseOutlined style={{ color: BRAND_BLUE }} />,
                    children: (
                      <>
                        <Text strong>Ежемесячное пополнение</Text>
                        <Paragraph type="secondary">Вносите {formatMoney(monthly)} каждый месяц.</Paragraph>
                      </>
                    ),
                  },
                  {
                    color: isGoalReady ? 'green' : 'gray',
                    children: (
                      <>
                        <Text strong>{isGoalReady ? 'Цель достигнута' : 'Финальный шаг'}</Text>
                        <Paragraph type="secondary">
                          {isGoalReady ? 'Можно переходить к бронированию тура.' : `Осталось накопить ${formatMoney(remainingAmount)}.`}
                        </Paragraph>
                      </>
                    ),
                  },
                ]}
              />

              <Space direction="vertical" style={{ width: '100%' }}>
                <Link to="/tours">
                  <Button block type="primary" style={styles.primaryButton}>Выбрать тур</Button>
                </Link>
                <Link to="/favorites">
                  <Button block>Открыть избранное</Button>
                </Link>
              </Space>
            </Card>
          </Col>
        </Row>
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    paddingBottom: 60,
  },
  hero: {
    background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #27486f 70%, ${BRAND_GOLD} 100%)`,
    padding: '58px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  heroTag: {
    color: BRAND_BLUE,
    fontWeight: 900,
    border: 'none',
  },
  heroTitle: {
    color: '#fff',
    margin: '12px 0 10px',
  },
  heroText: {
    color: '#dce8f7',
    maxWidth: 680,
    fontSize: 16,
    margin: 0,
  },
  goalCard: {
    minWidth: 260,
    borderRadius: 20,
    padding: 24,
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.24)',
    boxShadow: '0 18px 38px rgba(0,0,0,0.16)',
  },
  goalLabel: {
    color: '#fff',
    fontWeight: 800,
  },
  goalAmount: {
    color: BRAND_GOLD,
    margin: '8px 0',
  },
  goalDestination: {
    color: '#fff',
    fontWeight: 800,
  },
  content: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '26px 20px 0',
  },
  metricCard: {
    borderRadius: 16,
    border: 'none',
    boxShadow: '0 14px 34px rgba(29,53,87,0.08)',
  },
  mainCard: {
    borderRadius: 16,
    border: 'none',
    boxShadow: '0 14px 34px rgba(29,53,87,0.08)',
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    color: '#64748b',
  },
  actionPanel: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  customAdd: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryButton: {
    background: BRAND_BLUE,
    borderColor: BRAND_BLUE,
    fontWeight: 900,
  },
  goldButton: {
    background: BRAND_GOLD,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 900,
  },
};

export default SavingsPlanPage;
