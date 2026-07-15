import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Row, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import PaymentTopUpModal from '../components/payments/PaymentTopUpModal';
import WalletBalanceCard from '../components/payments/WalletBalanceCard';
import WalletTransactionsTable from '../components/payments/WalletTransactionsTable';
import { readCurrentUser } from '../utils/currentUser';
import { formatDateTime, formatSom, paymentMethodMeta, paymentStatusMeta } from '../utils/payments';
import { syncCurrentUser } from '../utils/user';

const { Title, Paragraph, Text } = Typography;

const AccountSavingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const historyRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [topUpOpen, setTopUpOpen] = useState(Boolean(location.state?.openTopUp));

  const requestedTopUpAmount = Number(location.state?.amount || location.state?.shortage || 0);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallet/me');
      setWallet(response.data.wallet);
      setTransactions(response.data.transactions || []);
      setPaymentRequests(response.data.paymentRequests || []);
      if (response.data.user) {
        syncCurrentUser({ ...response.data.user, isLoggedIn: true });
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось загрузить накопления.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = readCurrentUser();
    if (!user?.id) {
      navigate('/login');
      return;
    }

    loadWallet();
  }, [navigate]);

  const paymentColumns = [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      render: formatDateTime,
      width: 170,
    },
    {
      title: 'Способ',
      dataIndex: 'paymentMethod',
      render: (method) => {
        const meta = paymentMethodMeta[method] || paymentMethodMeta.qr;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
      width: 180,
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      render: (amount) => <Text strong>{formatSom(amount)}</Text>,
      width: 150,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status) => {
        const meta = paymentStatusMeta[status] || paymentStatusMeta.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
      width: 160,
    },
    {
      title: 'Комментарий',
      dataIndex: 'adminComment',
      render: (value, record) => value || record.comment || '—',
    },
  ];

  return (
    <main className="tp-wallet-page">
      <div className="tp-wallet-shell">
        <Button
          className="tp-wallet-back"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/profile')}
          type="text"
        >
          Назад в профиль
        </Button>

        <section className="tp-wallet-page__hero">
          <span className="tp-wallet-kicker"><SafetyOutlined /> Внутренний баланс TravelPay</span>
          <Title>Мои накопления</Title>
          <Paragraph>
            Все покупки туров и домиков проходят через накопительный баланс. Сначала пополните баланс по QR или через
            менеджера, затем TravelPay безопасно резервирует средства при бронировании.
          </Paragraph>
        </section>

        {requestedTopUpAmount > 0 ? (
          <Alert
            showIcon
            type="warning"
            message="Для бронирования нужно пополнить баланс"
            description={`Необходимая сумма: ${formatSom(requestedTopUpAmount)}. После проверки платежа вернитесь к оплате тура или домика.`}
            action={(
              <Button icon={<PlusOutlined />} onClick={() => setTopUpOpen(true)} type="primary">
                Пополнить
              </Button>
            )}
            style={{ marginBottom: 18 }}
          />
        ) : null}

        <WalletBalanceCard
          loading={loading}
          onHistoryClick={() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onTopUpClick={() => setTopUpOpen(true)}
          wallet={wallet}
        />

        <Row gutter={[18, 18]} className="tp-wallet-flow-row">
          <Col xs={24} lg={8}>
            <Card className="tp-wallet-info-card">
              <ClockCircleOutlined />
              <h3>1. Пополнение</h3>
              <p>Вы переводите деньги по QR или через менеджера и отправляете чек на проверку.</p>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="tp-wallet-info-card">
              <SafetyOutlined />
              <h3>2. Резервирование</h3>
              <p>При покупке TravelPay резервирует сумму на балансе, а не переводит её компании сразу.</p>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card className="tp-wallet-info-card">
              <PlusOutlined />
              <h3>3. Завершение</h3>
              <p>После подтверждения поездки средства списываются, либо возвращаются при допустимой отмене.</p>
            </Card>
          </Col>
        </Row>

        <Card className="tp-wallet-tabs-card" ref={historyRef}>
          <Tabs
            items={[
              {
                key: 'transactions',
                label: 'История операций',
                children: <WalletTransactionsTable loading={loading} transactions={transactions} />,
              },
              {
                key: 'payments',
                label: 'Платежи на проверке',
                children: (
                  <Table
                    className="tp-finance-table"
                    columns={paymentColumns}
                    dataSource={paymentRequests}
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    rowKey="id"
                    scroll={{ x: 760 }}
                  />
                ),
              },
            ]}
          />
        </Card>

        <Card className="tp-wallet-security-card">
          <Space orientation="vertical" size={8}>
            <Title level={4}>Безопасность баланса</Title>
            <Text>Пользователь не может вручную изменить баланс.</Text>
            <Text>Баланс пополняется только после подтверждения менеджером или бизнес-аккаунтом.</Text>
            <Text>Все суммы пересчитываются на backend, а каждая операция попадает в журнал.</Text>
          </Space>
        </Card>
      </div>

      <PaymentTopUpModal
        amount={requestedTopUpAmount}
        onCancel={() => setTopUpOpen(false)}
        onCreated={loadWallet}
        open={topUpOpen}
        requiredAmount={requestedTopUpAmount}
      />
    </main>
  );
};

export default AccountSavingsPage;
