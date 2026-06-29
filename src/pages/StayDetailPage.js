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
  Image,
  Modal,
  Rate,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  InboxOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import CompanyBadge from '../components/CompanyBadge';
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
const PAYMENT_QR_URL = process.env.REACT_APP_PAYMENT_QR_URL || '/images/payment-qr.png';

const MONTH_NAMES = [
  'РЇРЅРІР°СЂСЊ',
  'Р¤РµРІСЂР°Р»СЊ',
  'РњР°СЂС‚',
  'РђРїСЂРµР»СЊ',
  'РњР°Р№',
  'РСЋРЅСЊ',
  'РСЋР»СЊ',
  'РђРІРіСѓСЃС‚',
  'РЎРµРЅС‚СЏР±СЂСЊ',
  'РћРєС‚СЏР±СЂСЊ',
  'РќРѕСЏР±СЂСЊ',
  'Р”РµРєР°Р±СЂСЊ',
];

const WEEKDAY_SHORT = ['Р’СЃ', 'РџРЅ', 'Р’С‚', 'РЎСЂ', 'Р§С‚', 'РџС‚', 'РЎР±'];
const CHECK_IN_TIMES = ['14:00', '16:00', '18:00'];
const SLOT_DURATION_MINUTES = 120;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const timeToMinutes = (value) => {
  const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return (Number(match[1]) * 60) + Number(match[2]);
};

const addMinutesToTime = (value, minutes) => {
  const total = timeToMinutes(value) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const isSameDateKey = (value, dateKey) => {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateKey;
};

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
      label: isSameDay(date, today) ? 'РЎРµРіРѕРґРЅСЏ' : index === 1 && isSameDay(addDays(today, 1), date) ? 'Р—Р°РІС‚СЂР°' : WEEKDAY_SHORT[date.getDay()],
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
  const [stayBookings, setStayBookings] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [receiptFiles, setReceiptFiles] = useState([]);
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
  const bookedTimeSet = useMemo(() => {
    const total = Math.max(Number(stay?.availableCount || stay?.totalCount || 1), 1);
    const counts = new Map();

    stayBookings
      .filter((booking) => !['cancelled', 'rejected'].includes(booking.status))
      .filter((booking) => isSameDateKey(booking.checkInDate, selectedDateKey))
      .forEach((booking) => {
        const bookingStart = timeToMinutes(booking.startTime || booking.checkInTime || '14:00');
        const bookingEnd = timeToMinutes(booking.endTime || addMinutesToTime(booking.startTime || booking.checkInTime || '14:00', SLOT_DURATION_MINUTES));
        CHECK_IN_TIMES.forEach((time) => {
          const slotStart = timeToMinutes(time);
          const slotEnd = slotStart + SLOT_DURATION_MINUTES;
          if (Math.max(bookingStart, slotStart) < Math.min(bookingEnd, slotEnd)) {
            counts.set(time, (counts.get(time) || 0) + 1);
          }
        });
      });

    return new Set(Array.from(counts.entries()).filter(([, count]) => count >= total).map(([time]) => time));
  }, [selectedDateKey, stay?.availableCount, stay?.totalCount, stayBookings]);

  useEffect(() => {
    if (bookedTimeSet.has(selectedTime)) {
      const nextTime = CHECK_IN_TIMES.find((time) => !bookedTimeSet.has(time));
      if (nextTime) setSelectedTime(nextTime);
    }
  }, [bookedTimeSet, selectedTime]);

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
        const [availabilityResponse, bookingsResponse] = await Promise.all([
          api.get('/stay-bookings/availability', {
            params: { stayId: stay.id, month: availabilityMonthKey },
          }),
          api.get('/stay-bookings', {
            params: { stayId: stay.id },
          }),
        ]);
        setAvailabilityRecords(Array.isArray(availabilityResponse.data) ? availabilityResponse.data : []);
        setStayBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
      } catch (error) {
        setAvailabilityRecords([]);
        setStayBookings([]);
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
        <Empty description="Р”РѕРјРёРє РЅРµ РЅР°Р№РґРµРЅ">
          <Button type="primary" onClick={() => navigate('/stays')}>Р’РµСЂРЅСѓС‚СЊСЃСЏ РІ РєР°С‚Р°Р»РѕРі</Button>
        </Empty>
      </main>
    );
  }

  const totalPreview = stay.pricePerNight * nights;
  const selectedDateLabel = selectedAvailability
    ? selectedAvailability.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'РІС‹Р±РµСЂРёС‚Рµ РґР°С‚Сѓ';
  const checkOutDate = selectedAvailability ? addDays(selectedAvailability.date, nights) : null;
  const checkOutLabel = checkOutDate
    ? checkOutDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'РІС‹Р±РµСЂРёС‚Рµ РґР°С‚Сѓ';

  const openBookingModal = () => {
    if (bookedTimeSet.has(selectedTime)) {
      message.warning('Р­С‚Рѕ РІСЂРµРјСЏ СѓР¶Рµ Р·Р°РЅСЏС‚Рѕ. Р’С‹Р±РµСЂРёС‚Рµ СЃРІРѕР±РѕРґРЅС‹Р№ СЃР»РѕС‚.');
      return;
    }

    bookingForm.setFieldsValue({
      clientName: currentUser?.name || '',
      clientPhone: currentUser?.phone || '',
      clientEmail: currentUser?.email || '',
      comment: '',
    });
    setBookingOpen(true);
  };

  const handleReceiptChange = ({ fileList }) => {
    const nextFiles = fileList.slice(-1);
    const file = nextFiles[0]?.originFileObj || nextFiles[0];

    if (file && !['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
      message.error('РџРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ С‚РѕР»СЊРєРѕ JPG, PNG Рё PDF.');
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      message.error('РњР°РєСЃРёРјР°Р»СЊРЅС‹Р№ СЂР°Р·РјРµСЂ С„Р°Р№Р»Р° вЂ” 5 MB.');
      return;
    }

    setReceiptFiles(nextFiles);
  };

  const submitStayBooking = async () => {
    if (!selectedAvailability?.available) {
      message.warning('РќР° РІС‹Р±СЂР°РЅРЅСѓСЋ РґР°С‚Сѓ СЃРІРѕР±РѕРґРЅС‹С… РґРѕРјРёРєРѕРІ РЅРµС‚.');
      return;
    }

    if (bookedTimeSet.has(selectedTime)) {
      message.error('Р­С‚Рѕ РІСЂРµРјСЏ СѓР¶Рµ Р·Р°РЅСЏС‚Рѕ. Р’С‹Р±РµСЂРёС‚Рµ РґСЂСѓРіРѕР№ СЃР»РѕС‚.');
      return;
    }

    const uploadFile = receiptFiles[0]?.originFileObj || receiptFiles[0];
    if (!uploadFile) {
      message.error('Р—Р°РіСЂСѓР·РёС‚Рµ С‡РµРє РїСЂРµРґРѕРїР»Р°С‚С‹.');
      return;
    }

    try {
      const values = await bookingForm.validateFields();
      setBookingSubmitting(true);
      const paymentReceiptUrl = await fileToDataUrl(uploadFile);
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
        startTime: selectedTime,
        endTime: addMinutesToTime(selectedTime, SLOT_DURATION_MINUTES),
        amount: totalPreview,
        status: 'payment_review',
        paymentStatus: 'review',
        paymentReceiptUrl,
        paymentReceiptName: uploadFile.name,
        paymentReceiptType: uploadFile.type,
        prepaymentRequired: true,
      });
      setBookingOpen(false);
      setReceiptFiles([]);
      message.success('Р—Р°СЏРІРєР° РѕС‚РїСЂР°РІР»РµРЅР°. РљРѕРјРїР°РЅРёСЏ РїРѕРґС‚РІРµСЂРґРёС‚ Р±СЂРѕРЅСЊ РІ TravelPay Business.');
      const [availabilityResponse, bookingsResponse] = await Promise.all([
        api.get('/stay-bookings/availability', {
          params: { stayId: stay.id, month: availabilityMonthKey },
        }),
        api.get('/stay-bookings', {
          params: { stayId: stay.id },
        }),
      ]);
      setAvailabilityRecords(Array.isArray(availabilityResponse.data) ? availabilityResponse.data : []);
      setStayBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
    } catch (error) {
      const fallback = error?.response?.status === 409
        ? 'РќР° РІС‹Р±СЂР°РЅРЅС‹Рµ РґР°С‚С‹ СЃРІРѕР±РѕРґРЅС‹С… РґРѕРјРёРєРѕРІ СѓР¶Рµ РЅРµС‚.'
        : 'РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РїСЂР°РІРёС‚СЊ Р·Р°СЏРІРєСѓ. РџСЂРѕРІРµСЂСЊС‚Рµ РґР°РЅРЅС‹Рµ Рё РїРѕРїСЂРѕР±СѓР№С‚Рµ РµС‰С‘ СЂР°Р·.';
      message.error(error?.response?.data?.message || fallback);
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <main className="stay-detail-page">
      <section className="stay-detail-hero">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stays')}>
          РќР°Р·Р°Рґ Рє РґРѕРјРёРєР°Рј
        </Button>
        <Tag className="stays-kicker"><HomeOutlined /> {getStayTypeLabel(stay.type)}</Tag>
        <Title>{stay.title}</Title>
        <Space wrap size={12}>
          <Tag><EnvironmentOutlined /> {stay.location}</Tag>
          <CompanyBadge companyName={stay.companyName} companyLogo={stay.companyLogo} companyCity={stay.companyCity} companyVerified={stay.companyVerified} variant="plain" />
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
          <Text>РЎС‚РѕРёРјРѕСЃС‚СЊ</Text>
          <Title level={2}>{formatStayPrice(stay.pricePerNight)}</Title>
          <Paragraph>Р·Р° РЅРѕС‡СЊ, Р±РµР· СЃРєСЂС‹С‚С‹С… РїР»Р°С‚РµР¶РµР№</Paragraph>
          <Divider />
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <div className="stay-availability">
              <div className="stay-availability__head">
                <div>
                  <Text>РЎРІРѕР±РѕРґРЅС‹Рµ РґР°С‚С‹</Text>
                  <strong>{MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</strong>
                  {availabilityLoading && <Text type="secondary">РћР±РЅРѕРІР»СЏРµРј Р·Р°РЅСЏС‚РѕСЃС‚СЊ...</Text>}
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
                      <small>{day.available ? `${day.left} СЃРІРѕР±РѕРґРЅРѕ` : 'Р·Р°РЅСЏС‚Рѕ'}</small>
                    </button>
                  );
                })}
              </div>
              <div className="stay-availability__times">
                <Text><ClockCircleOutlined /> Р’СЂРµРјСЏ Р·Р°РµР·РґР°</Text>
                <div>
                  {CHECK_IN_TIMES.map((time) => {
                    const isBooked = bookedTimeSet.has(time);
                    return (
                      <button
                        type="button"
                        key={time}
                        className={`stay-time-pill ${selectedTime === time ? 'stay-time-pill--selected' : ''} ${isBooked ? 'stay-time-pill--disabled' : ''}`}
                        disabled={isBooked}
                        onClick={() => {
                          if (!isBooked) setSelectedTime(time);
                        }}
                      >
                        <span>{time}</span>
                        {isBooked && <small>Р—Р°РЅСЏС‚Рѕ</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div>
              <Text>Р“РѕСЃС‚Рё</Text>
              <InputNumber min={1} max={stay.capacity} value={guests} onChange={setGuests} style={{ width: '100%', marginTop: 8 }} size={isMobile ? 'middle' : 'large'} />
            </div>
            <div>
              <Text>РќРѕС‡РµР№</Text>
              <InputNumber min={1} max={30} value={nights} onChange={(value) => setNights(Number(value) || 1)} style={{ width: '100%', marginTop: 8 }} size={isMobile ? 'middle' : 'large'} />
            </div>
            <div className="stay-booking-total">
              <span>{selectedDateLabel} - {checkOutLabel} В· {selectedTime}</span>
              <strong>{formatStayPrice(totalPreview)}</strong>
            </div>
            <Button type="primary" size="large" block disabled={!selectedAvailability?.available} onClick={openBookingModal}>
              Р—Р°Р±СЂРѕРЅРёСЂРѕРІР°С‚СЊ
            </Button>
          </Space>
        </Card>
      </section>

      <section className="stay-detail-content">
        <Row gutter={[22, 22]}>
          <Col xs={24} lg={15}>
            <Card className="stay-info-card">
              <Title level={3}>Рћ РґРѕРјРёРєРµ</Title>
              <Paragraph>{stay.description}</Paragraph>
              <div className="stay-info-grid">
                <div><TeamOutlined /><strong>{stay.capacity}</strong><span>РіРѕСЃС‚РµР№</span></div>
                <div><HomeOutlined /><strong>{stay.rooms}</strong><span>РєРѕРјРЅР°С‚С‹</span></div>
                <div><CalendarOutlined /><strong>{stay.availableCount}</strong><span>СЃРІРѕР±РѕРґРЅРѕ</span></div>
                <div><SafetyCertificateOutlined /><strong>РџСЂРѕРІРµСЂРµРЅРѕ</strong><span>TravelPay</span></div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <Card className="stay-info-card">
              <Title level={4}>РЈРґРѕР±СЃС‚РІР°</Title>
              <div className="stay-amenity-list">
                {stay.amenities.map((amenity) => (
                  <span key={amenity}><CheckCircleOutlined /> {amenity}</span>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24}>
            <Card className="stay-info-card">
              <Title level={4}>РџСЂР°РІРёР»Р° РїСЂРѕР¶РёРІР°РЅРёСЏ</Title>
              <Paragraph>{stay.rules}</Paragraph>
              <Text type="secondary">РђРґСЂРµСЃ: {stay.address}</Text>
            </Card>
          </Col>
        </Row>
      </section>

      <Modal
        open={bookingOpen}
        title="Р—Р°СЏРІРєР° РЅР° Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµ"
        okText="РћС‚РїСЂР°РІРёС‚СЊ Р·Р°СЏРІРєСѓ"
        cancelText="РћС‚РјРµРЅР°"
        confirmLoading={bookingSubmitting}
        onCancel={() => setBookingOpen(false)}
        onOk={submitStayBooking}
      >
        <Paragraph>РћСЃС‚Р°РІСЊС‚Рµ РєРѕРЅС‚Р°РєС‚С‹, Рё РєРѕРјРїР°РЅРёСЏ РїРѕРґС‚РІРµСЂРґРёС‚ Р±СЂРѕРЅСЊ РІ Business-РїР°РЅРµР»Рё.</Paragraph>
        <Card size="small">
          <strong>{stay.title}</strong>
          <p>{selectedDateLabel} - {checkOutLabel}, {selectedTime} В· {guests} РіРѕСЃС‚РµР№ В· {formatStayPrice(totalPreview)}</p>
        </Card>
        <Card size="small" className="stay-prepay-card">
          <Space align="start" size={16} className="stay-prepay-card__inner">
            <Image width={118} height={118} src={PAYMENT_QR_URL} alt="QR РґР»СЏ РїСЂРµРґРѕРїР»Р°С‚С‹" preview={false} className="stay-prepay-card__qr" />
            <div>
              <Tag color="gold">РџСЂРµРґРѕРїР»Р°С‚Р°</Tag>
              <Paragraph>
                РћС‚СЃРєР°РЅРёСЂСѓР№С‚Рµ QR-РєРѕРґ Рё РІРЅРµСЃРёС‚Рµ РїСЂРµРґРѕРїР»Р°С‚Сѓ. РџРѕСЃР»Рµ РѕРїР»Р°С‚С‹ Р·Р°РіСЂСѓР·РёС‚Рµ С‡РµРє,
                С‡С‚РѕР±С‹ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂ РїРѕРґС‚РІРµСЂРґРёР» Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµ.
              </Paragraph>
            </div>
          </Space>
          <Upload.Dragger
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            maxCount={1}
            fileList={receiptFiles}
            beforeUpload={() => false}
            onChange={handleReceiptChange}
            className="stay-receipt-upload"
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Р—Р°РіСЂСѓР·РёС‚Рµ С‡РµРє РѕРїР»Р°С‚С‹</p>
            <p className="ant-upload-hint">JPG, PNG РёР»Рё PDF РґРѕ 5 MB</p>
          </Upload.Dragger>
        </Card>
        <Form form={bookingForm} layout="vertical" className="stay-booking-form">
          <Form.Item name="clientName" label="РРјСЏ" rules={[{ required: true, message: 'РЈРєР°Р¶РёС‚Рµ РёРјСЏ' }]}>
            <Input size="large" placeholder="Р’Р°С€Рµ РёРјСЏ" />
          </Form.Item>
          <Form.Item name="clientPhone" label="РўРµР»РµС„РѕРЅ" rules={[{ required: true, message: 'РЈРєР°Р¶РёС‚Рµ С‚РµР»РµС„РѕРЅ' }]}>
            <Input size="large" placeholder="+996 ..." />
          </Form.Item>
          <Form.Item name="clientEmail" label="Email">
            <Input size="large" placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="comment" label="РљРѕРјРјРµРЅС‚Р°СЂРёР№">
            <Input.TextArea rows={3} placeholder="РќР°РїСЂРёРјРµСЂ: РЅСѓР¶РµРЅ С‚СЂР°РЅСЃС„РµСЂ, РїРѕР·РґРЅРёР№ Р·Р°РµР·Рґ, РґРµС‚Рё..." />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
};

export default StayDetailPage;
