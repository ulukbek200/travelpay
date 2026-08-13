import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert as AntAlert,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Drawer as AntDrawer,
  Dropdown,
  Empty,
  Form,
  Grid,
  Image,
  Input,
  InputNumber,
  Layout,
  Modal as AntModal,
  Progress,
  Rate,
  Result,
  Row,
  Segmented,
  Select,
  Skeleton,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  BankOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  CompassOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FilterOutlined,
  HistoryOutlined,
  HomeOutlined,
  LinkOutlined,
  LeftOutlined,
  MenuOutlined,
  MoreOutlined,
  MoonOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import AppImage from '../components/AppImage';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import BusinessManagersPage from './BusinessManagersPage';
import BusinessPaymentSettingsPage from './BusinessPaymentSettingsPage';
import BusinessPaymentsPage from './BusinessPaymentsPage';
import { clearCurrentUser, readCurrentUser, saveCurrentUser } from '../utils/currentUser';
import { BUSINESS_PERMISSION_KEYS, BUSINESS_TAB_PERMISSIONS, canBusiness, getBusinessHomePathForRole } from '../utils/businessPermissions';
import { normalizeUser } from '../utils/user';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;
const safeSrc = (value) => String(value || '').trim() || null;

const Alert = ({ message: legacyMessage, title, ...props }) => <AntAlert title={title ?? legacyMessage} {...props} />;
const Drawer = ({ width, height, size, placement, ...props }) => {
  const placementSize = ['top', 'bottom'].includes(placement) ? height : width;
  return <AntDrawer forceRender placement={placement} size={size ?? placementSize ?? width ?? height} {...props} />;
};
const Modal = Object.assign(
  ({ destroyOnClose, destroyOnHidden, ...props }) => <AntModal forceRender destroyOnHidden={destroyOnHidden ?? destroyOnClose} {...props} />,
  AntModal,
);

const BOOKING_MONTHS = [
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

// Kept for backwards compatibility with saved calendar drafts from previous releases.
void BOOKING_MONTHS;
const STAY_BOOKING_TIME_OPTIONS = ['14:00', '16:00', '18:00'];
const STAY_BOOKING_SLOT_DURATION_MINUTES = 120;
const QUICK_BOOKING_TYPE_OPTIONS = [
  { label: 'Tour', value: 'tours', icon: <CompassOutlined /> },
  { label: 'Cottage', value: 'cottages', icon: <HomeOutlined /> },
  { label: 'House', value: 'houses', icon: <HomeOutlined /> },
  { label: 'Activity', value: 'activities', icon: <CompassOutlined /> },
];
const QUICK_BOOKING_SOURCES = [
  { value: 'travelpay_marketplace', label: 'TravelPay Marketplace' },
  { value: 'travelpay', label: 'TravelPay Marketplace' },
  { value: 'manual', label: 'Manual booking' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone' },
  { value: 'walk_in', label: 'Walk-in / Office' },
  { value: 'website', label: 'Website' },
  { value: 'manager', label: 'Manager' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];
const QUICK_BOOKING_STATUS_OPTIONS = [
  { value: 'NEW', label: 'Новая' },
  { value: 'PENDING', label: 'Ожидает' },
  { value: 'CONFIRMED', label: 'Подтверждено' },
  { value: 'AWAITING_PAYMENT', label: 'Ждёт оплату' },
  { value: 'PARTIALLY_PAID', label: 'Частично оплачено' },
  { value: 'PAID', label: 'Оплачено' },
];
const CASHBOX_PAYMENT_METHOD_OPTIONS = [
  { value: 'qr', label: 'QR' },
  { value: 'cash', label: 'Наличные' },
  { value: 'card', label: 'Карта' },
  { value: 'transfer', label: 'Перевод' },
  { value: 'wallet', label: 'TravelPay balance' },
  { value: 'manager', label: 'Manager payment' },
  { value: 'mixed', label: 'Смешанная оплата' },
];
const DEFAULT_NOTIFICATION_RULES = [
  { key: 'booking_confirmed', title: 'После бронирования', trigger: 'after_booking', timing: 'Immediately', channel: 'Push', enabled: true, template: 'Ваше бронирование подтверждено' },
  { key: 'prepayment_received', title: 'После предоплаты', trigger: 'after_prepayment', timing: 'Immediately', channel: 'Push', enabled: true, template: 'Мы получили предоплату {amount} сом' },
  { key: 'tour_day_before', title: 'Reminder before tour', trigger: 'before_tour', timing: '24 hours', channel: 'WhatsApp', enabled: true, template: 'Напоминаем, завтра ваша поездка {serviceName}' },
  { key: 'checkin_today', title: 'Перед check-in', trigger: 'before_checkin', timing: '08:00 same day', channel: 'Push', enabled: true, template: 'Сегодня с {checkInTime} доступен заезд' },
  { key: 'after_trip_review', title: 'После поездки', trigger: 'after_trip', timing: '24 hours after', channel: 'Email', enabled: true, template: 'Спасибо за поездку. Оставьте отзыв' },
  { key: 'payment_reminder', title: 'Payment reminder', trigger: 'payment_due', timing: '12 hours before', channel: 'Push', enabled: true, template: 'Напоминаем об остатке оплаты по бронированию {serviceName}' },
];
const CLIENT_TAG_OPTIONS = [
  'VIP',
  'Повторный клиент',
  'Семья',
  'Corporate',
  'Иностранный турист',
  'Проблемная оплата',
  'Постоянный',
];
const PROPERTY_BLOCK_REASONS = [
  { value: 'repair', label: 'Ремонт' },
  { value: 'personal', label: 'Личное использование' },
  { value: 'unavailable', label: 'Недоступно' },
  { value: 'other', label: 'Другая причина' },
];
const PROPERTY_PRICING_RULE_TYPES = [
  { value: 'base', label: 'Base price' },
  { value: 'weekend', label: 'Weekend price' },
  { value: 'season', label: 'Season price' },
  { value: 'specific_date', label: 'Specific date price' },
  { value: 'discount', label: 'Discount' },
  { value: 'minimum_stay', label: 'Minimum stay' },
];
const PREPAYMENT_MODE_OPTIONS = [
  { value: 'disabled', label: 'Предоплата выключена' },
  { value: 'fixed', label: 'Фиксированная сумма' },
  { value: 'percent', label: 'Процент' },
];
const TOUR_DEPARTURE_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'sold_out', label: 'SOLD OUT' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];
const TOUR_DEPARTURE_STATUS_META = {
  scheduled: { label: 'Open', color: 'blue' },
  confirmed: { label: 'Confirmed', color: 'green' },
  sold_out: { label: 'SOLD OUT', color: 'red' },
  paused: { label: 'Paused', color: 'default' },
  cancelled: { label: 'Cancelled', color: 'red' },
};
const TOUR_OPERATION_CHECKLIST_ITEMS = [
  { key: 'guideAssigned', label: 'Гид назначен' },
  { key: 'driverAssigned', label: 'Водитель назначен' },
  { key: 'vehicleAssigned', label: 'Транспорт назначен' },
  { key: 'paymentsChecked', label: 'Все оплаты проверены' },
  { key: 'participantsReady', label: 'Список участников готов' },
  { key: 'remindersSent', label: 'Клиентам отправлено напоминание' },
  { key: 'routeConfirmed', label: 'Маршрут подтвержден' },
];
const createEmptyTourOperationsChecklist = () => TOUR_OPERATION_CHECKLIST_ITEMS.reduce((acc, item) => ({
  ...acc,
  [item.key]: false,
}), {});
const TASK_STATUS_META = {
  new: { label: 'Новая', color: 'blue' },
  in_progress: { label: 'В работе', color: 'gold' },
  done: { label: 'Готово', color: 'green' },
  overdue: { label: 'Просрочено', color: 'red' },
};
const TASK_STATUS_COLUMNS = Object.entries(TASK_STATUS_META).map(([key, meta]) => ({ key, ...meta }));

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString('ru-RU') : '—');
const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
const getDaysRemaining = (value) => {
  if (!value) return null;
  const diff = new Date(value).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
const getSubscriptionHealthMeta = (company) => {
  const status = company?.subscriptionStatus;
  const daysRemaining = getDaysRemaining(company?.subscriptionExpiresAt);

  if (status === 'expired') {
    return { label: 'Подписка истекла', color: 'red', tone: 'danger', daysRemaining };
  }
  if (status === 'active' && daysRemaining !== null && daysRemaining <= 3) {
    return { label: `Истекает через ${Math.max(daysRemaining, 0)} дн.`, color: 'orange', tone: 'accent', daysRemaining };
  }
  if (status === 'active') {
    return { label: 'Подписка активна', color: 'green', tone: 'success', daysRemaining };
  }
  if (status === 'payment_review') {
    return { label: 'Платёж на проверке', color: 'blue', tone: 'info', daysRemaining };
  }
  if (status === 'pending_payment') {
    return { label: 'Ожидает оплату', color: 'gold', tone: 'info', daysRemaining };
  }
  if (status === 'rejected') {
    return { label: 'Нужна повторная подача', color: 'red', tone: 'danger', daysRemaining };
  }

  return { label: 'Статус обновляется', color: 'default', tone: 'muted', daysRemaining };
};

const clockToMinutesLabel = (value) => {
  const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return (Number(match[1]) * 60) + Number(match[2]);
};

const addMinutesToClock = (value, minutes) => {
  const total = clockToMinutesLabel(value) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const isQuickBookingStayKind = (value) => ['stays', 'cottages', 'houses'].includes(value);
const isQuickBookingTourKind = (value) => ['tours', 'activities'].includes(value);

const STATUS_META = {
  active: { label: 'Активный', color: 'blue' },
  published: { label: 'Published', color: 'green' },
  hot: { label: 'Горящий тур', color: 'volcano' },
  draft: { label: 'Черновик', color: 'default' },
  archived: { label: 'Archived', color: 'default' },
  discount: { label: 'Скидка', color: 'gold' },
};

const TOPUP_STATUS_META = {
  pending: { label: 'На проверке', color: 'orange' },
  approved: { label: 'Подтверждено', color: 'green' },
  rejected: { label: 'Отклонено', color: 'red' },
};

const SUBSCRIPTION_STATUS_META = {
  pending_payment: { label: 'Ожидает оплату', color: 'gold' },
  payment_review: { label: 'Чек на проверке', color: 'blue' },
  active: { label: 'Активна', color: 'green' },
  expired: { label: 'Истекла', color: 'volcano' },
  rejected: { label: 'Отклонена', color: 'red' },
};

const BOOKING_STATUS_META = {
  NEW: { label: 'Новая', color: 'blue', badge: 'processing', dot: '#3d62e8' },
  PENDING: { label: 'Ожидает', color: 'gold', badge: 'warning', dot: '#f6b44b' },
  CONFIRMED: { label: 'Подтверждено', color: 'green', badge: 'success', dot: '#1fa77a' },
  AWAITING_PAYMENT: { label: 'Ожидает оплату', color: 'orange', badge: 'warning', dot: '#d98a16' },
  PARTIALLY_PAID: { label: 'Частично оплачено', color: 'cyan', badge: 'processing', dot: '#0891b2' },
  PAID: { label: 'Оплачено', color: 'green', badge: 'success', dot: '#1fa77a' },
  IN_PROGRESS: { label: 'В процессе', color: 'blue', badge: 'processing', dot: '#3d62e8' },
  COMPLETED: { label: 'Завершено', color: 'default', badge: 'default', dot: '#71809a' },
  CANCELLED: { label: 'Отменено', color: 'red', badge: 'error', dot: '#ef5b68' },
  NO_SHOW: { label: 'Не приехал', color: 'volcano', badge: 'error', dot: '#e8590c' },
  RESCHEDULED: { label: 'Перенесено', color: 'purple', badge: 'processing', dot: '#7c5cff' },
  CHECKED_IN: { label: 'Заселён', color: 'green', badge: 'success', dot: '#1fa77a' },
  CHECKED_OUT: { label: 'Выехал', color: 'default', badge: 'default', dot: '#71809a' },
  paid: { label: 'Оплачено', color: 'green', badge: 'success', dot: '#1fa77a' },
  confirmed: { label: 'Подтверждено', color: 'green', badge: 'success', dot: '#1fa77a' },
  booking_confirmed: { label: 'Подтверждено', color: 'green', badge: 'success', dot: '#1fa77a' },
  payment_review: { label: 'Чек на проверке', color: 'blue', badge: 'processing', dot: '#3d62e8' },
  pending: { label: 'Ожидает', color: 'gold', badge: 'warning', dot: '#f6b44b' },
  pending_payment: { label: 'Ожидает оплату', color: 'orange', badge: 'warning', dot: '#d98a16' },
  funds_reserved: { label: 'Средства зарезервированы', color: 'cyan', badge: 'processing', dot: '#0891b2' },
  completed: { label: 'Завершено', color: 'default', badge: 'default', dot: '#71809a' },
  cancelled: { label: 'Отменено', color: 'red', badge: 'error', dot: '#ef5b68' },
  rejected: { label: 'Отклонено', color: 'red', badge: 'error', dot: '#ef5b68' },
};

const PAYMENT_STATUS_META = {
  UNPAID: { label: 'Не оплачено', color: 'orange', dot: '#d98a16' },
  PARTIALLY_PAID: { label: 'Частично оплачено', color: 'cyan', dot: '#0891b2' },
  PAID: { label: 'Оплачено', color: 'green', dot: '#1fa77a' },
  REFUNDED: { label: 'Возвращено', color: 'default', dot: '#71809a' },
  PARTIALLY_REFUNDED: { label: 'Частичный возврат', color: 'purple', dot: '#7c5cff' },
  REVIEW: { label: 'Проверка', color: 'blue', dot: '#3d62e8' },
  RESERVED: { label: 'Зарезервировано', color: 'cyan', dot: '#0891b2' },
};

const statusOptions = Object.entries(STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const TOUR_CALENDAR_STATUS_META = {
  scheduled: { label: 'Запланирован', color: 'blue' },
  in_progress: { label: 'Идет сейчас', color: 'green' },
  completed: { label: 'Завершен', color: 'default' },
  cancelled: { label: 'Отменен', color: 'red' },
  sold_out: { label: 'Мест нет', color: 'orange' },
};

const tourCalendarStatusOptions = Object.entries(TOUR_CALENDAR_STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const ACCOMMODATION_TYPES = [
  { value: 'standard', label: 'Стандарт' },
  { value: 'comfort', label: 'Комфорт' },
  { value: 'vip', label: 'VIP' },
  { value: 'family', label: 'Семейный' },
];

const ACCOMMODATION_STATUS_OPTIONS = [
  { value: 'available', label: 'Доступен' },
  { value: 'sold_out', label: 'Нет мест' },
];

const ACCOMMODATION_EXTRA_SERVICE_TYPES = [
  { value: 'toggle', label: 'Чекбокс' },
  { value: 'quantity', label: 'Количество' },
  { value: 'select', label: 'Выбор варианта' },
];

const ACCOMMODATION_AMENITIES = [
  'Wi-Fi',
  'Душ',
  'Отопление',
  'Кондиционер',
  'Завтрак',
  'Парковка',
  'Кухня',
  'Вид на горы',
  'Терраса',
];

const createAccommodationDraft = () => ({
  id: `house-${Date.now()}`,
  name: '',
  type: 'standard',
  images: [''],
  description: '',
  capacity: 2,
  pricePerNight: 0,
  propertyName: '',
  propertyId: '',
  defaultCheckInTime: '14:00',
  defaultCheckOutTime: '12:00',
  weekendPrice: 0,
  prepaymentMode: 'percent',
  prepaymentPercent: 30,
  prepaymentFixedAmount: 0,
  blockedDates: [],
  pricingRules: [],
  availableCount: 1,
  amenities: [],
  extraBedAvailable: false,
  extraBedPrice: 0,
  extraServices: [],
  status: 'available',
});

const createAccommodationEntityDraft = () => ({
  ...createAccommodationDraft(),
  title: '',
  name: '',
  location: '',
  totalCount: 1,
  linkedTourIds: [],
  companyId: undefined,
  companyName: '',
});

const normalizeAccommodation = (item = {}, index = 0) => ({
  id: item.id || `house-${Date.now()}-${index}`,
  title: item.title || item.name || '',
  name: item.name || item.title || '',
  type: item.type || 'standard',
  images: (Array.isArray(item.images) ? item.images : [item.images]).filter(Boolean),
  description: item.description || '',
  location: item.location || '',
  capacity: Number(item.capacity || 0),
  pricePerNight: Number(item.pricePerNight || 0),
  propertyName: item.propertyName || item.resortName || item.companyName || '',
  propertyId: item.propertyId || item.resortId || '',
  defaultCheckInTime: item.defaultCheckInTime || item.checkInTime || '14:00',
  defaultCheckOutTime: item.defaultCheckOutTime || item.checkOutTime || '12:00',
  weekendPrice: Number(item.weekendPrice || 0),
  prepaymentMode: item.prepaymentMode || (item.prepaymentRequired === false ? 'disabled' : Number(item.prepaymentFixedAmount || 0) > 0 ? 'fixed' : 'percent'),
  prepaymentPercent: Number(item.prepaymentPercent || 30),
  prepaymentFixedAmount: Number(item.prepaymentFixedAmount || item.prepaymentAmount || 0),
  blockedDates: Array.isArray(item.blockedDates) ? item.blockedDates.map((block, blockIndex) => ({
    id: block.id || `block-${blockIndex + 1}`,
    startDate: block.startDate || block.date || '',
    endDate: block.endDate || block.startDate || block.date || '',
    reason: block.reason || 'unavailable',
    comment: block.comment || block.note || '',
  })) : [],
  pricingRules: Array.isArray(item.pricingRules) ? item.pricingRules.map((rule, ruleIndex) => ({
    id: rule.id || `pricing-${ruleIndex + 1}`,
    type: rule.type || 'specific_date',
    startDate: rule.startDate || rule.date || '',
    endDate: rule.endDate || rule.startDate || rule.date || '',
    price: Number(rule.price || 0),
    discount: Number(rule.discount || 0),
    minimumStay: Number(rule.minimumStay || 0),
    label: rule.label || '',
  })) : [],
  totalCount: Number(item.totalCount || item.availableCount || 0),
  availableCount: Number(item.availableCount || 0),
  amenities: Array.isArray(item.amenities) ? item.amenities : [],
  extraBedAvailable: Boolean(item.extraBedAvailable),
  extraBedPrice: Number(item.extraBedPrice || 0),
  extraServices: Array.isArray(item.extraServices)
    ? item.extraServices.map((service, serviceIndex) => ({
      id: service.id || `service-${serviceIndex + 1}`,
      title: service.title || service.name || '',
      description: service.description || '',
      type: service.type || 'toggle',
      price: Number(service.price || 0),
      maxQuantity: Number(service.maxQuantity || 1),
      unitLabel: service.unitLabel || 'шт.',
      active: service.active !== false,
      sortOrder: Number(service.sortOrder ?? serviceIndex),
      options: Array.isArray(service.options)
        ? service.options.map((option, optionIndex) => ({
          id: option.id || `option-${optionIndex + 1}`,
          label: option.label || option.title || '',
          price: Number(option.price || 0),
        }))
        : [],
    }))
    : [],
  status: item.status || 'available',
  linkedTourIds: Array.isArray(item.linkedTourIds) ? item.linkedTourIds : [],
  companyId: Number(item.companyId || 0),
  companyName: item.companyName || '',
});

const normalizeStayBooking = (item = {}, index = 0) => ({
  key: `stay-booking-${item.id || index}`,
  id: item.id || index + 1,
  type: 'stay_booking',
  stayId: Number(item.stayId || 0),
  tourId: `stay-${item.stayId || item.id || index}`,
  companyId: Number(item.companyId || 0),
  companyName: item.companyName || '',
  clientName: item.clientName || '',
  clientEmail: item.clientEmail || '',
  clientPhone: item.clientPhone || '',
  assignedTo: item.assignedTo || item.manager || item.companyName || 'TravelPay Business',
  bookingSource: item.bookingSource || item.source || '',
  tourTitle: item.stayTitle || item.title || 'Бронь домика',
  stayTitle: item.stayTitle || item.title || '',
  location: item.location || '',
  amount: Number(item.amount || 0),
  baseAmount: Number(item.baseAmount || 0),
  extrasAmount: Number(item.extrasAmount || 0),
  prepaymentAmount: Number(item.prepaymentAmount || 0),
  prepaymentPercent: Number(item.prepaymentPercent || 0),
  paymentReceiptUrl: item.paymentReceiptUrl || '',
  paymentReceiptName: item.paymentReceiptName || '',
  paymentReceiptType: item.paymentReceiptType || '',
  paymentReviewedAt: item.paymentReviewedAt || '',
  paymentReviewedBy: Number(item.paymentReviewedBy || 0) || null,
  createdAt: item.createdAt || '',
  updatedAt: item.updatedAt || item.createdAt || '',
  extras: Array.isArray(item.extras)
    ? item.extras.map((extra) => ({
      serviceId: extra.serviceId || '',
      title: extra.title || '',
      type: extra.type || '',
      quantity: Number(extra.quantity || 0),
      selected: Boolean(extra.selected),
      selectedOptionId: extra.selectedOptionId || '',
      selectedOptionLabel: extra.selectedOptionLabel || '',
      unitPrice: Number(extra.unitPrice || 0),
      total: Number(extra.total || 0),
    }))
    : [],
  status: item.status || 'pending',
  bookingStatus: item.bookingStatus || getCanonicalBookingStatus(item),
  paymentStatus: item.paymentStatus || (item.status === 'confirmed' ? 'confirmed' : item.status || 'pending'),
  paymentStatusCode: item.paymentStatusCode || getCanonicalPaymentStatus(item),
  paymentMethod: item.paymentMethod || '',
  paymentBreakdown: Array.isArray(item.paymentBreakdown) ? item.paymentBreakdown : [],
  refundedAmount: Number(item.refundedAmount || 0),
  refunds: Array.isArray(item.refunds) ? item.refunds : [],
  statusHistory: Array.isArray(item.statusHistory) ? item.statusHistory : [],
  purchasedAt: item.createdAt || item.checkInDate || new Date().toISOString(),
  travelDate: item.checkInDate || '',
  bookingDate: item.checkInDate || item.createdAt || new Date().toISOString(),
  date: item.checkInDate || item.createdAt || new Date().toISOString(),
  endDate: item.checkOutDate || item.checkInDate || '',
  durationMinutes: Number(item.durationMinutes || 120),
  guests: Number(item.guests || 1),
  adults: Number(item.adults || item.guests || 1),
  children: Number(item.children || 0),
  nights: Number(item.nights || 1),
  checkInTime: item.checkInTime || '14:00',
  comment: item.comment || '',
  rejectionReason: item.rejectionReason || '',
});

const normalizeTourBooking = (item = {}, index = 0) => ({
  ...item,
  key: `tour-booking-${item.id || index}`,
  id: Number(item.id || 0),
  type: 'tour_booking',
  clientId: Number(item.userId || 0),
  clientName: item.clientName || '',
  clientPhone: item.clientPhone || '',
  clientEmail: item.clientEmail || '',
  assignedTo: item.assignedTo || item.manager || item.companyName || 'TravelPay Team',
  bookingSource: item.bookingSource || item.source || '',
  tourTitle: item.tourTitle || item.title || '',
  bookingDate: item.travelDate || item.createdAt || new Date().toISOString(),
  purchasedAt: item.createdAt || '',
  adults: Number(item.adults || item.people || 1),
  children: Number(item.children || 0),
  participantType: item.participantType || (Number(item.children || 0) > 0 && Number(item.adults || item.people || 0) <= 0 ? 'child' : 'adult'),
  pickup: item.pickup || item.pickupLocation || '',
  emergencyContact: item.emergencyContact || item.emergencyPhone || '',
  amount: Number(item.amount || 0),
  baseTourAmount: Number(item.baseTourAmount || 0),
  accommodationTotal: Number(item.accommodationTotal || 0),
  extraBedTotal: Number(item.extraBedTotal || 0),
  prepaymentAmount: Number(item.prepaymentAmount || 0),
  prepaymentPercent: Number(item.prepaymentPercent || 0),
  remainingAmount: Number(item.remainingAmount || 0),
  paymentReceiptUrl: item.paymentReceiptUrl || '',
  paymentReceiptName: item.paymentReceiptName || '',
  paymentReceiptType: item.paymentReceiptType || '',
  status: item.status || 'pending_payment',
  bookingStatus: item.bookingStatus || getCanonicalBookingStatus(item),
  paymentStatus: item.paymentStatus || 'pending',
  paymentStatusCode: item.paymentStatusCode || getCanonicalPaymentStatus(item),
  paymentMethod: item.paymentMethod || '',
  paymentBreakdown: Array.isArray(item.paymentBreakdown) ? item.paymentBreakdown : [],
  refundedAmount: Number(item.refundedAmount || 0),
  refunds: Array.isArray(item.refunds) ? item.refunds : [],
  statusHistory: Array.isArray(item.statusHistory) ? item.statusHistory : [],
  rejectionReason: item.rejectionReason || '',
});

const normalizeTourRecord = (tour, index = 0) => {
  const fallbackStatuses = ['active', 'hot', 'discount', 'draft'];
  const legacyStartDate = tour.startDate || tour.dateStart || tour.departureDate || tour.date || '';
  const departureSlots = (Array.isArray(tour.departureSlots) && tour.departureSlots.length
    ? tour.departureSlots
    : (legacyStartDate ? [{
      id: `legacy-${tour.id || index}`,
      startAt: legacyStartDate,
      seats: tour.totalSeats || tour.seats || tour.capacity || 20,
      active: true,
    }] : []))
    .map((slot, slotIndex) => ({
      id: slot.id || `departure-${slotIndex + 1}`,
      startAt: slot.startAt || slot.date || '',
      seats: Math.max(Number(slot.seats || slot.capacity || 1), 1),
      active: slot.active !== false,
      guide: slot.guide || '',
      driver: slot.driver || '',
      vehicle: slot.vehicle || '',
      meetingPoint: slot.meetingPoint || slot.meeting_point || '',
      price: Number(slot.price || tour.price || 0),
      status: slot.status || (slot.active === false ? 'paused' : 'scheduled'),
      waitlist: Array.isArray(slot.waitlist) ? slot.waitlist : [],
      operationsChecklist: {
        ...createEmptyTourOperationsChecklist(),
        ...(slot.operationsChecklist || {}),
      },
    }))
    .filter((slot) => slot.startAt)
    .sort((left, right) => new Date(left.startAt) - new Date(right.startAt));
  const startDate = departureSlots[0]?.startAt || legacyStartDate;
  const endDate = tour.endDate || tour.dateEnd || tour.returnDate || '';
  const totalSeats = departureSlots.reduce((sum, slot) => sum + slot.seats, 0)
    || Number(tour.totalSeats || tour.seats || tour.capacity || 20);
  const bookedSeats = Number(tour.bookedSeats || 0);
  return {
    ...tour,
    key: tour.id,
    status: tour.status || fallbackStatuses[index % fallbackStatuses.length],
    rating: Number(tour.rating || 4.8),
    price: Number(tour.price || 0),
    prepaymentMode: tour.prepaymentMode || (tour.prepaymentRequired === false ? 'disabled' : Number(tour.prepaymentFixedAmount || 0) > 0 ? 'fixed' : 'percent'),
    prepaymentPercent: Number(tour.prepaymentPercent || 30),
    prepaymentFixedAmount: Number(tour.prepaymentFixedAmount || tour.prepaymentAmount || 0),
    companyId: Number(tour.companyId || 1),
    companyName: tour.companyName || '',
    startDate,
    endDate,
    departureSlots,
    route: tour.route || tour.location || '',
    manager: tour.manager || '',
    totalSeats,
    bookedSeats,
    calendarStatus: tour.calendarStatus || tour.tripStatus || tour.scheduleStatus || '',
    hasAccommodation: Boolean(tour.hasAccommodation),
    accommodations: (tour.accommodations || []).map(normalizeAccommodation),
    accommodationIds: Array.isArray(tour.accommodationIds) ? tour.accommodationIds : [],
  };
};

const getCurrentTab = (pathname) => {
  if (pathname === '/admin' || pathname === '/admin/home' || pathname === '/business/dashboard') return 'home';
  if (pathname === '/admin/tours' || pathname === '/business/tours') return 'tours';
  if (pathname === '/admin/accommodations' || pathname === '/business/accommodations' || pathname === '/business/objects') return 'accommodations';
  if (pathname === '/admin/properties' || pathname.startsWith('/admin/properties/')) return 'properties';
  if (pathname === '/admin/bookings' || pathname === '/business/bookings') return 'bookings';
  if (pathname === '/admin/schedule' || pathname === '/business/schedule') return 'schedule';
  if (pathname === '/admin/calendar') return 'calendar';
  if (pathname === '/admin/payments' || pathname === '/business/payments') return 'payments';
  if (pathname === '/admin/users' || pathname.startsWith('/admin/clients') || pathname.startsWith('/business/clients')) return 'clients';
  if (pathname === '/admin/company' || pathname === '/business/company') return 'company';
  if (pathname === '/business/team' || pathname === '/admin/team') return 'team';
  if (pathname === '/business/tasks' || pathname === '/admin/tasks') return 'tasks';
  if (pathname === '/admin/topups' || pathname === '/admin/savings') return 'savings';
  if (pathname === '/admin/stats' || pathname === '/admin/reports' || pathname === '/admin/analytics' || pathname === '/business/reports' || pathname === '/business/analytics') return 'reports';
  if (pathname === '/admin/notifications' || pathname === '/business/notifications') return 'notifications';
  if (pathname === '/admin/activity' || pathname === '/business/activity') return 'activity';
  if (pathname === '/admin/companies') return 'companies';
  if (pathname === '/admin/settings' || pathname === '/business/settings' || pathname === '/business/payment-settings') return 'settings';
  if (pathname === '/business/support') return 'support';
  return 'home';
};

const getCatalogMode = (pathname) => (pathname === '/admin/accommodations' || pathname === '/admin/properties' || pathname === '/business/accommodations' || pathname === '/business/objects' ? 'accommodations' : 'tours');
const SCHEDULE_VIEW_OPTIONS = ['day', 'week', 'month'];

const startOfWeek = (date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

const isSameDay = (left, right) => (
  left.getFullYear() === right.getFullYear()
  && left.getMonth() === right.getMonth()
  && left.getDate() === right.getDate()
);

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const parseDurationDays = (value) => {
  const match = String(value || '').match(/\d+/);
  const numeric = Number(match?.[0] || 1);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
};

const getBookingStartDate = (booking) => {
  const value = booking?.startTime || booking?.bookingDate || booking?.travelDate || booking?.purchasedAt;
  let parsed = dayjs(value);
  const time = booking?.departureTime || booking?.checkInTime || booking?.time;
  if (time && parsed.isValid()) {
    const [hours, minutes] = String(time).split(':').map(Number);
    if (Number.isFinite(hours)) {
      parsed = parsed.hour(hours).minute(Number.isFinite(minutes) ? minutes : 0).second(0).millisecond(0);
    }
  }
  return parsed.isValid() ? parsed : dayjs();
};

const getBookingDurationMinutes = (booking) => {
  if (booking?.allDay) return 24 * 60;
  if (Number(booking?.durationMinutes) > 0) return Number(booking.durationMinutes);
  if (booking?.endTime) {
    const start = getBookingStartDate(booking);
    const end = dayjs(booking.endTime);
    if (end.isValid() && end.isAfter(start)) {
      return Math.max(45, end.diff(start, 'minute'));
    }
  }
  if (booking?.endDate) {
    const start = getBookingStartDate(booking);
    const end = dayjs(booking.endDate);
    if (end.isValid() && end.isAfter(start)) {
      return Math.max(45, end.diff(start, 'minute'));
    }
  }
  return 60;
};

const formatCalendarTimeRange = (item) => {
  if (item?.allDay) return 'Весь день';
  const start = item?.type === 'tour'
    ? dayjs(item.startDate)
    : getBookingStartDate(item);
  const duration = item?.type === 'tour' ? 90 : getBookingDurationMinutes(item);
  if (!start.isValid() || duration >= 24 * 60) return 'Весь день';
  return `${start.format('HH:mm')} - ${start.add(duration, 'minute').format('HH:mm')}`;
};

const applyClockToDate = (dateValue, clockValue, fallbackClock = '09:00') => {
  const parsed = dayjs(dateValue);
  const [hours, minutes] = String(clockValue || fallbackClock).split(':').map(Number);
  if (!parsed.isValid()) return dayjs();
  return parsed
    .hour(Number.isFinite(hours) ? hours : 9)
    .minute(Number.isFinite(minutes) ? minutes : 0)
    .second(0)
    .millisecond(0);
};

const getScheduleEventForDate = (entry, selectedDate) => {
  const selected = selectedDate.startOf('day');

  if (entry?.type === 'stay_booking') {
    const checkIn = dayjs(entry.checkInDate || entry.startDate || entry.bookingDate);
    const checkOut = dayjs(entry.checkOutDate || entry.endDate || entry.bookingDate);
    const isCheckOut = checkOut.isValid() && selected.isSame(checkOut, 'day') && !selected.isSame(checkIn, 'day');
    const isCheckIn = checkIn.isValid() && selected.isSame(checkIn, 'day');
    const startDate = isCheckOut
      ? applyClockToDate(checkOut, entry.endTime || entry.checkOutTime, '11:30')
      : isCheckIn
        ? applyClockToDate(checkIn, entry.startTime || entry.checkInTime, '14:00')
        : selected.hour(9).minute(0).second(0).millisecond(0);

    return {
      ...entry,
      scheduleType: isCheckOut ? 'check-out' : isCheckIn ? 'check-in' : 'stay',
      scheduleLabel: isCheckOut ? 'Check-out' : isCheckIn ? 'Check-in' : 'Проживание',
      scheduleTime: startDate,
      startDate: startDate.toISOString(),
      endDate: startDate.add(isCheckOut || isCheckIn ? 45 : 120, 'minute').toISOString(),
      title: entry.stayTitle || entry.title || `Cottage #${entry.stayId || entry.id}`,
      guestsLabel: entry.guests ? `${entry.guests} гостей` : '',
    };
  }

  if (entry?.type === 'tour') {
    const startDate = dayjs(entry.startDate);
    return {
      ...entry,
      scheduleType: 'departure',
      scheduleLabel: 'Departure',
      scheduleTime: startDate.isValid() ? startDate : selected.hour(9),
      title: entry.title || entry.tourTitle || 'Тур',
      guestsLabel: `${entry.bookedSeats || 0} / ${entry.totalSeats || 0} гостей`,
    };
  }

  const startDate = applyClockToDate(entry.travelDate || entry.bookingDate || entry.startDate, entry.departureTime || entry.time, '09:00');
  return {
    ...entry,
    scheduleType: 'booking',
    scheduleLabel: entry.type === 'tour_booking' ? 'Departure' : 'Бронирование',
    scheduleTime: startDate,
    startDate: startDate.toISOString(),
    endDate: startDate.add(Math.max(getBookingDurationMinutes(entry), 45), 'minute').toISOString(),
    title: entry.tourTitle || entry.stayTitle || entry.title || 'Бронирование',
    guestsLabel: entry.people ? `${entry.people} гостей` : entry.guests ? `${entry.guests} гостей` : '',
  };
};

const getSchedulePaymentLabel = (entry) => {
  const paymentStatus = getCanonicalPaymentStatus(entry);
  return (PAYMENT_STATUS_META[paymentStatus] || PAYMENT_STATUS_META.UNPAID).label;
};

const getCanonicalBookingStatus = (booking = {}) => {
  const raw = String(booking.bookingStatus || booking.status || '').toUpperCase();
  if (BOOKING_STATUS_META[raw]) return raw;
  const legacy = String(booking.status || '').toLowerCase();
  const payment = String(booking.paymentStatus || booking.paymentStatusCode || '').toLowerCase();
  if (legacy === 'payment_review') return 'AWAITING_PAYMENT';
  if (legacy === 'pending_payment') return 'AWAITING_PAYMENT';
  if (legacy === 'funds_reserved') return 'PARTIALLY_PAID';
  if (legacy === 'booking_confirmed' || legacy === 'confirmed') return 'CONFIRMED';
  if (legacy === 'paid' || payment === 'paid') return 'PAID';
  if (legacy === 'completed') return 'COMPLETED';
  if (legacy === 'cancelled') return 'CANCELLED';
  if (legacy === 'rejected') return 'CANCELLED';
  if (legacy === 'rescheduled') return 'RESCHEDULED';
  if (legacy === 'no_show') return 'NO_SHOW';
  if (legacy === 'checked_in') return 'CHECKED_IN';
  if (legacy === 'checked_out') return 'CHECKED_OUT';
  return legacy === 'pending' ? 'PENDING' : 'NEW';
};

const getCanonicalPaymentStatus = (booking = {}) => {
  const raw = String(booking.paymentStatusCode || '').toUpperCase();
  if (PAYMENT_STATUS_META[raw]) return raw;
  const legacy = String(booking.paymentStatus || '').toLowerCase();
  if (legacy === 'paid' || legacy === 'confirmed') return 'PAID';
  if (legacy === 'reserved') return 'PARTIALLY_PAID';
  if (legacy === 'review') return 'PARTIALLY_PAID';
  if (legacy === 'refunded') return 'REFUNDED';
  if (legacy === 'partially_refunded') return 'PARTIALLY_REFUNDED';
  if (String(booking.status || '').toLowerCase() === 'rejected') return 'REFUNDED';
  return 'UNPAID';
};

const getBookingDebtSummary = (booking = {}) => {
  const total = Math.max(Number(booking.amount || booking.price || 0), 0);
  const breakdownPaid = Array.isArray(booking.paymentBreakdown)
    ? booking.paymentBreakdown
      .filter((part) => String(part.status || 'completed').toLowerCase() !== 'rejected')
      .reduce((sum, part) => sum + Number(part.amount || 0), 0)
    : 0;
  const paidBeforeRefund = booking.paymentStatusCode === 'PAID'
    ? Math.max(total, breakdownPaid, Number(booking.prepaymentAmount || 0))
    : Math.max(breakdownPaid, Number(booking.prepaymentAmount || 0), Number(booking.walletReservedAmount || 0));
  const refunded = Math.max(Number(booking.refundedAmount || 0), 0);
  const paid = Math.max(paidBeforeRefund - refunded, 0);
  const remaining = Math.max(total - paid, 0);
  const status = refunded > 0 && paid <= 0
    ? 'Refunded'
    : remaining <= 0
      ? 'Paid'
      : paid > 0
        ? 'Partially paid'
        : 'Unpaid';

  return { total, paid, remaining, refunded, status };
};

const getPaymentStatusLabel = (booking = {}) => (
  (PAYMENT_STATUS_META[getCanonicalPaymentStatus(booking)] || PAYMENT_STATUS_META.UNPAID).label
);

const getFriendlyErrorMessage = (error, fallback = 'Не удалось выполнить действие.') => {
  const status = Number(error?.response?.status || error?.status || 0);
  const serverMessage = String(error?.response?.data?.message || error?.message || '').trim();
  if (status === 403) return 'У вас нет доступа к этому разделу.';
  if (status === 409) return 'Этот объект уже занят на выбранные даты.';
  if (/request failed.*409/i.test(serverMessage)) return 'Этот объект уже занят на выбранные даты.';
  if (/request failed.*403/i.test(serverMessage)) return 'У вас нет доступа к этому разделу.';
  return serverMessage && !/^request failed/i.test(serverMessage) ? serverMessage : fallback;
};

const getBookingSourceLabel = (source) => (
  QUICK_BOOKING_SOURCES.find((item) => item.value === source)?.label || source || 'TravelPay Marketplace'
);
const isTravelPayMarketplaceSource = (source) => ['travelpay_marketplace', 'travelpay', '', undefined, null].includes(source);

const getChartColor = (index) => ['#2563eb', '#16a34a', '#f97316', '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6', '#f59e0b'][index % 8];

const addGroupedMetric = (map, key, patch = {}) => {
  const safeKey = key || '—';
  const current = map.get(safeKey) || { name: safeKey, revenue: 0, bookings: 0, received: 0, cancelled: 0, completed: 0 };
  map.set(safeKey, {
    ...current,
    revenue: current.revenue + Number(patch.revenue || 0),
    received: current.received + Number(patch.received || 0),
    bookings: current.bookings + Number(patch.bookings || 0),
    cancelled: current.cancelled + Number(patch.cancelled || 0),
    completed: current.completed + Number(patch.completed || 0),
    occupancy: patch.occupancy !== undefined ? patch.occupancy : current.occupancy,
  });
};

const buildBookingCommunicationEntries = (booking = {}) => {
  const serviceName = booking.tourTitle || booking.stayTitle || booking.title || 'TravelPay';
  const startDate = booking.travelDate || booking.checkInDate || booking.bookingDate || booking.createdAt;
  const endDate = booking.endDate || booking.checkOutDate || booking.travelDate || booking.bookingDate;
  const entries = [];

  if (booking.createdAt || booking.bookingDate) {
    entries.push({
      key: `comm-confirm-${booking.key || booking.id}`,
      date: booking.createdAt || booking.bookingDate,
      channel: 'Push',
      title: 'Booking confirmation',
      description: 'Ваше бронирование подтверждено',
      tone: 'success',
    });
  }
  if (Number(booking.prepaymentAmount || 0) > 0) {
    entries.push({
      key: `comm-prepay-${booking.key || booking.id}`,
      date: booking.paymentReviewedAt || booking.createdAt || booking.bookingDate,
      channel: 'Push',
      title: 'Payment confirmation',
      description: `Мы получили предоплату ${formatMoney(booking.prepaymentAmount)}`,
      tone: 'success',
    });
  }
  if (startDate && booking.type === 'tour_booking') {
    entries.push({
      key: `comm-tour-reminder-${booking.key || booking.id}`,
      date: dayjs(startDate).subtract(1, 'day').hour(10).minute(0).toISOString(),
      channel: 'WhatsApp',
      title: 'WhatsApp отправлен',
      description: `Напоминаем, завтра ваша поездка ${serviceName}`,
      tone: 'accent',
    });
  }
  if (startDate && booking.type === 'stay_booking') {
    entries.push({
      key: `comm-checkin-${booking.key || booking.id}`,
      date: dayjs(startDate).hour(8).minute(0).toISOString(),
      channel: 'Push',
      title: 'Check-in reminder',
      description: `Сегодня с ${booking.checkInTime || '14:00'} доступен заезд`,
      tone: 'info',
    });
  }
  if (getBookingDebtSummary(booking).remaining > 0) {
    entries.push({
      key: `comm-payment-reminder-${booking.key || booking.id}`,
      date: dayjs(startDate || booking.createdAt).subtract(12, 'hour').toISOString(),
      channel: 'Push',
      title: 'Payment reminder',
      description: `Остаток к оплате: ${formatMoney(getBookingDebtSummary(booking).remaining)}`,
      tone: 'warning',
    });
  }
  if (endDate && dayjs(endDate).isBefore(dayjs())) {
    entries.push({
      key: `comm-review-${booking.key || booking.id}`,
      date: dayjs(endDate).add(1, 'day').hour(12).minute(0).toISOString(),
      channel: 'Email',
      title: 'Review request',
      description: 'Спасибо за поездку. Оставьте отзыв',
      tone: 'info',
    });
  }

  return entries.filter((entry) => entry.date);
};

const getScheduleResourceKey = (entry = {}, groupBy = 'resources') => {
  if (groupBy === 'managers') {
    return entry.manager || entry.assignedTo || entry.companyName || 'Без менеджера';
  }
  if (groupBy === 'tours') {
    if (entry.type === 'stay_booking') return 'Жильё';
    return entry.title || entry.tourTitle || `Тур #${entry.tourId || entry.id}`;
  }
  if (entry.type === 'stay_booking') {
    return entry.stayTitle || entry.title || `Cottage #${entry.stayId || entry.id}`;
  }
  return entry.title || entry.tourTitle || `Тур #${entry.tourId || entry.id}`;
};

const getBookingUiStatus = (itemOrStatus, maybePaymentStatus) => {
  if (typeof itemOrStatus === 'object' && itemOrStatus !== null) {
    return getCanonicalBookingStatus(itemOrStatus);
  }

  return getCanonicalBookingStatus({ status: itemOrStatus, paymentStatus: maybePaymentStatus });
};

const getBookingStatusVisual = (status) => ({
  NEW: { label: 'Новая', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.13)' },
  PENDING: { label: 'Ожидает', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  CONFIRMED: { label: 'Подтверждено', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  AWAITING_PAYMENT: { label: 'Ждёт оплату', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  PARTIALLY_PAID: { label: 'Частично оплачено', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.14)' },
  PAID: { label: 'Оплачено', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  IN_PROGRESS: { label: 'В процессе', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.13)' },
  COMPLETED: { label: 'Завершено', color: '#64748b', bg: 'rgba(100, 116, 139, 0.13)' },
  CANCELLED: { label: 'Отменено', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
  NO_SHOW: { label: 'Не приехал', color: '#e8590c', bg: 'rgba(232, 89, 12, 0.13)' },
  RESCHEDULED: { label: 'Перенесено', color: '#7c5cff', bg: 'rgba(124, 92, 255, 0.14)' },
  CHECKED_IN: { label: 'Заселён', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  CHECKED_OUT: { label: 'Выехал', color: '#64748b', bg: 'rgba(100, 116, 139, 0.13)' },
  paid: { label: 'Подтверждено', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  confirmed: { label: 'Подтверждено', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  payment_review: { label: 'Чек на проверке', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.14)' },
  pending: { label: 'Ожидает', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  pending_payment: { label: 'Ждёт предоплату', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  new: { label: 'Новая заявка', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.13)' },
  cancelled: { label: 'Отменено', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
  rejected: { label: 'Отклонено', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
  completed: { label: 'Завершено', color: '#64748b', bg: 'rgba(100, 116, 139, 0.13)' },
}[status] || { label: 'Новая заявка', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.13)' });

const renderBookingStatusChip = (itemOrStatus, maybePaymentStatus) => {
  const statusKey = getBookingUiStatus(itemOrStatus, maybePaymentStatus);
  const meta = getBookingStatusVisual(statusKey);
  return (
    <span
      className="tp-admin-status-chip"
      style={{
        '--status-color': meta.color,
        '--status-bg': meta.bg,
      }}
    >
      <span className="tp-admin-status-chip__dot" />
      <span>{meta.label}</span>
    </span>
  );
};

const getStayBookingExtraLabel = (extra) => {
  if (!extra) return '';
  if (extra.selectedOptionLabel) return `${extra.title} · ${extra.selectedOptionLabel}`;
  if (Number(extra.quantity) > 1) return `${extra.title} · ${extra.quantity} шт.`;
  return extra.title;
};

const renderStayBookingExtras = (booking) => {
  if (booking?.type !== 'stay_booking') return null;
  const extras = Array.isArray(booking?.extras) ? booking.extras.filter((item) => item.title) : [];

  return (
    <Card size="small" className="tp-admin-inline-card" title="Дополнительные услуги">
      <Space orientation="vertical" size={10} style={{ width: '100%' }}>
        {extras.length ? extras.map((extra) => (
          <div key={`${extra.serviceId}-${extra.selectedOptionId || extra.quantity || 1}`} className="tp-admin-calendar-client-row">
            <div>
              <strong>{getStayBookingExtraLabel(extra)}</strong>
              <div><Text type="secondary">{formatMoney(extra.unitPrice)}{Number(extra.quantity) > 1 ? ` × ${extra.quantity}` : ''}</Text></div>
            </div>
            <strong>{formatMoney(extra.total)}</strong>
          </div>
        )) : <Text type="secondary">Дополнительные услуги не выбраны.</Text>}

        <Divider style={{ margin: '4px 0' }} />
        <div className="tp-admin-calendar-client-row">
          <div>
            <strong>Проживание</strong>
            <div><Text type="secondary">Базовая стоимость</Text></div>
          </div>
          <strong>{formatMoney(booking.baseAmount || Math.max((booking.amount || 0) - (booking.extrasAmount || 0), 0))}</strong>
        </div>
        {Number(booking.extrasAmount) > 0 && (
          <div className="tp-admin-calendar-client-row">
            <div>
              <strong>Доп. услуги</strong>
              <div><Text type="secondary">Сумма выбранных опций</Text></div>
            </div>
            <strong>{formatMoney(booking.extrasAmount)}</strong>
          </div>
        )}
        {Number(booking.prepaymentAmount) > 0 && (
          <div className="tp-admin-calendar-client-row">
            <div>
              <strong>Предоплата</strong>
              <div><Text type="secondary">{booking.prepaymentPercent ? `${booking.prepaymentPercent}%` : 'Частичная оплата'}</Text></div>
            </div>
            <strong>{formatMoney(booking.prepaymentAmount)}</strong>
          </div>
        )}
        <div className="tp-admin-calendar-client-row">
          <div>
            <strong>Итого</strong>
            <div><Text type="secondary">Полная стоимость заявки</Text></div>
          </div>
          <strong>{formatMoney(booking.amount)}</strong>
        </div>
      </Space>
    </Card>
  );
};

const renderStayBookingFinance = (booking) => {
  if (booking?.type !== 'stay_booking') return null;

  const baseAmount = Number(booking.baseAmount || Math.max((booking.amount || 0) - (booking.extrasAmount || 0), 0));
  const extrasAmount = Number(booking.extrasAmount || 0);
  const debt = getBookingDebtSummary(booking);
  const prepaymentAmount = Number(booking.prepaymentAmount || 0);
  const totalAmount = Number(booking.amount || 0);
  const remainingAmount = debt.remaining;

  return (
    <Card size="small" className="tp-admin-inline-card" title="Финансы заявки">
      <div className="tp-admin-finance-grid">
        <div className="tp-admin-finance-metric">
          <span>Проживание</span>
          <strong>{formatMoney(baseAmount)}</strong>
        </div>
        <div className="tp-admin-finance-metric">
          <span>Доп. услуги</span>
          <strong>{formatMoney(extrasAmount)}</strong>
        </div>
        <div className="tp-admin-finance-metric">
          <span>Предоплата</span>
          <strong>{formatMoney(prepaymentAmount)}</strong>
          <small>{booking.prepaymentPercent ? `${booking.prepaymentPercent}% от суммы` : 'Частичная оплата'}</small>
        </div>
        <div className="tp-admin-finance-metric">
          <span>Остаток к оплате</span>
          <strong>{formatMoney(remainingAmount)}</strong>
        </div>
      </div>
      <div className="tp-admin-finance-total">
        <span>Полная стоимость</span>
        <strong>{formatMoney(totalAmount)}</strong>
      </div>
    </Card>
  );
};

const renderStayBookingExtrasPreview = (booking) => {
  if (booking?.type !== 'stay_booking') return <Text type="secondary">—</Text>;
  const extras = Array.isArray(booking?.extras) ? booking.extras.filter((item) => item.title) : [];
  if (!extras.length) return <Text type="secondary">Без доп. услуг</Text>;

  const preview = extras.slice(0, 2);
  const hiddenCount = extras.length - preview.length;
  const tooltipContent = (
    <Space orientation="vertical" size={6}>
      {extras.map((extra) => (
        <div key={`tooltip-${extra.serviceId}-${extra.selectedOptionId || extra.quantity || 1}`}>
          <strong>{getStayBookingExtraLabel(extra)}</strong>{' '}
          <Text type="secondary">{formatMoney(extra.total)}</Text>
        </div>
      ))}
    </Space>
  );

  return (
    <Tooltip title={tooltipContent}>
      <Space size={[6, 6]} wrap>
        {preview.map((extra) => (
          <Tag key={`tag-${extra.serviceId}-${extra.selectedOptionId || extra.quantity || 1}`} color="cyan">
            {getStayBookingExtraLabel(extra)}
          </Tag>
        ))}
        {hiddenCount > 0 && <Tag>+{hiddenCount}</Tag>}
      </Space>
    </Tooltip>
  );
};

const buildStayBookingTimelineEntries = (booking, reviewerName) => {
  if (!booking || booking.type !== 'stay_booking') return [];

  const entries = [];

  if (booking.createdAt) {
    entries.push({
      key: 'created',
      tone: 'info',
      title: 'Заявка создана',
      time: booking.createdAt,
      description: 'Клиент отправил бронь на рассмотрение компании.',
    });
  }

  if (booking.paymentReceiptUrl) {
    entries.push({
      key: 'receipt',
      tone: 'accent',
      title: 'Чек предоплаты загружен',
      time: booking.createdAt || booking.updatedAt,
      description: booking.paymentReceiptName ? `Файл: ${booking.paymentReceiptName}` : 'Чек прикреплён к заявке.',
    });
  }

  if (booking.status === 'confirmed' && booking.paymentReviewedAt) {
    entries.push({
      key: 'confirmed',
      tone: 'success',
      title: 'Заявка подтверждена',
      time: booking.paymentReviewedAt,
      description: reviewerName ? `Подтвердил: ${reviewerName}` : 'Подтверждено компанией.',
    });
  }

  if (booking.status === 'rejected' && booking.paymentReviewedAt) {
    entries.push({
      key: 'rejected',
      tone: 'danger',
      title: 'Заявка отклонена',
      time: booking.paymentReviewedAt,
      description: reviewerName
        ? `${reviewerName}${booking.rejectionReason ? ` · ${booking.rejectionReason}` : ''}`
        : (booking.rejectionReason || 'Компания отклонила заявку.'),
    });
  }

  if (booking.status === 'cancelled') {
    entries.push({
      key: 'cancelled',
      tone: 'muted',
      title: 'Бронь отменена',
      time: booking.updatedAt || booking.paymentReviewedAt || booking.createdAt,
      description: 'Заявка была отменена после создания.',
    });
  }

  return entries;
};

const buildBusinessSubscriptionTimelineEntries = (request, reviewerName) => {
  if (!request) return [];

  const entries = [];

  if (request.createdAt) {
    entries.push({
      key: 'submitted',
      tone: 'info',
      title: 'Отправлена',
      time: request.createdAt,
      description: 'Компания отправила документы и оплату подписки.',
    });
  }

  entries.push({
    key: 'review',
    tone: request.status === 'pending' ? 'accent' : 'info',
    title: 'На проверке',
    time: request.createdAt || new Date().toISOString(),
    description: 'Заявка ожидает решение супер-админа.',
  });

  if (request.status === 'approved' && request.reviewedAt) {
    entries.push({
      key: 'approved',
      tone: 'success',
      title: 'Подтверждена',
      time: request.reviewedAt,
      description: request.adminComment || (reviewerName ? `Подтвердил: ${reviewerName}.` : 'Подписка активирована.'),
    });
  }

  if (request.status === 'rejected' && request.reviewedAt) {
    entries.push({
      key: 'rejected',
      tone: 'danger',
      title: 'Отклонена',
      time: request.reviewedAt,
      description: request.adminComment || (reviewerName ? `Отклонил: ${reviewerName}.` : 'Заявка отклонена супер-админом.'),
    });
  }

  return entries;
};

const buildStayBookingEditorExtras = (services = [], extras = []) => {
  const byId = new Map((extras || []).map((item) => [String(item.serviceId), item]));
  return services.reduce((acc, service) => {
    const current = byId.get(String(service.id));
    if (service.type === 'quantity') {
      acc[service.id] = { quantity: Number(current?.quantity || 0) };
    } else if (service.type === 'select') {
      acc[service.id] = { selectedOptionId: current?.selectedOptionId || '' };
    } else {
      acc[service.id] = { selected: Boolean(current?.selected || current?.quantity > 0) };
    }
    return acc;
  }, {});
};

const buildStayBookingEditorExtrasSummary = (services = [], selections = {}) => (
  services.map((service) => {
    const selection = selections[service.id] || {};
    if (service.type === 'quantity') {
      const quantity = Math.min(Math.max(Number(selection.quantity) || 0, 0), Math.max(Number(service.maxQuantity) || 1, 1));
      return {
        serviceId: service.id,
        title: service.title,
        quantity,
        selected: quantity > 0,
        selectedOptionId: '',
        selectedOptionLabel: '',
        unitPrice: Number(service.price || 0),
        total: quantity * Number(service.price || 0),
      };
    }

    if (service.type === 'select') {
      const option = (service.options || []).find((item) => String(item.id) === String(selection.selectedOptionId));
      return {
        serviceId: service.id,
        title: service.title,
        quantity: option ? 1 : 0,
        selected: Boolean(option),
        selectedOptionId: option?.id || '',
        selectedOptionLabel: option?.label || '',
        unitPrice: Number(option?.price || 0),
        total: Number(option?.price || 0),
      };
    }

    const selected = Boolean(selection.selected);
    return {
      serviceId: service.id,
      title: service.title,
      quantity: selected ? 1 : 0,
      selected,
      selectedOptionId: '',
      selectedOptionLabel: '',
      unitPrice: Number(service.price || 0),
      total: selected ? Number(service.price || 0) : 0,
    };
  }).filter((item) => item.selected || item.quantity > 0)
);

const toDayjsField = (value) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const ActualToursAdmin = ({ businessMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const isMobileViewport = !screens.md;
  const weekBoardRef = useRef(null);
  const calendarRequestIdRef = useRef(0);
  const calendarAbortControllerRef = useRef(null);
  const sessionUser = readCurrentUser();
  const isSuperAdmin = sessionUser?.role === 'super_admin';
  const basePath = businessMode ? '/business' : '/admin';
  const homePath = businessMode ? '/business/dashboard' : '/admin/home';

  const [tourForm] = Form.useForm();
  const [accommodationForm] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [companyRequestReviewForm] = Form.useForm();
  const [businessProfileForm] = Form.useForm();
  const [stayBookingDecisionForm] = Form.useForm();
  const [stayBookingForm] = Form.useForm();
  const [quickBookingForm] = Form.useForm();
  const watchedStayBookingNights = Form.useWatch('nights', stayBookingForm);

  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [stayBookings, setStayBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);
  const [businessStaff, setBusinessStaff] = useState([]);
  const [topupRequests, setTopupRequests] = useState([]);
  const [businessSubscriptionRequests, setBusinessSubscriptionRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState('');
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine);
  const [tourDrawerOpen, setTourDrawerOpen] = useState(false);
  const [accommodationDrawerOpen, setAccommodationDrawerOpen] = useState(false);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editingAccommodationId, setEditingAccommodationId] = useState(null);
  const [tourSaving, setTourSaving] = useState(false);
  const [accommodationSaving, setAccommodationSaving] = useState(false);
  const [editingStayBooking, setEditingStayBooking] = useState(null);
  const [stayBookingDrawerOpen, setStayBookingDrawerOpen] = useState(false);
  const [stayBookingEditLoading, setStayBookingEditLoading] = useState(false);
  const [stayBookingEditorExtras, setStayBookingEditorExtras] = useState({});
  const [quickBookingDrawerOpen, setQuickBookingDrawerOpen] = useState(false);
  const [quickBookingSaving, setQuickBookingSaving] = useState(false);
  const [quickBookingSlots, setQuickBookingSlots] = useState([]);
  const [quickBookingSlotsLoading, setQuickBookingSlotsLoading] = useState(false);
  const [quickBookingWaitlistSaving, setQuickBookingWaitlistSaving] = useState(false);
  const [departureOpsDrawerItem, setDepartureOpsDrawerItem] = useState(null);
  const [departureOpsSaving, setDepartureOpsSaving] = useState(false);
  const [scheduleDragAction, setScheduleDragAction] = useState(null);
  const [reviewRequest, setReviewRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('approve');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [messageState, setMessageState] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('travelpay.admin.sidebar.collapsed') === 'true');
  const [theme, setTheme] = useState(() => (
    localStorage.getItem('travelpay_admin_theme')
    || localStorage.getItem('travelpay_theme')
    || 'dark'
  ));

  const [tourSearch, setTourSearch] = useState('');
  const [tourStatusFilter, setTourStatusFilter] = useState('all');
  const [taskViewMode, setTaskViewMode] = useState('kanban');
  const [clientSearch, setClientSearch] = useState('');
  const [clientSegmentFilter, setClientSegmentFilter] = useState('all');
  const [clientDrawerItem, setClientDrawerItem] = useState(null);
  const [propertyDetailItem, setPropertyDetailItem] = useState(null);
  const [bookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingManagerFilter, setBookingManagerFilter] = useState('all');
  const [bookingExtraFilter, setBookingExtraFilter] = useState('all');
  const [calendarDate, setCalendarDate] = useState(dayjs());
  const [bookingTab, setBookingTab] = useState(() => {
    const savedView = localStorage.getItem('travelpay.admin.calendar.view');
    return ['day', 'three-day', 'week', 'month', 'list'].includes(savedView) ? savedView : 'day';
  });
  const [calendarResource, setCalendarResource] = useState('tours');
  const [scheduleGroupBy, setScheduleGroupBy] = useState('resources');
  const [weekManagerSelection, setWeekManagerSelection] = useState([]);
  const [calendarCompanyFilter, setCalendarCompanyFilter] = useState('all');
  const [calendarTourFilter, setCalendarTourFilter] = useState('all');
  const [calendarStatusFilter, setCalendarStatusFilter] = useState('all');
  const [calendarPaymentFilter, setCalendarPaymentFilter] = useState('all');
  const [calendarSearch, setCalendarSearch] = useState('');
  const [calendarSearchInput, setCalendarSearchInput] = useState('');
  const [calendarFiltersDrawerOpen, setCalendarFiltersDrawerOpen] = useState(false);
  const [calendarDrawerItem, setCalendarDrawerItem] = useState(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState('');
  const [analyticsPeriod, setAnalyticsPeriod] = useState('day');
  const [analyticsRange, setAnalyticsRange] = useState([dayjs().startOf('day'), dayjs().endOf('day')]);
  const [notificationRules, setNotificationRules] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('travelpay.business.notificationRules') || '[]');
      if (Array.isArray(saved) && saved.length) {
        const savedByKey = new Map(saved.map((rule) => [rule.key, rule]));
        return DEFAULT_NOTIFICATION_RULES.map((rule) => ({ ...rule, ...(savedByKey.get(rule.key) || {}) }));
      }
    } catch (error) {
      // Ignore broken local rule drafts and fall back to defaults.
    }
    return DEFAULT_NOTIFICATION_RULES;
  });
  const [catalogMode, setCatalogMode] = useState(getCatalogMode(location.pathname));
  const [companyOnboardingSearch, setCompanyOnboardingSearch] = useState('');
  const [companyOnboardingStatusFilter, setCompanyOnboardingStatusFilter] = useState('all');
  const [companyCenterCompanyId, setCompanyCenterCompanyId] = useState(null);
  const [stayBookingDecisionOpen, setStayBookingDecisionOpen] = useState(false);
  const [stayBookingDecisionLoading, setStayBookingDecisionLoading] = useState(false);
  const [stayBookingDecisionItem, setStayBookingDecisionItem] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [companyRequestReviewOpen, setCompanyRequestReviewOpen] = useState(false);
  const [companyRequestReviewLoading, setCompanyRequestReviewLoading] = useState(false);
  const [companyRequestReviewAction, setCompanyRequestReviewAction] = useState('approve');
  const [companyRequestReviewItem, setCompanyRequestReviewItem] = useState(null);
  const [businessProfileSaving, setBusinessProfileSaving] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');

  useEffect(() => {
    localStorage.setItem('travelpay.admin.sidebar.collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('travelpay.business.notificationRules', JSON.stringify(notificationRules));
  }, [notificationRules]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const syncNetwork = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', syncNetwork);
    window.addEventListener('offline', syncNetwork);
    return () => {
      window.removeEventListener('online', syncNetwork);
      window.removeEventListener('offline', syncNetwork);
    };
  }, []);

  const hasAccommodation = Form.useWatch('hasAccommodation', tourForm);
  const quickBookingResource = Form.useWatch('resource', quickBookingForm);
  const quickBookingObjectId = Form.useWatch('objectId', quickBookingForm);
  const quickBookingClientId = Form.useWatch('clientId', quickBookingForm);
  const quickBookingDate = Form.useWatch('checkInDate', quickBookingForm);
  const quickBookingStartTime = Form.useWatch('startTime', quickBookingForm);
  const quickBookingEndTime = Form.useWatch('endTime', quickBookingForm);
  const quickBookingPeople = Form.useWatch('people', quickBookingForm);
  const quickBookingDepartureSlotId = Form.useWatch('departureSlotId', quickBookingForm);
  const currentTab = useMemo(() => getCurrentTab(location.pathname), [location.pathname]);
  const canBusinessPermission = useCallback((permission) => !businessMode || canBusiness(sessionUser, permission), [businessMode, sessionUser]);
  const isCalendarTab = currentTab === 'bookings' || currentTab === 'calendar' || currentTab === 'schedule';

  useEffect(() => {
    if (!businessMode) return;
    const requiredPermission = BUSINESS_TAB_PERMISSIONS[currentTab];
    if (!requiredPermission || canBusinessPermission(requiredPermission)) return;
    navigate(getBusinessHomePathForRole(sessionUser, basePath), { replace: true });
  }, [basePath, businessMode, canBusinessPermission, currentTab, navigate, sessionUser]);

  useEffect(() => {
    if (currentTab !== 'schedule') return;
    const params = new URLSearchParams(location.search);
    const queryDate = params.get('date');
    const queryView = params.get('view');
    const parsedDate = queryDate ? dayjs(queryDate) : null;

    if (parsedDate?.isValid() && !parsedDate.isSame(calendarDate, 'day')) {
      setCalendarDate(parsedDate);
    }

    if (queryView && SCHEDULE_VIEW_OPTIONS.includes(queryView) && queryView !== bookingTab) {
      setBookingTab(queryView);
      return;
    }

    if (!queryView && bookingTab !== 'day') {
      setBookingTab('day');
    }
  }, [bookingTab, calendarDate, currentTab, location.search]);

  useEffect(() => {
    setCatalogMode(getCatalogMode(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('travelpay_admin_theme', theme);
    localStorage.setItem('travelpay_theme', theme);

    return () => {
      document.body.classList.remove('dark');
    };
  }, [theme]);

  const loadDashboardData = useCallback(async ({ includeBookings = true } = {}) => {
    setLoading(true);
    if (includeBookings) {
      setCalendarLoading(true);
      setCalendarError('');
    }
    try {
      const [toursResponse, usersResponse, companiesResponse, accommodationsResponse, stayBookingsResponse, tourBookingsResponse, topupsResponse, businessSubscriptionsResponse, staffResponse] = await Promise.all([
        api.get('/tours'),
        api.get('/users'),
        api.get('/companies').catch(() => ({ data: [] })),
        api.get('/accommodations').catch(() => ({ data: [] })),
        includeBookings ? api.get('/stay-bookings').catch(() => ({ data: [] })) : Promise.resolve({ data: null }),
        includeBookings ? api.get('/tour-bookings').catch(() => ({ data: [] })) : Promise.resolve({ data: null }),
        api.get('/api/admin/topups').catch(() => ({ data: [] })),
        api.get('/api/admin/business-subscriptions').catch(() => ({ data: [] })),
        api.get('/business/managers').catch(() => ({ data: [] })),
      ]);

      setTours((toursResponse.data || []).map(normalizeTourRecord));
      setUsers((usersResponse.data || []).map(normalizeUser));
      setCompanies(companiesResponse.data || []);
      setAccommodations((accommodationsResponse.data || []).map(normalizeAccommodation));
      if (includeBookings) {
        setStayBookings((stayBookingsResponse.data || []).map(normalizeStayBooking));
        setTourBookings((tourBookingsResponse.data || []).map(normalizeTourBooking));
      }
      setTopupRequests(topupResponseSort(topupsResponse.data || []));
      setBusinessSubscriptionRequests(Array.isArray(businessSubscriptionsResponse.data) ? businessSubscriptionsResponse.data : []);
      setBusinessStaff(Array.isArray(staffResponse.data) ? staffResponse.data : []);
    } catch (error) {
      setMessageState({ type: 'error', text: 'Не удалось загрузить данные админ-панели.' });
      if (includeBookings) {
        setCalendarError('Не удалось загрузить календарь. Проверьте подключение и повторите попытку.');
      }
    } finally {
      setLoading(false);
      if (includeBookings) setCalendarLoading(false);
    }
  }, []);

  const loadCalendarPeriod = useCallback(async () => {
    const start = bookingTab === 'month'
      ? calendarDate.startOf('month')
      : bookingTab === 'week' || bookingTab === 'list'
        ? dayjs(startOfWeek(calendarDate.toDate())).startOf('day')
        : calendarDate.startOf('day');
    const end = bookingTab === 'month'
      ? calendarDate.endOf('month')
      : bookingTab === 'week' || bookingTab === 'list'
        ? start.add(6, 'day').endOf('day')
        : bookingTab === 'three-day'
          ? start.add(2, 'day').endOf('day')
          : calendarDate.endOf('day');
    const params = new URLSearchParams({ from: start.format('YYYY-MM-DD'), to: end.format('YYYY-MM-DD') });
    const requestId = calendarRequestIdRef.current + 1;
    calendarRequestIdRef.current = requestId;
    calendarAbortControllerRef.current?.abort();
    const controller = new AbortController();
    calendarAbortControllerRef.current = controller;

    setCalendarLoading(true);
    setCalendarError('');
    try {
      if (calendarResource === 'stays') {
        const stayResponse = await api.get(`/stay-bookings?${params.toString()}`, { signal: controller.signal });
        if (requestId !== calendarRequestIdRef.current) return;
        setStayBookings((stayResponse.data || []).map(normalizeStayBooking));
      } else {
        const tourResponse = await api.get(`/tour-bookings?${params.toString()}`, { signal: controller.signal });
        if (requestId !== calendarRequestIdRef.current) return;
        setTourBookings((tourResponse.data || []).map(normalizeTourBooking));
      }
    } catch (error) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return;
      if (requestId !== calendarRequestIdRef.current) return;
      setCalendarError('Не удалось загрузить бронирования за выбранный период.');
    } finally {
      if (requestId === calendarRequestIdRef.current) setCalendarLoading(false);
    }
  }, [bookingTab, calendarDate, calendarResource]);

  const refreshBusinessData = useCallback((options = {}) => {
    if (isCalendarTab) return loadCalendarPeriod();
    return loadDashboardData(options);
  }, [isCalendarTab, loadCalendarPeriod, loadDashboardData]);

  useEffect(() => {
    loadDashboardData({ includeBookings: !isCalendarTab });
  }, [isCalendarTab, loadDashboardData]);

  useEffect(() => {
    if (isCalendarTab) loadCalendarPeriod();
  }, [isCalendarTab, loadCalendarPeriod]);

  useEffect(() => {
    const handleBusinessDataChanged = () => {
      if (document.visibilityState === 'hidden') return;
      refreshBusinessData({ includeBookings: true });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshBusinessData({ includeBookings: true });
    };

    window.addEventListener('travelpay-business-data-changed', handleBusinessDataChanged);
    window.addEventListener('travelpay-catalog-updated', handleBusinessDataChanged);
    window.addEventListener('focus', handleBusinessDataChanged);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      refreshBusinessData({ includeBookings: true });
    }, 45000);

    return () => {
      window.removeEventListener('travelpay-business-data-changed', handleBusinessDataChanged);
      window.removeEventListener('travelpay-catalog-updated', handleBusinessDataChanged);
      window.removeEventListener('focus', handleBusinessDataChanged);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(refreshInterval);
    };
  }, [refreshBusinessData]);

  useEffect(() => () => calendarAbortControllerRef.current?.abort(), []);

  useEffect(() => {
    if (menuOpen && !isDesktop) {
      document.body.classList.add('travelpay-admin-drawer-open');
    } else {
      document.body.classList.remove('travelpay-admin-drawer-open');
    }

    return () => {
      document.body.classList.remove('travelpay-admin-drawer-open');
    };
  }, [isDesktop, menuOpen]);

  useEffect(() => {
    if (!isCalendarTab || (bookingTab !== 'week' && bookingTab !== 'three-day')) return;
    const selectedDay = weekBoardRef.current?.querySelector('.tp-admin-week-board__day-tab.is-selected');
    selectedDay?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [bookingTab, calendarDate, isCalendarTab]);

  useEffect(() => {
    localStorage.setItem('travelpay.admin.calendar.view', bookingTab);
  }, [bookingTab]);

  useEffect(() => {
    if (!isCalendarTab || isDesktop) return;
    if (isMobileViewport) setBookingTab('day');
  }, [isCalendarTab, isDesktop, isMobileViewport]);

  useEffect(() => {
    if (bookingTab === 'three-day' || bookingTab === 'list') setBookingTab('day');
  }, [bookingTab, isDesktop, isMobileViewport]);

  useEffect(() => {
    setCalendarTourFilter('all');
  }, [calendarResource]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCalendarSearch(calendarSearchInput.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [calendarSearchInput]);

  useEffect(() => {
    const tourId = Number(quickBookingObjectId);
    if (!quickBookingDrawerOpen || !isQuickBookingTourKind(quickBookingResource) || !tourId) {
      setQuickBookingSlots([]);
      return undefined;
    }

    let active = true;
    setQuickBookingSlotsLoading(true);
    api.get(`/tour-bookings/availability?tourId=${tourId}`)
      .then((response) => {
        if (!active) return;
        const slots = Array.isArray(response.data) ? response.data : [];
        setQuickBookingSlots(slots);
        const requestedDate = dayjs(quickBookingForm.getFieldValue('checkInDate'));
        const requestedTime = quickBookingForm.getFieldValue('startTime');
        const selectedSlot = quickBookingForm.getFieldValue('departureSlotId');
        const preferredStart = requestedDate.isValid() && requestedTime
          ? dayjs(`${requestedDate.format('YYYY-MM-DD')}T${requestedTime}`)
          : null;
        const matchingSlot = preferredStart?.isValid()
          ? slots.find((slot) => slot.active !== false && slot.available !== false && !slot.soldOut && dayjs(slot.startAt).isSame(preferredStart, 'minute'))
          : null;
        if (!selectedSlot && matchingSlot?.id) {
          quickBookingForm.setFieldsValue({ departureSlotId: matchingSlot.id });
        }
      })
      .catch(() => {
        if (active) setQuickBookingSlots([]);
      })
      .finally(() => {
        if (active) setQuickBookingSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [quickBookingDrawerOpen, quickBookingForm, quickBookingObjectId, quickBookingResource]);

  const currentCompany = useMemo(() => {
    if (!companies.length) return null;
    return companies.find((item) => Number(item.id) === Number(sessionUser?.companyId)) || companies[0];
  }, [companies, sessionUser?.companyId]);

  const companiesById = useMemo(() => (
    new Map(companies.map((company) => [Number(company.id), company]))
  ), [companies]);
  const usersById = useMemo(() => (
    new Map(users.map((user) => [Number(user.id), user]))
  ), [users]);
  const liveSessionUser = useMemo(
    () => users.find((user) => Number(user.id) === Number(sessionUser?.id)) || sessionUser || null,
    [sessionUser, users],
  );
  const userNotifications = useMemo(
    () => (Array.isArray(liveSessionUser?.notifications) ? [...liveSessionUser.notifications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) : []),
    [liveSessionUser?.notifications],
  );
  const currentCompanySubscriptionMeta = useMemo(
    () => SUBSCRIPTION_STATUS_META[currentCompany?.subscriptionStatus] || SUBSCRIPTION_STATUS_META.pending_payment,
    [currentCompany?.subscriptionStatus],
  );
  const pendingBusinessSubscriptionRequests = useMemo(
    () => businessSubscriptionRequests.filter((item) => item.status === 'pending'),
    [businessSubscriptionRequests],
  );
  const businessRequestsByCompany = useMemo(() => {
    const map = new Map();
    businessSubscriptionRequests.forEach((request) => {
      const companyId = Number(request.companyId);
      const list = map.get(companyId) || [];
      list.push(request);
      map.set(companyId, list);
    });

    map.forEach((list, key) => {
      map.set(key, [...list].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)));
    });

    return map;
  }, [businessSubscriptionRequests]);
  const expiringCompanies = useMemo(() => companies.filter((company) => {
    const meta = getSubscriptionHealthMeta(company);
    return company.subscriptionStatus === 'active' && meta.daysRemaining !== null && meta.daysRemaining <= 3;
  }), [companies]);
  const companyCenterCompany = useMemo(() => (
    companyCenterCompanyId ? (companiesById.get(Number(companyCenterCompanyId)) || null) : null
  ), [companiesById, companyCenterCompanyId]);
  const companyCenterRequests = useMemo(() => (
    companyCenterCompanyId ? (businessRequestsByCompany.get(Number(companyCenterCompanyId)) || []) : []
  ), [businessRequestsByCompany, companyCenterCompanyId]);
  const currentBusinessSubscriptionRequest = useMemo(() => (
    [...businessSubscriptionRequests]
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))[0] || null
  ), [businessSubscriptionRequests]);
  const currentCompanyBillingHistory = useMemo(() => (
    currentCompany?.id ? (businessRequestsByCompany.get(Number(currentCompany.id)) || []) : []
  ), [businessRequestsByCompany, currentCompany?.id]);
  const currentBusinessRequestReviewerName = useMemo(() => (
    currentBusinessSubscriptionRequest?.reviewedBy
      ? (usersById.get(Number(currentBusinessSubscriptionRequest.reviewedBy))?.name || '')
      : ''
  ), [currentBusinessSubscriptionRequest?.reviewedBy, usersById]);
  const currentBusinessRequestTimeline = useMemo(() => (
    buildBusinessSubscriptionTimelineEntries(currentBusinessSubscriptionRequest, currentBusinessRequestReviewerName)
  ), [currentBusinessSubscriptionRequest, currentBusinessRequestReviewerName]);
  const primaryPaymentMethod = useMemo(() => {
    const methods = Array.isArray(currentCompany?.paymentMethods) ? currentCompany.paymentMethods : [];
    return methods.find((method) => method.primary) || methods[0] || {};
  }, [currentCompany?.paymentMethods]);
  useEffect(() => {
    if (!currentCompany) return;
    businessProfileForm.setFieldsValue({
      logo: currentCompany.logo,
      cover: currentCompany.cover,
      name: currentCompany.name,
      description: currentCompany.description,
      phone: currentCompany.phone,
      whatsapp: currentCompany.whatsapp || currentCompany.phone,
      instagramUrl: currentCompany.instagramUrl,
      website: currentCompany.website,
      address: currentCompany.address,
      city: currentCompany.city,
      region: currentCompany.region,
      workingHours: currentCompany.workingHours,
      managerPhone: currentCompany.managerPhone,
      documents: Array.isArray(currentCompany.documents) ? currentCompany.documents : [],
      paymentMethods: Array.isArray(currentCompany.paymentMethods) && currentCompany.paymentMethods.length
        ? currentCompany.paymentMethods
        : [{ type: 'qr', title: 'Main QR', qrCodeUrl: primaryPaymentMethod.qrCodeUrl || '/images/payment-qr.png', primary: true, active: true }],
    });
  }, [businessProfileForm, currentCompany, primaryPaymentMethod.qrCodeUrl]);
  const previewIsPdf = useMemo(
    () => String(documentPreview?.type || documentPreview?.url || '').toLowerCase().includes('pdf'),
    [documentPreview],
  );
  const businessRequestReviewerName = useMemo(() => (
    companyRequestReviewItem?.reviewedBy
      ? (usersById.get(Number(companyRequestReviewItem.reviewedBy))?.name || '')
      : ''
  ), [companyRequestReviewItem?.reviewedBy, usersById]);
  const businessRequestTimeline = useMemo(() => (
    buildBusinessSubscriptionTimelineEntries(companyRequestReviewItem, businessRequestReviewerName)
  ), [companyRequestReviewItem, businessRequestReviewerName]);
  const calendarDrawerReviewerName = useMemo(() => (
    calendarDrawerItem?.paymentReviewedBy
      ? (usersById.get(Number(calendarDrawerItem.paymentReviewedBy))?.name || '')
      : ''
  ), [calendarDrawerItem?.paymentReviewedBy, usersById]);
  const calendarDrawerTimeline = useMemo(() => (
    buildStayBookingTimelineEntries(calendarDrawerItem, calendarDrawerReviewerName)
  ), [calendarDrawerItem, calendarDrawerReviewerName]);
  const calendarDrawerStatusHistory = useMemo(() => {
    if (!calendarDrawerItem || !Array.isArray(calendarDrawerItem.statusHistory)) return [];

    const getHistoryValueLabel = (field, value) => {
      if (!value) return '—';
      const raw = String(value);
      const upper = raw.toUpperCase();
      if (field === 'paymentStatus' || field === 'paymentStatusCode') {
        return (PAYMENT_STATUS_META[upper] || PAYMENT_STATUS_META[raw])?.label || raw;
      }
      return (BOOKING_STATUS_META[upper] || BOOKING_STATUS_META[raw])?.label || raw;
    };

    return [...calendarDrawerItem.statusHistory]
      .sort((left, right) => new Date(right.changedAt || right.createdAt || 0) - new Date(left.changedAt || left.createdAt || 0))
      .map((entry, index) => {
        const field = entry.field === 'paymentStatusCode' ? 'paymentStatus' : (entry.field || 'bookingStatus');
        const isPayment = field === 'paymentStatus';
        const toCode = String(entry.to || '').toUpperCase();
        const meta = isPayment
          ? (PAYMENT_STATUS_META[toCode] || PAYMENT_STATUS_META.UNPAID)
          : (BOOKING_STATUS_META[toCode] || BOOKING_STATUS_META.NEW);

        return {
          key: entry.id || `${field}-${entry.changedAt || index}`,
          fieldLabel: isPayment ? 'Оплата' : 'Бронь',
          fromLabel: getHistoryValueLabel(field, entry.from),
          toLabel: getHistoryValueLabel(field, entry.to),
          actor: entry.actorName || entry.actorRole || 'TravelPay',
          changedAt: entry.changedAt || entry.createdAt,
          comment: entry.comment,
          color: meta.dot || meta.color || '#2563eb',
        };
      });
  }, [calendarDrawerItem]);

  const totalRevenue = users.reduce((sum, user) => (
    sum + (user?.travelHistory || []).reduce((inner, item) => inner + Number(item.amount || 0), 0)
  ), 0);
  const totalPayments = users.reduce((sum, user) => (
    sum + (user?.topUps || []).reduce((inner, item) => inner + Number(item.amount || 0), 0)
  ), 0);
  const pendingTopups = topupRequests.filter((request) => request.status === 'pending');
  const approvedTopups = topupRequests.filter((request) => request.status === 'approved');
  const pendingTopupAmount = pendingTopups.reduce((sum, request) => sum + Number(request.amount || 0), 0);
  const approvedTopupAmount = approvedTopups.reduce((sum, request) => sum + Number(request.amount || 0), 0);
  const approvedBonusAmount = approvedTopups.reduce((sum, request) => sum + Number(request.bonus || 0), 0);
  const statusCounts = useMemo(() => tours.reduce((accumulator, tour) => {
    accumulator[tour.status] = (accumulator[tour.status] || 0) + 1;
    return accumulator;
  }, {}), [tours]);

  const bookingRows = useMemo(() => {
    const trackedHistoryIds = new Set(tourBookings.flatMap((item) => [
      String(item.id),
      `tour-booking-${item.id}`,
    ]));
    const legacyTourBookings = users.flatMap((user) => (user?.travelHistory || [])
      .filter((item) => !trackedHistoryIds.has(String(item.id)) && !trackedHistoryIds.has(`tour-booking-${item.id}`))
      .map((item, index) => ({
      key: `${user.id}-travel-${index}`,
      type: 'tour_booking',
      ...item,
      clientId: user.id,
      clientName: item.clientName || user.name,
      clientEmail: item.clientEmail || user.email,
      clientPhone: item.clientPhone || user.phone || '—',
      assignedTo: item.assignedTo || currentCompany?.name || 'TravelPay Team',
      bookingDate: item.date || item.travelDate || item.purchasedAt,
      })));

    return [...tourBookings, ...legacyTourBookings, ...stayBookings];
  }, [currentCompany?.name, stayBookings, tourBookings, users]);

  const analyticsWindow = useMemo(() => {
    const now = dayjs();
    if (analyticsPeriod === 'custom' && Array.isArray(analyticsRange) && analyticsRange[0] && analyticsRange[1]) {
      return {
        start: dayjs(analyticsRange[0]).startOf('day'),
        end: dayjs(analyticsRange[1]).endOf('day'),
      };
    }

    return {
      start: now.startOf(analyticsPeriod),
      end: now.endOf(analyticsPeriod),
    };
  }, [analyticsPeriod, analyticsRange]);

  const analyticsKpis = useMemo(() => {
    const getBookingDate = (booking) => dayjs(booking.bookingDate || booking.travelDate || booking.checkInDate || booking.createdAt || booking.date);
    const inRange = (booking) => {
      const date = getBookingDate(booking);
      return date.isValid()
        && (date.isAfter(analyticsWindow.start) || date.isSame(analyticsWindow.start))
        && (date.isBefore(analyticsWindow.end) || date.isSame(analyticsWindow.end));
    };
    const rows = bookingRows.filter(inRange);
    const clientKey = (booking) => String(booking.clientPhone || booking.clientEmail || booking.clientName || booking.clientId || booking.userId || booking.id).trim().toLowerCase();
    const firstBookingByClient = bookingRows.reduce((map, booking) => {
      const key = clientKey(booking);
      const date = getBookingDate(booking);
      if (!key || !date.isValid()) return map;
      const previous = map.get(key);
      if (!previous || date.isBefore(previous)) map.set(key, date);
      return map;
    }, new Map());
    const rangeClients = new Set(rows.map(clientKey).filter(Boolean));
    const revenue = rows.reduce((sum, booking) => sum + Number(booking.amount || booking.price || 0), 0);
    const received = rows.reduce((sum, booking) => sum + getBookingDebtSummary(booking).paid, 0);
    const completed = rows.filter((booking) => ['COMPLETED', 'CHECKED_OUT'].includes(getCanonicalBookingStatus(booking)) || ['completed', 'checked_out'].includes(String(booking.status || '').toLowerCase())).length;
    const cancelled = rows.filter((booking) => ['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking)) || ['cancelled', 'rejected', 'no_show'].includes(String(booking.status || '').toLowerCase())).length;
    const newClients = Array.from(rangeClients).filter((key) => {
      const first = firstBookingByClient.get(key);
      return first && (first.isAfter(analyticsWindow.start) || first.isSame(analyticsWindow.start)) && (first.isBefore(analyticsWindow.end) || first.isSame(analyticsWindow.end));
    }).length;

    const daysInWindow = Math.max(analyticsWindow.end.diff(analyticsWindow.start, 'day') + 1, 1);
    const bucketUnit = daysInWindow > 370 ? 'month' : daysInWindow > 95 ? 'week' : 'day';
    const bucketFormat = bucketUnit === 'month' ? 'MMM YYYY' : bucketUnit === 'week' ? 'DD MMM' : 'DD MMM';
    const bucketMap = new Map();
    let cursor = analyticsWindow.start.startOf(bucketUnit);
    while (cursor.isBefore(analyticsWindow.end) || cursor.isSame(analyticsWindow.end, bucketUnit)) {
      const key = cursor.format(bucketFormat);
      bucketMap.set(key, { date: key, revenue: 0, bookings: 0, average: 0 });
      cursor = cursor.add(1, bucketUnit);
    }

    const statusMap = new Map();
    const paymentStatusMap = new Map();
    const sourceMap = new Map();
    const tourMap = new Map();
    const propertyMap = new Map();
    const managerMap = new Map();

    rows.forEach((booking) => {
      const date = getBookingDate(booking);
      const bucketKey = date.isValid() ? date.startOf(bucketUnit).format(bucketFormat) : '—';
      const debt = getBookingDebtSummary(booking);
      const bookingRevenue = Number(booking.amount || booking.price || 0);
      const status = getCanonicalBookingStatus(booking);
      const paymentStatus = getCanonicalPaymentStatus(booking);
      const isCancelled = ['CANCELLED', 'NO_SHOW'].includes(status) || ['cancelled', 'rejected', 'no_show'].includes(String(booking.status || '').toLowerCase());
      const isCompleted = ['COMPLETED', 'CHECKED_OUT'].includes(status) || ['completed', 'checked_out'].includes(String(booking.status || '').toLowerCase());

      if (!bucketMap.has(bucketKey)) bucketMap.set(bucketKey, { date: bucketKey, revenue: 0, bookings: 0, average: 0 });
      const bucket = bucketMap.get(bucketKey);
      bucket.revenue += bookingRevenue;
      bucket.bookings += 1;
      bucket.average = Math.round(bucket.revenue / Math.max(bucket.bookings, 1));

      addGroupedMetric(statusMap, BOOKING_STATUS_META[status]?.label || status, { bookings: 1, revenue: bookingRevenue });
      addGroupedMetric(paymentStatusMap, PAYMENT_STATUS_META[paymentStatus]?.label || paymentStatus, { bookings: 1, revenue: debt.paid });
      addGroupedMetric(sourceMap, getBookingSourceLabel(booking.bookingSource), { bookings: 1, revenue: bookingRevenue });
      if (booking.type === 'tour_booking') {
        addGroupedMetric(tourMap, booking.tourTitle || booking.title || `Tour #${booking.tourId || booking.id}`, {
          bookings: 1,
          revenue: bookingRevenue,
          received: debt.paid,
          cancelled: isCancelled ? 1 : 0,
          completed: isCompleted ? 1 : 0,
        });
      }
      if (booking.type === 'stay_booking') {
        addGroupedMetric(propertyMap, booking.stayTitle || booking.title || `Property #${booking.stayId || booking.id}`, {
          bookings: 1,
          revenue: bookingRevenue,
          received: debt.paid,
          cancelled: isCancelled ? 1 : 0,
          completed: isCompleted ? 1 : 0,
        });
      }
      addGroupedMetric(managerMap, booking.assignedTo || booking.createdByAdminName || 'Без менеджера', {
        bookings: 1,
        revenue: bookingRevenue,
        received: debt.paid,
        cancelled: isCancelled ? 1 : 0,
        completed: isCompleted ? 1 : 0,
      });
    });

    const occupancyByProperty = Array.from(propertyMap.values()).map((item) => ({
      ...item,
      occupancy: Math.min(100, Math.round((item.bookings / Math.max(daysInWindow, 1)) * 100)),
    }));
    const futureRevenue = bookingRows
      .filter((booking) => {
        const date = getBookingDate(booking);
        return date.isValid() && date.isAfter(dayjs()) && !['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking));
      })
      .reduce((sum, booking) => sum + getBookingDebtSummary(booking).remaining + getBookingDebtSummary(booking).paid, 0);

    return {
      rows,
      revenue,
      received,
      unpaid: Math.max(revenue - received, 0),
      averageCheck: rows.length ? Math.round(revenue / rows.length) : 0,
      bookings: rows.length,
      completed,
      cancelled,
      newClients,
      repeatClients: Math.max(rangeClients.size - newClients, 0),
      cancellationRate: rows.length ? Math.round((cancelled / rows.length) * 100) : 0,
      missedRevenue: rows
        .filter((booking) => ['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking)))
        .reduce((sum, booking) => sum + Number(booking.amount || booking.price || 0), 0),
      futureRevenue,
      revenueOverTime: Array.from(bucketMap.values()),
      bookingsOverTime: Array.from(bucketMap.values()),
      averageBookingValue: Array.from(bucketMap.values()),
      bookingByStatus: Array.from(statusMap.values()).sort((a, b) => b.bookings - a.bookings),
      paymentStatus: Array.from(paymentStatusMap.values()).sort((a, b) => b.bookings - a.bookings),
      bookingSource: Array.from(sourceMap.values()).sort((a, b) => b.bookings - a.bookings),
      tourPopularity: Array.from(tourMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
      propertyOccupancy: occupancyByProperty.sort((a, b) => b.occupancy - a.occupancy).slice(0, 8),
      managerPerformance: Array.from(managerMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    };
  }, [analyticsWindow, bookingRows]);

  const scheduledAutomaticReminders = useMemo(() => {
    const activeRules = notificationRules.filter((rule) => rule.enabled);
    const ruleByKey = new Map(activeRules.map((rule) => [rule.key, rule]));
    return bookingRows.flatMap((booking) => {
      const serviceName = booking.tourTitle || booking.stayTitle || booking.title || 'TravelPay';
      const debt = getBookingDebtSummary(booking);
      const start = dayjs(booking.travelDate || booking.checkInDate || booking.bookingDate || booking.createdAt);
      const end = dayjs(booking.endDate || booking.checkOutDate || booking.travelDate || booking.bookingDate);
      const entries = [];
      const pushEntry = (ruleKey, sendAt, fallbackMessage) => {
        const rule = ruleByKey.get(ruleKey);
        if (!rule || !sendAt?.isValid?.()) return;
        entries.push({
          key: `scheduled-${ruleKey}-${booking.key || booking.id}`,
          sendAt: sendAt.toISOString(),
          channel: rule.channel,
          rule: rule.title,
          client: booking.clientName || booking.clientPhone || 'Клиент TravelPay',
          booking: serviceName,
          message: (rule.template || fallbackMessage)
            .replace('{serviceName}', serviceName)
            .replace('{amount}', Number(booking.prepaymentAmount || 0).toLocaleString('ru-RU'))
            .replace('{checkInTime}', booking.checkInTime || '14:00'),
        });
      };

      pushEntry('booking_confirmed', dayjs(booking.createdAt || booking.bookingDate), 'Ваше бронирование подтверждено');
      if (Number(booking.prepaymentAmount || 0) > 0) pushEntry('prepayment_received', dayjs(booking.paymentReviewedAt || booking.createdAt || booking.bookingDate), 'Мы получили предоплату {amount} сом');
      if (booking.type === 'tour_booking' && start.isValid()) pushEntry('tour_day_before', start.subtract(1, 'day'), 'Напоминаем, завтра ваша поездка {serviceName}');
      if (booking.type === 'stay_booking' && start.isValid()) pushEntry('checkin_today', start.hour(8).minute(0), 'Сегодня с {checkInTime} доступен заезд');
      if (debt.remaining > 0 && start.isValid()) pushEntry('payment_reminder', start.subtract(12, 'hour'), 'Напоминаем об остатке оплаты по бронированию {serviceName}');
      if (end.isValid()) pushEntry('after_trip_review', end.add(1, 'day').hour(12).minute(0), 'Спасибо за поездку. Оставьте отзыв');
      return entries;
    })
      .filter((entry) => dayjs(entry.sendAt).isAfter(dayjs().subtract(1, 'day')))
      .sort((left, right) => dayjs(left.sendAt).valueOf() - dayjs(right.sendAt).valueOf())
      .slice(0, 12);
  }, [bookingRows, notificationRules]);

  const managerOptions = useMemo(() => {
    const unique = Array.from(new Set([
      ...businessStaff.map((staff) => [staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.email || staff.phone),
      ...bookingRows.map((item) => item.assignedTo),
      ...tours.map((tour) => tour.manager || tour.companyName),
    ].filter(Boolean)));
    return unique.map((value) => ({ value, label: value }));
  }, [bookingRows, businessStaff, tours]);

  const isStaffAvailableForDate = useCallback((staff, dateValue, resource) => {
    if (!staff || staff.active === false) return false;
    const selected = dayjs(dateValue || calendarDate);
    if (!selected.isValid()) return true;
    const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][selected.day()];
    const workingDays = Array.isArray(staff.workingDays) && staff.workingDays.length ? staff.workingDays : ['mon', 'tue', 'wed', 'thu', 'fri'];
    if (!workingDays.includes(dayKey)) return false;
    const selectedDate = selected.format('YYYY-MM-DD');
    const unavailableDates = [
      ...(Array.isArray(staff.dayOffDates) ? staff.dayOffDates : []),
      ...(Array.isArray(staff.vacationDates) ? staff.vacationDates : []),
    ];
    if (unavailableDates.includes(selectedDate)) return false;
    const services = Array.isArray(staff.services) ? staff.services.map((item) => String(item).toLowerCase()) : [];
    if (services.length) {
      const resourceNeedle = String(resource || '').toLowerCase();
      const serviceMatch = services.some((service) => (
        resourceNeedle.includes('tour') ? ['tour', 'tours', 'vip clients'].includes(service) || /кель|сон|ала/.test(service)
          : resourceNeedle.includes('cottage') || resourceNeedle.includes('house') ? ['cottage', 'cottages', 'house', 'houses'].includes(service)
            : true
      ));
      if (!serviceMatch) return false;
    }
    return true;
  }, [calendarDate]);

  const assignmentStaffOptions = useMemo(() => {
    const selectedDate = quickBookingDate || calendarDate;
    const roleAllowed = new Set(['owner', 'administrator', 'manager', 'guide']);
    const staffOptions = businessStaff
      .filter((staff) => roleAllowed.has(staff.role || 'manager'))
      .filter((staff) => isStaffAvailableForDate(staff, selectedDate, quickBookingResource))
      .map((staff) => {
        const name = [staff.firstName, staff.lastName].filter(Boolean).join(' ') || staff.email || staff.phone;
        return {
          value: name,
          label: `${name} · ${staff.role || 'manager'}`,
        };
      });
    return staffOptions.length ? staffOptions : managerOptions;
  }, [businessStaff, calendarDate, isStaffAvailableForDate, managerOptions, quickBookingDate, quickBookingResource]);

  const companyOptions = useMemo(() => {
    const list = isSuperAdmin ? companies : (currentCompany ? [currentCompany] : companies);
    return list.map((company) => ({
      value: String(company.id),
      label: company.name,
    }));
  }, [companies, currentCompany, isSuperAdmin]);

  const calendarTourOptions = useMemo(() => tours.map((tour) => ({
    value: String(tour.id),
    label: tour.title || `Тур #${tour.id}`,
  })), [tours]);
  const calendarAccommodationOptions = useMemo(() => accommodations.map((stay) => ({
    value: String(stay.id),
    label: stay.title || stay.name || `Домик #${stay.id}`,
  })), [accommodations]);
  const calendarObjectOptions = calendarResource === 'tours'
    ? calendarTourOptions
    : calendarAccommodationOptions;
  const calendarStatusOptions = useMemo(() => {
    const source = calendarResource === 'tours'
      ? [
        ...Object.entries(TOUR_CALENDAR_STATUS_META),
        ...Object.entries(BOOKING_STATUS_META),
      ]
      : Object.entries(BOOKING_STATUS_META);

    const optionsByValue = new Map(source);

    return [
      { value: 'all', label: 'Все статусы' },
      ...Array.from(optionsByValue.entries()).map(([value, meta]) => ({ value, label: meta.label })),
    ];
  }, [calendarResource]);
  const matchesCalendarManager = useCallback((entry) => {
    if (!weekManagerSelection.length) return true;
    const manager = entry.manager || entry.assignedTo || entry.companyName;
    return weekManagerSelection.includes(manager);
  }, [weekManagerSelection]);
  const quickBookingClientOptions = useMemo(() => users
    .map((user) => ({
      value: String(user.id),
      label: `${user.name || user.email || `Клиент #${user.id}`} ${user.phone ? `· ${user.phone}` : ''}`,
      search: [user.name, user.phone, user.email].filter(Boolean).join(' ').toLowerCase(),
      user,
    }))
    .filter((option) => option.user?.name || option.user?.phone || option.user?.email)
    .slice(0, 80), [users]);

  const quickBookingStayDate = quickBookingDate && dayjs(quickBookingDate).isValid()
    ? dayjs(quickBookingDate)
    : calendarDate;
  const quickBookingSlotStart = quickBookingStartTime || '14:00';
  const quickBookingSlotEnd = quickBookingEndTime || addMinutesToClock(quickBookingSlotStart, STAY_BOOKING_SLOT_DURATION_MINUTES);
  const isStayQuickBooking = isQuickBookingStayKind(quickBookingResource);
  const isTourQuickBooking = isQuickBookingTourKind(quickBookingResource);

  const getStaySlotConflicts = useCallback((stayId, {
    date = quickBookingStayDate,
    startTime = quickBookingSlotStart,
    endTime = quickBookingSlotEnd,
  } = {}) => {
    const selected = dayjs(date);
    if (!selected.isValid() || !startTime || !endTime) return [];
    const selectedStart = clockToMinutesLabel(startTime);
    let selectedEnd = clockToMinutesLabel(endTime);
    if (selectedEnd <= selectedStart) selectedEnd += 24 * 60;

    return stayBookings.filter((booking) => {
      if (Number(booking.stayId) !== Number(stayId)) return false;
      if (['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking))) return false;
      const checkIn = dayjs(booking.checkInDate || booking.startDate || booking.bookingDate);
      const checkOut = dayjs(booking.checkOutDate || booking.endDate || booking.checkInDate || booking.bookingDate);
      const overlapsDate = checkIn.isValid() && checkOut.isValid()
        ? (selected.isSame(checkIn, 'day') || (selected.isAfter(checkIn, 'day') && selected.isBefore(checkOut, 'day')))
        : selected.isSame(dayjs(booking.bookingDate || booking.travelDate || booking.createdAt), 'day');
      if (!overlapsDate) return false;
      const bookingStart = clockToMinutesLabel(booking.startTime || booking.checkInTime || '14:00');
      let bookingEnd = clockToMinutesLabel(booking.endTime || booking.checkOutTime || '16:00');
      if (bookingEnd <= bookingStart) bookingEnd += 24 * 60;
      return Math.max(bookingStart, selectedStart) < Math.min(bookingEnd, selectedEnd);
    });
  }, [quickBookingSlotEnd, quickBookingSlotStart, quickBookingStayDate, stayBookings]);

  const getStayBlockForDate = useCallback((unit, dateValue) => {
    const selected = dayjs(dateValue).startOf('day');
    if (!unit || !selected.isValid()) return null;
    return (unit.blockedDates || []).find((block) => {
      const start = dayjs(block.startDate || block.date).startOf('day');
      const end = dayjs(block.endDate || block.startDate || block.date).startOf('day');
      const normalizedEnd = end.isValid() ? end : start;
      return start.isValid()
        && (selected.isSame(start, 'day') || selected.isAfter(start, 'day'))
        && (selected.isSame(normalizedEnd, 'day') || selected.isBefore(normalizedEnd, 'day'));
    }) || null;
  }, []);

  const quickBookingAvailability = useMemo(() => {
    if (isTourQuickBooking) {
      const people = Math.max(Number(quickBookingPeople || 1), 1);
      const selectedDate = quickBookingDate && dayjs(quickBookingDate).isValid() ? dayjs(quickBookingDate) : null;
      const availableSlots = quickBookingSlots
        .filter((slot) => slot.active !== false && slot.available !== false && !slot.soldOut && Number(slot.remainingSeats || 0) >= people)
        .filter((slot) => !selectedDate || dayjs(slot.startAt).isSame(selectedDate, 'day'))
        .sort((left, right) => dayjs(left.startAt).valueOf() - dayjs(right.startAt).valueOf());
      const waitlistSlots = quickBookingSlots
        .filter((slot) => slot.active !== false)
        .filter((slot) => slot.soldOut || slot.status === 'sold_out' || Number(slot.remainingSeats || 0) < people)
        .filter((slot) => !selectedDate || dayjs(slot.startAt).isSame(selectedDate, 'day'))
        .sort((left, right) => dayjs(left.startAt).valueOf() - dayjs(right.startAt).valueOf());
      const selectedSlot = quickBookingDepartureSlotId
        ? quickBookingSlots.find((slot) => String(slot.id) === String(quickBookingDepartureSlotId))
        : null;
      return {
        kind: 'tour',
        availableSlots,
        waitlistSlots,
        selectedSlot,
        hasConflict: Boolean(selectedSlot && (selectedSlot.soldOut || selectedSlot.available === false || Number(selectedSlot.remainingSeats || 0) < people)),
      };
    }

    if (isStayQuickBooking) {
      const selectedStayId = Number(quickBookingObjectId);
      const selectedStay = accommodations.find((item) => Number(item.id) === selectedStayId);
      const conflicts = selectedStayId ? getStaySlotConflicts(selectedStayId) : [];
      const block = selectedStay ? getStayBlockForDate(selectedStay, quickBookingStayDate) : null;
      const alternatives = accommodations
        .filter((item) => isSuperAdmin || !currentCompany?.id || Number(item.companyId) === Number(currentCompany.id))
        .filter((item) => Number(item.id) !== selectedStayId && item.status === 'available')
        .filter((item) => !getStayBlockForDate(item, quickBookingStayDate))
        .filter((item) => getStaySlotConflicts(item.id).length === 0)
        .slice(0, 5);
      const occupiedBlocks = conflicts.map((booking) => ({
        id: booking.id,
        label: `${booking.startTime || booking.checkInTime || '14:00'} → ${booking.endTime || booking.checkOutTime || '16:00'}`,
        clientName: booking.clientName,
      }));

      return {
        kind: 'stay',
        selectedStay,
        block,
        conflicts,
        alternatives,
        occupiedBlocks,
        hasConflict: conflicts.length > 0 || Boolean(block),
      };
    }

    return { kind: 'unknown', hasConflict: false };
  }, [
    accommodations,
    currentCompany?.id,
    getStaySlotConflicts,
    getStayBlockForDate,
    isStayQuickBooking,
    isSuperAdmin,
    isTourQuickBooking,
    quickBookingDate,
    quickBookingDepartureSlotId,
    quickBookingObjectId,
    quickBookingPeople,
    quickBookingSlots,
    quickBookingStayDate,
  ]);

  const quickBookingFreeSlots = useMemo(() => {
    if (isTourQuickBooking) {
      return quickBookingAvailability.availableSlots?.slice(0, 6).map((slot) => ({
        key: slot.id,
        title: dayjs(slot.startAt).format('HH:mm'),
        subtitle: `${slot.remainingSeats} / ${slot.seats} мест свободно`,
      })) || [];
    }

    if (!isStayQuickBooking || !quickBookingObjectId) return [];
    const occupied = stayBookings
      .filter((booking) => Number(booking.stayId) === Number(quickBookingObjectId))
      .filter((booking) => !['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking)))
      .filter((booking) => {
        const selected = quickBookingStayDate;
        const checkIn = dayjs(booking.checkInDate || booking.startDate || booking.bookingDate);
        const checkOut = dayjs(booking.checkOutDate || booking.endDate || booking.checkInDate || booking.bookingDate);
        return checkIn.isValid() && checkOut.isValid()
          ? (selected.isSame(checkIn, 'day') || (selected.isAfter(checkIn, 'day') && selected.isBefore(checkOut, 'day')))
          : selected.isSame(dayjs(booking.bookingDate || booking.travelDate || booking.createdAt), 'day');
      })
      .map((booking) => ({
        start: clockToMinutesLabel(booking.startTime || booking.checkInTime || '14:00'),
        end: clockToMinutesLabel(booking.endTime || booking.checkOutTime || '16:00'),
      }))
      .sort((left, right) => left.start - right.start);

    const windows = [];
    let cursor = weekBoardStartHour * 60;
    const boardEnd = weekBoardEndHour * 60;
    occupied.forEach((block) => {
      if (block.start > cursor) windows.push({ start: cursor, end: block.start });
      cursor = Math.max(cursor, block.end);
    });
    if (cursor < boardEnd) windows.push({ start: cursor, end: boardEnd });

    const toClock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return windows
      .filter((slot) => slot.end - slot.start >= 45)
      .slice(0, 6)
      .map((slot) => ({
        key: `${slot.start}-${slot.end}`,
        title: `${toClock(slot.start)}–${toClock(slot.end)}`,
        subtitle: 'Свободно',
      }));
  }, [isStayQuickBooking, isTourQuickBooking, quickBookingAvailability.availableSlots, quickBookingObjectId, quickBookingStayDate, stayBookings]);

  const quickBookingObjectOptions = useMemo(() => {
    const source = isStayQuickBooking ? accommodations : tours;
    const selectedDate = quickBookingDate && dayjs(quickBookingDate).isValid() ? dayjs(quickBookingDate) : null;
    const people = Math.max(Number(quickBookingPeople || 1), 1);

    return source
      .filter((item) => isSuperAdmin || !currentCompany?.id || Number(item.companyId) === Number(currentCompany.id))
      .filter((item) => {
        if (isStayQuickBooking) {
          return item.status === 'available' && !getStayBlockForDate(item, quickBookingDate || calendarDate) && getStaySlotConflicts(item.id).length === 0;
        }
        if (selectedDate && Array.isArray(item.departureSlots) && item.departureSlots.length) {
          return item.departureSlots.some((slot) => {
            const bookedSeats = tourBookings
              .filter((booking) => Number(booking.tourId) === Number(item.id))
              .filter((booking) => String(booking.departureSlotId || '') === String(slot.id || ''))
              .filter((booking) => !['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking)))
              .reduce((sum, booking) => sum + Math.max(Number(booking.people || booking.adults) || 1, 1), 0);
            const remainingSeats = Math.max(Number(slot.seats || 0) - bookedSeats, 0);
            return slot.active !== false
              && slot.status !== 'sold_out'
              && slot.status !== 'cancelled'
              && slot.status !== 'paused'
              && dayjs(slot.startAt).isSame(selectedDate, 'day')
              && remainingSeats >= people;
          });
        }
        return true;
      })
      .map((item) => ({
        value: String(item.id),
        label: item.title || item.name || `${isStayQuickBooking ? 'Объект' : 'Тур'} #${item.id}`,
      }));
  }, [accommodations, calendarDate, currentCompany?.id, getStayBlockForDate, getStaySlotConflicts, isStayQuickBooking, isSuperAdmin, quickBookingDate, quickBookingPeople, tourBookings, tours]);

  const resetCalendarFilters = useCallback(() => {
    setCalendarCompanyFilter('all');
    setCalendarTourFilter('all');
    setCalendarStatusFilter('all');
    setCalendarPaymentFilter('all');
    setWeekManagerSelection([]);
  }, []);

  const activeCalendarFilters = useMemo(() => {
    const labels = [];
    const selectedCompany = companyOptions.find((item) => item.value === calendarCompanyFilter);
    const selectedTour = calendarObjectOptions.find((item) => item.value === calendarTourFilter);
    const selectedStatus = BOOKING_STATUS_META[calendarStatusFilter]
      || TOUR_CALENDAR_STATUS_META[calendarStatusFilter];
    const selectedPayment = {
      paid: 'Оплачено',
      reserved: 'Средства зарезервированы',
      review: 'Чек на проверке',
      pending: 'Ожидает оплаты',
    }[calendarPaymentFilter];

    if (selectedCompany) labels.push({ key: 'company', label: selectedCompany.label });
    if (selectedTour) labels.push({ key: 'tour', label: selectedTour.label });
    if (selectedStatus) labels.push({ key: 'status', label: selectedStatus.label });
    if (selectedPayment) labels.push({ key: 'payment', label: selectedPayment });
    weekManagerSelection.forEach((manager) => labels.push({ key: `manager-${manager}`, label: manager }));

    return labels;
  }, [calendarCompanyFilter, calendarObjectOptions, calendarPaymentFilter, calendarStatusFilter, calendarTourFilter, companyOptions, weekManagerSelection]);

  const extraServiceOptions = useMemo(() => {
    const map = new Map();
    stayBookings.forEach((booking) => {
      (booking.extras || []).forEach((extra) => {
        if (extra?.serviceId && extra?.title && !map.has(extra.serviceId)) {
          map.set(extra.serviceId, { value: extra.serviceId, label: extra.title });
        }
      });
    });

    return [
      { value: 'all', label: 'Все услуги' },
      { value: 'with_extras', label: 'Только с доп. услугами' },
      { value: 'without_extras', label: 'Без доп. услуг' },
      ...Array.from(map.values()),
    ];
  }, [stayBookings]);

  useEffect(() => {
    const values = managerOptions.map((item) => item.value);
    setWeekManagerSelection((current) => {
      if (!current.length) return values;
      const next = current.filter((value) => values.includes(value));
      return next.length ? next : values;
    });
  }, [managerOptions]);

  const filteredTours = useMemo(() => {
    const query = tourSearch.trim().toLowerCase();

    return tours.filter((tour) => {
      const meta = STATUS_META[tour.status] || STATUS_META.active;
      const matchesStatus = tourStatusFilter === 'all' || tour.status === tourStatusFilter;
      const searchableText = [
        tour.title,
        tour.location,
        tour.city,
        tour.duration,
        meta.label,
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesStatus && (!query || searchableText.includes(query));
    });
  }, [tourSearch, tourStatusFilter, tours]);

  const tourOperationCards = useMemo(() => (
    filteredTours.flatMap((tour) => (tour.departureSlots || []).map((slot) => {
      const slotBookings = tourBookings.filter((booking) => (
        Number(booking.tourId) === Number(tour.id)
        && String(booking.departureSlotId || '') === String(slot.id || '')
      ));
      const bookedSeats = slotBookings.reduce((sum, booking) => sum + Math.max(Number(booking.people) || 1, 1), 0);
      const confirmedSeats = slotBookings
        .filter((booking) => ['CONFIRMED', 'PAID', 'PARTIALLY_PAID', 'COMPLETED'].includes(getCanonicalBookingStatus(booking)))
        .reduce((sum, booking) => sum + Math.max(Number(booking.people) || 1, 1), 0);
      const revenue = slotBookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
      const start = dayjs(slot.startAt);
      const totalSeats = Number(slot.seats || 0);
      const remainingSeats = Math.max(totalSeats - bookedSeats, 0);
      const computedStatus = !slot.active
        ? 'paused'
        : bookedSeats >= totalSeats
          ? 'sold_out'
          : (slot.status || (confirmedSeats > 0 ? 'confirmed' : 'scheduled'));
      const statusMeta = TOUR_DEPARTURE_STATUS_META[computedStatus] || TOUR_DEPARTURE_STATUS_META.scheduled;
      const waitlist = Array.isArray(slot.waitlist) ? slot.waitlist : [];
      const operationsChecklist = {
        ...createEmptyTourOperationsChecklist(),
        ...(slot.operationsChecklist || {}),
      };
      const checklistDone = TOUR_OPERATION_CHECKLIST_ITEMS
        .filter((item) => operationsChecklist[item.key])
        .length;

      return {
        key: `${tour.id}-${slot.id}`,
        tour,
        slot,
        title: tour.title,
        date: start,
        time: start.format('HH:mm'),
        bookedSeats,
        confirmedSeats,
        totalSeats,
        remainingSeats,
        revenue,
        price: Number(slot.price || tour.price || 0),
        status: computedStatus,
        statusLabel: statusMeta.label,
        statusColor: statusMeta.color,
        waitlistCount: Number(slot.waitlistCount || waitlist.length || 0),
        nextWaitlistClient: slot.nextWaitlistClient || waitlist.find((item) => item.status !== 'resolved'),
        operationsChecklist,
        checklistDone,
      };
    }))
      .filter((card) => card.date.isValid())
      .sort((left, right) => left.date.valueOf() - right.date.valueOf())
  ), [filteredTours, tourBookings]);

  const activeDepartureOpsCard = useMemo(() => {
    if (!departureOpsDrawerItem) return null;
    return tourOperationCards.find((card) => card.key === departureOpsDrawerItem.key) || departureOpsDrawerItem;
  }, [departureOpsDrawerItem, tourOperationCards]);

  const departureParticipantRows = useMemo(() => {
    if (!activeDepartureOpsCard) return [];
    return tourBookings
      .filter((booking) => Number(booking.tourId) === Number(activeDepartureOpsCard.tour.id))
      .filter((booking) => String(booking.departureSlotId || '') === String(activeDepartureOpsCard.slot.id || ''))
      .map((booking) => {
        const paymentMeta = PAYMENT_STATUS_META[getCanonicalPaymentStatus(booking)] || PAYMENT_STATUS_META.UNPAID;
        return {
          key: `participant-${booking.id}`,
          name: booking.clientName || 'TravelPay client',
          phone: booking.clientPhone || '',
          type: Number(booking.children || 0) > 0 && Number(booking.adults || 0) <= 0 ? 'Child' : Number(booking.children || 0) > 0 ? `Adult + ${booking.children} child` : 'Adult',
          paymentLabel: paymentMeta.label,
          paymentColor: paymentMeta.color,
          pickup: booking.pickup || booking.pickupLocation || '',
          comment: booking.comment || '',
          emergencyContact: booking.emergencyContact || booking.emergencyPhone || '',
        };
      });
  }, [activeDepartureOpsCard, tourBookings]);

  const filteredBookings = useMemo(() => {
    const query = (calendarSearch || bookingSearch).trim().toLowerCase();

    return bookingRows.filter((booking) => {
      const haystack = [
        booking.clientName,
        booking.clientEmail,
        booking.clientPhone,
        booking.tourTitle,
        booking.stayTitle,
        booking.location,
        booking.comment,
      ].filter(Boolean).join(' ').toLowerCase();

      const normalizedStatus = booking.status === 'paid' || booking.status === 'confirmed'
        ? 'paid'
        : booking.status === 'cancelled' || booking.status === 'rejected'
          ? 'cancelled'
          : 'pending';
      const matchesStatus = bookingStatusFilter === 'all' || normalizedStatus === bookingStatusFilter;
      const matchesManager = bookingManagerFilter === 'all' || booking.assignedTo === bookingManagerFilter;
      const bookingExtras = Array.isArray(booking.extras) ? booking.extras.filter((item) => item.title) : [];
      const hasExtras = booking.type === 'stay_booking' && bookingExtras.length > 0;
      const matchesExtras = bookingExtraFilter === 'all'
        || (bookingExtraFilter === 'with_extras' && hasExtras)
        || (bookingExtraFilter === 'without_extras' && booking.type === 'stay_booking' && !hasExtras)
        || (booking.type === 'stay_booking' && bookingExtras.some((item) => item.serviceId === bookingExtraFilter));

      return matchesStatus && matchesManager && matchesExtras && (!query || haystack.includes(query));
    });
  }, [bookingExtraFilter, bookingManagerFilter, bookingRows, bookingSearch, bookingStatusFilter, calendarSearch]);

  const clientRecords = useMemo(() => {
    const findBookingsForUser = (user) => {
      const userId = Number(user.id);
      const email = String(user.email || '').toLowerCase();
      const phone = String(user.phone || '').replace(/\D/g, '');
      const name = String(user.name || '').trim().toLowerCase();

      return bookingRows.filter((booking) => {
        const bookingPhone = String(booking.clientPhone || '').replace(/\D/g, '');
        return Number(booking.clientId || booking.userId || 0) === userId
          || (email && String(booking.clientEmail || '').toLowerCase() === email)
          || (phone && bookingPhone && bookingPhone.endsWith(phone.slice(-7)))
          || (name && String(booking.clientName || '').trim().toLowerCase() === name);
      });
    };

    return users.map((user) => {
      const clientBookings = findBookingsForUser(user);
      const spent = clientBookings
        .filter((booking) => ['PAID', 'PARTIALLY_PAID', 'COMPLETED', 'CONFIRMED'].includes(getCanonicalBookingStatus(booking))
          || ['PAID', 'PARTIALLY_PAID'].includes(getCanonicalPaymentStatus(booking)))
        .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
      const lastBooking = [...clientBookings].sort((left, right) => (
        dayjs(right.bookingDate || right.travelDate || right.checkInDate || right.createdAt).valueOf()
        - dayjs(left.bookingDate || left.travelDate || left.checkInDate || left.createdAt).valueOf()
      ))[0] || null;
      const cancelledCount = clientBookings.filter((booking) => ['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking))).length;
      const unpaidCount = clientBookings.filter((booking) => {
        const total = Number(booking.amount || 0);
        const prepaid = Number(booking.prepaymentAmount || 0);
        return total > prepaid && !['PAID', 'REFUNDED'].includes(getCanonicalPaymentStatus(booking));
      }).length;
      const travelpayCount = clientBookings.filter((booking) => isTravelPayMarketplaceSource(booking.bookingSource)).length;
      const manualCount = clientBookings.filter((booking) => booking.paymentMethod === 'manual' || booking.bookingSource === 'phone' || booking.bookingSource === 'whatsapp').length;
      const tourCount = clientBookings.filter((booking) => booking.type === 'tour_booking').length;
      const stayCount = clientBookings.filter((booking) => booking.type === 'stay_booking').length;
      const isVip = spent >= 100000 || clientBookings.length >= 5;
      const status = unpaidCount ? 'debtor' : isVip ? 'vip' : clientBookings.length > 1 ? 'repeat' : clientBookings.length ? 'new' : 'lead';
      const walletBalance = Number(user.savings?.currentAmount ?? user.balance ?? 0);
      const walletHistory = [
        ...(user.topUps || []).map((topUp, index) => ({
          key: `topup-${topUp.id || index}`,
          type: topUp.bonus ? 'Bonus' : 'Пополнение',
          date: topUp.date || topUp.createdAt,
          amount: Number(topUp.amount || 0) + Number(topUp.bonus || 0),
          description: topUp.bonus ? `Пополнение + bonus ${formatMoney(topUp.bonus)}` : 'Пополнение TravelPay',
        })),
        ...(user.walletAdjustments || user.managerAdjustments || []).map((adjustment, index) => ({
          key: `adjustment-${adjustment.id || index}`,
          type: 'Manager adjustment',
          date: adjustment.date || adjustment.createdAt,
          amount: Number(adjustment.amount || 0),
          description: adjustment.comment || adjustment.reason || 'Корректировка менеджера',
        })),
        ...clientBookings.filter((booking) => Number(booking.prepaymentAmount || booking.amount || 0) > 0).map((booking) => ({
          key: `payment-${booking.key}`,
          type: ['REFUNDED', 'PARTIALLY_REFUNDED'].includes(getCanonicalPaymentStatus(booking)) ? 'Refund' : 'Оплата бронирования',
          date: booking.paymentReviewedAt || booking.createdAt || booking.bookingDate,
          amount: Number(booking.prepaymentAmount || booking.amount || 0),
          description: booking.tourTitle || booking.stayTitle || 'Бронирование',
        })),
      ].sort((left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf());
      const timeline = [
        ...clientBookings.flatMap((booking) => [
          {
            key: `created-${booking.key}`,
            date: booking.createdAt || booking.bookingDate,
            title: `Бронирование создано`,
            description: booking.tourTitle || booking.stayTitle || 'TravelPay',
            tone: 'info',
          },
          Number(booking.prepaymentAmount || 0) > 0 ? {
            key: `paid-${booking.key}`,
            date: booking.paymentReviewedAt || booking.createdAt || booking.bookingDate,
            title: `Оплата ${formatMoney(booking.prepaymentAmount)}`,
            description: booking.tourTitle || booking.stayTitle || 'Бронирование',
            tone: 'success',
          } : null,
          ...(booking.statusHistory || []).map((entry, index) => ({
            key: `status-${booking.key}-${entry.id || index}`,
            date: entry.changedAt,
            title: `Менеджер изменил статус на ${(BOOKING_STATUS_META[String(entry.to || '').toUpperCase()] || PAYMENT_STATUS_META[String(entry.to || '').toUpperCase()] || {}).label || entry.to}`,
            description: booking.tourTitle || booking.stayTitle || entry.comment || '',
            tone: 'accent',
          })),
        ].filter(Boolean)),
        ...walletHistory.map((entry) => ({
          key: `wallet-${entry.key}`,
          date: entry.date,
          title: entry.type,
          description: `${entry.description} · ${formatMoney(entry.amount)}`,
          tone: entry.type === 'Refund' ? 'danger' : 'success',
        })),
      ].filter((entry) => entry.date).sort((left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf());
      const communicationHistory = clientBookings
        .flatMap(buildBookingCommunicationEntries)
        .sort((left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf());

      return {
        ...user,
        key: `client-${user.id}`,
        bookings: clientBookings,
        bookingsCount: clientBookings.length,
        spent,
        lastBooking,
        lastTripAt: lastBooking?.bookingDate || lastBooking?.travelDate || lastBooking?.checkInDate || lastBooking?.createdAt || '',
        tourCount,
        stayCount,
        cancelledCount,
        unpaidCount,
        travelpayCount,
        manualCount,
        clientStatus: status,
        clientLabel: isVip ? 'VIP' : unpaidCount ? 'Должник' : clientBookings.length > 1 ? 'Повторный' : clientBookings.length ? 'Новый' : 'Лид',
        manager: lastBooking?.assignedTo || user.manager || currentCompany?.name || 'TravelPay',
        sourceLabel: manualCount > travelpayCount ? 'Ручное бронирование' : 'TravelPay',
        clientSince: user.createdAt || lastBooking?.createdAt || '',
        clientTags: Array.isArray(user.clientTags) ? user.clientTags : [],
        walletBalance,
        walletHistory,
        communicationHistory,
        timeline,
      };
    });
  }, [bookingRows, currentCompany?.name, users]);

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    return clientRecords.filter((client) => {
      const haystack = [client.name, client.email, client.phone, client.role, client.level].filter(Boolean).join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesFilter = clientSegmentFilter === 'all'
        || (clientSegmentFilter === 'new' && client.clientStatus === 'new')
        || (clientSegmentFilter === 'repeat' && client.clientStatus === 'repeat')
        || (clientSegmentFilter === 'vip' && client.clientStatus === 'vip')
        || (clientSegmentFilter === 'debtors' && client.unpaidCount > 0)
        || (clientSegmentFilter === 'cancelled' && client.cancelledCount > 0)
        || (clientSegmentFilter === 'travelpay' && client.travelpayCount > 0)
        || (clientSegmentFilter === 'manual' && client.manualCount > 0);
      return matchesQuery && matchesFilter;
    });
  }, [clientRecords, clientSearch, clientSegmentFilter]);

  useEffect(() => {
    const match = location.pathname.match(/^\/(?:admin|business)\/clients\/([^/]+)/);
    if (!match) return;
    const nextClient = clientRecords.find((client) => String(client.id) === String(match[1]));
    if (nextClient) setClientDrawerItem(nextClient);
  }, [clientRecords, location.pathname]);

  const editingStayAccommodation = useMemo(
    () => accommodations.find((item) => Number(item.id) === Number(editingStayBooking?.stayId)) || null,
    [accommodations, editingStayBooking?.stayId],
  );
  const editingStayServices = useMemo(
    () => (Array.isArray(editingStayAccommodation?.extraServices) ? editingStayAccommodation.extraServices.filter((service) => service.active !== false) : []),
    [editingStayAccommodation],
  );
  const editingStayBookingSummary = useMemo(
    () => buildStayBookingEditorExtrasSummary(editingStayServices, stayBookingEditorExtras),
    [editingStayServices, stayBookingEditorExtras],
  );
  const editingStayBaseAmount = useMemo(() => {
    if (!editingStayAccommodation || !editingStayBooking) return 0;
    const nights = Number(watchedStayBookingNights || editingStayBooking.nights || 1);
    return Number(editingStayAccommodation.pricePerNight || 0) * Math.max(nights, 1);
  }, [editingStayAccommodation, editingStayBooking, watchedStayBookingNights]);
  const editingStayExtrasAmount = useMemo(
    () => editingStayBookingSummary.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [editingStayBookingSummary],
  );
  const editingStayTotalAmount = editingStayBaseAmount + editingStayExtrasAmount;

  const calendarVisibleRange = useMemo(() => {
    const start = bookingTab === 'month'
      ? calendarDate.startOf('month')
      : bookingTab === 'week' || bookingTab === 'list'
        ? dayjs(startOfWeek(calendarDate.toDate())).startOf('day')
        : calendarDate.startOf('day');
    const end = bookingTab === 'month'
      ? calendarDate.endOf('month')
      : bookingTab === 'week' || bookingTab === 'list'
        ? start.add(6, 'day').endOf('day')
        : bookingTab === 'three-day'
          ? start.add(2, 'day').endOf('day')
          : calendarDate.endOf('day');

    return { start, end };
  }, [bookingTab, calendarDate]);

  const tourCalendarEntries = useMemo(() => tours.flatMap((tour) => {
    const companyId = Number(tour.companyId || currentCompany?.id || sessionUser?.companyId || 0);
    const companyName = tour.companyName || companiesById.get(companyId)?.name || currentCompany?.name || 'TravelPay';
    const linkedBookings = bookingRows.filter((booking) => Number(booking.tourId) === Number(tour.id));
    const durationDays = parseDurationDays(tour.duration || tour.durationDays);
    const departureSlots = (Array.isArray(tour.departureSlots) ? tour.departureSlots : [])
      .filter((slot) => slot?.active !== false && dayjs(slot?.startAt).isValid())
      .filter((slot) => {
        const start = dayjs(slot.startAt);
        const end = start.add(Math.max(durationDays - 1, 0), 'day').endOf('day');
        return !end.isBefore(calendarVisibleRange.start, 'day') && !start.isAfter(calendarVisibleRange.end, 'day');
      });

    if (!departureSlots.length) return [];

    return departureSlots.map((slot, slotIndex) => {
      const start = dayjs(slot.startAt);
      const end = start.add(Math.max(durationDays - 1, 0), 'day').hour(18).minute(0);
      const slotBookings = linkedBookings.filter((booking) => String(booking.departureSlotId || '') === String(slot.id || ''));
      const totalSeats = Number(slot.seats || tour.totalSeats || tour.seats || tour.capacity || 20);
      const bookedSeats = slotBookings.reduce((sum, booking) => sum + Math.max(Number(booking.people) || 1, 1), 0);
      const freeSeats = Math.max(totalSeats - bookedSeats, 0);
      const now = dayjs();

      let calendarStatus = tour.calendarStatus || tour.tripStatus || tour.scheduleStatus || '';
      if (!calendarStatus) {
        if (freeSeats <= 0 && totalSeats > 0) calendarStatus = 'sold_out';
        else if (now.isAfter(end, 'day')) calendarStatus = 'completed';
        else if ((now.isAfter(start) || now.isSame(start, 'day')) && (now.isBefore(end) || now.isSame(end, 'day'))) calendarStatus = 'in_progress';
        else calendarStatus = 'scheduled';
      }

      return {
      ...tour,
      key: `tour-calendar-${tour.id}-${slot.id || slotIndex}`,
      departureSlotId: slot.id,
      type: 'tour',
      companyId,
      companyName,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalSeats,
      bookedSeats,
      freeSeats,
      route: tour.route || tour.location || 'Маршрут уточняется',
      manager: tour.manager || companyName,
      price: Number(tour.price || 0),
      status: calendarStatus,
      clients: slotBookings,
      };
    });
  }), [bookingRows, calendarVisibleRange, companiesById, currentCompany?.id, currentCompany?.name, sessionUser?.companyId, tours]);

  const toursCalendarById = useMemo(() => (
    new Map(tourCalendarEntries.map((tour) => [Number(tour.id), tour]))
  ), [tourCalendarEntries]);

  const filteredBookingCalendarEntries = useMemo(() => filteredBookings
    .map((booking) => {
      const linkedTour = toursCalendarById.get(Number(booking.tourId));
      const companyId = Number(linkedTour?.companyId || booking.companyId || currentCompany?.id || sessionUser?.companyId || 0);
      const companyName = linkedTour?.companyName || booking.companyName || companiesById.get(companyId)?.name || currentCompany?.name || 'TravelPay';
      const start = getBookingStartDate(booking);
      const durationMinutes = getBookingDurationMinutes(booking);

      return {
        ...booking,
        key: `booking-calendar-${booking.key}`,
        type: booking.type || 'booking',
        companyId,
        companyName,
        startDate: start.toISOString(),
        endDate: start.add(durationMinutes, 'minute').toISOString(),
        paymentStatus: booking.paymentStatus || (booking.status === 'paid' ? 'paid' : 'pending'),
      };
    })
    .filter((booking) => {
      const matchesCompanyFilter = calendarCompanyFilter === 'all' || String(booking.companyId) === calendarCompanyFilter;
      const matchesScope = isSuperAdmin || !currentCompany?.id || Number(booking.companyId) === Number(currentCompany.id);
      return matchesScope && matchesCompanyFilter && matchesCalendarManager(booking);
    }), [calendarCompanyFilter, companiesById, currentCompany?.id, currentCompany?.name, filteredBookings, isSuperAdmin, matchesCalendarManager, sessionUser?.companyId, toursCalendarById]);

  const calendarEntries = useMemo(() => {
    const normalizedCalendarSearch = calendarSearch.trim().toLowerCase();
    const matchesStatus = (entry) => {
      const bookingStatusMatches = calendarStatusFilter === 'all'
        || entry.status === calendarStatusFilter
        || entry.paymentStatus === calendarStatusFilter;
      const paymentStatusMatches = calendarPaymentFilter === 'all'
        || entry.paymentStatus === calendarPaymentFilter;
      return bookingStatusMatches && paymentStatusMatches;
    };
    const matchesSearch = (entry) => {
      if (!normalizedCalendarSearch) return true;

      const searchableText = [
        entry.title,
        entry.tourTitle,
        entry.stayTitle,
        entry.clientName,
        entry.clientEmail,
        entry.clientPhone,
        entry.companyName,
        entry.location,
        entry.route,
        entry.manager,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedCalendarSearch);
    };
    if (calendarResource === 'stays') {
      return filteredBookingCalendarEntries.filter((entry) => (
        entry.type === 'stay_booking'
        && (calendarTourFilter === 'all' || String(entry.stayId) === calendarTourFilter)
        && matchesStatus(entry)
        && matchesSearch(entry)
      ));
    }

    const visibleTours = tourCalendarEntries.filter((tour) => (
      (calendarCompanyFilter === 'all' || String(tour.companyId) === calendarCompanyFilter)
      && (calendarTourFilter === 'all' || String(tour.id) === calendarTourFilter)
      && matchesCalendarManager(tour)
      && matchesStatus(tour)
      && matchesSearch(tour)
    ));
    const visibleBookings = filteredBookingCalendarEntries.filter((entry) => (
      entry.type === 'tour_booking'
      && (calendarTourFilter === 'all' || String(entry.tourId) === calendarTourFilter)
      && matchesCalendarManager(entry)
      && matchesStatus(entry)
      && matchesSearch(entry)
    ));
    return [...visibleTours, ...visibleBookings];
  }, [calendarCompanyFilter, calendarPaymentFilter, calendarResource, calendarSearch, calendarStatusFilter, calendarTourFilter, filteredBookingCalendarEntries, matchesCalendarManager, tourCalendarEntries]);

  const bookingsForSelectedDay = useMemo(() => {
    const current = calendarDate.toDate();
    return filteredBookings.filter((item) => isSameDay(new Date(item.bookingDate), current));
  }, [calendarDate, filteredBookings]);

  const bookingsForSelectedWeek = useMemo(() => {
    const weekStart = startOfWeek(calendarDate.toDate());
    const weekEnd = addDays(weekStart, 7);
    return filteredBookings.filter((item) => {
      const value = new Date(item.bookingDate);
      return value >= weekStart && value < weekEnd;
    });
  }, [calendarDate, filteredBookings]);

  const weeklyColumns = useMemo(() => Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startOfWeek(calendarDate.toDate()), index);
    return {
      label: date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
      date,
      items: bookingsForSelectedWeek.filter((booking) => isSameDay(new Date(booking.bookingDate), date)),
    };
  }), [bookingsForSelectedWeek, calendarDate]);

  const calendarEntriesByDate = useMemo(() => {
    const byDate = new Map();
    calendarEntries.forEach((entry) => {
      const start = dayjs(entry.startDate).startOf('day');
      const end = dayjs(entry.endDate || entry.startDate).startOf('day');
      if (!start.isValid()) return;
      const last = end.isValid() ? end : start;
      let cursor = start;
      while (cursor.isBefore(last, 'day') || cursor.isSame(last, 'day')) {
        const key = cursor.format('YYYY-MM-DD');
        const current = byDate.get(key) || [];
        current.push(entry);
        byDate.set(key, current);
        cursor = cursor.add(1, 'day');
      }
    });
    return byDate;
  }, [calendarEntries]);

  const selectedDayCalendarEntries = useMemo(() => {
    const selected = calendarDate.startOf('day');
    return calendarEntriesByDate.get(selected.format('YYYY-MM-DD')) || [];
  }, [calendarDate, calendarEntriesByDate]);

  const calendarListGroups = useMemo(() => (
    Array.from(calendarEntriesByDate.entries())
      .filter(([dateKey]) => {
        const date = dayjs(dateKey);
        return !date.isBefore(calendarVisibleRange.start, 'day')
          && !date.isAfter(calendarVisibleRange.end, 'day');
      })
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([dateKey, entries]) => ({
        date: dayjs(dateKey),
        entries: [...entries].sort((left, right) => (
          dayjs(left.startDate).valueOf() - dayjs(right.startDate).valueOf()
        )),
      }))
  ), [calendarEntriesByDate, calendarVisibleRange.end, calendarVisibleRange.start]);

  const selectedWeekCalendarEntries = useMemo(() => {
    const rangeStart = bookingTab === 'three-day'
      ? calendarDate.startOf('day')
      : dayjs(startOfWeek(calendarDate.toDate())).startOf('day');
    const rangeEnd = rangeStart.add(bookingTab === 'three-day' ? 2 : 6, 'day').endOf('day');

    return calendarEntries.filter((entry) => {
      const start = dayjs(entry.startDate);
      const end = dayjs(entry.endDate || entry.startDate);
      return start.isBefore(rangeEnd) && end.isAfter(rangeStart);
    });
  }, [bookingTab, calendarDate, calendarEntries]);

  const weekCalendarEntries = useMemo(
    () => selectedWeekCalendarEntries,
    [selectedWeekCalendarEntries],
  );

  const weekCalendarDays = useMemo(() => (
    Array.from({ length: bookingTab === 'three-day' ? 3 : 7 }, (_, index) => {
      const initialDate = bookingTab === 'three-day'
        ? calendarDate.startOf('day')
        : dayjs(startOfWeek(calendarDate.toDate())).startOf('day');
      const date = initialDate.add(index, 'day');
      return {
        key: date.format('YYYY-MM-DD'),
        date,
        label: date.toDate().toLocaleDateString('ru-RU', { weekday: 'long' }),
        dayNumber: date.format('D'),
        shortLabel: date.toDate().toLocaleDateString('ru-RU', { weekday: 'short' }),
        isToday: date.isSame(dayjs(), 'day'),
        isSelected: date.isSame(calendarDate, 'day'),
      };
    })
  ), [bookingTab, calendarDate]);

  const weekBoardStartHour = 7;
  const weekBoardEndHour = 23;
  const weekHourHeight = 64;
  const stayBookingsOnly = useMemo(
    () => filteredBookings.filter((booking) => booking.type === 'stay_booking'),
    [filteredBookings],
  );
  const bookingsWithExtrasCount = useMemo(
    () => stayBookingsOnly.filter((booking) => (booking.extras || []).some((item) => item.title)).length,
    [stayBookingsOnly],
  );
  const extrasRevenueTotal = useMemo(
    () => stayBookingsOnly.reduce((sum, booking) => sum + Number(booking.extrasAmount || 0), 0),
    [stayBookingsOnly],
  );
  const prepaymentReviewCount = useMemo(
    () => stayBookingsOnly.filter((booking) => booking.status === 'payment_review' || booking.paymentStatus === 'review').length,
    [stayBookingsOnly],
  );

  const markNotificationRead = async (notificationId) => {
    if (!liveSessionUser?.id) return;
    const nextNotifications = userNotifications.map((item) => (
      String(item.id) === String(notificationId) ? { ...item, read: true } : item
    ));

    setNotificationsError('');
    setUsers((items) => items.map((item) => Number(item.id) === Number(liveSessionUser.id)
      ? normalizeUser({ ...item, notifications: nextNotifications }) : item));
    saveCurrentUser({ ...liveSessionUser, notifications: nextNotifications, isLoggedIn: true });

    try {
      await api.put(`/users/${liveSessionUser.id}`, { notifications: nextNotifications });
    } catch (error) {
      setNotificationsError('Не удалось обновить уведомление. Повторите попытку.');
      loadDashboardData();
    }
  };

  const saveBusinessProfile = async (values) => {
    if (!currentCompany?.id) {
      message.error('Компания не найдена.');
      return;
    }
    setBusinessProfileSaving(true);
    try {
      const payload = {
        ...values,
        paymentMethods: (values.paymentMethods || []).filter((method) => method?.title || method?.qrCodeUrl || method?.phoneNumber || method?.bankName),
        documents: (values.documents || []).filter((document) => document?.name || document?.dataUrl),
      };
      const response = await api.put(`/companies/${currentCompany.id}`, payload);
      const updatedCompany = response.data;
      setCompanies((items) => items.map((item) => (Number(item.id) === Number(updatedCompany.id) ? updatedCompany : item)));
      message.success('Профиль сохранён');
    } catch (error) {
      message.error(getFriendlyErrorMessage(error, 'Не удалось сохранить профиль.'));
    } finally {
      setBusinessProfileSaving(false);
    }
  };

  const topExtraService = useMemo(() => {
    const totals = new Map();
    stayBookingsOnly.forEach((booking) => {
      (booking.extras || []).forEach((extra) => {
        if (!extra?.title) return;
        const current = totals.get(extra.title) || { title: extra.title, quantity: 0, revenue: 0 };
        current.quantity += Math.max(Number(extra.quantity) || 1, 1);
        current.revenue += Number(extra.total || 0);
        totals.set(extra.title, current);
      });
    });

    return Array.from(totals.values()).sort((left, right) => right.revenue - left.revenue)[0] || null;
  }, [stayBookingsOnly]);

  const propertyDateRange = useMemo(() => (
    Array.from({ length: 7 }, (_, index) => dayjs().startOf('day').add(index, 'day'))
  ), []);

  const getUnitBookings = useCallback((unit) => stayBookings
    .filter((booking) => Number(booking.stayId) === Number(unit.id))
    .filter((booking) => !['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking))), [stayBookings]);

  const getUnitMetrics = useCallback((unit) => {
    const unitBookings = getUnitBookings(unit);
    const windowStart = dayjs().subtract(30, 'day').startOf('day');
    const windowEnd = dayjs().add(30, 'day').endOf('day');
    const activeInWindow = unitBookings.filter((booking) => {
      const start = dayjs(booking.checkInDate || booking.bookingDate);
      const end = dayjs(booking.checkOutDate || booking.endDate || booking.checkInDate);
      return start.isBefore(windowEnd) && end.isAfter(windowStart);
    });
    const occupiedDays = new Set();
    activeInWindow.forEach((booking) => {
      let cursor = dayjs(booking.checkInDate || booking.bookingDate).startOf('day');
      const end = dayjs(booking.checkOutDate || booking.endDate || booking.checkInDate).startOf('day');
      while (cursor.isBefore(end, 'day') || cursor.isSame(end, 'day')) {
        occupiedDays.add(cursor.format('YYYY-MM-DD'));
        cursor = cursor.add(1, 'day');
      }
    });
    const bookingsCount = unitBookings.length;
    const revenue = unitBookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
    const cancellations = stayBookings
      .filter((booking) => Number(booking.stayId) === Number(unit.id))
      .filter((booking) => ['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking))).length;
    const avgPrice = bookingsCount ? Math.round(revenue / bookingsCount) : Number(unit.pricePerNight || 0);
    const nextCheckIn = unitBookings
      .filter((booking) => dayjs(booking.checkInDate || booking.bookingDate).isAfter(dayjs().startOf('day')))
      .sort((left, right) => dayjs(left.checkInDate || left.bookingDate).valueOf() - dayjs(right.checkInDate || right.bookingDate).valueOf())[0] || null;

    return {
      bookings: unitBookings,
      bookingsCount,
      revenue,
      cancellations,
      avgPrice,
      occupiedDays: occupiedDays.size,
      freeDays: Math.max(60 - occupiedDays.size, 0),
      occupancy: Math.min(Math.round((occupiedDays.size / 60) * 100), 100),
      nextCheckIn,
    };
  }, [getUnitBookings, stayBookings]);

  const propertyRecords = useMemo(() => {
    const groups = new Map();
    accommodations
      .filter((unit) => isSuperAdmin || !currentCompany?.id || Number(unit.companyId) === Number(currentCompany.id))
      .forEach((unit) => {
        const key = unit.propertyId || unit.propertyName || unit.companyName || unit.location || `property-${unit.id}`;
        const label = unit.propertyName || unit.companyName || unit.location || unit.title || `Property #${unit.id}`;
        if (!groups.has(key)) {
          groups.set(key, {
            id: key,
            title: label,
            location: unit.location,
            companyName: unit.companyName,
            units: [],
          });
        }
        groups.get(key).units.push(unit);
      });

    return Array.from(groups.values()).map((property) => {
      const units = property.units.map((unit) => ({ ...unit, metrics: getUnitMetrics(unit) }));
      const revenue = units.reduce((sum, unit) => sum + unit.metrics.revenue, 0);
      const bookingsCount = units.reduce((sum, unit) => sum + unit.metrics.bookingsCount, 0);
      const occupancy = units.length ? Math.round(units.reduce((sum, unit) => sum + unit.metrics.occupancy, 0) / units.length) : 0;
      const nextCheckIn = units
        .map((unit) => unit.metrics.nextCheckIn ? { unit, booking: unit.metrics.nextCheckIn } : null)
        .filter(Boolean)
        .sort((left, right) => dayjs(left.booking.checkInDate || left.booking.bookingDate).valueOf() - dayjs(right.booking.checkInDate || right.booking.bookingDate).valueOf())[0] || null;

      return {
        ...property,
        units,
        image: units[0]?.images?.[0],
        type: units.length > 1 ? 'Property' : (ACCOMMODATION_TYPES.find((item) => item.value === units[0]?.type)?.label || units[0]?.type || 'Unit'),
        capacity: units.reduce((sum, unit) => sum + Number(unit.capacity || 0), 0),
        price: units.length ? Math.round(units.reduce((sum, unit) => sum + Number(unit.pricePerNight || 0), 0) / units.length) : 0,
        status: units.every((unit) => unit.status === 'available') ? 'available' : units.some((unit) => unit.status === 'available') ? 'mixed' : 'sold_out',
        occupancy,
        revenue,
        bookingsCount,
        cancellations: units.reduce((sum, unit) => sum + unit.metrics.cancellations, 0),
        avgPrice: bookingsCount ? Math.round(revenue / bookingsCount) : 0,
        nextCheckIn,
      };
    });
  }, [accommodations, currentCompany?.id, getUnitMetrics, isSuperAdmin]);

  useEffect(() => {
    const match = location.pathname.match(/^\/admin\/properties\/([^/]+)/);
    if (!match) return;
    const requestedPropertyId = decodeURIComponent(match[1]);
    const nextProperty = propertyRecords.find((property) => String(property.id) === requestedPropertyId);
    if (nextProperty) setPropertyDetailItem(nextProperty);
  }, [location.pathname, propertyRecords]);

  const weekHourRows = useMemo(() => (
    Array.from({ length: weekBoardEndHour - weekBoardStartHour }, (_, index) => weekBoardStartHour + index)
  ), []);

  const weekEventsByDay = useMemo(() => (
    weekCalendarDays.map((day) => {
      const items = weekCalendarEntries
        .filter((entry) => {
          const start = dayjs(entry.startDate);
          const end = dayjs(entry.endDate || entry.startDate);
          return day.date.isSame(start, 'day') || day.date.isSame(end, 'day') || (day.date.isAfter(start, 'day') && day.date.isBefore(end, 'day'));
        })
        .sort((left, right) => dayjs(left.startDate).valueOf() - dayjs(right.startDate).valueOf())
        .map((entry) => {
          const isTour = entry.type === 'tour';
          const start = isTour
            ? dayjs(entry.startDate).hour(9).minute(0)
            : getBookingStartDate(entry);
          const durationMinutes = isTour ? 90 : getBookingDurationMinutes(entry);
          const startMinutes = (start.hour() * 60) + start.minute();
          const boardStartMinutes = weekBoardStartHour * 60;
          const boardEndMinutes = weekBoardEndHour * 60;
          const endMinutes = Math.min(startMinutes + durationMinutes, boardEndMinutes);
          const topMinutes = Math.max(0, startMinutes - boardStartMinutes);
          const visibleDuration = Math.max(45, endMinutes - Math.max(startMinutes, boardStartMinutes));
          const palette = isTour
            ? ({
                scheduled: { background: 'rgba(37, 99, 235, 0.13)', border: '#2563eb', text: '#0f172a' },
                in_progress: { background: 'rgba(22, 163, 74, 0.12)', border: '#16a34a', text: '#0f172a' },
                completed: { background: 'rgba(100, 116, 139, 0.13)', border: '#64748b', text: '#0f172a' },
                cancelled: { background: 'rgba(220, 38, 38, 0.12)', border: '#dc2626', text: '#0f172a' },
                sold_out: { background: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#0f172a' },
              }[entry.status] || { background: 'rgba(37, 99, 235, 0.13)', border: '#2563eb', text: '#0f172a' })
            : {
                background: getBookingStatusVisual(entry.status).bg,
                border: getBookingStatusVisual(entry.status).color,
                text: '#0f172a',
              };

          return {
            ...entry,
            startMinute: Math.max(startMinutes, boardStartMinutes),
            endMinute: Math.max(endMinutes, Math.max(startMinutes, boardStartMinutes) + 45),
            style: {
              top: `${(topMinutes / 60) * weekHourHeight}px`,
              height: `${(visibleDuration / 60) * weekHourHeight}px`,
              background: palette.background,
              borderColor: palette.border,
              color: palette.text,
            },
            statusVisual: isTour ? null : getBookingStatusVisual(entry.status),
            timeLabel: isTour ? formatCalendarTimeRange(entry) : formatCalendarTimeRange(entry),
          };
        });

      const lanes = [];
      const placed = items.map((item) => {
        const laneIndex = lanes.findIndex((laneEnd) => laneEnd <= item.startMinute);
        const nextLane = laneIndex === -1 ? lanes.length : laneIndex;
        lanes[nextLane] = item.endMinute;
        return { ...item, laneIndex: nextLane };
      });
      const laneCount = Math.max(lanes.length, 1);

      return {
        ...day,
        items: placed.map((item) => ({
          ...item,
          style: {
            ...item.style,
            left: `calc(${(item.laneIndex / laneCount) * 100}% + 8px)`,
            width: `calc(${100 / laneCount}% - 12px)`,
          },
        })),
      };
    })
  ), [weekCalendarDays, weekCalendarEntries]);

  const scheduleDayEntries = useMemo(() => (
    selectedDayCalendarEntries
      .map((entry) => getScheduleEventForDate(entry, calendarDate))
      .filter((entry) => {
        const start = entry.scheduleTime || dayjs(entry.startDate);
        return start.isValid()
          && start.hour() >= weekBoardStartHour
          && start.hour() < weekBoardEndHour;
      })
      .sort((left, right) => (
        (left.scheduleTime || dayjs(left.startDate)).valueOf() - (right.scheduleTime || dayjs(right.startDate)).valueOf()
      ))
  ), [calendarDate, selectedDayCalendarEntries]);

  const scheduleDayTimedEntries = useMemo(() => {
    const boardStartMinutes = weekBoardStartHour * 60;
    const boardEndMinutes = weekBoardEndHour * 60;
    const items = scheduleDayEntries.map((entry) => {
      const start = entry.scheduleTime || dayjs(entry.startDate);
      const durationMinutes = entry.type === 'tour'
        ? 90
        : Math.min(Math.max(dayjs(entry.endDate).diff(start, 'minute') || getBookingDurationMinutes(entry), 45), 180);
      const startMinutes = (start.hour() * 60) + start.minute();
      const endMinutes = Math.min(startMinutes + durationMinutes, boardEndMinutes);
      const topMinutes = Math.max(0, startMinutes - boardStartMinutes);
      const visibleDuration = Math.max(45, endMinutes - Math.max(startMinutes, boardStartMinutes));

      return {
        ...entry,
        startMinute: Math.max(startMinutes, boardStartMinutes),
        endMinute: Math.max(endMinutes, Math.max(startMinutes, boardStartMinutes) + 45),
        timeLabel: start.format('HH:mm'),
        style: {
          top: `${(topMinutes / 60) * weekHourHeight}px`,
          height: `${(visibleDuration / 60) * weekHourHeight}px`,
        },
      };
    });
    const lanes = [];
    const placed = items.map((item) => {
      const laneIndex = lanes.findIndex((laneEnd) => laneEnd <= item.startMinute);
      const nextLane = laneIndex === -1 ? lanes.length : laneIndex;
      lanes[nextLane] = item.endMinute;
      return { ...item, laneIndex: nextLane };
    });
    const laneCount = Math.max(lanes.length, 1);

    return placed.map((item) => ({
      ...item,
      style: {
        ...item.style,
        left: `calc(${(item.laneIndex / laneCount) * 100}% + 12px)`,
        width: `calc(${100 / laneCount}% - 18px)`,
      },
    }));
  }, [scheduleDayEntries, weekHourHeight]);

  const scheduleResourceColumns = useMemo(() => {
    const columns = new Map();
    const addColumn = (key, label, meta = {}) => {
      if (!columns.has(key)) columns.set(key, { key, label, items: [], ...meta });
    };

    if (scheduleGroupBy === 'resources') {
      if (calendarResource === 'stays') {
        accommodations
          .filter((item) => isSuperAdmin || !currentCompany?.id || Number(item.companyId) === Number(currentCompany.id))
          .forEach((item) => addColumn(
            item.title || item.name || `Cottage #${item.id}`,
            item.title || item.name || `Cottage #${item.id}`,
            { bookingResource: 'cottages', objectId: String(item.id), resourceType: item.type || 'cottage' },
          ));
      } else {
        tours
          .filter((item) => isSuperAdmin || !currentCompany?.id || Number(item.companyId) === Number(currentCompany.id))
          .forEach((item) => addColumn(
            item.title || `Тур #${item.id}`,
            item.title || `Тур #${item.id}`,
            { bookingResource: 'tours', objectId: String(item.id), resourceType: 'tour' },
          ));
      }
    }

    scheduleDayTimedEntries.forEach((entry) => {
      const key = getScheduleResourceKey(entry, scheduleGroupBy);
      addColumn(key, key, {
        bookingResource: entry.type === 'stay_booking' ? 'cottages' : 'tours',
        objectId: entry.type === 'stay_booking' ? String(entry.stayId || '') : String(entry.tourId || entry.id || ''),
      });
      const column = columns.get(key);
      column.items.push(entry);
    });

    return Array.from(columns.values()).filter((column) => column.items.length || scheduleGroupBy === 'resources').slice(0, 12);
  }, [accommodations, calendarResource, currentCompany?.id, isSuperAdmin, scheduleDayTimedEntries, scheduleGroupBy, tours]);

  const tourStatusSegments = useMemo(() => [
    { label: `Все ${tours.length}`, value: 'all' },
    ...Object.entries(STATUS_META).map(([value, meta]) => ({
      label: `${meta.label} ${statusCounts[value] || 0}`,
      value,
    })),
  ], [statusCounts, tours.length]);

  const dashboardStats = [
    { title: 'Общая сумма', value: totalRevenue, formatter: formatMoney, color: '#2563eb' },
    { title: 'Оплачено', value: approvedTopupAmount, formatter: formatMoney, color: '#22c55e' },
    { title: 'Не оплачено', value: pendingTopupAmount, formatter: formatMoney, color: '#f59e0b' },
    { title: 'Бронирования', value: bookingRows.length, color: '#8b5cf6' },
    { title: 'Клиенты', value: users.length, color: '#0ea5e9' },
  ];
  const isBusinessPaidBooking = (booking) => (
    ['paid', 'confirmed'].includes(booking.status) || ['paid', 'confirmed'].includes(booking.paymentStatus)
  );
  const getBookingsForBusinessDate = useCallback((date) => bookingRows.filter((booking) => {
    const selected = date.startOf('day');
    const candidateDates = [
      booking.travelDate,
      booking.bookingDate,
      booking.checkInDate,
      booking.checkOutDate,
      booking.endDate,
      booking.purchasedAt,
    ].filter(Boolean);
    return candidateDates.some((value) => dayjs(value).isValid() && dayjs(value).isSame(selected, 'day'));
  }), [bookingRows]);
  const getPeriodChange = (current, previous) => {
    if (!previous && !current) return 'без изменений';
    if (!previous) return '+100%';
    const value = Math.round(((current - previous) / previous) * 100);
    return `${value > 0 ? '+' : ''}${value}%`;
  };
  const businessToday = dayjs();
  const businessYesterday = businessToday.subtract(1, 'day');
  const businessTodayBookings = getBookingsForBusinessDate(businessToday);
  const businessYesterdayBookings = getBookingsForBusinessDate(businessYesterday);
  const businessTodayRevenue = businessTodayBookings
    .filter(isBusinessPaidBooking)
    .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
  const businessYesterdayRevenue = businessYesterdayBookings
    .filter(isBusinessPaidBooking)
    .reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
  const businessTodayPendingPayment = businessTodayBookings
    .filter((booking) => !isBusinessPaidBooking(booking) && !['cancelled', 'rejected'].includes(booking.status))
    .reduce((sum, booking) => sum + Number(booking.prepaymentAmount || booking.amount || 0), 0);
  const businessTodayGuests = businessTodayBookings.reduce((sum, booking) => (
    sum + Math.max(Number(booking.people || booking.guests || 0), 0)
  ), 0);
  const businessYesterdayGuests = businessYesterdayBookings.reduce((sum, booking) => (
    sum + Math.max(Number(booking.people || booking.guests || 0), 0)
  ), 0);
  const businessTodayTours = tours.flatMap((tour) => (
    (Array.isArray(tour.departureSlots) ? tour.departureSlots : [])
      .filter((slot) => slot?.active !== false && dayjs(slot.startAt).isSame(businessToday, 'day'))
      .map((slot, index) => {
        const slotBookings = bookingRows.filter((booking) => (
          Number(booking.tourId) === Number(tour.id)
          && (!booking.departureSlotId || String(booking.departureSlotId) === String(slot.id || ''))
          && dayjs(booking.travelDate || booking.bookingDate).isSame(dayjs(slot.startAt), 'day')
        ));
        const totalSeats = Number(slot.seats || tour.totalSeats || tour.seats || 0);
        const bookedSeats = slotBookings.reduce((sum, booking) => sum + Math.max(Number(booking.people) || 1, 1), 0);
        return getScheduleEventForDate({
          ...tour,
          key: `business-home-tour-${tour.id}-${slot.id || index}`,
          type: 'tour',
          startDate: slot.startAt,
          totalSeats,
          bookedSeats,
          companyName: tour.companyName || currentCompany?.name,
        }, businessToday);
      })
  ));
  const businessTodayStayEvents = businessTodayBookings
    .filter((booking) => booking.type === 'stay_booking')
    .map((booking) => getScheduleEventForDate(booking, businessToday));
  const businessTodayTimeline = [...businessTodayTours, ...businessTodayStayEvents]
    .sort((left, right) => (
      (left.scheduleTime || dayjs(left.startDate)).valueOf() - (right.scheduleTime || dayjs(right.startDate)).valueOf()
    ));
  const businessUpcomingBookings = bookingRows
    .filter((booking) => dayjs(booking.bookingDate || booking.travelDate || booking.checkInDate).isAfter(businessToday.startOf('day')))
    .sort((left, right) => dayjs(left.bookingDate || left.travelDate || left.checkInDate).valueOf() - dayjs(right.bookingDate || right.travelDate || right.checkInDate).valueOf());
  const businessAwaitingConfirmation = bookingRows.filter((booking) => ['pending', 'pending_payment', 'payment_review'].includes(booking.status));
  const businessUnpaidBookings = bookingRows.filter((booking) => !isBusinessPaidBooking(booking) && !['cancelled', 'rejected'].includes(booking.status));
  const businessCheckInsToday = businessTodayStayEvents.filter((entry) => entry.scheduleType === 'check-in');
  const businessCheckOutsToday = businessTodayStayEvents.filter((entry) => entry.scheduleType === 'check-out');
  const businessOverdueTasks = businessAwaitingConfirmation.filter((booking) => dayjs(booking.bookingDate || booking.createdAt).isBefore(businessToday.startOf('day'))).length;
  const cottagesLoad = accommodations.length
    ? Math.min(100, Math.round((stayBookingsOnly.filter((booking) => {
      const start = dayjs(booking.checkInDate || booking.bookingDate);
      const end = dayjs(booking.checkOutDate || booking.endDate || booking.checkInDate);
      return start.isValid() && end.isValid() && !businessToday.isBefore(start, 'day') && !businessToday.isAfter(end, 'day');
    }).length / accommodations.length) * 100))
    : 0;
  const toursLoad = businessTodayTours.length
    ? Math.round((businessTodayTours.reduce((sum, tour) => sum + Number(tour.bookedSeats || 0), 0)
      / Math.max(businessTodayTours.reduce((sum, tour) => sum + Number(tour.totalSeats || 0), 0), 1)) * 100)
    : 0;
  const onboardingSteps = [
    { title: 'Создайте компанию', done: Boolean(currentCompany?.name && currentCompany?.phone), action: '/admin/company' },
    { title: 'Добавьте тур или объект', done: tours.length > 0 || accommodations.length > 0, action: tours.length ? `${basePath}/objects` : `${basePath}/tours` },
    { title: 'Настройте цены', done: [...tours, ...accommodations].some((item) => Number(item.price || item.pricePerNight || item.basePrice) > 0), action: tours.length ? `${basePath}/tours` : `${basePath}/objects` },
    { title: 'Добавьте менеджера', done: businessStaff.length > 0, action: `${basePath}/team` },
    { title: 'Укажите реквизиты', done: Boolean(primaryPaymentMethod.qrCodeUrl || primaryPaymentMethod.phoneNumber || primaryPaymentMethod.bankName), action: '/admin/company' },
    { title: 'Создайте первое бронирование', done: bookingRows.length > 0, action: `${basePath}/bookings` },
    { title: 'Опубликуйте предложение', done: [...tours, ...accommodations].some((item) => item.status === 'active' || item.status === 'available'), action: tours.length ? `${basePath}/tours` : `${basePath}/objects` },
  ];
  const onboardingDone = onboardingSteps.filter((step) => step.done).length;
  const onboardingProgress = Math.round((onboardingDone / onboardingSteps.length) * 100);

  const copyPortalLink = async () => {
    const nextLink = `${window.location.origin}${businessMode ? '/business/register' : '/register'}`;
    try {
      await navigator.clipboard.writeText(nextLink);
      message.success('Ссылка скопирована.');
    } catch (error) {
      message.error('Не удалось скопировать ссылку.');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate(businessMode ? '/business/login' : '/login');
  };

  const handleSidebarAction = ({ key }) => {
    if (key === 'logout') {
      handleLogout();
      return;
    }

    setMenuOpen(false);
    navigate(key);
  };

  const openCreateTourDrawer = () => {
    setEditingTourId(null);
    tourForm.resetFields();
    tourForm.setFieldsValue({
      companyId: currentCompany?.id ? String(currentCompany.id) : undefined,
      status: businessMode ? 'draft' : 'active',
      rating: 4.8,
      prepaymentMode: 'percent',
      prepaymentPercent: 30,
      prepaymentFixedAmount: 0,
      departureSlots: [{
        id: `departure-${Date.now()}`,
        startAt: calendarDate.add(1, 'day').hour(9).minute(0),
        seats: 20,
        active: true,
        guide: '',
        driver: '',
        vehicle: '',
        meetingPoint: '',
        price: 0,
        status: 'scheduled',
        waitlist: [],
        operationsChecklist: createEmptyTourOperationsChecklist(),
      }],
      route: '',
      manager: sessionUser?.name || currentCompany?.name || '',
      calendarStatus: 'scheduled',
      hasAccommodation: false,
      accommodations: [],
      accommodationIds: [],
    });
    setTourDrawerOpen(true);
  };

  const openDocumentPreview = (options) => {
    if (!options?.url) return;
    setDocumentPreview({
      title: options.title || 'Просмотр документа',
      name: options.name || '',
      url: options.url,
      type: options.type || '',
    });
  };

  const closeDocumentPreview = () => {
    setDocumentPreview(null);
  };

  const openCompanyRequestReviewModal = (request, action) => {
    if (!request?.id) return;
    setCompanyRequestReviewItem(request);
    setCompanyRequestReviewAction(action);
    setCompanyRequestReviewOpen(true);
    companyRequestReviewForm.resetFields();
    companyRequestReviewForm.setFieldsValue({
      adminComment: request.adminComment || '',
    });
  };

  const closeCompanyRequestReviewModal = () => {
    if (companyRequestReviewLoading) return;
    setCompanyRequestReviewOpen(false);
    setCompanyRequestReviewItem(null);
    companyRequestReviewForm.resetFields();
  };

  const openCompanyCenter = (companyId) => {
    if (!companyId) return;
    setCompanyCenterCompanyId(Number(companyId));
  };

  const closeCompanyCenter = () => {
    setCompanyCenterCompanyId(null);
  };

  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    tourForm.setFieldsValue({
      ...tour,
      companyId: tour.companyId ? String(tour.companyId) : (currentCompany?.id ? String(currentCompany.id) : undefined),
      rating: Number(tour.rating || 4.8),
      price: Number(tour.price || 0),
      prepaymentMode: tour.prepaymentMode || 'percent',
      prepaymentPercent: Number(tour.prepaymentPercent || 30),
      prepaymentFixedAmount: Number(tour.prepaymentFixedAmount || 0),
      departureSlots: (tour.departureSlots || []).map((slot, index) => ({
        id: slot.id || `departure-${index + 1}`,
        startAt: toDayjsField(slot.startAt),
        seats: Number(slot.seats || 1),
        active: slot.active !== false,
        guide: slot.guide || '',
        driver: slot.driver || '',
        vehicle: slot.vehicle || '',
        meetingPoint: slot.meetingPoint || '',
        price: Number(slot.price || tour.price || 0),
        status: slot.status || (slot.active === false ? 'paused' : 'scheduled'),
        waitlist: Array.isArray(slot.waitlist) ? slot.waitlist : [],
        operationsChecklist: {
          ...createEmptyTourOperationsChecklist(),
          ...(slot.operationsChecklist || {}),
        },
      })),
      route: tour.route || tour.location || '',
      manager: tour.manager || '',
      calendarStatus: tour.calendarStatus || tour.tripStatus || tour.scheduleStatus || 'scheduled',
      hasAccommodation: Boolean(tour.hasAccommodation),
      accommodations: (tour.accommodations || []).map(normalizeAccommodation),
      accommodationIds: tour.accommodationIds || [],
    });
    setTourDrawerOpen(true);
  };

  const closeTourDrawer = (force = false) => {
    if (tourSaving && !force) return;
    setTourDrawerOpen(false);
    setEditingTourId(null);
    tourForm.resetFields();
  };

  const handleSaveTour = async (values) => {
    if (tourSaving) return;
    const previousTour = editingTourId ? tours.find((item) => Number(item.id) === Number(editingTourId)) : null;
    const accommodationsPayload = (values.accommodations || []).map(normalizeAccommodation).map((item) => ({
      ...item,
      images: (item.images || []).filter(Boolean),
    }));

    const departureSlots = (values.departureSlots || [])
      .filter((slot) => slot?.startAt)
      .map((slot, index) => {
        const id = slot.id || `departure-${Date.now()}-${index}`;
        const previousSlot = previousTour?.departureSlots?.find((item) => String(item.id) === String(id));
        return {
          id,
          startAt: slot.startAt.toISOString(),
          seats: Math.max(Number(slot.seats || 1), 1),
          active: slot.active !== false,
          guide: slot.guide || '',
          driver: slot.driver || '',
          vehicle: slot.vehicle || '',
          meetingPoint: slot.meetingPoint || '',
          price: Number(slot.price || values.price || 0),
          status: slot.status || (slot.active === false ? 'paused' : 'scheduled'),
          waitlist: Array.isArray(slot.waitlist) ? slot.waitlist : (previousSlot?.waitlist || []),
          operationsChecklist: {
            ...createEmptyTourOperationsChecklist(),
            ...(slot.operationsChecklist || previousSlot?.operationsChecklist || {}),
          },
        };
      });
    if (!departureSlots.length) {
      message.error('Добавьте хотя бы одно отправление тура.');
      return;
    }
    const firstDeparture = departureSlots[0];

    const payload = {
      ...values,
      companyId: Number(values.companyId || currentCompany?.id || sessionUser?.companyId || 1),
      companyName: companiesById.get(Number(values.companyId || currentCompany?.id || sessionUser?.companyId || 1))?.name || currentCompany?.name || values.companyName || 'TravelPay',
      price: Number(values.price || 0),
      prepaymentMode: values.prepaymentMode || 'percent',
      prepaymentPercent: values.prepaymentMode === 'percent' ? Number(values.prepaymentPercent || 0) : 0,
      prepaymentFixedAmount: values.prepaymentMode === 'fixed' ? Number(values.prepaymentFixedAmount || 0) : 0,
      prepaymentRequired: values.prepaymentMode !== 'disabled',
      rating: Number(values.rating || 0),
      departureSlots,
      startDate: firstDeparture?.startAt || '',
      endDate: firstDeparture?.startAt || '',
      route: values.route || values.location || '',
      manager: values.manager || currentCompany?.name || sessionUser?.name || '',
      totalSeats: departureSlots.reduce((sum, slot) => sum + slot.seats, 0),
      bookedSeats: 0,
      calendarStatus: values.calendarStatus || 'scheduled',
      hasAccommodation: Boolean(values.hasAccommodation),
      accommodationIds: values.hasAccommodation ? (values.accommodationIds || []) : [],
      accommodations: values.hasAccommodation ? accommodationsPayload : [],
    };

    setTourSaving(true);
    try {
      let response;
      if (editingTourId) {
        response = await api.put(`/tours/${editingTourId}`, payload);
      } else {
        response = await api.post('/tours', payload);
      }

      const savedTour = normalizeTourRecord(response.data);
      setTours((current) => {
        const exists = current.some((item) => Number(item.id) === Number(savedTour.id));
        return exists ? current.map((item) => (Number(item.id) === Number(savedTour.id) ? savedTour : item)) : [savedTour, ...current];
      });
      window.dispatchEvent(new CustomEvent('travelpay-catalog-updated', { detail: { type: 'tour', action: editingTourId ? 'updated' : 'created', id: savedTour.id } }));

      await loadDashboardData();
      closeTourDrawer(true);
      message.success('Тур обновлён');
      setMessageState({ type: 'success', text: 'Тур сохранён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: getFriendlyErrorMessage(error, 'Не удалось сохранить тур.') });
    } finally {
      setTourSaving(false);
    }
  };

  const updateCompanyStatus = async (company, status) => {
    if (!isSuperAdmin) {
      setMessageState({ type: 'error', text: 'Изменять статус компании может только super admin.' });
      return;
    }

    const rejectionReason = status === 'rejected'
      ? 'Заявка отклонена администратором TravelPay. Свяжитесь с поддержкой для уточнения документов.'
      : '';

    Modal.confirm({
      title: status === 'active' ? 'Подтвердить компанию?' : 'Изменить статус компании?',
      content: `Компания: ${company.name}. Новый статус: ${status}.`,
      okText: 'Сохранить',
      cancelText: 'Отмена',
      okButtonProps: { danger: status === 'rejected' || status === 'blocked' },
      onOk: async () => {
        await api.put(`/companies/${company.id}`, {
          status,
          rejectionReason,
        });
        await loadDashboardData();
        setMessageState({ type: 'success', text: 'Статус компании обновлен.' });
      },
    });
  };

  const deleteTour = async (id) => {
    try {
      await api.delete(`/tours/${id}`);
      await loadDashboardData();
      setMessageState({ type: 'success', text: 'Тур удалён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось удалить тур.' });
    }
  };

  const openAccommodationDrawer = () => {
    setEditingAccommodationId(null);
    accommodationForm.resetFields();
    accommodationForm.setFieldsValue({
      ...createAccommodationEntityDraft(),
      companyId: currentCompany?.id ? String(currentCompany.id) : undefined,
      companyName: currentCompany?.name || '',
      capacity: 4,
      totalCount: 1,
      availableCount: 1,
      status: 'available',
      amenities: ['Wi-Fi', 'Парковка', 'Отопление'],
    });
    setAccommodationDrawerOpen(true);
  };

  const startEditAccommodation = (item) => {
    setEditingAccommodationId(item.id);
    const normalizedItem = normalizeAccommodation(item);
    accommodationForm.setFieldsValue({
      ...normalizedItem,
      title: item.title || item.name,
      images: item.images?.length ? item.images : [''],
      blockedDates: (normalizedItem.blockedDates || []).map((block) => ({
        ...block,
        startDate: block.startDate ? dayjs(block.startDate) : null,
        endDate: block.endDate ? dayjs(block.endDate) : null,
      })),
      pricingRules: (normalizedItem.pricingRules || []).map((rule) => ({
        ...rule,
        startDate: rule.startDate ? dayjs(rule.startDate) : null,
        endDate: rule.endDate ? dayjs(rule.endDate) : null,
      })),
      companyId: item.companyId ? String(item.companyId) : (currentCompany?.id ? String(currentCompany.id) : undefined),
      companyName: item.companyName || currentCompany?.name || '',
    });
    setAccommodationDrawerOpen(true);
  };

  const closeAccommodationDrawer = (force = false) => {
    if (accommodationSaving && !force) return;
    setAccommodationDrawerOpen(false);
    setEditingAccommodationId(null);
    accommodationForm.resetFields();
  };

  const handleSaveAccommodation = async (values) => {
    if (accommodationSaving) return;
    const selectedCompanyId = Number(values.companyId || currentCompany?.id || sessionUser?.companyId || 1);
    const selectedCompany = companiesById.get(selectedCompanyId) || currentCompany;
    const payload = {
      ...values,
      name: values.title,
      title: values.title,
      companyId: selectedCompanyId,
      companyName: selectedCompany?.name || values.companyName || currentCompany?.name || 'TravelPay',
      images: (values.images || []).filter(Boolean),
      amenities: values.amenities || [],
      linkedTourIds: values.linkedTourIds || [],
      totalCount: Number(values.totalCount || 0),
      availableCount: Number(values.availableCount || values.totalCount || 0),
      capacity: Number(values.capacity || 0),
      pricePerNight: Number(values.pricePerNight || 0),
      weekendPrice: Number(values.weekendPrice || 0),
      prepaymentMode: values.prepaymentMode || 'percent',
      prepaymentPercent: values.prepaymentMode === 'percent' ? Number(values.prepaymentPercent || 0) : 0,
      prepaymentFixedAmount: values.prepaymentMode === 'fixed' ? Number(values.prepaymentFixedAmount || 0) : 0,
      prepaymentRequired: values.prepaymentMode !== 'disabled',
      propertyName: String(values.propertyName || '').trim(),
      propertyId: String(values.propertyId || '').trim(),
      defaultCheckInTime: values.defaultCheckInTime || '14:00',
      defaultCheckOutTime: values.defaultCheckOutTime || '12:00',
      blockedDates: (values.blockedDates || []).map((block, index) => ({
        id: block.id || `block-${Date.now()}-${index}`,
        startDate: block.startDate?.startOf?.('day')?.toISOString?.() || block.startDate || '',
        endDate: block.endDate?.startOf?.('day')?.toISOString?.() || block.endDate || block.startDate || '',
        reason: block.reason || 'unavailable',
        comment: String(block.comment || '').trim(),
      })).filter((block) => block.startDate),
      pricingRules: (values.pricingRules || []).map((rule, index) => ({
        id: rule.id || `pricing-${Date.now()}-${index}`,
        type: rule.type || 'specific_date',
        startDate: rule.startDate?.startOf?.('day')?.toISOString?.() || rule.startDate || '',
        endDate: rule.endDate?.startOf?.('day')?.toISOString?.() || rule.endDate || rule.startDate || '',
        price: Number(rule.price || 0),
        discount: Number(rule.discount || 0),
        minimumStay: Number(rule.minimumStay || 0),
        label: String(rule.label || '').trim(),
      })),
      extraBedPrice: Number(values.extraBedPrice || 0),
      extraServices: (values.extraServices || []).map((service, serviceIndex) => ({
        id: service.id || `service-${Date.now()}-${serviceIndex}`,
        title: String(service.title || '').trim(),
        description: String(service.description || '').trim(),
        type: service.type || 'toggle',
        price: Number(service.price || 0),
        maxQuantity: Number(service.maxQuantity || 1),
        unitLabel: String(service.unitLabel || 'шт.').trim(),
        active: service.active !== false,
        sortOrder: Number(service.sortOrder ?? serviceIndex),
        options: (service.options || []).map((option, optionIndex) => ({
          id: option.id || `option-${serviceIndex + 1}-${optionIndex + 1}`,
          label: String(option.label || '').trim(),
          price: Number(option.price || 0),
        })).filter((option) => option.label),
      })).filter((service) => service.title),
    };

    setAccommodationSaving(true);
    try {
      let response;
      if (editingAccommodationId) {
        response = await api.put(`/accommodations/${editingAccommodationId}`, payload);
      } else {
        response = await api.post('/accommodations', payload);
      }

      const savedAccommodation = normalizeAccommodation(response.data);
      setAccommodations((current) => {
        const exists = current.some((item) => Number(item.id) === Number(savedAccommodation.id));
        return exists ? current.map((item) => (Number(item.id) === Number(savedAccommodation.id) ? savedAccommodation : item)) : [savedAccommodation, ...current];
      });
      window.dispatchEvent(new CustomEvent('travelpay-catalog-updated', { detail: { type: 'accommodation', action: editingAccommodationId ? 'updated' : 'created', id: savedAccommodation.id } }));

      await loadDashboardData();
      closeAccommodationDrawer(true);
      message.success('Объект обновлён');
      setMessageState({ type: 'success', text: 'Домик сохранён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: getFriendlyErrorMessage(error, 'Не удалось сохранить объект.') });
    } finally {
      setAccommodationSaving(false);
    }
  };

  const deleteAccommodation = async (id) => {
    try {
      await api.delete(`/accommodations/${id}`);
      await loadDashboardData();
      setMessageState({ type: 'success', text: 'Домик удалён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось удалить домик.' });
    }
  };

  const openStayBookingEditor = (booking) => {
    if (!booking || booking.type !== 'stay_booking') {
      message.info('Редактирование доступно только для броней домиков.');
      return;
    }

    setEditingStayBooking(booking);
    setStayBookingEditorExtras(buildStayBookingEditorExtras(
      accommodations.find((item) => Number(item.id) === Number(booking.stayId))?.extraServices || [],
      booking.extras || [],
    ));
    stayBookingForm.setFieldsValue({
      clientName: booking.clientName || '',
      clientPhone: booking.clientPhone || '',
      clientEmail: booking.clientEmail || '',
      guests: Number(booking.guests || 1),
      nights: Number(booking.nights || 1),
      checkInDate: toDayjsField(booking.checkInDate || booking.bookingDate),
      checkInTime: booking.checkInTime || '14:00',
      comment: booking.comment || '',
      status: booking.status || 'payment_review',
    });
    setStayBookingDrawerOpen(true);
  };

  const closeStayBookingEditor = () => {
    setStayBookingDrawerOpen(false);
    setEditingStayBooking(null);
    setStayBookingEditorExtras({});
    stayBookingForm.resetFields();
  };

  const saveStayBookingEditor = async (values) => {
    if (!editingStayBooking) return;

    try {
      setStayBookingEditLoading(true);
      await api.put(`/stay-bookings/${editingStayBooking.id}`, {
        clientName: values.clientName,
        clientPhone: values.clientPhone,
        clientEmail: values.clientEmail,
        guests: Number(values.guests || 1),
        nights: Number(values.nights || 1),
        checkInDate: values.checkInDate?.startOf('day')?.toISOString?.() || editingStayBooking.checkInDate,
        checkInTime: values.checkInTime,
        startTime: values.checkInTime,
        endTime: addMinutesToClock(values.checkInTime, STAY_BOOKING_SLOT_DURATION_MINUTES),
        comment: values.comment || '',
        status: values.status || editingStayBooking.status,
        extras: editingStayBookingSummary.map((item) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          selected: item.selected,
          selectedOptionId: item.selectedOptionId,
        })),
      });

      await loadDashboardData();
      closeStayBookingEditor();
      setCalendarDrawerItem(null);
      setMessageState({ type: 'success', text: 'Бронь домика обновлена.' });
    } catch (error) {
      setMessageState({ type: 'error', text: getFriendlyErrorMessage(error, 'Не удалось обновить бронь.') });
    } finally {
      setStayBookingEditLoading(false);
    }
  };

  const toggleAdmin = async (user) => {
    try {
      await api.put(`/users/${user.id}`, {
        ...user,
        role: user.role === 'company_admin' ? 'user' : 'company_admin',
      });

      await loadDashboardData();
      setMessageState({ type: 'success', text: 'Роль пользователя обновлена.' });
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось изменить роль.' });
    }
  };

  const openReviewModal = (request, action) => {
    setReviewRequest(request);
    setReviewAction(action);
    reviewForm.resetFields();
    reviewForm.setFieldsValue(action === 'approve'
      ? {
          amount: Number(request.amount || 0),
          bonusType: 'fixed',
          bonus: 0,
          adminComment: '',
        }
      : { adminComment: '' });
  };

  const closeReviewModal = () => {
    if (reviewLoading) return;
    setReviewRequest(null);
    reviewForm.resetFields();
  };

  const handleReviewSubmit = async (values) => {
    if (!reviewRequest) return;

    const endpoint = reviewAction === 'approve'
      ? `/api/admin/topups/${reviewRequest.id}/approve`
      : `/api/admin/topups/${reviewRequest.id}/reject`;

    setReviewLoading(true);
    try {
      await api.put(endpoint, values);
      await loadDashboardData();
      closeReviewModal();
      setMessageState({
        type: 'success',
        text: reviewAction === 'approve' ? 'Пополнение подтверждено.' : 'Заявка отклонена.',
      });
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось обработать заявку.' });
    } finally {
      setReviewLoading(false);
      setReviewRequest(null);
    }
  };

  const getTourActions = (tour) => ({
    items: [
      {
        key: 'open',
        icon: <EyeOutlined />,
        label: 'Открыть тур',
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Редактировать',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        danger: true,
        label: 'Удалить',
      },
    ],
    onClick: ({ key }) => {
      if (key === 'open') navigate(`/tours/${tour.id}`, { state: { tour } });
      if (key === 'edit') startEditTour(tour);
      if (key === 'delete') deleteTour(tour.id);
    },
  });

  const getAccommodationActions = (item) => ({
    items: [
      { key: 'edit', icon: <EditOutlined />, label: 'Редактировать' },
      { key: 'delete', icon: <DeleteOutlined />, danger: true, label: 'Удалить' },
    ],
    onClick: ({ key }) => {
      if (key === 'edit') startEditAccommodation(item);
      if (key === 'delete') deleteAccommodation(item.id);
    },
  });

  const openClientDetails = (client) => {
    if (!client?.id) return;
    setClientDrawerItem(client);
    navigate(`${basePath}/clients/${client.id}`);
  };

  const closeClientDetails = () => {
    setClientDrawerItem(null);
    if (location.pathname.includes('/clients/')) {
      navigate(`${basePath}/clients`);
    }
  };

  const openPropertyDetails = (property) => {
    if (!property?.id) return;
    setPropertyDetailItem(property);
    navigate(`/admin/properties/${encodeURIComponent(property.id)}`);
  };

  const closePropertyDetails = () => {
    setPropertyDetailItem(null);
    if (location.pathname.includes('/properties/')) {
      navigate('/admin/properties');
    }
  };

  const saveClientTags = async (client, tags) => {
    if (!client?.id) return;
    const nextTags = Array.from(new Set((tags || []).map((tag) => String(tag).trim()).filter(Boolean)));
    setClientDrawerItem((current) => current && Number(current.id) === Number(client.id) ? { ...current, clientTags: nextTags } : current);
    setUsers((items) => items.map((item) => Number(item.id) === Number(client.id) ? normalizeUser({ ...item, clientTags: nextTags }) : item));
    try {
      await api.put(`/users/${client.id}`, { clientTags: nextTags });
      message.success('Метки клиента сохранены.');
    } catch (error) {
      message.error(getFriendlyErrorMessage(error, 'Не удалось сохранить клиента.'));
      loadDashboardData();
    }
  };

  const getClientActions = (user) => ({
    items: [
      { key: 'profile', icon: <EyeOutlined />, label: 'Профиль' },
      ...(isSuperAdmin ? [{
        key: 'role',
        icon: <TeamOutlined />,
        label: user.role === 'company_admin' ? 'Снять админа компании' : 'Сделать админом компании',
      }] : []),
    ],
    onClick: ({ key }) => {
      if (key === 'profile') openClientDetails(user);
      if (key === 'role') toggleAdmin(user);
    },
  });

  const getBookingActions = (booking) => {
    const isManagedTourBooking = booking.type === 'tour_booking' && String(booking.key || '').startsWith('tour-booking-');
    const isManagedBooking = booking.type === 'stay_booking' || isManagedTourBooking;

    return {
      items: [
        { key: 'details', icon: <EyeOutlined />, label: 'Подробнее' },
        ...(isManagedBooking ? [
          { key: 'confirm', icon: <CheckOutlined />, label: 'Подтвердить' },
          { key: 'reject', icon: <CloseOutlined />, danger: true, label: 'Отклонить' },
          { key: 'cancel', icon: <CloseOutlined />, danger: true, label: 'Отменить' },
        ] : [
          { key: 'edit', icon: <EditOutlined />, label: 'Изменить' },
          { key: 'delete', icon: <DeleteOutlined />, danger: true, label: 'Удалить' },
        ]),
      ],
      onClick: async ({ key }) => {
      if (key === 'details') {
        Modal.info({
          title: 'Детали бронирования',
          width: 620,
          okText: 'Закрыть',
          content: (
            <Space orientation="vertical" size={10} style={{ width: '100%', marginTop: 12 }}>
              <div><Text type="secondary">Клиент</Text><br /><strong>{booking.clientName || '—'}</strong></div>
              <div><Text type="secondary">Тур</Text><br /><strong>{booking.tourTitle || '—'}</strong></div>
              <div><Text type="secondary">Дата и время</Text><br /><strong>{formatDateTime(booking.bookingDate)}</strong></div>
              {booking.type === 'stay_booking' && <div><Text type="secondary">Гости / комментарий</Text><br /><strong>{booking.guests || 1} гостей</strong><br /><Text>{booking.comment || 'Комментария нет'}</Text></div>}
              <div><Text type="secondary">Менеджер</Text><br /><strong>{booking.assignedTo || '—'}</strong></div>
              <div><Text type="secondary">Сумма</Text><br /><strong>{formatMoney(booking.amount)}</strong></div>
              {booking.type === 'stay_booking' ? renderStayBookingExtras(booking) : null}
            </Space>
          ),
        });
      }

      if (isManagedBooking && (key === 'confirm' || key === 'cancel')) {
        try {
          const resource = booking.type === 'stay_booking' ? 'stay-bookings' : 'tour-bookings';
          await api.put(`/${resource}/${booking.id}`, {
            status: key === 'confirm' ? 'confirmed' : 'cancelled',
          });
          message.success(key === 'confirm' ? 'Бронирование подтверждено.' : 'Бронирование отменено.');
          loadDashboardData();
        } catch (error) {
          message.error(getFriendlyErrorMessage(error, 'Не удалось обновить бронирование.'));
        }
      }

      if (isManagedBooking && key === 'reject') {
        openStayBookingRejectModal(booking);
      }

      if (key === 'edit') {
        if (booking.type === 'stay_booking') {
          openStayBookingEditor(booking);
        } else {
          message.info('Редактирование тур-бронирований подключим следующим этапом.');
        }
      }

      if (key === 'delete') {
        message.warning('Удаление бронирований пока недоступно в этом интерфейсе.');
      }
      },
    };
  };

  const closeQuickBookingDrawer = () => {
    if (quickBookingSaving || quickBookingWaitlistSaving) return;
    setQuickBookingDrawerOpen(false);
    quickBookingForm.resetFields();
    setQuickBookingSlots([]);
  };

  const openQuickBookingDrawer = (defaults = {}) => {
    const resource = defaults.resource || (calendarResource === 'stays' ? 'cottages' : 'tours');
    const defaultDate = dayjs(defaults.date || calendarDate).startOf('day');
    const slotHour = Number.isFinite(Number(defaults.hour)) ? Number(defaults.hour) : null;
    const selectedObjectId = defaults.objectId
      || (calendarTourFilter !== 'all' ? calendarTourFilter : undefined);
    const startTime = slotHour === null ? '14:00' : `${String(slotHour).padStart(2, '0')}:00`;
    const defaultPeople = 1;

    quickBookingForm.resetFields();
    quickBookingForm.setFieldsValue({
      resource,
      clientId: undefined,
      objectId: selectedObjectId,
      departureSlotId: undefined,
      waitlistDepartureSlotId: undefined,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      people: defaultPeople,
      guests: defaultPeople,
      adults: defaultPeople,
      children: 0,
      nights: 1,
      checkInDate: defaultDate,
      startTime,
      endTime: addMinutesToClock(startTime, STAY_BOOKING_SLOT_DURATION_MINUTES),
      amount: undefined,
      prepaymentAmount: 0,
      paymentMethod: 'manager',
      manager: sessionUser?.name || currentCompany?.name || 'TravelPay Business',
      bookingSource: 'manual',
      bookingStatus: 'PENDING',
      pickup: '',
      emergencyContact: '',
      comment: '',
    });
    setQuickBookingDrawerOpen(true);
  };

  const saveQuickBooking = async (values) => {
    if (quickBookingSaving) return;

    setQuickBookingSaving(true);
    try {
      let response;
      if (isQuickBookingTourKind(values.resource)) {
        const selectedSlot = quickBookingSlots.find((slot) => String(slot.id) === String(values.departureSlotId));
        const people = Math.max(Number(values.people || values.adults || 1), 1);
        if (selectedSlot && (selectedSlot.soldOut || selectedSlot.available === false || Number(selectedSlot.remainingSeats || 0) < people)) {
          message.warning(`На это отправление осталось только ${selectedSlot.remainingSeats || 0} мест.`);
          return;
        }
        response = await api.post('/tour-bookings', {
          tourId: Number(values.objectId),
          departureSlotId: values.departureSlotId,
          clientName: values.clientName?.trim(),
          clientPhone: values.clientPhone?.trim(),
          clientEmail: values.clientEmail?.trim(),
          people,
          adults: Math.max(Number(values.adults) || people, 1),
          children: Math.max(Number(values.children) || 0, 0),
          amount: Number(values.amount) || undefined,
          prepaymentAmount: Number(values.prepaymentAmount) || 0,
          assignedTo: values.manager?.trim(),
          bookingSource: values.bookingSource,
          bookingStatus: values.bookingStatus,
          pickup: values.pickup?.trim(),
          pickupLocation: values.pickup?.trim(),
          emergencyContact: values.emergencyContact?.trim(),
          comment: values.comment?.trim(),
          paymentMethod: values.paymentMethod || 'manager',
          manualBooking: true,
        });
        const booking = normalizeTourBooking(response.data?.booking || response.data);
        setTourBookings((items) => [booking, ...items.filter((item) => Number(item.id) !== Number(booking.id))]);
      } else {
        const conflicts = getStaySlotConflicts(values.objectId, {
          date: values.checkInDate,
          startTime: values.startTime,
          endTime: values.endTime,
        });
        if (conflicts.length) {
          const firstConflict = conflicts[0];
          message.warning(`${firstConflict.stayTitle || 'Объект'} уже занят: ${firstConflict.startTime || firstConflict.checkInTime || '14:00'} → ${firstConflict.endTime || firstConflict.checkOutTime || '16:00'}`);
          return;
        }
        const checkInDate = values.checkInDate?.startOf('day');
        response = await api.post('/stay-bookings', {
          stayId: Number(values.objectId),
          clientName: values.clientName?.trim(),
          clientPhone: values.clientPhone?.trim(),
          clientEmail: values.clientEmail?.trim(),
          guests: Math.max(Number(values.guests) || 1, 1),
          adults: Math.max(Number(values.adults) || Number(values.guests) || 1, 1),
          children: Math.max(Number(values.children) || 0, 0),
          nights: Math.max(Number(values.nights) || 1, 1),
          checkInDate: checkInDate?.format('YYYY-MM-DD'),
          startTime: values.startTime,
          checkInTime: values.startTime,
          endTime: values.endTime,
          amount: Number(values.amount) || undefined,
          prepaymentAmount: Number(values.prepaymentAmount) || 0,
          assignedTo: values.manager?.trim(),
          bookingSource: values.bookingSource,
          bookingStatus: values.bookingStatus,
          comment: values.comment?.trim(),
          prepaymentRequired: false,
          paymentMethod: values.paymentMethod || 'manager',
          manualBooking: true,
        });
        const booking = normalizeStayBooking(response.data?.booking || response.data);
        setStayBookings((items) => [booking, ...items.filter((item) => Number(item.id) !== Number(booking.id))]);
      }

      setQuickBookingDrawerOpen(false);
      quickBookingForm.resetFields();
      setQuickBookingSlots([]);
      window.dispatchEvent(new CustomEvent('travelpay-business-data-changed', { detail: { type: 'booking', action: 'created' } }));
      message.success('Бронирование создано');
    } catch (error) {
      message.error(getFriendlyErrorMessage(error, 'Не удалось создать бронирование.'));
    } finally {
      setQuickBookingSaving(false);
    }
  };

  const globalSearchItems = useMemo(() => {
    const clientItems = clientRecords.map((client) => ({
      key: `client-${client.id}`,
      type: 'client',
      typeLabel: 'Клиент',
      color: 'green',
      title: client.name || client.fullName || client.phone || 'Клиент',
      description: [client.phone, `${client.bookingsCount || 0} броней`, formatMoney(client.totalSpent || 0)].filter(Boolean).join(' · '),
      searchable: [client.name, client.fullName, client.phone, client.email, client.clientTags?.join(' ')].filter(Boolean).join(' '),
      action: () => openClientDetails(client),
    })).filter(() => canBusinessPermission(BUSINESS_PERMISSION_KEYS.VIEW_CLIENTS));

    const bookingItems = bookingRows.map((booking) => ({
      key: `booking-${booking.type || 'booking'}-${booking.id}`,
      type: 'booking',
      typeLabel: 'Бронь',
      color: 'purple',
      title: `#TRP-${String(booking.id || 0).padStart(4, '0')} · ${booking.clientName || 'Клиент'}`,
      description: [booking.tourTitle || booking.stayTitle, booking.clientPhone, formatDate(booking.bookingDate || booking.checkInDate), formatMoney(booking.amount || 0)].filter(Boolean).join(' · '),
      searchable: [booking.id, booking.clientName, booking.clientPhone, booking.clientEmail, booking.tourTitle, booking.stayTitle, booking.bookingSource, booking.status].filter(Boolean).join(' '),
      action: () => setCalendarDrawerItem(booking),
    })).filter(() => canBusinessPermission(BUSINESS_PERMISSION_KEYS.VIEW_BOOKINGS));

    const tourItems = tours.map((tour) => ({
      key: `tour-${tour.id}`,
      type: 'tour',
      typeLabel: 'Тур',
      color: 'cyan',
      title: tour.title || tour.name || 'Тур',
      description: [tour.location || tour.route, tour.duration, formatMoney(tour.price || 0)].filter(Boolean).join(' · '),
      searchable: [tour.title, tour.name, tour.location, tour.route, tour.description, tour.price].filter(Boolean).join(' '),
      action: () => navigate(`/tours/${tour.id}`, { state: { tour } }),
    })).filter(() => canBusinessPermission(BUSINESS_PERMISSION_KEYS.VIEW_TOURS));

    const propertyItems = accommodations.map((item) => ({
      key: `property-${item.id}`,
      type: 'property',
      typeLabel: 'Объект',
      color: 'gold',
      title: item.title || item.name || item.propertyName || 'Объект',
      description: [item.propertyName, item.location || item.region, `${item.capacity || 0} гостей`, formatMoney(item.pricePerNight || item.price || 0)].filter(Boolean).join(' · '),
      searchable: [item.title, item.name, item.propertyName, item.location, item.region, item.address, item.status].filter(Boolean).join(' '),
      action: () => navigate(`${basePath}/properties`),
    })).filter(() => canBusinessPermission(BUSINESS_PERMISSION_KEYS.VIEW_PROPERTIES));

    const transactionItems = bookingRows
      .filter((booking) => Number(booking.prepaymentAmount || booking.paidAmount || booking.amountPaid || 0) > 0 || booking.paymentStatus)
      .map((booking) => {
        const debt = getBookingDebtSummary(booking);
        return {
          key: `transaction-${booking.type || 'booking'}-${booking.id}`,
          type: 'transaction',
          typeLabel: 'Транзакция',
          color: 'volcano',
          title: `${formatMoney(debt.paid)} · ${booking.clientName || 'Клиент'}`,
          description: [`#TRP-${String(booking.id || 0).padStart(4, '0')}`, booking.tourTitle || booking.stayTitle, getPaymentStatusLabel(booking)].filter(Boolean).join(' · '),
          searchable: [booking.id, booking.clientName, booking.clientPhone, booking.paymentMethod, booking.paymentStatus, debt.paid].filter(Boolean).join(' '),
          action: () => setCalendarDrawerItem(booking),
        };
      })
      .filter(() => canBusinessPermission(BUSINESS_PERMISSION_KEYS.VIEW_PAYMENTS));

    return [...clientItems, ...bookingItems, ...tourItems, ...propertyItems, ...transactionItems];
  }, [accommodations, basePath, bookingRows, canBusinessPermission, clientRecords, navigate, openClientDetails, tours]);

  const commandItems = useMemo(() => ([
    {
      key: 'command-find-client',
      type: 'command',
      typeLabel: 'Команда',
      color: 'blue',
      title: 'Найти клиента',
      description: 'Открыть CRM клиентов',
      searchable: 'найти клиент client поиск телефон',
      action: () => navigate(`${basePath}/clients`),
      permission: BUSINESS_PERMISSION_KEYS.VIEW_CLIENTS,
    },
    {
      key: 'command-create-booking',
      type: 'command',
      typeLabel: 'Команда',
      color: 'blue',
      title: 'Создать бронь',
      description: 'Открыть drawer новой брони',
      searchable: 'создать бронь booking reservation',
      action: () => openQuickBookingDrawer({ date: calendarDate, resource: 'tours' }),
      permission: BUSINESS_PERMISSION_KEYS.MANAGE_BOOKINGS,
    },
    {
      key: 'command-create-tour',
      type: 'command',
      typeLabel: 'Команда',
      color: 'blue',
      title: 'Создать тур',
      description: 'Добавить тур и отправления',
      searchable: 'создать тур tour departure',
      action: openCreateTourDrawer,
      permission: BUSINESS_PERMISSION_KEYS.MANAGE_TOURS,
    },
    {
      key: 'command-add-property',
      type: 'command',
      typeLabel: 'Команда',
      color: 'blue',
      title: 'Добавить объект',
      description: 'Коттедж, домик или другое жильё',
      searchable: 'добавить объект коттедж дом property cottage house',
      action: openAccommodationDrawer,
      permission: BUSINESS_PERMISSION_KEYS.MANAGE_PROPERTIES,
    },
    {
      key: 'command-accept-payment',
      type: 'command',
      typeLabel: 'Команда',
      color: 'blue',
      title: 'Принять оплату',
      description: 'Перейти в кассу и транзакции',
      searchable: 'принять оплату payment cashbox qr',
      action: () => navigate(`${basePath}/payments`),
      permission: BUSINESS_PERMISSION_KEYS.VIEW_PAYMENTS,
    },
    {
      key: 'command-create-task',
      type: 'command',
      typeLabel: 'Команда',
      color: 'blue',
      title: 'Создать задачу',
      description: 'Открыть задачи команды',
      searchable: 'создать задачу task kanban',
      action: () => navigate(`${basePath}/tasks`),
      permission: BUSINESS_PERMISSION_KEYS.MANAGE_TASKS,
    },
  ].filter((item) => canBusinessPermission(item.permission))), [basePath, calendarDate, canBusinessPermission, navigate, openAccommodationDrawer, openCreateTourDrawer, openQuickBookingDrawer]);

  const commandPaletteResults = useMemo(() => {
    const query = normalizePhone(commandPaletteQuery) || commandPaletteQuery.trim().toLowerCase();
    const allItems = [...commandItems, ...globalSearchItems];
    if (!query) return allItems.slice(0, 12);

    return allItems
      .map((item) => {
        const haystack = `${item.title || ''} ${item.description || ''} ${item.searchable || ''}`.toLowerCase();
        const normalizedHaystack = normalizePhone(haystack);
        const exactPhoneMatch = Boolean(normalizedHaystack && query.length >= 5 && normalizedHaystack.includes(query));
        const textMatch = haystack.includes(commandPaletteQuery.trim().toLowerCase());
        const startsWith = haystack.split(/\s+/).some((part) => part.startsWith(commandPaletteQuery.trim().toLowerCase()));
        if (!exactPhoneMatch && !textMatch && !startsWith) return null;
        return {
          ...item,
          score: exactPhoneMatch ? 0 : startsWith ? 1 : 2,
        };
      })
      .filter(Boolean)
      .sort((left, right) => left.score - right.score)
      .slice(0, 20);
  }, [commandItems, commandPaletteQuery, globalSearchItems]);

  const runCommandPaletteItem = (item) => {
    if (!item?.action) return;
    item.action();
    setCommandPaletteOpen(false);
    setCommandPaletteQuery('');
  };

  const activityLogRows = useMemo(() => {
    const rows = [];
    const actorName = (id, fallback = 'TravelPay Business') => (
      id ? (usersById.get(Number(id))?.name || fallback) : fallback
    );

    bookingRows.forEach((booking) => {
      const bookingCode = `#TRP-${String(booking.id || 0).padStart(4, '0')}`;
      const serviceTitle = booking.tourTitle || booking.stayTitle || booking.title || 'Бронирование';
      const fallbackActor = booking.assignedTo || booking.manager || booking.createdByAdminName || 'Manager';

      (booking.statusHistory || []).forEach((entry, index) => {
        const field = entry.field || entry.type || 'status';
        const fromLabel = entry.from ? ((BOOKING_STATUS_META[String(entry.from).toUpperCase()] || PAYMENT_STATUS_META[String(entry.from).toUpperCase()] || {}).label || entry.from) : '';
        const toLabel = entry.to ? ((BOOKING_STATUS_META[String(entry.to).toUpperCase()] || PAYMENT_STATUS_META[String(entry.to).toUpperCase()] || {}).label || entry.to) : '';
        rows.push({
          key: `booking-history-${booking.type}-${booking.id}-${index}`,
          date: entry.changedAt || entry.time || booking.updatedAt || booking.createdAt || booking.bookingDate,
          actor: entry.actorName || actorName(entry.actorId || entry.changedBy, fallbackActor),
          type: 'booking',
          typeLabel: 'Booking',
          color: 'purple',
          title: `${entry.actorName || actorName(entry.actorId || entry.changedBy, fallbackActor)} изменил booking ${bookingCode}`,
          details: [serviceTitle, field, [fromLabel, toLabel].filter(Boolean).join(' → ')].filter(Boolean).join(' · '),
        });
      });

      const debt = getBookingDebtSummary(booking);
      if (debt.paid > 0) {
        const paymentDate = booking.paymentReviewedAt || booking.fundsReservedAt || booking.paymentCreatedAt || booking.createdAt || booking.bookingDate;
        rows.push({
          key: `booking-payment-${booking.type}-${booking.id}`,
          date: paymentDate,
          actor: actorName(booking.paymentReviewedBy, fallbackActor),
          type: 'payment',
          typeLabel: 'Payment',
          color: 'green',
          title: `${actorName(booking.paymentReviewedBy, fallbackActor)} принял оплату ${formatMoney(debt.paid)}`,
          details: [bookingCode, serviceTitle, booking.clientName, booking.paymentMethod || getPaymentStatusLabel(booking)].filter(Boolean).join(' · '),
        });
      }

      (booking.refunds || booking.refundHistory || []).forEach((refund, index) => {
        rows.push({
          key: `booking-refund-${booking.type}-${booking.id}-${index}`,
          date: refund.createdAt || refund.date || booking.updatedAt,
          actor: refund.processedByName || actorName(refund.processedBy || refund.createdBy, fallbackActor),
          type: 'refund',
          typeLabel: 'Refund',
          color: 'volcano',
          title: `${refund.processedByName || actorName(refund.processedBy || refund.createdBy, fallbackActor)} оформил refund ${formatMoney(refund.amount)}`,
          details: [bookingCode, refund.reason, refund.comment].filter(Boolean).join(' · '),
        });
      });

      if (booking.type === 'stay_booking' && booking.updatedAt && booking.createdAt && dayjs(booking.updatedAt).diff(dayjs(booking.createdAt), 'minute') > 5) {
        rows.push({
          key: `booking-checkin-moved-${booking.id}`,
          date: booking.updatedAt,
          actor: fallbackActor || 'Admin',
          type: 'schedule',
          typeLabel: 'Schedule',
          color: 'blue',
          title: `${fallbackActor || 'Admin'} перенес check-in`,
          details: [bookingCode, booking.stayTitle, booking.clientName, `${formatDate(booking.checkInDate || booking.bookingDate)} ${booking.checkInTime || booking.startTime || ''}`.trim()].filter(Boolean).join(' · '),
        });
      }
    });

    tours.forEach((tour) => {
      if (!tour.updatedAt || !tour.createdAt || dayjs(tour.updatedAt).diff(dayjs(tour.createdAt), 'minute') <= 5) return;
      rows.push({
        key: `tour-price-${tour.id}`,
        date: tour.updatedAt,
        actor: tour.manager || currentCompany?.name || 'Owner',
        type: 'catalog',
        typeLabel: 'Catalog',
        color: 'cyan',
        title: `${tour.manager || 'Owner'} изменил цену ${tour.title || tour.name || 'тура'}`,
        details: [tour.location || tour.route, formatMoney(tour.price || 0)].filter(Boolean).join(' · '),
      });
    });

    accommodations.forEach((item) => {
      if (!item.updatedAt || !item.createdAt || dayjs(item.updatedAt).diff(dayjs(item.createdAt), 'minute') <= 5) return;
      rows.push({
        key: `property-price-${item.id}`,
        date: item.updatedAt,
        actor: currentCompany?.name || 'Owner',
        type: 'catalog',
        typeLabel: 'Catalog',
        color: 'gold',
        title: `Owner изменил цену ${item.title || item.name || item.propertyName || 'объекта'}`,
        details: [item.propertyName, formatMoney(item.pricePerNight || item.price || 0), item.weekendPrice ? `Weekend ${formatMoney(item.weekendPrice)}` : ''].filter(Boolean).join(' · '),
      });
    });

    return rows
      .filter((item) => item.date)
      .sort((left, right) => dayjs(right.date).valueOf() - dayjs(left.date).valueOf())
      .slice(0, 120);
  }, [accommodations, bookingRows, currentCompany?.name, tours, usersById]);

  const addQuickBookingWaitlist = async () => {
    if (quickBookingWaitlistSaving) return;
    const values = quickBookingForm.getFieldsValue();
    if (!isQuickBookingTourKind(values.resource)) {
      return;
    }

    const waitlistSlots = quickBookingAvailability.waitlistSlots || [];
    const departureSlotId = values.waitlistDepartureSlotId || waitlistSlots[0]?.id;
    if (!values.objectId || !departureSlotId) {
      message.warning('Select a sold-out departure first.');
      return;
    }
    if (!values.clientName?.trim() && !values.clientPhone?.trim()) {
      message.warning('Add client name or phone for the waitlist.');
      return;
    }

    setQuickBookingWaitlistSaving(true);
    try {
      const response = await api.post('/tour-bookings/waitlist', {
        tourId: Number(values.objectId),
        departureSlotId,
        clientName: values.clientName?.trim(),
        clientPhone: values.clientPhone?.trim(),
        clientEmail: values.clientEmail?.trim(),
        people: Math.max(Number(values.people || values.adults || 1), 1),
        comment: values.comment?.trim(),
      });
      const updatedSlot = response.data?.departureSlot;
      if (updatedSlot?.id) {
        setQuickBookingSlots((slots) => slots.map((slot) => (
          String(slot.id) === String(updatedSlot.id) ? { ...slot, ...updatedSlot } : slot
        )));
        setTours((items) => items.map((tour) => (
          Number(tour.id) === Number(values.objectId)
            ? normalizeTourRecord({
              ...tour,
              departureSlots: (tour.departureSlots || []).map((slot) => (
                String(slot.id) === String(updatedSlot.id) ? { ...slot, ...updatedSlot } : slot
              )),
            })
            : tour
        )));
      }
      message.success('Клиент добавлен');
    } catch (error) {
      message.error(getFriendlyErrorMessage(error, 'Не удалось добавить клиента.'));
    } finally {
      setQuickBookingWaitlistSaving(false);
    }
  };

  const saveDepartureOperationsChecklist = async (key, checked) => {
    if (!activeDepartureOpsCard || departureOpsSaving) return;
    const nextChecklist = {
      ...createEmptyTourOperationsChecklist(),
      ...(activeDepartureOpsCard.operationsChecklist || activeDepartureOpsCard.slot.operationsChecklist || {}),
      [key]: checked,
    };

    setDepartureOpsSaving(true);
    try {
      const response = await api.put(`/tour-departures/${activeDepartureOpsCard.tour.id}/${activeDepartureOpsCard.slot.id}/operations`, {
        operationsChecklist: nextChecklist,
      });
      const updatedSlot = response.data?.departureSlot;
      if (updatedSlot?.id) {
        setTours((items) => items.map((tour) => (
          Number(tour.id) === Number(activeDepartureOpsCard.tour.id)
            ? normalizeTourRecord({
              ...tour,
              departureSlots: (tour.departureSlots || []).map((slot) => (
                String(slot.id) === String(updatedSlot.id) ? { ...slot, ...updatedSlot } : slot
              )),
            })
            : tour
        )));
        setDepartureOpsDrawerItem((current) => current ? {
          ...current,
          slot: { ...current.slot, ...updatedSlot },
          operationsChecklist: nextChecklist,
          checklistDone: TOUR_OPERATION_CHECKLIST_ITEMS.filter((item) => nextChecklist[item.key]).length,
        } : current);
      }
    } catch (error) {
      message.error(getFriendlyErrorMessage(error, 'Не удалось обновить чеклист.'));
    } finally {
      setDepartureOpsSaving(false);
    }
  };

  const updateBookingLocally = useCallback((booking, patch) => {
    if (booking.type === 'stay_booking') {
      setStayBookings((items) => items.map((item) => (
        Number(item.id) === Number(booking.id)
          ? normalizeStayBooking({ ...item, ...patch })
          : item
      )));
      return;
    }

    if (booking.type === 'tour_booking') {
      setTourBookings((items) => items.map((item) => (
        Number(item.id) === Number(booking.id)
          ? normalizeTourBooking({ ...item, ...patch })
          : item
      )));
    }
  }, []);

  const restoreBookingLocally = useCallback((booking, previousStayBookings, previousTourBookings) => {
    if (booking.type === 'stay_booking') {
      setStayBookings(previousStayBookings);
      return;
    }
    if (booking.type === 'tour_booking') {
      setTourBookings(previousTourBookings);
    }
  }, []);

  const persistScheduleBookingChange = useCallback(async (booking, patch, optimisticPatch, successText) => {
    const previousStayBookings = stayBookings;
    const previousTourBookings = tourBookings;
    updateBookingLocally(booking, optimisticPatch);

    try {
      const resource = booking.type === 'stay_booking' ? 'stay-bookings' : 'tour-bookings';
      const response = await api.put(`/${resource}/${booking.id}`, patch);
      const savedBooking = booking.type === 'stay_booking'
        ? normalizeStayBooking(response.data?.booking || response.data)
        : normalizeTourBooking(response.data?.booking || response.data);
      updateBookingLocally(booking, savedBooking);
      message.success(successText);
      await loadDashboardData({ includeBookings: true });
    } catch (error) {
      restoreBookingLocally(booking, previousStayBookings, previousTourBookings);
      message.error(getFriendlyErrorMessage(error, 'Не удалось изменить бронь.'));
    }
  }, [loadDashboardData, restoreBookingLocally, stayBookings, tourBookings, updateBookingLocally]);

  const findAvailableDepartureForDrop = useCallback((tourId, date, hour, people = 1) => {
    const tour = tours.find((item) => Number(item.id) === Number(tourId));
    if (!tour) return null;
    const target = dayjs(date).hour(hour).minute(0).second(0).millisecond(0);
    const bookedBySlot = new Map();
    tourBookings
      .filter((booking) => Number(booking.tourId) === Number(tourId))
      .filter((booking) => !['CANCELLED', 'NO_SHOW'].includes(getCanonicalBookingStatus(booking)))
      .forEach((booking) => {
        if (!booking.departureSlotId) return;
        bookedBySlot.set(String(booking.departureSlotId), (bookedBySlot.get(String(booking.departureSlotId)) || 0) + Math.max(Number(booking.people) || 1, 1));
      });

    return (tour.departureSlots || []).find((slot) => {
      const booked = bookedBySlot.get(String(slot.id)) || 0;
      const remaining = Math.max(Number(slot.seats || 0) - booked, 0);
      return slot.active !== false && dayjs(slot.startAt).isSame(target, 'hour') && remaining >= Math.max(Number(people) || 1, 1);
    });
  }, [tourBookings, tours]);

  const handleScheduleDrop = useCallback((column, hour) => {
    const action = scheduleDragAction;
    if (!action?.entry) return;
    setScheduleDragAction(null);

    const booking = action.entry;
    if (!['stay_booking', 'tour_booking'].includes(booking.type)) {
      message.info('Перетаскивание доступно для бронирований, не для шаблонов отправлений.');
      return;
    }

    if (action.mode === 'resize' && booking.type === 'stay_booking') {
      message.info('Для проживания меняем даты/время через отдельную логику брони, а не простым resize карточки.');
      setCalendarDrawerItem(booking);
      return;
    }

    const start = booking.scheduleTime || dayjs(booking.startDate || booking.travelDate || booking.checkInDate);
    const targetStart = dayjs(calendarDate).hour(hour).minute(0).second(0).millisecond(0);
    const duration = Math.max(getBookingDurationMinutes(booking), 45);

    if (action.mode === 'resize') {
      const startMinutes = (start.hour() * 60) + start.minute();
      const targetEndMinutes = Math.max((hour * 60), startMinutes + 45);
      const nextDuration = Math.max(targetEndMinutes - startMinutes, 45);
      Modal.confirm({
        title: 'Изменить длительность брони?',
        content: `${booking.tourTitle || booking.title || 'Бронирование'}: ${start.format('HH:mm')}–${start.add(nextDuration, 'minute').format('HH:mm')}`,
        okText: 'Изменить',
        cancelText: 'Отмена',
        onOk: () => persistScheduleBookingChange(
          booking,
          { durationMinutes: nextDuration, comment: 'Длительность изменена в календаре' },
          {
            durationMinutes: nextDuration,
            endDate: start.add(nextDuration, 'minute').toISOString(),
          },
          'Длительность брони обновлена.',
        ),
      });
      return;
    }

    if (booking.type === 'stay_booking') {
      const targetStayId = column.objectId ? Number(column.objectId) : Number(booking.stayId);
      const targetStay = accommodations.find((item) => Number(item.id) === targetStayId);
      if (!targetStay) {
        message.warning('Выберите колонку объекта для переноса брони.');
        return;
      }
      const nextEndTime = targetStart.add(duration, 'minute').format('HH:mm');
      const nextStartTime = targetStart.format('HH:mm');
      const conflicts = getStaySlotConflicts(targetStayId, {
        date: targetStart,
        startTime: nextStartTime,
        endTime: nextEndTime,
      }).filter((item) => Number(item.id) !== Number(booking.id));
      if (conflicts.length) {
        const conflict = conflicts[0];
        message.warning(`${targetStay.title || targetStay.name || 'Объект'} уже занят: ${conflict.startTime || conflict.checkInTime || '14:00'} → ${conflict.endTime || conflict.checkOutTime || '16:00'}`);
        return;
      }

      Modal.confirm({
        title: 'Перенести бронирование?',
        content: `${booking.clientName || 'Клиент'} → ${targetStay.title || targetStay.name}, ${targetStart.locale('ru').format('D MMMM HH:mm')}`,
        okText: 'Перенести',
        cancelText: 'Отмена',
        onOk: () => persistScheduleBookingChange(
          booking,
          {
            stayId: targetStayId,
            checkInDate: targetStart.format('YYYY-MM-DD'),
            startTime: nextStartTime,
            checkInTime: nextStartTime,
            endTime: nextEndTime,
            assignedTo: column.bookingResource ? booking.assignedTo : column.label,
            comment: 'Бронь перенесена в календаре',
          },
          {
            stayId: targetStayId,
            stayTitle: targetStay.title || targetStay.name,
            tourTitle: targetStay.title || targetStay.name,
            checkInDate: targetStart.toISOString(),
            bookingDate: targetStart.toISOString(),
            date: targetStart.toISOString(),
            startTime: nextStartTime,
            checkInTime: nextStartTime,
            endTime: nextEndTime,
            assignedTo: column.bookingResource ? booking.assignedTo : column.label,
          },
          'Бронь перенесена.',
        ),
      });
      return;
    }

    if (booking.type === 'tour_booking') {
      const targetTourId = column.objectId ? Number(column.objectId) : Number(booking.tourId);
      const targetTour = tours.find((item) => Number(item.id) === targetTourId);
      if (!targetTour) {
        message.warning('Выберите колонку тура для переноса брони.');
        return;
      }
      const matchingSlot = findAvailableDepartureForDrop(targetTourId, targetStart, hour, booking.people);
      if (!matchingSlot && column.bookingResource) {
        message.warning(`Для ${targetTour.title || 'тура'} нет доступного отправления в ${targetStart.format('HH:mm')}.`);
        return;
      }
      const patch = matchingSlot
        ? {
          tourId: targetTourId,
          departureSlotId: matchingSlot.id,
          assignedTo: column.bookingResource ? booking.assignedTo : column.label,
          comment: 'Бронь перенесена в календаре',
        }
        : {
          assignedTo: column.label,
          comment: 'Бронь перенесена на менеджера',
        };
      const optimisticPatch = matchingSlot
        ? {
          tourId: targetTourId,
          departureSlotId: matchingSlot.id,
          tourTitle: targetTour.title,
          travelDate: matchingSlot.startAt,
          bookingDate: matchingSlot.startAt,
          date: matchingSlot.startAt,
          startDate: matchingSlot.startAt,
          endDate: dayjs(matchingSlot.startAt).add(duration, 'minute').toISOString(),
          departureTime: dayjs(matchingSlot.startAt).format('HH:mm'),
          assignedTo: column.bookingResource ? booking.assignedTo : column.label,
        }
        : { assignedTo: column.label };

      Modal.confirm({
        title: 'Перенести бронирование?',
        content: matchingSlot
          ? `${booking.clientName || 'Клиент'} → ${targetTour.title}, ${dayjs(matchingSlot.startAt).locale('ru').format('D MMMM HH:mm')}`
          : `${booking.clientName || 'Клиент'} → менеджер ${column.label}`,
        okText: 'Перенести',
        cancelText: 'Отмена',
        onOk: () => persistScheduleBookingChange(booking, patch, optimisticPatch, 'Бронь перенесена.'),
      });
    }
  }, [
    accommodations,
    calendarDate,
    findAvailableDepartureForDrop,
    getStaySlotConflicts,
    persistScheduleBookingChange,
    scheduleDragAction,
    tours,
  ]);

  const openCalendarItemDetails = (item) => {
    setCalendarDrawerItem(item);
  };

  const closeCalendarItemDetails = () => {
    setCalendarDrawerItem(null);
  };

  const canReviewStayBooking = (booking) => (
    ['stay_booking', 'tour_booking'].includes(booking?.type)
    && (booking?.status === 'payment_review' || booking?.paymentStatus === 'review')
  );

  const openStayBookingRejectModal = (booking) => {
    if (!booking?.id || !['stay_booking', 'tour_booking'].includes(booking.type)) return;
    setStayBookingDecisionItem(booking);
    setStayBookingDecisionOpen(true);
    stayBookingDecisionForm.setFieldsValue({
      rejectionReason: booking.rejectionReason || '',
    });
  };

  const approveBusinessSubscription = async (request) => {
    openCompanyRequestReviewModal(request, 'approve');
  };

  const rejectBusinessSubscription = async (request) => {
    openCompanyRequestReviewModal(request, 'reject');
  };

  const handleCompanyRequestReviewSubmit = async (values) => {
    if (!companyRequestReviewItem) return;

    const endpoint = companyRequestReviewAction === 'approve'
      ? `/api/admin/business-subscriptions/${companyRequestReviewItem.id}/approve`
      : `/api/admin/business-subscriptions/${companyRequestReviewItem.id}/reject`;

    setCompanyRequestReviewLoading(true);
    try {
      await api.put(endpoint, {
        adminComment: values.adminComment,
      });
      await loadDashboardData();
      setCompanyRequestReviewOpen(false);
      setCompanyRequestReviewItem(null);
      companyRequestReviewForm.resetFields();
      setMessageState({
        type: 'success',
        text: companyRequestReviewAction === 'approve'
          ? 'Заявка компании подтверждена, подписка активирована.'
          : 'Заявка компании отклонена с комментарием супер-админа.',
      });
    } catch (error) {
      setMessageState({
        type: 'error',
        text: error.response?.data?.message || (
          companyRequestReviewAction === 'approve'
            ? 'Не удалось подтвердить заявку компании.'
            : 'Не удалось отклонить заявку компании.'
        ),
      });
    } finally {
      setCompanyRequestReviewLoading(false);
    }
  };

  const closeStayBookingRejectModal = () => {
    if (stayBookingDecisionLoading) return;
    setStayBookingDecisionOpen(false);
    setStayBookingDecisionItem(null);
    stayBookingDecisionForm.resetFields();
  };

  const updateStayBookingStatus = async (booking, status) => {
    if (!booking?.id || !['stay_booking', 'tour_booking'].includes(booking.type)) {
      message.info('Это действие недоступно для старой записи бронирования.');
      return;
    }

    try {
      const resource = booking.type === 'stay_booking' ? 'stay-bookings' : 'tour-bookings';
      await api.put(`/${resource}/${booking.id}`, { status });
      const successMessage = status === 'confirmed'
        ? 'Бронь подтверждена.'
        : status === 'rejected'
          ? 'Заявка отклонена.'
          : 'Бронь отменена.';
      message.success(successMessage);
      window.dispatchEvent(new CustomEvent('travelpay-business-data-changed', { detail: { type: 'booking', action: 'status_changed', id: booking.id } }));
      setCalendarDrawerItem((current) => current ? {
        ...current,
        status,
        paymentStatus: status === 'confirmed'
          ? 'paid'
          : status === 'rejected'
            ? 'rejected'
            : current.paymentStatus,
        paymentReviewedAt: ['confirmed', 'rejected'].includes(status) ? new Date().toISOString() : current.paymentReviewedAt,
        paymentReviewedBy: ['confirmed', 'rejected'].includes(status) ? sessionUser?.id : current.paymentReviewedBy,
        updatedAt: new Date().toISOString(),
      } : current);
      loadDashboardData();
    } catch (error) {
      message.error(getFriendlyErrorMessage(error, 'Не удалось обновить статус брони.'));
    }
  };

  const handleRejectStayBooking = async (values) => {
    if (!stayBookingDecisionItem?.id) return;

    setStayBookingDecisionLoading(true);
    try {
      const resource = stayBookingDecisionItem.type === 'stay_booking' ? 'stay-bookings' : 'tour-bookings';
      await api.put(
        `/${resource}/${stayBookingDecisionItem.id}`,
        { status: 'rejected', rejectionReason: values.rejectionReason },
        {},
      );
      message.success('Заявка отклонена.');
      setCalendarDrawerItem((current) => (current ? {
        ...current,
        status: 'rejected',
        paymentStatus: 'rejected',
        rejectionReason: values.rejectionReason,
        paymentReviewedAt: new Date().toISOString(),
        paymentReviewedBy: sessionUser?.id,
        updatedAt: new Date().toISOString(),
      } : current));
      closeStayBookingRejectModal();
      loadDashboardData();
    } catch (error) {
      message.error(getFriendlyErrorMessage(error, 'Не удалось отклонить заявку.'));
    } finally {
      setStayBookingDecisionLoading(false);
    }
  };

  const crmTableProps = {
    sticky: true,
    size: isDesktop ? 'middle' : 'small',
  };

  const tourColumns = [
    {
      title: 'Фото',
      dataIndex: 'image',
      width: 90,
      render: (image, record) => (
        <AppImage
          src={image}
          alt={record.title}
          className="tp-admin-table-image"
          aspectRatio="4 / 3"
        />
      ),
    },
    { title: 'Название', dataIndex: 'title', width: 220 },
    ...(!businessMode ? [{
      title: 'Компания',
      dataIndex: 'companyName',
      width: 190,
      render: (value, record) => <Tag color="blue">{value || companiesById.get(Number(record.companyId))?.name || 'TravelPay'}</Tag>,
    }] : []),
    { title: 'Локация', dataIndex: 'location', width: 180 },
    { title: 'Цена', dataIndex: 'price', width: 130, render: formatMoney },
    { title: 'Длительность', dataIndex: 'duration', width: 120 },
    {
      title: 'Проживание',
      dataIndex: 'hasAccommodation',
      width: 150,
      render: (_, record) => record.hasAccommodation
        ? <Tag color="cyan">{record.accommodations?.length || record.accommodationIds?.length || 0} домиков</Tag>
        : <Tag>Нет</Tag>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 130,
      render: (status) => {
        const meta = STATUS_META[status] || STATUS_META.active;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 84,
      render: (_, record) => (
        <Dropdown menu={getTourActions(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const accommodationColumns = [
    {
      title: 'Фото',
      dataIndex: 'images',
      width: 90,
      render: (images, record) => (
        <AppImage
          src={images?.[0]}
          alt={record.title || record.name}
          className="tp-admin-table-image"
          aspectRatio="4 / 3"
        />
      ),
    },
    { title: 'Название', dataIndex: 'title', width: 220 },
    { title: 'Локация', dataIndex: 'location', width: 180 },
    {
      title: 'Тип',
      dataIndex: 'type',
      width: 120,
      render: (value) => ACCOMMODATION_TYPES.find((item) => item.value === value)?.label || value,
    },
    { title: 'Цена / ночь', dataIndex: 'pricePerNight', width: 140, render: formatMoney },
    { title: 'Вместимость', dataIndex: 'capacity', width: 120, render: (value) => `до ${value} чел.` },
    { title: 'Остаток', dataIndex: 'availableCount', width: 110, render: (value) => `${value} шт.` },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 120,
      render: (status) => <Tag color={status === 'sold_out' ? 'red' : 'green'}>{status === 'sold_out' ? 'Нет мест' : 'Доступен'}</Tag>,
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 84,
      render: (_, record) => (
        <Dropdown menu={getAccommodationActions(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const clientColumns = [
    {
      title: 'Клиент',
      dataIndex: 'name',
      width: 220,
      render: (value, record) => (
        <button type="button" className="tp-admin-client-link" onClick={() => openClientDetails(record)}>
          <Avatar size={34} icon={<UserOutlined />} src={safeSrc(record.avatar || record.photo)} />
          <span>
            <strong>{value || record.email || 'Клиент'}</strong>
            <small>{record.email || '—'}</small>
          </span>
        </button>
      ),
    },
    { title: 'Телефон', dataIndex: 'phone', width: 150, render: (value) => value || '—' },
    { title: 'Бронирований', dataIndex: 'bookingsCount', width: 130 },
    { title: 'Потрачено', dataIndex: 'spent', width: 140, render: formatMoney },
    { title: 'Последняя поездка', dataIndex: 'lastTripAt', width: 160, render: (value) => value ? formatDate(value) : '—' },
    {
      title: 'Статус',
      dataIndex: 'clientStatus',
      width: 130,
      render: (value) => {
        const meta = {
          vip: { label: 'VIP', color: 'gold' },
          debtor: { label: 'Должник', color: 'red' },
          repeat: { label: 'Повторный', color: 'green' },
          new: { label: 'Новый', color: 'blue' },
          lead: { label: 'Лид', color: 'default' },
        }[value] || { label: value || '—', color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    { title: 'Метка', dataIndex: 'sourceLabel', width: 160, render: (value, record) => <Tag color={record.manualCount > record.travelpayCount ? 'purple' : 'cyan'}>{value}</Tag> },
    { title: 'Менеджер', dataIndex: 'manager', width: 160, render: (value) => value || '—' },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 84,
      render: (_, record) => (
        <Dropdown menu={getClientActions(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const bookingColumnsLegacy = [
    { title: 'Клиент', dataIndex: 'clientName', width: 180 },
    { title: 'Телефон', dataIndex: 'clientPhone', width: 150 },
    {
      title: 'Тур / домик',
      dataIndex: 'tourTitle',
      width: 240,
      render: (value, record) => (
        <Space orientation="vertical" size={2}>
          <span>{value}</span>
          {record.type === 'stay_booking' && <Tag color="cyan">Домик</Tag>}
        </Space>
      ),
    },
    { title: 'Дата', dataIndex: 'bookingDate', width: 160, render: formatDateTime },
    { title: 'Сумма', dataIndex: 'amount', width: 140, render: formatMoney },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 150,
      render: (status) => {
        return renderBookingStatusChip(status);
      },
    },
    { title: 'Менеджер', dataIndex: 'assignedTo', width: 180 },
  ];

  void bookingColumnsLegacy;

  const bookingTableColumns = [
    {
      title: 'Клиент',
      dataIndex: 'clientName',
      width: 220,
      render: (_, record) => (
        <Space size={12}>
          <Avatar src={safeSrc(record.clientAvatar)} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 700 }}>{record.clientName || '—'}</div>
            <Text type="secondary">{record.clientPhone || record.clientEmail || '—'}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Тур / домик',
      dataIndex: 'tourTitle',
      width: 240,
      render: (value, record) => (
        <Space orientation="vertical" size={2}>
          <span>{value}</span>
          {record.type === 'stay_booking' && <Tag color="cyan">Домик</Tag>}
        </Space>
      ),
    },
    { title: 'Дата', dataIndex: 'bookingDate', width: 150, render: formatDate },
    { title: 'Время', width: 140, render: (_, record) => formatCalendarTimeRange(record) },
    { title: 'Менеджер', dataIndex: 'assignedTo', width: 180, render: (value) => value || '—' },
    { title: 'Сумма', dataIndex: 'amount', width: 140, render: formatMoney },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 150,
      render: (status) => {
        return renderBookingStatusChip(status);
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 90,
      render: (_, record) => (
        <Dropdown menu={getBookingActions(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  void bookingTableColumns;

  const bookingTableColumnsExtended = [
    {
      title: 'Клиент',
      dataIndex: 'clientName',
      width: 220,
      render: (_, record) => (
        <Space size={12}>
          <Avatar src={safeSrc(record.clientAvatar)} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 700 }}>{record.clientName || '—'}</div>
            <Text type="secondary">{record.clientPhone || record.clientEmail || '—'}</Text>
          </div>
        </Space>
      ),
    },
    { title: 'Тур', dataIndex: 'tourTitle', width: 220 },
    { title: 'Компания', dataIndex: 'companyName', width: 180, render: (value) => value || '—' },
    { title: 'Дата', dataIndex: 'bookingDate', width: 150, render: formatDate },
    { title: 'Время', width: 140, render: (_, record) => formatCalendarTimeRange(record) },
    {
      title: 'Доп. услуги',
      width: 240,
      render: (_, record) => renderStayBookingExtrasPreview(record),
    },
    { title: 'Менеджер', dataIndex: 'assignedTo', width: 180, render: (value) => value || '—' },
    { title: 'Сумма', dataIndex: 'amount', width: 140, render: formatMoney },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 150,
      render: (status) => {
        return renderBookingStatusChip(status);
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      fixed: 'right',
      width: 90,
      render: (_, record) => (
        <Dropdown menu={getBookingActions(record)} trigger={['click']}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const paymentsTableColumns = [
    { title: 'Клиент', dataIndex: 'userName', width: 180 },
    { title: 'Email', dataIndex: 'userEmail', width: 220 },
    { title: 'Дата', dataIndex: 'date', width: 130, render: formatDate },
    { title: 'Сумма', dataIndex: 'amount', width: 140, render: formatMoney },
    { title: 'Статус', dataIndex: 'status', width: 120, render: (status) => <Tag color="green">{status || 'Успешно'}</Tag> },
  ];

  const topupRequestColumns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Клиент', dataIndex: 'userName', width: 180 },
    { title: 'Email', dataIndex: 'userEmail', width: 220 },
    { title: 'Сумма', dataIndex: 'amount', width: 140, render: formatMoney },
    { title: 'Бонус', dataIndex: 'bonus', width: 130, render: formatMoney },
    { title: 'Дата', dataIndex: 'createdAt', width: 120, render: formatDate },
    {
      title: 'Чек',
      dataIndex: 'receiptImage',
      width: 90,
      render: (receipt, record) => receipt?.startsWith('data:image/')
        ? <Image width={48} height={48} src={receipt} alt={record.receiptName || 'Чек'} style={{ objectFit: 'cover', borderRadius: 10 }} />
        : <Button type="link" href={receipt} target="_blank" icon={<FilePdfOutlined />}>PDF</Button>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 130,
      render: (status) => {
        const meta = TOPUP_STATUS_META[status] || TOPUP_STATUS_META.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    { title: 'Комментарий', dataIndex: 'comment', width: 220, render: (value) => value || '—' },
    { title: 'Ответ', dataIndex: 'adminComment', width: 220, render: (value) => value || '—' },
    {
      title: 'Действия',
      width: 220,
      fixed: 'right',
      render: (_, record) => record.status === 'pending' ? (
        <Space size={8}>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => openReviewModal(record, 'approve')}>
            Подтвердить
          </Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => openReviewModal(record, 'reject')}>
            Отклонить
          </Button>
        </Space>
      ) : <Text type="secondary">Обработано</Text>,
    },
  ];

  const dashboardQuickActions = [
    { key: 'add-tour', label: 'Добавить тур', icon: <PlusOutlined />, onClick: openCreateTourDrawer },
    { key: 'add-client', label: 'Добавить клиента', icon: <TeamOutlined />, onClick: () => navigate(`${basePath}/clients`) },
    { key: 'add-booking', label: 'Создать бронь', icon: <CalendarOutlined />, onClick: () => navigate(`${basePath}/bookings`) },
    ...(!businessMode ? [{ key: 'companies', label: 'Проверить компании', icon: <BankOutlined />, onClick: () => navigate('/admin/companies') }] : []),
  ];

  const headerBranchText = currentCompany?.address || currentCompany?.name || 'TravelPay Company';

  const sidebar = (<AdminSidebar collapsed={collapsed} businessMode={businessMode} homePath={homePath} basePath={basePath} currentTab={currentTab} company={currentCompany} user={liveSessionUser} onNavigate={handleSidebarAction} />);
  /* Legacy inline sidebar and notification card were replaced by AdminSidebar and AdminTopbar.
    <div className="tp-admin-sidebar-shell">
      <div className={`tp-admin-brand ${collapsed ? 'tp-admin-brand--collapsed' : ''}`}>
        <div className="tp-admin-brand__mark">
          <img src="/travelpay-logo.svg" alt="TravelPay" className="tp-admin-brand__mark-image" />
        </div>
        {!collapsed && (
          <div className="tp-admin-brand__copy">
            <div className="tp-admin-brand__title">{businessMode ? 'TravelPay Business' : 'TravelPay'}</div>
            <div className="tp-admin-brand__subtitle">{currentCompany?.name || 'Travel CRM Platform'}</div>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[currentTab === 'home' ? homePath : `${basePath}/${currentTab}`]}
        onClick={handleSidebarAction}
        className="tp-admin-menu"
        items={[
          { key: homePath, icon: <HomeOutlined />, label: 'Главная' },
          { key: `${basePath}/tours`, icon: <CompassOutlined />, label: 'Туры' },
          { key: `${basePath}/accommodations`, icon: <HomeOutlined />, label: 'Домики' },
          { key: `${basePath}/bookings`, icon: <CalendarOutlined />, label: 'Бронирования' },
          { key: `${basePath}/clients`, icon: <TeamOutlined />, label: 'Клиенты' },
          ...(!businessMode ? [
            { key: '/admin/savings', icon: <WalletOutlined />, label: 'Накопления' },
            { key: '/admin/companies', icon: <BankOutlined />, label: 'Компании' },
          ] : []),
          { key: `${basePath}/analytics`, icon: <BarChartOutlined />, label: 'Отчеты' },
          ...(!businessMode ? [{ key: '/admin/settings', icon: <SettingOutlined />, label: 'Настройки' }] : []),
          { type: 'divider' },
          { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
        ]}
      />
    </div>
  );

  */
  const renderStatCard = (item) => (
    <Card key={item.title} className="tp-admin-stat-card" styles={{ body: { padding: 20 } }}>
      <div className="tp-admin-stat-card__head">
        <Text className="tp-admin-section-label">{item.title}</Text>
        <span className="tp-admin-stat-card__dot" style={{ background: item.color }} />
      </div>
      <Statistic
        value={item.value}
        formatter={(value) => (item.formatter ? item.formatter(value) : value)}
      />
    </Card>
  );

  const renderChartCard = (title, children, extra = null) => (
    <Card className="tp-admin-card" title={title} extra={extra}>
      <div style={{ width: '100%', height: 280 }}>
        {children}
      </div>
    </Card>
  );

  const renderContextHelp = (title, text) => (
    <Alert
      type="info"
      showIcon
      message={`? ${title}`}
      description={text}
      className="tp-admin-context-help"
    />
  );

  const renderEmptyState = ({ title, description, actionText, onAction } = {}) => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={(
        <Space orientation="vertical" size={6}>
          <Text strong>{title || 'Пока здесь пусто'}</Text>
          {description && <Text type="secondary">{description}</Text>}
        </Space>
      )}
    >
      {actionText && onAction ? <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>{actionText}</Button> : null}
    </Empty>
  );

  const renderCommandPalette = () => (
    <Modal
      open={commandPaletteOpen}
      footer={null}
      closable={false}
      width={720}
      className="tp-admin-command-palette"
      onCancel={() => setCommandPaletteOpen(false)}
      destroyOnHidden
    >
      <Input
        autoFocus
        allowClear
        size="large"
        prefix={<SearchOutlined />}
        value={commandPaletteQuery}
        placeholder="Поиск: клиент, бронь, тур, объект, транзакция или команда"
        onChange={(event) => setCommandPaletteQuery(event.target.value)}
        onPressEnter={() => {
          if (commandPaletteResults[0]) runCommandPaletteItem(commandPaletteResults[0]);
        }}
      />
      <div className="tp-admin-command-palette__hint">
        <Text type="secondary">Ctrl/Cmd + K · пример: 996555123456</Text>
        <Text type="secondary">Enter откроет первый результат</Text>
      </div>
      <div className="tp-admin-command-palette__list">
        {commandPaletteResults.length ? commandPaletteResults.map((item) => (
          <button
            type="button"
            key={item.key}
            className="tp-admin-command-palette__item"
            onClick={() => runCommandPaletteItem(item)}
          >
            <span className="tp-admin-command-palette__icon">
              {item.type === 'command' ? <PlusOutlined /> : item.type === 'client' ? <UserOutlined /> : item.type === 'booking' ? <CalendarOutlined /> : item.type === 'tour' ? <CompassOutlined /> : item.type === 'property' ? <HomeOutlined /> : <BankOutlined />}
            </span>
            <span className="tp-admin-command-palette__body">
              <strong>{item.title}</strong>
              {item.description ? <Text type="secondary">{item.description}</Text> : null}
            </span>
            <Tag color={item.color}>{item.typeLabel}</Tag>
          </button>
        )) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Ничего не найдено. Попробуйте имя, телефон, номер брони или команду."
          />
        )}
      </div>
    </Modal>
  );

  const renderActivityLog = () => {
    const todayRows = activityLogRows.filter((item) => dayjs(item.date).isSame(dayjs(), 'day'));
    const paymentRows = activityLogRows.filter((item) => item.type === 'payment' || item.type === 'refund');
    const bookingChangeRows = activityLogRows.filter((item) => item.type === 'booking' || item.type === 'schedule');

    return (
      <Space orientation="vertical" size={18} style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          {[
            { title: 'Событий сегодня', value: todayRows.length, color: '#1677ff' },
            { title: 'Изменений броней', value: bookingChangeRows.length, color: '#722ed1' },
            { title: 'Платежных действий', value: paymentRows.length, color: '#16a34a' },
            { title: 'Всего в журнале', value: activityLogRows.length, color: '#f97316' },
          ].map(renderStatCard)}
        </Row>

        <Card
          className="tp-admin-card"
          title="Activity Log"
          extra={<Tag icon={<HistoryOutlined />} color="blue">Business account</Tag>}
        >
          <Paragraph type="secondary">
            Командный журнал собирает изменения бронирований, принятые оплаты, refund flow, переносы check-in и изменения каталога из существующих данных TravelPay.
          </Paragraph>
          <Table
            rowKey="key"
            dataSource={activityLogRows}
            pagination={{ pageSize: 12 }}
            scroll={{ x: 980 }}
            columns={[
              {
                title: 'Дата',
                dataIndex: 'date',
                width: 180,
                render: (value) => formatDateTime(value),
              },
              {
                title: 'Кто',
                dataIndex: 'actor',
                width: 180,
                render: (value) => (
                  <Space>
                    <Avatar size={28}>{String(value || 'TP').slice(0, 1).toUpperCase()}</Avatar>
                    <Text strong>{value || 'TravelPay Business'}</Text>
                  </Space>
                ),
              },
              {
                title: 'Событие',
                dataIndex: 'title',
                render: (value, record) => (
                  <Space orientation="vertical" size={2}>
                    <Text strong>{value}</Text>
                    <Text type="secondary">{record.details || '—'}</Text>
                  </Space>
                ),
              },
              {
                title: 'Тип',
                dataIndex: 'typeLabel',
                width: 130,
                render: (value, record) => <Tag color={record.color}>{value}</Tag>,
              },
            ]}
          />
        </Card>
      </Space>
    );
  };

  const renderNotificationsCard = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card
        className="tp-admin-card"
        title="Smart Notifications"
        extra={<Badge count={userNotifications.filter((item) => !item.read).length} showZero />}
      >
        <Paragraph>
          Операционный центр напоминаний для клиентов и команды. Подключены только реальные для проекта каналы: internal Push уже работает в TravelPay, Email доступен в backend для системных писем, WhatsApp работает как manual/link flow. SMS пока отмечен как канал без интеграции.
        </Paragraph>
        <Row gutter={[14, 14]}>
          {[
            { channel: 'WhatsApp', status: 'Manual link', color: 'green', description: 'Открытие диалога с клиентом через wa.me; автоматическая отправка не подключена.' },
            { channel: 'SMS', status: 'Not connected', color: 'default', description: 'SMS-provider в проекте не найден, канал отображается как future integration.' },
            { channel: 'Email', status: 'System email', color: 'blue', description: 'Backend уже отправляет email verification; CRM-шаблоны можно подключить поверх этого канала.' },
            { channel: 'Push', status: 'Available', color: 'purple', description: 'Внутренние TravelPay notifications уже сохраняются в профиле пользователя.' },
          ].map((item) => (
            <Col xs={24} md={12} xl={6} key={item.channel}>
              <Card size="small" className="tp-admin-inline-card">
                <Space orientation="vertical" size={8}>
                  <Space>
                    <Tag color={item.color}>{item.channel}</Tag>
                    <Text strong>{item.status}</Text>
                  </Space>
                  <Text type="secondary">{item.description}</Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card className="tp-admin-card" title="Notification rules">
        <Table
          rowKey="key"
          dataSource={notificationRules}
          pagination={false}
          scroll={{ x: 980 }}
          columns={[
            {
              title: 'Rule',
              dataIndex: 'title',
              width: 190,
              render: (value, record) => (
                <Space orientation="vertical" size={2}>
                  <Text strong>{value}</Text>
                  <Text type="secondary">{record.trigger}</Text>
                </Space>
              ),
            },
            {
              title: 'On/off',
              dataIndex: 'enabled',
              width: 100,
              render: (value, record) => (
                <Switch
                  checked={value}
                  onChange={(checked) => setNotificationRules((rules) => rules.map((rule) => (
                    rule.key === record.key ? { ...rule, enabled: checked } : rule
                  )))}
                />
              ),
            },
            {
              title: 'Channel',
              dataIndex: 'channel',
              width: 160,
              render: (value, record) => (
                <Select
                  value={value}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'Push', label: 'Push' },
                    { value: 'WhatsApp', label: 'WhatsApp' },
                    { value: 'Email', label: 'Email' },
                    { value: 'SMS', label: 'SMS' },
                  ]}
                  onChange={(channel) => setNotificationRules((rules) => rules.map((rule) => (
                    rule.key === record.key ? { ...rule, channel } : rule
                  )))}
                />
              ),
            },
            {
              title: 'Send time',
              dataIndex: 'timing',
              width: 170,
              render: (value, record) => (
                <Input
                  value={value}
                  placeholder="24 hours"
                  onChange={(event) => setNotificationRules((rules) => rules.map((rule) => (
                    rule.key === record.key ? { ...rule, timing: event.target.value } : rule
                  )))}
                />
              ),
            },
            {
              title: 'Template',
              dataIndex: 'template',
              render: (value, record) => (
                <Input.TextArea
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  value={value}
                  onChange={(event) => setNotificationRules((rules) => rules.map((rule) => (
                    rule.key === record.key ? { ...rule, template: event.target.value } : rule
                  )))}
                />
              ),
            },
          ]}
        />
      </Card>

      <Card className="tp-admin-card" title="Scheduled automatic reminders">
        <Table
          rowKey="key"
          size="small"
          dataSource={scheduledAutomaticReminders}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          columns={[
            { title: 'Send at', dataIndex: 'sendAt', render: formatDateTime, width: 170 },
            { title: 'Channel', dataIndex: 'channel', width: 110, render: (value) => <Tag>{value}</Tag> },
            { title: 'Rule', dataIndex: 'rule', width: 180 },
            { title: 'Client', dataIndex: 'client', width: 180 },
            { title: 'Booking', dataIndex: 'booking', width: 190 },
            { title: 'Message', dataIndex: 'message' },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={10}>
          <Card className="tp-admin-card" title="Smart automation ideas">
            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
              {[
                ['24h до тура', 'Проверить оплату и отправить reminder', 'Push · WhatsApp manual'],
                ['3h до тура', 'Связаться с клиентом и подтвердить pickup', 'WhatsApp manual'],
                ['День check-in', 'Подтвердить приезд гостя', 'Push'],
                ['После check-out', 'Попросить отзыв', 'Email · Push'],
                ['Долг по брони', 'Напомнить об остатке оплаты', 'Push · WhatsApp manual'],
              ].map(([time, title, channel]) => (
                <div className="tp-admin-calendar-client-row" key={title}>
                  <div>
                    <strong>{title}</strong>
                    <div><Text type="secondary">{time}</Text></div>
                  </div>
                  <Tag>{channel}</Tag>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={14}>
          <Card
            className="tp-admin-card"
            title={businessMode ? 'Уведомления компании' : 'Уведомления и оплаты'}
            extra={<Badge count={userNotifications.length} showZero />}
          >
            {userNotifications.length ? (
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                {userNotifications.slice(0, 8).map((item) => (
                  <div key={item.id || `${item.type}-${item.createdAt}`} className="tp-admin-booking-card">
                    <div className="tp-admin-booking-card__top">
                      <div>
                        <Title level={5} style={{ marginBottom: 4 }}>{item.title || 'Новое уведомление'}</Title>
                        <Text type="secondary">{item.message || item.description || 'Есть обновление по компании или оплате.'}</Text>
                      </div>
                      <Tag color={item.read ? 'default' : 'blue'}>{item.read ? 'Прочитано' : 'Новое'}</Tag>
                    </div>
                    <div className="tp-admin-booking-card__meta">
                      <span>{formatDateTime(item.createdAt || item.date)}</span>
                      <strong>{item.type || 'notification'}</strong>
                    </div>
                    <Space wrap style={{ marginTop: 12 }}>
                      {!item.read && <Button size="small" onClick={() => markNotificationRead(item.id)}>Отметить прочитанным</Button>}
                      {!businessMode && (item.type === 'business-registration' || item.type === 'business-subscription') && (
                        <Button type="primary" size="small" onClick={() => navigate('/admin/companies')}>
                          Открыть компании
                        </Button>
                      )}
                    </Space>
                  </div>
                ))}
              </Space>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пока нет уведомлений" />
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const renderBusinessProfile = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card className="tp-admin-card">
        <div className="tp-admin-section-head">
          <div>
            <Text className="tp-admin-section-label">Business Profile</Text>
            <Title level={3}>Профиль компании</Title>
            <Paragraph>
              Эти данные используются в публичной странице TravelPay, карточках предложений, контактах и оплатах.
            </Paragraph>
          </div>
          <Space wrap>
            {currentCompany?.id && <Button icon={<EyeOutlined />} onClick={() => navigate(`/companies/${currentCompany.id}`)}>Публичная страница</Button>}
            <Button type="primary" loading={businessProfileSaving} onClick={() => businessProfileForm.submit()}>Сохранить</Button>
          </Space>
        </div>
        {renderContextHelp('Что видно публично?', 'Название, логотип, описание, контакты, график, туры, объекты, рейтинг и CTA бронирования показываются клиентам на странице компании. Реквизиты и документы остаются в бизнес-кабинете, если вы не используете их в оплате.')}

        <Form form={businessProfileForm} layout="vertical" onFinish={saveBusinessProfile}>
          <Row gutter={[16, 12]}>
            <Col xs={24} md={8}><Form.Item label="Логотип" name="logo"><Input placeholder="URL или data:image" /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Название" name="name" rules={[{ required: true, message: 'Укажите название' }]}><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="График" name="workingHours"><Input placeholder="09:00–18:00" /></Form.Item></Col>
            <Col xs={24}><Form.Item label="Описание" name="description"><Input.TextArea rows={4} /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Телефон" name="phone"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="WhatsApp" name="whatsapp"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Instagram" name="instagramUrl"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Website" name="website"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Адрес" name="address"><Input /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Локация / регион" name="region"><Input placeholder="Иссык-Куль, Бишкек..." /></Form.Item></Col>
            <Col xs={24} md={8}><Form.Item label="Manager phone" name="managerPhone"><Input /></Form.Item></Col>
          </Row>

          <Divider />
          {renderContextHelp('Как работает предоплата?', 'Укажите QR/реквизиты, а размер предоплаты настраивается в туре или объекте. BookingStatus и PaymentStatus остаются раздельными: бронь может быть подтверждена, но оплата — частичной.')}
          <Title level={4}>Реквизиты и Payment QR</Title>
          <Form.List name="paymentMethods">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Card key={field.key} size="small" className="tp-admin-inline-card">
                    <Row gutter={[12, 8]}>
                      <Col xs={24} md={6}><Form.Item label="Название" name={[field.name, 'title']}><Input placeholder="MBANK QR" /></Form.Item></Col>
                      <Col xs={24} md={6}><Form.Item label="Банк" name={[field.name, 'bankName']}><Input /></Form.Item></Col>
                      <Col xs={24} md={6}><Form.Item label="Получатель" name={[field.name, 'recipientName']}><Input /></Form.Item></Col>
                      <Col xs={24} md={6}><Form.Item label="Телефон" name={[field.name, 'phoneNumber']}><Input /></Form.Item></Col>
                      <Col xs={24}><Form.Item label="Payment QR" name={[field.name, 'qrCodeUrl']}><Input.TextArea rows={2} /></Form.Item></Col>
                      <Col xs={12} md={4}><Form.Item label="Активен" name={[field.name, 'active']} valuePropName="checked"><Switch /></Form.Item></Col>
                      <Col xs={12} md={4}><Form.Item label="Основной" name={[field.name, 'primary']} valuePropName="checked"><Switch /></Form.Item></Col>
                      <Col xs={24} md={8}><Button danger onClick={() => remove(field.name)}>Удалить</Button></Col>
                    </Row>
                  </Card>
                ))}
                <Button icon={<PlusOutlined />} onClick={() => add({ type: 'qr', active: true })}>Добавить реквизиты</Button>
              </Space>
            )}
          </Form.List>

          <Divider />
          <Title level={4}>Менеджеры</Title>
          <Table
            rowKey="id"
            size="small"
            dataSource={businessStaff}
            pagination={false}
            columns={[
              { title: 'Имя', render: (_, item) => [item.firstName, item.lastName].filter(Boolean).join(' ') || item.email || item.phone },
              { title: 'Роль', dataIndex: 'role', render: (value) => <Tag>{value}</Tag> },
              { title: 'Телефон', dataIndex: 'phone' },
              { title: 'WhatsApp', dataIndex: 'whatsapp' },
            ]}
          />

          <Divider />
          <Title level={4}>Документы</Title>
          <Form.List name="documents">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Row gutter={[12, 8]} key={field.key}>
                    <Col xs={24} md={8}><Form.Item label="Название" name={[field.name, 'name']}><Input /></Form.Item></Col>
                    <Col xs={24} md={8}><Form.Item label="Тип" name={[field.name, 'type']}><Input placeholder="pdf/image" /></Form.Item></Col>
                    <Col xs={24} md={6}><Form.Item label="URL/Data URL" name={[field.name, 'dataUrl']}><Input /></Form.Item></Col>
                    <Col xs={24} md={2}><Button danger onClick={() => remove(field.name)}>×</Button></Col>
                  </Row>
                ))}
                <Button icon={<PlusOutlined />} onClick={() => add({})}>Добавить документ</Button>
              </Space>
            )}
          </Form.List>
        </Form>
      </Card>
    </Space>
  );

  const renderBusinessMetric = ({ title, value, change, formatter }) => (
    <Card className="tp-business-home-metric" styles={{ body: { padding: 16 } }}>
      <Text>{title}</Text>
      <strong>{formatter ? formatter(value) : value}</strong>
      <small>{change}</small>
    </Card>
  );

  const renderBusinessQueue = (title, items, actionPath) => (
    <Card className="tp-admin-card tp-business-home-panel" title={title} extra={<Tag>{items.length}</Tag>}>
      {items.length ? (
        <div className="tp-business-home-list">
          {items.slice(0, 4).map((item) => (
            <button key={item.key || item.id} type="button" onClick={() => navigate(actionPath)}>
              <span>
                <strong>{item.tourTitle || item.stayTitle || item.title || 'Бронирование'}</strong>
                <small>{[item.clientName, item.clientPhone, formatDateTime(item.bookingDate || item.travelDate || item.checkInDate)].filter(Boolean).join(' · ')}</small>
              </span>
              <Tag color={(BOOKING_STATUS_META[item.status] || BOOKING_STATUS_META.pending).color}>
                {(BOOKING_STATUS_META[item.status] || BOOKING_STATUS_META.pending).label}
              </Tag>
            </button>
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пусто" />
      )}
    </Card>
  );

  const renderBusinessHome = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      {loading && !bookingRows.length && (
        <div className="tp-admin-page-skeleton">
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      )}
      <section className="tp-business-mobile-home">
        <div className="tp-business-mobile-home__head">
          <div>
            <Text className="tp-admin-section-label">Сегодня</Text>
            <Title level={2}>{businessToday.locale('ru').format('D MMMM')}</Title>
          </div>
          <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => openQuickBookingDrawer({ date: businessToday })} />
        </div>
        <div className="tp-business-mobile-home__metrics">
          <div><span>Брони</span><strong>{businessTodayBookings.length}</strong></div>
          <div><span>Выручка</span><strong>{formatMoney(businessTodayRevenue)}</strong></div>
          <div><span>Ожидают</span><strong>{businessAwaitingConfirmation.length}</strong></div>
        </div>
        <div className="tp-business-mobile-home__actions">
          <Button onClick={() => openQuickBookingDrawer({ date: businessToday })}>Бронь</Button>
          <Button onClick={() => navigate(`${basePath}/payments`)}>Оплата</Button>
          <Button onClick={() => navigate(`${basePath}/clients`)}>Клиент</Button>
          <Button onClick={() => navigate(`${basePath}/tasks`)}>Задача</Button>
        </div>
        <Card className="tp-admin-card tp-business-mobile-home__agenda" title="Agenda">
          {businessTodayTimeline.length ? businessTodayTimeline.slice(0, 6).map((entry) => (
            <button key={entry.key} type="button" onClick={() => navigate(`${basePath}/schedule`)}>
              <time>{(entry.scheduleTime || dayjs(entry.startDate)).format('HH:mm')}</time>
              <span>
                <strong>{entry.title || entry.tourTitle || entry.stayTitle}</strong>
                <small>{[entry.clientName, entry.guestsLabel, getSchedulePaymentLabel(entry)].filter(Boolean).join(' · ')}</small>
              </span>
            </button>
          )) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Сегодня нет событий. Создайте бронь вручную или дождитесь заявки через TravelPay.">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openQuickBookingDrawer({ date: businessToday })}>Создать бронь</Button>
            </Empty>
          )}
        </Card>
      </section>

      <section className="tp-business-home-hero">
        <div>
          <Text className="tp-admin-section-label">TravelPay Business OS</Text>
          <Title level={2}>Добрый день, {liveSessionUser?.name || sessionUser?.name || 'менеджер'}</Title>
          <Text type="secondary">Сегодня, {businessToday.locale('ru').format('D MMMM')}</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => openQuickBookingDrawer({ date: businessToday })}>
          Новое бронирование
        </Button>
      </section>

      <Card className="tp-admin-card" title="Настройка TravelPay" extra={<Tag>{onboardingDone}/7</Tag>}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} xl={8}>
            <Progress percent={onboardingProgress} strokeColor="#2563eb" />
            <Text type="secondary">Завершите базовую настройку, чтобы публичная страница и CRM работали без ручных костылей.</Text>
          </Col>
          <Col xs={24} xl={16}>
            <Row gutter={[8, 8]}>
              {onboardingSteps.map((step) => (
                <Col xs={24} md={12} key={step.title}>
                  <Button block type={step.done ? 'default' : 'dashed'} icon={step.done ? <CheckOutlined /> : <PlusOutlined />} onClick={() => navigate(step.action)}>
                    {step.title}
                  </Button>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Card>

      <div className="tp-business-home-metrics">
        {renderBusinessMetric({
          title: 'Бронирований сегодня',
          value: businessTodayBookings.length,
          change: getPeriodChange(businessTodayBookings.length, businessYesterdayBookings.length),
        })}
        {renderBusinessMetric({
          title: 'Выручка сегодня',
          value: businessTodayRevenue,
          formatter: formatMoney,
          change: getPeriodChange(businessTodayRevenue, businessYesterdayRevenue),
        })}
        {renderBusinessMetric({
          title: 'Ожидается оплат',
          value: businessTodayPendingPayment,
          formatter: formatMoney,
          change: `${businessUnpaidBookings.length} неоплаченных`,
        })}
        {renderBusinessMetric({
          title: 'Гостей сегодня',
          value: businessTodayGuests,
          change: getPeriodChange(businessTodayGuests, businessYesterdayGuests),
        })}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card className="tp-admin-card tp-business-home-today" title="Сегодня" extra={<Button onClick={() => navigate('/business/schedule')}>Расписание</Button>}>
            {businessTodayTimeline.length ? (
              <div className="tp-business-home-timeline">
                {businessTodayTimeline.slice(0, 8).map((entry) => (
                  <button key={entry.key} type="button" onClick={() => navigate('/business/schedule')}>
                    <time>{(entry.scheduleTime || dayjs(entry.startDate)).format('HH:mm')}</time>
                    <span>
                      <strong>{entry.title || entry.tourTitle || entry.stayTitle}</strong>
                      <small>{[entry.scheduleLabel, entry.guestsLabel, entry.clientName].filter(Boolean).join(' · ')}</small>
                    </span>
                    <Tag color={isBusinessPaidBooking(entry) ? 'green' : 'gold'}>{getSchedulePaymentLabel(entry)}</Tag>
                  </button>
                ))}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Сегодня в расписании спокойно" />
            )}
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Card className="tp-admin-card tp-business-home-tasks" title="Задачи">
              <div>
                <strong>{businessAwaitingConfirmation.length}</strong>
                <span>сегодня</span>
              </div>
              <div>
                <strong>{businessOverdueTasks}</strong>
                <span>просрочена</span>
              </div>
            </Card>
            <Card className="tp-admin-card tp-business-home-load" title="Загрузка бизнеса">
              <div><span>Cottages</span><Progress percent={cottagesLoad} /></div>
              <div><span>Tours</span><Progress percent={toursLoad} /></div>
            </Card>
          </Space>
        </Col>
      </Row>

      <div className="tp-business-home-queues">
        {renderBusinessQueue('Ближайшие бронирования', businessUpcomingBookings, `${basePath}/bookings`)}
        {renderBusinessQueue('Ожидают подтверждения', businessAwaitingConfirmation, `${basePath}/bookings`)}
        {renderBusinessQueue('Неоплаченные', businessUnpaidBookings, `${basePath}/payments`)}
        {renderBusinessQueue('Сегодня заезжают', businessCheckInsToday, `${basePath}/schedule`)}
        {renderBusinessQueue('Сегодня выезжают', businessCheckOutsToday, `${basePath}/schedule`)}
      </div>
    </Space>
  );

  const renderDashboard = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      {businessMode && currentBusinessSubscriptionRequest && (
        <Card className="tp-admin-card" styles={{ body: { padding: 20 } }}>
          <div className="tp-admin-section-head">
            <div>
              <Text className="tp-admin-section-label">TravelPay Business</Text>
              <Title level={3} style={{ marginBottom: 6 }}>Статус заявки компании</Title>
              <Paragraph style={{ marginBottom: 0 }}>
                {currentBusinessSubscriptionRequest.status === 'approved'
                  ? 'Супер-админ подтвердил вашу заявку и открыл подписку.'
                  : currentBusinessSubscriptionRequest.status === 'rejected'
                    ? 'Заявка отклонена. Ниже есть причина и история проверки.'
                    : 'Заявка отправлена и сейчас находится на проверке у супер-админа.'}
              </Paragraph>
            </div>
            <Tag color={(TOPUP_STATUS_META[currentBusinessSubscriptionRequest.status] || TOPUP_STATUS_META.pending).color}>
              {(TOPUP_STATUS_META[currentBusinessSubscriptionRequest.status] || TOPUP_STATUS_META.pending).label}
            </Tag>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={14}>
              <Card size="small" className="tp-admin-inline-card" title="История заявки">
                <div className="tp-admin-timeline">
                  {currentBusinessRequestTimeline.map((entry, index) => (
                    <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone}`}>
                      <div className="tp-admin-timeline__rail">
                        <span className="tp-admin-timeline__dot" />
                        {index < currentBusinessRequestTimeline.length - 1 ? <span className="tp-admin-timeline__line" /> : null}
                      </div>
                      <div className="tp-admin-timeline__content">
                        <div className="tp-admin-timeline__head">
                          <strong>{entry.title}</strong>
                          <Text type="secondary">{formatDateTime(entry.time)}</Text>
                        </div>
                        <Text type="secondary">{entry.description}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col xs={24} xl={10}>
              <Card size="small" className="tp-admin-inline-card" title="Решение супер-админа">
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Состояние подписки</Text>
                    <div>
                      <Tag color={getSubscriptionHealthMeta(currentCompany).color}>
                        {getSubscriptionHealthMeta(currentCompany).label}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">Комментарий</Text>
                    <div><strong>{currentBusinessSubscriptionRequest.adminComment || 'Комментарий пока не добавлен.'}</strong></div>
                  </div>
                  <div>
                    <Text type="secondary">Проверено</Text>
                    <div><strong>{formatDateTime(currentBusinessSubscriptionRequest.reviewedAt)}</strong></div>
                  </div>
                  <div>
                    <Text type="secondary">Проверил</Text>
                    <div><strong>{currentBusinessRequestReviewerName || 'Ожидает решения'}</strong></div>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24}>
              <Card size="small" className="tp-admin-inline-card" title="История оплат компании">
                <Table
                  rowKey="id"
                  size="small"
                  pagination={false}
                  dataSource={currentCompanyBillingHistory}
                  locale={{ emptyText: 'История оплат пока пуста' }}
                  columns={[
                    { title: 'Дата', dataIndex: 'createdAt', render: (value) => formatDateTime(value) },
                    { title: 'Сумма', dataIndex: 'amount', render: (value) => formatMoney(value) },
                    {
                      title: 'Статус',
                      dataIndex: 'status',
                      render: (value) => {
                        const meta = TOPUP_STATUS_META[value] || TOPUP_STATUS_META.pending;
                        return <Tag color={meta.color}>{meta.label}</Tag>;
                      },
                    },
                    { title: 'Комментарий admin', dataIndex: 'adminComment', render: (value) => value || '—' },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}
      {!businessMode && pendingBusinessSubscriptionRequests.length > 0 && (
        <Card
          className="tp-admin-card"
          styles={{ body: { padding: 20 } }}
        >
          <div className="tp-admin-section-head" style={{ marginBottom: 0 }}>
            <div>
              <Text className="tp-admin-section-label">Super Admin</Text>
              <Title level={3} style={{ marginBottom: 6 }}>Новые заявки от компаний</Title>
              <Paragraph style={{ marginBottom: 0 }}>
                Сейчас ожидают проверки {pendingBusinessSubscriptionRequests.length} {pendingBusinessSubscriptionRequests.length === 1 ? 'заявка' : pendingBusinessSubscriptionRequests.length < 5 ? 'заявки' : 'заявок'} на подключение и оплату подписки.
              </Paragraph>
            </div>
            <Space wrap>
              <Badge count={pendingBusinessSubscriptionRequests.length} color="#2563eb" />
              <Button type="primary" icon={<BankOutlined />} onClick={() => navigate('/admin/companies')}>
                Открыть раздел компаний
              </Button>
            </Space>
          </div>
        </Card>
      )}
      <Row gutter={[16, 16]}>
        {dashboardStats.map((item) => (
          <Col xs={24} sm={12} xl={4.8} key={item.title}>
            {renderStatCard(item)}
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card className="tp-admin-card" title="Быстрые действия">
            <Space wrap size={12}>
              {dashboardQuickActions.map((action) => (
                <Button key={action.key} type="primary" icon={action.icon} onClick={action.onClick}>
                  {action.label}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card className="tp-admin-card" title="Финансовое состояние">
            <Space orientation="vertical" size={14} style={{ width: '100%' }}>
              <div>
                <div className="tp-admin-progress-head">
                  <Text>Оплачено</Text>
                  <Text strong>{formatMoney(approvedTopupAmount)}</Text>
                </div>
                <Progress percent={totalPayments ? Math.round((approvedTopupAmount / totalPayments) * 100) : 0} showInfo={false} strokeColor="#22c55e" />
              </div>
              <div>
                <div className="tp-admin-progress-head">
                  <Text>Ожидает</Text>
                  <Text strong>{formatMoney(pendingTopupAmount)}</Text>
                </div>
                <Progress percent={totalPayments ? Math.round((pendingTopupAmount / totalPayments) * 100) : 0} showInfo={false} strokeColor="#f59e0b" />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card className="tp-admin-card" title="Последние бронирования">
            {filteredBookings.length ? (
              <div className="tp-admin-booking-list">
                {filteredBookings.slice(0, 4).map((booking) => {
                  const meta = BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending;
                  return (
                    <div key={booking.key} className="tp-admin-booking-card">
                      <div className="tp-admin-booking-card__top">
                        <div>
                          <Title level={5}>{booking.tourTitle}</Title>
                          <Text type="secondary">{booking.clientName} · {booking.clientPhone}</Text>
                        </div>
                        <Badge status={meta.badge} text={meta.label} />
                      </div>
                      <div className="tp-admin-booking-card__meta">
                        <span>{formatDateTime(booking.bookingDate)}</span>
                        <strong>{formatMoney(booking.amount)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пока нет бронирований" />}
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="tp-admin-card" title="Сводка компании">
            <Space orientation="vertical" size={16} style={{ width: '100%' }}>
              <div className="tp-admin-company-card">
                <Avatar size={52} src={safeSrc(sessionUser?.avatar)} icon={<UserOutlined />} />
                <div>
                  <Title level={5}>{currentCompany?.name || 'TravelPay Company'}</Title>
                  <Text type="secondary">{headerBranchText}</Text>
                </div>
              </div>
              <div className="tp-admin-company-grid">
                <div><Text type="secondary">Адрес</Text><strong>{currentCompany?.address || 'Бишкек, Кыргызстан'}</strong></div>
                <div><Text type="secondary">Телефон</Text><strong>{currentCompany?.phone || '—'}</strong></div>
                <div><Text type="secondary">Email</Text><strong>{currentCompany?.email || '—'}</strong></div>
                <div><Text type="secondary">Бонусы</Text><strong>{formatMoney(approvedBonusAmount)}</strong></div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const renderBusinessTasks = () => {
    const pendingBookings = bookingRows.filter((booking) => ['pending', 'pending_payment', 'payment_review'].includes(booking.status));
    const taskItems = [
      ...pendingBookings.slice(0, 5).map((booking) => ({
        key: `booking-${booking.key}`,
        title: `Проверить бронь: ${booking.tourTitle || booking.stayTitle || 'услуга'}`,
        description: [booking.clientName, booking.clientPhone, formatMoney(booking.amount)].filter(Boolean).join(' · '),
        tag: (BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending).label,
        color: (BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending).color,
        action: () => navigate(`${basePath}/bookings`),
      })),
      ...(prepaymentReviewCount ? [{
        key: 'payments-review',
        title: 'Проверить клиентские оплаты',
        description: `${prepaymentReviewCount} платеж(а) ожидают решения по чеку или предоплате.`,
        tag: 'Оплаты',
        color: 'blue',
        action: () => navigate(`${basePath}/payments`),
      }] : []),
      ...(currentCompany?.subscriptionStatus && currentCompany.subscriptionStatus !== 'active' ? [{
        key: 'subscription',
        title: 'Довести подписку до активного статуса',
        description: getSubscriptionHealthMeta(currentCompany).label,
        tag: 'Подписка',
        color: getSubscriptionHealthMeta(currentCompany).color,
        action: () => navigate(`${basePath}/settings`),
      }] : []),
    ];

    return (
      <Space orientation="vertical" size={18} style={{ width: '100%' }}>
        <Card className="tp-admin-card">
          <div className="tp-admin-section-head">
            <div>
              <Text className="tp-admin-section-label">Travel CRM</Text>
              <Title level={3}>Задачи</Title>
              <Paragraph>
                Рабочий список собирается из существующих броней, платежей и статуса компании.
              </Paragraph>
            </div>
            <Tag color={taskItems.length ? 'blue' : 'green'}>{taskItems.length || 0} активных</Tag>
          </div>
          {taskItems.length ? (
            <div className="tp-admin-booking-list">
              {taskItems.map((task) => (
                <button key={task.key} type="button" className="tp-admin-business-task" onClick={task.action}>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.description || 'Откройте связанный раздел для продолжения.'}</small>
                  </span>
                  <Tag color={task.color}>{task.tag}</Tag>
                </button>
              ))}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет срочных задач" />
          )}
        </Card>
      </Space>
    );
  };

  void renderBusinessTasks;

  const renderBusinessTasksV2 = () => {
    const pendingBookings = bookingRows.filter((booking) => ['pending', 'pending_payment', 'payment_review'].includes(booking.status));
    const now = dayjs();
    const automationTasks = bookingRows.flatMap((booking) => {
      const start = dayjs(booking.bookingDate || booking.travelDate || booking.checkInDate || booking.startDate || booking.createdAt);
      const end = dayjs(booking.endDate || booking.checkOutDate || booking.bookingDate || booking.travelDate || booking.createdAt);
      if (!start.isValid()) return [];
      const title = booking.tourTitle || booking.stayTitle || 'Travel service';
      const manager = booking.assignedTo || currentCompany?.name || 'TravelPay';
      const base = {
        related: `Booking #${booking.id || booking.key}`,
        manager,
        description: [title, booking.clientName, booking.clientPhone].filter(Boolean).join(' · '),
        color: 'purple',
        action: () => navigate(`${basePath}/bookings`),
      };
      const getStatus = (due) => due.isBefore(now) ? 'overdue' : due.diff(now, 'hour') <= 6 ? 'in_progress' : 'new';
      const tasks = [];
      if (booking.type === 'tour_booking') {
        const payDue = start.subtract(24, 'hour');
        const contactDue = start.subtract(3, 'hour');
        if (Math.abs(payDue.diff(now, 'hour')) <= 48 && !['PAID', 'REFUNDED'].includes(getCanonicalPaymentStatus(booking))) {
          tasks.push({ ...base, key: `auto-pay-${booking.key}`, title: 'Проверить оплату', dueAt: payDue.format('DD.MM HH:mm'), status: getStatus(payDue), tag: '24h до тура' });
        }
        if (Math.abs(contactDue.diff(now, 'hour')) <= 24) {
          tasks.push({ ...base, key: `auto-contact-${booking.key}`, title: 'Связаться с клиентом', dueAt: contactDue.format('DD.MM HH:mm'), status: getStatus(contactDue), tag: '3h до тура' });
        }
      }
      if (booking.type === 'stay_booking') {
        if (start.isSame(now, 'day')) {
          tasks.push({ ...base, key: `auto-checkin-${booking.key}`, title: 'Подтвердить приезд', dueAt: start.hour(10).minute(0).format('Сегодня HH:mm'), status: 'in_progress', tag: 'Check-in' });
        }
        if (end.isValid() && end.isBefore(now, 'day') && now.diff(end, 'day') <= 3) {
          tasks.push({ ...base, key: `auto-review-${booking.key}`, title: 'Попросить отзыв', dueAt: end.add(1, 'day').format('DD.MM HH:mm'), status: 'new', tag: 'After check-out' });
        }
      }
      return tasks;
    });
    const taskItems = [
      ...automationTasks,
      ...pendingBookings.slice(0, 8).map((booking, index) => {
        const status = booking.status === 'payment_review'
          ? 'in_progress'
          : dayjs(booking.bookingDate || booking.createdAt).isBefore(dayjs().subtract(1, 'day')) ? 'overdue' : 'new';
        return {
          key: `booking-${booking.key}`,
          title: `Позвонить ${booking.clientName || 'клиенту'}`,
          related: `Booking #${booking.id || index + 1}`,
          dueAt: dayjs().hour(16).minute(0).format('Сегодня HH:mm'),
          manager: booking.assignedTo || currentCompany?.name || 'TravelPay',
          status,
          description: [booking.tourTitle || booking.stayTitle || 'Travel service', booking.clientPhone, formatMoney(booking.amount)].filter(Boolean).join(' · '),
          tag: (BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending).label,
          color: (BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending).color,
          action: () => navigate(`${basePath}/bookings`),
        };
      }),
      ...(prepaymentReviewCount ? [{
        key: 'payments-review',
        title: 'Проверить клиентские оплаты',
        related: 'Payments queue',
        dueAt: dayjs().hour(17).minute(0).format('Сегодня HH:mm'),
        manager: currentCompany?.name || 'Finance',
        status: 'in_progress',
        description: `${prepaymentReviewCount} платеж(а) ожидают решения по чеку или предоплате.`,
        tag: 'Оплаты',
        color: 'blue',
        action: () => navigate(`${basePath}/payments`),
      }] : []),
      ...(currentCompany?.subscriptionStatus && currentCompany.subscriptionStatus !== 'active' ? [{
        key: 'subscription',
        title: 'Довести подписку до активного статуса',
        related: 'Business account',
        dueAt: 'Сегодня',
        manager: currentCompany?.name || 'Owner',
        status: 'overdue',
        description: getSubscriptionHealthMeta(currentCompany).label,
        tag: 'Подписка',
        color: getSubscriptionHealthMeta(currentCompany).color,
        action: () => navigate(`${basePath}/settings`),
      }] : []),
    ];
    const renderTaskCard = (task) => (
      <button key={task.key} type="button" className="tp-admin-business-task" onClick={task.action}>
        <span>
          <strong>{task.title}</strong>
          <small>{task.related} · {task.dueAt}</small>
          <small>Manager: {task.manager}</small>
          <small>{task.description || 'Откройте связанный раздел для продолжения.'}</small>
        </span>
        <Tag color={task.color}>{task.tag}</Tag>
      </button>
    );

    return (
      <Space orientation="vertical" size={18} style={{ width: '100%' }}>
        <Card className="tp-admin-card">
          <div className="tp-admin-section-head">
            <div>
              <Text className="tp-admin-section-label">Travel CRM</Text>
              <Title level={3}>Задачи</Title>
              <Paragraph>
                Kanban/List для операционных задач: звонки, оплаты, связанные бронирования и ответственные сотрудники.
              </Paragraph>
            </div>
            <Space>
              <Segmented
                value={taskViewMode}
                onChange={setTaskViewMode}
                options={[
                  { value: 'kanban', label: 'Kanban' },
                  { value: 'list', label: 'List' },
                ]}
              />
              <Tag color={taskItems.length ? 'blue' : 'green'}>{taskItems.length || 0} активных</Tag>
            </Space>
          </div>
          {taskItems.length ? (
            taskViewMode === 'kanban' ? (
              <div className="tp-admin-task-kanban">
                {TASK_STATUS_COLUMNS.map((column) => {
                  const columnTasks = taskItems.filter((task) => task.status === column.key);
                  return (
                    <section key={column.key} className="tp-admin-task-column">
                      <div className="tp-admin-task-column__head">
                        <strong>{column.label}</strong>
                        <Tag color={column.color}>{columnTasks.length}</Tag>
                      </div>
                      <div className="tp-admin-booking-list">
                        {columnTasks.length ? columnTasks.map(renderTaskCard) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пусто" />}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="tp-admin-booking-list">
                {taskItems.map(renderTaskCard)}
              </div>
            )
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет срочных задач" />
          )}
        </Card>
      </Space>
    );
  };

  const renderBusinessSupport = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card className="tp-admin-card">
        <div className="tp-admin-section-head">
          <div>
            <Text className="tp-admin-section-label">TravelPay Business</Text>
            <Title level={3}>Поддержка</Title>
            <Paragraph>
              Быстрые точки входа для вопросов по бронированиям, оплатам, публикации туров и объектам.
            </Paragraph>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" className="tp-admin-inline-card" title="Оплаты">
              <Space orientation="vertical" size={10}>
                <Text type="secondary">Проверьте реквизиты и спорные платежи.</Text>
                <Button onClick={() => navigate(`${basePath}/payments`)}>Открыть оплаты</Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" className="tp-admin-inline-card" title="Контент">
              <Space orientation="vertical" size={10}>
                <Text type="secondary">Маршруты, объекты, даты и вместимость.</Text>
                <Button onClick={() => navigate(`${basePath}/tours`)}>Открыть каталог</Button>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" className="tp-admin-inline-card" title="Команда">
              <Space orientation="vertical" size={10}>
                <Text type="secondary">Менеджеры, контакты и ответственные по оплатам.</Text>
                <Button onClick={() => navigate(`${basePath}/team`)}>Открыть команду</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  const renderCatalog = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card className="tp-admin-card">
        <div className="tp-admin-section-head">
          <div>
            <Text className="tp-admin-section-label">Каталог</Text>
            <Title level={3}>{catalogMode === 'tours' ? 'Туры компании' : 'Проживание / Домики'}</Title>
            <Paragraph>
              {catalogMode === 'tours'
                ? 'Управляйте маршрутами, статусами и связями с проживанием.'
                : 'Отдельный каталог домиков для привязки к турам и будущего календаря загрузки.'}
            </Paragraph>
          </div>
          <Space wrap>
            <Segmented
              value={catalogMode}
              onChange={(value) => {
                setCatalogMode(value);
                navigate(value === 'tours' ? `${basePath}/tours` : `${basePath}/accommodations`);
              }}
              options={[
                { label: 'Туры', value: 'tours' },
                { label: 'Домики', value: 'accommodations' },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={catalogMode === 'tours' ? openCreateTourDrawer : openAccommodationDrawer}
            >
              {catalogMode === 'tours' ? 'Добавить тур' : 'Добавить домик'}
            </Button>
          </Space>
        </div>
        {renderContextHelp(
          catalogMode === 'tours' ? 'Как настроить предоплату?' : 'Как добавить объект?',
          catalogMode === 'tours'
            ? 'Откройте тур, выберите Prepayment: выключена, фиксированная сумма или процент. Это влияет на required prepayment при создании брони.'
            : 'Создайте Property/Unit, укажите capacity, цены, check-in/check-out и доступность. После этого объект появится в календаре и публичной странице компании.',
        )}

        {catalogMode === 'tours' ? (
          <>
            <div className="tp-admin-tour-ops-grid">
              {tourOperationCards.slice(0, 12).map((card) => (
                <button
                  key={card.key}
                  type="button"
                  className="tp-admin-tour-ops-card"
                  onClick={() => {
                    setDepartureOpsDrawerItem(card);
                  }}
                >
                  <div>
                    <strong>{card.title}</strong>
                    {(card.slot.guide || card.slot.vehicle || card.slot.meetingPoint) && (
                      <small>
                        {[card.slot.guide && `Guide: ${card.slot.guide}`, card.slot.vehicle, card.slot.meetingPoint]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    )}
                    <small>{card.date.locale('ru').format('D MMMM')} · {card.time}</small>
                  </div>
                  <div className="tp-admin-tour-ops-card__stats">
                    <span>{card.bookedSeats} / {card.totalSeats}</span>
                    <span>{card.remainingSeats} free</span>
                    <span>{formatMoney(card.revenue)}</span>
                    <Tag color={card.statusColor}>{card.statusLabel}</Tag>
                    {card.waitlistCount > 0 && <Tag color="gold">Waitlist {card.waitlistCount}</Tag>}
                    <Tag color={card.checklistDone === TOUR_OPERATION_CHECKLIST_ITEMS.length ? 'green' : 'purple'}>
                      Ops {card.checklistDone}/{TOUR_OPERATION_CHECKLIST_ITEMS.length}
                    </Tag>
                  </div>
                </button>
              ))}
            </div>

            <div className="tp-admin-toolbar">
              <Input.Search
                allowClear
                size="large"
                value={tourSearch}
                placeholder="Поиск по названию, локации и статусу"
                onChange={(event) => setTourSearch(event.target.value)}
                className="tp-admin-search"
              />
              <Segmented
                size="large"
                value={tourStatusFilter}
                options={tourStatusSegments}
                onChange={setTourStatusFilter}
                className="tp-admin-segmented"
              />
              <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>Обновить</Button>
                <Button onClick={() => {
                  setTourSearch('');
                  setTourStatusFilter('all');
                }}>
                  Сбросить
                </Button>
              </Space>
            </div>

            <Table
              {...crmTableProps}
              rowKey="id"
              dataSource={filteredTours}
              columns={tourColumns}
              loading={loading}
              pagination={{ pageSize: 7, showSizeChanger: false }}
              scroll={{ x: 1180 }}
            />
          </>
        ) : (
          <Table
            {...crmTableProps}
            rowKey="id"
            dataSource={accommodations}
            columns={accommodationColumns}
            loading={loading}
            pagination={{ pageSize: 7, showSizeChanger: false }}
            scroll={{ x: 1100 }}
            locale={{ emptyText: 'Пока нет домиков. Добавьте первый вариант проживания.' }}
          />
        )}
      </Card>
    </Space>
  );

  const renderBookingCard = (booking) => {
    const extraCount = Array.isArray(booking.extras) ? booking.extras.filter((item) => item.title).length : 0;
    return (
      <div key={booking.key} className="tp-admin-booking-card tp-admin-booking-card--compact">
        <div className="tp-admin-booking-card__top">
          <div>
            <Title level={5}>{booking.tourTitle}</Title>
            <Text type="secondary">{booking.clientName} · {booking.clientPhone}</Text>
          </div>
          <Space size={6}>
            {booking.type === 'stay_booking' && <Tag color="cyan">Домик</Tag>}
            {renderBookingStatusChip(booking)}
          </Space>
        </div>
        <div className="tp-admin-booking-card__meta">
          <span>{formatDateTime(booking.bookingDate)}</span>
          <strong>{formatMoney(booking.amount)}</strong>
        </div>
        {booking.type === 'stay_booking' && (
          <div className="tp-admin-booking-card__meta">
            {extraCount ? (
              <Text type="secondary">Доп. услуги: {extraCount}</Text>
            ) : (
              <Text type="secondary">Без доп. услуг</Text>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBookings = () => (
    <Row gutter={[18, 18]}>
      <Col xs={24} xl={7}>
        <Card className="tp-admin-card tp-admin-sticky-card" title="Навигация по датам">
          <Calendar
            fullscreen={false}
            value={calendarDate}
            onSelect={setCalendarDate}
            className="tp-admin-mini-calendar"
            cellRender={(value) => {
              const count = filteredBookings.filter((item) => isSameDay(new Date(item.bookingDate), value.toDate())).length;
              return count ? <div className="tp-admin-mini-calendar__badge">{count}</div> : null;
            }}
          />
        </Card>
      </Col>

      <Col xs={24} xl={17}>
        <Card className="tp-admin-card">
          <div className="tp-admin-section-head">
            <div>
              <Text className="tp-admin-section-label">Бронирования</Text>
              <Title level={3}>Календарь и журнал бронирований</Title>
              <Paragraph>Следите за загрузкой по дням, неделям и месяцам. Фильтруйте по менеджерам и статусам.</Paragraph>
            </div>
            <Space wrap>
              <DatePicker value={calendarDate} onChange={(value) => value && setCalendarDate(value)} />
              <Select
                value={bookingManagerFilter}
                onChange={setBookingManagerFilter}
                style={{ minWidth: 210 }}
                options={[{ value: 'all', label: 'Все сотрудники' }, ...managerOptions]}
              />
              <Select
                value={bookingExtraFilter}
                onChange={setBookingExtraFilter}
                style={{ minWidth: 220 }}
                options={extraServiceOptions}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/tour-booking')}>
                Создать бронирование
              </Button>
            </Space>
          </div>

          <div className="tp-admin-toolbar">
            <Input.Search
              allowClear
              size="large"
              value={calendarSearch}
              placeholder="Поиск по клиенту, туру, телефону"
              onChange={(event) => setCalendarSearch(event.target.value)}
              className="tp-admin-search"
            />
            <Segmented
              value={bookingStatusFilter}
              onChange={setBookingStatusFilter}
              options={[
                { label: 'Все', value: 'all' },
                { label: 'Оплачено', value: 'paid' },
                { label: 'Ожидает', value: 'pending' },
                { label: 'Отменено', value: 'cancelled' },
              ]}
              className="tp-admin-segmented"
            />
          </div>

          <Row gutter={[12, 12]} style={{ margin: '0 24px 18px' }}>
            <Col xs={24} md={12} xl={6}>
              <Card size="small" className="tp-admin-inline-card">
                <Statistic title="Брони с доп. услугами" value={bookingsWithExtrasCount} suffix={`из ${stayBookingsOnly.length || 0}`} />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card size="small" className="tp-admin-inline-card">
                <Statistic title="Выручка от услуг" value={extrasRevenueTotal} formatter={(value) => formatMoney(value)} />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card size="small" className="tp-admin-inline-card">
                <Statistic title="На проверке" value={prepaymentReviewCount} suffix="заявок" />
              </Card>
            </Col>
            <Col xs={24} md={12} xl={6}>
              <Card size="small" className="tp-admin-inline-card">
                <Statistic
                  title="Топ услуга"
                  value={topExtraService?.title || '—'}
                  formatter={(value) => value}
                />
                {topExtraService ? <Text type="secondary">{formatMoney(topExtraService.revenue)}</Text> : null}
              </Card>
            </Col>
          </Row>

          <Tabs
            items={[
              {
                key: 'day',
                label: 'День',
                children: bookingsForSelectedDay.length ? (
                  <div className="tp-admin-booking-list">
                    {bookingsForSelectedDay.map(renderBookingCard)}
                  </div>
                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="На выбранный день бронирований нет" />,
              },
              {
                key: 'week',
                label: 'Неделя',
                children: (
                  <div className="tp-admin-week-grid">
                    {weeklyColumns.map((column) => (
                      <div key={column.label} className="tp-admin-week-day">
                        <div className="tp-admin-week-day__head">
                          <strong>{column.label}</strong>
                          <Badge count={column.items.length} color="#2563eb" />
                        </div>
                        <div className="tp-admin-week-day__body">
                          {column.items.length ? column.items.map(renderBookingCard) : <Text type="secondary">Пусто</Text>}
                        </div>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'month',
                label: 'Месяц',
                children: (
                  <Calendar
                    value={calendarDate}
                    onSelect={setCalendarDate}
                    locale={ruRU}
                    className="tp-admin-full-calendar"
                    cellRender={(value) => {
                      const items = calendarEntriesByDate.get(value.format('YYYY-MM-DD')) || [];
                      return items.length ? (
                        <div className="tp-admin-calendar-cell">
                          {items.slice(0, 3).map((entry) => {
                            const meta = entry.type === 'tour'
                              ? (TOUR_CALENDAR_STATUS_META[entry.status] || TOUR_CALENDAR_STATUS_META.scheduled)
                              : (BOOKING_STATUS_META[entry.status] || BOOKING_STATUS_META.pending);
                            return (
                              <button
                                key={entry.key}
                                type="button"
                                className="tp-admin-calendar-pill"
                                onClick={() => openCalendarItemDetails(entry)}
                              >
                                <Tag color={meta.color}>{entry.type === 'tour' ? `${entry.title} - ${entry.companyName}` : `${entry.clientName} - ${entry.tourTitle}`}</Tag>
                                {entry.type === 'tour' && <span>{entry.bookedSeats}/{entry.totalSeats} мест</span>}
                                {entry.type !== 'tour' && renderBookingStatusChip(entry)}
                              </button>
                            );
                          })}
                          {items.length > 3 && <span className="tp-admin-calendar-more">+ еще {items.length - 3}</span>}
                        </div>
                      ) : null;
                    }}
                  />
                ),
              },
              {
                key: 'all',
                label: 'Бронирования',
                children: (
                  <Table
                    rowKey="key"
                    dataSource={filteredBookingCalendarEntries}
                    columns={bookingTableColumnsExtended}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    scroll={{ x: 1100 }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Col>
    </Row>
  );

  void renderBookings;

  const calendarViewOptions = [
    { label: 'День', value: 'day' },
    { label: 'Неделя', value: 'week' },
    { label: 'Месяц', value: 'month' },
  ];

  const calendarPeriodLabel = useMemo(() => {
    const localized = calendarDate.locale('ru');
    if (bookingTab === 'month') return localized.format('MMMM YYYY');
    if (bookingTab === 'day') return localized.format('dddd, D MMMM YYYY');

    const start = dayjs(startOfWeek(calendarDate.toDate())).locale('ru');
    const end = start.add(6, 'day');
    return `${start.format('D MMMM')} — ${end.format('D MMMM YYYY')}`;
  }, [bookingTab, calendarDate]);

  const shiftCalendarPeriod = useCallback((direction) => {
    const amount = bookingTab === 'month' ? 1 : bookingTab === 'week' ? 7 : 1;
    const unit = bookingTab === 'month' ? 'month' : 'day';
    setCalendarDate((value) => value.add(direction * amount, unit));
  }, [bookingTab]);

  const removeCalendarFilter = useCallback((filterKey) => {
    if (filterKey === 'company') setCalendarCompanyFilter('all');
    if (filterKey === 'tour') setCalendarTourFilter('all');
    if (filterKey === 'status') setCalendarStatusFilter('all');
    if (filterKey === 'payment') setCalendarPaymentFilter('all');
    if (filterKey.startsWith('manager-')) {
      const manager = filterKey.replace('manager-', '');
      setWeekManagerSelection((items) => items.filter((item) => item !== manager));
    }
  }, []);

  const exportCalendarEntries = useCallback(() => {
    const header = ['Дата', 'Время', 'Объект', 'Клиент', 'Компания', 'Места', 'Статус', 'Оплата'];
    const rows = calendarEntries.map((entry) => [
      dayjs(entry.startDate).format('DD.MM.YYYY'),
      formatCalendarTimeRange(entry),
      entry.title || entry.tourTitle || entry.stayTitle || '—',
      entry.clientName || '—',
      entry.companyName || '—',
      entry.people || entry.guests || entry.bookedSeats || '—',
      (BOOKING_STATUS_META[entry.status] || TOUR_CALENDAR_STATUS_META[entry.status] || {}).label || entry.status || '—',
      entry.paymentStatus || '—',
    ]);
    const escapeValue = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map((row) => row.map(escapeValue).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travelpay-calendar-${calendarDate.format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    message.success('Экспорт календаря подготовлен.');
  }, [calendarDate, calendarEntries]);

  const renderCalendarFilters = ({ inDrawer = false } = {}) => (
    <div className={`tp-admin-calendar-filters${inDrawer ? ' is-drawer' : ''}`}>
      <Text className="tp-admin-calendar-filters__title">Фильтры</Text>
      <Select
        value={calendarCompanyFilter}
        onChange={setCalendarCompanyFilter}
        options={[{ value: 'all', label: 'Все компании' }, ...companyOptions]}
        placeholder="Компания"
        aria-label="Фильтр компаний"
      />
      <Select
        value={calendarTourFilter}
        onChange={setCalendarTourFilter}
        options={[{ value: 'all', label: calendarResource === 'tours' ? 'Все туры' : 'Все домики' }, ...calendarObjectOptions]}
        placeholder={calendarResource === 'tours' ? 'Тур' : 'Домик'}
        aria-label={calendarResource === 'tours' ? 'Фильтр туров' : 'Фильтр домиков'}
      />
      <Select
        mode="multiple"
        maxTagCount="responsive"
        value={weekManagerSelection}
        onChange={setWeekManagerSelection}
        options={managerOptions}
        placeholder="Сотрудники"
        aria-label="Фильтр сотрудников"
      />
      <Select
        value={calendarStatusFilter}
        onChange={setCalendarStatusFilter}
        options={calendarStatusOptions}
        aria-label="Фильтр статусов бронирования"
      />
      <Select
        value={calendarPaymentFilter}
        onChange={setCalendarPaymentFilter}
        options={[
          { value: 'all', label: 'Все статусы оплаты' },
          { value: 'paid', label: 'Оплачено' },
          { value: 'reserved', label: 'Средства зарезервированы' },
          { value: 'review', label: 'Чек на проверке' },
          { value: 'pending', label: 'Ожидает оплаты' },
        ]}
        aria-label="Фильтр статусов оплаты"
      />
      {activeCalendarFilters.length > 0 && (
        <div className="tp-admin-calendar-active-filters" aria-label="Активные фильтры">
          {activeCalendarFilters.map((filter) => (
            <Tag key={filter.key} closable onClose={() => removeCalendarFilter(filter.key)}>{filter.label}</Tag>
          ))}
        </div>
      )}
      <Button type="text" onClick={resetCalendarFilters}>Сбросить всё</Button>
    </div>
  );

  const renderCalendarMobileAgenda = (variant = '') => (
    <div className={`tp-admin-mobile-calendar-agenda tp-admin-mobile-calendar-agenda--${variant}`}>
      <div className="tp-admin-mobile-calendar-agenda__days" role="tablist" aria-label="Дни недели">
        {weekEventsByDay.map((day) => (
          <button
            key={day.key}
            type="button"
            role="tab"
            aria-selected={day.isSelected}
            className={`tp-admin-mobile-calendar-agenda__day${day.isSelected ? ' is-selected' : ''}${day.isToday ? ' is-today' : ''}`}
            onClick={() => setCalendarDate(day.date)}
          >
            <span>{day.label.slice(0, 2)}</span>
            <strong>{day.dayNumber}</strong>
          </button>
        ))}
      </div>
      <div className="tp-admin-calendar-day-view">
        <div className="tp-admin-calendar-day-view__date">
          {calendarDate.locale('ru').format('dddd, D MMMM')}
        </div>
        {selectedDayCalendarEntries.length ? (
          <div className="tp-admin-calendar-day-view__list">
            {[...selectedDayCalendarEntries]
              .sort((first, second) => dayjs(first.startDate).valueOf() - dayjs(second.startDate).valueOf())
              .map((booking) => (
                <button
                  key={booking.key}
                  type="button"
                  className={`tp-admin-calendar-day-event is-${booking.status || 'new'}`}
                  onClick={() => openCalendarItemDetails(booking)}
                >
                  <span className="tp-admin-calendar-day-event__time">{formatCalendarTimeRange(booking)}</span>
                  <span className="tp-admin-calendar-day-event__content">
                    <strong>{booking.title || booking.tourTitle}</strong>
                    <small>{booking.clientName || booking.companyName || 'TravelPay'}</small>
                  </span>
                  {renderBookingStatusChip(booking)}
                </button>
              ))}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="На выбранную дату бронирований нет"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openQuickBookingDrawer()}>
              Добавить бронирование
            </Button>
          </Empty>
        )}
      </div>
    </div>
  );
  void renderCalendarMobileAgenda;

  const renderCalendarListView = () => {
    if (!calendarListGroups.length) {
      return (
        <div className="tp-admin-calendar-list-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="За выбранный период бронирований нет"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openQuickBookingDrawer()}>
              Добавить бронирование
            </Button>
          </Empty>
        </div>
      );
    }

    return (
      <div className="tp-admin-calendar-list-view" aria-label="Список бронирований">
        {calendarListGroups.map((group) => (
          <section key={group.date.format('YYYY-MM-DD')} className="tp-admin-calendar-list-group">
            <div className="tp-admin-calendar-list-group__header">
              <strong>{group.date.locale('ru').format('dddd, D MMMM')}</strong>
              <span>{group.entries.length} {group.entries.length === 1 ? 'событие' : group.entries.length < 5 ? 'события' : 'событий'}</span>
            </div>
            <div className="tp-admin-calendar-list-group__entries">
              {group.entries.map((entry) => {
                const tourStatus = TOUR_CALENDAR_STATUS_META[entry.status] || TOUR_CALENDAR_STATUS_META.scheduled;
                const people = entry.people || entry.guests || entry.bookedSeats;
                const peopleLabel = people
                  ? entry.type === 'tour'
                    ? `${entry.bookedSeats || 0}/${entry.totalSeats || 0} мест`
                    : `${people} ${Number(people) === 1 ? 'место' : 'места'}`
                  : '';

                return (
                  <button
                    key={entry.key}
                    type="button"
                    className={`tp-admin-calendar-list-event is-${entry.status || 'new'}`}
                    onClick={() => openCalendarItemDetails(entry)}
                    aria-label={`Открыть детали: ${entry.title || entry.tourTitle || entry.stayTitle || 'бронирование'}`}
                  >
                    <time className="tp-admin-calendar-list-event__time">{formatCalendarTimeRange(entry)}</time>
                    <span className="tp-admin-calendar-list-event__content">
                      <strong>{entry.title || entry.tourTitle || entry.stayTitle || 'Бронирование'}</strong>
                      <small>{entry.clientName ? `${entry.clientName} · ${entry.companyName || 'TravelPay'}` : (entry.companyName || 'TravelPay')}</small>
                    </span>
                    <span className="tp-admin-calendar-list-event__meta">
                      {peopleLabel && <small>{peopleLabel}</small>}
                      {entry.type === 'tour'
                        ? <Tag color={tourStatus.color}>{tourStatus.label}</Tag>
                        : renderBookingStatusChip(entry)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    );
  };
  void renderCalendarListView;

  const renderScheduleDayView = () => (
    <div className="tp-admin-schedule-day" style={{ '--tp-calendar-hour-height': `${weekHourHeight}px` }}>
      <div className="tp-admin-schedule-day__hours" aria-hidden="true">
        <div className="tp-admin-schedule-day__resource-spacer" />
        {weekHourRows.map((hour) => (
          <div key={hour} className="tp-admin-schedule-day__hour-label">
            {String(hour).padStart(2, '0')}:00
          </div>
        ))}
      </div>
      <div className="tp-admin-schedule-day__resources" style={{ gridTemplateColumns: `repeat(${Math.max(scheduleResourceColumns.length, 1)}, minmax(190px, 1fr))` }}>
        {scheduleResourceColumns.map((column) => (
          <div key={column.key} className="tp-admin-schedule-resource">
            <div className="tp-admin-schedule-resource__head">
              <strong>{column.label}</strong>
              <small>{column.items.length} событий</small>
            </div>
            <div className="tp-admin-schedule-day__grid">
              {weekHourRows.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className="tp-admin-schedule-day__slot"
                  aria-label={`Создать бронирование: ${column.label}, ${String(hour).padStart(2, '0')}:00`}
                  onDragOver={(event) => {
                    if (scheduleDragAction) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleScheduleDrop(column, hour);
                  }}
                  onClick={() => openQuickBookingDrawer({
                    date: calendarDate,
                    hour,
                    resource: column.bookingResource,
                    objectId: column.objectId,
                  })}
                />
              ))}
              {calendarDate.isSame(dayjs(), 'day') && dayjs().hour() >= weekBoardStartHour && dayjs().hour() < weekBoardEndHour && (
                <span className="tp-admin-schedule-day__now" style={{ top: `${(((dayjs().hour() * 60) + dayjs().minute() - (weekBoardStartHour * 60)) / 60) * weekHourHeight}px` }}>
                  <span>{dayjs().format('HH:mm')}</span>
                </span>
              )}
              {column.items.map((entry) => {
                const statusMeta = BOOKING_STATUS_META[getCanonicalBookingStatus(entry)] || BOOKING_STATUS_META.NEW;
                const paymentMeta = PAYMENT_STATUS_META[getCanonicalPaymentStatus(entry)] || PAYMENT_STATUS_META.UNPAID;
                const eventStyle = {
                  top: entry.style.top,
                  height: entry.style.height,
                };
                const priceVisible = Number(entry.amount || entry.price || 0) > 0;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    className={`tp-admin-schedule-event is-${entry.type || 'booking'} is-${entry.scheduleType || 'booking'}`}
                    style={eventStyle}
                    draggable={['stay_booking', 'tour_booking'].includes(entry.type)}
                    onDragStart={(event) => {
                      event.stopPropagation();
                      setScheduleDragAction({ mode: 'move', entry });
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setScheduleDragAction(null)}
                    onClick={() => openCalendarItemDetails(entry)}
                  >
                    <span className="tp-admin-schedule-event__time">{entry.timeLabel}</span>
                    <span className="tp-admin-schedule-event__body">
                      <strong>{entry.title || entry.tourTitle || entry.stayTitle || 'Бронирование'}</strong>
                      <small>{entry.clientName || entry.companyName || 'TravelPay'}</small>
                      <small>{[entry.guestsLabel, priceVisible ? formatMoney(entry.amount || entry.price) : ''].filter(Boolean).join(' · ')}</small>
                    </span>
                    <span className="tp-admin-schedule-event__status"><i style={{ background: paymentMeta.dot || statusMeta.dot }} />{paymentMeta.label}</span>
                    {entry.type === 'tour_booking' && (
                      <span
                        role="button"
                        tabIndex={0}
                        className="tp-admin-schedule-event__resize"
                        draggable
                        aria-label="Изменить длительность бронирования"
                        onClick={(event) => event.stopPropagation()}
                        onDragStart={(event) => {
                          event.stopPropagation();
                          setScheduleDragAction({ mode: 'resize', entry });
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => setScheduleDragAction(null)}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {!scheduleDayTimedEntries.length && (
          <div className="tp-admin-schedule-day__empty">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="На выбранный день событий нет">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openQuickBookingDrawer({ date: calendarDate })}>
                Новое бронирование
              </Button>
            </Empty>
          </div>
        )}
      </div>
    </div>
  );

  const renderScheduleWeekView = () => (
    <div className="tp-admin-schedule-week" style={{ '--tp-calendar-hour-height': `${weekHourHeight}px` }} ref={weekBoardRef}>
      <div className="tp-admin-schedule-week__head">
        <div className="tp-admin-schedule-week__corner" />
        {weekEventsByDay.map((day) => (
          <button
            key={day.key}
            type="button"
            className={`tp-admin-schedule-week__day-head${day.isToday ? ' is-today' : ''}${day.isSelected ? ' is-selected' : ''}`}
            onClick={() => setCalendarDate(day.date)}
          >
            <span>{day.date.locale('ru').format('dd').toUpperCase()}</span>
            <strong>{day.date.format('D')}</strong>
            <small>{day.items.length} событий</small>
          </button>
        ))}
      </div>
      <div className="tp-admin-schedule-week__body">
        <div className="tp-admin-schedule-week__hours">
          {weekHourRows.map((hour) => (
            <div key={hour} className="tp-admin-schedule-week__hour">{String(hour).padStart(2, '0')}:00</div>
          ))}
        </div>
        <div className="tp-admin-schedule-week__days">
          {weekEventsByDay.map((day) => (
            <div key={day.key} className={`tp-admin-schedule-week__day${day.isToday ? ' is-today' : ''}`}>
              {weekHourRows.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  className="tp-admin-schedule-week__slot"
                  aria-label={`Создать бронирование: ${day.date.format('DD.MM.YYYY')} ${String(hour).padStart(2, '0')}:00`}
                  onClick={() => openQuickBookingDrawer({ date: day.date, hour })}
                />
              ))}
              {day.isToday && dayjs().hour() >= weekBoardStartHour && dayjs().hour() < weekBoardEndHour && (
                <span className="tp-admin-schedule-week__now" style={{ top: `${(((dayjs().hour() * 60) + dayjs().minute() - (weekBoardStartHour * 60)) / 60) * weekHourHeight}px` }}>
                  <span>{dayjs().format('HH:mm')}</span>
                </span>
              )}
              {day.items.map((entry) => {
                const paymentMeta = PAYMENT_STATUS_META[getCanonicalPaymentStatus(entry)] || PAYMENT_STATUS_META.UNPAID;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    className={`tp-admin-schedule-week-event is-${entry.type || 'event'}`}
                    style={entry.style}
                    onClick={() => openCalendarItemDetails(entry)}
                  >
                    <span className="tp-admin-schedule-week-event__time">{entry.timeLabel}</span>
                    <strong>{entry.title || entry.tourTitle || entry.stayTitle || 'Бронирование'}</strong>
                    <small>{entry.clientName || entry.companyName || 'TravelPay'}</small>
                    <small><i style={{ background: paymentMeta.dot }} />{paymentMeta.label}</small>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScheduleMonthView = () => (
    <Calendar
      value={calendarDate}
      onSelect={(value) => {
        setCalendarDate(value);
        setBookingTab('day');
      }}
      locale={ruRU}
      className="tp-admin-month-overview"
      cellRender={(value) => {
        const items = calendarEntriesByDate.get(value.format('YYYY-MM-DD')) || [];
        if (!items.length) return null;
        const bookings = items.filter((entry) => entry.type !== 'tour');
        const revenue = bookings.reduce((sum, entry) => sum + Number(entry.amount || entry.price || 0), 0);
        const checkIns = items.filter((entry) => entry.scheduleType === 'check-in' || entry.type === 'stay_booking').length;
        const toursCount = items.filter((entry) => entry.type === 'tour' || entry.type === 'tour_booking').length;
        const visible = items.slice(0, 3);

        return (
          <button
            type="button"
            className="tp-admin-month-summary"
            onClick={(event) => {
              event.stopPropagation();
              setCalendarDate(value);
              setBookingTab('day');
            }}
          >
            <strong>{bookings.length} бронирования</strong>
            <span>{formatMoney(revenue)}</span>
            <small>{checkIns} check-in · {toursCount} tour</small>
            <div>
              {visible.map((entry) => (
                <i key={entry.key}>{entry.clientName || entry.title || entry.tourTitle || entry.stayTitle}</i>
              ))}
              {items.length > 3 && <em>+{items.length - 3} ещё</em>}
            </div>
          </button>
        );
      }}
    />
  );

  const renderUnitAvailabilityStrip = (unit) => {
    const unitBookings = getUnitBookings(unit);
    return (
      <div className="tp-admin-property-availability-strip">
        {propertyDateRange.map((date) => {
          const blocked = getStayBlockForDate(unit, date);
          const occupied = unitBookings.some((booking) => {
            const start = dayjs(booking.checkInDate || booking.bookingDate).startOf('day');
            const end = dayjs(booking.checkOutDate || booking.endDate || booking.checkInDate).startOf('day');
            return date.isSame(start, 'day') || (date.isAfter(start, 'day') && date.isBefore(end, 'day'));
          });
          return (
            <span key={date.format('YYYY-MM-DD')} className={blocked ? 'is-blocked' : occupied ? 'is-booked' : 'is-free'} title={`${date.format('DD.MM')} · ${blocked ? PROPERTY_BLOCK_REASONS.find((item) => item.value === blocked.reason)?.label || 'закрыто' : occupied ? 'занято' : 'свободно'}`}>
              {date.format('DD')}
            </span>
          );
        })}
      </div>
    );
  };

  const getUnitPriceForDate = (unit, dateValue) => {
    const date = dayjs(dateValue).startOf('day');
    const rules = unit.pricingRules || [];
    const baseRule = rules.find((rule) => rule.type === 'base' && Number(rule.price) > 0);
    const weekendRule = rules.find((rule) => rule.type === 'weekend' && Number(rule.price) > 0);
    const rangedRules = rules.filter((rule) => {
      const start = dayjs(rule.startDate).startOf('day');
      const end = dayjs(rule.endDate || rule.startDate).startOf('day');
      return start.isValid()
        && (date.isSame(start, 'day') || date.isAfter(start, 'day'))
        && (date.isSame(end.isValid() ? end : start, 'day') || date.isBefore(end.isValid() ? end : start, 'day'));
    });
    const specificRule = rangedRules.find((rule) => rule.type === 'specific_date' && Number(rule.price) > 0);
    const seasonRule = rangedRules.find((rule) => rule.type === 'season' && Number(rule.price) > 0);
    const discountRule = rangedRules.find((rule) => rule.type === 'discount' && Number(rule.discount) > 0);
    const minStayRule = rangedRules.find((rule) => rule.type === 'minimum_stay' && Number(rule.minimumStay) > 0);
    let price = Number(specificRule?.price || seasonRule?.price || 0);
    if (!price && [5, 6, 0].includes(date.day())) price = Number(weekendRule?.price || unit.weekendPrice || 0);
    if (!price) price = Number(baseRule?.price || unit.pricePerNight || 0);
    if (discountRule) price = Math.max(Math.round(price * (1 - (Number(discountRule.discount) / 100))), 0);

    return {
      price,
      label: specificRule?.label || seasonRule?.label || discountRule?.label || minStayRule?.label || ([5, 6, 0].includes(date.day()) ? 'Weekend' : 'Base'),
      minimumStay: Number(minStayRule?.minimumStay || 0),
    };
  };

  const renderProperties = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card className="tp-admin-card tp-admin-properties-page">
        <div className="tp-admin-section-head">
          <div>
            <Text className="tp-admin-section-label">Property Management</Text>
            <Title level={3}>Объекты и юниты</Title>
            <Paragraph>Управляйте комплексами, коттеджами, домиками, загрузкой, check-in/check-out и доступностью.</Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAccommodationDrawer}>Добавить Unit</Button>
        </div>

        <div className="tp-admin-property-grid">
          {propertyRecords.map((property) => (
            <button key={property.id} type="button" className="tp-admin-property-card" onClick={() => openPropertyDetails(property)}>
              <div className="tp-admin-property-card__image">
                {property.image ? <AppImage src={property.image} alt={property.title} /> : <HomeOutlined />}
              </div>
              <div className="tp-admin-property-card__body">
                <div>
                  <strong>{property.title}</strong>
                  <small>{property.location || property.companyName || 'Кыргызстан'}</small>
                </div>
                <div className="tp-admin-property-card__meta">
                  <Tag color={property.status === 'available' ? 'green' : property.status === 'mixed' ? 'gold' : 'red'}>{property.status === 'mixed' ? 'Частично' : property.status === 'available' ? 'Доступен' : 'Нет мест'}</Tag>
                  <span>{property.type}</span>
                  <span>до {property.capacity} гостей</span>
                  <span>{formatMoney(property.price)}</span>
                </div>
                <div className="tp-admin-property-card__stats">
                  <div><Text type="secondary">Загрузка</Text><Progress percent={property.occupancy} size="small" /></div>
                  <div><Text type="secondary">Доход</Text><strong>{formatMoney(property.revenue)}</strong></div>
                  <div><Text type="secondary">Следующий check-in</Text><strong>{property.nextCheckIn ? `${property.nextCheckIn.unit.title || property.nextCheckIn.unit.name} · ${formatDate(property.nextCheckIn.booking.checkInDate)}` : '—'}</strong></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="tp-admin-card" title="Availability calendar">
        <div className="tp-admin-property-availability">
          <div className="tp-admin-property-availability__head">
            <span />
            {propertyDateRange.map((date) => <strong key={date.format('YYYY-MM-DD')}>{date.format('DD')}</strong>)}
          </div>
          {accommodations.map((unit) => (
            <div key={unit.id} className="tp-admin-property-availability__row">
              <strong>{unit.title || unit.name}</strong>
              {propertyDateRange.map((date) => {
                const blocked = getStayBlockForDate(unit, date);
                const occupied = getUnitBookings(unit).some((booking) => {
                  const start = dayjs(booking.checkInDate || booking.bookingDate).startOf('day');
                  const end = dayjs(booking.checkOutDate || booking.endDate || booking.checkInDate).startOf('day');
                  return date.isSame(start, 'day') || (date.isAfter(start, 'day') && date.isBefore(end, 'day'));
                });
                return <span key={date.format('YYYY-MM-DD')} className={blocked ? 'is-blocked' : occupied ? 'is-booked' : 'is-free'} />;
              })}
            </div>
          ))}
        </div>
      </Card>
    </Space>
  );

  const renderBookingsModern = () => (
    <section className="tp-admin-calendar-page">
      <div className="tp-admin-calendar-workspace">
        <aside className="tp-admin-calendar-sidebar" aria-label="Дата и фильтры календаря">
          <Calendar
            fullscreen={false}
            locale={ruRU}
            value={calendarDate}
            onSelect={setCalendarDate}
            className="tp-admin-mini-calendar"
            headerRender={({ value, onChange }) => {
              const changeMonth = (step) => {
                const next = value.clone().add(step, 'month');
                onChange(next);
                setCalendarDate(next);
              };
              return <div className="tp-admin-mini-calendar-header">
                <Button type="text" shape="circle" icon={<LeftOutlined />} aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)} />
                <strong>{value.locale('ru').format('MMMM YYYY')}</strong>
                <Button type="text" shape="circle" icon={<RightOutlined />} aria-label="Следующий месяц" onClick={() => changeMonth(1)} />
              </div>;
            }}
            cellRender={(value) => {
              const count = (calendarEntriesByDate.get(value.format('YYYY-MM-DD')) || []).length;
              if (!count) return null;
              return (
                <Tooltip title={`${count} ${count === 1 ? 'событие' : count < 5 ? 'события' : 'событий'}`}>
                  <span className={`tp-admin-mini-calendar__badge${count > 3 ? ' has-count' : ''}`}>{count > 3 ? '3+' : ''}</span>
                </Tooltip>
              );
            }}
          />
          <Button size="small" onClick={() => setCalendarDate(dayjs())}>Сегодня</Button>
          {renderCalendarFilters()}
        </aside>

        <main className={`tp-admin-calendar-main${bookingTab === 'three-day' ? ' is-three-days' : ''}`}>
          <div className="tp-admin-calendar-header">
            <div className="tp-admin-calendar-title">
              <Title level={2}>{currentTab === 'schedule' ? 'Расписание' : 'Календарь'}</Title>
              <Text type="secondary">{currentTab === 'schedule' ? 'Центр всей операционной системы бизнеса' : 'Управление бронированиями и расписанием'}</Text>
            </div>
            <div className="tp-admin-calendar-actions">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="tp-admin-calendar-create"
                onClick={() => openQuickBookingDrawer()}
              >
                Бронирование
              </Button>
            </div>
            <div className="tp-admin-calendar-toolbar" aria-label="Управление календарём">
              <div className="tp-admin-calendar-toolbar__group tp-admin-calendar-toolbar__group--period">
                <Button shape="circle" icon={<LeftOutlined />} aria-label="Предыдущий период" onClick={() => shiftCalendarPeriod(-1)} />
                <Button onClick={() => setCalendarDate(dayjs())}>Сегодня</Button>
                <Button shape="circle" icon={<RightOutlined />} aria-label="Следующий период" onClick={() => shiftCalendarPeriod(1)} />
                <span className="tp-admin-calendar-toolbar__period-label">{calendarPeriodLabel}</span>
              </div>
              <div className="tp-admin-calendar-toolbar__group tp-admin-calendar-toolbar__group--view">
                <Input.Search
                  allowClear
                  value={calendarSearchInput}
                  onChange={(event) => setCalendarSearchInput(event.target.value)}
                  placeholder="Поиск по клиенту или объекту"
                  className="tp-admin-calendar-toolbar__search"
                  aria-label="Поиск по календарю"
                />
                <Segmented value={bookingTab} onChange={setBookingTab} options={calendarViewOptions} aria-label="Режим календаря" />
                <Segmented
                  value={scheduleGroupBy}
                  onChange={setScheduleGroupBy}
                  options={[
                    { label: 'Объекты', value: 'resources' },
                    { label: 'Туры', value: 'tours' },
                    { label: 'Менеджеры', value: 'managers' },
                  ]}
                  aria-label="Группировать расписание"
                />
                <Segmented
                  value={calendarResource}
                  onChange={setCalendarResource}
                  options={[
                    { label: 'Туры', value: 'tours', icon: <CompassOutlined /> },
                    { label: 'Домики', value: 'stays', icon: <HomeOutlined /> },
                  ]}
                  aria-label="Тип объектов"
                />
                <Badge count={activeCalendarFilters.length} showZero={false} size="small">
                  <Button
                    className="tp-admin-calendar-toolbar__filters-trigger"
                    icon={<FilterOutlined />}
                    onClick={() => setCalendarFiltersDrawerOpen(true)}
                  >
                    Фильтры
                  </Button>
                </Badge>
                <Dropdown
                  trigger={['click']}
                  menu={{
                    items: [
                      { key: 'refresh', icon: <ReloadOutlined />, label: 'Обновить' },
                      { key: 'export', icon: <DownloadOutlined />, label: 'Экспортировать' },
                      { key: 'settings', icon: <SettingOutlined />, label: 'Настройки фильтров' },
                    ],
                    onClick: ({ key }) => {
                      if (key === 'refresh') loadCalendarPeriod();
                      if (key === 'export') exportCalendarEntries();
                      if (key === 'settings') setCalendarFiltersDrawerOpen(true);
                    },
                  }}
                >
                  <Button icon={<MoreOutlined />} aria-label="Дополнительные действия календаря" />
                </Dropdown>
              </div>
            </div>
          </div>

          {renderContextHelp('Как настроить календарь?', 'Используйте группировку по объектам, турам или менеджерам. Клик по свободному слоту создаёт бронь с уже подставленными датой, временем и ресурсом.')}

          {!isOnline && (
            <Alert
              className="tp-admin-calendar-state"
              type="warning"
              showIcon
              message="Нет подключения к интернету"
              description="Календарь показывает последние загруженные данные. Новые изменения появятся после восстановления сети."
              action={<Button size="small" onClick={loadCalendarPeriod}>Повторить</Button>}
            />
          )}
          {calendarError && isOnline && (
            <Alert
              className="tp-admin-calendar-state"
              type="error"
              showIcon
              message="Ошибка загрузки календаря"
              description={calendarError}
              action={<Button size="small" loading={calendarLoading} onClick={loadCalendarPeriod}>Повторить</Button>}
            />
          )}
          {calendarLoading && !calendarEntries.length && (
            <div className="tp-admin-calendar-skeleton" aria-label="Загрузка календаря">
              <Skeleton active title={{ width: '28%' }} paragraph={{ rows: 7 }} />
            </div>
          )}
          <Tabs
            activeKey={bookingTab === 'three-day' ? 'week' : bookingTab}
            onChange={setBookingTab}
            className="tp-admin-tabs tp-admin-tabs--calendar-content"
            items={[
              {
                key: 'day',
                label: 'День',
                children: (
                  <>
                  <div className="tp-admin-mobile-calendar-agenda__days tp-admin-mobile-calendar-agenda__days--standalone" role="tablist" aria-label="Дни недели">
                    {weekEventsByDay.map((day) => (
                      <button key={day.key} type="button" role="tab" aria-selected={day.isSelected} className={`tp-admin-mobile-calendar-agenda__day${day.isSelected ? ' is-selected' : ''}${day.isToday ? ' is-today' : ''}`} onClick={() => setCalendarDate(day.date)}>
                        <span>{day.label.slice(0, 2)}</span>
                        <strong>{day.dayNumber}</strong>
                      </button>
                    ))}
                  </div>
                  {isMobileViewport ? renderCalendarMobileAgenda('schedule') : renderScheduleDayView()}
                  </>
                ),
              },
              {
                key: 'week',
                label: 'Неделя',
                children: renderScheduleWeekView(),
              },
              {
                key: 'month',
                label: 'Месяц',
                children: renderScheduleMonthView(),
              },
            ]}
          />
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            className="tp-admin-calendar-fab"
            aria-label="Новое бронирование"
            onClick={() => openQuickBookingDrawer()}
          />
        </main>
      </div>
    </section>
  );

  const renderClients = () => (
    <Card className="tp-admin-card tp-admin-clients-crm">
      <div className="tp-admin-section-head">
        <div>
          <Text className="tp-admin-section-label">Travel CRM</Text>
          <Title level={3}>Клиенты</Title>
          <Paragraph>Единая клиентская база: бронирования, траты, поездки, долги, менеджеры и источники.</Paragraph>
        </div>
        <Space wrap>
          <Statistic title="Клиентов" value={clientRecords.length} />
          <Statistic title="VIP" value={clientRecords.filter((client) => client.clientStatus === 'vip').length} />
          <Statistic title="Должники" value={clientRecords.filter((client) => client.unpaidCount > 0).length} />
        </Space>
      </div>
      <div className="tp-admin-toolbar">
        <Input.Search
          allowClear
          size="large"
          value={clientSearch}
          placeholder="Поиск по имени или телефону"
          onChange={(event) => setClientSearch(event.target.value)}
          className="tp-admin-search"
        />
        <Space wrap>
          <Segmented
            value={clientSegmentFilter}
            onChange={setClientSegmentFilter}
            options={[
              { label: 'Все', value: 'all' },
              { label: 'Новые', value: 'new' },
              { label: 'Повторные', value: 'repeat' },
              { label: 'VIP', value: 'vip' },
              { label: 'Должники', value: 'debtors' },
              { label: 'Отменяли', value: 'cancelled' },
              { label: 'с TravelPay', value: 'travelpay' },
              { label: 'Ручные', value: 'manual' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>Обновить</Button>
        </Space>
      </div>
      <Table
        {...crmTableProps}
        rowKey="id"
        dataSource={filteredClients}
        columns={clientColumns}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 1220 }}
        onRow={(record) => ({
          onDoubleClick: () => openClientDetails(record),
        })}
      />
    </Card>
  );

  const renderSavings = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          {renderStatCard({ title: 'На проверке', value: pendingTopups.length, color: '#f59e0b' })}
        </Col>
        <Col xs={24} md={8}>
          {renderStatCard({ title: 'Пополнения', value: approvedTopupAmount, formatter: formatMoney, color: '#22c55e' })}
        </Col>
        <Col xs={24} md={8}>
          {renderStatCard({ title: 'Бонусы', value: approvedBonusAmount, formatter: formatMoney, color: '#2563eb' })}
        </Col>
      </Row>
      <Card className="tp-admin-card" title="Заявки на пополнение">
        <Table
          rowKey="id"
          dataSource={topupRequests}
          columns={topupRequestColumns}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1580 }}
          locale={{ emptyText: 'Заявок пока нет' }}
        />
      </Card>
    </Space>
  );

  const renderAnalyticsDashboard = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card className="tp-admin-card">
        <div className="tp-admin-section-head">
          <div>
            <Text className="tp-admin-section-label">TravelPay Business OS</Text>
            <Title level={3}>Аналитика</Title>
            <Paragraph>
              Выручка, полученные деньги, долги и динамика клиентов по бронированиям бизнеса.
            </Paragraph>
          </div>
          <Space wrap>
            <Segmented
              value={analyticsPeriod}
              onChange={setAnalyticsPeriod}
              options={[
                { label: 'Day', value: 'day' },
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
                { label: 'Year', value: 'year' },
                { label: 'Custom range', value: 'custom' },
              ]}
            />
            {analyticsPeriod === 'custom' && (
              <DatePicker.RangePicker
                value={analyticsRange}
                onChange={(range) => setAnalyticsRange(range || [dayjs().startOf('day'), dayjs().endOf('day')])}
              />
            )}
          </Space>
        </div>

        <Text type="secondary">
          Период: {analyticsWindow.start.format('DD MMM YYYY')} — {analyticsWindow.end.format('DD MMM YYYY')}
        </Text>

        <Row gutter={[14, 14]} style={{ marginTop: 18 }}>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Выручка', value: analyticsKpis.revenue, formatter: formatMoney, color: '#2563eb' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Получено', value: analyticsKpis.received, formatter: formatMoney, color: '#16a34a' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Не оплачено', value: analyticsKpis.unpaid, formatter: formatMoney, color: '#f97316' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Средний чек', value: analyticsKpis.averageCheck, formatter: formatMoney, color: '#8b5cf6' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Количество бронирований', value: analyticsKpis.bookings, color: '#0f172a' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Completed', value: analyticsKpis.completed, color: '#22c55e' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Cancelled', value: analyticsKpis.cancelled, color: '#ef4444' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Новые клиенты', value: analyticsKpis.newClients, color: '#06b6d4' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Повторные клиенты', value: analyticsKpis.repeatClients, color: '#14b8a6' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Cancellation rate', value: analyticsKpis.cancellationRate, formatter: (value) => `${value}%`, color: '#ef4444' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Недополученная выручка', value: analyticsKpis.missedRevenue, formatter: formatMoney, color: '#dc2626' })}
          </Col>
          <Col xs={24} md={12} xl={6}>
            {renderStatCard({ title: 'Будущая выручка', value: analyticsKpis.futureRevenue, formatter: formatMoney, color: '#0ea5e9' })}
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          {renderChartCard('Revenue over time', (
            <ResponsiveContainer>
              <AreaChart data={analyticsKpis.revenueOverTime}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip formatter={(value) => formatMoney(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revenueGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24} xl={12}>
          {renderChartCard('Bookings over time', (
            <ResponsiveContainer>
              <LineChart data={analyticsKpis.bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="bookings" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24} xl={12}>
          {renderChartCard('Booking by status', (
            <ResponsiveContainer>
              <RechartsBarChart data={analyticsKpis.bookingByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="bookings" radius={[10, 10, 0, 0]}>
                  {analyticsKpis.bookingByStatus.map((entry, index) => <Cell key={entry.name} fill={getChartColor(index)} />)}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24} xl={12}>
          {renderChartCard('Payment status', (
            <ResponsiveContainer>
              <PieChart>
                <Pie data={analyticsKpis.paymentStatus} dataKey="bookings" nameKey="name" outerRadius={96} label>
                  {analyticsKpis.paymentStatus.map((entry, index) => <Cell key={entry.name} fill={getChartColor(index)} />)}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24} xl={12}>
          {renderChartCard('Booking source', (
            <ResponsiveContainer>
              <RechartsBarChart data={analyticsKpis.bookingSource} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={130} />
                <RechartsTooltip />
                <Bar dataKey="bookings" fill="#8b5cf6" radius={[0, 10, 10, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24} xl={12}>
          {renderChartCard('Average booking value', (
            <ResponsiveContainer>
              <LineChart data={analyticsKpis.averageBookingValue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip formatter={(value) => formatMoney(value)} />
                <Line type="monotone" dataKey="average" stroke="#f97316" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24} xl={12}>
          {renderChartCard('Tour popularity', (
            <ResponsiveContainer>
              <RechartsBarChart data={analyticsKpis.tourPopularity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis />
                <RechartsTooltip formatter={(value) => formatMoney(value)} />
                <Bar dataKey="revenue" fill="#06b6d4" radius={[10, 10, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24} xl={12}>
          {renderChartCard('Property occupancy', (
            <ResponsiveContainer>
              <RechartsBarChart data={analyticsKpis.propertyOccupancy}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" interval={0} angle={-12} textAnchor="end" height={70} />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="occupancy" fill="#14b8a6" radius={[10, 10, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          ))}
        </Col>
        <Col xs={24}>
          {renderChartCard('Manager performance', (
            <ResponsiveContainer>
              <RechartsBarChart data={analyticsKpis.managerPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value, name) => (name === 'revenue' || name === 'received' ? formatMoney(value) : value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} />
                <Bar dataKey="received" fill="#22c55e" radius={[10, 10, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          ))}
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <Card className="tp-admin-card" title="Топ туров">
            <Table rowKey="name" size="small" pagination={false} dataSource={analyticsKpis.tourPopularity.slice(0, 5)} columns={[
              { title: 'Тур', dataIndex: 'name' },
              { title: 'Брони', dataIndex: 'bookings', width: 80 },
              { title: 'Выручка', dataIndex: 'revenue', render: formatMoney, width: 130 },
            ]} />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card className="tp-admin-card" title="Топ объектов">
            <Table rowKey="name" size="small" pagination={false} dataSource={analyticsKpis.propertyOccupancy.slice(0, 5)} columns={[
              { title: 'Объект', dataIndex: 'name' },
              { title: 'Загрузка', dataIndex: 'occupancy', render: (value) => `${value}%`, width: 95 },
              { title: 'Выручка', dataIndex: 'revenue', render: formatMoney, width: 130 },
            ]} />
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card className="tp-admin-card" title="Топ менеджеров">
            <Table rowKey="name" size="small" pagination={false} dataSource={analyticsKpis.managerPerformance.slice(0, 5)} columns={[
              { title: 'Менеджер', dataIndex: 'name' },
              { title: 'Брони', dataIndex: 'bookings', width: 80 },
              { title: 'Получено', dataIndex: 'received', render: formatMoney, width: 130 },
            ]} />
          </Card>
        </Col>
      </Row>

      <Card className="tp-admin-card" title="Бронирования периода">
        <Table
          rowKey="key"
          dataSource={analyticsKpis.rows}
          columns={bookingTableColumnsExtended}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 920 }}
        />
      </Card>

      {renderReports()}
    </Space>
  );

  const renderReports = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="tp-admin-card" title="Платежи">
            <Table
              {...crmTableProps}
              rowKey="key"
              dataSource={users.flatMap((user) => (user?.topUps || []).map((topUp, index) => ({
                key: `${user.id}-topup-${index}`,
                ...topUp,
                userName: user.name,
                userEmail: user.email,
              })))}
              columns={paymentsTableColumns}
              pagination={{ pageSize: 6, showSizeChanger: false }}
              scroll={{ x: 760 }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card className="tp-admin-card" title="Журнал бронирований">
            <Table
              {...crmTableProps}
              rowKey="key"
              dataSource={filteredBookings}
              columns={bookingTableColumnsExtended}
              pagination={{ pageSize: 6, showSizeChanger: false }}
              scroll={{ x: 920 }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const renderCompanies = () => {
    const companyStatusMeta = {
      pending: { color: 'gold', label: 'Pending' },
      active: { color: 'green', label: 'Active' },
      rejected: { color: 'red', label: 'Rejected' },
      blocked: { color: 'volcano', label: 'Blocked' },
      inactive: { color: 'default', label: 'Inactive' },
      archived: { color: 'default', label: 'Archived' },
    };
    const normalizedSearch = companyOnboardingSearch.trim().toLowerCase();
    const filteredCompanies = companies.filter((company) => {
      const matchesSearch = !normalizedSearch || [
        company.name,
        company.email,
        company.phone,
        company.city,
        company.address,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      if (!matchesSearch) return false;
      if (companyOnboardingStatusFilter === 'all') return true;
      if (companyOnboardingStatusFilter === 'new') {
        return (businessRequestsByCompany.get(Number(company.id)) || []).some((request) => request.status === 'pending');
      }
      if (companyOnboardingStatusFilter === 'expiring') {
        const meta = getSubscriptionHealthMeta(company);
        return company.subscriptionStatus === 'active' && meta.daysRemaining !== null && meta.daysRemaining <= 3;
      }
      return company.status === companyOnboardingStatusFilter || company.subscriptionStatus === companyOnboardingStatusFilter;
    });
    const filteredRequests = businessSubscriptionRequests.filter((request) => {
      const matchesSearch = !normalizedSearch || [
        request.companyName,
        request.ownerEmail,
        request.ownerName,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      if (!matchesSearch) return false;
      if (companyOnboardingStatusFilter === 'all') return true;
      if (companyOnboardingStatusFilter === 'new') return request.status === 'pending';
      return request.status === companyOnboardingStatusFilter;
    });
    const onboardingStats = [
      { label: 'Все компании', value: companies.length, color: 'default' },
      { label: 'Новые заявки', value: pendingBusinessSubscriptionRequests.length, color: 'blue' },
      { label: 'Активные', value: companies.filter((item) => item.status === 'active').length, color: 'green' },
      { label: 'Отклонённые', value: companies.filter((item) => item.status === 'rejected').length, color: 'red' },
      { label: 'Скоро истекают', value: expiringCompanies.length, color: 'orange' },
    ];
    const columns = [
      { title: 'Компания', dataIndex: 'name', render: (value, record) => (
        <Space>
          <Avatar src={safeSrc(record.logo)} icon={<BankOutlined />} />
          <div>
            <strong>{value}</strong>
            <div><Text type="secondary">{record.city || record.address || 'Адрес не указан'}</Text></div>
          </div>
        </Space>
      ) },
      { title: 'Email', dataIndex: 'email', width: 220 },
      {
        title: 'Instagram',
        dataIndex: 'instagramUrl',
        width: 180,
        render: (value) => (
          value ? <Button type="link" href={value} target="_blank" rel="noreferrer">Открыть</Button> : '—'
        ),
      },
      {
        title: 'Подписка',
        dataIndex: 'subscriptionStatus',
        width: 160,
        render: (status) => {
          const meta = SUBSCRIPTION_STATUS_META[status] || SUBSCRIPTION_STATUS_META.pending_payment;
          return <Tag color={meta.color}>{meta.label}</Tag>;
        },
      },
      {
        title: 'Биллинг',
        width: 190,
        render: (_, record) => {
          const meta = getSubscriptionHealthMeta(record);
          return (
            <Space orientation="vertical" size={4}>
              <Tag color={meta.color}>{meta.label}</Tag>
              <Text type="secondary">{record.subscriptionExpiresAt ? `До ${formatDate(record.subscriptionExpiresAt)}` : 'Дата не назначена'}</Text>
            </Space>
          );
        },
      },
      { title: 'До', dataIndex: 'subscriptionExpiresAt', width: 130, render: (value) => formatDate(value) },
      { title: 'Телефон', dataIndex: 'phone', width: 150 },
      { title: 'Статус', dataIndex: 'status', width: 130, render: (status) => {
        const meta = companyStatusMeta[status] || companyStatusMeta.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      } },
      { title: 'Описание', dataIndex: 'description', ellipsis: true, render: (value) => value || '—' },
      { title: 'Документы', dataIndex: 'documents', width: 130, render: (items) => (items?.length ? `${items.length} файл(ов)` : '—') },
      {
        title: 'Действия',
        width: 360,
        fixed: 'right',
        render: (_, record) => (
          <Space wrap size={8}>
            <Button size="small" onClick={() => openCompanyCenter(record.id)}>
              Центр
            </Button>
            <Button size="small" type="primary" icon={<CheckOutlined />} disabled={record.status === 'active'} onClick={() => updateCompanyStatus(record, 'active')}>
              Active
            </Button>
            <Button size="small" danger icon={<CloseOutlined />} disabled={record.status === 'rejected'} onClick={() => updateCompanyStatus(record, 'rejected')}>
              Reject
            </Button>
            <Button size="small" disabled={record.status === 'blocked'} onClick={() => updateCompanyStatus(record, 'blocked')}>
              Block
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <Card className="tp-admin-card">
        <div className="tp-admin-section-head">
          <div>
            <Text className="tp-admin-section-label">TravelPay Admin</Text>
            <Title level={3}>Компании</Title>
            <Paragraph>Проверяйте заявки тур-компаний и управляйте статусом доступа к TravelPay Business.</Paragraph>
          </div>
          <Space>
            <Badge count={companies.filter((item) => item.status === 'pending').length} showZero>
              <Tag color="gold">Pending</Tag>
            </Badge>
            <Badge count={pendingBusinessSubscriptionRequests.length} showZero>
              <Tag color="blue">Новые заявки</Tag>
            </Badge>
          </Space>
        </div>
        <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
          {onboardingStats.map((item) => (
            <Col xs={12} xl={6} key={item.label}>
              <Card size="small" className="tp-admin-inline-card">
                <Space orientation="vertical" size={4}>
                  <Text type="secondary">{item.label}</Text>
                  <div>
                    <Tag color={item.color}>{item.value}</Tag>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[12, 12]} style={{ marginBottom: 18 }}>
          <Col xs={24} xl={12}>
            <Input
              value={companyOnboardingSearch}
              onChange={(event) => setCompanyOnboardingSearch(event.target.value)}
              placeholder="Поиск по компании, email, телефону или владельцу"
              allowClear
            />
          </Col>
          <Col xs={24} xl={12}>
            <Segmented
              block
              value={companyOnboardingStatusFilter}
              onChange={setCompanyOnboardingStatusFilter}
              options={[
                { label: 'Все', value: 'all' },
                { label: 'Новые', value: 'new' },
                { label: 'Активные', value: 'active' },
                { label: 'Скоро истекают', value: 'expiring' },
                { label: 'Отклонённые', value: 'rejected' },
                { label: 'Проверка оплаты', value: 'payment_review' },
              ]}
            />
          </Col>
        </Row>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredCompanies}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 8 }}
        />
        <Divider />
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ marginBottom: 4 }}>Заявки на подключение и оплату</Title>
          <Text type="secondary">
            Здесь супер-админ видит новые регистрации компаний: договор, Instagram, паспорт владельца и чек оплаты подписки.
          </Text>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={filteredRequests}
          pagination={{ pageSize: 6 }}
          locale={{ emptyText: 'Пока нет новых заявок на подключение компаний' }}
          columns={[
            {
              title: 'Компания',
              dataIndex: 'companyName',
              render: (value, record) => (
                <div>
                  <strong>{value || 'TravelPay Business'}</strong>
                  <div><Text type="secondary">{record.ownerEmail || 'Email не указан'}</Text></div>
                </div>
              ),
            },
            {
              title: 'Instagram',
              dataIndex: 'instagramUrl',
              render: (value) => (
                value ? <Button type="link" href={value} target="_blank" rel="noreferrer">Открыть</Button> : '—'
              ),
            },
            {
              title: 'Паспорт',
              dataIndex: 'passportName',
              render: (value, record) => (
                record.passportImage
                  ? (
                    <Space size={4} wrap>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => openDocumentPreview({
                          title: 'Паспорт владельца',
                          name: value || 'passport',
                          url: record.passportImage,
                          type: record.passportType,
                        })}
                      >
                        Смотреть
                      </Button>
                      <Button type="link" href={record.passportImage} target="_blank" rel="noreferrer">
                        Открыть
                      </Button>
                    </Space>
                  )
                  : '—'
              ),
            },
            { title: 'Сумма', dataIndex: 'amount', render: (value) => formatMoney(value) },
            { title: 'Создано', dataIndex: 'createdAt', render: (value) => formatDateTime(value) },
            {
              title: 'Статус',
              dataIndex: 'status',
              render: (status) => {
                const meta = TOPUP_STATUS_META[status] || TOPUP_STATUS_META.pending;
                return <Tag color={meta.color}>{meta.label}</Tag>;
              },
            },
            {
              title: 'История заявки',
              width: 320,
              render: (_, record) => {
                const reviewerName = record.reviewedBy
                  ? (usersById.get(Number(record.reviewedBy))?.name || '')
                  : '';
                const timeline = buildBusinessSubscriptionTimelineEntries(record, reviewerName);

                return (
                  <div className="tp-admin-timeline">
                    {timeline.map((entry, index) => (
                      <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone}`}>
                        <div className="tp-admin-timeline__rail">
                          <span className="tp-admin-timeline__dot" />
                          {index < timeline.length - 1 ? <span className="tp-admin-timeline__line" /> : null}
                        </div>
                        <div className="tp-admin-timeline__content">
                          <div className="tp-admin-timeline__head">
                            <strong>{entry.title}</strong>
                            <Text type="secondary">{formatDateTime(entry.time)}</Text>
                          </div>
                          <Text type="secondary">{entry.description}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              },
            },
            {
              title: 'Комментарий admin',
              dataIndex: 'adminComment',
              width: 240,
              render: (value) => value || '—',
            },
            {
              title: 'Чек оплаты',
              dataIndex: 'receiptName',
              render: (value, record) => (
                record.receiptImage
                  ? (
                    <Space size={4} wrap>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => openDocumentPreview({
                          title: 'Чек оплаты подписки',
                          name: value || 'receipt',
                          url: record.receiptImage,
                          type: record.receiptType,
                        })}
                      >
                        Смотреть
                      </Button>
                      <Button type="link" href={record.receiptImage} target="_blank" rel="noreferrer">
                        Открыть
                      </Button>
                    </Space>
                  )
                  : '—'
              ),
            },
            {
              title: 'Действия',
              render: (_, record) => (
                <Space wrap size={8}>
                  <Button size="small" onClick={() => openCompanyCenter(record.companyId)}>
                    Центр
                  </Button>
                  <Button size="small" type="primary" disabled={record.status !== 'pending'} onClick={() => approveBusinessSubscription(record)}>
                    Подтвердить
                  </Button>
                  <Button size="small" danger disabled={record.status !== 'pending'} onClick={() => rejectBusinessSubscription(record)}>
                    Отклонить
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    );
  };

  const renderSettings = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={14}>
        <Card className="tp-admin-card" title="Компания">
          <div className="tp-admin-settings-grid">
            <div><Text type="secondary">Название</Text><strong>{currentCompany?.name || 'TravelPay Company'}</strong></div>
            <div><Text type="secondary">Адрес</Text><strong>{currentCompany?.address || '—'}</strong></div>
            <div><Text type="secondary">Телефон</Text><strong>{currentCompany?.phone || '—'}</strong></div>
            <div><Text type="secondary">Email</Text><strong>{currentCompany?.email || '—'}</strong></div>
            <div><Text type="secondary">Подписка</Text><strong>{currentCompanySubscriptionMeta.label}</strong></div>
            <div><Text type="secondary">Оплачено до</Text><strong>{formatDate(currentCompany?.subscriptionExpiresAt)}</strong></div>
          </div>
        </Card>
      </Col>
      <Col xs={24} xl={10}>
        <Card className="tp-admin-card" title="Профиль администратора">
          <div className="tp-admin-company-card">
            <Avatar size={60} src={safeSrc(sessionUser?.avatar)} icon={<UserOutlined />} />
            <div>
              <Title level={5}>{sessionUser?.name || 'Admin'}</Title>
              <Text type="secondary">{sessionUser?.email || '—'}</Text>
              <div style={{ marginTop: 8 }}><Tag color="blue">{sessionUser?.role || 'user'}</Tag></div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );

  if (businessMode && !loading && currentCompany && (currentCompany.status !== 'active' || currentCompany.subscriptionStatus !== 'active')) {
    const isRejected = currentCompany.status === 'rejected' || currentCompany.subscriptionStatus === 'rejected';
    const isPaymentReview = currentCompany.subscriptionStatus === 'payment_review';
    const isSubscriptionRequired = ['pending_payment', 'expired'].includes(currentCompany.subscriptionStatus);
    const isExpired = currentCompany.subscriptionStatus === 'expired';
    return (
      <div className="tp-admin-page">
        <Layout className="tp-admin-layout">
          <Layout className="tp-admin-main">
            <Content className="tp-admin-content">
              <Card className="tp-admin-card">
                <Space orientation="vertical" size={18} style={{ width: '100%' }}>
                  <Result
                    status={isRejected ? 'warning' : 'info'}
                    title={isRejected
                      ? 'Заявка или оплата подписки отклонена'
                      : (isPaymentReview
                        ? 'Оплата подписки на проверке'
                        : (isSubscriptionRequired ? 'Нужно оплатить подписку' : 'Компания ожидает подтверждения'))}
                    subTitle={isRejected
                      ? (currentCompany.rejectionReason || currentBusinessSubscriptionRequest?.adminComment || 'Свяжитесь с администратором TravelPay.')
                      : (isPaymentReview
                        ? 'Чек уже отправлен. После проверки супер-администратором доступ откроется автоматически.'
                        : (isSubscriptionRequired
                          ? `Доступ к Business открывается после оплаты месячной подписки. Статус: ${currentCompanySubscriptionMeta.label}.`
                          : 'Заявка компании отправлена. После проверки и оплаты подписки вы сможете публиковать туры.'))}
                    extra={[
                      <Button key="business" onClick={() => navigate('/business')}>TravelPay Business</Button>,
                      <Button key="logout" type="primary" onClick={handleLogout}>Выйти</Button>,
                    ]}
                  />

                  {currentBusinessSubscriptionRequest && (
                    <Row gutter={[16, 16]}>
                      <Col xs={24} xl={14}>
                        <Card size="small" className="tp-admin-inline-card" title="История заявки">
                          <div className="tp-admin-timeline">
                            {currentBusinessRequestTimeline.map((entry, index) => (
                              <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone}`}>
                                <div className="tp-admin-timeline__rail">
                                  <span className="tp-admin-timeline__dot" />
                                  {index < currentBusinessRequestTimeline.length - 1 ? <span className="tp-admin-timeline__line" /> : null}
                                </div>
                                <div className="tp-admin-timeline__content">
                                  <div className="tp-admin-timeline__head">
                                    <strong>{entry.title}</strong>
                                    <Text type="secondary">{formatDateTime(entry.time)}</Text>
                                  </div>
                                  <Text type="secondary">{entry.description}</Text>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} xl={10}>
                        <Card size="small" className="tp-admin-inline-card" title="Комментарий супер-админа">
                          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                            <div>
                              <Text type="secondary">Комментарий</Text>
                              <div><strong>{currentBusinessSubscriptionRequest.adminComment || currentCompany.rejectionReason || 'Комментарий появится после решения супер-админа.'}</strong></div>
                            </div>
                            <div>
                              <Text type="secondary">Статус</Text>
                              <div>
                                <Tag color={(TOPUP_STATUS_META[currentBusinessSubscriptionRequest.status] || TOPUP_STATUS_META.pending).color}>
                                  {(TOPUP_STATUS_META[currentBusinessSubscriptionRequest.status] || TOPUP_STATUS_META.pending).label}
                                </Tag>
                              </div>
                            </div>
                            {isExpired && (
                              <div>
                                <Text type="secondary">Подписка действовала до</Text>
                                <div><strong>{formatDate(currentCompany.subscriptionExpiresAt)}</strong></div>
                              </div>
                            )}
                            <div>
                              <Text type="secondary">Проверил</Text>
                              <div><strong>{currentBusinessRequestReviewerName || 'Ожидает решения'}</strong></div>
                            </div>
                          </Space>
                        </Card>
                      </Col>
                    </Row>
                  )}
                </Space>
              </Card>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }

  return (
    <div className="tp-admin-page">
      <Layout className="tp-admin-layout">
        {isDesktop ? (
          <Sider
            width={248}
            collapsedWidth={80}
            collapsed={collapsed}
            trigger={null}
            className="tp-admin-sider"
          >
            {sidebar}
          </Sider>
        ) : (
          <Drawer
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            placement="left"
            width={300}
            className="tp-admin-drawer"
          >
            {sidebar}
          </Drawer>
        )}

        <Layout className="tp-admin-main">
          <AdminTopbar
            currentTab={currentTab}
            branchText={headerBranchText}
            isDesktop={isDesktop}
            businessMode={businessMode}
            onMenu={() => (isDesktop ? setCollapsed((value) => !value) : setMenuOpen(true))}
            onCopyLink={copyPortalLink}
            theme={theme}
            onThemeChange={setTheme}
            onOpenSite={() => navigate('/')}
            user={liveSessionUser}
            company={currentCompany}
            onLogout={handleLogout}
            notifications={userNotifications}
            notificationsLoading={loading}
            notificationsError={notificationsError}
            onMarkRead={markNotificationRead}
            pendingPayments={prepaymentReviewCount + pendingBusinessSubscriptionRequests.length + pendingTopups.length}
            onNavigate={navigate}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            paymentsPath={businessMode ? '/business/payments' : '/admin/payments'}
            notificationsPath={businessMode ? '/business/dashboard' : '/admin/home'}
          />
          <Header className="tp-admin-header tp-admin-header--legacy-hidden">
            <div className="tp-admin-header__left">
              <Button
                icon={<MenuOutlined />}
                onClick={() => (isDesktop ? setCollapsed((value) => !value) : setMenuOpen(true))}
                className="tp-admin-header__menu"
              />
              <div className="tp-admin-header__branch">
                <Text className="tp-admin-section-label">Филиал / компания</Text>
                <strong>{headerBranchText}</strong>
              </div>
            </div>

            <div className="tp-admin-header__center">
              <Button icon={<LinkOutlined />} onClick={copyPortalLink}>
                Ваша ссылка
              </Button>
            </div>

            <div className="tp-admin-header__right">
              <div className="tp-admin-theme-toggle">
                <Switch
                  checked={theme === 'dark'}
                  onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  checkedChildren={<MoonOutlined />}
                  unCheckedChildren={<SunOutlined />}
                />
                <span>{theme === 'dark' ? 'Темная' : 'Светлая'}</span>
              </div>
              <Tooltip title="Открыть сайт">
                <Button icon={<EyeOutlined />} onClick={() => navigate('/')} />
              </Tooltip>
              <div className="tp-admin-profile-chip">
                <Avatar src={safeSrc(sessionUser?.avatar)} icon={<UserOutlined />} />
                <div>
                  <strong>{sessionUser?.name || 'Admin'}</strong>
                  <span>{currentCompany?.name || 'TravelPay'}</span>
                </div>
              </div>
            </div>
          </Header>

          <Content className="tp-admin-content">
            {messageState && (
              <Alert
                type={messageState.type}
                message={messageState.text}
                showIcon
                closable
                onClose={() => setMessageState(null)}
                className="tp-admin-alert"
              />
            )}

            {currentTab === 'home' && (businessMode ? renderBusinessHome() : renderDashboard())}
            {(currentTab === 'tours' || currentTab === 'accommodations') && renderCatalog()}
            {currentTab === 'properties' && renderProperties()}
            {(currentTab === 'bookings' || currentTab === 'calendar' || currentTab === 'schedule') && renderBookingsModern()}
            {currentTab === 'clients' && renderClients()}
            {currentTab === 'company' && renderBusinessProfile()}
            {currentTab === 'team' && <BusinessManagersPage embedded />}
            {currentTab === 'tasks' && renderBusinessTasksV2()}
            {currentTab === 'savings' && renderSavings()}
            {currentTab === 'reports' && renderAnalyticsDashboard()}
            {currentTab === 'companies' && renderCompanies()}
            {currentTab === 'notifications' && renderNotificationsCard()}
            {currentTab === 'activity' && renderActivityLog()}
            {currentTab === 'settings' && (businessMode ? <BusinessPaymentSettingsPage embedded /> : renderSettings())}
            {currentTab === 'support' && renderBusinessSupport()}
            {currentTab === 'payments' && <BusinessPaymentsPage embedded />}
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title="Центр онбординга компании"
        open={Boolean(companyCenterCompany)}
        onClose={closeCompanyCenter}
        width={isDesktop ? 760 : '100%'}
        className="tp-admin-form-drawer"
        extra={companyCenterCompany ? <Tag color="blue">{companyCenterCompany.name}</Tag> : null}
      >
        {companyCenterCompany && (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" className="tp-admin-inline-card" title="Профиль компании">
              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Text type="secondary">Компания</Text>
                  <div><strong>{companyCenterCompany.name}</strong></div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Email</Text>
                  <div><strong>{companyCenterCompany.email || '—'}</strong></div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Телефон</Text>
                  <div><strong>{companyCenterCompany.phone || '—'}</strong></div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Подписка</Text>
                  <div>
                    <Tag color={(SUBSCRIPTION_STATUS_META[companyCenterCompany.subscriptionStatus] || SUBSCRIPTION_STATUS_META.pending_payment).color}>
                      {(SUBSCRIPTION_STATUS_META[companyCenterCompany.subscriptionStatus] || SUBSCRIPTION_STATUS_META.pending_payment).label}
                    </Tag>
                  </div>
                </Col>
                <Col xs={24}>
                  <Text type="secondary">Причина / комментарий</Text>
                  <div><strong>{companyCenterCompany.rejectionReason || 'Компания активна или причина не указана.'}</strong></div>
                </Col>
                <Col xs={24}>
                  <Text type="secondary">Состояние подписки</Text>
                  <div>
                    <Tag color={getSubscriptionHealthMeta(companyCenterCompany).color}>
                      {getSubscriptionHealthMeta(companyCenterCompany).label}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            <Card size="small" className="tp-admin-inline-card" title="История подач компании">
              {companyCenterRequests.length ? (
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  {companyCenterRequests.map((request) => {
                    const reviewerName = request.reviewedBy
                      ? (usersById.get(Number(request.reviewedBy))?.name || '')
                      : '';
                    const timeline = buildBusinessSubscriptionTimelineEntries(request, reviewerName);

                    return (
                      <Card key={request.id} size="small" className="tp-admin-inline-card">
                        <div className="tp-admin-section-head tp-admin-section-head--tight">
                          <div>
                            <strong>Подача #{request.id}</strong>
                            <div><Text type="secondary">{formatDateTime(request.createdAt)}</Text></div>
                          </div>
                          <Space wrap>
                            <Tag color={(TOPUP_STATUS_META[request.status] || TOPUP_STATUS_META.pending).color}>
                              {(TOPUP_STATUS_META[request.status] || TOPUP_STATUS_META.pending).label}
                            </Tag>
                            {request.status === 'pending' && (
                              <>
                                <Button size="small" type="primary" onClick={() => approveBusinessSubscription(request)}>Подтвердить</Button>
                                <Button size="small" danger onClick={() => rejectBusinessSubscription(request)}>Отклонить</Button>
                              </>
                            )}
                          </Space>
                        </div>
                        <Row gutter={[12, 12]}>
                          <Col xs={24} xl={13}>
                            <div className="tp-admin-timeline">
                              {timeline.map((entry, index) => (
                                <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone}`}>
                                  <div className="tp-admin-timeline__rail">
                                    <span className="tp-admin-timeline__dot" />
                                    {index < timeline.length - 1 ? <span className="tp-admin-timeline__line" /> : null}
                                  </div>
                                  <div className="tp-admin-timeline__content">
                                    <div className="tp-admin-timeline__head">
                                      <strong>{entry.title}</strong>
                                      <Text type="secondary">{formatDateTime(entry.time)}</Text>
                                    </div>
                                    <Text type="secondary">{entry.description}</Text>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </Col>
                          <Col xs={24} xl={11}>
                            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                              <div>
                                <Text type="secondary">Instagram</Text>
                                <div>
                                  {request.instagramUrl ? <Button type="link" href={request.instagramUrl} target="_blank" rel="noreferrer" style={{ paddingInline: 0 }}>Открыть Instagram</Button> : <strong>—</strong>}
                                </div>
                              </div>
                              <div>
                                <Text type="secondary">Комментарий admin</Text>
                                <div><strong>{request.adminComment || 'Пока без комментария.'}</strong></div>
                              </div>
                              <Space wrap>
                                {request.passportImage && (
                                  <Button
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => openDocumentPreview({
                                      title: 'Паспорт владельца',
                                      name: request.passportName || 'passport',
                                      url: request.passportImage,
                                      type: request.passportType,
                                    })}
                                  >
                                    Паспорт
                                  </Button>
                                )}
                                {request.receiptImage && (
                                  <Button
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={() => openDocumentPreview({
                                      title: 'Чек оплаты подписки',
                                      name: request.receiptName || 'receipt',
                                      url: request.receiptImage,
                                      type: request.receiptType,
                                    })}
                                  >
                                    Чек
                                  </Button>
                                )}
                              </Space>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    );
                  })}
                </Space>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="У компании пока нет заявок на подключение" />
              )}
            </Card>

            <Card size="small" className="tp-admin-inline-card" title="История оплат и продлений">
              <Table
                rowKey="id"
                size="small"
                pagination={false}
                dataSource={companyCenterRequests}
                locale={{ emptyText: 'История оплат пока пуста' }}
                columns={[
                  { title: 'Дата', dataIndex: 'createdAt', render: (value) => formatDateTime(value) },
                  { title: 'Сумма', dataIndex: 'amount', render: (value) => formatMoney(value) },
                  {
                    title: 'Статус',
                    dataIndex: 'status',
                    render: (value) => {
                      const meta = TOPUP_STATUS_META[value] || TOPUP_STATUS_META.pending;
                      return <Tag color={meta.color}>{meta.label}</Tag>;
                    },
                  },
                  { title: 'Комментарий', dataIndex: 'adminComment', render: (value) => value || '—' },
                ]}
              />
            </Card>
          </Space>
        )}
      </Drawer>

      <Drawer
        title={activeDepartureOpsCard ? `Departure · ${activeDepartureOpsCard.title}` : 'Departure operations'}
        open={Boolean(activeDepartureOpsCard)}
        onClose={() => setDepartureOpsDrawerItem(null)}
        width={isDesktop ? 780 : '100%'}
        className="tp-admin-form-drawer"
        extra={activeDepartureOpsCard ? <Tag color={activeDepartureOpsCard.statusColor}>{activeDepartureOpsCard.statusLabel}</Tag> : null}
      >
        {activeDepartureOpsCard && (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" className="tp-admin-inline-card">
              <div className="tp-admin-calendar-detail-grid">
                <div><Text type="secondary">Date</Text><strong>{activeDepartureOpsCard.date.locale('ru').format('D MMMM YYYY')}</strong></div>
                <div><Text type="secondary">Time</Text><strong>{activeDepartureOpsCard.time}</strong></div>
                <div><Text type="secondary">Capacity</Text><strong>{activeDepartureOpsCard.bookedSeats} / {activeDepartureOpsCard.totalSeats}</strong></div>
                <div><Text type="secondary">Available</Text><strong>{activeDepartureOpsCard.remainingSeats}</strong></div>
                <div><Text type="secondary">Guide</Text><strong>{activeDepartureOpsCard.slot.guide || '—'}</strong></div>
                <div><Text type="secondary">Driver</Text><strong>{activeDepartureOpsCard.slot.driver || '—'}</strong></div>
                <div><Text type="secondary">Vehicle</Text><strong>{activeDepartureOpsCard.slot.vehicle || '—'}</strong></div>
                <div><Text type="secondary">Meeting point</Text><strong>{activeDepartureOpsCard.slot.meetingPoint || '—'}</strong></div>
              </div>
            </Card>

            <Card size="small" className="tp-admin-inline-card" title="Участники" extra={<Tag>{departureParticipantRows.length}</Tag>}>
              <Table
                size="small"
                pagination={false}
                rowKey="key"
                scroll={{ x: 920 }}
                dataSource={departureParticipantRows}
                columns={[
                  { title: 'Имя', dataIndex: 'name', width: 170 },
                  { title: 'Телефон', dataIndex: 'phone', width: 140 },
                  { title: 'Взрослый/ребёнок', dataIndex: 'type', width: 150 },
                  { title: 'Оплата', width: 150, render: (_, record) => <Tag color={record.paymentColor}>{record.paymentLabel}</Tag> },
                  { title: 'Pickup', dataIndex: 'pickup', width: 160, render: (value) => value || '—' },
                  { title: 'Комментарий', dataIndex: 'comment', width: 180, render: (value) => value || '—' },
                  { title: 'Emergency contact', dataIndex: 'emergencyContact', width: 170, render: (value) => value || '—' },
                ]}
                locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Участников пока нет" /> }}
              />
            </Card>

            <Card
              size="small"
              className="tp-admin-inline-card"
              title="Tour operations checklist"
              extra={<Tag color={activeDepartureOpsCard.checklistDone === TOUR_OPERATION_CHECKLIST_ITEMS.length ? 'green' : 'purple'}>{activeDepartureOpsCard.checklistDone}/{TOUR_OPERATION_CHECKLIST_ITEMS.length}</Tag>}
            >
              <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                {TOUR_OPERATION_CHECKLIST_ITEMS.map((item) => (
                  <Checkbox
                    key={item.key}
                    checked={Boolean(activeDepartureOpsCard.operationsChecklist?.[item.key])}
                    disabled={departureOpsSaving}
                    onChange={(event) => saveDepartureOperationsChecklist(item.key, event.target.checked)}
                  >
                    {item.label}
                  </Checkbox>
                ))}
              </Space>
            </Card>

            <Space wrap>
              <Button onClick={() => {
                setCalendarResource('tours');
                setCalendarDate(activeDepartureOpsCard.date);
                navigate(`${basePath}/schedule?date=${activeDepartureOpsCard.date.format('YYYY-MM-DD')}&view=day`);
              }}>
                Open in schedule
              </Button>
              <Button type="primary" onClick={() => startEditTour(activeDepartureOpsCard.tour)}>
                Edit tour
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>

      <Drawer
        title={propertyDetailItem?.title || 'Property'}
        open={Boolean(propertyDetailItem)}
        onClose={closePropertyDetails}
        width={isDesktop ? 820 : '100%'}
        className="tp-admin-form-drawer tp-admin-property-drawer"
      >
        {propertyDetailItem && (
          <Space orientation="vertical" size={18} style={{ width: '100%' }}>
            <div className="tp-admin-property-detail-hero">
              <div className="tp-admin-property-detail-hero__image">
                {propertyDetailItem.image ? <AppImage src={propertyDetailItem.image} alt={propertyDetailItem.title} /> : <HomeOutlined />}
              </div>
              <div>
                <Title level={3}>{propertyDetailItem.title}</Title>
                <Text>{propertyDetailItem.location || propertyDetailItem.companyName || 'Кыргызстан'}</Text>
                <Space wrap style={{ marginTop: 10 }}>
                  <Tag>{propertyDetailItem.type}</Tag>
                  <Tag color="blue">{propertyDetailItem.units.length} unit</Tag>
                  <Tag color={propertyDetailItem.status === 'available' ? 'green' : 'gold'}>{propertyDetailItem.status}</Tag>
                </Space>
              </div>
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Загрузка" value={propertyDetailItem.occupancy} suffix="%" /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Доход" value={propertyDetailItem.revenue} formatter={(value) => formatMoney(value)} /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Брони" value={propertyDetailItem.bookingsCount} /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Средний чек" value={propertyDetailItem.avgPrice} formatter={(value) => formatMoney(value)} /></Card></Col>
            </Row>

            <Tabs
              items={[
                {
                  key: 'overview',
                  label: 'Обзор',
                  children: (
                    <div className="tp-admin-property-unit-grid">
                      {propertyDetailItem.units.map((unit) => (
                        <Card key={unit.id} size="small" title={unit.title || unit.name} extra={<Tag>{unit.status}</Tag>}>
                          <div className="tp-admin-client-overview">
                            <div><Text type="secondary">Capacity</Text><strong>{unit.capacity} гостей</strong></div>
                            <div><Text type="secondary">Цена</Text><strong>{formatMoney(unit.pricePerNight)}</strong></div>
                            <div><Text type="secondary">Check-in</Text><strong>{unit.defaultCheckInTime}</strong></div>
                            <div><Text type="secondary">Check-out</Text><strong>{unit.defaultCheckOutTime}</strong></div>
                            <div><Text type="secondary">Загрузка</Text><strong>{unit.metrics.occupancy}%</strong></div>
                            <div><Text type="secondary">Доход</Text><strong>{formatMoney(unit.metrics.revenue)}</strong></div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ),
                },
                {
                  key: 'calendar',
                  label: 'Календарь',
                  children: (
                    <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                      <div className="tp-admin-property-availability">
                        <div className="tp-admin-property-availability__head">
                          <span />
                          {propertyDateRange.map((date) => <strong key={date.format('YYYY-MM-DD')}>{date.format('DD')}</strong>)}
                        </div>
                        {propertyDetailItem.units.map((unit) => (
                          <div key={unit.id} className="tp-admin-property-availability__row">
                            <strong>{unit.title || unit.name}</strong>
                            {renderUnitAvailabilityStrip(unit)}
                          </div>
                        ))}
                      </div>
                      <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={propertyDetailItem.units.flatMap((unit) => (unit.blockedDates || []).map((block) => ({ ...block, unitTitle: unit.title || unit.name })))}
                        locale={{ emptyText: 'Закрытых дат нет' }}
                        columns={[
                          { title: 'Unit', dataIndex: 'unitTitle' },
                          { title: 'Период', render: (_, block) => `${formatDate(block.startDate)} → ${formatDate(block.endDate)}` },
                          { title: 'Причина', dataIndex: 'reason', render: (value) => PROPERTY_BLOCK_REASONS.find((item) => item.value === value)?.label || value },
                          { title: 'Комментарий', dataIndex: 'comment', render: (value) => value || '—' },
                        ]}
                      />
                    </Space>
                  ),
                },
                {
                  key: 'bookings',
                  label: 'Бронирования',
                  children: (
          <Table
            {...crmTableProps}
            rowKey="key"
                      size="small"
                      pagination={false}
                      dataSource={propertyDetailItem.units.flatMap((unit) => unit.metrics.bookings.map((booking) => ({ ...booking, unitTitle: unit.title || unit.name })))}
                      columns={[
                        { title: 'Unit', dataIndex: 'unitTitle' },
                        { title: 'Клиент', dataIndex: 'clientName' },
                        { title: 'Даты', render: (_, booking) => `${formatDate(booking.checkInDate)} → ${formatDate(booking.checkOutDate)}` },
                        { title: 'Сумма', dataIndex: 'amount', render: formatMoney },
                        { title: 'Статус', render: (_, booking) => renderBookingStatusChip(booking) },
                      ]}
                    />
                  ),
                },
                {
                  key: 'prices',
                  label: 'Цены',
                  children: (
                    <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                      <div className="tp-admin-pricing-calendar">
                        <div className="tp-admin-pricing-calendar__head">
                          <span>Unit</span>
                          {propertyDateRange.map((date) => <strong key={date.format('YYYY-MM-DD')}>{date.format('DD.MM')}</strong>)}
                        </div>
                        {propertyDetailItem.units.map((unit) => (
                          <div key={unit.id} className="tp-admin-pricing-calendar__row">
                            <strong>{unit.title || unit.name}</strong>
                            {propertyDateRange.map((date) => {
                              const price = getUnitPriceForDate(unit, date);
                              return (
                                <span key={date.format('YYYY-MM-DD')}>
                                  <b>{formatMoney(price.price)}</b>
                                  <small>{price.minimumStay ? `min ${price.minimumStay} ноч.` : price.label}</small>
                                </span>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      <Table
                        rowKey="id"
                        size="small"
                        pagination={false}
                        dataSource={propertyDetailItem.units.flatMap((unit) => (unit.pricingRules || []).map((rule) => ({ ...rule, unitTitle: unit.title || unit.name })))}
                        columns={[
                          { title: 'Unit', dataIndex: 'unitTitle' },
                          { title: 'Тип', dataIndex: 'type', render: (value) => PROPERTY_PRICING_RULE_TYPES.find((item) => item.value === value)?.label || value },
                          { title: 'Период', render: (_, rule) => [formatDate(rule.startDate), formatDate(rule.endDate)].filter((value) => value !== '—').join(' → ') || 'Всегда' },
                          { title: 'Цена', dataIndex: 'price', render: formatMoney },
                          { title: 'Discount', dataIndex: 'discount', render: (value) => value ? `${value}%` : '—' },
                          { title: 'Minimum stay', dataIndex: 'minimumStay', render: (value) => value ? `${value} ноч.` : '—' },
                        ]}
                      />
                    </Space>
                  ),
                },
                { key: 'photos', label: 'Фотографии', children: <div className="tp-admin-property-photo-grid">{propertyDetailItem.units.flatMap((unit) => unit.images || []).map((image, index) => <AppImage key={`${image}-${index}`} src={image} alt="Property" />)}</div> },
                { key: 'amenities', label: 'Удобства', children: <Space wrap>{Array.from(new Set(propertyDetailItem.units.flatMap((unit) => unit.amenities || []))).map((amenity) => <Tag key={amenity}>{amenity}</Tag>)}</Space> },
                { key: 'reviews', label: 'Отзывы', children: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Отзывы объектов подключим после связи с публичными отзывами" /> },
                { key: 'history', label: 'История', children: <div className="tp-admin-timeline">{propertyDetailItem.units.flatMap((unit) => unit.metrics.bookings).slice(0, 12).map((booking, index) => <div key={booking.key} className="tp-admin-timeline__item is-info"><div className="tp-admin-timeline__rail"><span className="tp-admin-timeline__dot" />{index < 11 ? <span className="tp-admin-timeline__line" /> : null}</div><div className="tp-admin-timeline__content"><div className="tp-admin-timeline__head"><strong>{booking.clientName || 'Бронирование'}</strong><Text type="secondary">{formatDateTime(booking.createdAt || booking.bookingDate)}</Text></div><Text type="secondary">{booking.stayTitle || booking.comment || 'История объекта'}</Text></div></div>)}</div> },
                { key: 'settings', label: 'Настройки', children: <Button onClick={() => propertyDetailItem.units[0] && startEditAccommodation(propertyDetailItem.units[0])}>Редактировать первый Unit</Button> },
              ]}
            />
          </Space>
        )}
      </Drawer>

      <Drawer
        title={clientDrawerItem ? `Клиент #${clientDrawerItem.id}` : 'Клиент'}
        open={Boolean(clientDrawerItem)}
        onClose={closeClientDetails}
        width={isDesktop ? 720 : '100%'}
        className="tp-admin-form-drawer tp-admin-client-drawer"
      >
        {clientDrawerItem && (
          <Space orientation="vertical" size={18} style={{ width: '100%' }}>
            <div className="tp-admin-client-card-hero">
              <Avatar size={58} icon={<UserOutlined />} src={safeSrc(clientDrawerItem.avatar || clientDrawerItem.photo)} />
              <div>
                <Title level={3}>{clientDrawerItem.name || 'Клиент TravelPay'}</Title>
                <Text>{clientDrawerItem.phone || clientDrawerItem.email || 'Контакт не указан'}</Text>
                <small>Клиент с: {formatDate(clientDrawerItem.clientSince || clientDrawerItem.createdAt)}</small>
              </div>
              <Tag color={clientDrawerItem.clientStatus === 'vip' ? 'gold' : clientDrawerItem.unpaidCount > 0 ? 'red' : 'blue'}>
                {clientDrawerItem.clientLabel}
              </Tag>
            </div>

            <Row gutter={[12, 12]}>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Бронирований" value={clientDrawerItem.bookingsCount} /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Потрачено" value={clientDrawerItem.spent} formatter={(value) => formatMoney(value)} /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Туры" value={clientDrawerItem.tourCount} /></Card></Col>
              <Col xs={12} md={6}><Card size="small"><Statistic title="Коттеджи" value={clientDrawerItem.stayCount} /></Card></Col>
            </Row>

            <Card size="small" className="tp-admin-client-wallet-card">
              <div>
                <Text type="secondary">Баланс TravelPay</Text>
                <strong>{formatMoney(clientDrawerItem.walletBalance)}</strong>
              </div>
              <Space wrap>
                <Button onClick={() => navigate('/admin/savings')}>Пополнить</Button>
                <Button type="primary" onClick={() => openQuickBookingDrawer({ date: calendarDate })}>Использовать</Button>
              </Space>
            </Card>

            <Card size="small" title="Метки клиента" className="tp-admin-inline-card">
              <Select
                mode="tags"
                style={{ width: '100%' }}
                value={clientDrawerItem.clientTags || []}
                options={CLIENT_TAG_OPTIONS.map((tag) => ({ value: tag, label: tag }))}
                placeholder="VIP, Семья, Corporate..."
                onChange={(tags) => saveClientTags(clientDrawerItem, tags)}
              />
            </Card>

            <Tabs
              items={[
                {
                  key: 'overview',
                  label: 'Обзор',
                  children: (
                    <div className="tp-admin-client-overview">
                      <div><Text type="secondary">Телефон</Text><strong>{clientDrawerItem.phone || '—'}</strong></div>
                      <div><Text type="secondary">Email</Text><strong>{clientDrawerItem.email || '—'}</strong></div>
                      <div><Text type="secondary">Менеджер</Text><strong>{clientDrawerItem.manager || '—'}</strong></div>
                      <div><Text type="secondary">Источник</Text><strong>{clientDrawerItem.sourceLabel || '—'}</strong></div>
                      <div><Text type="secondary">Отмены</Text><strong>{clientDrawerItem.cancelledCount}</strong></div>
                      <div><Text type="secondary">Неоплаченные</Text><strong>{clientDrawerItem.unpaidCount}</strong></div>
                    </div>
                  ),
                },
                {
                  key: 'bookings',
                  label: 'Бронирования',
                  children: (
                    <Table
                      rowKey="key"
                      size="small"
                      pagination={false}
                      dataSource={clientDrawerItem.bookings}
                      columns={[
                        { title: 'Услуга', render: (_, booking) => booking.tourTitle || booking.stayTitle || '—' },
                        { title: 'Дата', render: (_, booking) => formatDate(booking.bookingDate || booking.travelDate || booking.checkInDate) },
                        { title: 'Сумма', dataIndex: 'amount', render: formatMoney },
                        { title: 'Статус', render: (_, booking) => renderBookingStatusChip(booking) },
                      ]}
                    />
                  ),
                },
                {
                  key: 'payments',
                  label: 'Оплаты',
                  children: (
                    <Table
                      rowKey="key"
                      size="small"
                      pagination={false}
                      dataSource={clientDrawerItem.walletHistory}
                      columns={[
                        { title: 'Дата', dataIndex: 'date', render: formatDateTime },
                        { title: 'Тип', dataIndex: 'type' },
                        { title: 'Описание', dataIndex: 'description' },
                        { title: 'Сумма', dataIndex: 'amount', render: formatMoney },
                      ]}
                    />
                  ),
                },
                {
                  key: 'trips',
                  label: 'Поездки',
                  children: clientDrawerItem.bookings.length ? (
                    <div className="tp-admin-client-trip-list">
                      {clientDrawerItem.bookings.map((booking) => (
                        <button key={booking.key} type="button" onClick={() => openCalendarItemDetails(booking)}>
                          <strong>{booking.tourTitle || booking.stayTitle || 'Бронирование'}</strong>
                          <span>{formatDate(booking.bookingDate || booking.travelDate || booking.checkInDate)} · {formatMoney(booking.amount)}</span>
                        </button>
                      ))}
                    </div>
                  ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Поездок пока нет" />,
                },
                {
                  key: 'files',
                  label: 'Файлы',
                  children: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Файлы клиента появятся после подключения документов к броням" />,
                },
                {
                  key: 'comments',
                  label: 'Комментарии',
                  children: (
                    <Space orientation="vertical" style={{ width: '100%' }}>
                      {clientDrawerItem.bookings.filter((booking) => booking.comment).map((booking) => (
                        <Card key={booking.key} size="small">
                          <Text type="secondary">{booking.tourTitle || booking.stayTitle}</Text>
                          <Paragraph style={{ marginBottom: 0 }}>{booking.comment}</Paragraph>
                        </Card>
                      ))}
                      {!clientDrawerItem.bookings.some((booking) => booking.comment) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Комментариев пока нет" />}
                    </Space>
                  ),
                },
                {
                  key: 'communications',
                  label: 'Коммуникации',
                  children: clientDrawerItem.communicationHistory?.length ? (
                    <div className="tp-admin-timeline">
                      {clientDrawerItem.communicationHistory.slice(0, 24).map((entry, index) => (
                        <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone || 'info'}`}>
                          <div className="tp-admin-timeline__rail">
                            <span className="tp-admin-timeline__dot" />
                            {index < Math.min(clientDrawerItem.communicationHistory.length, 24) - 1 ? <span className="tp-admin-timeline__line" /> : null}
                          </div>
                          <div className="tp-admin-timeline__content">
                            <div className="tp-admin-timeline__head">
                              <strong>{entry.title}</strong>
                              <Text type="secondary">{formatDateTime(entry.date)}</Text>
                            </div>
                            <Space size={8} wrap>
                              <Tag>{entry.channel}</Tag>
                              <Text type="secondary">{entry.description}</Text>
                            </Space>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="История коммуникаций пока пуста" />,
                },
                {
                  key: 'history',
                  label: 'История',
                  children: (
                    <div className="tp-admin-timeline">
                      {clientDrawerItem.timeline.slice(0, 20).map((entry, index) => (
                        <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone || 'info'}`}>
                          <div className="tp-admin-timeline__rail">
                            <span className="tp-admin-timeline__dot" />
                            {index < Math.min(clientDrawerItem.timeline.length, 20) - 1 ? <span className="tp-admin-timeline__line" /> : null}
                          </div>
                          <div className="tp-admin-timeline__content">
                            <div className="tp-admin-timeline__head">
                              <strong>{entry.title}</strong>
                              <Text type="secondary">{formatDateTime(entry.date)}</Text>
                            </div>
                            <Text type="secondary">{entry.description}</Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          </Space>
        )}
      </Drawer>

      <Drawer
        title="Новое бронирование"
        open={quickBookingDrawerOpen}
        onClose={closeQuickBookingDrawer}
        width={isDesktop ? 520 : '100%'}
        className="tp-admin-form-drawer tp-admin-calendar-create-drawer"
        footer={(
          <div className="tp-admin-drawer-footer">
            <Button onClick={closeQuickBookingDrawer} disabled={quickBookingSaving}>Отмена</Button>
            <Button type="primary" loading={quickBookingSaving} disabled={quickBookingAvailability.hasConflict} onClick={() => quickBookingForm.submit()}>
              Создать бронирование
            </Button>
          </div>
        )}
      >
        <Alert
          type="info"
          showIcon
          message="Ручное бронирование"
          description="Запись будет создана со статусом «Ожидает подтверждения» и сразу появится в календаре."
          style={{ marginBottom: 18 }}
        />
        <Form
          form={quickBookingForm}
          layout="vertical"
          className="tp-admin-form"
          onFinish={saveQuickBooking}
          onValuesChange={(changed) => {
            if (changed.resource) quickBookingForm.setFieldsValue({ objectId: undefined, departureSlotId: undefined });
            if (changed.objectId) {
              quickBookingForm.setFieldsValue({ departureSlotId: undefined });
              const selectedStay = accommodations.find((item) => Number(item.id) === Number(changed.objectId));
              if (selectedStay && isQuickBookingStayKind(quickBookingForm.getFieldValue('resource'))) {
                quickBookingForm.setFieldsValue({
                  startTime: selectedStay.defaultCheckInTime || '14:00',
                  endTime: selectedStay.defaultCheckOutTime || '12:00',
                });
              }
            }
            if (changed.clientId) {
              const selectedClient = users.find((user) => String(user.id) === String(changed.clientId));
              if (selectedClient) {
                quickBookingForm.setFieldsValue({
                  clientName: selectedClient.name || '',
                  clientPhone: selectedClient.phone || '',
                  clientEmail: selectedClient.email || '',
                });
              }
            }
            if (changed.adults !== undefined || changed.children !== undefined) {
              const adults = Math.max(Number(quickBookingForm.getFieldValue('adults')) || 0, 0);
              const children = Math.max(Number(quickBookingForm.getFieldValue('children')) || 0, 0);
              const totalGuests = Math.max(adults + children, 1);
              quickBookingForm.setFieldsValue({ guests: totalGuests, people: totalGuests });
            }
          }}
        >
          <Divider orientation="left" plain>Клиент</Divider>
          <Form.Item name="clientId" label="Поиск клиента">
            <Select
              allowClear
              showSearch
              optionFilterProp="search"
              placeholder="ФИО или телефон"
              options={quickBookingClientOptions}
              fieldNames={{ label: 'label', value: 'value' }}
              filterOption={(input, option) => String(option?.search || option?.label || '').toLowerCase().includes(input.toLowerCase())}
              notFoundContent="Клиент не найден — заполните нового клиента ниже"
            />
          </Form.Item>
          <Alert
            type={quickBookingClientId ? 'success' : 'info'}
            showIcon
            message={quickBookingClientId ? 'Клиент найден в CRM' : 'Новый клиент'}
            description={quickBookingClientId ? 'Контакты подставлены автоматически, их можно поправить.' : 'Если клиента нет в базе, заполните имя и телефон — бронь сохранит эти данные.'}
            style={{ marginBottom: 14 }}
          />
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="clientName" label="ФИО" rules={[{ required: true, whitespace: true, message: 'Укажите имя клиента' }]}>
                <Input autoComplete="name" placeholder="Например, Айбек Т." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="clientPhone" label="Телефон" rules={[{ required: true, whitespace: true, message: 'Укажите телефон' }]}>
                <Input autoComplete="tel" placeholder="+996 555 123 456" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="clientEmail" label="Email">
            <Input autoComplete="email" type="email" placeholder="Необязательно" />
          </Form.Item>

          <Divider orientation="left" plain>Бронирование</Divider>
          <Form.Item name="resource" label="Тип" rules={[{ required: true, message: 'Выберите тип' }]}>
            <Segmented
              block
              options={QUICK_BOOKING_TYPE_OPTIONS}
            />
          </Form.Item>
          <Form.Item
            name="objectId"
            label={isStayQuickBooking ? 'Объект' : 'Тур / активность'}
            rules={[{ required: true, message: 'Выберите объект' }]}
            extra={isStayQuickBooking ? 'Показываем только объекты без конфликта на выбранное время.' : 'Для туров и активностей доступны только отправления со свободными местами.'}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={isStayQuickBooking ? 'Выберите коттедж или дом' : 'Выберите тур или активность'}
              options={quickBookingObjectOptions}
              notFoundContent="Доступных объектов нет"
            />
          </Form.Item>

          {quickBookingAvailability.hasConflict && isStayQuickBooking && (
            <Alert
              type="warning"
              showIcon
              message={quickBookingAvailability.block
                ? `${quickBookingAvailability.selectedStay?.title || quickBookingAvailability.selectedStay?.name || 'Объект'} закрыт`
                : `${quickBookingAvailability.selectedStay?.title || quickBookingAvailability.selectedStay?.name || 'Объект'} уже занят`}
              description={(
                <Space orientation="vertical" size={6}>
                  {quickBookingAvailability.block && (
                    <span>
                      {(PROPERTY_BLOCK_REASONS.find((item) => item.value === quickBookingAvailability.block.reason)?.label || 'Недоступно')}
                      {quickBookingAvailability.block.comment ? ` · ${quickBookingAvailability.block.comment}` : ''}
                    </span>
                  )}
                  {quickBookingAvailability.occupiedBlocks.map((block) => (
                    <span key={block.id}>{block.label}{block.clientName ? ` · ${block.clientName}` : ''}</span>
                  ))}
                  {quickBookingAvailability.alternatives.length > 0 && (
                    <span>
                      Доступны: {quickBookingAvailability.alternatives.map((item) => item.title || item.name || `Объект #${item.id}`).join(', ')}
                    </span>
                  )}
                </Space>
              )}
              style={{ marginBottom: 14 }}
            />
          )}

          {quickBookingFreeSlots.length > 0 && (
            <div className="tp-admin-free-slots">
              <Text type="secondary">{isTourQuickBooking ? 'Отправления' : 'Свободные окна'}</Text>
              <div className="tp-admin-free-slots__list">
                {quickBookingFreeSlots.map((slot) => (
                  <button
                    key={slot.key}
                    type="button"
                    className="tp-admin-free-slot"
                    onClick={() => {
                      if (isTourQuickBooking) {
                        quickBookingForm.setFieldsValue({ departureSlotId: slot.key });
                      } else {
                        const [start, end] = String(slot.key).split('-').map(Number);
                        const toClock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
                        quickBookingForm.setFieldsValue({ startTime: toClock(start), endTime: toClock(Math.min(end, start + STAY_BOOKING_SLOT_DURATION_MINUTES)) });
                      }
                    }}
                  >
                    <strong>{slot.title}</strong>
                    <small>{slot.subtitle}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isTourQuickBooking ? (
            <>
              <Form.Item
                name="departureSlotId"
                label="Отправление"
                rules={[{ required: true, message: 'Выберите доступное отправление' }]}
              >
                <Select
                  loading={quickBookingSlotsLoading}
                  placeholder="Выберите дату и время"
                  options={quickBookingSlots
                    .filter((slot) => slot.active !== false && slot.available !== false && !slot.soldOut && Number(slot.remainingSeats || 0) >= Math.max(Number(quickBookingPeople || 1), 1) && dayjs(slot.startAt).isAfter(dayjs()))
                    .filter((slot) => !quickBookingDate || !dayjs(quickBookingDate).isValid() || dayjs(slot.startAt).isSame(dayjs(quickBookingDate), 'day'))
                    .map((slot) => ({
                      value: slot.id,
                      label: `${dayjs(slot.startAt).locale('ru').format('D MMMM, HH:mm')} · свободно ${slot.remainingSeats} / ${slot.seats}`,
                    }))}
                  notFoundContent={quickBookingObjectId ? 'Нет доступных отправлений' : 'Сначала выберите тур'}
                />
              </Form.Item>
              <Form.Item name="checkInDate" label="Дата" rules={[{ required: true, message: 'Выберите дату' }]}>
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
              {(quickBookingAvailability.waitlistSlots || []).length > 0 && (
                <div className="tp-admin-waitlist-box">
                  <Alert
                    type="warning"
                    showIcon
                    message="Tour departure is full"
                    description="Add the client to the waitlist. When seats are released, managers will see the next client here."
                  />
                  <Form.Item name="waitlistDepartureSlotId" label="Waitlist departure">
                    <Select
                      placeholder="Select sold-out departure"
                      options={(quickBookingAvailability.waitlistSlots || []).map((slot) => ({
                        value: slot.id,
                        label: `${dayjs(slot.startAt).locale('ru').format('D MMMM, HH:mm')} · booked ${slot.bookedSeats || 0} / ${slot.seats} · waitlist ${slot.waitlistCount || 0}`,
                      }))}
                    />
                  </Form.Item>
                  <Button
                    block
                    loading={quickBookingWaitlistSaving}
                    onClick={addQuickBookingWaitlist}
                  >
                    Add to waitlist
                  </Button>
                </div>
              )}
              <Form.Item name="people" label="Количество гостей" rules={[{ required: true, message: 'Укажите количество гостей' }]}>
                <InputNumber min={1} max={12} style={{ width: '100%' }} />
              </Form.Item>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item name="pickup" label="Pickup">
                    <Input placeholder="Hotel, office, точка сбора" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="emergencyContact" label="Emergency contact">
                    <Input placeholder="+996..." />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <Row gutter={12}>
              <Col xs={24} sm={12}>
                <Form.Item name="checkInDate" label="Дата заезда" rules={[{ required: true, message: 'Выберите дату' }]}>
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    disabledDate={(value) => value && value.startOf('day').isBefore(dayjs().startOf('day'))}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item name="nights" label="Ночей" rules={[{ required: true, message: 'Укажите ночи' }]}>
                  <InputNumber min={1} max={30} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item name="guests" label="Гостей" rules={[{ required: true, message: 'Укажите гостей' }]}>
                  <InputNumber min={1} max={30} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12}>
                <Form.Item name="startTime" label="Начало" rules={[{ required: true, message: 'Укажите время' }]}>
                  <Input type="time" />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12}>
                <Form.Item name="endTime" label="Окончание" rules={[{ required: true, message: 'Укажите время' }]}>
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item name="adults" label="Взрослые">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="children" label="Дети">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col xs={12}>
              <Form.Item name="amount" label="Стоимость">
                <InputNumber min={0} addonAfter="сом" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12}>
              <Form.Item name="prepaymentAmount" label="Предоплата">
                <InputNumber min={0} addonAfter="сом" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="paymentMethod" label="Payment method">
            <Select options={CASHBOX_PAYMENT_METHOD_OPTIONS} />
          </Form.Item>
          <Row gutter={12}>
            <Col xs={24} sm={12}>
              <Form.Item name="manager" label="Менеджер">
                <Select
                  showSearch
                  allowClear
                  placeholder="Ответственный"
                  options={assignmentStaffOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="bookingSource" label="Источник бронирования">
                <Select options={QUICK_BOOKING_SOURCES} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="bookingStatus" label="Статус">
            <Select options={QUICK_BOOKING_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="Необязательно" />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="Дата и фильтры"
        open={calendarFiltersDrawerOpen}
        onClose={() => setCalendarFiltersDrawerOpen(false)}
        placement={isMobileViewport ? 'bottom' : 'left'}
        width={isMobileViewport ? '100%' : 'min(380px, calc(100vw - 24px))'}
        height={isMobileViewport ? '78vh' : undefined}
        className="tp-admin-calendar-filters-drawer"
        extra={<Button type="text" onClick={resetCalendarFilters}>Сбросить</Button>}
      >
        <aside className="tp-admin-calendar-sidebar" aria-label="Дата и фильтры календаря">
          <Calendar
            fullscreen={false}
            locale={ruRU}
            value={calendarDate}
            onSelect={(value) => {
              setCalendarDate(value);
              setBookingTab(isMobileViewport ? 'day' : 'three-day');
              setCalendarFiltersDrawerOpen(false);
            }}
            className="tp-admin-mini-calendar"
            headerRender={({ value, onChange }) => {
              const changeMonth = (step) => {
                const next = value.clone().add(step, 'month');
                onChange(next);
                setCalendarDate(next);
              };
              return <div className="tp-admin-mini-calendar-header">
                <Button type="text" shape="circle" icon={<LeftOutlined />} aria-label="Предыдущий месяц" onClick={() => changeMonth(-1)} />
                <strong>{value.locale('ru').format('MMMM YYYY')}</strong>
                <Button type="text" shape="circle" icon={<RightOutlined />} aria-label="Следующий месяц" onClick={() => changeMonth(1)} />
              </div>;
            }}
          />
          {renderCalendarFilters({ inDrawer: true })}
        </aside>
      </Drawer>

      {/* calendar drawer */}
      <Drawer
        title={calendarDrawerItem?.type === 'tour' ? 'Детали тура' : 'Детали бронирования'}
        open={Boolean(calendarDrawerItem)}
        onClose={closeCalendarItemDetails}
        width={isDesktop ? 560 : '100%'}
        className="tp-admin-form-drawer"
        extra={calendarDrawerItem?.companyName ? <Tag color="blue">{calendarDrawerItem.companyName}</Tag> : null}
      >
        {calendarDrawerItem && (
          <Space orientation="vertical" size={18} style={{ width: '100%' }}>
            {['stay_booking', 'tour_booking'].includes(calendarDrawerItem.type) && (
              <div className="tp-admin-booking-drawer-summary">
                <div>
                  <Text type="secondary">#{`TRP-${String(calendarDrawerItem.id || 0).padStart(4, '0')}`}</Text>
                  <Title level={4}>{calendarDrawerItem.clientName || 'Клиент'}</Title>
                  <Text>{calendarDrawerItem.clientPhone || calendarDrawerItem.clientEmail || 'Контакт не указан'}</Text>
                </div>
                {renderBookingStatusChip(calendarDrawerItem)}
              </div>
            )}

            <div className="tp-admin-calendar-detail">
              <Title level={4} style={{ marginBottom: 8 }}>{calendarDrawerItem.title || calendarDrawerItem.tourTitle}</Title>
              <Space wrap>
                {calendarDrawerItem.type === 'tour' ? (
                  <Tag color={(TOUR_CALENDAR_STATUS_META[calendarDrawerItem.status] || TOUR_CALENDAR_STATUS_META.scheduled).color}>
                    {(TOUR_CALENDAR_STATUS_META[calendarDrawerItem.status] || TOUR_CALENDAR_STATUS_META.scheduled).label}
                  </Tag>
                ) : renderBookingStatusChip(calendarDrawerItem)}
                <Tag>{calendarDrawerItem.companyName || 'TravelPay'}</Tag>
              </Space>
            </div>

            <Card size="small" className="tp-admin-inline-card">
              <div className="tp-admin-calendar-detail-grid">
                {calendarDrawerItem.clientName && <div><Text type="secondary">Клиент</Text><strong>{calendarDrawerItem.clientName}</strong></div>}
                {calendarDrawerItem.clientPhone && <div><Text type="secondary">Телефон</Text><strong>{calendarDrawerItem.clientPhone}</strong></div>}
                {calendarDrawerItem.clientEmail && <div><Text type="secondary">Email</Text><strong>{calendarDrawerItem.clientEmail}</strong></div>}
                <div><Text type="secondary">Даты</Text><strong>{formatDate(calendarDrawerItem.startDate || calendarDrawerItem.bookingDate)} - {formatDate(calendarDrawerItem.endDate || calendarDrawerItem.bookingDate)}</strong></div>
                <div><Text type="secondary">Время</Text><strong>{formatCalendarTimeRange(calendarDrawerItem)}</strong></div>
                {(calendarDrawerItem.tourTitle || calendarDrawerItem.title) && <div><Text type="secondary">Тур</Text><strong>{calendarDrawerItem.tourTitle || calendarDrawerItem.title}</strong></div>}
                {calendarDrawerItem.stayTitle && <div><Text type="secondary">Домик</Text><strong>{calendarDrawerItem.stayTitle}</strong></div>}
                {calendarDrawerItem.companyName && <div><Text type="secondary">Компания</Text><strong>{calendarDrawerItem.companyName}</strong></div>}
                {(calendarDrawerItem.route || calendarDrawerItem.location) && <div><Text type="secondary">Локация</Text><strong>{calendarDrawerItem.route || calendarDrawerItem.location}</strong></div>}
                {(calendarDrawerItem.guests || calendarDrawerItem.people || calendarDrawerItem.totalSeats) && <div><Text type="secondary">Гости / места</Text><strong>{calendarDrawerItem.guests ? `${calendarDrawerItem.guests} чел.` : calendarDrawerItem.people ? `${calendarDrawerItem.people} чел.` : `${calendarDrawerItem.bookedSeats || 0}/${calendarDrawerItem.totalSeats}`}</strong></div>}
                {(calendarDrawerItem.adults || calendarDrawerItem.children) && <div><Text type="secondary">Состав</Text><strong>{Number(calendarDrawerItem.adults || 0)} взрослых · {Number(calendarDrawerItem.children || 0)} детей</strong></div>}
                {(calendarDrawerItem.nights || calendarDrawerItem.duration) && <div><Text type="secondary">Длительность</Text><strong>{calendarDrawerItem.nights ? `${calendarDrawerItem.nights} ночи` : calendarDrawerItem.duration}</strong></div>}
                {(calendarDrawerItem.price || calendarDrawerItem.amount) && <div><Text type="secondary">Стоимость</Text><strong>{formatMoney(calendarDrawerItem.price || calendarDrawerItem.amount)}</strong></div>}
                {calendarDrawerItem.prepaymentAmount > 0 && <div><Text type="secondary">Предоплата</Text><strong>{formatMoney(calendarDrawerItem.prepaymentAmount)}</strong></div>}
                {calendarDrawerItem.assignedTo && <div><Text type="secondary">Менеджер</Text><strong>{calendarDrawerItem.assignedTo}</strong></div>}
                {calendarDrawerItem.bookingSource && <div><Text type="secondary">Источник</Text><strong>{QUICK_BOOKING_SOURCES.find((item) => item.value === calendarDrawerItem.bookingSource)?.label || calendarDrawerItem.bookingSource}</strong></div>}
                <div>
                  <Text type="secondary">Статус</Text>
                  <div style={{ marginTop: 8 }}>
                    {calendarDrawerItem.type === 'tour'
                      ? <strong>{(TOUR_CALENDAR_STATUS_META[calendarDrawerItem.status] || TOUR_CALENDAR_STATUS_META.scheduled).label}</strong>
                      : renderBookingStatusChip(calendarDrawerItem)}
                  </div>
                </div>
              </div>
            </Card>

            {calendarDrawerItem.comment && (
              <Card size="small" className="tp-admin-inline-card" title="Комментарий">
                <Paragraph style={{ marginBottom: 0 }}>{calendarDrawerItem.comment}</Paragraph>
              </Card>
            )}

            {calendarDrawerItem.rejectionReason && (
              <Card size="small" className="tp-admin-inline-card" title="Причина отклонения">
                <Paragraph style={{ marginBottom: 0 }}>{calendarDrawerItem.rejectionReason}</Paragraph>
              </Card>
            )}

            {['stay_booking', 'tour_booking'].includes(calendarDrawerItem.type) && (
              <Card size="small" className="tp-admin-inline-card" title="Оплата">
                <div className="tp-admin-calendar-detail-grid">
                  <div><Text type="secondary">Total</Text><strong>{formatMoney(getBookingDebtSummary(calendarDrawerItem).total)}</strong></div>
                  <div><Text type="secondary">Paid</Text><strong>{formatMoney(getBookingDebtSummary(calendarDrawerItem).paid)}</strong></div>
                  <div><Text type="secondary">Remaining</Text><strong>{formatMoney(getBookingDebtSummary(calendarDrawerItem).remaining)}</strong></div>
                  <div><Text type="secondary">Status</Text><strong>{getBookingDebtSummary(calendarDrawerItem).status}</strong></div>
                  {getBookingDebtSummary(calendarDrawerItem).refunded > 0 && (
                    <div><Text type="secondary">Refunded</Text><strong>{formatMoney(getBookingDebtSummary(calendarDrawerItem).refunded)}</strong></div>
                  )}
                </div>
              </Card>
            )}

            {calendarDrawerItem.type === 'stay_booking' && renderStayBookingFinance(calendarDrawerItem)}
            {calendarDrawerItem.type === 'stay_booking' && renderStayBookingExtras(calendarDrawerItem)}

            {['stay_booking', 'tour_booking'].includes(calendarDrawerItem.type) && calendarDrawerItem.paymentReceiptUrl && (
              <Card size="small" className="tp-admin-inline-card" title="Чек предоплаты">
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  {calendarDrawerItem.paymentReceiptUrl.startsWith('data:image/') ? (
                    <Image
                      src={calendarDrawerItem.paymentReceiptUrl}
                      alt={calendarDrawerItem.paymentReceiptName || 'Чек предоплаты'}
                      style={{ borderRadius: 16, objectFit: 'cover', maxHeight: 220 }}
                    />
                  ) : (
                    <Button
                      icon={<FilePdfOutlined />}
                      href={calendarDrawerItem.paymentReceiptUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Открыть PDF-чек
                    </Button>
                  )}

                  <Space wrap>
                    <Button
                      type="primary"
                      onClick={() => window.open(calendarDrawerItem.paymentReceiptUrl, '_blank', 'noopener,noreferrer')}
                    >
                      Просмотреть чек
                    </Button>
                    {calendarDrawerItem.paymentReceiptName ? (
                      <Text type="secondary">{calendarDrawerItem.paymentReceiptName}</Text>
                    ) : null}
                  </Space>
                </Space>
              </Card>
            )}

            {calendarDrawerItem.type === 'stay_booking' && calendarDrawerTimeline.length > 0 && (
              <Card size="small" className="tp-admin-inline-card" title="История заявки">
                <div className="tp-admin-timeline">
                  {calendarDrawerTimeline.map((entry, index) => (
                    <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone}`}>
                      <div className="tp-admin-timeline__rail">
                        <span className="tp-admin-timeline__dot" />
                        {index < calendarDrawerTimeline.length - 1 ? <span className="tp-admin-timeline__line" /> : null}
                      </div>
                      <div className="tp-admin-timeline__content">
                        <div className="tp-admin-timeline__head">
                          <strong>{entry.title}</strong>
                          <Text type="secondary">{formatDateTime(entry.time)}</Text>
                        </div>
                        <Text type="secondary">{entry.description}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {['stay_booking', 'tour_booking'].includes(calendarDrawerItem.type) && calendarDrawerStatusHistory.length > 0 && (
              <Card size="small" className="tp-admin-inline-card" title="История статусов">
                <div className="tp-admin-timeline tp-admin-status-history">
                  {calendarDrawerStatusHistory.map((entry, index) => (
                    <div
                      key={entry.key}
                      className="tp-admin-timeline__item"
                      style={{ '--timeline-color': entry.color }}
                    >
                      <div className="tp-admin-timeline__rail">
                        <span className="tp-admin-timeline__dot" />
                        {index < calendarDrawerStatusHistory.length - 1 ? <span className="tp-admin-timeline__line" /> : null}
                      </div>
                      <div className="tp-admin-timeline__content">
                        <div className="tp-admin-timeline__head">
                          <strong>{entry.fieldLabel}: {entry.fromLabel} → {entry.toLabel}</strong>
                          <Text type="secondary">{formatDateTime(entry.changedAt)}</Text>
                        </div>
                        <Text type="secondary">
                          {entry.actor}
                          {entry.comment ? ` · ${entry.comment}` : ''}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card size="small" className="tp-admin-inline-card" title="Клиенты / брони">
              <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                {(calendarDrawerItem.clients?.length
                  ? calendarDrawerItem.clients
                  : (calendarDrawerItem.clientName ? [calendarDrawerItem] : [])
                ).map((client, index) => (
                  <div key={client.id || client.key || index} className="tp-admin-calendar-client-row">
                    <div>
                      <strong>{client.clientName || client.name || 'Клиент'}</strong>
                      <div><Text type="secondary">{client.clientPhone || client.clientEmail || '—'}</Text></div>
                    </div>
                    <Space>
                      {renderBookingStatusChip(client)}
                      {client.amount ? <strong>{formatMoney(client.amount)}</strong> : null}
                    </Space>
                  </div>
                ))}
              </Space>
            </Card>

            <div className="tp-admin-drawer-footer">
              {['stay_booking', 'tour_booking'].includes(calendarDrawerItem?.type) && (
                <>
                  <Button type="primary" onClick={() => updateStayBookingStatus(calendarDrawerItem, 'confirmed')}>
                    Подтвердить
                  </Button>
                  <Button onClick={() => {
                    if (calendarDrawerItem.type === 'stay_booking') {
                      openStayBookingEditor(calendarDrawerItem);
                    } else {
                      message.info('Изменение деталей тур-брони оставил внутри drawer-логики следующего шага; перенос уже доступен drag/drop.');
                    }
                  }}>
                    Изменить
                  </Button>
                  <Button onClick={() => updateStayBookingStatus(calendarDrawerItem, 'confirmed')}>
                    Принять оплату
                  </Button>
                  <Button
                    href={`https://wa.me/${String(calendarDrawerItem.clientPhone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    disabled={!String(calendarDrawerItem.clientPhone || '').replace(/\D/g, '')}
                  >
                    Написать
                  </Button>
                  <Button href={`tel:${calendarDrawerItem.clientPhone || ''}`} disabled={!calendarDrawerItem.clientPhone}>
                    Позвонить
                  </Button>
                  {canReviewStayBooking(calendarDrawerItem) && (
                    <Button danger onClick={() => openStayBookingRejectModal(calendarDrawerItem)}>
                      Отклонить заявку
                    </Button>
                  )}
                  <Button onClick={() => message.info('Перетащите карточку в календаре на новое время, объект или менеджера.')}>
                    Перенести
                  </Button>
                  <Button danger onClick={() => updateStayBookingStatus(calendarDrawerItem, 'cancelled')}>
                    Отменить
                  </Button>
                </>
              )}
              {calendarDrawerItem?.type === 'tour' && (
                <Button onClick={() => calendarDrawerItem?.tourId ? navigate(`/tours/${calendarDrawerItem.tourId}`) : navigate(`/tours/${calendarDrawerItem.id}`)}>
                  Открыть тур
                </Button>
              )}
              {calendarDrawerItem?.type === 'tour' && <Button onClick={() => {
                if (calendarDrawerItem?.type === 'tour') {
                  startEditTour(calendarDrawerItem);
                  closeCalendarItemDetails();
                } else {
                  openStayBookingEditor(calendarDrawerItem);
                }
              }}>
                Редактировать
              </Button>}
              <Button onClick={() => openQuickBookingDrawer({ date: calendarDate })}>
                Создать бронь
              </Button>
            </div>
          </Space>
        )}
      </Drawer>

      <Drawer
        title={editingTourId ? 'Редактировать тур' : 'Добавить тур'}
        open={tourDrawerOpen}
        onClose={closeTourDrawer}
        size={isDesktop ? 760 : '100%'}
        className="tp-admin-form-drawer tp-admin-form-drawer--tour"
        footer={(
          <div className="tp-admin-drawer-footer">
            <Button onClick={closeTourDrawer}>Отмена</Button>
            <Button type="primary" onClick={() => tourForm.submit()}>
              Сохранить тур
            </Button>
          </div>
        )}
      >
        <div className="tp-admin-tour-form-hero">
          <div>
            <span>TravelPay Business</span>
            <strong>{editingTourId ? 'Обновите карточку тура' : 'Создайте продающий тур'}</strong>
            <p>Заполните маршрут, даты, места и фото. Компания автоматически привяжется к вашему Business-аккаунту.</p>
          </div>
          <Tag color={currentCompany?.status === 'active' ? 'green' : 'gold'}>
            {currentCompany?.status === 'active' ? 'Компания активна' : 'Ожидает проверки'}
          </Tag>
        </div>

        <Form form={tourForm} layout="vertical" onFinish={handleSaveTour} className="tp-admin-form">
          <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название тура' }]}>
            <Input placeholder="Например: Issyk-Kul Premium Escape" />
          </Form.Item>

          <Form.Item name="location" label="Локация" rules={[{ required: true, message: 'Введите локацию' }]}>
            <Input placeholder="Иссык-Куль, Кыргызстан" />
          </Form.Item>

          <Form.Item name="description" label="Описание" rules={[{ required: true, message: 'Добавьте описание' }]}>
            <Input.TextArea rows={5} placeholder="Краткое описание тура" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="price" label="Цена" rules={[{ required: true, message: 'Введите цену' }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="Длительность" rules={[{ required: true, message: 'Введите длительность' }]}>
                <Input placeholder="3 дня" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="prepaymentMode" label="Prepayment">
                <Select options={PREPAYMENT_MODE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="prepaymentPercent" label="Prepayment %">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="prepaymentFixedAmount" label="Fixed prepayment">
                <InputNumber min={0} style={{ width: '100%' }} suffix="сом" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="image" label="Ссылка на фото" rules={[{ required: true, message: 'Укажите ссылку на фото' }]}>
            <Input placeholder="https://..." />
          </Form.Item>

          <Divider orientation="left">Календарь тура</Divider>

          {isSuperAdmin && (
            <Form.Item name="companyId" label="Тур-компания" rules={[{ required: true, message: 'Выберите компанию' }]}>
              <Select placeholder="Выберите тур-компанию" options={companyOptions} />
            </Form.Item>
          )}

          <div className="tp-admin-linked-box">
            <div className="tp-admin-section-head tp-admin-section-head--tight">
              <div>
                <strong>Отправления тура</strong>
                <div><Text type="secondary">Клиенты увидят только эти даты и время.</Text></div>
              </div>
            </div>
            <Form.List name="departureSlots">
              {(fields, { add, remove }) => (
                <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      size="small"
                      className="tp-admin-inline-card"
                      title={`Отправление #${index + 1}`}
                      extra={fields.length > 1 ? <Button danger size="small" onClick={() => remove(name)}>Удалить</Button> : null}
                    >
                      <Form.Item {...restField} name={[name, 'id']} hidden><Input /></Form.Item>
                      <Row gutter={12} align="middle">
                        <Col xs={24} md={14}>
                          <Form.Item
                            {...restField}
                            name={[name, 'startAt']}
                            label="Дата и время выезда"
                            rules={[{ required: true, message: 'Укажите дату и время' }]}
                          >
                            <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={16} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'seats']}
                            label="Количество мест"
                            rules={[{ required: true, message: 'Укажите места' }]}
                          >
                            <InputNumber min={1} max={200} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={8} md={4}>
                          <Form.Item {...restField} name={[name, 'active']} label="Доступно" valuePropName="checked">
                            <Switch />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'guide']} label="Guide">
                            <Input placeholder="Guide name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'driver']} label="Driver">
                            <Input placeholder="Driver name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item {...restField} name={[name, 'vehicle']} label="Vehicle">
                            <Input placeholder="Sprinter, SUV..." />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={10}>
                          <Form.Item {...restField} name={[name, 'meetingPoint']} label="Meeting point">
                            <Input placeholder="Bishkek, main office" />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={6}>
                          <Form.Item {...restField} name={[name, 'price']} label="Price">
                            <InputNumber min={0} step={500} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={12} md={8}>
                          <Form.Item {...restField} name={[name, 'status']} label="Departure status">
                            <Select options={TOUR_DEPARTURE_STATUS_OPTIONS} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add({ id: `departure-${Date.now()}`, startAt: dayjs().add(1, 'day').hour(9).minute(0), seats: 20, active: true, guide: '', driver: '', vehicle: '', meetingPoint: '', price: Number(tourForm.getFieldValue('price') || 0), status: 'scheduled', waitlist: [], operationsChecklist: createEmptyTourOperationsChecklist() })}
                  >
                    Добавить ещё дату и время
                  </Button>
                </Space>
              )}
            </Form.List>
          </div>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="route" label="Маршрут">
                <Input placeholder="Бишкек - Каракол - Иссык-Куль" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="manager" label="Менеджер">
                <Select
                  showSearch
                  allowClear
                  placeholder="Имя менеджера"
                  options={managerOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="calendarStatus" label="Статус в календаре">
                <Select options={tourCalendarStatusOptions} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Статус" rules={[{ required: true, message: 'Выберите статус' }]}>
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="rating" label="Рейтинг" rules={[{ required: true, message: 'Укажите рейтинг' }]}>
                <Rate allowHalf />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Form.Item
            name="hasAccommodation"
            label="Есть проживание"
            valuePropName="checked"
            extra="Если выключено, блок выбора домиков не показывается пользователям."
          >
            <Switch checkedChildren="Да" unCheckedChildren="Нет" />
          </Form.Item>

          {hasAccommodation && (
            <div className="tp-admin-linked-box">
              <Form.Item name="accommodationIds" label="Привязанные домики">
                <Select
                  mode="multiple"
                  placeholder="Выберите домики из каталога"
                  options={accommodations.map((item) => ({ value: item.id, label: item.title || item.name }))}
                />
              </Form.Item>

              <Form.List name="accommodations">
                {(fields, { add, remove }) => (
                  <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                    {fields.map(({ key, name, ...restField }, index) => (
                      <Card
                        key={key}
                        size="small"
                        className="tp-admin-inline-card"
                        title={`Домик #${index + 1}`}
                        extra={<Button danger size="small" onClick={() => remove(name)}>Удалить</Button>}
                      >
                        <Row gutter={12}>
                          <Col xs={24} md={12}>
                            <Form.Item {...restField} name={[name, 'name']} label="Название домика" rules={[{ required: true, message: 'Введите название' }]}>
                              <Input placeholder="Mountain View Chalet" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item {...restField} name={[name, 'type']} label="Тип проживания">
                              <Select options={ACCOMMODATION_TYPES} />
                            </Form.Item>
                          </Col>
                          <Col xs={24}>
                            <Form.List name={[name, 'images']}>
                              {(imageFields, imageOps) => (
                                <div className="tp-admin-inline-list">
                                  {imageFields.map((imageField, imageIndex) => (
                                    <Space key={imageField.key} align="baseline" style={{ width: '100%' }}>
                                      <Form.Item
                                        {...imageField}
                                        label={imageIndex === 0 ? 'Ссылка на фото' : ''}
                                        rules={[{ required: imageIndex === 0, message: 'Добавьте фото' }]}
                                        style={{ flex: 1 }}
                                      >
                                        <Input placeholder="https://..." />
                                      </Form.Item>
                                      <Button danger onClick={() => imageOps.remove(imageField.name)}>Удалить</Button>
                                    </Space>
                                  ))}
                                  <Button type="dashed" block icon={<PlusOutlined />} onClick={() => imageOps.add('')}>
                                    Добавить фото
                                  </Button>
                                </div>
                              )}
                            </Form.List>
                          </Col>
                          <Col xs={24}>
                            <Form.Item {...restField} name={[name, 'description']} label="Описание домика">
                              <Input.TextArea rows={3} placeholder="Кратко опишите домик и его преимущества" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add(createAccommodationDraft())}>
                      Добавить домик
                    </Button>
                  </Space>
                )}
              </Form.List>
            </div>
          )}
        </Form>
      </Drawer>

      <Modal
        title="Отклонить заявку"
        open={stayBookingDecisionOpen}
        okText="Отклонить заявку"
        cancelText="Отмена"
        okButtonProps={{ danger: true, loading: stayBookingDecisionLoading }}
        onCancel={closeStayBookingRejectModal}
        onOk={() => stayBookingDecisionForm.submit()}
      >
        <Form
          form={stayBookingDecisionForm}
          layout="vertical"
          onFinish={handleRejectStayBooking}
        >
          <Form.Item
            name="rejectionReason"
            label="Причина отказа"
            rules={[{ required: true, message: 'Укажите причину отказа для клиента и компании.' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Например: чек не читается, время уже недоступно, нужна уточняющая информация..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={Boolean(documentPreview)}
        title={documentPreview?.title || 'Просмотр документа'}
        footer={(
          <Space>
            {documentPreview?.url && (
              <Button href={documentPreview.url} target="_blank" rel="noreferrer" icon={previewIsPdf ? <FilePdfOutlined /> : <EyeOutlined />}>
                Открыть в новой вкладке
              </Button>
            )}
            <Button type="primary" onClick={closeDocumentPreview}>Закрыть</Button>
          </Space>
        )}
        onCancel={closeDocumentPreview}
        width={860}
      >
        {documentPreview?.name && (
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary">{documentPreview.name}</Text>
          </div>
        )}

        {previewIsPdf ? (
          <iframe
            title={documentPreview?.title || 'document-preview'}
            src={documentPreview?.url}
            style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 12, background: '#fff' }}
          />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image
              src={documentPreview?.url}
              alt={documentPreview?.name || documentPreview?.title || 'Документ'}
              style={{ maxHeight: '70vh', objectFit: 'contain', borderRadius: 12 }}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={companyRequestReviewOpen}
        title={companyRequestReviewAction === 'approve' ? 'Подтвердить заявку компании' : 'Отклонить заявку компании'}
        okText={companyRequestReviewAction === 'approve' ? 'Подтвердить заявку' : 'Отклонить заявку'}
        cancelText="Отмена"
        okButtonProps={{ danger: companyRequestReviewAction === 'reject' }}
        confirmLoading={companyRequestReviewLoading}
        onOk={() => companyRequestReviewForm.submit()}
        onCancel={closeCompanyRequestReviewModal}
        width={820}
      >
        {companyRequestReviewItem && (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <Card size="small" className="tp-admin-inline-card" title="Заявка компании">
              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <Text type="secondary">Компания</Text>
                  <div><strong>{companyRequestReviewItem.companyName || 'TravelPay Business'}</strong></div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Email</Text>
                  <div><strong>{companyRequestReviewItem.ownerEmail || '—'}</strong></div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Instagram</Text>
                  <div>
                    {companyRequestReviewItem.instagramUrl ? (
                      <Button type="link" href={companyRequestReviewItem.instagramUrl} target="_blank" rel="noreferrer" style={{ paddingInline: 0 }}>
                        Открыть Instagram
                      </Button>
                    ) : <strong>—</strong>}
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Text type="secondary">Сумма</Text>
                  <div><strong>{formatMoney(companyRequestReviewItem.amount)}</strong></div>
                </Col>
              </Row>
            </Card>

            <Card size="small" className="tp-admin-inline-card" title="История заявки">
              <div className="tp-admin-timeline">
                {businessRequestTimeline.map((entry, index) => (
                  <div key={entry.key} className={`tp-admin-timeline__item is-${entry.tone}`}>
                    <div className="tp-admin-timeline__rail">
                      <span className="tp-admin-timeline__dot" />
                      {index < businessRequestTimeline.length - 1 ? <span className="tp-admin-timeline__line" /> : null}
                    </div>
                    <div className="tp-admin-timeline__content">
                      <div className="tp-admin-timeline__head">
                        <strong>{entry.title}</strong>
                        <Text type="secondary">{formatDateTime(entry.time)}</Text>
                      </div>
                      <Text type="secondary">{entry.description}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Form form={companyRequestReviewForm} layout="vertical" onFinish={handleCompanyRequestReviewSubmit}>
              <Form.Item
                name="adminComment"
                label={companyRequestReviewAction === 'approve' ? 'Комментарий супер-админа' : 'Причина отклонения'}
                rules={[{ required: true, message: companyRequestReviewAction === 'approve' ? 'Добавьте комментарий для компании.' : 'Укажите причину отклонения заявки.' }]}
              >
                <Input.TextArea
                  rows={5}
                  placeholder={companyRequestReviewAction === 'approve'
                    ? 'Например: документы проверены, подписка активирована, доступ открыт на 30 дней.'
                    : 'Например: чек нечитаемый, паспорт не совпадает с владельцем, нужна повторная подача заявки.'}
                />
              </Form.Item>
            </Form>
          </Space>
        )}
      </Modal>

      <Drawer
        title={editingAccommodationId ? 'Редактировать домик' : 'Добавить домик'}
        open={accommodationDrawerOpen}
        onClose={closeAccommodationDrawer}
        size={isDesktop ? 720 : '100%'}
        className="tp-admin-form-drawer tp-admin-form-drawer--stay"
        footer={(
          <div className="tp-admin-drawer-footer">
            <Button onClick={closeAccommodationDrawer}>Отмена</Button>
            <Button type="primary" onClick={() => accommodationForm.submit()}>
              Сохранить домик
            </Button>
          </div>
        )}
      >
        <Form form={accommodationForm} layout="vertical" onFinish={handleSaveAccommodation} className="tp-admin-form">
          <div className="tp-admin-stay-form-hero">
            <div>
              <strong>{editingAccommodationId ? 'Обновите объект проживания' : 'Создайте премиум-домик'}</strong>
              <p>Заполните фото, локацию, цену и удобства. Компания привяжется автоматически к Business-аккаунту.</p>
            </div>
            <Tag color={currentCompany?.status === 'active' ? 'green' : 'gold'}>
              {currentCompany?.name || 'TravelPay Company'}
            </Tag>
          </div>

          {!isSuperAdmin && (
            <>
              <Form.Item name="companyId" hidden><Input /></Form.Item>
              <Form.Item name="companyName" hidden><Input /></Form.Item>
            </>
          )}

          {isSuperAdmin && (
            <Form.Item name="companyId" label="Компания" rules={[{ required: true, message: 'Выберите компанию' }]}>
              <Select placeholder="Выберите компанию" options={companyOptions} />
            </Form.Item>
          )}

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="title" label="Название домика" rules={[{ required: true, message: 'Введите название домика' }]}>
                <Input placeholder="Mountain View Chalet" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="type" label="Тип проживания">
                <Select options={ACCOMMODATION_TYPES} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="location" label="Локация" rules={[{ required: true, message: 'Укажите локацию' }]}>
            <Input placeholder="Каракол, Иссык-Куль" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="propertyName" label="Property / комплекс">
                <Input placeholder="Issyk-Kul Resort" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="defaultCheckInTime" label="Default check-in">
                <Input type="time" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="defaultCheckOutTime" label="Default check-out">
                <Input type="time" />
              </Form.Item>
            </Col>
          </Row>

          <Form.List name="images">
            {(fields, { add, remove }) => (
              <div className="tp-admin-inline-list">
                {fields.map((field, index) => (
                  <Space key={field.key} align="baseline" style={{ width: '100%' }}>
                    <Form.Item
                      {...field}
                      label={index === 0 ? 'Ссылка на фото' : ''}
                      rules={[{ required: index === 0, message: 'Добавьте фото' }]}
                      style={{ flex: 1 }}
                    >
                      <Input placeholder="https://..." />
                    </Form.Item>
                    <Button danger onClick={() => remove(field.name)}>Удалить</Button>
                  </Space>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add('')}>
                  Добавить фото
                </Button>
              </div>
            )}
          </Form.List>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={4} placeholder="Кратко опишите домик, стиль, виды и удобства." />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="capacity" label="Вместимость">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="pricePerNight" label="Цена за ночь" rules={[{ required: true, message: 'Укажите цену за ночь' }]}>
                <InputNumber min={0} style={{ width: '100%' }} suffix="сом" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="weekendPrice" label="Weekend price">
                <InputNumber min={0} style={{ width: '100%' }} suffix="сом" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="totalCount" label="Всего домиков">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="prepaymentMode" label="Prepayment">
                <Select options={PREPAYMENT_MODE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="prepaymentPercent" label="Prepayment %">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={12} md={8}>
              <Form.Item name="prepaymentFixedAmount" label="Fixed prepayment">
                <InputNumber min={0} style={{ width: '100%' }} suffix="сом" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="availableCount" label="Доступно сейчас">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Статус">
                <Select options={ACCOMMODATION_STATUS_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="linkedTourIds" label="Привязанные туры">
                <Select
                  mode="multiple"
                  placeholder="Можно оставить пустым"
                  options={tours.map((tour) => ({ value: tour.id, label: tour.title }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Block dates</Divider>
          <Form.List name="blockedDates">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Card key={field.key} size="small" className="tp-admin-inline-card">
                    <Row gutter={10}>
                      <Col xs={24} md={7}>
                        <Form.Item {...field} name={[field.name, 'startDate']} label="С даты">
                          <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={7}>
                        <Form.Item {...field} name={[field.name, 'endDate']} label="По дату">
                          <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item {...field} name={[field.name, 'reason']} label="Причина">
                          <Select options={PROPERTY_BLOCK_REASONS} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={4}>
                        <Form.Item label=" ">
                          <Button danger block onClick={() => remove(field.name)}>Удалить</Button>
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item {...field} name={[field.name, 'comment']} label="Комментарий">
                          <Input placeholder="Например, ремонт крыши" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ id: `block-${Date.now()}`, startDate: dayjs(), endDate: dayjs(), reason: 'unavailable', comment: '' })}>
                  Закрыть день / диапазон
                </Button>
              </Space>
            )}
          </Form.List>

          <Divider orientation="left">Pricing calendar</Divider>
          <Form.List name="pricingRules">
            {(fields, { add, remove }) => (
              <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                {fields.map((field) => (
                  <Card key={field.key} size="small" className="tp-admin-inline-card">
                    <Row gutter={10}>
                      <Col xs={24} md={6}>
                        <Form.Item {...field} name={[field.name, 'type']} label="Тип">
                          <Select options={PROPERTY_PRICING_RULE_TYPES} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item {...field} name={[field.name, 'startDate']} label="С даты">
                          <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={5}>
                        <Form.Item {...field} name={[field.name, 'endDate']} label="По дату">
                          <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Item {...field} name={[field.name, 'price']} label="Цена">
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Item label=" ">
                          <Button danger block onClick={() => remove(field.name)}>Удалить</Button>
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'discount']} label="Discount %">
                          <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item {...field} name={[field.name, 'minimumStay']} label="Minimum stay">
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item {...field} name={[field.name, 'label']} label="Название">
                          <Input placeholder="Новый год, высокий сезон..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ id: `pricing-${Date.now()}`, type: 'specific_date', startDate: dayjs(), endDate: dayjs(), price: 0, discount: 0, minimumStay: 0, label: '' })}>
                  Добавить правило цены
                </Button>
              </Space>
            )}
          </Form.List>

          <Form.Item name="amenities" label="Удобства">
            <Checkbox.Group options={ACCOMMODATION_AMENITIES} />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="extraBedAvailable" label="Дополнительное место" valuePropName="checked">
                <Switch checkedChildren="Да" unCheckedChildren="Нет" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="extraBedPrice" label="Цена доп. места">
                <InputNumber min={0} style={{ width: '100%' }} suffix="сом" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Дополнительные услуги</Divider>
          <Form.List name="extraServices">
            {(fields, { add, remove }) => (
              <div className="tp-admin-inline-list">
                {fields.map((field, index) => (
                  <Card
                    key={field.key}
                    size="small"
                    className="admin-accommodation-card"
                    title={`Услуга ${index + 1}`}
                    extra={<Button danger size="small" onClick={() => remove(field.name)}>Удалить</Button>}
                  >
                    <Form.Item {...field} name={[field.name, 'id']} hidden>
                      <Input />
                    </Form.Item>
                    <Row gutter={12}>
                      <Col xs={24} md={12}>
                        <Form.Item name={[field.name, 'title']} label="Название услуги" rules={[{ required: true, message: 'Введите название услуги' }]}>
                          <Input placeholder="Аренда лошади" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name={[field.name, 'type']} label="Тип выбора" initialValue="toggle">
                          <Select options={ACCOMMODATION_EXTRA_SERVICE_TYPES} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name={[field.name, 'description']} label="Описание">
                      <Input placeholder="Короткое описание услуги" />
                    </Form.Item>

                    <Row gutter={12}>
                      <Col xs={24} md={8}>
                        <Form.Item name={[field.name, 'price']} label="Цена" initialValue={0}>
                          <InputNumber min={0} style={{ width: '100%' }} suffix="сом" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name={[field.name, 'maxQuantity']} label="Макс. количество" initialValue={1}>
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item name={[field.name, 'unitLabel']} label="Ед. измерения" initialValue="шт.">
                          <Input placeholder="шт." />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={12}>
                      <Col xs={24} md={12}>
                        <Form.Item name={[field.name, 'sortOrder']} label="Порядок" initialValue={index}>
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name={[field.name, 'active']} label="Активна" valuePropName="checked" initialValue>
                          <Switch checkedChildren="Да" unCheckedChildren="Нет" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item noStyle shouldUpdate={(prev, next) => prev.extraServices?.[field.name]?.type !== next.extraServices?.[field.name]?.type}>
                      {({ getFieldValue }) => {
                        const type = getFieldValue(['extraServices', field.name, 'type']);
                        if (type !== 'select') return null;

                        return (
                          <Form.List name={[field.name, 'options']}>
                            {(optionFields, optionOps) => (
                              <div className="tp-admin-inline-list">
                                <Text strong>Варианты выбора</Text>
                                {optionFields.map((optionField, optionIndex) => (
                                  <Space key={optionField.key} align="baseline" style={{ width: '100%' }}>
                                    <Form.Item {...optionField} name={[optionField.name, 'id']} hidden>
                                      <Input />
                                    </Form.Item>
                                    <Form.Item
                                      {...optionField}
                                      name={[optionField.name, 'label']}
                                      label={optionIndex === 0 ? 'Название варианта' : ''}
                                      rules={[{ required: true, message: 'Введите название варианта' }]}
                                      style={{ flex: 1 }}
                                    >
                                      <Input placeholder="3 км" />
                                    </Form.Item>
                                    <Form.Item
                                      {...optionField}
                                      name={[optionField.name, 'price']}
                                      label={optionIndex === 0 ? 'Цена' : ''}
                                      rules={[{ required: true, message: 'Укажите цену' }]}
                                      style={{ width: 180 }}
                                    >
                                      <InputNumber min={0} style={{ width: '100%' }} suffix="сом" />
                                    </Form.Item>
                                    <Button danger onClick={() => optionOps.remove(optionField.name)}>Удалить</Button>
                                  </Space>
                                ))}
                                <Button type="dashed" block onClick={() => optionOps.add({ id: '', label: '', price: 0 })}>
                                  Добавить вариант
                                </Button>
                              </div>
                            )}
                          </Form.List>
                        );
                      }}
                    </Form.Item>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => add({
                    id: '',
                    title: '',
                    description: '',
                    type: 'toggle',
                    price: 0,
                    maxQuantity: 1,
                    unitLabel: 'шт.',
                    active: true,
                    sortOrder: fields.length,
                    options: [],
                  })}
                >
                  Добавить услугу
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Drawer>

      <Drawer
        title="Редактировать бронь домика"
        open={stayBookingDrawerOpen}
        onClose={closeStayBookingEditor}
        size={isDesktop ? 720 : '100%'}
        className="tp-admin-form-drawer tp-admin-form-drawer--stay-booking"
        footer={(
          <div className="tp-admin-drawer-footer">
            <Button onClick={closeStayBookingEditor}>Отмена</Button>
            <Button type="primary" loading={stayBookingEditLoading} onClick={() => stayBookingForm.submit()}>
              Сохранить изменения
            </Button>
          </div>
        )}
      >
        <Form form={stayBookingForm} layout="vertical" onFinish={saveStayBookingEditor} className="tp-admin-form">
          <div className="tp-admin-stay-form-hero">
            <div>
              <strong>{editingStayAccommodation?.title || editingStayBooking?.stayTitle || 'Бронь домика'}</strong>
              <p>Измените дату, гостей, услуги и статус. Итоговая сумма пересчитается автоматически.</p>
            </div>
            <Tag color="blue">{editingStayBooking?.companyName || currentCompany?.name || 'TravelPay Business'}</Tag>
          </div>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="clientName" label="Имя клиента" rules={[{ required: true, message: 'Укажите имя клиента' }]}>
                <Input placeholder="Имя клиента" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="clientPhone" label="Телефон" rules={[{ required: true, message: 'Укажите телефон' }]}>
                <Input placeholder="+996 ..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="clientEmail" label="Email">
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="checkInDate" label="Дата заезда" rules={[{ required: true, message: 'Выберите дату' }]}>
                <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="checkInTime" label="Время">
                <Select options={STAY_BOOKING_TIME_OPTIONS.map((time) => ({ value: time, label: time }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="status" label="Статус">
                <Select
                  options={[
                    { value: 'payment_review', label: 'Чек на проверке' },
                    { value: 'confirmed', label: 'Подтверждено' },
                    { value: 'cancelled', label: 'Отменено' },
                    { value: 'rejected', label: 'Отклонено' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="guests" label="Гости">
                <InputNumber min={1} max={editingStayAccommodation?.capacity || 20} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="nights" label="Ночей">
                <InputNumber min={1} max={30} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} placeholder="Комментарий менеджера или клиента" />
          </Form.Item>

          {editingStayServices.length ? (
            <>
              <Divider orientation="left">Дополнительные услуги</Divider>
              <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                {editingStayServices.map((service) => {
                  const selection = stayBookingEditorExtras[service.id] || {};
                  return (
                    <Card key={service.id} size="small" className="admin-accommodation-card">
                      <div className="stay-extra-service-card__top">
                        <div>
                          <strong>{service.title}</strong>
                          {service.description ? <p>{service.description}</p> : null}
                        </div>
                        <span>{formatMoney(service.price)}</span>
                      </div>

                      {service.type === 'quantity' && (
                        <InputNumber
                          min={0}
                          max={Math.max(Number(service.maxQuantity) || 1, 1)}
                          value={selection.quantity || 0}
                          onChange={(value) => setStayBookingEditorExtras((current) => ({
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
                          onChange={(value) => setStayBookingEditorExtras((current) => ({
                            ...current,
                            [service.id]: { selectedOptionId: value || '' },
                          }))}
                          options={(service.options || []).map((option) => ({
                            value: option.id,
                            label: `${option.label} — ${formatMoney(option.price)}`,
                          }))}
                        />
                      )}

                      {service.type === 'toggle' && (
                        <Checkbox
                          checked={Boolean(selection.selected)}
                          onChange={(event) => setStayBookingEditorExtras((current) => ({
                            ...current,
                            [service.id]: { selected: event.target.checked },
                          }))}
                        >
                          Добавить в бронь
                        </Checkbox>
                      )}
                    </Card>
                  );
                })}
              </Space>
            </>
          ) : null}

          <Divider orientation="left">Итог</Divider>
          <Card size="small" className="tp-admin-inline-card">
            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
              <div className="tp-admin-calendar-client-row">
                <div>
                  <strong>Проживание</strong>
                  <div><Text type="secondary">Базовая стоимость</Text></div>
                </div>
                <strong>{formatMoney(editingStayBaseAmount)}</strong>
              </div>
              {editingStayBookingSummary.map((extra) => (
                <div key={`${extra.serviceId}-${extra.selectedOptionId || extra.quantity || 1}`} className="tp-admin-calendar-client-row">
                  <div>
                    <strong>{getStayBookingExtraLabel(extra)}</strong>
                    <div><Text type="secondary">{formatMoney(extra.unitPrice)}{Number(extra.quantity) > 1 ? ` × ${extra.quantity}` : ''}</Text></div>
                  </div>
                  <strong>{formatMoney(extra.total)}</strong>
                </div>
              ))}
              <Divider style={{ margin: '4px 0' }} />
              <div className="tp-admin-calendar-client-row">
                <div>
                  <strong>Итого</strong>
                  <div><Text type="secondary">После пересчета</Text></div>
                </div>
                <strong>{formatMoney(editingStayTotalAmount)}</strong>
              </div>
            </Space>
          </Card>
        </Form>
      </Drawer>

      <Modal
        open={Boolean(reviewRequest)}
        title={reviewAction === 'approve' ? 'Подтвердить пополнение' : 'Отклонить пополнение'}
        okText={reviewAction === 'approve' ? 'Подтвердить и начислить' : 'Отклонить заявку'}
        cancelText="Отмена"
        okButtonProps={{ danger: reviewAction === 'reject' }}
        confirmLoading={reviewLoading}
        onOk={() => reviewForm.submit()}
        onCancel={closeReviewModal}
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleReviewSubmit}>
          {reviewAction === 'approve' ? (
            <>
              <Form.Item name="amount" label="Сумма пополнения" rules={[{ required: true, message: 'Укажите сумму' }]}>
                <InputNumber min={1} style={{ width: '100%' }} suffix="сом" />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="bonusType" label="Тип бонуса">
                    <Select options={[
                      { value: 'fixed', label: 'Фиксированный' },
                      { value: 'percent', label: 'Процент' },
                    ]} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="bonus" label="Бонус">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="adminComment" label="Комментарий администратора">
                <Input.TextArea rows={4} placeholder="Комментарий пользователю" />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="adminComment"
              label="Причина отклонения"
              rules={[{ required: true, message: 'Укажите причину отклонения' }]}
            >
              <Input.TextArea rows={5} placeholder="Например: сумма или реквизиты на чеке не совпадают" />
            </Form.Item>
          )}
        </Form>
      </Modal>
      {renderCommandPalette()}
    </div>
  );
};

const topupResponseSort = (items) => [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export default ActualToursAdmin;
