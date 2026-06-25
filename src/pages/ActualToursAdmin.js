import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Grid,
  Image,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Progress,
  Rate,
  Result,
  Row,
  Segmented,
  Select,
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
  BarChartOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  CompassOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  HomeOutlined,
  LinkOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoreOutlined,
  MoonOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { clearCurrentUser, readCurrentUser } from '../utils/currentUser';
import { normalizeUser } from '../utils/user';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

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

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');
const formatDateTime = (value) => (value ? new Date(value).toLocaleString('ru-RU') : '—');

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

const BOOKING_STATUS_META = {
  paid: { label: 'Оплачено', color: 'green', badge: 'success' },
  confirmed: { label: 'Подтверждено', color: 'green', badge: 'success' },
  pending: { label: 'Ожидает оплаты', color: 'orange', badge: 'warning' },
  cancelled: { label: 'Отменено', color: 'red', badge: 'error' },
  rejected: { label: 'Отклонено', color: 'red', badge: 'error' },
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
  availableCount: 1,
  amenities: [],
  extraBedAvailable: false,
  extraBedPrice: 0,
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
  totalCount: Number(item.totalCount || item.availableCount || 0),
  availableCount: Number(item.availableCount || 0),
  amenities: Array.isArray(item.amenities) ? item.amenities : [],
  extraBedAvailable: Boolean(item.extraBedAvailable),
  extraBedPrice: Number(item.extraBedPrice || 0),
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
  tourTitle: item.stayTitle || item.title || 'Бронь домика',
  stayTitle: item.stayTitle || item.title || '',
  location: item.location || '',
  amount: Number(item.amount || 0),
  status: item.status || 'pending',
  paymentStatus: item.status === 'confirmed' ? 'confirmed' : item.status || 'pending',
  purchasedAt: item.createdAt || item.checkInDate || new Date().toISOString(),
  travelDate: item.checkInDate || '',
  bookingDate: item.checkInDate || item.createdAt || new Date().toISOString(),
  date: item.checkInDate || item.createdAt || new Date().toISOString(),
  endDate: item.checkOutDate || item.checkInDate || '',
  durationMinutes: Number(item.durationMinutes || 120),
  assignedTo: item.companyName || 'TravelPay Business',
  guests: Number(item.guests || 1),
  nights: Number(item.nights || 1),
  checkInTime: item.checkInTime || '14:00',
  comment: item.comment || '',
});

const normalizeTourRecord = (tour, index = 0) => {
  const fallbackStatuses = ['active', 'hot', 'discount', 'draft'];
  const startDate = tour.startDate || tour.dateStart || tour.departureDate || tour.date || '';
  const endDate = tour.endDate || tour.dateEnd || tour.returnDate || '';
  const totalSeats = Number(tour.totalSeats || tour.seats || tour.capacity || 20);
  const bookedSeats = Number(tour.bookedSeats || 0);
  return {
    ...tour,
    key: tour.id,
    status: tour.status || fallbackStatuses[index % fallbackStatuses.length],
    rating: Number(tour.rating || 4.8),
    price: Number(tour.price || 0),
    companyId: Number(tour.companyId || 1),
    companyName: tour.companyName || '',
    startDate,
    endDate,
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
  if (pathname === '/admin/accommodations' || pathname === '/business/accommodations') return 'accommodations';
  if (pathname === '/admin/bookings' || pathname === '/business/bookings') return 'bookings';
  if (pathname === '/admin/users' || pathname === '/admin/clients' || pathname === '/business/clients') return 'clients';
  if (pathname === '/admin/topups' || pathname === '/admin/savings') return 'savings';
  if (pathname === '/admin/stats' || pathname === '/admin/reports' || pathname === '/business/reports') return 'reports';
  if (pathname === '/admin/companies') return 'companies';
  if (pathname === '/admin/settings') return 'settings';
  return 'home';
};

const getCatalogMode = (pathname) => (pathname === '/admin/accommodations' || pathname === '/business/accommodations' ? 'accommodations' : 'tours');

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
  const time = booking?.checkInTime || booking?.time;
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

const getBookingStatusVisual = (status) => ({
  paid: { label: 'Подтверждено', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  confirmed: { label: 'Подтверждено', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)' },
  pending: { label: 'Ожидает', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  new: { label: 'Новая заявка', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.13)' },
  cancelled: { label: 'Отменено', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
  rejected: { label: 'Отменено', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)' },
  completed: { label: 'Завершено', color: '#64748b', bg: 'rgba(100, 116, 139, 0.13)' },
}[status] || { label: 'Новая заявка', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.13)' });

const toDayjsField = (value) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const ActualToursAdmin = ({ businessMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const weekBoardRef = useRef(null);
  const sessionUser = readCurrentUser();
  const isSuperAdmin = sessionUser?.role === 'super_admin';
  const basePath = businessMode ? '/business' : '/admin';
  const homePath = businessMode ? '/business/dashboard' : '/admin/home';

  const [tourForm] = Form.useForm();
  const [accommodationForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [stayBookings, setStayBookings] = useState([]);
  const [topupRequests, setTopupRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [tourDrawerOpen, setTourDrawerOpen] = useState(false);
  const [accommodationDrawerOpen, setAccommodationDrawerOpen] = useState(false);
  const [editingTourId, setEditingTourId] = useState(null);
  const [editingAccommodationId, setEditingAccommodationId] = useState(null);
  const [reviewRequest, setReviewRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('approve');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [messageState, setMessageState] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => (
    localStorage.getItem('travelpay_admin_theme')
    || localStorage.getItem('travelpay_theme')
    || 'dark'
  ));

  const [tourSearch, setTourSearch] = useState('');
  const [tourStatusFilter, setTourStatusFilter] = useState('all');
  const [clientSearch, setClientSearch] = useState('');
  const [bookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingManagerFilter, setBookingManagerFilter] = useState('all');
  const [calendarDate, setCalendarDate] = useState(dayjs());
  const [bookingTab, setBookingTab] = useState('week');
  const [weekManagerSelection, setWeekManagerSelection] = useState([]);
  const [calendarCompanyFilter] = useState('all');
  const [calendarTourStatusFilter] = useState('all');
  const [calendarMode] = useState('all');
  const [calendarSearch, setCalendarSearch] = useState('');
  const [calendarDrawerItem, setCalendarDrawerItem] = useState(null);
  const [catalogMode, setCatalogMode] = useState(getCatalogMode(location.pathname));

  const hasAccommodation = Form.useWatch('hasAccommodation', tourForm);
  const currentTab = useMemo(() => getCurrentTab(location.pathname), [location.pathname]);

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

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [toursResponse, usersResponse, companiesResponse, accommodationsResponse, stayBookingsResponse, topupsResponse] = await Promise.all([
        api.get('/tours', { headers: { 'x-user-id': sessionUser?.id } }),
        api.get('/users', { headers: { 'x-user-id': sessionUser?.id } }),
        api.get('/companies', { headers: { 'x-user-id': sessionUser?.id } }).catch(() => ({ data: [] })),
        api.get('/accommodations', { headers: { 'x-user-id': sessionUser?.id } }).catch(() => ({ data: [] })),
        api.get('/stay-bookings', { headers: { 'x-user-id': sessionUser?.id } }).catch(() => ({ data: [] })),
        api.get('/api/admin/topups', { headers: { 'x-user-id': sessionUser?.id } }).catch(() => ({ data: [] })),
      ]);

      setTours((toursResponse.data || []).map(normalizeTourRecord));
      setUsers((usersResponse.data || []).map(normalizeUser));
      setCompanies(companiesResponse.data || []);
      setAccommodations((accommodationsResponse.data || []).map(normalizeAccommodation));
      setStayBookings((stayBookingsResponse.data || []).map(normalizeStayBooking));
      setTopupRequests(topupResponseSort(topupsResponse.data || []));
    } catch (error) {
      setMessageState({ type: 'error', text: 'Не удалось загрузить данные админ-панели.' });
    } finally {
      setLoading(false);
    }
  }, [sessionUser?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
    if (currentTab !== 'bookings' || bookingTab !== 'week') return;
    const selectedDay = weekBoardRef.current?.querySelector('.tp-admin-week-board__day-tab.is-selected');
    selectedDay?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [bookingTab, calendarDate, currentTab]);

  const currentCompany = useMemo(() => {
    if (!companies.length) return null;
    return companies.find((item) => Number(item.id) === Number(sessionUser?.companyId)) || companies[0];
  }, [companies, sessionUser?.companyId]);

  const companiesById = useMemo(() => (
    new Map(companies.map((company) => [Number(company.id), company]))
  ), [companies]);

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
    const tourBookings = users.flatMap((user) => (user?.travelHistory || []).map((item, index) => ({
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

    return [...tourBookings, ...stayBookings];
  }, [currentCompany?.name, stayBookings, users]);

  const managerOptions = useMemo(() => {
    const unique = Array.from(new Set(bookingRows.map((item) => item.assignedTo).filter(Boolean)));
    return unique.map((value) => ({ value, label: value }));
  }, [bookingRows]);

  const companyOptions = useMemo(() => {
    const list = isSuperAdmin ? companies : (currentCompany ? [currentCompany] : companies);
    return list.map((company) => ({
      value: String(company.id),
      label: company.name,
    }));
  }, [companies, currentCompany, isSuperAdmin]);

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

  const filteredClients = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();

    return users.filter((user) => {
      const haystack = [user.name, user.email, user.phone, user.role, user.level].filter(Boolean).join(' ').toLowerCase();
      return !query || haystack.includes(query);
    });
  }, [clientSearch, users]);

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

      return matchesStatus && matchesManager && (!query || haystack.includes(query));
    });
  }, [bookingManagerFilter, bookingRows, bookingSearch, bookingStatusFilter, calendarSearch]);

  const tourCalendarEntries = useMemo(() => tours.map((tour, index) => {
    const companyId = Number(tour.companyId || currentCompany?.id || sessionUser?.companyId || 0);
    const companyName = tour.companyName || companiesById.get(companyId)?.name || currentCompany?.name || 'TravelPay';
    const realStart = dayjs(tour.startDate || tour.dateStart || tour.departureDate || tour.date || '');
    const realEnd = dayjs(tour.endDate || tour.dateEnd || tour.returnDate || '');
    const linkedBookings = bookingRows.filter((booking) => Number(booking.tourId) === Number(tour.id));
    const durationDays = parseDurationDays(tour.duration || tour.durationDays);

    let start = realStart;
    if (!start.isValid()) {
      const monthStart = calendarDate.startOf('month');
      const offset = ((Number(tour.id) || index + 1) * 3) % 21;
      start = monthStart.add(offset, 'day').hour(9 + (index % 3)).minute(index % 2 ? 30 : 0);
    }

    let end = realEnd;
    if (!end.isValid() || end.isBefore(start)) {
      end = start.add(Math.max(durationDays - 1, 0), 'day').hour(18).minute(0);
    }

    const totalSeats = Number(tour.totalSeats || tour.seats || tour.capacity || 20);
    const bookedSeats = Number(tour.bookedSeats || linkedBookings.length);
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
      key: `tour-calendar-${tour.id}`,
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
      clients: linkedBookings,
    };
  }), [bookingRows, calendarDate, companiesById, currentCompany?.id, currentCompany?.name, sessionUser?.companyId, tours]);

  const toursCalendarById = useMemo(() => (
    new Map(tourCalendarEntries.map((tour) => [Number(tour.id), tour]))
  ), [tourCalendarEntries]);

  const filteredTourCalendarEntries = useMemo(() => {
    const query = calendarSearch.trim().toLowerCase();

    return tourCalendarEntries.filter((tour) => {
      const matchesCompany = calendarCompanyFilter === 'all' || String(tour.companyId) === calendarCompanyFilter;
      const matchesStatus = calendarTourStatusFilter === 'all' || tour.status === calendarTourStatusFilter;
      const haystack = [
        tour.title,
        tour.companyName,
        tour.route,
        tour.location,
      ].filter(Boolean).join(' ').toLowerCase();

      return matchesCompany && matchesStatus && (!query || haystack.includes(query));
    });
  }, [calendarCompanyFilter, calendarSearch, calendarTourStatusFilter, tourCalendarEntries]);

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
        type: 'booking',
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
      return matchesScope && matchesCompanyFilter;
    }), [calendarCompanyFilter, companiesById, currentCompany?.id, currentCompany?.name, filteredBookings, isSuperAdmin, sessionUser?.companyId, toursCalendarById]);

  const calendarEntries = useMemo(() => {
    if (calendarMode === 'tours') return filteredTourCalendarEntries;
    if (calendarMode === 'bookings') return filteredBookingCalendarEntries;
    return [...filteredTourCalendarEntries, ...filteredBookingCalendarEntries];
  }, [calendarMode, filteredBookingCalendarEntries, filteredTourCalendarEntries]);

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

  const selectedDayCalendarEntries = useMemo(() => {
    const selected = calendarDate.startOf('day');
    return calendarEntries.filter((entry) => {
      const start = dayjs(entry.startDate).startOf('day');
      const end = dayjs(entry.endDate || entry.startDate).startOf('day');
      return selected.isSame(start, 'day') || selected.isSame(end, 'day') || (selected.isAfter(start, 'day') && selected.isBefore(end, 'day'));
    });
  }, [calendarDate, calendarEntries]);

  const selectedWeekCalendarEntries = useMemo(() => {
    const weekStart = dayjs(startOfWeek(calendarDate.toDate())).startOf('day');
    const weekEnd = weekStart.add(6, 'day').endOf('day');

    return calendarEntries.filter((entry) => {
      const start = dayjs(entry.startDate);
      const end = dayjs(entry.endDate || entry.startDate);
      return start.isBefore(weekEnd) && end.isAfter(weekStart);
    });
  }, [calendarDate, calendarEntries]);

  const weekCalendarEntries = useMemo(() => selectedWeekCalendarEntries.filter((entry) => {
    if (entry.type !== 'booking') return true;
    if (!weekManagerSelection.length) return true;
    return weekManagerSelection.includes(entry.assignedTo);
  }), [selectedWeekCalendarEntries, weekManagerSelection]);

  const weekCalendarDays = useMemo(() => (
    Array.from({ length: 7 }, (_, index) => {
      const date = dayjs(startOfWeek(calendarDate.toDate())).add(index, 'day');
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
  ), [calendarDate]);

  const weekBoardStartHour = 8;
  const weekBoardEndHour = 22;
  const weekHourHeight = 96;
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
      startDate: calendarDate.hour(9).minute(0),
      endDate: calendarDate.hour(18).minute(0),
      route: '',
      manager: sessionUser?.name || currentCompany?.name || '',
      totalSeats: 20,
      bookedSeats: 0,
      calendarStatus: 'scheduled',
      hasAccommodation: false,
      accommodations: [],
      accommodationIds: [],
    });
    setTourDrawerOpen(true);
  };

  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    tourForm.setFieldsValue({
      ...tour,
      companyId: tour.companyId ? String(tour.companyId) : (currentCompany?.id ? String(currentCompany.id) : undefined),
      rating: Number(tour.rating || 4.8),
      price: Number(tour.price || 0),
      startDate: toDayjsField(tour.startDate || tour.dateStart || tour.departureDate || tour.date),
      endDate: toDayjsField(tour.endDate || tour.dateEnd || tour.returnDate),
      route: tour.route || tour.location || '',
      manager: tour.manager || '',
      totalSeats: Number(tour.totalSeats || tour.seats || tour.capacity || 20),
      bookedSeats: Number(tour.bookedSeats || 0),
      calendarStatus: tour.calendarStatus || tour.tripStatus || tour.scheduleStatus || 'scheduled',
      hasAccommodation: Boolean(tour.hasAccommodation),
      accommodations: (tour.accommodations || []).map(normalizeAccommodation),
      accommodationIds: tour.accommodationIds || [],
    });
    setTourDrawerOpen(true);
  };

  const closeTourDrawer = () => {
    setTourDrawerOpen(false);
    setEditingTourId(null);
    tourForm.resetFields();
  };

  const handleSaveTour = async (values) => {
    const accommodationsPayload = (values.accommodations || []).map(normalizeAccommodation).map((item) => ({
      ...item,
      images: (item.images || []).filter(Boolean),
    }));

    const payload = {
      ...values,
      companyId: Number(values.companyId || currentCompany?.id || sessionUser?.companyId || 1),
      companyName: companiesById.get(Number(values.companyId || currentCompany?.id || sessionUser?.companyId || 1))?.name || currentCompany?.name || values.companyName || 'TravelPay',
      price: Number(values.price || 0),
      rating: Number(values.rating || 0),
      startDate: values.startDate?.toISOString?.() || '',
      endDate: values.endDate?.toISOString?.() || values.startDate?.toISOString?.() || '',
      route: values.route || values.location || '',
      manager: values.manager || currentCompany?.name || sessionUser?.name || '',
      totalSeats: Number(values.totalSeats || 0),
      bookedSeats: Math.min(Number(values.bookedSeats || 0), Number(values.totalSeats || values.bookedSeats || 0)),
      calendarStatus: values.calendarStatus || 'scheduled',
      hasAccommodation: Boolean(values.hasAccommodation),
      accommodationIds: values.hasAccommodation ? (values.accommodationIds || []) : [],
      accommodations: values.hasAccommodation ? accommodationsPayload : [],
    };

    try {
      if (editingTourId) {
        await api.put(`/tours/${editingTourId}`, payload, { headers: { 'x-user-id': sessionUser?.id } });
      } else {
        await api.post('/tours', payload, { headers: { 'x-user-id': sessionUser?.id } });
      }

      await loadDashboardData();
      closeTourDrawer();
      setMessageState({ type: 'success', text: 'Тур сохранён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось сохранить тур.' });
    }
  };

  const updateCompanyStatus = async (company, status) => {
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
        }, { headers: { 'x-user-id': sessionUser?.id } });
        await loadDashboardData();
        setMessageState({ type: 'success', text: 'Статус компании обновлен.' });
      },
    });
  };

  const deleteTour = async (id) => {
    try {
      await api.delete(`/tours/${id}`, { headers: { 'x-user-id': sessionUser?.id } });
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
    accommodationForm.setFieldsValue({
      ...normalizeAccommodation(item),
      title: item.title || item.name,
      images: item.images?.length ? item.images : [''],
      companyId: item.companyId ? String(item.companyId) : (currentCompany?.id ? String(currentCompany.id) : undefined),
      companyName: item.companyName || currentCompany?.name || '',
    });
    setAccommodationDrawerOpen(true);
  };

  const closeAccommodationDrawer = () => {
    setAccommodationDrawerOpen(false);
    setEditingAccommodationId(null);
    accommodationForm.resetFields();
  };

  const handleSaveAccommodation = async (values) => {
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
      extraBedPrice: Number(values.extraBedPrice || 0),
    };

    try {
      if (editingAccommodationId) {
        await api.put(`/accommodations/${editingAccommodationId}`, payload, { headers: { 'x-user-id': sessionUser?.id } });
      } else {
        await api.post('/accommodations', payload, { headers: { 'x-user-id': sessionUser?.id } });
      }

      await loadDashboardData();
      closeAccommodationDrawer();
      setMessageState({ type: 'success', text: 'Домик сохранён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось сохранить домик.' });
    }
  };

  const deleteAccommodation = async (id) => {
    try {
      await api.delete(`/accommodations/${id}`, { headers: { 'x-user-id': sessionUser?.id } });
      await loadDashboardData();
      setMessageState({ type: 'success', text: 'Домик удалён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось удалить домик.' });
    }
  };

  const toggleAdmin = async (user) => {
    try {
      await api.put(`/users/${user.id}`, {
        ...user,
        role: user.role === 'company_admin' ? 'user' : 'company_admin',
      }, {
        headers: { 'x-user-id': sessionUser?.id },
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
      await api.put(endpoint, values, { headers: { 'x-user-id': sessionUser?.id } });
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
      if (key === 'profile') navigate('/profile');
      if (key === 'role') toggleAdmin(user);
    },
  });

  const getBookingActions = (booking) => ({
    items: [
      { key: 'details', icon: <EyeOutlined />, label: 'Подробнее' },
      ...(booking.type === 'stay_booking' ? [
        { key: 'confirm', icon: <CheckOutlined />, label: 'Подтвердить' },
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
          width: 520,
          okText: 'Закрыть',
          content: (
            <Space direction="vertical" size={10} style={{ width: '100%', marginTop: 12 }}>
              <div><Text type="secondary">Клиент</Text><br /><strong>{booking.clientName || '—'}</strong></div>
              <div><Text type="secondary">Тур</Text><br /><strong>{booking.tourTitle || '—'}</strong></div>
              <div><Text type="secondary">Дата и время</Text><br /><strong>{formatDateTime(booking.bookingDate)}</strong></div>
              {booking.type === 'stay_booking' && <div><Text type="secondary">Гости / комментарий</Text><br /><strong>{booking.guests || 1} гостей</strong><br /><Text>{booking.comment || 'Комментария нет'}</Text></div>}
              <div><Text type="secondary">Менеджер</Text><br /><strong>{booking.assignedTo || '—'}</strong></div>
              <div><Text type="secondary">Сумма</Text><br /><strong>{formatMoney(booking.amount)}</strong></div>
            </Space>
          ),
        });
      }

      if (booking.type === 'stay_booking' && (key === 'confirm' || key === 'cancel')) {
        try {
          await api.put(`/stay-bookings/${booking.id}`, {
            status: key === 'confirm' ? 'confirmed' : 'cancelled',
          }, { headers: { 'x-user-id': sessionUser?.id } });
          message.success(key === 'confirm' ? 'Бронь домика подтверждена.' : 'Бронь домика отменена.');
          loadDashboardData();
        } catch (error) {
          message.error(error?.response?.data?.message || 'Не удалось обновить бронь домика.');
        }
      }

      if (key === 'edit') {
        message.info('Редактирование бронирований подключим следующим этапом без изменения текущей логики.');
      }

      if (key === 'delete') {
        message.warning('Удаление бронирований пока недоступно в этом интерфейсе.');
      }
    },
  });

  const openCalendarItemDetails = (item) => {
    setCalendarDrawerItem(item);
  };

  const closeCalendarItemDetails = () => {
    setCalendarDrawerItem(null);
  };

  const updateStayBookingStatus = async (booking, status) => {
    if (!booking?.id || booking.type !== 'stay_booking') {
      message.info('Это действие доступно для броней домиков.');
      return;
    }

    try {
      await api.put(`/stay-bookings/${booking.id}`, { status }, { headers: { 'x-user-id': sessionUser?.id } });
      message.success(status === 'confirmed' ? 'Бронь подтверждена.' : 'Бронь отменена.');
      setCalendarDrawerItem((current) => current ? { ...current, status } : current);
      loadDashboardData();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Не удалось обновить статус брони.');
    }
  };

  const tourColumns = [
    {
      title: 'Фото',
      dataIndex: 'image',
      width: 90,
      render: (image, record) => (
        <Image
          width={64}
          height={48}
          src={image}
          alt={record.title}
          className="tp-admin-table-image"
          preview={false}
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
        <Image
          width={64}
          height={48}
          src={images?.[0]}
          alt={record.title || record.name}
          className="tp-admin-table-image"
          preview={false}
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
    { title: 'Клиент', dataIndex: 'name', width: 180 },
    { title: 'Email', dataIndex: 'email', width: 240 },
    { title: 'Телефон', dataIndex: 'phone', width: 150, render: (value) => value || '—' },
    { title: 'Роль', dataIndex: 'role', width: 140, render: (value) => <Tag>{value}</Tag> },
    { title: 'Накоплено', width: 150, render: (_, record) => formatMoney(record?.savings?.currentAmount) },
    { title: 'Поездки', width: 110, render: (_, record) => record?.travelHistory?.length || 0 },
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
        <Space direction="vertical" size={2}>
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
        const meta = BOOKING_STATUS_META[status] || BOOKING_STATUS_META.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
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
          <Avatar src={record.clientAvatar} icon={<UserOutlined />} />
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
        <Space direction="vertical" size={2}>
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
        const meta = BOOKING_STATUS_META[status] || BOOKING_STATUS_META.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
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
          <Avatar src={record.clientAvatar} icon={<UserOutlined />} />
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
    { title: 'Менеджер', dataIndex: 'assignedTo', width: 180, render: (value) => value || '—' },
    { title: 'Сумма', dataIndex: 'amount', width: 140, render: formatMoney },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 150,
      render: (status) => {
        const meta = BOOKING_STATUS_META[status] || BOOKING_STATUS_META.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
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
  ];

  const headerBranchText = currentCompany?.address || currentCompany?.name || 'TravelPay Company';

  const sidebar = (
    <div className="tp-admin-sidebar-shell">
      <div className={`tp-admin-brand ${collapsed ? 'tp-admin-brand--collapsed' : ''}`}>
        <div className="tp-admin-brand__mark">TP</div>
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
          { key: `${basePath}/reports`, icon: <BarChartOutlined />, label: 'Отчеты' },
          ...(!businessMode ? [{ key: '/admin/settings', icon: <SettingOutlined />, label: 'Настройки' }] : []),
          { type: 'divider' },
          { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
        ]}
      />
    </div>
  );

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

  const renderDashboard = () => (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
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
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
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
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div className="tp-admin-company-card">
                <Avatar size={52} src={sessionUser?.avatar} icon={<UserOutlined />} />
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

  const renderCatalog = () => (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
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

        {catalogMode === 'tours' ? (
          <>
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
    const meta = BOOKING_STATUS_META[booking.status] || BOOKING_STATUS_META.pending;
    return (
      <div key={booking.key} className="tp-admin-booking-card tp-admin-booking-card--compact">
        <div className="tp-admin-booking-card__top">
          <div>
            <Title level={5}>{booking.tourTitle}</Title>
            <Text type="secondary">{booking.clientName} · {booking.clientPhone}</Text>
          </div>
          <Space size={6}>
            {booking.type === 'stay_booking' && <Tag color="cyan">Домик</Tag>}
            <Tag color={meta.color}>{meta.label}</Tag>
          </Space>
        </div>
        <div className="tp-admin-booking-card__meta">
          <span>{formatDateTime(booking.bookingDate)}</span>
          <strong>{formatMoney(booking.amount)}</strong>
        </div>
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
                    className="tp-admin-full-calendar"
                    cellRender={(value) => {
                      const items = calendarEntries.filter((entry) => {
                        const start = dayjs(entry.startDate).startOf('day');
                        const end = dayjs(entry.endDate || entry.startDate).startOf('day');
                        const current = value.startOf('day');
                        return current.isSame(start, 'day') || current.isSame(end, 'day') || (current.isAfter(start, 'day') && current.isBefore(end, 'day'));
                      });
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

  const renderBookingsModern = () => (
    <Row gutter={[20, 20]} className="tp-admin-bookings-shell">
      <Col xs={24} xl={5}>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <Card className="tp-admin-card tp-admin-sticky-card tp-admin-bookings-nav" styles={{ body: { padding: 24 } }}>
            <div className="tp-admin-section-head tp-admin-section-head--tight">
              <div>
                <Text className="tp-admin-section-label">Навигация по датам</Text>
                <Title level={4} style={{ margin: '8px 0 0' }}>Календарь</Title>
              </div>
              <Badge count={selectedDayCalendarEntries.length} color="#2563eb" />
            </div>

            <Calendar
              fullscreen={false}
              value={calendarDate}
              onSelect={setCalendarDate}
              className="tp-admin-mini-calendar"
              headerRender={({ value, onChange }) => {
                const currentYear = value.year();
                const years = Array.from({ length: 7 }, (_, index) => currentYear - 3 + index);

                return (
                  <div className="tp-admin-mini-calendar-header">
                    <div className="tp-admin-mini-calendar-header__controls">
                      <Select
                        size="large"
                        value={value.month()}
                        onChange={(month) => onChange(value.clone().month(month))}
                        options={BOOKING_MONTHS.map((month, index) => ({ label: month, value: index }))}
                      />
                      <Select
                        size="large"
                        value={currentYear}
                        onChange={(year) => onChange(value.clone().year(year))}
                        options={years.map((year) => ({ label: year, value: year }))}
                      />
                    </div>
                    <Button onClick={() => setCalendarDate(dayjs())}>Сегодня</Button>
                  </div>
                );
              }}
              cellRender={(value) => {
                const count = calendarEntries.filter((item) => {
                  const start = dayjs(item.startDate).startOf('day');
                  const end = dayjs(item.endDate || item.startDate).startOf('day');
                  const current = value.startOf('day');
                  return current.isSame(start, 'day') || current.isSame(end, 'day') || (current.isAfter(start, 'day') && current.isBefore(end, 'day'));
                }).length;
                return count ? <div className="tp-admin-mini-calendar__badge">{count}</div> : null;
              }}
            />
          </Card>

        </Space>
      </Col>

      <Col xs={24} xl={19}>
        <Card className="tp-admin-card tp-admin-bookings-card tp-admin-bookings-card--focus" styles={{ body: { padding: 24 } }}>
          <div className="tp-admin-section-head tp-admin-bookings-head tp-admin-bookings-head--compact">
            <div>
              <Text className="tp-admin-section-label">Бронирования</Text>
              <Title level={3} style={{ margin: '8px 0 0' }}>Календарь бронирований</Title>
            </div>
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/tour-booking')}>
              Создать бронирование
            </Button>
          </div>

          <Tabs
            activeKey={bookingTab}
            onChange={setBookingTab}
            className="tp-admin-tabs"
            items={[
              {
                key: 'week',
                label: 'Неделя',
                children: (
                  <div className="tp-admin-week-board" ref={weekBoardRef}>
                    <div className="tp-admin-week-board__header">
                      <div className="tp-admin-week-board__header-spacer" />
                      <div className="tp-admin-week-board__days">
                        {weekEventsByDay.map((day) => (
                          <button
                            key={day.key}
                            type="button"
                            className={`tp-admin-week-board__day-tab${day.isSelected ? ' is-selected' : ''}${day.isToday ? ' is-today' : ''}`}
                            onClick={() => setCalendarDate(day.date)}
                          >
                            <span>{day.label}</span>
                            <strong>{day.dayNumber}</strong>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="tp-admin-week-board__body">
                      <div className="tp-admin-week-board__hours">
                        {weekHourRows.map((hour) => (
                          <div key={hour} className="tp-admin-week-board__hour">
                            {String(hour).padStart(2, '0')}:00
                          </div>
                        ))}
                      </div>

                      <div className="tp-admin-week-board__grid">
                        {weekEventsByDay.map((day) => (
                          <div key={day.key} className="tp-admin-week-board__column">
                            {weekHourRows.map((hour) => (
                              <div key={hour} className="tp-admin-week-board__slot" />
                            ))}

                            {day.items.map((booking) => (
                              <div
                                key={booking.key}
                                className={`tp-admin-week-event${booking.type === 'tour' ? ' is-tour' : ' is-booking'}`}
                                style={booking.style}
                                onClick={() => openCalendarItemDetails(booking)}
                                role="button"
                                tabIndex={0}
                              >
                                <div className="tp-admin-week-event__time">{booking.timeLabel}</div>
                                <div className="tp-admin-week-event__title">{booking.title || booking.tourTitle}</div>
                                {booking.type === 'tour' ? (
                                  <div className="tp-admin-week-event__meta">
                                    <span>🏕 {booking.companyName}</span>
                                    <span>👥 {booking.bookedSeats}/{booking.totalSeats} мест</span>
                                  </div>
                                ) : (
                                  <div className="tp-admin-week-event__meta">
                                    {booking.clientName && <span>👤 {booking.clientName}</span>}
                                    {booking.tourTitle && <span>🏕 {booking.tourTitle}</span>}
                                    {booking.stayTitle && <span>🏠 {booking.stayTitle}</span>}
                                    {booking.guests ? <span>👥 {booking.guests} чел.</span> : null}
                                    {booking.amount ? <span>💰 {formatMoney(booking.amount)}</span> : null}
                                    {booking.clientPhone && <span>📞 {booking.clientPhone}</span>}
                                    {booking.statusVisual && <strong style={{ color: booking.statusVisual.color }}>● {booking.statusVisual.label}</strong>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
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
                    className="tp-admin-full-calendar"
                    cellRender={(value) => {
                      const items = calendarEntries.filter((entry) => {
                        const start = dayjs(entry.startDate).startOf('day');
                        const end = dayjs(entry.endDate || entry.startDate).startOf('day');
                        const current = value.startOf('day');
                        return current.isSame(start, 'day') || current.isSame(end, 'day') || (current.isAfter(start, 'day') && current.isBefore(end, 'day'));
                      });
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
            ]}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderClients = () => (
    <Card className="tp-admin-card">
      <div className="tp-admin-section-head">
        <div>
          <Text className="tp-admin-section-label">Клиенты</Text>
          <Title level={3}>База клиентов</Title>
          <Paragraph>Поиск, роли, уровень пользователя, накопления и история поездок.</Paragraph>
        </div>
      </div>
      <div className="tp-admin-toolbar">
        <Input.Search
          allowClear
          size="large"
          value={clientSearch}
          placeholder="Поиск по имени, email, телефону"
          onChange={(event) => setClientSearch(event.target.value)}
          className="tp-admin-search"
        />
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>Обновить</Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        dataSource={filteredClients}
        columns={clientColumns}
        loading={loading}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 1080 }}
      />
    </Card>
  );

  const renderSavings = () => (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
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

  const renderReports = () => (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card className="tp-admin-card" title="Платежи">
            <Table
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
    const columns = [
      { title: 'Компания', dataIndex: 'name', render: (value, record) => (
        <Space>
          <Avatar src={record.logo} icon={<BankOutlined />} />
          <div>
            <strong>{value}</strong>
            <div><Text type="secondary">{record.city || record.address || 'Адрес не указан'}</Text></div>
          </div>
        </Space>
      ) },
      { title: 'Email', dataIndex: 'email', width: 220 },
      { title: 'Телефон', dataIndex: 'phone', width: 150 },
      { title: 'Статус', dataIndex: 'status', width: 130, render: (status) => {
        const meta = companyStatusMeta[status] || companyStatusMeta.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      } },
      { title: 'Описание', dataIndex: 'description', ellipsis: true, render: (value) => value || '—' },
      { title: 'Документы', dataIndex: 'documents', width: 130, render: (items) => (items?.length ? `${items.length} файл(ов)` : '—') },
      {
        title: 'Действия',
        width: 260,
        fixed: 'right',
        render: (_, record) => (
          <Space wrap size={8}>
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
          <Badge count={companies.filter((item) => item.status === 'pending').length} showZero>
            <Tag color="gold">Pending</Tag>
          </Badge>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={companies}
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 8 }}
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
          </div>
        </Card>
      </Col>
      <Col xs={24} xl={10}>
        <Card className="tp-admin-card" title="Профиль администратора">
          <div className="tp-admin-company-card">
            <Avatar size={60} src={sessionUser?.avatar} icon={<UserOutlined />} />
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

  if (businessMode && !loading && currentCompany && currentCompany.status !== 'active') {
    const isRejected = currentCompany.status === 'rejected';
    return (
      <div className="tp-admin-page">
        <Layout className="tp-admin-layout">
          <Layout className="tp-admin-main">
            <Content className="tp-admin-content">
              <Card className="tp-admin-card">
                <Result
                  status={isRejected ? 'warning' : 'info'}
                  title={isRejected ? 'Заявка компании отклонена' : 'Компания ожидает подтверждения'}
                  subTitle={isRejected
                    ? (currentCompany.rejectionReason || 'Свяжитесь с администратором TravelPay.')
                    : 'Заявка компании отправлена. После проверки вы сможете публиковать туры.'}
                  extra={[
                    <Button key="business" onClick={() => navigate('/business')}>TravelPay Business</Button>,
                    <Button key="logout" type="primary" onClick={handleLogout}>Выйти</Button>,
                  ]}
                />
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
            width={272}
            collapsedWidth={96}
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
          <Header className="tp-admin-header">
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
                <Avatar src={sessionUser?.avatar} icon={<UserOutlined />} />
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

            {currentTab === 'home' && renderDashboard()}
            {(currentTab === 'tours' || currentTab === 'accommodations') && renderCatalog()}
            {currentTab === 'bookings' && renderBookingsModern()}
            {currentTab === 'clients' && renderClients()}
            {currentTab === 'savings' && renderSavings()}
            {currentTab === 'reports' && renderReports()}
            {currentTab === 'companies' && renderCompanies()}
            {currentTab === 'settings' && renderSettings()}
          </Content>
        </Layout>
      </Layout>

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
          <Space direction="vertical" size={18} style={{ width: '100%' }}>
            <div className="tp-admin-calendar-detail">
              <Title level={4} style={{ marginBottom: 8 }}>{calendarDrawerItem.title || calendarDrawerItem.tourTitle}</Title>
              <Space wrap>
                <Tag color={calendarDrawerItem.type === 'tour'
                  ? (TOUR_CALENDAR_STATUS_META[calendarDrawerItem.status] || TOUR_CALENDAR_STATUS_META.scheduled).color
                  : (BOOKING_STATUS_META[calendarDrawerItem.status] || BOOKING_STATUS_META.pending).color}
                >
                  {calendarDrawerItem.type === 'tour'
                    ? (TOUR_CALENDAR_STATUS_META[calendarDrawerItem.status] || TOUR_CALENDAR_STATUS_META.scheduled).label
                    : (BOOKING_STATUS_META[calendarDrawerItem.status] || BOOKING_STATUS_META.pending).label}
                </Tag>
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
                {(calendarDrawerItem.guests || calendarDrawerItem.totalSeats) && <div><Text type="secondary">Гости / места</Text><strong>{calendarDrawerItem.guests ? `${calendarDrawerItem.guests} чел.` : `${calendarDrawerItem.bookedSeats || 0}/${calendarDrawerItem.totalSeats}`}</strong></div>}
                {(calendarDrawerItem.nights || calendarDrawerItem.duration) && <div><Text type="secondary">Длительность</Text><strong>{calendarDrawerItem.nights ? `${calendarDrawerItem.nights} ночи` : calendarDrawerItem.duration}</strong></div>}
                {(calendarDrawerItem.price || calendarDrawerItem.amount) && <div><Text type="secondary">Стоимость</Text><strong>{formatMoney(calendarDrawerItem.price || calendarDrawerItem.amount)}</strong></div>}
                <div><Text type="secondary">Статус</Text><strong>{calendarDrawerItem.type === 'tour'
                  ? (TOUR_CALENDAR_STATUS_META[calendarDrawerItem.status] || TOUR_CALENDAR_STATUS_META.scheduled).label
                  : getBookingStatusVisual(calendarDrawerItem.status).label}</strong></div>
              </div>
            </Card>

            {calendarDrawerItem.comment && (
              <Card size="small" className="tp-admin-inline-card" title="Комментарий">
                <Paragraph style={{ marginBottom: 0 }}>{calendarDrawerItem.comment}</Paragraph>
              </Card>
            )}

            <Card size="small" className="tp-admin-inline-card" title="Клиенты / брони">
              <Space direction="vertical" size={10} style={{ width: '100%' }}>
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
                      <Tag>{client.paymentStatus || client.status || 'pending'}</Tag>
                      {client.amount ? <strong>{formatMoney(client.amount)}</strong> : null}
                    </Space>
                  </div>
                ))}
              </Space>
            </Card>

            <div className="tp-admin-drawer-footer">
              {calendarDrawerItem?.type === 'stay_booking' && (
                <>
                  <Button type="primary" onClick={() => updateStayBookingStatus(calendarDrawerItem, 'confirmed')}>
                    Подтвердить
                  </Button>
                  <Button onClick={() => message.info('Перенос брони подключим следующим шагом.')}>
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
              <Button onClick={() => {
                if (calendarDrawerItem?.type === 'tour') {
                  startEditTour(calendarDrawerItem);
                  closeCalendarItemDetails();
                } else {
                  message.info('Редактирование брони подключим следующим шагом.');
                }
              }}>
                Редактировать
              </Button>
              <Button onClick={() => navigate('/tour-booking')}>
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

          <Form.Item name="image" label="Ссылка на фото" rules={[{ required: true, message: 'Укажите ссылку на фото' }]}>
            <Input placeholder="https://..." />
          </Form.Item>

          <Divider orientation="left">Календарь тура</Divider>

          {isSuperAdmin && (
            <Form.Item name="companyId" label="Тур-компания" rules={[{ required: true, message: 'Выберите компанию' }]}>
              <Select placeholder="Выберите тур-компанию" options={companyOptions} />
            </Form.Item>
          )}

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="startDate" label="Дата начала тура" rules={[{ required: true, message: 'Укажите дату начала' }]}>
                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="endDate" label="Дата окончания тура" rules={[{ required: true, message: 'Укажите дату окончания' }]}>
                <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="route" label="Маршрут">
                <Input placeholder="Бишкек - Каракол - Иссык-Куль" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="manager" label="Менеджер">
                <Input placeholder="Имя менеджера" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item name="totalSeats" label="Количество мест" rules={[{ required: true, message: 'Укажите количество мест' }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="bookedSeats" label="Забронировано мест">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="calendarStatus" label="Статус в календаре">
                <Select options={tourCalendarStatusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Статус" rules={[{ required: true, message: 'Выберите статус' }]}>
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
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
                  <Space direction="vertical" size={14} style={{ width: '100%' }}>
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
              <Form.Item name="totalCount" label="Всего домиков">
                <InputNumber min={0} style={{ width: '100%' }} />
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
    </div>
  );
};

const topupResponseSort = (items) => [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export default ActualToursAdmin;
