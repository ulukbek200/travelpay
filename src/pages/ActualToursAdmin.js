import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Grid,
  Image,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd';
import {
  AreaChartOutlined,
  BarChartOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MenuOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api';
import { normalizeUser } from '../utils/user';

const { useBreakpoint } = Grid;

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');

const ActualToursAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const [form] = Form.useForm();
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTourId, setEditingTourId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const currentTab = useMemo(() => {
    if (location.pathname === '/admin/users') return 'users';
    if (location.pathname === '/admin/stats') return 'stats';
    return 'tours';
  }, [location.pathname]);

  const adminMenuItems = useMemo(() => ([
    { key: 'tours', icon: <UnorderedListOutlined />, label: 'Туры' },
    { key: 'users', icon: <TeamOutlined />, label: 'Пользователи' },
    { key: 'stats', icon: <BarChartOutlined />, label: 'Статистика' },
  ]), []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [toursResponse, usersResponse] = await Promise.all([
          api.get('/tours'),
          api.get('/users'),
        ]);
        setTours(toursResponse.data || []);
        setUsers((usersResponse.data || []).map(normalizeUser));
      } catch (error) {
        setMessage({ type: 'error', text: 'Не удалось загрузить данные панели.' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  const revenueChartData = Object.entries(
    users.flatMap((user) => user.travelHistory || []).reduce((accumulator, item) => {
      const month = new Date(item.purchasedAt).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
      accumulator[month] = (accumulator[month] || 0) + (item.amount || 0);
      return accumulator;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const savingsChartData = Object.entries(
    users.flatMap((user) => user.topUps || []).reduce((accumulator, item) => {
      const month = new Date(item.date).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
      accumulator[month] = (accumulator[month] || 0) + (item.amount || 0);
      return accumulator;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const popularToursData = Object.entries(
    users.flatMap((user) => user.travelHistory || []).reduce((accumulator, item) => {
      accumulator[item.tourTitle] = (accumulator[item.tourTitle] || 0) + 1;
      return accumulator;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const handleSaveTour = async (values) => {
    const payload = { ...values, price: Number(values.price || 0) };

    try {
      if (editingTourId) {
        await api.put(`/tours/${editingTourId}`, payload);
      } else {
        await api.post('/tours', payload);
      }

      const [toursResponse, usersResponse] = await Promise.all([
        api.get('/tours'),
        api.get('/users'),
      ]);
      setTours(toursResponse.data || []);
      setUsers((usersResponse.data || []).map(normalizeUser));
      form.resetFields();
      setEditingTourId(null);
      setMessage({ type: 'success', text: 'Тур сохранён.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось сохранить тур.' });
    }
  };

  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    form.setFieldsValue(tour);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTour = async (id) => {
    try {
      await api.delete(`/tours/${id}`);
      const response = await api.get('/tours');
      setTours(response.data || []);
      setMessage({ type: 'success', text: 'Тур удалён.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось удалить тур.' });
    }
  };

  const toggleAdmin = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, role: user.role === 'admin' ? 'user' : 'admin' });
      const response = await api.get('/users');
      setUsers((response.data || []).map(normalizeUser));
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось изменить роль пользователя.' });
    }
  };

  const userColumns = [
    { title: 'Имя', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Уровень', dataIndex: 'level', render: (value) => <Tag color="gold">{value}</Tag> },
    { title: 'Накоплено', render: (_, record) => formatMoney(record?.savings?.currentAmount) },
    { title: 'Цель', render: (_, record) => formatMoney(record?.savings?.goalAmount) },
    { title: 'Пополнений', render: (_, record) => record?.topUps?.length || 0 },
    { title: 'Поездок', render: (_, record) => record?.travelHistory?.length || 0 },
    {
      title: 'Действия',
      render: (_, record) => (
        <Space wrap>
          <Button onClick={() => navigate('/profile')}>Открыть профиль</Button>
          <Button onClick={() => toggleAdmin(record)}>{record.role === 'admin' ? 'Снять админа' : 'Сделать админом'}</Button>
        </Space>
      ),
    },
  ];

  const paymentRows = users.flatMap((user) => (user?.topUps || []).map((topUp) => ({
    ...topUp,
    userName: user.name,
    userEmail: user.email,
  })));

  const bookingRows = users.flatMap((user) => (user?.travelHistory || []).map((item) => ({
    ...item,
    userName: user.name,
    userEmail: user.email,
  })));

  const paymentsTableColumns = [
    { title: 'Пользователь', dataIndex: 'userName' },
    { title: 'Email', dataIndex: 'userEmail' },
    { title: 'Дата', dataIndex: 'date', render: formatDate },
    { title: 'Сумма', dataIndex: 'amount', render: formatMoney },
    { title: 'Статус', dataIndex: 'status', render: (status) => <Tag color="success">{status}</Tag> },
  ];

  const travelTableColumns = [
    { title: 'Пользователь', dataIndex: 'userName' },
    { title: 'Тур', dataIndex: 'tourTitle' },
    { title: 'Дата', dataIndex: 'purchasedAt', render: formatDate },
    { title: 'Сумма', dataIndex: 'amount', render: formatMoney },
    { title: 'Статус', dataIndex: 'status', render: (status) => <Tag color="processing">{status}</Tag> },
  ];

  const tourColumns = [
    {
      title: 'Фото',
      dataIndex: 'image',
      width: 90,
      render: (image, record) => (
        <Image width={64} height={48} src={image} alt={record.title} className="admin-tour-image" />
      ),
    },
    { title: 'Тур', dataIndex: 'title' },
    { title: 'Локация', dataIndex: 'location' },
    { title: 'Длительность', dataIndex: 'duration' },
    { title: 'Цена', dataIndex: 'price', render: formatMoney },
    {
      title: 'Действия',
      render: (_, tour) => (
        <Space wrap>
          <Button icon={<EditOutlined />} onClick={() => startEditTour(tour)}>Изменить</Button>
          <Popconfirm title="Удалить тур?" okText="Да" cancelText="Нет" onConfirm={() => deleteTour(tour.id)}>
            <Button danger icon={<DeleteOutlined />}>Удалить</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleMenuSelect = (key) => {
    setMenuOpen(false);
    navigate(`/admin/${key}`);
  };

  const renderSidebarMenu = () => (
    <div className="admin-menu">
      {adminMenuItems.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`admin-menu-btn${currentTab === item.key ? ' active' : ''}`}
          onClick={() => handleMenuSelect(item.key)}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  const desktopSidebar = (
    <div className="admin-sidebar-shell">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-brand__logo">TP</div>
        <div className="admin-sidebar-brand__copy">
          <div className="admin-sidebar-brand__title">TravelPay Admin</div>
          <div className="admin-sidebar-brand__subtitle">Fintech + Travel Operations</div>
        </div>
      </div>

      {renderSidebarMenu()}

      <Button icon={<EyeOutlined />} block className="admin-open-site" onClick={() => navigate('/tours')}>
        Открыть сайт
      </Button>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-footer__title">TravelPay CRM</div>
        <div className="admin-sidebar-footer__subtitle">Admin workspace</div>
        <Tag className="admin-sidebar-footer__version">v1.0</Tag>
      </div>
    </div>
  );

  const mobileDrawerContent = (
    <div className="travelpay-admin-mobile-drawer">
      <div className="travelpay-admin-mobile-drawer__top">
        <div className="travelpay-admin-mobile-drawer__brand">
          <div className="travelpay-admin-mobile-drawer__logo">TP</div>
          <div className="travelpay-admin-mobile-drawer__brand-copy">
            <div className="travelpay-admin-mobile-drawer__brand-title">TravelPay Admin</div>
            <div className="travelpay-admin-mobile-drawer__brand-subtitle">Fintech + Travel Operations</div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close admin menu"
          className="travelpay-admin-mobile-drawer__close"
          onClick={() => setMenuOpen(false)}
        >
          <CloseOutlined />
        </button>
      </div>

      <div className="travelpay-admin-mobile-drawer__menu-card">
        {renderSidebarMenu()}
      </div>

      <Button
        icon={<EyeOutlined />}
        block
        className="admin-open-site travelpay-admin-mobile-drawer__site-button"
        onClick={() => { setMenuOpen(false); navigate('/tours'); }}
      >
        Открыть сайт
      </Button>

      <div className="travelpay-admin-mobile-drawer__footer">
        <div className="travelpay-admin-mobile-drawer__footer-title">TravelPay CRM</div>
        <div className="travelpay-admin-mobile-drawer__footer-subtitle">Admin workspace</div>
        <Tag className="travelpay-admin-mobile-drawer__version">v1.0</Tag>
      </div>
    </div>
  );

  return (
    <div className="travelpay-admin-page admin-page">
      <div className="admin-layout">
        {isDesktop && (
          <aside className="admin-sidebar">
            {desktopSidebar}
          </aside>
        )}

        {!isDesktop && (
          <Drawer
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            placement="left"
            size="min(82vw, 340px)"
            className="travelpay-dashboard-drawer travelpay-admin-mobile-drawer-shell"
            rootClassName="travelpay-admin-mobile-drawer-shell"
            closable={false}
            maskClosable
            styles={{
              body: styles.drawerBody,
              section: styles.drawerContent,
              wrapper: styles.drawerWrapper,
              mask: styles.drawerMask,
            }}
          >
            {mobileDrawerContent}
          </Drawer>
        )}

        <main className="admin-main">
          <div className="travelpay-dashboard-container admin-content-shell">
            <Space orientation="vertical" size={24} className="admin-stack">
              <section className="admin-hero admin-glass">
                <div className="admin-hero-copy">
                  {!isDesktop && (
                    <Button
                      icon={<MenuOutlined />}
                      onClick={() => setMenuOpen(true)}
                      className="admin-mobile-menu-trigger"
                    >
                      Меню
                    </Button>
                  )}
                  <div className="admin-eyebrow">Fintech + Travel Operations</div>
                  <h1 className="admin-title">Админ-панель TravelPay</h1>
                </div>
                <div className="admin-navbar-badge">Dark Glass CRM</div>
              </section>

              {message && <Alert type={message.type} title={message.text} showIcon closable onClose={() => setMessage(null)} />}

              <div className="admin-stats-grid">
                <div className="admin-stat-card admin-glass">
                  <div className="admin-stat-label">Пользователи</div>
                  <div className="admin-stat-value">
                    <TeamOutlined />
                    <span>{users.length}</span>
                  </div>
                </div>
                <div className="admin-stat-card admin-glass">
                  <div className="admin-stat-label">Накоплено</div>
                  <div className="admin-stat-value">
                    <WalletOutlined />
                    <span>{formatMoney(totalSavings)}</span>
                  </div>
                </div>
                <div className="admin-stat-card admin-glass">
                  <div className="admin-stat-label">Пополнения</div>
                  <div className="admin-stat-value">
                    <AreaChartOutlined />
                    <span>{formatMoney(totalPayments)}</span>
                  </div>
                </div>
                <div className="admin-stat-card admin-glass">
                  <div className="admin-stat-label">Доход с туров</div>
                  <div className="admin-stat-value">
                    <BarChartOutlined />
                    <span>{formatMoney(totalRevenue)}</span>
                  </div>
                </div>
              </div>

              {currentTab === 'tours' && (
                <>
                  <section className="admin-form-card admin-glass">
                    <div className="admin-section-heading">
                      {editingTourId ? 'Редактировать тур' : 'Добавить тур'}
                    </div>
                    <Form form={form} layout="vertical" onFinish={handleSaveTour} className="travelpay-adaptive-form admin-form">
                      <div className="travelpay-form-grid">
                        <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
                          <Input />
                        </Form.Item>
                        <Form.Item name="location" label="Локация">
                          <Input />
                        </Form.Item>
                        <Form.Item name="duration" label="Длительность">
                          <Input />
                        </Form.Item>
                        <Form.Item name="price" label="Цена" rules={[{ required: true, message: 'Введите цену' }]}>
                          <InputNumber min={0} className="admin-input-number" />
                        </Form.Item>
                      </div>
                      <Form.Item name="image" label="Изображение" rules={[{ required: true, message: 'Укажите изображение' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="description" label="Описание" rules={[{ required: true, message: 'Укажите описание' }]}>
                        <Input.TextArea rows={4} />
                      </Form.Item>
                      <Space wrap>
                        <Button type="primary" htmlType="submit">
                          {editingTourId ? 'Сохранить' : 'Добавить'}
                        </Button>
                        {editingTourId && (
                          <Button onClick={() => { form.resetFields(); setEditingTourId(null); }}>
                            Отмена
                          </Button>
                        )}
                      </Space>
                    </Form>
                  </section>

                  <Card title="Каталог туров" className="admin-glass admin-panel-card">
                    <div className="travelpay-table-shell admin-table-shell">
                      <Table rowKey="id" dataSource={tours} columns={tourColumns} loading={loading} scroll={{ x: 900 }} />
                    </div>
                  </Card>
                </>
              )}

              {currentTab === 'users' && (
                <>
                  <Card title="Список пользователей" className="admin-glass admin-panel-card">
                    <div className="travelpay-table-shell admin-table-shell">
                      <Table rowKey="id" dataSource={users} columns={userColumns} loading={loading} scroll={{ x: 980 }} />
                    </div>
                  </Card>
                  <Card title="Платежи / пополнения" className="admin-glass admin-panel-card">
                    <div className="travelpay-table-shell admin-table-shell">
                      <Table rowKey="id" dataSource={paymentRows} columns={paymentsTableColumns} pagination={{ pageSize: 6 }} scroll={{ x: 840 }} />
                    </div>
                  </Card>
                  <Card title="История поездок" className="admin-glass admin-panel-card">
                    <div className="travelpay-table-shell admin-table-shell">
                      <Table rowKey="id" dataSource={bookingRows} columns={travelTableColumns} pagination={{ pageSize: 6 }} scroll={{ x: 840 }} />
                    </div>
                  </Card>
                </>
              )}

              {currentTab === 'stats' && (
                <>
                  <div className="admin-chart-grid">
                    <Card title="Доход по месяцам" className="admin-glass admin-panel-card">
                      <div style={styles.chartBox}>
                        <ResponsiveContainer>
                          <BarChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatMoney(value)} />
                            <Bar dataKey="value" fill="#2d7dff" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card title="Накопления по месяцам" className="admin-glass admin-panel-card">
                      <div style={styles.chartBox}>
                        <ResponsiveContainer>
                          <AreaChart data={savingsChartData}>
                            <defs>
                              <linearGradient id="adminSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4096ff" stopOpacity={0.65} />
                                <stop offset="95%" stopColor="#8cc8ff" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatMoney(value)} />
                            <Area type="monotone" dataKey="value" stroke="#7cc8ff" fill="url(#adminSavings)" strokeWidth={3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </div>

                  <Card title="Популярные туры" className="admin-glass admin-panel-card">
                    <div style={styles.chartBox}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={popularToursData} dataKey="value" nameKey="name" outerRadius={110} fill="#4096ff" label />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </>
              )}
            </Space>
          </div>
        </main>
      </div>
    </div>
  );
};

const styles = {
  chartBox: {
    width: '100%',
    height: 320,
  },
  drawerBody: {
    padding: 0,
    background: 'linear-gradient(180deg, #09192f 0%, #102c50 100%)',
  },
  drawerContent: {
    background: 'linear-gradient(180deg, #09192f 0%, #102c50 100%)',
  },
  drawerWrapper: {
    maxWidth: 'min(82vw, 340px)',
  },
  drawerMask: {
    background: 'rgba(4, 10, 24, 0.56)',
    backdropFilter: 'blur(10px)',
  },
};

export default ActualToursAdmin;
  