import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Rate,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import {
  fallbackStays,
  formatStayPrice,
  getStayTypeLabel,
  normalizeStay,
  withStayFallback,
} from '../utils/stays';
import { readCurrentUser } from '../utils/currentUser';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const CHECK_IN_TIMES = ['14:00', '16:00', '18:00'];

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};
const addMonths = (date, amount) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
const isSameDay = (left, right) => (
  left.getFullYear() === right.getFullYear()
  && left.getMonth() === right.getMonth()
  && left.getDate() === right.getDate()
);
const formatDateKey = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const buildAvailabilityDays = (monthDate, stay, today, availabilityRecords = []) => {
  const availabilityByKey = new Map(availabilityRecords.map((item) => [item.key, item]));
  const seed = String(stay?.id || stay?.title || 'stay')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const visibleStart = today.getMonth() === monthStart.getMonth() && today.getFullYear() === monthStart.getFullYear()
    ? today.getDate()
    : 1;
  const visibleCount = Math.min(7, daysInMonth - visibleStart + 1);

  return Array.from({ length: visibleCount }, (_, index) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), visibleStart + index);
    const key = formatDateKey(date);
    const realAvailability = availabilityByKey.get(key);
    const baseLeft = Math.max(Number(stay?.availableCount || 0), 0);
    const reservedPattern = (date.getDate() + seed) % 6 === 0;
    const left = realAvailability ? Number(realAvailability.left || 0) : reservedPattern ? 0 : Math.max(baseLeft - ((date.getDate() + seed) % 3), 0);
    const isPast = startOfDay(date) < today;
    return {
      date,
      key,
      label: isSameDay(date, today) ? 'Сегодня' : index === 1 && isSameDay(addDays(today, 1), date) ? 'Завтра' : WEEKDAY_SHORT[date.getDay()],
      day: date.getDate(),
      left,
      available: realAvailability ? Boolean(realAvailability.available) : !isPast && left > 0,
    };
  });
};

const StayDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const today = useMemo(() => startOfDay(new Date()), []);
  const currentUser = readCurrentUser();
  const [bookingForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [stays, setStays] = useState([]);
  const [availabilityRecords, setAvailabilityRecords] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(2);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatDateKey(startOfDay(new Date())));
  const [selectedTime, setSelectedTime] = useState(CHECK_IN_TIMES[0]);

  useEffect(() => {
    const loadStays = async () => {
      try {
        const response = await api.get('/accommodations');
        const source = response.data?.length ? response.data : fallbackStays;
        setStays(source.map(normalizeStay));
      } catch (error) {
        setStays(fallbackStays.map(normalizeStay));
      } finally {
        setLoading(false);
      }
    };

    loadStays();
  }, []);

  const stay = useMemo(() => stays.find((item) => String(item.id) === String(id)), [id, stays]);
  const gallery = stay?.images?.length ? stay.images : fallbackStays[0].images;
  const availabilityMonthKey = useMemo(() => formatDateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)).slice(0, 7), [calendarMonth]);
  const availabilityDays = useMemo(
    () => buildAvailabilityDays(calendarMonth, stay, today, availabilityRecords),
    [availabilityRecords, calendarMonth, stay, today],
  );
  const selectedAvailability = useMemo(
    () => availabilityDays.find((day) => day.key === selectedDateKey),
    [availabilityDays, selectedDateKey],
  );
  const firstAvailableDay = useMemo(() => availabilityDays.find((day) => day.available), [availabilityDays]);

  useEffect(() => {
    if (!availabilityDays.length) return;
    if (selectedAvailability?.available) return;
    if (firstAvailableDay) {
      setSelectedDateKey(firstAvailableDay.key);
    }
  }, [availabilityDays, firstAvailableDay, selectedAvailability?.available]);

  useEffect(() => {
    if (!stay?.id) return;

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      try {
        const response = await api.get('/stay-bookings/availability', {
          params: { stayId: stay.id, month: availabilityMonthKey },
        });
        setAvailabilityRecords(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        setAvailabilityRecords([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailability();
  }, [availabilityMonthKey, stay?.id]);

  if (loading) {
    return (
      <main className="stay-detail-page">
        <Card className="stay-detail-shell"><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </main>
    );
  }

  if (!stay) {
    return (
      <main className="stay-detail-page">
        <Empty description="Домик не найден">
          <Button type="primary" onClick={() => navigate('/stays')}>Вернуться в каталог</Button>
        </Empty>
      </main>
    );
  }

  const totalPreview = stay.pricePerNight * nights;
  const selectedDateLabel = selectedAvailability
    ? selectedAvailability.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'выберите дату';
  const checkOutDate = selectedAvailability ? addDays(selectedAvailability.date, nights) : null;
  const checkOutLabel = checkOutDate
    ? checkOutDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'выберите дату';

  const openBookingModal = () => {
    bookingForm.setFieldsValue({
      clientName: currentUser?.name || '',
      clientPhone: currentUser?.phone || '',
      clientEmail: currentUser?.email || '',
      comment: '',
    });
    setBookingOpen(true);
  };

  const submitStayBooking = async () => {
    if (!selectedAvailability?.available) {
      message.warning('На выбранную дату свободных домиков нет.');
      return;
    }

    try {
      const values = await bookingForm.validateFields();
      setBookingSubmitting(true);
      await api.post('/stay-bookings', {
        stayId: stay.id,
        companyId: stay.companyId,
        companyName: stay.companyName,
        stayTitle: stay.title,
        location: stay.location,
        clientName: values.clientName,
        clientPhone: values.clientPhone,
        clientEmail: values.clientEmail,
        comment: values.comment,
        guests,
        nights,
        checkInDate: selectedAvailability.date.toISOString(),
        checkOutDate: checkOutDate?.toISOString(),
        checkInTime: selectedTime,
        amount: totalPreview,
      });
      setBookingOpen(false);
      message.success('Заявка отправлена. Компания подтвердит бронь в TravelPay Business.');
      const response = await api.get('/stay-bookings/availability', {
        params: { stayId: stay.id, month: availabilityMonthKey },
      });
      setAvailabilityRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const fallback = error?.response?.status === 409
        ? 'На выбранные даты свободных домиков уже нет.'
        : 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.';
      message.error(error?.response?.data?.message || fallback);
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <main className="stay-detail-page">
      <section className="stay-detail-hero">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stays')}>
          Назад к домикам
        </Button>
        <Tag className="stays-kicker"><HomeOutlined /> {getStayTypeLabel(stay.type)}</Tag>
        <Title>{stay.title}</Title>
        <Space wrap size={12}>
          <Tag><EnvironmentOutlined /> {stay.location}</Tag>
          <Tag><BankOutlined /> {stay.companyName}</Tag>
          <Tag><Rate disabled allowHalf value={stay.rating} /> {stay.rating}</Tag>
        </Space>
      </section>

      <section className="stay-detail-layout">
        <div className="stay-gallery">
          <div className="stay-gallery__main">
            <img src={gallery[0]} alt={stay.title} onError={withStayFallback} />
          </div>
          <div className="stay-gallery__thumbs">
            {(gallery.length > 1 ? gallery : [gallery[0], gallery[0], gallery[0]]).slice(0, 3).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${stay.title} ${index + 1}`} onError={withStayFallback} />
            ))}
          </div>
        </div>

        <Card className="stay-booking-card">
          <Text>Стоимость</Text>
          <Title level={2}>{formatStayPrice(stay.pricePerNight)}</Title>
          <Paragraph>за ночь, без скрытых платежей</Paragraph>
          <Divider />
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <div className="stay-availability">
              <div className="stay-availability__head">
                <div>
                  <Text>Свободные даты</Text>
                  <strong>{MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</strong>
                  {availabilityLoading && <Text type="secondary">Обновляем занятость...</Text>}
                </div>
                <Space size={8}>
                  <Button
                    shape="circle"
                    icon={<LeftOutlined />}
                    onClick={() => setCalendarMonth((current) => addMonths(current, -1))}
                  />
                  <Button
                    shape="circle"
                    icon={<RightOutlined />}
                    onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
                  />
                </Space>
              </div>
              <div className="stay-availability__days">
                {availabilityDays.map((day) => {
                  const isSelected = day.key === selectedDateKey && day.available;
                  return (
                    <button
                      type="button"
                      key={day.key}
                      className={`stay-date-pill ${isSelected ? 'stay-date-pill--selected' : ''} ${!day.available ? 'stay-date-pill--disabled' : ''}`}
                      disabled={!day.available}
                      onClick={() => setSelectedDateKey(day.key)}
                    >
                      <span>{day.label}</span>
                      <strong>{day.day}</strong>
                      <small>{day.available ? `${day.left} свободно` : 'занято'}</small>
                    </button>
                  );
                })}
              </div>
              <div className="stay-availability__times">
                <Text><ClockCircleOutlined /> Время заезда</Text>
                <div>
                  {CHECK_IN_TIMES.map((time) => (
                    <button
                      type="button"
                      key={time}
                      className={`stay-time-pill ${selectedTime === time ? 'stay-time-pill--selected' : ''}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Text>Гости</Text>
              <InputNumber min={1} max={stay.capacity} value={guests} onChange={setGuests} style={{ width: '100%', marginTop: 8 }} size={isMobile ? 'middle' : 'large'} />
            </div>
            <div>
              <Text>Ночей</Text>
              <InputNumber min={1} max={30} value={nights} onChange={(value) => setNights(Number(value) || 1)} style={{ width: '100%', marginTop: 8 }} size={isMobile ? 'middle' : 'large'} />
            </div>
            <div className="stay-booking-total">
              <span>{selectedDateLabel} - {checkOutLabel} · {selectedTime}</span>
              <strong>{formatStayPrice(totalPreview)}</strong>
            </div>
            <Button type="primary" size="large" block disabled={!selectedAvailability?.available} onClick={openBookingModal}>
              Забронировать
            </Button>
          </Space>
        </Card>
      </section>

      <section className="stay-detail-content">
        <Row gutter={[22, 22]}>
          <Col xs={24} lg={15}>
            <Card className="stay-info-card">
              <Title level={3}>О домике</Title>
              <Paragraph>{stay.description}</Paragraph>
              <div className="stay-info-grid">
                <div><TeamOutlined /><strong>{stay.capacity}</strong><span>гостей</span></div>
                <div><HomeOutlined /><strong>{stay.rooms}</strong><span>комнаты</span></div>
                <div><CalendarOutlined /><strong>{stay.availableCount}</strong><span>свободно</span></div>
                <div><SafetyCertificateOutlined /><strong>Проверено</strong><span>TravelPay</span></div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <Card className="stay-info-card">
              <Title level={4}>Удобства</Title>
              <div className="stay-amenity-list">
                {stay.amenities.map((amenity) => (
                  <span key={amenity}><CheckCircleOutlined /> {amenity}</span>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24}>
            <Card className="stay-info-card">
              <Title level={4}>Правила проживания</Title>
              <Paragraph>{stay.rules}</Paragraph>
              <Text type="secondary">Адрес: {stay.address}</Text>
            </Card>
          </Col>
        </Row>
      </section>

      <Modal
        open={bookingOpen}
        title="Заявка на бронирование"
        okText="Отправить заявку"
        cancelText="Отмена"
        confirmLoading={bookingSubmitting}
        onCancel={() => setBookingOpen(false)}
        onOk={submitStayBooking}
      >
        <Paragraph>Оставьте контакты, и компания подтвердит бронь в Business-панели.</Paragraph>
        <Card size="small">
          <strong>{stay.title}</strong>
          <p>{selectedDateLabel} - {checkOutLabel}, {selectedTime} · {guests} гостей · {formatStayPrice(totalPreview)}</p>
        </Card>
        <Form form={bookingForm} layout="vertical" className="stay-booking-form">
          <Form.Item name="clientName" label="Имя" rules={[{ required: true, message: 'Укажите имя' }]}>
            <Input size="large" placeholder="Ваше имя" />
          </Form.Item>
          <Form.Item name="clientPhone" label="Телефон" rules={[{ required: true, message: 'Укажите телефон' }]}>
            <Input size="large" placeholder="+996 ..." />
          </Form.Item>
          <Form.Item name="clientEmail" label="Email">
            <Input size="large" placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} placeholder="Например: нужен трансфер, поздний заезд, дети..." />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
};

export default StayDetailPage;
