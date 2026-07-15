import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Image,
  Input,
  Result,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import api from '../api';
import { readCurrentUser } from '../utils/currentUser';

const { Title, Paragraph, Text } = Typography;
const { Dragger } = Upload;
const PAYMENT_QR_URL = process.env.REACT_APP_PAYMENT_QR_URL || '/images/payment-qr.png';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const VisaPaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = readCurrentUser();
  const { tour, total = 0, people = 1, booking = {} } = location.state || {};
  const [receiptFile, setReceiptFile] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  const prepaymentPercent = Math.min(Math.max(Number(tour?.prepaymentPercent || 30), 10), 100);
  const prepaymentAmount = useMemo(
    () => Math.round((Number(total || 0) * prepaymentPercent) / 100),
    [prepaymentPercent, total],
  );

  if (!tour || !booking?.travelDate) {
    return (
      <main style={styles.page}>
        <Result
          status="warning"
          title="Данные бронирования не найдены"
          subTitle="Вернитесь к туру и заполните форму заново."
          extra={<Button type="primary" onClick={() => navigate('/tours')}>К списку туров</Button>}
        />
      </main>
    );
  }

  if (createdBooking) {
    return (
      <main style={styles.page}>
        <Card style={styles.successCard}>
          <Result
            status="success"
            title="Чек отправлен на проверку"
            subTitle={`Заявка №${createdBooking.id}. Компания проверит предоплату и подтвердит бронирование.`}
            extra={[
              <Button type="primary" key="profile" onClick={() => navigate('/profile')}>Перейти в профиль</Button>,
              <Button key="tours" onClick={() => navigate('/tours')}>Другие туры</Button>,
            ]}
          />
        </Card>
      </main>
    );
  }

  const handleReceiptChange = ({ fileList }) => {
    setReceiptFile(fileList[0]?.originFileObj || null);
  };

  const submitReceipt = async () => {
    if (!currentUser?.id) {
      message.warning('Войдите в аккаунт, чтобы отправить оплату.');
      navigate('/login');
      return;
    }

    if (!receiptFile) {
      message.warning('Прикрепите чек оплаты.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(receiptFile.type)) {
      message.error('Поддерживаются только JPG, PNG и PDF.');
      return;
    }
    if (receiptFile.size > 6 * 1024 * 1024) {
      message.error('Максимальный размер файла — 6 МБ.');
      return;
    }

    setSubmitting(true);
    try {
      const paymentReceiptUrl = await fileToDataUrl(receiptFile);
      const response = await api.post('/tour-bookings', {
        tourId: tour.id,
        ...booking,
        people,
        paymentMethod: 'receipt',
        prepaymentPercent,
        prepaymentAmount,
        paymentReceiptUrl,
        paymentReceiptName: receiptFile.name,
        paymentReceiptType: receiptFile.type,
        comment: [booking.comment, comment].filter(Boolean).join('\n'),
      });

      setCreatedBooking(response.data.booking);
      message.success('Чек отправлен на проверку.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось отправить бронирование.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={styles.backButton}>
          Назад к бронированию
        </Button>

        <Row gutter={[24, 24]} align="stretch">
          <Col xs={24} lg={10}>
            <Card style={styles.summaryCard}>
              <Tag color="gold">Предоплата тура</Tag>
              <Title level={2} style={styles.title}>{tour.title}</Title>
              <Paragraph type="secondary">{tour.location || 'Кыргызстан'} · {people} чел.</Paragraph>

              <Divider />
              <div style={styles.priceRow}><span>Полная стоимость</span><strong>{formatPrice(total)}</strong></div>
              <div style={styles.priceRow}><span>Предоплата {prepaymentPercent}%</span><strong>{formatPrice(prepaymentAmount)}</strong></div>
              <div style={styles.priceRow}><span>Остаток после подтверждения</span><strong>{formatPrice(total - prepaymentAmount)}</strong></div>

              <Alert
                showIcon
                type="info"
                style={{ marginTop: 20 }}
                title="Место фиксируется после проверки чека менеджером"
              />
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card style={styles.paymentCard}>
              <Space orientation="vertical" size={18} style={{ width: '100%' }}>
                <div>
                  <Text style={styles.kicker}><SafetyCertificateOutlined /> Безопасная предоплата</Text>
                  <Title level={2} style={styles.title}>Оплатите по QR</Title>
                  <Paragraph type="secondary">Переведите ровно {formatPrice(prepaymentAmount)}, затем прикрепите чек.</Paragraph>
                </div>

                <div style={styles.qrWrap}>
                  <Image src={PAYMENT_QR_URL} width={220} alt="QR-код для оплаты тура" preview={false} />
                </div>

                <Dragger
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleReceiptChange}
                >
                  <p className="ant-upload-drag-icon">
                    {receiptFile?.type === 'application/pdf' ? <FilePdfOutlined /> : <InboxOutlined />}
                  </p>
                  <p className="ant-upload-text">Перетащите чек или нажмите для выбора</p>
                  <p className="ant-upload-hint">JPG, PNG или PDF · до 6 МБ</p>
                </Dragger>

                <Input.TextArea
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Комментарий к оплате — необязательно"
                />

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  loading={submitting}
                  onClick={submitReceipt}
                  style={styles.submitButton}
                >
                  Отправить чек на проверку
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '36px 20px 70px',
    background: 'radial-gradient(circle at top left, rgba(252,163,17,.14), transparent 28%), linear-gradient(145deg, #edf5ff, #f8fbff)',
  },
  shell: { width: 'min(100%, 1120px)', margin: '0 auto' },
  backButton: { marginBottom: 20, borderRadius: 12 },
  summaryCard: { height: '100%', borderRadius: 24, boxShadow: '0 20px 55px rgba(29,53,87,.10)' },
  paymentCard: { height: '100%', borderRadius: 24, boxShadow: '0 20px 55px rgba(29,53,87,.10)' },
  successCard: { width: 'min(100%, 720px)', margin: '60px auto', borderRadius: 24 },
  title: { color: '#1d3557', marginTop: 10 },
  kicker: { color: '#1d3557', fontWeight: 800 },
  priceRow: { display: 'flex', justifyContent: 'space-between', gap: 20, padding: '10px 0', color: '#1d3557' },
  qrWrap: { display: 'grid', placeItems: 'center', padding: 20, borderRadius: 20, background: '#f8fafc' },
  submitButton: { height: 52, borderRadius: 14, background: '#fca311', borderColor: '#fca311', color: '#1d3557', fontWeight: 800 },
};

export default VisaPaymentPage;
