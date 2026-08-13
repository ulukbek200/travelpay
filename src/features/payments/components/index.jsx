import React from 'react';
import { Card, Form, Input, InputNumber, Modal, Progress, Select, Space, Statistic, Tag, Typography } from 'antd';
import { DataTable, DateTime, EntityDrawer, Money, PageHeader, PaymentBadge } from '../../../components/business/shared';

const { Text, Paragraph } = Typography;

const paymentMethodOptions = [
  { value: 'qr', label: 'QR' },
  { value: 'cash', label: 'Наличные' },
  { value: 'card', label: 'Карта' },
  { value: 'transfer', label: 'Перевод' },
  { value: 'wallet', label: 'TravelPay balance' },
  { value: 'manager', label: 'Manager payment' },
  { value: 'mixed', label: 'Смешанная оплата' },
];

export function PaymentsPage({ headerProps, summary, transactions, drawer, modals }) {
  return (
    <section className="tp-feature-payments-page">
      <PageHeader eyebrow="Cashbox" title="Оплаты" {...headerProps} />
      {summary}
      {transactions}
      {drawer}
      {modals}
    </section>
  );
}

export function TransactionTable({ transactions = [], columns, onOpen, ...rest }) {
  const defaultColumns = columns || [
    { title: 'Дата', dataIndex: 'date', render: (value) => <DateTime value={value} /> },
    { title: 'Booking', dataIndex: 'booking' },
    { title: 'Клиент', dataIndex: 'client' },
    { title: 'Метод', dataIndex: 'method', render: (value) => <Tag>{value}</Tag> },
    { title: 'Сумма', dataIndex: 'amount', render: (value) => <Money value={value} /> },
    { title: 'Status', dataIndex: 'status', render: (value) => <PaymentBadge status={value} /> },
  ];
  return <DataTable rowKey="key" columns={defaultColumns} dataSource={transactions} onRow={(record) => ({ onDoubleClick: () => onOpen?.(record) })} scroll={{ x: 980 }} {...rest} />;
}

export function PaymentDrawer({ payment, children, ...props }) {
  return (
    <EntityDrawer title={payment ? payment.booking || `Payment #${payment.id}` : 'Payment'} width={720} {...props}>
      {payment && (
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <PaymentBadge status={payment.status} />
          <Card size="small">
            <Statistic title="Сумма" value={Number(payment.amount || 0)} formatter={(value) => <Money value={value} />} />
          </Card>
          <div><Text type="secondary">Клиент</Text><br /><Text strong>{payment.client || payment.clientName}</Text></div>
          <div><Text type="secondary">Метод</Text><br /><Tag>{payment.method || payment.paymentMethod}</Tag></div>
          {children}
        </Space>
      )}
    </EntityDrawer>
  );
}

export function AcceptPaymentModal({ open, loading, initialValues, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title="Принять оплату"
      okText="Принять оплату"
      cancelText="Отмена"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ method: 'qr', currency: 'KGS', ...initialValues }} onFinish={onSubmit}>
        <Form.Item name="amount" label="Сумма" rules={[{ required: true, message: 'Укажите сумму' }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} suffix="сом" />
        </Form.Item>
        <Form.Item name="method" label="Метод">
          <Select options={paymentMethodOptions} />
        </Form.Item>
        <Form.Item name="comment" label="Комментарий">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function RefundModal({ open, loading, maxAmount, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      title="Refund"
      okText="Оформить refund"
      cancelText="Отмена"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ reason: 'client_cancelled', amount: maxAmount }} onFinish={onSubmit}>
        <Form.Item name="amount" label="Сумма" rules={[{ required: true, message: 'Укажите сумму' }]}>
          <InputNumber min={0} max={maxAmount} precision={2} style={{ width: '100%' }} suffix="сом" />
        </Form.Item>
        <Form.Item name="reason" label="Причина">
          <Select options={[
            { value: 'client_cancelled', label: 'Клиент отменил' },
            { value: 'business_cancelled', label: 'Бизнес отменил' },
            { value: 'overpayment', label: 'Переплата' },
            { value: 'other', label: 'Другая причина' },
          ]} />
        </Form.Item>
        <Form.Item name="comment" label="Комментарий">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function PaymentSummary({ stats = [] }) {
  return (
    <div className="tp-feature-payment-summary">
      {stats.map((item) => (
        <Card key={item.key || item.title} size="small">
          <Statistic title={item.title} value={Number(item.value || 0)} formatter={(value) => item.formatter ? item.formatter(value) : <Money value={value} />} />
        </Card>
      ))}
    </div>
  );
}

export function DebtIndicator({ total = 0, paid = 0, currency = 'KGS' }) {
  const remaining = Math.max(Number(total || 0) - Number(paid || 0), 0);
  const percent = total ? Math.min(Math.round((Number(paid || 0) / Number(total || 1)) * 100), 100) : 0;
  return (
    <Card size="small" className="tp-feature-debt-indicator">
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <div><Text type="secondary">Total</Text><br /><Money value={total} currency={currency === 'KGS' ? 'сом' : currency} /></div>
        <div><Text type="secondary">Paid</Text><br /><Money value={paid} currency={currency === 'KGS' ? 'сом' : currency} /></div>
        <div><Text type="secondary">Remaining</Text><br /><Money value={remaining} currency={currency === 'KGS' ? 'сом' : currency} /></div>
        <Progress percent={percent} size="small" />
        {remaining > 0 && <Paragraph type="secondary" style={{ marginBottom: 0 }}>Остаток можно принять отдельной транзакцией.</Paragraph>}
      </Space>
    </Card>
  );
}
