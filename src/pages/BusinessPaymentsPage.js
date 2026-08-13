import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Descriptions, Form, Image, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tabs, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { formatDateTime, formatSom, paymentMethodMeta, paymentStatusMeta } from '../utils/payments';

const { Title, Paragraph, Text } = Typography;

const statusTabs = [
  { key: 'all', label: 'Все операции' },
  { key: 'under_review', label: 'Ожидают проверки' },
  { key: 'approved', label: 'Подтверждённые' },
  { key: 'rejected', label: 'Отклонённые' },
];

const cashboxMethodMeta = {
  qr: { label: 'QR', color: 'blue' },
  cash: { label: 'Наличные', color: 'green' },
  card: { label: 'Карта', color: 'purple' },
  transfer: { label: 'Перевод', color: 'cyan' },
  wallet: { label: 'TravelPay balance', color: 'gold' },
  savings: { label: 'TravelPay balance', color: 'gold' },
  manager: { label: 'Manager payment', color: 'volcano' },
  manual: { label: 'Manager payment', color: 'volcano' },
  receipt: { label: 'QR / receipt', color: 'blue' },
  mixed: { label: 'Смешанная', color: 'magenta' },
  refund: { label: 'Refund', color: 'red' },
};

const normalizeCashMethod = (value, breakdown = []) => {
  if (Array.isArray(breakdown) && breakdown.length > 1) return 'mixed';
  const method = String(value || '').toLowerCase();
  if (['qr', 'cash', 'card', 'transfer', 'wallet', 'savings', 'manager', 'manual', 'receipt'].includes(method)) return method;
  return 'qr';
};

const BusinessPaymentsPage = ({ embedded = false }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stayBookings, setStayBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('under_review');
  const [reviewing, setReviewing] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [refundModal, setRefundModal] = useState(null);
  const [refundForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const [paymentsResponse, stayResponse, tourResponse] = await Promise.all([
        api.get('/payment-requests').catch(() => ({ data: [] })),
        api.get('/stay-bookings').catch(() => ({ data: [] })),
        api.get('/tour-bookings').catch(() => ({ data: [] })),
      ]);
      setPayments(paymentsResponse.data || []);
      setStayBookings(stayResponse.data || []);
      setTourBookings(tourResponse.data || []);
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось загрузить платежи.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    if (activeTab === 'all') return payments;
    return payments.filter((payment) => payment.status === activeTab);
  }, [activeTab, payments]);

  const cashTransactions = useMemo(() => {
    const bookingRows = [...tourBookings.map((item) => ({ ...item, bookingKind: 'Tour' })), ...stayBookings.map((item) => ({ ...item, bookingKind: 'Stay' }))];
    const bookingTransactions = bookingRows
      .map((booking) => {
        const paidAmount = booking.paymentStatusCode === 'PAID'
          ? Number(booking.amount || 0)
          : Number(booking.prepaymentAmount || booking.walletReservedAmount || booking.amount || 0);
        const amount = Math.max(paidAmount, 0);
        const refundedAmount = Number(booking.refundedAmount || 0);
        const method = normalizeCashMethod(booking.paymentMethod, booking.paymentBreakdown);
        return {
          key: `booking-${booking.bookingKind}-${booking.id}`,
          date: booking.paymentReviewedAt || booking.fundsReservedAt || booking.updatedAt || booking.createdAt || booking.travelDate || booking.checkInDate,
          booking: `#${booking.id} · ${booking.tourTitle || booking.stayTitle || booking.title || booking.bookingKind}`,
          client: booking.clientName || `User #${booking.userId || '—'}`,
          company: booking.companyName || 'TravelPay',
          type: 'Booking payment',
          method,
          amount,
          status: booking.paymentStatusCode || booking.paymentStatus || booking.status || 'pending',
          manager: booking.assignedTo || booking.createdByAdminName || '—',
          bookingType: booking.bookingKind === 'Tour' ? 'tour_booking' : 'stay_booking',
          bookingId: booking.id,
          refundableAmount: Math.max(amount - refundedAmount, 0),
        };
      })
      .filter((item) => Number(item.amount || 0) !== 0);
    const refundTransactions = bookingRows.flatMap((booking) => {
      const refunds = Array.isArray(booking.refunds) ? booking.refunds : [];
      if (refunds.length) {
        return refunds.map((refund) => ({
          key: `refund-${booking.bookingKind}-${booking.id}-${refund.id}`,
          date: refund.processedAt || refund.createdAt || booking.updatedAt || booking.createdAt,
          booking: `#${booking.id} · ${booking.tourTitle || booking.stayTitle || booking.title || booking.bookingKind}`,
          client: booking.clientName || `User #${booking.userId || '—'}`,
          company: booking.companyName || 'TravelPay',
          type: 'Refund',
          method: 'refund',
          amount: -Math.abs(Number(refund.amount || 0)),
          status: refund.status || booking.paymentStatusCode || 'REFUNDED',
          manager: refund.processedByName || booking.assignedTo || booking.createdByAdminName || '—',
          reason: refund.reason,
          comment: refund.comment,
        }));
      }

      const refundedAmount = Number(booking.refundedAmount || 0);
      if (refundedAmount <= 0) return [];
      return [{
        key: `refund-${booking.bookingKind}-${booking.id}-legacy`,
        date: booking.updatedAt || booking.paymentReviewedAt || booking.createdAt,
        booking: `#${booking.id} · ${booking.tourTitle || booking.stayTitle || booking.title || booking.bookingKind}`,
        client: booking.clientName || `User #${booking.userId || '—'}`,
        company: booking.companyName || 'TravelPay',
        type: 'Refund',
        method: 'refund',
        amount: -refundedAmount,
        status: booking.paymentStatusCode || 'REFUNDED',
        manager: booking.assignedTo || booking.createdByAdminName || '—',
      }];
    }).filter((item) => Number(item.amount || 0) !== 0);
    const paymentRequestTransactions = payments.map((payment) => {
      const method = normalizeCashMethod(payment.paymentMethod);
      return {
        key: `payment-request-${payment.id}`,
        date: payment.reviewedAt || payment.updatedAt || payment.createdAt,
        booking: payment.bookingId ? `Booking #${payment.bookingId}` : 'Wallet top-up',
        client: payment.clientName || `User #${payment.userId || '—'}`,
        company: payment.companyName || 'TravelPay',
        type: 'Top-up request',
        method,
        amount: Number(payment.amount || 0),
        status: payment.status,
        manager: payment.reviewedByName || payment.managerName || '—',
      };
    });
    return [...bookingTransactions, ...refundTransactions, ...paymentRequestTransactions]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, stayBookings, tourBookings]);

  const todayCashStats = useMemo(() => {
    const todayRows = cashTransactions.filter((item) => {
      const date = new Date(item.date);
      const now = new Date();
      return date.getFullYear() === now.getFullYear()
        && date.getMonth() === now.getMonth()
        && date.getDate() === now.getDate();
    });
    const sumBy = (predicate) => todayRows.filter(predicate).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      total: sumBy(() => true),
      cash: sumBy((item) => item.method === 'cash'),
      qr: sumBy((item) => ['qr', 'receipt'].includes(item.method)),
      card: sumBy((item) => item.method === 'card'),
      wallet: sumBy((item) => ['wallet', 'savings'].includes(item.method)),
      refund: sumBy((item) => Number(item.amount || 0) < 0),
    };
  }, [cashTransactions]);

  const reviewPayment = async (status) => {
    if (!reviewing) return;
    if (status === 'reject' && !reviewComment.trim()) {
      message.warning('Укажите причину отклонения.');
      return;
    }

    setActionLoading(true);
    try {
      await api.put(`/payment-requests/${reviewing.id}/${status === 'approve' ? 'approve' : 'reject'}`, {
        adminComment: reviewComment,
      });
      message.success(status === 'approve' ? 'Платёж подтверждён.' : 'Платёж отклонён.');
      setReviewing(null);
      setReviewComment('');
      loadPayments();
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось обработать платёж.');
    } finally {
      setActionLoading(false);
    }
  };

  const openRefundModal = (record) => {
    setRefundModal(record);
    refundForm.setFieldsValue({
      amount: Math.max(Number(record.refundableAmount || 0), 0),
      reason: 'client_cancelled',
      comment: '',
    });
  };

  const submitRefund = async () => {
    if (!refundModal) return;
    try {
      const values = await refundForm.validateFields();
      setActionLoading(true);
      await api.post('/booking-refunds', {
        bookingType: refundModal.bookingType,
        bookingId: refundModal.bookingId,
        amount: values.amount,
        reason: values.reason,
        comment: values.comment,
      });
      message.success('Refund оформлен. Исходный платёж сохранён в истории.');
      setRefundModal(null);
      refundForm.resetFields();
      loadPayments();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(error.response?.data?.message || 'Не удалось оформить refund.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      render: formatDateTime,
      width: 170,
    },
    {
      title: 'Клиент',
      dataIndex: 'userId',
      render: (value) => `User #${value}`,
      width: 130,
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
      title: 'Действия',
      render: (_, record) => (
        <Button onClick={() => setReviewing(record)}>
          Открыть
        </Button>
      ),
      width: 120,
    },
  ];

  const cashColumns = [
    { title: 'Дата', dataIndex: 'date', render: formatDateTime, width: 170 },
    { title: 'Booking', dataIndex: 'booking', width: 220 },
    { title: 'Клиент', dataIndex: 'client', width: 180 },
    { title: 'Компания', dataIndex: 'company', width: 180 },
    { title: 'Тип', dataIndex: 'type', width: 150 },
    {
      title: 'Метод',
      dataIndex: 'method',
      width: 160,
      render: (method) => {
        const meta = cashboxMethodMeta[method] || cashboxMethodMeta.qr;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    { title: 'Сумма', dataIndex: 'amount', render: (amount) => <Text strong>{formatSom(amount)}</Text>, width: 150 },
    { title: 'Status', dataIndex: 'status', width: 150, render: (status) => <Tag>{status}</Tag> },
    { title: 'Manager', dataIndex: 'manager', width: 170 },
    {
      title: 'Refund',
      width: 130,
      fixed: 'right',
      render: (_, record) => record.bookingType && Number(record.refundableAmount || 0) > 0 ? (
        <Button size="small" danger onClick={() => openRefundModal(record)}>
          Refund
        </Button>
      ) : <Text type="secondary">—</Text>,
    },
  ];

  return (
    <main className={`tp-business-finance-page${embedded ? ' tp-business-finance-page--embedded' : ''}`}>
      <div className="tp-business-finance-shell">
        {!embedded && (
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/business/dashboard')} type="text">
            Назад в бизнес-панель
          </Button>
        )}

        <section className="tp-business-finance-hero">
          <span>TravelPay Business Finance</span>
          <Title>Платежи клиентов</Title>
          <Paragraph>
            Проверяйте чеки, подтверждайте пополнение накопительного баланса и не подтверждайте один платёж дважды.
          </Paragraph>
        </section>

        <Card
          className="tp-business-finance-card"
          extra={<Button icon={<ReloadOutlined />} onClick={loadPayments}>Обновить</Button>}
        >
          <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
            <Col xs={12} md={8} xl={4}><Card size="small"><Statistic title="Сегодня всего" value={todayCashStats.total} formatter={formatSom} /></Card></Col>
            <Col xs={12} md={8} xl={4}><Card size="small"><Statistic title="Наличные" value={todayCashStats.cash} formatter={formatSom} /></Card></Col>
            <Col xs={12} md={8} xl={4}><Card size="small"><Statistic title="QR" value={todayCashStats.qr} formatter={formatSom} /></Card></Col>
            <Col xs={12} md={8} xl={4}><Card size="small"><Statistic title="Карта" value={todayCashStats.card} formatter={formatSom} /></Card></Col>
            <Col xs={12} md={8} xl={4}><Card size="small"><Statistic title="Баланс TravelPay" value={todayCashStats.wallet} formatter={formatSom} /></Card></Col>
            <Col xs={12} md={8} xl={4}><Card size="small"><Statistic title="Refund" value={todayCashStats.refund} formatter={formatSom} /></Card></Col>
          </Row>
          <Title level={4}>Cashbox transactions</Title>
          <Table
            sticky
            size="middle"
            columns={cashColumns}
            dataSource={cashTransactions}
            loading={loading}
            pagination={{ pageSize: 8 }}
            rowKey="key"
            scroll={{ x: 1420 }}
            style={{ marginBottom: 22 }}
          />
          <Title level={4}>Payment requests</Title>
          <Tabs activeKey={activeTab} items={statusTabs} onChange={setActiveTab} />
          <Table
            sticky
            size="middle"
            columns={columns}
            dataSource={filteredPayments}
            loading={loading}
            rowKey="id"
            scroll={{ x: 920 }}
          />
        </Card>
      </div>

      <Modal
        centered
        footer={null}
        onCancel={() => setReviewing(null)}
        open={Boolean(reviewing)}
        title="Проверка платежа"
        width={860}
      >
        {reviewing ? (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Сумма">{formatSom(reviewing.amount)}</Descriptions.Item>
              <Descriptions.Item label="Способ">{paymentMethodMeta[reviewing.paymentMethod]?.label || reviewing.paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Номер транзакции">{reviewing.transactionNumber || '—'}</Descriptions.Item>
              <Descriptions.Item label="Комментарий клиента">{reviewing.comment || '—'}</Descriptions.Item>
              <Descriptions.Item label="Реквизиты snapshot">
                {[
                  reviewing.paymentDetailsSnapshot?.bankName,
                  reviewing.paymentDetailsSnapshot?.recipientName,
                  reviewing.paymentDetailsSnapshot?.phoneNumber,
                  reviewing.paymentDetailsSnapshot?.managerName,
                  reviewing.paymentDetailsSnapshot?.managerPhone,
                ].filter(Boolean).join(' · ') || '—'}
              </Descriptions.Item>
            </Descriptions>

            {reviewing.receiptUrl ? (
              reviewing.receiptType === 'application/pdf' ? (
                <Button href={reviewing.receiptUrl} target="_blank">
                  Открыть PDF чек
                </Button>
              ) : (
                <Image className="tp-payment-receipt-preview" src={reviewing.receiptUrl} alt="Чек платежа" />
              )
            ) : (
              <Tag color="orange">Чек не загружен</Tag>
            )}

            {['pending', 'under_review'].includes(reviewing.status) ? (
              <>
                <Input.TextArea
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Комментарий для клиента или причина отклонения"
                  rows={3}
                  value={reviewComment}
                />
                <Space wrap>
                  <Button
                    icon={<CheckCircleOutlined />}
                    loading={actionLoading}
                    onClick={() => reviewPayment('approve')}
                    type="primary"
                  >
                    Подтвердить платёж
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    loading={actionLoading}
                    onClick={() => reviewPayment('reject')}
                  >
                    Отклонить
                  </Button>
                </Space>
              </>
            ) : (
              <Tag color={paymentStatusMeta[reviewing.status]?.color}>{paymentStatusMeta[reviewing.status]?.label}</Tag>
            )}
          </Space>
        ) : null}
      </Modal>

      <Modal
        centered
        confirmLoading={actionLoading}
        okText="Оформить refund"
        onCancel={() => setRefundModal(null)}
        onOk={submitRefund}
        open={Boolean(refundModal)}
        title="Controlled refund"
        width={620}
      >
        {refundModal ? (
          <Space orientation="vertical" size={14} style={{ width: '100%' }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Booking">{refundModal.booking}</Descriptions.Item>
              <Descriptions.Item label="Клиент">{refundModal.client}</Descriptions.Item>
              <Descriptions.Item label="Доступно к возврату">{formatSom(refundModal.refundableAmount)}</Descriptions.Item>
            </Descriptions>
            <Form form={refundForm} layout="vertical">
              <Form.Item
                label="Сумма"
                name="amount"
                rules={[
                  { required: true, message: 'Укажите сумму' },
                  {
                    validator: (_, value) => {
                      const numberValue = Number(value || 0);
                      if (numberValue <= 0) return Promise.reject(new Error('Сумма должна быть больше нуля'));
                      if (numberValue > Number(refundModal.refundableAmount || 0)) return Promise.reject(new Error('Сумма больше доступной к возврату'));
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber min={1} max={Number(refundModal.refundableAmount || 0)} style={{ width: '100%' }} addonAfter="KGS" />
              </Form.Item>
              <Form.Item label="Причина" name="reason" rules={[{ required: true, message: 'Укажите причину' }]}>
                <Select
                  options={[
                    { value: 'client_cancelled', label: 'Клиент отменил' },
                    { value: 'overpayment', label: 'Переплата' },
                    { value: 'service_cancelled', label: 'Услуга отменена' },
                    { value: 'manager_adjustment', label: 'Manager adjustment' },
                    { value: 'other', label: 'Другая причина' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Комментарий" name="comment">
                <Input.TextArea rows={3} placeholder="Кому, за что и почему возвращаем" />
              </Form.Item>
            </Form>
            <Text type="secondary">
              Возврат создаст отдельную транзакцию, а исходный платёж останется в Cashbox history.
            </Text>
          </Space>
        ) : null}
      </Modal>
    </main>
  );
};

export default BusinessPaymentsPage;
