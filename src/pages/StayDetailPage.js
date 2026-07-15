import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Checkbox,
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
  Select,
  Skeleton,
  Space,
  Statistic,
  Steps,
  Tag,
  Tooltip,
  Typography,
  Upload,
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
  InfoCircleOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import CompanyBadge from '../components/CompanyBadge';
import PaymentTopUpModal from '../components/payments/PaymentTopUpModal';
import {
  fallbackStays,
  formatStayPrice,
  getStayTypeLabel,
  normalizeStay,
  withStayFallback,
} from '../utils/stays';
import { readCurrentUser } from '../utils/currentUser';
import { syncCurrentUser } from '../utils/user';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;
const PAYMENT_QR_URL = process.env.REACT_APP_PAYMENT_QR_URL || '/images/payment-qr.png';
const BOOKING_STEPS = ['Даты', 'Гости', 'Услуги', 'Предоплата', 'Подтверждение'];

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

const buildDefaultExtrasSelection = (services = []) => services.reduce((acc, service) => {
  if (service.type === 'quantity') {
    acc[service.id] = { quantity: 0 };
  } else if (service.type === 'select') {
    acc[service.id] = { selectedOptionId: '' };
  } else {
    acc[service.id] = { selected: false };
  }
  return acc;
}, {});

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
  const { message } = App.useApp();
  const isMobile = !screens.md;
  const today = useMemo(() => startOfDay(new Date()), []);
  const currentUser = readCurrentUser();
  const [bookingForm] = Form.useForm();
  const [bookingContactPreview, setBookingContactPreview] = useState({});
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [stays, setStays] = useState([]);
  const [availabilityRecords, setAvailabilityRecords] = useState([]);
  const [stayBookings, setStayBookings] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(0);
  const [receiptFiles, setReceiptFiles] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [requiredTopUpAmount, setRequiredTopUpAmount] = useState(0);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(2);
  const [selectedExtras, setSelectedExtras] = useState({});
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

  useEffect(() => {
    if (!currentUser?.id) return undefined;

    let active = true;
    api.get('/wallet/me')
      .then((response) => {
        if (!active) return;
        setWallet(response.data.wallet);
        if (response.data.user) {
          syncCurrentUser({ ...response.data.user, isLoggedIn: true });
        }
      })
      .catch(() => {
        if (active) {
          setWallet(null);
        }
      });

    return () => { active = false; };
  }, [currentUser?.id]);

  const stay = useMemo(() => stays.find((item) => String(item.id) === String(id)), [id, stays]);
  const activeExtraServices = useMemo(
    () => (Array.isArray(stay?.extraServices) ? stay.extraServices.filter((service) => service.active !== false) : []),
    [stay],
  );
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
    setSelectedExtras(buildDefaultExtrasSelection(activeExtraServices));
  }, [activeExtraServices]);

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
        <Empty description="Домик не найден">
          <Button type="primary" onClick={() => navigate('/stays')}>Вернуться в каталог</Button>
        </Empty>
      </main>
    );
  }

  const baseTotal = stay.pricePerNight * nights;
  const extrasSummary = activeExtraServices.map((service) => {
    const selection = selectedExtras[service.id] || {};
    if (service.type === 'quantity') {
      const quantity = Math.min(Math.max(Number(selection.quantity) || 0, 0), Math.max(Number(service.maxQuantity) || 1, 1));
      return {
        serviceId: service.id,
        title: service.title,
        quantity,
        unitPrice: Number(service.price || 0),
        total: quantity * Number(service.price || 0),
        meta: quantity > 0 ? `${quantity} ${service.unitLabel || 'шт.'}` : '',
        selectedOptionId: '',
      };
    }

    if (service.type === 'select') {
      const option = (service.options || []).find((item) => String(item.id) === String(selection.selectedOptionId));
      return {
        serviceId: service.id,
        title: service.title,
        quantity: option ? 1 : 0,
        unitPrice: Number(option?.price || 0),
        total: Number(option?.price || 0),
        meta: option?.label || '',
        selectedOptionId: option?.id || '',
      };
    }

    const selected = Boolean(selection.selected);
    return {
      serviceId: service.id,
      title: service.title,
      quantity: selected ? 1 : 0,
      unitPrice: Number(service.price || 0),
      total: selected ? Number(service.price || 0) : 0,
      meta: selected ? 'Добавлено' : '',
      selectedOptionId: '',
    };
  }).filter((item) => item.quantity > 0 || item.total > 0);
  const extrasTotal = extrasSummary.reduce((sum, item) => sum + item.total, 0);
  const totalPreview = baseTotal + extrasTotal;
  const prepaymentPercent = 100;
  const prepaymentAmount = totalPreview;
  const walletAvailable = Number(wallet?.availableBalance ?? currentUser?.savings?.currentAmount ?? 0);
  const canPayFromWallet = walletAvailable >= totalPreview;
  const shortageAmount = Math.max(totalPreview - walletAvailable, 0);
  const selectedDateLabel = selectedAvailability
    ? selectedAvailability.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'выберите дату';
  const checkOutDate = selectedAvailability ? addDays(selectedAvailability.date, nights) : null;
  const checkOutLabel = checkOutDate
    ? checkOutDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
    : 'выберите дату';

  const openBookingModal = () => {
    if (bookedTimeSet.has(selectedTime)) {
      message.warning('Это время уже занято. Выберите свободный слот.');
      return;
    }

    bookingForm.setFieldsValue({
      clientName: currentUser?.name || '',
      clientPhone: currentUser?.phone || '',
      clientEmail: currentUser?.email || '',
      comment: '',
    });
    setBookingContactPreview({
      clientName: currentUser?.name || '',
      clientPhone: currentUser?.phone || '',
      clientEmail: currentUser?.email || '',
      comment: '',
    });
    setBookingStep(0);
    setBookingOpen(true);
  };

  const closeBookingModal = () => {
    setBookingOpen(false);
    setBookingStep(0);
    setBookingContactPreview({});
  };

  const handleReceiptChange = ({ fileList }) => {
    const nextFiles = fileList.slice(-1);
    const file = nextFiles[0]?.originFileObj || nextFiles[0];

    if (file && !['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)) {
      message.error('Поддерживаются только JPG, PNG и PDF.');
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      message.error('Максимальный размер файла — 5 MB.');
      return;
    }

    setReceiptFiles(nextFiles);
  };

  // eslint-disable-next-line no-unused-vars
  const submitLegacyStayBooking = async () => {
    if (!selectedAvailability?.available) {
      message.warning('На выбранную дату свободных домиков нет.');
      return;
    }

    if (bookedTimeSet.has(selectedTime)) {
      message.error('Это время уже занято. Выберите другой слот.');
      return;
    }

    const uploadFile = receiptFiles[0]?.originFileObj || receiptFiles[0];
    if (!uploadFile) {
      message.error('Загрузите чек предоплаты.');
      return;
    }

    try {
      const values = await bookingForm.validateFields();
      const safeValues = {
        clientName: values.clientName || bookingContactPreview.clientName || '',
        clientPhone: values.clientPhone || bookingContactPreview.clientPhone || '',
        clientEmail: values.clientEmail || bookingContactPreview.clientEmail || '',
        comment: values.comment || bookingContactPreview.comment || '',
      };
      setBookingSubmitting(true);
      const paymentReceiptUrl = await fileToDataUrl(uploadFile);
      await api.post('/stay-bookings', {
        stayId: stay.id,
        companyId: stay.companyId,
        companyName: stay.companyName,
        stayTitle: stay.title,
        location: stay.location,
        clientName: safeValues.clientName,
        clientPhone: safeValues.clientPhone,
        clientEmail: safeValues.clientEmail,
        comment: safeValues.comment,
        guests,
        nights,
        extras: extrasSummary.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          selected: item.quantity > 0,
          selectedOptionId: item.selectedOptionId,
        })),
        checkInDate: selectedAvailability.date.toISOString(),
        checkOutDate: checkOutDate?.toISOString(),
        checkInTime: selectedTime,
        startTime: selectedTime,
        endTime: addMinutesToTime(selectedTime, SLOT_DURATION_MINUTES),
        amount: totalPreview,
        baseAmount: baseTotal,
        extrasAmount: extrasTotal,
        prepaymentPercent,
        prepaymentAmount,
        status: 'payment_review',
        paymentStatus: 'review',
        paymentReceiptUrl,
        paymentReceiptName: uploadFile.name,
        paymentReceiptType: uploadFile.type,
        prepaymentRequired: true,
      });
      closeBookingModal();
      message.success('Заявка отправлена. Компания подтвердит бронь в TravelPay Business.');
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
        ? 'На выбранные даты свободных домиков уже нет.'
        : 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.';
      message.error(error?.response?.data?.message || fallback);
    } finally {
      setBookingSubmitting(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const goToNextBookingStepLegacy = async () => {
    if (bookingStep === 0) {
      if (!selectedAvailability?.available) {
        message.warning('Выберите доступную дату.');
        return;
      }
      if (bookedTimeSet.has(selectedTime)) {
        message.warning('Этот слот уже занят. Выберите другое время.');
        return;
      }
    }

    if (bookingStep === 3) {
      const uploadFile = receiptFiles[0]?.originFileObj || receiptFiles[0];
      if (!uploadFile) {
        message.error('Загрузите чек предоплаты.');
        return;
      }
      try {
        await bookingForm.validateFields();
      } catch (error) {
        return;
      }
    }

    setBookingStep((current) => Math.min(current + 1, BOOKING_STEPS.length - 1));
  };

  const submitStayBooking = async () => {
    if (!selectedAvailability?.available) {
      message.warning('На выбранную дату свободных домиков нет.');
      return;
    }

    if (bookedTimeSet.has(selectedTime)) {
      message.error('Это время уже занято. Выберите другой слот.');
      return;
    }

    if (!currentUser?.id) {
      navigate('/login');
      return;
    }

    if (!canPayFromWallet) {
      setRequiredTopUpAmount(shortageAmount || totalPreview);
      setTopUpModalOpen(true);
      message.error('Недостаточно средств. Пополните накопительный баланс.');
      return;
    }

    try {
      const values = await bookingForm.validateFields();
      const safeValues = {
        clientName: values.clientName || bookingContactPreview.clientName || '',
        clientPhone: values.clientPhone || bookingContactPreview.clientPhone || '',
        clientEmail: values.clientEmail || bookingContactPreview.clientEmail || '',
        comment: values.comment || bookingContactPreview.comment || '',
      };

      setBookingSubmitting(true);
      const response = await api.post('/stay-bookings', {
        stayId: stay.id,
        companyId: stay.companyId,
        companyName: stay.companyName,
        stayTitle: stay.title,
        location: stay.location,
        clientName: safeValues.clientName,
        clientPhone: safeValues.clientPhone,
        clientEmail: safeValues.clientEmail,
        comment: safeValues.comment,
        guests,
        nights,
        extras: extrasSummary.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          selected: item.quantity > 0,
          selectedOptionId: item.selectedOptionId,
        })),
        checkInDate: selectedAvailability.date.toISOString(),
        checkOutDate: checkOutDate?.toISOString(),
        checkInTime: selectedTime,
        startTime: selectedTime,
        endTime: addMinutesToTime(selectedTime, SLOT_DURATION_MINUTES),
        amount: totalPreview,
        baseAmount: baseTotal,
        extrasAmount: extrasTotal,
        paymentMethod: 'wallet',
        prepaymentPercent: 100,
        prepaymentAmount: totalPreview,
        prepaymentRequired: false,
      });

      if (response.data?.user) {
        syncCurrentUser({ ...response.data.user, isLoggedIn: true });
      }

      closeBookingModal();
      message.success('Бронь создана. Средства зарезервированы на накопительном балансе.');

      const [availabilityResponse, bookingsResponse, walletResponse] = await Promise.all([
        api.get('/stay-bookings/availability', {
          params: { stayId: stay.id, month: availabilityMonthKey },
        }),
        api.get('/stay-bookings', {
          params: { stayId: stay.id },
        }),
        api.get('/wallet/me').catch(() => ({ data: null })),
      ]);

      setAvailabilityRecords(Array.isArray(availabilityResponse.data) ? availabilityResponse.data : []);
      setStayBookings(Array.isArray(bookingsResponse.data) ? bookingsResponse.data : []);
      if (walletResponse.data?.wallet) {
        setWallet(walletResponse.data.wallet);
      }
    } catch (error) {
      if (error?.response?.data?.code === 'INSUFFICIENT_WALLET_FUNDS') {
        setRequiredTopUpAmount(Number(error.response.data.shortage || shortageAmount || totalPreview));
        setTopUpModalOpen(true);
        message.error('Недостаточно средств. Пополните накопительный баланс.');
        return;
      }

      const fallback = error?.response?.status === 409
        ? 'На выбранные даты свободных домиков уже нет.'
        : 'Не удалось создать бронь. Проверьте данные и попробуйте еще раз.';
      message.error(error?.response?.data?.message || fallback);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const goToNextBookingStep = async () => {
    if (bookingStep === 0) {
      if (!selectedAvailability?.available) {
        message.warning('Выберите доступную дату.');
        return;
      }
      if (bookedTimeSet.has(selectedTime)) {
        message.warning('Этот слот уже занят. Выберите другое время.');
        return;
      }
    }

    if (bookingStep === 3) {
      if (!currentUser?.id) {
        navigate('/login');
        return;
      }

      try {
        await bookingForm.validateFields();
      } catch (error) {
        return;
      }

      if (!canPayFromWallet) {
        setRequiredTopUpAmount(shortageAmount || totalPreview);
        setTopUpModalOpen(true);
        message.error('Недостаточно средств. Пополните накопительный баланс.');
        return;
      }
    }

    setBookingStep((current) => Math.min(current + 1, BOOKING_STEPS.length - 1));
  };

  const goToPreviousBookingStep = () => {
    setBookingStep((current) => Math.max(current - 1, 0));
  };

  const bookingStepItems = BOOKING_STEPS.map((title) => ({ title }));
  const bookingStepContent = [
    (
      <div className="stay-booking-wizard__stack">
        <Card className="stay-booking-step-card" variant="borderless">
          <Badge color="#2b7bb9" text="Шаг 1" />
          <Title level={4}>Выберите дату и время заезда</Title>
          <Paragraph>
            Доступные слоты подтягиваются из календаря компании. Занятые варианты сразу скрыты из бронирования.
          </Paragraph>
          <div className="stay-booking-step-grid">
            <div>
              <Text type="secondary">Заезд</Text>
              <div className="stay-booking-step-stat">{selectedDateLabel}</div>
            </div>
            <div>
              <Text type="secondary">Выезд</Text>
              <div className="stay-booking-step-stat">{checkOutLabel}</div>
            </div>
            <div>
              <Text type="secondary">Время</Text>
              <div className="stay-booking-step-stat">{selectedTime}</div>
            </div>
          </div>
        </Card>
      </div>
    ),
    (
      <div className="stay-booking-wizard__stack">
        <Card className="stay-booking-step-card" variant="borderless">
          <Badge color="#7c5cff" text="Шаг 2" />
          <Title level={4}>Укажите состав поездки</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card size="small" className="stay-booking-metric-card">
                <Statistic title="Количество гостей" value={guests} suffix={`из ${stay.capacity}`} />
                <InputNumber min={1} max={stay.capacity} value={guests} onChange={setGuests} size="large" style={{ width: '100%', marginTop: 12 }} />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" className="stay-booking-metric-card">
                <Statistic title="Количество ночей" value={nights} suffix="ночей" />
                <InputNumber min={1} max={30} value={nights} onChange={(value) => setNights(Number(value) || 1)} size="large" style={{ width: '100%', marginTop: 12 }} />
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    ),
    (
      <div className="stay-booking-wizard__stack">
        <Card className="stay-booking-step-card" variant="borderless">
          <Badge color="#14b8a6" text="Шаг 3" />
          <Title level={4}>Добавьте дополнительные услуги</Title>
          <Paragraph>Компания сама настроила доступные опции для этого домика. Можно оставить только проживание.</Paragraph>
          {activeExtraServices.length ? (
            <div className="stay-extra-services__list">
              {activeExtraServices.map((service) => {
                const selection = selectedExtras[service.id] || {};
                return (
                  <Card key={`wizard-${service.id}`} size="small" className="stay-extra-service-card">
                    <div className="stay-extra-service-card__top">
                      <div>
                        <strong>{service.title}</strong>
                        {service.description ? <p>{service.description}</p> : null}
                      </div>
                      <span>{formatStayPrice(service.price)}</span>
                    </div>
                    {service.type === 'quantity' && (
                      <InputNumber
                        min={0}
                        max={Math.max(Number(service.maxQuantity) || 1, 1)}
                        value={selection.quantity || 0}
                        onChange={(value) => setSelectedExtras((current) => ({
                          ...current,
                          [service.id]: { quantity: Number(value) || 0 },
                        }))}
                        style={{ width: '100%' }}
                        addonAfter={service.unitLabel || 'шт.'}
                      />
                    )}
                    {service.type === 'select' && (
                      <Select
                        allowClear
                        placeholder="Выберите вариант"
                        value={selection.selectedOptionId || undefined}
                        onChange={(value) => setSelectedExtras((current) => ({
                          ...current,
                          [service.id]: { selectedOptionId: value || '' },
                        }))}
                        options={(service.options || []).map((option) => ({
                          value: option.id,
                          label: `${option.label} — ${formatStayPrice(option.price)}`,
                        }))}
                      />
                    )}
                    {service.type === 'toggle' && (
                      <Checkbox
                        checked={Boolean(selection.selected)}
                        onChange={(event) => setSelectedExtras((current) => ({
                          ...current,
                          [service.id]: { selected: event.target.checked },
                        }))}
                      >
                        Добавить к бронированию
                      </Checkbox>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Empty description="Для этого домика пока не добавлены дополнительные услуги." />
          )}
        </Card>
      </div>
    ),
    (
      <div className="stay-booking-wizard__stack">
        <Card className="stay-booking-step-card stay-prepay-card" variant="borderless">
          <div className="stay-booking-prepay-head">
            <div>
              <Badge color="#f59e0b" text="Шаг 4" />
              <Title level={4}>Предоплата и контакты</Title>
              <Paragraph>Для подтверждения бронирования внесите предоплату и загрузите чек.</Paragraph>
            </div>
            <Tooltip title="Процент предоплаты настраивается компанией для этого домика.">
              <Tag color="gold" icon={<InfoCircleOutlined />}>{prepaymentPercent}% предоплата</Tag>
            </Tooltip>
          </div>
          <Alert
            showIcon
            type={canPayFromWallet ? 'success' : 'warning'}
            message={canPayFromWallet ? 'Накопительного баланса хватает для бронирования' : 'Недостаточно средств на накопительном балансе'}
            description={canPayFromWallet
              ? 'После подтверждения TravelPay зарезервирует сумму бронирования до решения компании.'
              : 'Пополните баланс по QR или через менеджера, затем вернитесь к бронированию.'}
            style={{ marginBottom: 16 }}
          />
          <div className="stay-booking-summary stay-booking-summary--panel" style={{ marginBottom: 16 }}>
            <div><span>Доступно</span><strong>{formatStayPrice(walletAvailable)}</strong></div>
            <div><span>Стоимость брони</span><strong>{formatStayPrice(totalPreview)}</strong></div>
            <div><span>Необходимо пополнить</span><strong>{formatStayPrice(shortageAmount)}</strong></div>
          </div>
          {!canPayFromWallet && (
            <Button
              type="primary"
              onClick={() => {
                setRequiredTopUpAmount(shortageAmount || totalPreview);
                setTopUpModalOpen(true);
              }}
              style={{ marginBottom: 16 }}
            >
              Пополнить баланс
            </Button>
          )}
          {false && (
          <>
          <Space align={isMobile ? 'start' : 'center'} size={16} orientation={isMobile ? 'vertical' : 'horizontal'} className="stay-prepay-card__inner">
            <Image width={118} height={118} src={PAYMENT_QR_URL} alt="QR для предоплаты" preview={false} className="stay-prepay-card__qr" />
            <div className="stay-prepay-card__copy">
              <Statistic title="Минимальная сумма к оплате" value={prepaymentAmount} suffix="сом" />
              <Paragraph>После загрузки чека заявка уйдет компании на проверку и подтверждение.</Paragraph>
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
            <p className="ant-upload-text">Загрузите чек оплаты</p>
            <p className="ant-upload-hint">JPG, PNG или PDF до 5 MB</p>
          </Upload.Dragger>
          </>
          )}
          <div className="stay-booking-form">
            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item name="clientName" label="Имя" rules={[{ required: true, message: 'Укажите имя' }]}>
                  <Input size="large" placeholder="Ваше имя" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="clientPhone" label="Телефон" rules={[{ required: true, message: 'Укажите телефон' }]}>
                  <Input size="large" placeholder="+996 ..." />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="clientEmail" label="Email">
              <Input size="large" placeholder="email@example.com" />
            </Form.Item>
            <Form.Item name="comment" label="Комментарий">
              <Input.TextArea rows={3} placeholder="Например: нужен трансфер, поздний заезд, дети..." />
            </Form.Item>
          </div>
        </Card>
      </div>
    ),
    (
      <div className="stay-booking-wizard__stack">
        <Card className="stay-booking-step-card" variant="borderless">
          <Badge color="#22c55e" text="Шаг 5" />
          <Title level={4}>Подтверждение бронирования</Title>
          <Paragraph>Проверьте детали перед отправкой заявки в TravelPay Business.</Paragraph>
          <div className="stay-booking-summary stay-booking-summary--panel">
            <div><span>Домик</span><strong>{stay.title}</strong></div>
            <div><span>Компания</span><strong>{stay.companyName}</strong></div>
            <div><span>Даты</span><strong>{selectedDateLabel} - {checkOutLabel}</strong></div>
            <div><span>Время</span><strong>{selectedTime} - {addMinutesToTime(selectedTime, SLOT_DURATION_MINUTES)}</strong></div>
            <div><span>Гости</span><strong>{guests}</strong></div>
            <div><span>Контакт</span><strong>{bookingContactPreview.clientName || '—'}</strong></div>
            <div><span>Телефон</span><strong>{bookingContactPreview.clientPhone || '—'}</strong></div>
            <Divider style={{ margin: '8px 0' }} />
            <div><span>Проживание</span><strong>{formatStayPrice(baseTotal)}</strong></div>
            {extrasSummary.map((item) => (
              <div key={`summary-${item.serviceId}`}>
                <span>{item.title}{item.meta ? ` · ${item.meta}` : ''}</span>
                <strong>{formatStayPrice(item.total)}</strong>
              </div>
            ))}
            <div><span>Предоплата</span><strong>{formatStayPrice(prepaymentAmount)}</strong></div>
            <div className="stay-booking-summary__total">
              <span>Итого</span>
              <strong>{formatStayPrice(totalPreview)}</strong>
            </div>
          </div>
        </Card>
      </div>
    ),
  ][bookingStep];

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
          <CompanyBadge companyName={stay.companyName} companyLogo={stay.companyLogo} companyCity={stay.companyCity} companyVerified={stay.companyVerified} variant="plain" />
          <Tag><Rate disabled allowHalf value={stay.rating} /> {stay.rating}</Tag>
        </Space>
      </section>

      <section className="stay-detail-layout">
        <div className="stay-gallery">
          <div className="stay-gallery__main">
            <img src={gallery[0]} alt={stay.title} fetchPriority="high" decoding="async" onError={withStayFallback} />
          </div>
          <div className="stay-gallery__thumbs">
            {(gallery.length > 1 ? gallery : [gallery[0], gallery[0], gallery[0]]).slice(0, 3).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${stay.title} ${index + 1}`} loading="lazy" decoding="async" onError={withStayFallback} />
            ))}
          </div>
        </div>

        <Card className="stay-booking-card">
          <Text>Стоимость</Text>
          <Title level={2}>{formatStayPrice(stay.pricePerNight)}</Title>
          <Paragraph>за ночь, без скрытых платежей</Paragraph>
          <Divider />
          <Space orientation="vertical" size={14} style={{ width: '100%' }}>
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
                        {isBooked && <small>Занято</small>}
                      </button>
                    );
                  })}
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
            {activeExtraServices.length > 0 && (
              <div className="stay-extra-services">
                <div className="stay-extra-services__head">
                  <Text strong>Дополнительные услуги</Text>
                  <Tag color="cyan">{activeExtraServices.length}</Tag>
                </div>
                <div className="stay-extra-services__list">
                  {activeExtraServices.map((service) => {
                    const selection = selectedExtras[service.id] || {};
                    return (
                      <Card key={service.id} size="small" className="stay-extra-service-card">
                        <div className="stay-extra-service-card__top">
                          <div>
                            <strong>{service.title}</strong>
                            {service.description ? <p>{service.description}</p> : null}
                          </div>
                          <span>{formatStayPrice(service.price)}</span>
                        </div>

                        {service.type === 'quantity' && (
                          <InputNumber
                            min={0}
                            max={Math.max(Number(service.maxQuantity) || 1, 1)}
                            value={selection.quantity || 0}
                            onChange={(value) => setSelectedExtras((current) => ({
                              ...current,
                              [service.id]: { quantity: Number(value) || 0 },
                            }))}
                            style={{ width: '100%' }}
                            addonAfter={service.unitLabel || 'шт.'}
                          />
                        )}

                        {service.type === 'select' && (
                          <Select
                            allowClear
                            placeholder="Выберите вариант"
                            value={selection.selectedOptionId || undefined}
                            onChange={(value) => setSelectedExtras((current) => ({
                              ...current,
                              [service.id]: { selectedOptionId: value || '' },
                            }))}
                            options={(service.options || []).map((option) => ({
                              value: option.id,
                              label: `${option.label} — ${formatStayPrice(option.price)}`,
                            }))}
                          />
                        )}

                        {service.type === 'toggle' && (
                          <Checkbox
                            checked={Boolean(selection.selected)}
                            onChange={(event) => setSelectedExtras((current) => ({
                              ...current,
                              [service.id]: { selected: event.target.checked },
                            }))}
                          >
                            Добавить к бронированию
                          </Checkbox>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="stay-booking-total">
              <span>{selectedDateLabel} - {checkOutLabel} В· {selectedTime}</span>
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
        width={isMobile ? '100%' : 880}
        footer={(
          <div className="stay-booking-wizard__footer">
            <Button onClick={closeBookingModal}>Отмена</Button>
            <Space>
              {bookingStep > 0 && (
                <Button onClick={goToPreviousBookingStep}>
                  Назад
                </Button>
              )}
              {bookingStep < BOOKING_STEPS.length - 1 ? (
                <Button type="primary" onClick={goToNextBookingStep}>
                  Далее
                </Button>
              ) : (
                <Button type="primary" loading={bookingSubmitting} onClick={submitStayBooking}>
                  Подтвердить бронирование
                </Button>
              )}
            </Space>
          </div>
        )}
        onCancel={closeBookingModal}
        className="stay-booking-wizard-modal"
      >
        <div className="stay-booking-wizard">
          <Form
            form={bookingForm}
            layout="vertical"
            className="stay-booking-form-shell"
            onValuesChange={(_, values) => {
              setBookingContactPreview({
                clientName: values.clientName || '',
                clientPhone: values.clientPhone || '',
                clientEmail: values.clientEmail || '',
                comment: values.comment || '',
              });
            }}
          >
            <Card size="small" className="stay-booking-wizard__hero">
              <div>
                <strong>{stay.title}</strong>
                <p>{selectedDateLabel} - {checkOutLabel} · {selectedTime} · {guests} гостей</p>
              </div>
              <div className="stay-booking-wizard__hero-price">
                <span>Итого</span>
                <strong>{formatStayPrice(totalPreview)}</strong>
              </div>
            </Card>
            <Steps current={bookingStep} items={bookingStepItems} responsive className="stay-booking-wizard__steps" />
            <AnimatePresence mode="wait">
              <motion.div
                key={bookingStep}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.22 }}
              >
                <Row gutter={[20, 20]}>
                  <Col xs={24} lg={16}>
                    {bookingStepContent}
                  </Col>
                  <Col xs={24} lg={8}>
                    <Card className="stay-booking-side-card" variant="borderless">
                      <Badge color="#5b6cff" text="Стоимость" />
                      <div className="stay-booking-summary stay-booking-summary--side">
                        <div><span>Проживание</span><strong>{formatStayPrice(baseTotal)}</strong></div>
                        {extrasSummary.length ? extrasSummary.map((item) => (
                          <div key={`side-${item.serviceId}`}>
                            <span>{item.title}{item.meta ? ` · ${item.meta}` : ''}</span>
                            <strong>{formatStayPrice(item.total)}</strong>
                          </div>
                        )) : <div><span>Доп. услуги</span><strong>0 сом</strong></div>}
                        <div><span>Предоплата {prepaymentPercent}%</span><strong>{formatStayPrice(prepaymentAmount)}</strong></div>
                        <div className="stay-booking-summary__total">
                          <span>Итого</span>
                          <strong>{formatStayPrice(totalPreview)}</strong>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </motion.div>
            </AnimatePresence>
          </Form>
        </div>
      </Modal>
      <PaymentTopUpModal
        amount={requiredTopUpAmount || shortageAmount}
        businessId={stay.companyId}
        onCancel={() => setTopUpModalOpen(false)}
        onCreated={() => {
          setTopUpModalOpen(false);
          api.get('/wallet/me')
            .then((response) => {
              setWallet(response.data.wallet);
              if (response.data.user) {
                syncCurrentUser({ ...response.data.user, isLoggedIn: true });
              }
            })
            .catch(() => undefined);
        }}
        open={topUpModalOpen}
        requiredAmount={requiredTopUpAmount || shortageAmount}
        serviceContext={{ accommodationId: stay.id }}
      />
    </main>
  );
};

export default StayDetailPage;
