import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { readCurrentUser } from '../utils/currentUser';
import { normalizeSavings } from '../utils/savings';
import { normalizeUser, syncCurrentUser, updateUserById } from '../utils/user';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;

const TourBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tour } = location.state || {};
  const [form] = Form.useForm();
  const [people, setPeople] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [payingWithSavings, setPayingWithSavings] = useState(false);
  const currentUser = normalizeUser(readCurrentUser());

  const pricePerPerson = Number(String(tour?.price || 0).replace(/[^0-9]/g, '')) || 0;
  const total = useMemo(() => pricePerPerson * people, [pricePerPerson, people]);
  const savingsAmount = Number(currentUser?.savings?.currentAmount || 0);
  const canPayWithSavings = savingsAmount >= total;

  if (!tour) {
    return (
      <main style={styles.emptyPage}>
        <Card style={styles.emptyCard}>
          <Title level={2}>Данные тура не найдены</Title>
          <Paragraph>Пожалуйста, вернитесь на страницу туров и выберите тур для бронирования.</Paragraph>
          <Button type="primary" icon={<ArrowLeftOutlined />} style={styles.goldButton} onClick={() => navigate('/tours')}>
            Назад к турам
          </Button>
        </Card>
      </main>
    );
  }

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate('/VisaPaymentPage', {
        state: {
          tour,
          total,
          people,
          booking: values,
        },
      });
    }, 700);
  };

  const handlePayWithSavings = async () => {
    if (!currentUser?.id) {
      navigate('/login');
      return;
    }

    try {
      await form.validateFields();
    } catch (error) {
      return;
    }

    if (!canPayWithSavings) {
      message.error('Недостаточно средств');
      return;
    }

    setPayingWithSavings(true);

    try {
      const formValues = form.getFieldsValue();
      const nextSavings = normalizeSavings({
        ...currentUser.savings,
        currentAmount: Math.max(savingsAmount - total, 0),
      });
      const bookingRecord = {
        id: `booking-${Date.now()}`,
        tourId: tour.id,
        tourTitle: tour.title,
        location: tour.location || tour.country || 'TravelPay',
        image: tour.image,
        amount: total,
        status: 'paid',
        purchasedAt: new Date().toISOString(),
        travelDate: formValues?.date?.toISOString?.() || '',
        paymentMethod: 'savings',
      };
      const notifications = [
        {
          id: `notification-${Date.now()}`,
          type: 'booking',
          title: 'Тур оплачен из накоплений',
          description: `${tour.title} успешно добавлен в историю поездок.`,
          date: new Date().toISOString(),
          read: false,
        },
        ...(currentUser.notifications || []),
      ];

      const nextUser = await updateUserById(currentUser.id, {
        ...currentUser,
        savings: nextSavings,
        travelHistory: [bookingRecord, ...(currentUser.travelHistory || [])],
        bookings: [bookingRecord, ...(currentUser.bookings || [])],
        notifications,
        isLoggedIn: true,
      });

      syncCurrentUser({ ...nextUser, isLoggedIn: true });
      message.success('Тур успешно оплачен из накоплений.');
      navigate('/profile');
    } finally {
      setPayingWithSavings(false);
    }
  };

  return (
    <main className="booking-page" style={styles.page}>
      <video autoPlay muted loop playsInline style={styles.backgroundVideo}>
        <source src="https://videos.pexels.com/video-files/854976/854976-hd_1920_1080_30fps.mp4" type="video/mp4" />
        <source src="https://cdn.pixabay.com/video/2021/08/10/84776-587945089_large.mp4" type="video/mp4" />
      </video>
      <div style={styles.overlay} />

      <button type="button" style={styles.logo} onClick={() => navigate('/')}>
        <span>TravelPay</span>
        <small>by Barsbek Travel</small>
      </button>

      <section style={styles.shell}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          style={styles.header}
        >
          <Tag style={styles.heroTag}>Premium booking</Tag>
          <Title style={styles.title}>Забронировать тур</Title>
          <Paragraph style={styles.subtitle}>
            Подтвердите детали поездки. Онлайн-оплата пока не списывается: менеджер свяжется с вами для финального подтверждения.
          </Paragraph>
        </motion.div>

        <Row gutter={[26, 26]} align="stretch">
          <Col xs={24} lg={10}>
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <Card style={styles.tourCard} bodyStyle={{ padding: 0 }}>
                <div style={styles.imageWrap}>
                  <img
                    src={tour.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80'}
                    alt={tour.title}
                    style={styles.tourImage}
                  />
                  <div style={styles.imageGradient} />
                  <Tag style={styles.locationTag}><EnvironmentOutlined /> {tour.location || tour.country || 'Кыргызстан'}</Tag>
                </div>
                <div style={styles.tourBody}>
                  <Title level={2} style={styles.tourTitle}>{tour.title}</Title>
                  <Paragraph style={styles.tourText}>{tour.description || 'Премиальный маршрут с локальным гидом, комфортным транспортом и красивыми локациями.'}</Paragraph>

                  <div style={styles.featureGrid}>
                    <div style={styles.feature}><CalendarOutlined /><span>{tour.duration || 'Срок уточняется'}</span></div>
                    <div style={styles.feature}><TeamOutlined /><span>{people} туриста</span></div>
                    <div style={styles.feature}><CompassOutlined /><span>Локальный гид</span></div>
                    <div style={styles.feature}><CarOutlined /><span>Комфорт трансфер</span></div>
                  </div>

                  <div style={styles.pricePanel}>
                    <Text>Цена за человека</Text>
                    <strong>{formatPrice(pricePerPerson)}</strong>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} lg={14}>
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}>
              <Card style={styles.formCard}>
                <Alert
                  showIcon
                  type="info"
                  style={styles.alert}
                  title="Бронирование пока не оплачивается онлайн — менеджер свяжется с вами для подтверждения"
                />

                <Alert
                  showIcon
                  type={canPayWithSavings ? 'success' : 'warning'}
                  style={styles.alert}
                  title={canPayWithSavings
                    ? `На накоплениях доступно ${formatPrice(savingsAmount)} — этого хватает для оплаты тура.`
                    : `На накоплениях доступно ${formatPrice(savingsAmount)}. Недостаточно средств`}
                />

                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    people: 2,
                    transport: 'comfort',
                    guide: 'group',
                  }}
                  onFinish={handleSubmit}
                >
                  <Row gutter={[16, 14]}>
                    <Col xs={24} md={12}>
                      <Form.Item name="name" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}>
                        <Input size="large" prefix={<UserOutlined />} placeholder="Ваше имя" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Введите телефон' }]}>
                        <Input size="large" placeholder="+996 555 123 456" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="date" label="Дата начала тура" rules={[{ required: true, message: 'Выберите дату' }]}>
                        <DatePicker size="large" style={{ width: '100%' }} suffixIcon={<CalendarOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="time" label="Желаемое время выезда">
                        <Input size="large" prefix={<ClockCircleOutlined />} placeholder="09:00" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="people" label="Количество участников">
                        <InputNumber
                          size="large"
                          min={1}
                          max={12}
                          style={{ width: '100%' }}
                          onChange={(value) => setPeople(Number(value || 1))}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="transport" label="Тип транспорта">
                        <Select
                          size="large"
                          options={[
                            { value: 'minivan', label: 'Минивэн' },
                            { value: 'comfort', label: 'Комфорт-класс' },
                            { value: 'jeep', label: 'Джип / SUV' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="guide" label="Гид">
                        <Select
                          size="large"
                          options={[
                            { value: 'group', label: 'Групповой' },
                            { value: 'personal', label: 'Персональный' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item name="comment" label="Пожелания">
                        <Input.TextArea
                          rows={4}
                          placeholder="Например: питание, место посадки, дети, особые пожелания..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div style={styles.summaryCard}>
                    <Space orientation="vertical" size={4}>
                      <Text style={styles.summaryLabel}>Итоговая стоимость</Text>
                      <Title level={2} style={styles.total}>{formatPrice(total)}</Title>
                      <Text style={styles.summaryNote}>{people} × {formatPrice(pricePerPerson)}</Text>
                    </Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={submitting}
                      icon={<CreditCardOutlined />}
                      style={styles.submitButton}
                    >
                      Продолжить
                    </Button>
                    <Button
                      size="large"
                      loading={payingWithSavings}
                      onClick={handlePayWithSavings}
                      style={styles.savingsButton}
                    >
                      Оплатить из накоплений
                    </Button>
                  </div>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>

        <motion.div
          style={styles.trustRow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34 }}
        >
          {['Безопасное подтверждение', 'Локальный менеджер', 'KG / RU / EN поддержка'].map((item) => (
            <span key={item}><CheckCircleOutlined /> {item}</span>
          ))}
        </motion.div>
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    padding: '30px 20px 70px',
    color: '#fff',
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  },
  backgroundVideo: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'saturate(1.08) contrast(1.04) brightness(0.86)',
    transform: 'scale(1.03)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(5,13,24,0.86), rgba(12,31,54,0.62), rgba(5,13,24,0.82)), radial-gradient(circle at 72% 18%, rgba(252,163,17,0.22), transparent 34%)',
  },
  logo: {
    position: 'relative',
    zIndex: 5,
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.10)',
    color: '#fff',
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backdropFilter: 'blur(18px)',
    fontWeight: 850,
    boxShadow: '0 18px 46px rgba(0,0,0,0.18)',
  },
  shell: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 1180,
    margin: '34px auto 0',
  },
  header: {
    maxWidth: 820,
    margin: '0 auto 28px',
    textAlign: 'center',
  },
  heroTag: {
    borderRadius: 999,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.22)',
    fontWeight: 850,
    backdropFilter: 'blur(18px)',
  },
  title: {
    color: '#fff',
    fontSize: 'clamp(34px, 5vw, 62px)',
    lineHeight: 1.04,
    margin: '18px 0 12px',
    fontWeight: 850,
    textShadow: '0 22px 70px rgba(0,0,0,0.34)',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.80)',
    fontSize: 17,
    lineHeight: 1.7,
  },
  tourCard: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: 30,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.26)',
    backdropFilter: 'blur(24px)',
  },
  imageWrap: {
    position: 'relative',
    height: 300,
    overflow: 'hidden',
  },
  tourImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imageGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.58))',
  },
  locationTag: {
    position: 'absolute',
    left: 18,
    bottom: 18,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.16)',
    border: '1px solid rgba(255,255,255,0.22)',
    color: '#fff',
    backdropFilter: 'blur(14px)',
    fontWeight: 750,
  },
  tourBody: {
    padding: 24,
  },
  tourTitle: {
    color: '#fff',
    fontWeight: 850,
    marginBottom: 10,
  },
  tourText: {
    color: 'rgba(255,255,255,0.76)',
    lineHeight: 1.65,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    margin: '22px 0',
  },
  feature: {
    minHeight: 58,
    borderRadius: 18,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: '#fff',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  pricePanel: {
    padding: 18,
    borderRadius: 22,
    background: 'linear-gradient(135deg, rgba(252,163,17,0.18), rgba(255,255,255,0.10))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
  },
  formCard: {
    borderRadius: 30,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(255,255,255,0.64)',
    boxShadow: '0 28px 80px rgba(0,0,0,0.22)',
    backdropFilter: 'blur(24px)',
  },
  alert: {
    marginBottom: 22,
    borderRadius: 18,
    background: 'rgba(22,182,196,0.09)',
    borderColor: 'rgba(22,182,196,0.22)',
  },
  summaryCard: {
    marginTop: 10,
    padding: 18,
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(29,53,87,0.08), rgba(252,163,17,0.14))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
  },
  summaryLabel: {
    color: '#64748b',
    fontWeight: 750,
  },
  total: {
    color: BRAND_BLUE,
    margin: 0,
    fontWeight: 900,
  },
  summaryNote: {
    color: '#64748b',
  },
  submitButton: {
    minWidth: 190,
    height: 50,
    borderRadius: 999,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 900,
    boxShadow: '0 18px 42px rgba(252,163,17,0.32)',
  },
  savingsButton: {
    minWidth: 220,
    height: 50,
    borderRadius: 999,
    background: 'rgba(29,53,87,0.08)',
    borderColor: 'rgba(29,53,87,0.18)',
    color: BRAND_BLUE,
    fontWeight: 900,
  },
  goldButton: {
    borderRadius: 999,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 850,
  },
  trustRow: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  emptyPage: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: 'linear-gradient(135deg, #eef5fb, #f8fbff)',
  },
  emptyCard: {
    maxWidth: 520,
    borderRadius: 28,
    boxShadow: '0 24px 70px rgba(29,53,87,0.12)',
  },
};

export default TourBookingPage;
