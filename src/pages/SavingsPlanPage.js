import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  InputNumber,
  Progress,
  Row,
  Slider,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  FlagOutlined,
  PlusOutlined,
  RocketOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';
import { readCurrentUser } from '../utils/currentUser';
import {
  buildSavingsChartData,
  createSavingsPlan,
  getSavingsMetrics,
  getSavingsStatusColor,
} from '../utils/savings';
import { mergeAndPersistCurrentUser, normalizeUser, syncCurrentUser } from '../utils/user';

const { Title, Paragraph, Text } = Typography;

const GOAL_OPTIONS = [50000, 100000, 150000, 200000];
const QUICK_TOP_UPS = [1000, 5000, 10000, 20000];
const HERO_IMAGE = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');
const formatGoalStatus = (status) => ({
  active: 'Активно',
  completed: 'Завершено',
  expired: 'Просрочено',
  cancelled: 'Цель не создана',
}[status] || 'Цель не создана');

const getOperationStatus = (status) => {
  const meta = {
    completed: { label: 'Успешно', color: 'success' },
    pending: { label: 'В ожидании', color: 'processing' },
    error: { label: 'Ошибка', color: 'error' },
  };

  return meta[status] || meta.completed;
};

const getMonthsUntil = (date) => {
  if (!date) return 6;
  const now = dayjs();
  const target = dayjs(date);
  return Math.max(target.diff(now, 'month') || 1, 1);
};

const SavingsPlanPage = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goalAmount, setGoalAmount] = useState(GOAL_OPTIONS[1]);
  const [durationMonths, setDurationMonths] = useState(6);
  const [initialDeposit, setInitialDeposit] = useState(0);
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
  const projectedPlan = useMemo(() => createSavingsPlan({
    goalAmount,
    durationMonths,
    currentAmount: initialDeposit,
  }), [durationMonths, goalAmount, initialDeposit]);
  const chartData = useMemo(() => buildSavingsChartData(user?.topUps, user?.savings), [user?.topUps, user?.savings]);
  const quickProgress = savingsMetrics.hasPlan ? savingsMetrics.progressPercent : 0;
  const deadlineValue = dayjs().add(durationMonths, 'month');

  const nextPaymentDate = useMemo(() => {
    if (!savingsMetrics.startDate || !savingsMetrics.durationMonths) return '';
    const startDate = new Date(savingsMetrics.startDate);
    const monthsPaid = Math.min(Math.floor(Number(user?.topUps?.length) || 0), savingsMetrics.durationMonths);
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

  const handleGoalValuesChange = (_, values) => {
    const nextGoal = Number(values.goalAmount || goalAmount || 0);
    const nextDeposit = Number(values.initialDeposit || 0);
    const nextDuration = Number(values.durationMonths || durationMonths || 1);

    setGoalAmount(nextGoal);
    setInitialDeposit(nextDeposit);
    setDurationMonths(nextDuration);
    form.setFieldsValue({
      monthlyPayment: createSavingsPlan({
        goalAmount: nextGoal,
        durationMonths: nextDuration,
        currentAmount: nextDeposit,
      }).monthlyPayment,
      deadline: dayjs().add(nextDuration, 'month'),
    });
  };

  const handleDeadlineChange = (date) => {
    const nextDuration = getMonthsUntil(date);
    setDurationMonths(nextDuration);
    form.setFieldsValue({ durationMonths: nextDuration });
    handleGoalValuesChange(null, {
      ...form.getFieldsValue(),
      durationMonths: nextDuration,
    });
  };

  const handleCreatePlan = async (values) => {
    const targetAmount = Number(values.goalAmount || 0);
    const deposit = Number(values.initialDeposit || 0);
    const duration = Number(values.durationMonths || 0);

    if (!targetAmount || targetAmount < 1000) {
      message.warning('Укажите корректную сумму цели.');
      return;
    }

    if (!duration || duration < 1) {
      message.warning('Укажите срок накопления.');
      return;
    }

    try {
      const nextSavings = createSavingsPlan({
        goalAmount: targetAmount,
        durationMonths: duration,
        currentAmount: deposit,
      });
      const depositTopUp = deposit > 0 ? [{
        id: `topup-${Date.now()}`,
        date: new Date().toISOString(),
        amount: deposit,
        status: 'completed',
        source: 'initial_deposit',
      }] : [];

      await persistUser({
        savings: nextSavings,
        topUps: [...depositTopUp, ...(user?.topUps || [])],
        notifications: appendNotification(user?.notifications, {
          type: 'plan',
          title: 'План накопления создан',
          description: `Цель ${formatMoney(nextSavings.goalAmount)} на ${nextSavings.durationMonths} мес.`,
        }),
      });
      message.success('Цель накопления создана.');
    } catch (error) {
      message.error('Не удалось сохранить план.');
    }
  };

  const handleTopUp = async (amountValue = topUpAmount) => {
    const amount = Number(amountValue || 0);

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
            description: 'Теперь вы можете выбрать тур и оплатить его накоплениями.',
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

  const topUpColumns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      render: formatDate,
      width: 150,
    },
    {
      title: 'Тип операции',
      dataIndex: 'source',
      render: (source) => (source === 'initial_deposit' ? 'Первоначальный взнос' : 'Пополнение'),
      width: 190,
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      render: (amount) => <Text className="savings-fintech-amount">+ {formatMoney(amount)}</Text>,
      width: 150,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status) => {
        const meta = getOperationStatus(status);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
      width: 140,
    },
  ];

  if (!user && !loading) {
    return (
      <main className="savings-fintech-page">
        <section className="savings-fintech-container">
          <Card className="savings-fintech-card">
            <Title level={3}>Войдите в аккаунт, чтобы управлять накоплениями</Title>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="savings-fintech-page">
      <section className="savings-fintech-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(6,17,31,0.88), rgba(6,17,31,0.58)), url(${HERO_IMAGE})` }}>
        <div className="savings-fintech-hero__content">
          <Tag className="savings-fintech-eyebrow">TravelPay Savings</Tag>
          <Title className="savings-fintech-hero__title">Накопите на путешествие</Title>
          <Paragraph className="savings-fintech-hero__text">
            Создайте цель, пополняйте баланс и выбирайте тур после достижения суммы.
          </Paragraph>
        </div>

        <Card className="savings-fintech-goal-card" loading={loading}>
          <div className="savings-fintech-goal-card__top">
            <div>
              <Text className="savings-fintech-muted">До цели осталось</Text>
              <Title level={2}>{formatMoney(savingsMetrics.remainingAmount)}</Title>
            </div>
            <Progress
              type="circle"
              percent={quickProgress}
              size={92}
              strokeColor="#f59e0b"
              trailColor="rgba(255,255,255,0.10)"
              format={(percent) => `${percent}%`}
            />
          </div>
          <div className="savings-fintech-timer">
            <Tag icon={<ClockCircleOutlined />}>{savingsMetrics.daysLeft} дней</Tag>
            <Tag>{savingsMetrics.hoursLeft} часов</Tag>
            <Tag>{savingsMetrics.minutesLeft} минут</Tag>
          </div>
          <Tag color={getSavingsStatusColor(savingsMetrics.status)} className="savings-fintech-status">
            {formatGoalStatus(savingsMetrics.status)}
          </Tag>
        </Card>
      </section>

      <section className="savings-fintech-container">
        <Row gutter={[18, 18]}>
          <Col xs={24} xl={9}>
            <Card title="Создание цели" className="savings-fintech-card" loading={loading}>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  goalAmount,
                  durationMonths,
                  initialDeposit,
                  monthlyPayment: projectedPlan.monthlyPayment,
                  deadline: deadlineValue,
                }}
                onValuesChange={handleGoalValuesChange}
                onFinish={handleCreatePlan}
                className="savings-fintech-form"
              >
                <Form.Item name="goalAmount" label="Сумма накопления" rules={[{ required: true, message: 'Укажите сумму цели' }]}>
                  <InputNumber
                    min={1000}
                    step={1000}
                    size="large"
                    style={{ width: '100%' }}
                    placeholder="Введите сумму, которую хотите накопить"
                  />
                </Form.Item>

                <div className="savings-fintech-preset-grid">
                  {GOAL_OPTIONS.map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => {
                        form.setFieldsValue({ goalAmount: amount });
                        handleGoalValuesChange(null, { ...form.getFieldsValue(), goalAmount: amount });
                      }}
                    >
                      {formatMoney(amount)}
                    </Button>
                  ))}
                </div>

                <Form.Item name="durationMonths" label="Срок">
                  <Slider min={1} max={24} marks={{ 1: '1', 6: '6', 12: '12', 24: '24 мес.' }} />
                </Form.Item>

                <Form.Item name="deadline" label="Дата окончания">
                  <DatePicker size="large" style={{ width: '100%' }} onChange={handleDeadlineChange} format="DD.MM.YYYY" />
                </Form.Item>

                <Form.Item name="initialDeposit" label="Первоначальный взнос">
                  <InputNumber min={0} step={1000} size="large" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="monthlyPayment" label="Ежемесячный платёж">
                  <InputNumber min={0} size="large" style={{ width: '100%' }} readOnly />
                </Form.Item>

                <Button type="primary" htmlType="submit" size="large" icon={<RocketOutlined />} loading={saving} block>
                  Создать цель
                </Button>
              </Form>
            </Card>

            <Card title="Пополнить баланс" className="savings-fintech-card savings-fintech-topup-card" loading={loading}>
              <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                <InputNumber
                  size="large"
                  min={100}
                  step={500}
                  value={topUpAmount}
                  onChange={setTopUpAmount}
                  placeholder="Введите сумму"
                  style={{ width: '100%' }}
                />
                <div className="savings-fintech-quick-grid">
                  {QUICK_TOP_UPS.map((amount) => (
                    <Button key={amount} icon={<PlusOutlined />} onClick={() => setTopUpAmount(amount)}>
                      +{amount.toLocaleString('ru-RU')}
                    </Button>
                  ))}
                </div>
                <Button type="primary" size="large" icon={<CreditCardOutlined />} loading={saving} onClick={() => handleTopUp()} block>
                  Пополнить
                </Button>
                {nextPaymentDate && (
                  <Text className="savings-fintech-muted">Рекомендуемый платёж до {formatDate(nextPaymentDate)}</Text>
                )}
              </Space>
            </Card>
          </Col>

          <Col xs={24} xl={15}>
            <Space orientation="vertical" size={18} style={{ width: '100%' }}>
              <Card title="Моя цель" className="savings-fintech-card" loading={loading}>
                {savingsMetrics.hasPlan ? (
                  <>
                    <Row gutter={[16, 16]} className="savings-fintech-stat-grid">
                      <Col xs={24} sm={12} lg={8}>
                        <Statistic title="Цель" value={savingsMetrics.goalAmount} formatter={formatMoney} prefix={<FlagOutlined />} />
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Statistic title="Накоплено" value={savingsMetrics.currentAmount} formatter={formatMoney} prefix={<WalletOutlined />} />
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Statistic title="Осталось" value={savingsMetrics.remainingAmount} formatter={formatMoney} prefix={<PlusOutlined />} />
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Statistic title="Ежемесячный платёж" value={savingsMetrics.monthlyPayment} formatter={formatMoney} prefix={<CalendarOutlined />} />
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Statistic title="Дата окончания" value={formatDate(savingsMetrics.endDate)} prefix={<ClockCircleOutlined />} />
                      </Col>
                      <Col xs={24} sm={12} lg={8}>
                        <Statistic title="Прогресс" value={savingsMetrics.progressPercent} suffix="%" prefix={<CheckCircleOutlined />} />
                      </Col>
                    </Row>

                    <div className="savings-fintech-progress-block">
                      <div>
                        <Text strong>Прогресс накопления</Text>
                        <Text className="savings-fintech-muted">{formatMoney(savingsMetrics.currentAmount)} / {formatMoney(savingsMetrics.goalAmount)}</Text>
                      </div>
                      <Progress
                        percent={savingsMetrics.progressPercent}
                        strokeColor={{ '0%': '#2563eb', '100%': '#f59e0b' }}
                        trailColor="rgba(255,255,255,0.10)"
                        size={[undefined, 16]}
                      />
                    </div>
                  </>
                ) : (
                  <Empty
                    description={<span className="savings-fintech-muted">Цель пока не создана</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" onClick={() => form.scrollToField('goalAmount')}>
                      Создать первую цель
                    </Button>
                  </Empty>
                )}
              </Card>

              <Row gutter={[18, 18]}>
                <Col xs={24} lg={14}>
                  <Card title="Динамика накоплений" className="savings-fintech-card" loading={loading}>
                    <div className="savings-fintech-chart">
                      <ResponsiveContainer>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="savingsFintechGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.55} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.04} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis dataKey="month" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip formatter={(value) => formatMoney(value)} />
                          <Area type="monotone" dataKey="amount" stroke="#f59e0b" fill="url(#savingsFintechGradient)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} lg={10}>
                  <Card title="Контроль цели" className="savings-fintech-card" loading={loading}>
                    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                      <Alert
                        type={savingsMetrics.hasPlan ? 'info' : 'warning'}
                        showIcon
                        title={savingsMetrics.hasPlan ? 'План активен' : 'Нужно создать цель'}
                        description={savingsMetrics.hasPlan
                          ? `Для достижения цели вносите около ${formatMoney(savingsMetrics.monthlyPayment)} в месяц.`
                          : 'После создания цели здесь появятся рекомендации по графику платежей.'}
                      />
                      {savingsMetrics.isReadyToBuy && (
                        <Button href="/tours" type="primary" size="large" block>
                          Выбрать тур
                        </Button>
                      )}
                    </Space>
                  </Card>
                </Col>
              </Row>

              <Card title="История операций" className="savings-fintech-card" loading={loading}>
                <div className="travelpay-table-shell savings-fintech-table">
                  <Table
                    rowKey="id"
                    dataSource={user?.topUps || []}
                    columns={topUpColumns}
                    pagination={{ pageSize: 6, showSizeChanger: false }}
                    scroll={{ x: 640 }}
                  />
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </section>
    </main>
  );
};

export default SavingsPlanPage;
