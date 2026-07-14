import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, AuditOutlined, ReloadOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  formatDateTime,
  formatSom,
  paymentMethodMeta,
  paymentStatusMeta,
  transactionTypeMeta,
} from '../utils/payments';

const { Title, Paragraph, Text } = Typography;

const AdminFinancePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ summary: {}, paymentRequests: [], transactions: [], auditLogs: [] });
  const [filters, setFilters] = useState({ status: 'all', query: '' });

  const loadFinance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/finance/summary');
      setData(response.data || {});
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось загрузить финансы.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return (data.paymentRequests || []).filter((payment) => {
      const statusOk = filters.status === 'all' || payment.status === filters.status;
      const queryOk = !query || [
        payment.id,
        payment.userId,
        payment.businessId,
        payment.transactionNumber,
        payment.comment,
      ].some((value) => String(value || '').toLowerCase().includes(query));
      return statusOk && queryOk;
    });
  }, [data.paymentRequests, filters]);

  const paymentColumns = [
    { title: 'Дата', dataIndex: 'createdAt', render: formatDateTime, width: 170 },
    { title: 'ID', dataIndex: 'id', width: 170 },
    { title: 'User', dataIndex: 'userId', width: 100 },
    { title: 'Компания', dataIndex: 'businessId', width: 110 },
    {
      title: 'Метод',
      dataIndex: 'paymentMethod',
      render: (method) => <Tag color={paymentMethodMeta[method]?.color}>{paymentMethodMeta[method]?.label || method}</Tag>,
      width: 170,
    },
    { title: 'Сумма', dataIndex: 'amount', render: formatSom, width: 150 },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (status) => <Tag color={paymentStatusMeta[status]?.color}>{paymentStatusMeta[status]?.label || status}</Tag>,
      width: 160,
    },
    { title: 'Транзакция', dataIndex: 'transactionNumber', render: (value) => value || '—' },
  ];

  const transactionColumns = [
    { title: 'Дата', dataIndex: 'createdAt', render: formatDateTime, width: 170 },
    { title: 'User', dataIndex: 'userId', width: 100 },
    {
      title: 'Тип',
      dataIndex: 'type',
      render: (type) => <Tag color={transactionTypeMeta[type]?.color}>{transactionTypeMeta[type]?.label || type}</Tag>,
      width: 170,
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      render: (amount) => (
        <Text className={Number(amount) >= 0 ? 'tp-money-positive' : 'tp-money-negative'}>
          {Number(amount) >= 0 ? '+' : '−'} {formatSom(Math.abs(Number(amount) || 0))}
        </Text>
      ),
      width: 160,
    },
    { title: 'Описание', dataIndex: 'description' },
    { title: 'Баланс после', dataIndex: 'balanceAfter', render: formatSom, width: 160 },
    { title: 'Резерв после', dataIndex: 'reservedAfter', render: formatSom, width: 160 },
  ];

  const auditColumns = [
    { title: 'Дата', dataIndex: 'createdAt', render: formatDateTime, width: 170 },
    { title: 'Actor', dataIndex: 'actorUserId', width: 120 },
    { title: 'Роль', dataIndex: 'actorRole', width: 150 },
    { title: 'Действие', dataIndex: 'action', width: 220 },
    { title: 'Payment', dataIndex: 'paymentRequestId', width: 180 },
    { title: 'Комментарий', dataIndex: 'comment', render: (value) => value || '—' },
  ];

  return (
    <main className="tp-business-finance-page">
      <div className="tp-business-finance-shell tp-business-finance-shell--wide">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/home')} type="text">
          Назад в админ-панель
        </Button>

        <section className="tp-business-finance-hero">
          <span><AuditOutlined /> TravelPay Admin</span>
          <Title>Финансы TravelPay</Title>
          <Paragraph>
            Общий журнал платежей, пополнений, резервов, возвратов и действий по статусам.
          </Paragraph>
        </section>

        <Row gutter={[16, 16]} className="tp-finance-stats">
          <Col xs={24} md={6}>
            <Card><Statistic title="Доступно на кошельках" value={data.summary?.availableTotal || 0} suffix="сом" /></Card>
          </Col>
          <Col xs={24} md={6}>
            <Card><Statistic title="Зарезервировано" value={data.summary?.reservedTotal || 0} suffix="сом" /></Card>
          </Col>
          <Col xs={24} md={6}>
            <Card><Statistic title="Ожидает проверки" value={data.summary?.pendingTotal || 0} suffix="сом" /></Card>
          </Col>
          <Col xs={24} md={6}>
            <Card><Statistic title="Подтверждено" value={data.summary?.approvedTotal || 0} suffix="сом" /></Card>
          </Col>
        </Row>

        <Card
          className="tp-business-finance-card"
          extra={<Button icon={<ReloadOutlined />} onClick={loadFinance}>Обновить</Button>}
        >
          <div className="tp-finance-filter-bar">
            <Input
              allowClear
              placeholder="Поиск по ID, user, business, номеру транзакции"
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            />
            <Select
              value={filters.status}
              onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
              options={[
                { value: 'all', label: 'Все статусы' },
                { value: 'pending', label: 'Ожидает чека' },
                { value: 'under_review', label: 'На проверке' },
                { value: 'approved', label: 'Подтверждён' },
                { value: 'rejected', label: 'Отклонён' },
              ]}
              style={{ minWidth: 220 }}
            />
          </div>

          <Tabs
            items={[
              {
                key: 'payments',
                label: 'Платежи',
                children: (
                  <Table
                    columns={paymentColumns}
                    dataSource={filteredPayments}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                  />
                ),
              },
              {
                key: 'transactions',
                label: 'Операции кошельков',
                children: (
                  <Table
                    columns={transactionColumns}
                    dataSource={data.transactions || []}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                  />
                ),
              },
              {
                key: 'audit',
                label: 'Журнал действий',
                children: (
                  <Table
                    columns={auditColumns}
                    dataSource={data.auditLogs || []}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1100 }}
                  />
                ),
              },
            ]}
          />
        </Card>

        <Card className="tp-wallet-security-card">
          <WalletOutlined />
          <strong>Финансовая безопасность</strong>
          <p>
            Подтверждение платежа повторно запрещено на сервере. Баланс меняется только через финансовые операции,
            а каждая проверка записывается в audit log.
          </p>
        </Card>
      </div>
    </main>
  );
};

export default AdminFinancePage;
