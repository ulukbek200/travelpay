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
  Typography,
} from 'antd';
import {
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

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

  const loadTours = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tours');
      setTours(response.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось загрузить туры. Проверьте backend.' });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось загрузить пользователей.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, []);

  useEffect(() => {
    if (currentTab === 'users' || currentTab === 'stats') loadUsers();
  }, [currentTab]);

  const handleSaveTour = async (values) => {
    const payload = { ...values, price: Number(values.price || 0) };

    try {
      if (editingTourId) {
        const response = await api.put(`/tours/${editingTourId}`, payload);
        setTours((prev) => prev.map((tour) => (tour.id === editingTourId ? response.data : tour)));
        setMessage({ type: 'success', text: 'Тур обновлен.' });
      } else {
        const response = await api.post('/tours', payload);
        setTours((prev) => [...prev, response.data]);
        setMessage({ type: 'success', text: 'Тур создан и уже доступен на странице туров.' });
      }

      form.resetFields();
      setEditingTourId(null);
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
      setTours((prev) => prev.filter((tour) => tour.id !== id));
      setMessage({ type: 'success', text: 'Тур удален.' });
      if (editingTourId === id) {
        form.resetFields();
        setEditingTourId(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось удалить тур.' });
    }
  };

  const toggleAdmin = async (user) => {
    const updatedUser = { ...user, role: user.role === 'admin' ? 'user' : 'admin' };
    try {
      await api.put(`/users/${user.id}`, updatedUser);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updatedUser : item)));
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось изменить роль.' });
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setMessage({ type: 'success', text: 'Пользователь удален.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Не удалось удалить пользователя.' });
    }
  };

  const tourColumns = [
    {
      title: 'Фото',
      dataIndex: 'image',
      width: 92,
      render: (image, record) => <Image width={64} height={46} src={image} alt={record.title} style={{ objectFit: 'cover', borderRadius: 6 }} />,
    },
    { title: 'Название', dataIndex: 'title' },
    { title: 'Локация', dataIndex: 'location' },
    { title: 'Длительность', dataIndex: 'duration' },
    {
      title: 'Цена',
      dataIndex: 'price',
      render: (price) => `${Number(price || 0).toLocaleString()} сом`,
    },
    {
      title: 'Действия',
      width: 210,
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

  const userColumns = [
    { title: 'Имя', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Роль', dataIndex: 'role', render: (role) => role || 'user' },
    {
      title: 'Действия',
      width: 260,
      render: (_, user) => (
        <Space>
          <Button onClick={() => toggleAdmin(user)}>
            {user.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
          </Button>
          <Popconfirm title="Удалить пользователя?" okText="Да" cancelText="Нет" onConfirm={() => deleteUser(user.id)}>
            <Button danger icon={<DeleteOutlined />}>Удалить</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const statsData = [
    { name: 'Туры', value: tours.length },
    { name: 'Пользователи', value: users.length },
    { name: 'Админы', value: users.filter((user) => user.role === 'admin').length },
  ];

  return (
    <Layout style={styles.page}>
      <Sider width={260} style={styles.sider}>
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
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <div>
            <Text type="warning" strong>Панель управления</Text>
            <Title level={2} style={{ marginTop: 4, marginBottom: 0 }}>Админка TravelPay</Title>
          </div>

          {message && <Alert type={message.type} message={message.text} showIcon closable onClose={() => setMessage(null)} />}

          {currentTab === 'tours' && (
            <>
              <Card title={editingTourId ? 'Редактировать тур' : 'Создать тур'}>
                <Form form={form} layout="vertical" onFinish={handleSaveTour}>
                  <div style={styles.formGrid}>
                    <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
                      <Input placeholder="Например: Тур на Иссык-Куль" />
                    </Form.Item>
                    <Form.Item name="location" label="Локация">
                      <Input placeholder="Иссык-Куль" />
                    </Form.Item>
                    <Form.Item name="duration" label="Длительность">
                      <Input placeholder="4 дня" />
                    </Form.Item>
                    <Form.Item name="price" label="Цена, сом" rules={[{ required: true, message: 'Введите цену' }]}>
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </div>
                  <Form.Item name="image" label="URL картинки" rules={[{ required: true, message: 'Добавьте картинку' }]}>
                    <Input placeholder="https://..." />
                  </Form.Item>
                  <Form.Item name="description" label="Описание" rules={[{ required: true, message: 'Введите описание' }]}>
                    <Input.TextArea rows={4} placeholder="Краткое описание тура" />
                  </Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit">
                      {editingTourId ? 'Сохранить изменения' : 'Добавить тур'}
                    </Button>
                    {editingTourId && (
                      <Button onClick={() => {
                        form.resetFields();
                        setEditingTourId(null);
                      }}>
                        Отмена
                      </Button>
                    )}
                  </Space>
                </Form>
              </Card>

              <Card title="Список туров">
                <Table rowKey="id" dataSource={tours} columns={tourColumns} loading={loading} scroll={{ x: 900 }} />
              </Card>
            </>
          )}

          {currentTab === 'users' && (
            <Card title="Пользователи">
              <Table rowKey="id" dataSource={users} columns={userColumns} loading={loading} scroll={{ x: 760 }} />
            </Card>
          )}

          {currentTab === 'stats' && (
            <>
              <div style={styles.statsGrid}>
                <Card><Statistic title="Туров" value={tours.length} /></Card>
                <Card><Statistic title="Пользователей" value={users.length} /></Card>
                <Card><Statistic title="Администраторов" value={users.filter((user) => user.role === 'admin').length} /></Card>
              </div>
              <Card title="Общая статистика">
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={statsData}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1677ff" radius={[8, 8, 0, 0]} />
                    </BarChart>
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
  },
  sider: {
    padding: '22px 12px',
    background: '#17325c',
  },
  logo: {
    color: '#fff',
    padding: '0 12px 18px',
  },
  content: {
    padding: 28,
    background: '#f5f7fb',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: 16,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
};

export default ActualToursAdmin;
