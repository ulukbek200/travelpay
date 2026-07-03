import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
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
  CompassOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import { readCurrentUser } from '../utils/currentUser';
import { TOUR_IMAGE_FALLBACK, withTourFallback } from '../utils/tourMedia';
import { normalizeUser, syncCurrentUser } from '../utils/user';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDeparture = (value) => new Date(value).toLocaleString('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

const ACCOMMODATION_TYPE_LABELS = {
  standard: 'Стандарт',
  comfort: 'Комфорт',
  vip: 'VIP',
  family: 'Семейный',
};

const TourBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tour } = location.state || {};
  const [form] = Form.useForm();
  const [people, setPeople] = useState(2);
  const [departureSlots, setDepartureSlots] = useState([]);
  const [departuresLoading, setDeparturesLoading] = useState(true);
  const [selectedDepartureSlotId, setSelectedDepartureSlotId] = useState('');
  const [selectedAccommodationId, setSelectedAccommodationId] = useState(null);
  const [extraBedSelected, setExtraBedSelected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payingWithSavings, setPayingWithSavings] = useState(false);
  const currentUser = normalizeUser(readCurrentUser());

  useEffect(() => {
    let active = true;
    if (!tour?.id) return undefined;

    setDeparturesLoading(true);
    api.get('/tour-bookings/availability', { params: { tourId: tour.id } })
      .then((response) => {
        if (!active) return;
        const available = (response.data || [])
          .filter((slot) => slot.active !== false && !slot.soldOut && new Date(slot.startAt).getTime() > Date.now());
        setDepartureSlots(available);
        if (available.length === 1) {
          setSelectedDepartureSlotId(available[0].id);
          form.setFieldValue('departureSlotId', available[0].id);
        }
      })
      .catch(() => active && setDepartureSlots([]))
      .finally(() => active && setDeparturesLoading(false));

    return () => { active = false; };
  }, [form, tour?.id]);

  const pricePerPerson = Number(String(tour?.price || 0).replace(/[^0-9]/g, '')) || 0;
  const baseTotal = useMemo(() => pricePerPerson * people, [pricePerPerson, people]);
  const accommodations = useMemo(
    () => (tour?.hasAccommodation && Array.isArray(tour?.accommodations) ? tour.accommodations : [])
      .filter((item) => item?.status !== 'sold_out' && Number(item?.availableCount || 0) > 0),
    [tour],
  );
  const selectedAccommodation = useMemo(
    () => accommodations.find((item) => item.id === selectedAccommodationId) || null,
    [accommodations, selectedAccommodationId],
  );
  const selectedDeparture = useMemo(
    () => departureSlots.find((slot) => slot.id === selectedDepartureSlotId) || null,
    [departureSlots, selectedDepartureSlotId],
  );
  const accommodationTotal = Number(selectedAccommodation?.pricePerNight || 0);
  const extraBedTotal = selectedAccommodation?.extraBedAvailable && extraBedSelected
    ? Number(selectedAccommodation.extraBedPrice || 0)
    : 0;
  const total = baseTotal + accommodationTotal + extraBedTotal;
  const savingsAmount = Number(currentUser?.savings?.currentAmount || 0);
  const canPayWithSavings = savingsAmount >= total;

  if (!tour) {
    return (
      <main style={styles.emptyPage}>
        <Card style={styles.emptyCard}>
          <Title level={2}>Данные тура не найдены</Title>
          <Paragraph>
            Пожалуйста, вернитесь на страницу туров и выберите тур для бронирования.
          </Paragraph>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            style={styles.goldButton}
            onClick={() => navigate('/tours')}
          >
            Назад к турам
          </Button>
        </Card>
      </main>
    );
  }

  const ensureAccommodationSelected = () => {
    if (tour.hasAccommodation && accommodations.length && !selectedAccommodation) {
      message.warning('Выберите проживание для этого тура.');
      return false;
    }
    return true;
  };

  const ensureDepartureSelected = () => {
    if (!selectedDeparture) {
      message.warning('Выберите дату и время из расписания тур-компании.');
      return false;
    }
    if (Number(selectedDeparture.remainingSeats || 0) < people) {
      message.warning(`На это отправление осталось мест: ${selectedDeparture.remainingSeats || 0}.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (values) => {
    if (!ensureDepartureSelected()) return;
    if (!ensureAccommodationSelected()) return;

    if (!currentUser?.id) {
      message.warning('Войдите в аккаунт, чтобы оформить бронирование.');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    navigate('/VisaPaymentPage', {
      state: {
        tour,
        total,
        people,
        booking: {
          clientName: values.name,
          clientPhone: values.phone,
          clientEmail: currentUser.email || '',
          departureSlotId: selectedDeparture.id,
          travelDate: selectedDeparture.startAt,
          transport: values.transport,
          guide: values.guide,
          comment: values.comment || '',
          accommodation: selectedAccommodation,
          accommodationTotal,
          extraBedSelected,
          extraBedTotal,
        },
      },
    });
    setSubmitting(false);
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

    if (!ensureAccommodationSelected()) return;
    if (!ensureDepartureSelected()) return;

    if (!canPayWithSavings) {
      message.error('Недостаточно средств');
      return;
    }

    setPayingWithSavings(true);

    try {
      const formValues = form.getFieldsValue();
      const response = await api.post('/tour-bookings', {
        tourId: tour.id,
        clientName: formValues.name || currentUser?.name || '',
        clientPhone: formValues.phone || currentUser?.phone || '',
        clientEmail: currentUser?.email || '',
        people,
        departureSlotId: selectedDeparture.id,
        transport: formValues.transport,
        guide: formValues.guide,
        comment: formValues.comment || '',
        paymentMethod: 'savings',
        accommodation: selectedAccommodation,
        extraBedSelected,
      });

      syncCurrentUser({ ...response.data.user, isLoggedIn: true });
      message.success('Тур успешно оплачен из накоплений.');
      navigate('/profile');
    } catch (error) {
      message.error(error.response?.data?.message || 'Не удалось оплатить тур из накоплений.');
    } finally {
      setPayingWithSavings(false);
    }
  };

  return (
    <main className="booking-page" style={styles.page}>
      <Button type="text" style={styles.logo} onClick={() => navigate('/')}>
        <span>TravelPay</span>
        <small>by Barsbek Travel</small>
      </Button>

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
            Подтвердите детали поездки. Онлайн-оплата пока не списывается автоматически:
            менеджер свяжется с вами для финального подтверждения.
          </Paragraph>
        </motion.div>

        <Row gutter={[26, 26]} align="stretch">
          <Col xs={24} lg={10}>
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card style={styles.tourCard} styles={{ body: { padding: 0 } }}>
                <div style={styles.imageWrap}>
                  <img
                    src={tour.image || TOUR_IMAGE_FALLBACK}
                    alt={tour.title}
                    onError={withTourFallback}
                    style={styles.tourImage}
                  />
                  <div style={styles.imageGradient} />
                  <Tag style={styles.locationTag}>
                    <EnvironmentOutlined /> {tour.location || tour.country || 'Кыргызстан'}
                  </Tag>
                </div>

                <div style={styles.tourBody}>
                  <Title level={2} style={styles.tourTitle}>{tour.title}</Title>
                  <Paragraph style={styles.tourText}>
                    {tour.description || 'Премиальный маршрут с локальным гидом, комфортным транспортом и красивыми локациями.'}
                  </Paragraph>

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
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 }}
            >
              <Card style={styles.formCard}>
                <Alert
                  showIcon
                  type="info"
                  style={styles.alert}
                  title="Выберите оплату из накоплений или внесите предоплату по QR и прикрепите чек"
                />

                <Alert
                  showIcon
                  type={canPayWithSavings ? 'success' : 'warning'}
                  style={styles.alert}
                  className="booking-savings-alert"
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

                    <Col xs={24}>
                      <Form.Item
                        name="departureSlotId"
                        label="Выберите отправление"
                        rules={[{ required: true, message: 'Выберите дату и время из расписания' }]}
                      >
                        {departuresLoading ? (
                          <Alert showIcon type="info" title="Загружаем расписание тур-компании..." />
                        ) : departureSlots.length ? (
                          <Radio.Group
                            className="tour-departure-picker"
                            onChange={(event) => {
                              setSelectedDepartureSlotId(event.target.value);
                              setSelectedAccommodationId(null);
                              setExtraBedSelected(false);
                            }}
                          >
                            {departureSlots.map((slot) => (
                              <Radio.Button key={slot.id} value={slot.id} className="tour-departure-option">
                                <span className="tour-departure-option__date">{formatDeparture(slot.startAt)}</span>
                                <span className="tour-departure-option__seats">Свободно {slot.remainingSeats} из {slot.seats}</span>
                              </Radio.Button>
                            ))}
                          </Radio.Group>
                        ) : (
                          <Alert
                            showIcon
                            type="warning"
                            title="У этого тура пока нет доступных отправлений"
                            description="Тур-компания добавит новые даты и время."
                          />
                        )}
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

                  {tour.hasAccommodation && selectedDeparture && (
                    <div className="booking-accommodation-section">
                      <div className="booking-accommodation-head">
                        <div>
                          <Text className="booking-accommodation-kicker">🏡 Выберите проживание</Text>
                          <Title level={3}>Домики TravelPay Stay</Title>
                        </div>
                        <Tag color="cyan">{accommodations.length} вариантов</Tag>
                      </div>

                      {accommodations.length ? (
                        <div className="booking-accommodation-grid">
                          {accommodations.map((item, index) => {
                            const isSelected = selectedAccommodationId === item.id;
                            const image = item.images?.[0] || tour.image || TOUR_IMAGE_FALLBACK;
                            const typeLabel = ACCOMMODATION_TYPE_LABELS[item.type] || item.type || 'Стандарт';
                            const isVip = item.type === 'vip';
                            const isLimited = Number(item.availableCount || 0) <= 2;

                            return (
                              <Card
                                key={item.id}
                                hoverable
                                className={`booking-accommodation-card ${isSelected ? 'booking-accommodation-card--selected' : ''}`}
                                cover={<img src={image} alt={item.name} onError={withTourFallback} />}
                              >
                                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                  <Space wrap>
                                    {index === 0 && <Tag color="gold">Популярный</Tag>}
                                    {isVip && <Tag color="purple">VIP</Tag>}
                                    {isLimited && <Tag color="orange">Осталось {item.availableCount} места</Tag>}
                                  </Space>

                                  <div>
                                    <Title level={4}>{item.name}</Title>
                                    <Text type="secondary">{typeLabel} · до {item.capacity || 1} человек</Text>
                                  </div>

                                  <div className="booking-accommodation-amenities">
                                    {(item.amenities || []).slice(0, 6).map((amenity) => (
                                      <Tag key={amenity}>{amenity}</Tag>
                                    ))}
                                  </div>

                                  <Paragraph>{item.description || 'Комфортное проживание рядом с маршрутом тура.'}</Paragraph>

                                  <div className="booking-accommodation-price-row">
                                    <strong>{formatPrice(item.pricePerNight)}</strong>
                                    <span>за ночь</span>
                                  </div>

                                  <Text type="secondary">Осталось мест: {item.availableCount} домиков</Text>

                                  <Button
                                    type={isSelected ? 'primary' : 'default'}
                                    block
                                    icon={<HomeOutlined />}
                                    onClick={() => {
                                      setSelectedAccommodationId(item.id);
                                      setExtraBedSelected(false);
                                    }}
                                  >
                                    {isSelected ? 'Выбрано' : 'Выбрать'}
                                  </Button>
                                </Space>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <Alert type="warning" showIcon title="Для выбранного тура сейчас нет доступных домиков" />
                      )}

                      {selectedAccommodation?.extraBedAvailable && (
                        <Checkbox
                          className="booking-extra-bed-checkbox"
                          checked={extraBedSelected}
                          onChange={(event) => setExtraBedSelected(event.target.checked)}
                        >
                          Добавить дополнительное место за {formatPrice(selectedAccommodation.extraBedPrice)}
                        </Checkbox>
                      )}
                    </div>
                  )}

                  <div style={styles.summaryCard}>
                    <Space direction="vertical" size={4}>
                      <Text style={styles.summaryLabel}>Итоговая стоимость</Text>
                      <Title level={2} style={styles.total}>{formatPrice(total)}</Title>
                      <div className="booking-price-breakdown">
                        <span>Стоимость тура: {formatPrice(baseTotal)}</span>
                        {selectedAccommodation && <span>Проживание: +{formatPrice(accommodationTotal)}</span>}
                        {extraBedTotal > 0 && <span>Доп. место: +{formatPrice(extraBedTotal)}</span>}
                        <Divider style={{ margin: '6px 0' }} />
                        <strong>Итого: {formatPrice(total)}</strong>
                      </div>
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
    overflowX: 'hidden',
    padding: '30px 20px 70px',
    color: '#fff',
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    '--booking-bg-image': 'url("/images/kyrgyzstan-mountains.jpg")',
    background: 'linear-gradient(rgba(2, 6, 23, 0.75), rgba(2, 6, 23, 0.85)), url("/images/kyrgyzstan-mountains.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
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
    border: '1px solid rgba(22,182,196,0.22)',
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
  submitButton: {
    minWidth: 190,
    height: 50,
    borderRadius: 999,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    border: `1px solid ${BRAND_GOLD}`,
    color: BRAND_BLUE,
    fontWeight: 900,
    boxShadow: '0 18px 42px rgba(252,163,17,0.32)',
  },
  savingsButton: {
    minWidth: 220,
    height: 50,
    borderRadius: 999,
    background: 'rgba(29,53,87,0.08)',
    border: '1px solid rgba(29,53,87,0.18)',
    color: BRAND_BLUE,
    fontWeight: 900,
  },
  goldButton: {
    borderRadius: 999,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    border: `1px solid ${BRAND_GOLD}`,
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
