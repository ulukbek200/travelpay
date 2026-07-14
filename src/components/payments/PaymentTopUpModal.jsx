import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  QRCode,
  Row,
  Space,
  Tag,
  Upload,
  message,
} from 'antd';
import {
  BankOutlined,
  CopyOutlined,
  CustomerServiceOutlined,
  InboxOutlined,
  PhoneOutlined,
  QrcodeOutlined,
  SendOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { formatSom, isValidReceiptFile, receiptToDataUrl } from '../../utils/payments';

const { Dragger } = Upload;

const DEFAULT_PAYMENT_DETAILS = {
  bankName: 'MBANK',
  recipientName: 'TravelPay Partner',
  phoneNumber: '+996 700 000 000',
  qrCodeUrl: '/images/payment-qr.png',
  paymentPurpose: 'Пополнение TravelPay',
  instruction: 'Отсканируйте QR в приложении банка и загрузите чек.',
};

const copyDetails = async (details) => {
  const text = [
    details.bankName,
    details.recipientName,
    details.phoneNumber,
    details.accountNumber,
    details.cardNumber,
    details.paymentPurpose,
    details.instruction,
  ].filter(Boolean).join('\n');

  if (!text) return;
  await navigator.clipboard?.writeText(text);
};

const PaymentMethodCard = ({ active, children, icon, onClick, text, title }) => (
  <button
    className={`tp-payment-method-card${active ? ' is-active' : ''}`}
    onClick={onClick}
    type="button"
  >
    <span className="tp-payment-method-card__icon">{icon}</span>
    <strong>{title}</strong>
    <small>{text}</small>
    {children}
  </button>
);

const PaymentTopUpModal = ({
  amount: controlledAmount,
  businessId,
  onCreated,
  open,
  requiredAmount,
  serviceContext,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [method, setMethod] = useState('qr');
  const [settings, setSettings] = useState(null);
  const [managers, setManagers] = useState([]);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      amount: Number(controlledAmount || requiredAmount || 0) || undefined,
    });
    setReceiptFiles([]);
  }, [controlledAmount, form, open, requiredAmount]);

  useEffect(() => {
    if (!open) return;

    Promise.all([
      api.get('/business/payment-settings', { params: businessId ? { companyId: businessId } : {} }).catch(() => ({ data: null })),
      api.get('/business/managers', { params: businessId ? { companyId: businessId } : {} }).catch(() => ({ data: [] })),
    ]).then(([settingsResponse, managersResponse]) => {
      setSettings(settingsResponse.data);
      setManagers(managersResponse.data || []);
    });
  }, [businessId, open]);

  const primaryQr = useMemo(() => (
    settings?.methods?.find((item) => item.active && item.primary)
    || settings?.methods?.find((item) => item.active)
    || DEFAULT_PAYMENT_DETAILS
  ), [settings]);

  const primaryManager = useMemo(() => (
    managers.find((item) => item.active && item.primaryPaymentManager)
    || managers.find((item) => item.active)
    || {
      firstName: 'TravelPay',
      lastName: 'Manager',
      phone: '+996 700 000 000',
      whatsapp: '+996 700 000 000',
      telegram: '',
      workingHours: '09:00–18:00',
    }
  ), [managers]);

  const details = method === 'manager'
    ? {
      managerName: [primaryManager.firstName, primaryManager.lastName].filter(Boolean).join(' '),
      managerPhone: primaryManager.phone,
      managerWhatsapp: primaryManager.whatsapp,
      managerTelegram: primaryManager.telegram,
      instruction: primaryManager.workingHours ? `Рабочее время: ${primaryManager.workingHours}` : '',
    }
    : primaryQr;

  const handleReceiptChange = ({ fileList }) => {
    const nextFiles = fileList.slice(-1);
    const file = nextFiles[0]?.originFileObj || nextFiles[0];

    if (file && !isValidReceiptFile(file)) {
      message.error('Поддерживаются JPG, JPEG, PNG и PDF.');
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      message.error('Максимальный размер чека — 10 MB.');
      return;
    }

    setReceiptFiles(nextFiles);
  };

  const submit = async () => {
    const values = await form.validateFields();
    const uploadFile = receiptFiles[0]?.originFileObj || receiptFiles[0];

    if (!uploadFile && !values.transactionNumber) {
      message.warning('Загрузите чек или укажите номер транзакции.');
      return;
    }

    setSubmitting(true);

    try {
      const receiptUrl = uploadFile ? await receiptToDataUrl(uploadFile) : '';
      const response = await api.post('/payment-requests', {
        amount: Number(values.amount),
        paymentMethod: method,
        businessId,
        receiptUrl,
        receiptName: uploadFile?.name || '',
        receiptType: uploadFile?.type || '',
        transactionNumber: values.transactionNumber,
        comment: values.comment,
        ...serviceContext,
      });

      message.success('Платёж отправлен на проверку.');
      onCreated?.(response.data);
      onCancel?.();
      form.resetFields();
      setReceiptFiles([]);
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось отправить платёж на проверку.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      centered
      className="tp-payment-modal"
      footer={null}
      onCancel={onCancel}
      open={open}
      title="Пополнить накопительный баланс"
      width={920}
    >
      {requiredAmount ? (
        <Alert
          showIcon
          type="warning"
          message="Недостаточно средств"
          description={`Для оплаты нужно пополнить баланс минимум на ${formatSom(requiredAmount)}.`}
          style={{ marginBottom: 18 }}
        />
      ) : null}

      <Form form={form} layout="vertical">
        <Form.Item
          label="Сумма пополнения"
          name="amount"
          rules={[{ required: true, message: 'Введите сумму пополнения' }]}
        >
          <InputNumber
            min={100}
            size="large"
            style={{ width: '100%' }}
            addonAfter="сом"
          />
        </Form.Item>

        <Row gutter={[14, 14]} className="tp-payment-method-grid">
          <Col xs={24} md={12}>
            <PaymentMethodCard
              active={method === 'qr'}
              icon={<QrcodeOutlined />}
              onClick={() => setMethod('qr')}
              text="Сканируйте QR, оплатите в банке и загрузите чек."
              title="Оплатить по QR"
            />
          </Col>
          <Col xs={24} md={12}>
            <PaymentMethodCard
              active={method === 'manager'}
              icon={<CustomerServiceOutlined />}
              onClick={() => setMethod('manager')}
              text="Свяжитесь с менеджером и прикрепите чек или номер операции."
              title="Оплата через менеджера"
            />
          </Col>
        </Row>

        <Card className="tp-payment-details-card">
          {method === 'qr' ? (
            <Row gutter={[18, 18]} align="middle">
              <Col xs={24} md={9}>
                <div className="tp-payment-qr-box">
                  {details.qrCodeUrl ? (
                    <Image src={details.qrCodeUrl} alt="QR code" preview={false} />
                  ) : (
                    <QRCode value={`${details.bankName || 'TravelPay'} ${details.phoneNumber || ''}`} />
                  )}
                </div>
              </Col>
              <Col xs={24} md={15}>
                <Space wrap style={{ marginBottom: 12 }}>
                  <Tag color="blue"><BankOutlined /> {details.bankName || 'Банк'}</Tag>
                  <Tag color="gold">KGS</Tag>
                </Space>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Получатель">{details.recipientName || 'TravelPay Partner'}</Descriptions.Item>
                  <Descriptions.Item label="Телефон">{details.phoneNumber || '—'}</Descriptions.Item>
                  <Descriptions.Item label="Счёт / карта">{details.accountNumber || details.cardNumber || '—'}</Descriptions.Item>
                  <Descriptions.Item label="Назначение">{details.paymentPurpose || 'Пополнение TravelPay'}</Descriptions.Item>
                  <Descriptions.Item label="Инструкция">{details.instruction || 'Оплатите и загрузите чек.'}</Descriptions.Item>
                </Descriptions>
                <Button icon={<CopyOutlined />} onClick={() => copyDetails(details)}>
                  Скопировать реквизиты
                </Button>
              </Col>
            </Row>
          ) : (
            <div className="tp-manager-payment-card">
              <div className="tp-manager-payment-card__avatar">
                {primaryManager.photoUrl ? <img src={primaryManager.photoUrl} alt={details.managerName} /> : <CustomerServiceOutlined />}
              </div>
              <div>
                <h3>{details.managerName || 'TravelPay Manager'}</h3>
                <p>{details.instruction || 'Свяжитесь с менеджером для получения реквизитов.'}</p>
                <Space wrap>
                  {details.managerPhone && <Button icon={<PhoneOutlined />} href={`tel:${details.managerPhone}`}>Позвонить</Button>}
                  {details.managerWhatsapp && <Button href={`https://wa.me/${details.managerWhatsapp.replace(/\D/g, '')}`} target="_blank">Написать в WhatsApp</Button>}
                  {details.managerTelegram && <Button href={`https://t.me/${details.managerTelegram.replace(/^@/, '')}`} target="_blank">Открыть Telegram</Button>}
                </Space>
              </div>
            </div>
          )}
        </Card>

        <Form.Item label="Чек об оплате">
          <Dragger
            accept=".jpg,.jpeg,.png,.pdf"
            beforeUpload={() => false}
            fileList={receiptFiles}
            maxCount={1}
            onChange={handleReceiptChange}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Загрузите JPG, JPEG, PNG или PDF</p>
            <p className="ant-upload-hint">Максимальный размер файла — 10 MB.</p>
          </Dragger>
        </Form.Item>

        <Form.Item label="Номер транзакции" name="transactionNumber">
          <Input placeholder="Например: MBANK-2026-000123" />
        </Form.Item>

        <Form.Item label="Комментарий" name="comment">
          <Input.TextArea rows={3} placeholder="Напишите, если оплата была с другого номера или есть важная деталь." />
        </Form.Item>

        <Button
          block
          icon={<SendOutlined />}
          loading={submitting}
          onClick={submit}
          size="large"
          type="primary"
        >
          Я оплатил, отправить на проверку
        </Button>
      </Form>
    </Modal>
  );
};

export default PaymentTopUpModal;
