import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Image, Input, Modal, Space, Table, Tabs, Tag, Typography, message } from 'antd';
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

const BusinessPaymentsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('under_review');
  const [reviewing, setReviewing] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payment-requests');
      setPayments(response.data || []);
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

  return (
    <main className="tp-business-finance-page">
      <div className="tp-business-finance-shell">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/business/dashboard')} type="text">
          Назад в бизнес-панель
        </Button>

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
          <Tabs activeKey={activeTab} items={statusTabs} onChange={setActiveTab} />
          <Table
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
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
    </main>
  );
};

export default BusinessPaymentsPage;
