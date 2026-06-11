import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Grid,
  Image,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Popconfirm,
  Rate,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusOutlined,
  ReloadOutlined,
  TableOutlined,
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { clearCurrentUser, readCurrentUser } from '../utils/currentUser';
import { normalizeUser } from '../utils/user';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');

const STATUS_META = {
  active: { label: 'Активный', color: 'blue' },
  hot: { label: 'Горящий тур', color: 'volcano' },
  draft: { label: 'Черновик', color: 'default' },
  discount: { label: 'Скидка', color: 'gold' },
};

const TOPUP_STATUS_META = {
  pending: { label: 'На проверке', color: 'orange' },
  approved: { label: 'Подтверждено', color: 'green' },
  rejected: { label: 'Отклонено', color: 'red' },
};

const statusOptions = Object.entries(STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const normalizeTourRecord = (tour, index = 0) => {
  const fallbackStatuses = ['active', 'hot', 'discount', 'draft'];
  return {
    ...tour,
    key: tour.id,
    status: tour.status || fallbackStatuses[index % fallbackStatuses.length],
    rating: Number(tour.rating || 4.8),
    price: Number(tour.price || 0),
  };
};

const ActualToursAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [topupRequests, setTopupRequests] = useState([]);
  const [editingTourId, setEditingTourId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messageState, setMessageState] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tourSearch, setTourSearch] = useState('');
  const [tourStatusFilter, setTourStatusFilter] = useState('all');
  const [reviewRequest, setReviewRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState('approve');
  const [reviewLoading, setReviewLoading] = useState(false);

  const currentTab = useMemo(() => {
    if (location.pathname === '/admin/users') return 'users';
    if (location.pathname === '/admin/stats') return 'stats';
    if (location.pathname === '/admin/topups') return 'topups';
    return 'tours';
  }, [location.pathname]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const currentUser = readCurrentUser();
      const [toursResponse, usersResponse, topupsResponse] = await Promise.all([
        api.get('/tours'),
        api.get('/users'),
        api.get('/api/admin/topups', { headers: { 'x-user-id': currentUser?.id } }).catch(() => ({ data: [] })),
      ]);
      setTours((toursResponse.data || []).map(normalizeTourRecord));
      setUsers((usersResponse.data || []).map(normalizeUser));
      setTopupRequests(topupsResponse.data || []);
    } catch (error) {
      setMessageState({ type: 'error', text: 'Не удалось загрузить данные админ-панели.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  const totalSavings = users.reduce((sum, user) => sum + (user?.savings?.currentAmount || 0), 0);
  const totalRevenue = users.reduce((sum, user) => sum + (user?.travelHistory || []).reduce((inner, item) => inner + (item.amount || 0), 0), 0);
  const totalPayments = users.reduce((sum, user) => sum + (user?.topUps || []).reduce((inner, item) => inner + (item.amount || 0), 0), 0);
  const pendingTopups = topupRequests.filter((request) => request.status === 'pending');
  const approvedTopups = topupRequests.filter((request) => request.status === 'approved');
  const approvedTopupAmount = approvedTopups.reduce((sum, request) => sum + Number(request.amount || 0), 0);
  const approvedBonusAmount = approvedTopups.reduce((sum, request) => sum + Number(request.bonus || 0), 0);
  const activeToursCount = tours.filter((tour) => tour.status === 'active' || tour.status === 'hot').length;
  const statusCounts = useMemo(() => tours.reduce((accumulator, tour) => {
    accumulator[tour.status] = (accumulator[tour.status] || 0) + 1;
    return accumulator;
  }, {}), [tours]);

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

  const tourStatusSegments = useMemo(() => [
    { label: `Все ${tours.length}`, value: 'all' },
    ...Object.entries(STATUS_META).map(([value, meta]) => ({
      label: `${meta.label} ${statusCounts[value] || 0}`,
      value,
    })),
  ], [statusCounts, tours.length]);

  const paymentRows = users.flatMap((user) => (user?.topUps || []).map((topUp, index) => ({
    key: `${user.id}-topup-${index}`,
    ...topUp,
    userName: user.name,
    userEmail: user.email,
  })));

  const bookingRows = users.flatMap((user) => (user?.travelHistory || []).map((item, index) => ({
    key: `${user.id}-travel-${index}`,
    ...item,
    userName: user.name,
    userEmail: user.email,
  })));

  const handleOpenSite = () => navigate('/');

  const handleLogout = () => {
    clearCurrentUser();
    navigate('/login');
  };

  const openCreateDrawer = () => {
    setEditingTourId(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active', rating: 4.8 });
    setDrawerOpen(true);
  };

  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    form.setFieldsValue({
      ...tour,
      rating: Number(tour.rating || 4.8),
      price: Number(tour.price || 0),
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingTourId(null);
    form.resetFields();
  };

  const handleSaveTour = async (values) => {
    const payload = {
      ...values,
      price: Number(values.price || 0),
      rating: Number(values.rating || 0),
    };

    try {
      if (editingTourId) {
        await api.put(`/tours/${editingTourId}`, payload);
      } else {
        await api.post('/tours', payload);
      }

      await loadDashboardData();
      setMessageState({ type: 'success', text: 'Тур сохранён.' });
      closeDrawer();
    } catch (error) {
      setMessageState({ type: 'error', text: 'Не удалось сохранить тур.' });
    }
  };

  const deleteTour = async (id) => {
    try {
      await api.delete(`/tours/${id}`);
      await loadDashboardData();
      setMessageState({ type: 'success', text: 'Тур удалён.' });
    } catch (error) {
      setMessageState({ type: 'error', text: 'Не удалось удалить тур.' });
    }
  };

  const toggleAdmin = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, role: user.role === 'admin' ? 'user' : 'admin' });
      await loadDashboardData();
      setMessageState({ type: 'success', text: 'Роль пользователя обновлена.' });
    } catch (error) {
      setMessageState({ type: 'error', text: 'Не удалось изменить роль пользователя.' });
    }
  };

  const handleMenuClick = ({ key }) => {
    setMenuOpen(false);

    if (key === 'open-site') {
      handleOpenSite();
      return;
    }

    if (key === 'logout') {
      handleLogout();
      return;
    }

    navigate(`/admin/${key}`);
  };

  const menuItems = [
    { key: 'tours', icon: <TableOutlined />, label: 'Каталог туров' },
    { key: 'users', icon: <TeamOutlined />, label: 'Пользователи' },
    { key: 'topups', icon: <WalletOutlined />, label: `Заявки на пополнение${pendingTopups.length ? ` (${pendingTopups.length})` : ''}` },
    { key: 'stats', icon: <WalletOutlined />, label: 'Статистика' },
    { type: 'divider' },
    { key: 'open-site', icon: <EyeOutlined />, label: 'Открыть сайт' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
  ];

  const statCards = [
    { title: 'Пользователи', value: users.length, icon: <TeamOutlined />, suffix: 'активных' },
    { title: 'Накопления', value: totalSavings, icon: <WalletOutlined />, formatter: formatMoney },
    { title: 'Пополнения', value: totalPayments, icon: <WalletOutlined />, formatter: formatMoney },
    { title: 'Доход', value: totalRevenue, icon: <TrophyOutlined />, formatter: formatMoney },
  ];

  const userColumns = [
    { title: 'Имя', dataIndex: 'name', width: 170 },
    { title: 'Email', dataIndex: 'email', width: 240 },
    { title: 'Уровень', dataIndex: 'level', render: (value) => <Tag color="gold">{value}</Tag>, width: 110 },
    { title: 'Накоплено', render: (_, record) => formatMoney(record?.savings?.currentAmount), width: 150 },
    { title: 'Цель', render: (_, record) => formatMoney(record?.savings?.goalAmount), width: 150 },
    { title: 'Пополнений', render: (_, record) => record?.topUps?.length || 0, width: 120 },
    { title: 'Поездок', render: (_, record) => record?.travelHistory?.length || 0, width: 110 },
    {
      title: 'Действия',
      width: 220,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => navigate('/profile')}>Профиль</Button>
          <Button size="small" onClick={() => toggleAdmin(record)}>
            {record.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
          </Button>
        </Space>
      ),
    },
  ];

  const paymentsTableColumns = [
    { title: 'Пользователь', dataIndex: 'userName', width: 180 },
    { title: 'Email', dataIndex: 'userEmail', width: 230 },
    { title: 'Дата', dataIndex: 'date', render: formatDate, width: 120 },
    { title: 'Сумма', dataIndex: 'amount', render: formatMoney, width: 130 },
    { title: 'Статус', dataIndex: 'status', width: 130, render: (status) => <Tag color="success">{status || 'Успешно'}</Tag> },
  ];

  const travelTableColumns = [
    { title: 'Пользователь', dataIndex: 'userName', width: 180 },
    { title: 'Тур', dataIndex: 'tourTitle', width: 220 },
    { title: 'Дата', dataIndex: 'purchasedAt', render: formatDate, width: 120 },
    { title: 'Сумма', dataIndex: 'amount', render: formatMoney, width: 130 },
    { title: 'Статус', dataIndex: 'status', width: 140, render: (status) => <Tag color="processing">{status || 'Завершено'}</Tag> },
  ];

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

    const currentUser = readCurrentUser();
    const endpoint = reviewAction === 'approve'
      ? `/api/admin/topups/${reviewRequest.id}/approve`
      : `/api/admin/topups/${reviewRequest.id}/reject`;

    setReviewLoading(true);
    try {
      await api.put(endpoint, values, { headers: { 'x-user-id': currentUser?.id } });
      await loadDashboardData();
      setMessageState({
        type: 'success',
        text: reviewAction === 'approve' ? 'Пополнение подтверждено и начислено.' : 'Заявка отклонена.',
      });
      closeReviewModal();
    } catch (error) {
      setMessageState({ type: 'error', text: error.response?.data?.message || 'Не удалось обработать заявку.' });
    } finally {
      setReviewLoading(false);
      setReviewRequest(null);
    }
  };

  const topupRequestColumns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Пользователь', dataIndex: 'userName', width: 170 },
    { title: 'Email', dataIndex: 'userEmail', width: 220 },
    { title: 'Сумма', dataIndex: 'amount', render: formatMoney, width: 140 },
    { title: 'Бонус', dataIndex: 'bonus', render: formatMoney, width: 120 },
    { title: 'Дата', dataIndex: 'createdAt', render: formatDate, width: 120 },
    {
      title: 'Чек',
      dataIndex: 'receiptImage',
      width: 100,
      render: (receipt, record) => receipt?.startsWith('data:image/')
        ? <Image width={54} height={54} src={receipt} alt={record.receiptName || 'Чек'} style={{ objectFit: 'cover', borderRadius: 8 }} />
        : <Button type="link" href={receipt} target="_blank" icon={<FilePdfOutlined />}>PDF</Button>,
    },
    { title: 'Комментарий', dataIndex: 'comment', render: (value) => value || '—', width: 220 },
    { title: 'Ответ администратора', dataIndex: 'adminComment', render: (value) => value || '—', width: 220 },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 140,
      render: (status) => {
        const meta = TOPUP_STATUS_META[status] || TOPUP_STATUS_META.pending;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Действия',
      width: 230,
      fixed: 'right',
      render: (_, request) => request.status === 'pending' ? (
        <Space wrap>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => openReviewModal(request, 'approve')}>
            Подтвердить
          </Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => openReviewModal(request, 'reject')}>
            Отклонить
          </Button>
        </Space>
      ) : <Text className="crm-admin-muted">Обработано</Text>,
    },
  ];

  const tourColumns = [
    {
      title: 'Фото',
      dataIndex: 'image',
      width: 92,
      render: (image, record) => (
        <Image
          width={64}
          height={48}
          src={image}
          alt={record.title}
          className="admin-tour-image"
          preview={false}
        />
      ),
    },
    { title: 'Название', dataIndex: 'title', width: 220 },
    { title: 'Локация', dataIndex: 'location', width: 200 },
    { title: 'Цена', dataIndex: 'price', width: 130, render: formatMoney },
    { title: 'Длительность', dataIndex: 'duration', width: 120 },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 150,
      render: (status) => {
        const meta = STATUS_META[status] || STATUS_META.active;
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Действия',
      width: 210,
      fixed: 'right',
      render: (_, tour) => (
        <Space wrap size={8}>
          <Button size="small" icon={<EditOutlined />} onClick={() => startEditTour(tour)}>
            Редактировать
          </Button>
          <Popconfirm title="Удалить тур?" okText="Да" cancelText="Нет" onConfirm={() => deleteTour(tour.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const sidebar = (
    <div className="crm-admin-sidebar-shell">
      <div className="crm-admin-sidebar-brand">
        <div className="crm-admin-sidebar-brand__mark">TP</div>
        <div>
          <div className="crm-admin-sidebar-brand__title">TravelPay Admin</div>
          <div className="crm-admin-sidebar-brand__subtitle">Fintech + Travel CRM</div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[currentTab]}
        items={menuItems}
        onClick={handleMenuClick}
        className="crm-admin-menu"
      />
    </div>
  );

  const renderTourCatalog = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card className="crm-admin-card crm-admin-card--catalog" styles={{ body: { padding: 0 } }}>
        <div className="crm-admin-card__toolbar">
          <div>
            <Text className="crm-admin-kicker">Каталог туров</Text>
            <Title level={3} className="crm-admin-card__title">Список маршрутов и статусов</Title>
            <Text className="crm-admin-card__subtitle">Админ сразу видит все туры, их состояние и быстрые действия.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreateDrawer}>
            Добавить тур
          </Button>
        </div>

        <div className="crm-admin-opsbar">
          <Input.Search
            allowClear
            size="large"
            value={tourSearch}
            placeholder="Поиск по названию, локации или статусу"
            onChange={(event) => setTourSearch(event.target.value)}
            className="crm-admin-tour-search"
          />

          <Segmented
            size="large"
            value={tourStatusFilter}
            options={tourStatusSegments}
            onChange={setTourStatusFilter}
            className="crm-admin-status-segmented"
          />

          <Space size={8} wrap className="crm-admin-opsbar__actions">
            <Tag className="crm-admin-result-tag">
              {filteredTours.length} / {tours.length}
            </Tag>
            <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>
              Обновить
            </Button>
            <Button
              disabled={tourStatusFilter === 'all' && !tourSearch}
              onClick={() => {
                setTourSearch('');
                setTourStatusFilter('all');
              }}
            >
              Сбросить
            </Button>
          </Space>
        </div>

        <div className="travelpay-table-shell admin-table-shell">
          <Table
            rowKey="id"
            dataSource={filteredTours}
            columns={tourColumns}
            loading={loading}
            pagination={{ pageSize: 7, showSizeChanger: false }}
            scroll={{ x: 1120 }}
          />
        </div>
      </Card>

      <div className="crm-admin-stats-shell">
        <Row gutter={[16, 16]}>
          {statCards.map((item) => (
            <Col xs={24} sm={12} xl={6} key={item.title}>
              <Card className="crm-admin-card crm-admin-card--stat" styles={{ body: { padding: 18 } }}>
                <div className="crm-admin-stat-head">
                  <span className="crm-admin-stat-icon">{item.icon}</span>
                  <Text className="crm-admin-stat-label">{item.title}</Text>
                </div>
                <Statistic
                  value={item.value}
                  formatter={(value) => (item.formatter ? item.formatter(value) : value)}
                  styles={{ content: { color: '#f8fafc', fontWeight: 700, fontSize: 26 } }}
                />
                {item.suffix && <Text className="crm-admin-muted">{item.suffix}</Text>}
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Space>
  );

  const renderUsersView = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Card className="crm-admin-card" title="Пользователи" styles={{ body: { padding: 0 } }}>
        <div className="travelpay-table-shell admin-table-shell">
          <Table rowKey="id" dataSource={users} columns={userColumns} loading={loading} scroll={{ x: 1180 }} />
        </div>
      </Card>

      <Card className="crm-admin-card" title="Пополнения" styles={{ body: { padding: 0 } }}>
        <div className="travelpay-table-shell admin-table-shell">
          <Table rowKey="key" dataSource={paymentRows} columns={paymentsTableColumns} pagination={{ pageSize: 6 }} scroll={{ x: 860 }} />
        </div>
      </Card>

      <Card className="crm-admin-card" title="История поездок" styles={{ body: { padding: 0 } }}>
        <div className="travelpay-table-shell admin-table-shell">
          <Table rowKey="key" dataSource={bookingRows} columns={travelTableColumns} pagination={{ pageSize: 6 }} scroll={{ x: 860 }} />
        </div>
      </Card>
    </Space>
  );

  const renderStatsView = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card className="crm-admin-card" styles={{ body: { padding: 20 } }}>
            <Statistic title="Активные туры" value={activeToursCount} styles={{ content: { color: '#f8fafc' } }} />
            <Text className="crm-admin-muted">Активные и горящие предложения в каталоге.</Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="crm-admin-card" styles={{ body: { padding: 20 } }}>
            <Statistic title="Средний чек пополнения" value={paymentRows.length ? Math.round(totalPayments / paymentRows.length) : 0} formatter={formatMoney} styles={{ content: { color: '#f8fafc' } }} />
            <Text className="crm-admin-muted">Помогает отслеживать поведение пользователей в накоплениях.</Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="crm-admin-card" styles={{ body: { padding: 20 } }}>
            <Statistic title="Средний чек поездки" value={bookingRows.length ? Math.round(totalRevenue / bookingRows.length) : 0} formatter={formatMoney} styles={{ content: { color: '#f8fafc' } }} />
            <Text className="crm-admin-muted">Средний доход с одной покупки тура.</Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card className="crm-admin-card" styles={{ body: { padding: 20 } }}>
            <Statistic title="Конверсия в поездки" value={users.length ? Math.round((bookingRows.length / users.length) * 100) : 0} suffix="%" styles={{ content: { color: '#f8fafc' } }} />
            <Text className="crm-admin-muted">Сколько бронирований приходится на базу пользователей.</Text>
          </Card>
        </Col>
      </Row>

      <Card className="crm-admin-card" title="Последние пополнения" styles={{ body: { padding: 0 } }}>
        <div className="travelpay-table-shell admin-table-shell">
          <Table rowKey="key" dataSource={paymentRows.slice(0, 8)} columns={paymentsTableColumns} pagination={false} scroll={{ x: 860 }} />
        </div>
      </Card>
    </Space>
  );

  const renderTopupsView = () => (
    <Space orientation="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="crm-admin-card crm-admin-card--stat">
            <Statistic title="На проверке" value={pendingTopups.length} styles={{ content: { color: '#f59e0b' } }} />
            <Text className="crm-admin-muted">Заявки, ожидающие решения администратора.</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="crm-admin-card crm-admin-card--stat">
            <Statistic title="Подтверждённые пополнения" value={approvedTopupAmount} formatter={formatMoney} styles={{ content: { color: '#22c55e' } }} />
            <Text className="crm-admin-muted">Общая сумма подтверждённых QR-платежей.</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="crm-admin-card crm-admin-card--stat">
            <Statistic title="Начисленные бонусы" value={approvedBonusAmount} formatter={formatMoney} styles={{ content: { color: '#60a5fa' } }} />
            <Text className="crm-admin-muted">Сумма бонусов по одобренным заявкам.</Text>
          </Card>
        </Col>
      </Row>

      <Card
        className="crm-admin-card"
        title="Заявки на пополнение"
        extra={<Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>Обновить</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <div className="travelpay-table-shell admin-table-shell">
          <Table
            rowKey="id"
            dataSource={topupRequests}
            columns={topupRequestColumns}
            loading={loading}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 1780 }}
            locale={{ emptyText: 'Заявок на пополнение пока нет' }}
          />
        </div>
      </Card>
    </Space>
  );

  return (
    <div className="crm-admin-page admin-page">
      <Layout className="crm-admin-layout">
        {isDesktop && (
          <Sider width={272} className="crm-admin-sider">
            {sidebar}
          </Sider>
        )}

        {!isDesktop && (
          <Drawer
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            placement="left"
            size="100%"
            className="crm-admin-mobile-shell"
            rootClassName="crm-admin-mobile-shell"
            closable={false}
            styles={{
              body: styles.sidebarDrawerBody,
              section: styles.sidebarDrawerSection,
              mask: styles.drawerMask,
            }}
          >
            <div className="crm-admin-mobile-topbar">
              <div>
                <div className="crm-admin-sidebar-brand__title">TravelPay Admin</div>
                <div className="crm-admin-sidebar-brand__subtitle">Fintech + Travel CRM</div>
              </div>
              <Button type="text" className="crm-admin-mobile-close" onClick={() => setMenuOpen(false)}>
                <MenuOutlined />
              </Button>
            </div>
            {sidebar}
          </Drawer>
        )}

        <Layout className="crm-admin-main-layout">
          <Header className="crm-admin-header">
            <div className="crm-admin-header__left">
              {!isDesktop && (
                <Button icon={<MenuOutlined />} onClick={() => setMenuOpen(true)} className="crm-admin-header__menu-btn" />
              )}
              <div>
                <Title level={4} className="crm-admin-header__title">TravelPay Admin</Title>
                <Tag className="crm-admin-header__tag">Fintech + Travel CRM</Tag>
              </div>
            </div>

            <Space wrap size={10} className="crm-admin-header__actions">
              <Button icon={<EyeOutlined />} onClick={handleOpenSite}>
                Открыть сайт
              </Button>
              <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Выйти из админ-панели
              </Button>
            </Space>
          </Header>

          <Content className="crm-admin-content">
            {messageState && (
              <Alert
                type={messageState.type}
                title={messageState.text}
                showIcon
                closable
                onClose={() => setMessageState(null)}
                className="crm-admin-alert"
              />
            )}

            {currentTab === 'tours' && renderTourCatalog()}
            {currentTab === 'users' && renderUsersView()}
            {currentTab === 'stats' && renderStatsView()}
            {currentTab === 'topups' && renderTopupsView()}
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title={editingTourId ? 'Редактировать тур' : 'Добавить тур'}
        open={drawerOpen}
        onClose={closeDrawer}
        size={isDesktop ? 480 : '100%'}
        className="crm-admin-form-drawer"
        rootClassName="crm-admin-form-drawer"
        styles={{
          body: styles.formDrawerBody,
          header: styles.formDrawerHeader,
          section: styles.formDrawerSection,
          footer: styles.formDrawerFooter,
          mask: styles.drawerMask,
        }}
        footer={(
          <div className="crm-admin-drawer-footer">
            <Button onClick={closeDrawer}>Отмена</Button>
            <Button type="primary" onClick={() => form.submit()}>
              Сохранить тур
            </Button>
          </div>
        )}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveTour} className="crm-admin-form">
          <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название тура' }]}>
            <Input placeholder="Например: Issyk-Kul Premium Escape" />
          </Form.Item>

          <Form.Item name="location" label="Локация" rules={[{ required: true, message: 'Введите локацию' }]}>
            <Input placeholder="Issyk-Kul, Kyrgyzstan" />
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
        className="crm-admin-review-modal"
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleReviewSubmit} className="crm-admin-form">
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
                <Input.TextArea rows={4} maxLength={500} showCount placeholder="Необязательный комментарий пользователю" />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="adminComment"
              label="Причина отклонения"
              rules={[{ required: true, message: 'Укажите причину отклонения' }]}
            >
              <Input.TextArea rows={5} maxLength={500} showCount placeholder="Например: сумма или реквизиты на чеке не совпадают" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

const styles = {
  sidebarDrawerBody: {
    padding: 20,
    background: 'linear-gradient(180deg, #07111f 0%, #0b1728 100%)',
  },
  sidebarDrawerSection: {
    background: 'linear-gradient(180deg, #07111f 0%, #0b1728 100%)',
  },
  formDrawerBody: {
    padding: 20,
    background: 'linear-gradient(180deg, rgba(7,17,31,0.98) 0%, rgba(11,23,40,0.98) 100%)',
  },
  formDrawerHeader: {
    background: 'linear-gradient(180deg, rgba(7,17,31,0.98) 0%, rgba(11,23,40,0.98) 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  formDrawerSection: {
    background: 'linear-gradient(180deg, rgba(7,17,31,0.98) 0%, rgba(11,23,40,0.98) 100%)',
  },
  formDrawerFooter: {
    background: 'linear-gradient(180deg, rgba(7,17,31,0.98) 0%, rgba(11,23,40,0.98) 100%)',
    borderTop: '1px solid rgba(255,255,255,0.12)',
  },
  drawerMask: {
    background: 'rgba(2, 6, 23, 0.62)',
    backdropFilter: 'blur(8px)',
  },
};

export default ActualToursAdmin;
