import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  InputNumber,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  NotificationOutlined,
  PlusCircleOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import { readCurrentUser } from '../utils/currentUser';
import {
  buildSavingsChartData,
  createSavingsPlan,
  formatSavingsStatus,
  getSavingsMetrics,
  getSavingsStatusColor,
} from '../utils/savings';
import { mergeAndPersistCurrentUser, normalizeUser, syncCurrentUser } from '../utils/user';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#17325c';
const BRAND_GOLD = '#fca311';
const TURQUOISE = '#14b8a6';
const GOAL_OPTIONS = [50000, 100000, 150000, 200000];
const DURATION_OPTIONS = [3, 6, 9, 12];
const BONUS_REWARDS = [
  { rewardType: 'bonus_som', rewardValue: 100, label: '100 сом' },
  { rewardType: 'bonus_som', rewardValue: 500, label: '500 сом' },
  { rewardType: 'bonus_som', rewardValue: 1000, label: '1000 сом' },
  { rewardType: 'discount', rewardValue: 5, label: 'Скидка 5%' },
  { rewardType: 'discount', rewardValue: 10, label: 'Скидка 10%' },
];

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');

const SavingsPlanPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goalChoice, setGoalChoice] = useState(GOAL_OPTIONS[1]);
  const [customGoal, setCustomGoal] = useState(null);
  const [durationMonths, setDurationMonths] = useState(DURATION_OPTIONS[1]);
  const [topUpAmount, setTopUpAmount] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = readCurrentUser();

        if (!currentUser?.id) {
          setLoading(false);
          return;
        }

        const response = await api.get(`/users/${currentUser.id}`);
        const nextUser = syncCurrentUser({ ...normalizeUser(response.data), isLoggedIn: true });
        setUser(nextUser);
      } catch (error) {
        message.error('Не удалось загрузить накопления. Проверьте backend.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const savingsMetrics = useMemo(() => getSavingsMetrics(user?.savings, new Date(now)), [user?.savings, now]);
  const selectedGoal = goalChoice === 'custom' ? Number(customGoal || 0) : Number(goalChoice || 0);
  const projectedPlan = useMemo(() => createSavingsPlan({
    goalAmount: selectedGoal,
    durationMonths,
    currentAmount: 0,
  }), [durationMonths, selectedGoal]);
  const chartData = useMemo(() => buildSavingsChartData(user?.topUps, user?.savings), [user?.topUps, user?.savings]);
  const primaryChallenge = user?.challenges?.[0];
  const nextPaymentDate = useMemo(() => {
    if (!savingsMetrics.startDate || !savingsMetrics.durationMonths) return '';
    const startDate = new Date(savingsMetrics.startDate);
    const monthsPaid = Math.min(Math.floor((Number(user?.topUps?.length) || 0)), savingsMetrics.durationMonths);
    const nextDate = new Date(startDate);
    nextDate.setMonth(nextDate.getMonth() + monthsPaid + 1);
    return nextDate.toISOString();
  }, [savingsMetrics.startDate, savingsMetrics.durationMonths, user?.topUps?.length]);

  const persistUser = async (updates) => {
    setSaving(true);
    try {
      const nextUser = await mergeAndPersistCurrentUser(updates);
      setUser(nextUser);
      return nextUser;
    } finally {
      setSaving(false);
    }
  };

  const appendNotification = (notifications = [], item) => [
    {
      id: `notification-${Date.now()}`,
      date: new Date().toISOString(),
      read: false,
      ...item,
    },
    ...notifications,
  ];

  const handleCreatePlan = async () => {
    if (!selectedGoal || selectedGoal < 1000) {
      message.warning('Укажите корректную сумму цели.');
      return;
    }

    try {
      const nextSavings = createSavingsPlan({
        goalAmount: selectedGoal,
        durationMonths,
        currentAmount: user?.savings?.currentAmount || 0,
      });

      await persistUser({
        savings: nextSavings,
        notifications: appendNotification(user?.notifications, {
          type: 'plan',
          title: 'План накопления создан',
          description: `Цель ${formatMoney(nextSavings.goalAmount)} на ${nextSavings.durationMonths} мес.`,
        }),
      });
      message.success('План накопления создан.');
    } catch (error) {
      message.error('Не удалось сохранить план.');
    }
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount || 0);

    if (!savingsMetrics.hasPlan) {
      message.warning('Сначала создайте цель накопления.');
      return;
    }

    if (!amount || amount <= 0) {
      message.warning('Введите сумму пополнения.');
      return;
    }

    try {
      const nextCurrentAmount = savingsMetrics.currentAmount + amount;
      const nextStatus = nextCurrentAmount >= savingsMetrics.goalAmount ? 'completed' : 'active';
      const nextTopUps = [
        {
          id: `topup-${Date.now()}`,
          date: new Date().toISOString(),
          amount,
          status: 'completed',
          source: 'manual',
        },
        ...(user?.topUps || []),
      ];

      const notifications = appendNotification(user?.notifications, nextCurrentAmount >= savingsMetrics.goalAmount
        ? {
            type: 'goal',
            title: 'Цель достигнута',
            description: 'Теперь вы можете выбрать любой тур и оплатить его накоплениями.',
          }
        : {
            type: 'topup',
            title: 'Баланс пополнен',
            description: `Добавлено ${formatMoney(amount)} к плану накопления.`,
          });

      await persistUser({
        savings: {
          ...user.savings,
          currentAmount: nextCurrentAmount,
          status: nextStatus,
        },
        topUps: nextTopUps,
        notifications,
      });

      setTopUpAmount(null);
      message.success(`Добавлено ${formatMoney(amount)}.`);
    } catch (error) {
      message.error('Не удалось пополнить баланс.');
    }
  };

  const handleBonusWheel = async () => {
    const availableAt = user?.bonusWheel?.availableAt ? new Date(user.bonusWheel.availableAt).getTime() : 0;

    if (availableAt && availableAt > Date.now()) {
      message.info('Колесо бонусов снова станет доступно в следующем месяце.');
      return;
    }

    const reward = BONUS_REWARDS[Math.floor(Math.random() * BONUS_REWARDS.length)];
    const nextHistory = [
      {
        id: `bonus-${Date.now()}`,
        ...reward,
        date: new Date().toISOString(),
      },
      ...(user?.bonusWheel?.history || []),
    ];

    const nextSavings = reward.rewardType === 'bonus_som'
      ? {
          ...user.savings,
          currentAmount: user.savings.currentAmount + reward.rewardValue,
        }
      : user.savings;

    await persistUser({
      savings: nextSavings,
      bonusWheel: {
        lastSpinDate: new Date().toISOString(),
        availableAt: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        history: nextHistory,
      },
      notifications: appendNotification(user?.notifications, {
        type: 'bonus',
        title: 'Бонус активирован',
        description: `Вы получили ${reward.label}.`,
      }),
    });

    message.success(`Колесо бонусов: ${reward.label}`);
  };

  const stepItems = [
    {
      title: 'Создать цель',
      description: savingsMetrics.hasPlan ? `${formatMoney(savingsMetrics.goalAmount)}` : 'Выберите сумму',
    },
    {
      title: 'Пополнять баланс',
      description: savingsMetrics.hasPlan ? `${formatMoney(savingsMetrics.monthlyPayment)} / мес.` : 'Автопланирование',
    },
    {
      title: 'Купить тур',
      description: savingsMetrics.isReadyToBuy ? 'Цель достигнута' : 'После завершения',
    },
  ];

  const topUpColumns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      render: formatDate,
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      render: formatMoney,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status) => <Tag color="success">{status}</Tag>,
    },
  ];

  if (!user && !loading) {
    return (
      <main style={styles.page}>
        <section style={styles.container} className="travelpay-dashboard-container">
          <Card style={styles.panel}>
            <Title level={3}>Войдите в аккаунт, чтобы управлять накоплениями</Title>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <Tag style={styles.heroTag}>TravelPay Savings</Tag>
          <Title style={styles.heroTitle}>Копите на путешествие как в финтех-продукте</Title>
          <Paragraph style={styles.heroText}>
            Сначала формируйте цель, затем пополняйте баланс, следите за прогрессом и только после этого выбирайте тур из каталога.
          </Paragraph>
        </div>
        <Card style={styles.heroMetricCard} bordered={false}>
          <Text style={styles.heroMetricLabel}>До цели осталось</Text>
          <Title level={2} style={styles.heroMetricValue}>{formatMoney(savingsMetrics.remainingAmount)}</Title>
          <Text style={styles.heroMetricSubtext}>
            {savingsMetrics.daysLeft} дней {savingsMetrics.hoursLeft} часов {savingsMetrics.minutesLeft} минут
          </Text>
          <Tag color={getSavingsStatusColor(savingsMetrics.status)} style={{ marginTop: 12 }}>
            {formatSavingsStatus(savingsMetrics.status)}
          </Tag>
        </Card>
      </section>

      <section style={styles.container} className="travelpay-dashboard-container">
        <Row gutter={[20, 20]}>
          <Col xs={24} xl={8}>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <Card title="Создание цели" style={styles.panel} loading={loading}>
                <Space orientation="vertical" size={16} style={{ width: '100%' }} className="travelpay-adaptive-form">
                  <div>
                    <Text strong>Сумма накопления</Text>
                    <Select
                      size="large"
                      style={{ width: '100%', marginTop: 8 }}
                      value={goalChoice}
                      onChange={setGoalChoice}
                      options={[
                        ...GOAL_OPTIONS.map((value) => ({ value, label: formatMoney(value) })),
                        { value: 'custom', label: 'Произвольная сумма' },
                      ]}
                    />
                  </div>

                  {goalChoice === 'custom' && (
                    <div>
                      <Text strong>Введите сумму</Text>
                      <InputNumber
                        size="large"
                        min={1000}
                        step={1000}
                        style={{ width: '100%', marginTop: 8 }}
                        value={customGoal}
                        onChange={setCustomGoal}
                      />
                    </div>
                  )}

                  <div>
                    <Text strong>Срок</Text>
                    <Select
                      size="large"
                      style={{ width: '100%', marginTop: 8 }}
                      value={durationMonths}
                      onChange={setDurationMonths}
                      options={DURATION_OPTIONS.map((value) => ({ value, label: `${value} месяцев` }))}
                    />
                  </div>

                  <Card size="small" style={styles.previewCard}>
                    <Space orientation="vertical" size={8}>
                      <Text>Ежемесячный платёж: <strong>{formatMoney(projectedPlan.monthlyPayment)}</strong></Text>
                      <Text>Дата окончания: <strong>{formatDate(projectedPlan.endDate)}</strong></Text>
                    </Space>
                  </Card>

                  <Button type="primary" size="large" icon={<RocketOutlined />} loading={saving} onClick={handleCreatePlan} style={styles.primaryButton}>
                    Создать цель накопления
                  </Button>
                </Space>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card title="Travel Streak и челлендж" style={styles.panel} loading={loading}>
                <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                  <Alert
                    showIcon
                    type="success"
                    title={`🔥 Вы пополняете баланс ${user?.travelStreakMonths || 0} месяца подряд`}
                  />
                  <Card size="small" style={styles.challengeCard}>
                    <Text strong>{primaryChallenge?.title}</Text>
                    <Progress percent={Math.min(Math.round(((primaryChallenge?.currentAmount || 0) / (primaryChallenge?.targetAmount || 1)) * 100), 100)} strokeColor={TURQUOISE} />
                    <Text>{formatMoney(primaryChallenge?.currentAmount || 0)} из {formatMoney(primaryChallenge?.targetAmount || 0)}</Text>
                    <Text>До дедлайна: {formatDate(primaryChallenge?.deadline)}</Text>
                  </Card>
                </Space>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card title="Колесо бонусов" style={styles.panel} loading={loading}>
                <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                  <Paragraph style={{ margin: 0 }}>
                    Раз в месяц пользователь получает случайный бонус: деньги на баланс или скидку на тур.
                  </Paragraph>
                  <Button icon={<GiftOutlined />} style={styles.goldButton} loading={saving} onClick={handleBonusWheel}>
                    Крутить колесо бонусов
                  </Button>
                  {(user?.bonusWheel?.history || []).slice(0, 3).map((entry) => (
                    <Tag key={entry.id} color="gold">{entry.label} · {formatDate(entry.date)}</Tag>
                  ))}
                </Space>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} xl={16}>
            <Space orientation="vertical" size={20} style={{ width: '100%' }}>
              <Card style={styles.panel} loading={loading}>
                <Row gutter={[18, 18]}>
                  <Col xs={24} sm={12} lg={8}><Statistic title="Цель" value={savingsMetrics.goalAmount} suffix="сом" prefix={<StarOutlined />} /></Col>
                  <Col xs={24} sm={12} lg={8}><Statistic title="Накоплено" value={savingsMetrics.currentAmount} suffix="сом" prefix={<WalletOutlined />} /></Col>
                  <Col xs={24} sm={12} lg={8}><Statistic title="Осталось" value={savingsMetrics.remainingAmount} suffix="сом" prefix={<PlusCircleOutlined />} /></Col>
                  <Col xs={24} sm={12} lg={8}><Statistic title="Ежемесячный платёж" value={savingsMetrics.monthlyPayment} suffix="сом" prefix={<CalendarOutlined />} /></Col>
                  <Col xs={24} sm={12} lg={8}><Statistic title="Дата окончания" value={formatDate(savingsMetrics.endDate)} prefix={<ClockCircleOutlined />} /></Col>
                  <Col xs={24} sm={12} lg={8}><Statistic title="Прогресс" value={savingsMetrics.progressPercent} suffix="%" prefix={<CheckCircleOutlined />} /></Col>
                </Row>

                <div style={{ marginTop: 22 }}>
                  <div style={styles.progressHeader}>
                    <Text strong>Прогресс накопления</Text>
                    <Text>{formatMoney(savingsMetrics.currentAmount)} / {formatMoney(savingsMetrics.goalAmount)}</Text>
                  </div>
                  <Progress percent={savingsMetrics.progressPercent} strokeColor={{ '0%': BRAND_BLUE, '100%': BRAND_GOLD }} size={[undefined, 18]} />
                </div>

                <div style={{ marginTop: 22 }}>
                  <Text strong>Таймер достижения цели</Text>
                  <div style={styles.timerRow}>
                    <Tag icon={<ClockCircleOutlined />} color="processing">{savingsMetrics.daysLeft} дней</Tag>
                    <Tag icon={<ClockCircleOutlined />} color="processing">{savingsMetrics.hoursLeft} часов</Tag>
                    <Tag icon={<ClockCircleOutlined />} color="processing">{savingsMetrics.minutesLeft} минут</Tag>
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <Steps current={savingsMetrics.isReadyToBuy ? 2 : savingsMetrics.hasPlan ? 1 : 0} items={stepItems} />
                </div>
              </Card>

              <Card style={styles.panel} title="Пополнить баланс" loading={loading}>
                <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                  <Alert
                    type="info"
                    showIcon
                    title={nextPaymentDate ? `Следующий рекомендуемый платёж до ${formatDate(nextPaymentDate)}` : 'Создайте план накопления, чтобы увидеть следующий платёж.'}
                  />
                  <div style={styles.topUpRow}>
                    <InputNumber
                      size="large"
                      min={100}
                      step={500}
                      style={{ flex: 1, minWidth: 0, width: '100%' }}
                      value={topUpAmount}
                      onChange={setTopUpAmount}
                      placeholder="Введите сумму пополнения"
                    />
                    <Button type="primary" size="large" icon={<WalletOutlined />} loading={saving} onClick={handleTopUp} style={styles.primaryButton}>
                      Пополнить баланс
                    </Button>
                  </div>
                  {savingsMetrics.progressPercent < 50 && savingsMetrics.hasPlan && (
                    <Alert
                      type="warning"
                      showIcon
                      title="Есть риск отставания от плана"
                      description={`Для достижения цели желательно вносить не менее ${formatMoney(savingsMetrics.monthlyPayment)} в месяц.`}
                    />
                  )}
                </Space>
              </Card>

              <Row gutter={[20, 20]}>
                <Col xs={24} lg={14}>
                  <Card title="График накоплений" style={styles.panel} loading={loading}>
                    <div style={{ width: '100%', height: 280 }}>
                      <ResponsiveContainer>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={BRAND_GOLD} stopOpacity={0.7} />
                              <stop offset="95%" stopColor={TURQUOISE} stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#dbe7f3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatMoney(value)} />
                          <Area type="monotone" dataKey="amount" stroke={BRAND_BLUE} fill="url(#savingsGradient)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} lg={10}>
                  <Card title="Уведомления по плану" style={styles.panel} loading={loading}>
                    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                      {(user?.notifications || []).slice(0, 5).map((item) => (
                        <Card key={item.id} size="small" style={styles.notificationCard}>
                          <Space orientation="vertical" size={4}>
                            <Text strong><NotificationOutlined /> {item.title}</Text>
                            <Text type="secondary">{item.description}</Text>
                            <Text type="secondary">{formatDate(item.date)}</Text>
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Card title="История пополнений" style={styles.panel} loading={loading}>
                <div className="travelpay-table-shell">
                  <Table
                    rowKey="id"
                    dataSource={user?.topUps || []}
                    columns={topUpColumns}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 520 }}
                  />
                </div>
              </Card>

              {savingsMetrics.isReadyToBuy && (
                <Card style={styles.successCard}>
                  <Space orientation="vertical" size={12}>
                    <Tag color="success" icon={<TrophyOutlined />}>Цель достигнута</Tag>
                    <Title level={3} style={{ color: BRAND_BLUE, margin: 0 }}>
                      Поздравляем! Вы накопили нужную сумму. Теперь можете выбрать любой тур.
                    </Title>
                    <Button href="/tours" type="primary" size="large" style={styles.primaryButton}>
                      Перейти к выбору тура
                    </Button>
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top left, rgba(20,184,166,0.14), transparent 26%), linear-gradient(180deg, #f7fbff 0%, #ecf4fb 100%)',
    paddingBottom: 64,
  },
  hero: {
    padding: '56px 24px',
    background: 'linear-gradient(135deg, #0f2241 0%, #17325c 70%, #fca311 100%)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  heroTag: {
    borderRadius: 999,
    border: 'none',
    background: '#fef3c7',
    color: BRAND_BLUE,
    fontWeight: 900,
  },
  heroTitle: {
    color: '#fff',
    margin: '12px 0',
    maxWidth: 760,
    fontSize: 'clamp(24px, 4vw, 40px)',
    lineHeight: 1.08,
    wordBreak: 'normal',
    whiteSpace: 'normal',
  },
  heroText: {
    color: '#dce8f7',
    maxWidth: 760,
    margin: 0,
    fontSize: 16,
    wordBreak: 'normal',
    whiteSpace: 'normal',
  },
  heroMetricCard: {
    minWidth: 290,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
  },
  heroMetricLabel: {
    color: '#dce8f7',
    fontWeight: 800,
  },
  heroMetricValue: {
    color: '#fff',
    margin: '10px 0 4px',
  },
  heroMetricSubtext: {
    color: '#e5edf9',
  },
  container: {
    width: '100%',
    maxWidth: 1400,
    margin: '0 auto',
    padding: '20px',
  },
  panel: {
    borderRadius: 24,
    border: '1px solid rgba(23,50,92,0.08)',
    boxShadow: '0 22px 55px rgba(23,50,92,0.08)',
  },
  previewCard: {
    borderRadius: 18,
    background: 'rgba(23,50,92,0.04)',
  },
  challengeCard: {
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(20,184,166,0.08), rgba(252,163,17,0.12))',
  },
  notificationCard: {
    borderRadius: 16,
    background: 'rgba(23,50,92,0.04)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  topUpRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  timerRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 12,
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
  successCard: {
    borderRadius: 24,
    border: '1px solid rgba(34,197,94,0.18)',
    background: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)',
    boxShadow: '0 22px 50px rgba(34,197,94,0.10)',
  },
};

export default SavingsPlanPage;
