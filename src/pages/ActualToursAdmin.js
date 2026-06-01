import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Layout,
  Menu,
  Popconfirm,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  AreaChartOutlined,
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
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

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');

const ActualToursAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTourId, setEditingTourId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const currentTab = useMemo(() => {
    if (location.pathname === '/admin/users') return 'users';
    if (location.pathname === '/admin/stats') return 'stats';
    return 'tours';
  }, [location.pathname]);

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

  useEffect(() => {
    loadData();
  }, []);

  const totalSavings = users.reduce((sum, user) => sum + (user?.savings?.currentAmount || 0), 0);
  const totalRevenue = users.reduce((sum, user) => sum + (user?.travelHistory || []).reduce((inner, item) => inner + (item.amount || 0), 0), 0);
  const totalPayments = users.reduce((sum, user) => sum + (user?.topUps || []).reduce((inner, item) => inner + (item.amount || 0), 0), 0);

  const revenueByMonth = users
    .flatMap((user) => user.travelHistory || [])
    .reduce((accumulator, item) => {
      const month = new Date(item.purchasedAt).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
      accumulator[month] = (accumulator[month] || 0) + (item.amount || 0);
      return accumulator;
    }, {});

  const savingsByMonth = users
    .flatMap((user) => user.topUps || [])
    .reduce((accumulator, item) => {
      const month = new Date(item.date).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
      accumulator[month] = (accumulator[month] || 0) + (item.amount || 0);
      return accumulator;
    }, {});

  const revenueChartData = Object.entries(revenueByMonth).map(([name, value]) => ({ name, value }));
  const savingsChartData = Object.entries(savingsByMonth).map(([name, value]) => ({ name, value }));
  const popularToursData = Object.entries(
    users.flatMap((user) => user.travelHistory || []).reduce((accumulator, item) => {
      accumulator[item.tourTitle] = (accumulator[item.tourTitle] || 0) + 1;
      return accumulator;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

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
        <Space>
          <Button onClick={() => navigate('/profile')}>Открыть профиль</Button>
          <Button onClick={() => toggleAdmin(record)}>{record.role === 'admin' ? 'Снять админа' : 'Сделать админом'}</Button>
        </Space>
      ),
    },
  ];

  const paymentColumns = users
    .flatMap((user) => (user?.topUps || []).map((topUp) => ({
      ...topUp,
      userName: user.name,
      userEmail: user.email,
    })));

  const bookingColumns = users
    .flatMap((user) => (user?.travelHistory || []).map((item) => ({
      ...item,
      userName: user.name,
      userEmail: user.email,
    })));

  const tourColumns = [
    {
      title: 'Фото',
      dataIndex: 'image',
      width: 90,
      render: (image, record) => <Image width={64} height={48} src={image} alt={record.title} style={{ objectFit: 'cover', borderRadius: 10 }} />,
    },
    { title: 'Тур', dataIndex: 'title' },
    { title: 'Локация', dataIndex: 'location' },
    { title: 'Длительность', dataIndex: 'duration' },
    { title: 'Цена', dataIndex: 'price', render: formatMoney },
    {
      title: 'Действия',
      render: (_, tour) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => startEditTour(tour)}>Изменить</Button>
          <Popconfirm title="Удалить тур?" okText="Да" cancelText="Нет" onConfirm={() => deleteTour(tour.id)}>
            <Button danger icon={<DeleteOutlined />}>Удалить</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSaveTour = async (values) => {
    const payload = { ...values, price: Number(values.price || 0) };

    try {
      if (editingTourId) {
        await api.put(`/tours/${editingTourId}`, payload);
      } else {
        await api.post('/tours', payload);
      }
      await loadData();
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
      await loadData();
      setMessage({ type: 'success', text: 'Тур удалён.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось удалить тур.' });
    }
  };

  const toggleAdmin = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, role: user.role === 'admin' ? 'user' : 'admin' });
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось изменить роль пользователя.' });
    }
  };

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

  return (
    <Layout style={styles.page}>
      <Sider width={270} style={styles.sider}>
        <Title level={3} style={styles.logo}>TravelPay Admin</Title>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentTab]}
          onClick={({ key }) => navigate(`/admin/${key}`)}
          items={[
            { key: 'tours', icon: <UnorderedListOutlined />, label: 'Туры' },
            { key: 'users', icon: <TeamOutlined />, label: 'Пользователи' },
            { key: 'stats', icon: <BarChartOutlined />, label: 'Статистика' },
          ]}
        />
        <Button icon={<EyeOutlined />} block style={{ marginTop: 24 }} onClick={() => navigate('/tours')}>
          Открыть сайт
        </Button>
      </Sider>

      <Content style={styles.content}>
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Text type="warning" strong>Fintech + Travel Operations</Text>
            <Title level={2} style={{ marginTop: 4, marginBottom: 0 }}>Админ-панель TravelPay</Title>
          </div>

          {message && <Alert type={message.type} message={message.text} showIcon closable onClose={() => setMessage(null)} />}

          <div style={styles.statsGrid}>
            <Card><Statistic title="Пользователи" value={users.length} prefix={<TeamOutlined />} /></Card>
            <Card><Statistic title="Накоплено" value={totalSavings} suffix="сом" prefix={<WalletOutlined />} /></Card>
            <Card><Statistic title="Пополнения" value={totalPayments} suffix="сом" prefix={<AreaChartOutlined />} /></Card>
            <Card><Statistic title="Доход с туров" value={totalRevenue} suffix="сом" prefix={<BarChartOutlined />} /></Card>
          </div>

          {currentTab === 'tours' && (
            <>
              <Card title={editingTourId ? 'Редактировать тур' : 'Добавить тур'} style={styles.panel}>
                <Form form={form} layout="vertical" onFinish={handleSaveTour}>
                  <div style={styles.formGrid}>
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
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <Form.Item name="image" label="Изображение" rules={[{ required: true, message: 'Укажите изображение' }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="description" label="Описание" rules={[{ required: true, message: 'Укажите описание' }]}>
                    <Input.TextArea rows={4} />
                  </Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">{editingTourId ? 'Сохранить' : 'Добавить'}</Button>
                    {editingTourId && <Button onClick={() => { form.resetFields(); setEditingTourId(null); }}>Отмена</Button>}
                  </Space>
                </Form>
              </Card>

              <Card title="Каталог туров" style={styles.panel}>
                <Table rowKey="id" dataSource={tours} columns={tourColumns} loading={loading} scroll={{ x: 900 }} />
              </Card>
            </>
          )}

          {currentTab === 'users' && (
            <>
              <Card title="Список пользователей" style={styles.panel}>
                <Table rowKey="id" dataSource={users} columns={userColumns} loading={loading} scroll={{ x: 980 }} />
              </Card>
              <Card title="Платежи / пополнения" style={styles.panel}>
                <Table rowKey="id" dataSource={paymentColumns} columns={paymentsTableColumns} pagination={{ pageSize: 6 }} scroll={{ x: 840 }} />
              </Card>
              <Card title="История поездок" style={styles.panel}>
                <Table rowKey="id" dataSource={bookingColumns} columns={travelTableColumns} pagination={{ pageSize: 6 }} scroll={{ x: 840 }} />
              </Card>
            </>
          )}

          {currentTab === 'stats' && (
            <>
              <div style={styles.chartGrid}>
                <Card title="Доход по месяцам" style={styles.panel}>
                  <div style={styles.chartBox}>
                    <ResponsiveContainer>
                      <BarChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Bar dataKey="value" fill="#17325c" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Накопления по месяцам" style={styles.panel}>
                  <div style={styles.chartBox}>
                    <ResponsiveContainer>
                      <AreaChart data={savingsChartData}>
                        <defs>
                          <linearGradient id="adminSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fca311" stopOpacity={0.65} />
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Area type="monotone" dataKey="value" stroke="#14b8a6" fill="url(#adminSavings)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <Card title="Популярные туры" style={styles.panel}>
                <div style={styles.chartBox}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={popularToursData} dataKey="value" nameKey="name" outerRadius={110} fill="#fca311" label />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </>
          )}
        </Space>
      </Content>
    </Layout>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f9fd',
  },
  sider: {
    padding: '22px 12px',
    background: 'linear-gradient(180deg, #17325c 0%, #102544 100%)',
  },
  logo: {
    color: '#fff',
    padding: '0 12px 18px',
  },
  content: {
    padding: 28,
  },
  panel: {
    borderRadius: 20,
    border: '1px solid rgba(23,50,92,0.08)',
    boxShadow: '0 20px 50px rgba(23,50,92,0.08)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 16,
  },
  chartBox: {
    width: '100%',
    height: 320,
  },
};

export default ActualToursAdmin;
