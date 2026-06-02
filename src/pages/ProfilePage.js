import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Form,
  Grid,
  Input,
  Layout,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  BellOutlined,
  CompassOutlined,
  CrownOutlined,
  FireOutlined,
  GiftOutlined,
  HeartOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  NotificationOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { clearCurrentUser, readCurrentUser } from '../utils/currentUser';
import { formatSavingsStatus, getSavingsMetrics, getSavingsStatusColor } from '../utils/savings';
import { getUserLevel, normalizeUser, syncCurrentUser } from '../utils/user';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const BRAND_BLUE = '#17325c';
const BRAND_GOLD = '#fca311';
const TURQUOISE = '#14b8a6';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('ru-RU') : '—');

const levelColors = {
  Bronze: '#b45309',
  Silver: '#64748b',
  Gold: '#f59e0b',
  Platinum: '#0ea5e9',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isDesktop = !!screens.lg;
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('dashboard_theme') || 'dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('dashboard_theme', theme);
  }, [theme]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = readCurrentUser();

        if (!currentUser?.id) {
          navigate('/login');
          return;
        }

        const response = await api.get(`/users/${currentUser.id}`);
        const nextUser = syncCurrentUser({
          ...normalizeUser(response.data),
          country: response.data.country || 'Kyrgyzstan',
          preferredLanguage: response.data.preferredLanguage || 'RU',
          travelPreferences: response.data.travelPreferences || 'Luxury travel, mountains, city breaks',
          isLoggedIn: true,
        });

        setUser(nextUser);
        form.setFieldsValue(nextUser);
      } catch (error) {
        navigate('/login');
      }
    };

    loadUser();
  }, [form, navigate]);

  const savingsMetrics = useMemo(() => getSavingsMetrics(user?.savings), [user?.savings]);
  const level = useMemo(() => user?.level || getUserLevel(savingsMetrics.currentAmount), [user?.level, savingsMetrics.currentAmount]);
  const unreadNotifications = useMemo(() => (user?.notifications || []).filter((item) => !item.read).length, [user?.notifications]);

  const handleSaveProfile = async (values) => {
    try {
      const response = await api.put(`/users/${user.id}`, {
        ...user,
        ...values,
        isLoggedIn: true,
      });

      const nextUser = syncCurrentUser({ ...normalizeUser(response.data), isLoggedIn: true });
      setUser(nextUser);
      message.success('Профиль обновлён.');
    } catch (error) {
      message.error('Не удалось сохранить профиль.');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    setMenuOpen(false);
    navigate('/');
  };

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const favoriteItems = (user?.favorites || []).slice(0, 4);
  const historyColumns = [
    { title: 'Тур', dataIndex: 'tourTitle' },
    { title: 'Дата покупки', dataIndex: 'purchasedAt', render: formatDate },
    { title: 'Сумма', dataIndex: 'amount', render: formatMoney },
    { title: 'Статус', dataIndex: 'status', render: (status) => <Tag color="success">{status}</Tag> },
  ];

  const sidebarContent = (
    <div style={styles.sidebarInner}>
      <div style={styles.logoWrap}>
        <div style={styles.logoMark}>TP</div>
        <div>
          <Text style={{ color: '#fff', fontWeight: 900 }}>TravelPay</Text>
          <br />
          <Text style={{ color: '#dbeafe', fontSize: 12 }}>Fintech Travel Dashboard</Text>
        </div>
      </div>

      <Space orientation="vertical" size={10} style={{ width: '100%' }}>
        <Button block icon={<HomeOutlined />} onClick={() => handleNavigate('/')}>Главная</Button>
        <Button block icon={<WalletOutlined />} onClick={() => handleNavigate('/savings')}>Накопления</Button>
        <Button block icon={<CompassOutlined />} onClick={() => handleNavigate('/tours')}>Туры</Button>
        <Button block icon={<HeartOutlined />} onClick={() => handleNavigate('/favorites')}>Избранное</Button>
        <Button block icon={<TeamOutlined />} onClick={() => handleNavigate('/admin/tours')}>Админка</Button>
        <Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>Выйти</Button>
      </Space>
    </div>
  );

  return (
    <Layout style={styles.page(theme === 'dark')} className="travelpay-profile-page">
      {isDesktop && (
        <Sider width={260} style={styles.sider(theme === 'dark')}>
          {sidebarContent}
        </Sider>
      )}

      {!isDesktop && (
        <Drawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          placement="left"
          size={290}
          className="travelpay-dashboard-drawer"
          styles={{ body: styles.drawerBody }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Content style={styles.content}>
        <div className="travelpay-dashboard-container">
          <Space orientation="vertical" size={20} style={{ width: '100%' }}>
            <div style={styles.topBar}>
              <div style={{ minWidth: 0 }}>
                {!isDesktop && (
                  <Button icon={<MenuOutlined />} onClick={() => setMenuOpen(true)} style={styles.mobileMenuButton}>
                    Меню
                  </Button>
                )}
                <Text style={styles.kicker}>Профиль пользователя</Text>
                <Title style={styles.pageTitle}>Личный кабинет TravelPay</Title>
                <Paragraph style={styles.pageSubtitle}>
                  Управляйте накоплениями, поездками, достижениями, уведомлениями и бонусами в одном SaaS-интерфейсе.
                </Paragraph>
              </div>
              <Space wrap>
                <Badge count={unreadNotifications}>
                  <Button shape="circle" icon={<BellOutlined />} />
                </Badge>
                <Switch checked={theme === 'dark'} onChange={(checked) => setTheme(checked ? 'dark' : 'light')} checkedChildren="Dark" unCheckedChildren="Light" />
              </Space>
            </div>

            {savingsMetrics.isReadyToBuy && (
              <Alert
                type="success"
                showIcon
                title="Цель накопления достигнута"
                description="Теперь вы можете выбрать любой доступный тур и оплатить его накопленными средствами."
                action={<Button type="primary" onClick={() => navigate('/tours')}>Выбрать тур</Button>}
              />
            )}

            <Row gutter={[20, 20]}>
              <Col xs={24} xl={8}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                  <Card style={styles.glassCard}>
                    <Space orientation="vertical" size={16} style={{ width: '100%', alignItems: 'center' }}>
                      <Avatar size={112} src={user?.avatar} icon={<UserOutlined />} />
                      <div style={{ textAlign: 'center' }}>
                        <Title level={3} style={{ marginBottom: 4 }}>{user?.name}</Title>
                        <Text type="secondary">{user?.email}</Text>
                      </div>
                      <Tag color={getSavingsStatusColor(savingsMetrics.status)}>{formatSavingsStatus(savingsMetrics.status)}</Tag>
                      <Tag icon={<CrownOutlined />} color="gold" style={{ fontWeight: 800 }}>{level}</Tag>
                      <Progress percent={savingsMetrics.progressPercent} strokeColor={{ '0%': TURQUOISE, '100%': BRAND_GOLD }} />
                      <Button type="primary" block onClick={() => navigate('/savings')} style={styles.primaryButton}>Открыть накопления</Button>
                    </Space>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Card title="Уровень и streak" style={styles.glassCard}>
                    <Space orientation="vertical" size={14} style={{ width: '100%' }}>
                      <Statistic title="Уровень пользователя" value={level} styles={{ content: { color: levelColors[level] || BRAND_BLUE } }} />
                      <Alert type="info" showIcon icon={<FireOutlined />} title={`🔥 Вы пополняете баланс ${user?.travelStreakMonths || 0} месяца подряд`} />
                      <Text type="secondary">Следующий уровень открывает больше доверия, бонусов и персональных офферов.</Text>
                    </Space>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card title="Реферальная система" style={styles.glassCard}>
                    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                      <Text strong>Моя реферальная ссылка</Text>
                      <Input value={user?.referral?.link} readOnly />
                      <Row gutter={[12, 12]}>
                        <Col span={12}><Statistic title="Приглашено" value={user?.referral?.invitedCount || 0} /></Col>
                        <Col span={12}><Statistic title="Бонусов" value={user?.referral?.bonusAmount || 0} suffix="сом" /></Col>
                      </Row>
                      <Alert type="success" showIcon icon={<GiftOutlined />} title="+1000 бонусных сом за каждого друга" />
                    </Space>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} xl={16}>
                <Space orientation="vertical" size={20} style={{ width: '100%' }}>
                  <div className="travelpay-stats-grid">
                    <Card className="travelpay-stat-card" style={styles.statCard}><Statistic title="Цель" value={savingsMetrics.goalAmount} suffix="сом" /></Card>
                    <Card className="travelpay-stat-card" style={styles.statCard}><Statistic title="Накоплено" value={savingsMetrics.currentAmount} suffix="сом" /></Card>
                    <Card className="travelpay-stat-card" style={styles.statCard}><Statistic title="Осталось" value={savingsMetrics.remainingAmount} suffix="сом" /></Card>
                    <Card className="travelpay-stat-card" style={styles.statCard}><Statistic title="Поездок" value={user?.travelHistory?.length || 0} /></Card>
                  </div>

                  <Card title="Виджет накоплений" style={styles.glassCard}>
                    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                      <div style={styles.progressHeader}>
                        <Text strong>Прогресс цели</Text>
                        <Text>{formatMoney(savingsMetrics.currentAmount)} / {formatMoney(savingsMetrics.goalAmount)}</Text>
                      </div>
                      <Progress percent={savingsMetrics.progressPercent} strokeColor={{ '0%': BRAND_BLUE, '100%': BRAND_GOLD }} size={[undefined, 18]} />
                      <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}><Tag color={getSavingsStatusColor(savingsMetrics.status)}>Статус: {formatSavingsStatus(savingsMetrics.status)}</Tag></Col>
                        <Col xs={24} md={12}><Tag color="processing">До цели: {savingsMetrics.daysLeft} дней</Tag></Col>
                      </Row>
                    </Space>
                  </Card>

                  <Card title="Достижения" style={styles.glassCard}>
                    <Row gutter={[12, 12]}>
                      {(user?.achievements || []).map((achievement) => (
                        <Col xs={24} md={12} key={achievement}>
                          <Card size="small" style={styles.achievementCard}>
                            <Space>
                              <TrophyOutlined style={{ color: BRAND_GOLD }} />
                              <Text strong>{achievement}</Text>
                            </Space>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card>

                  <Card title="История путешествий" style={styles.glassCard}>
                    <div className="travelpay-table-shell">
                      <Table
                        rowKey="id"
                        dataSource={user?.travelHistory || []}
                        columns={historyColumns}
                        pagination={{ pageSize: 4 }}
                        scroll={{ x: 640 }}
                      />
                    </div>
                  </Card>

                  <Row gutter={[20, 20]}>
                    <Col xs={24} lg={12}>
                      <Card title="Избранные туры" style={styles.glassCard}>
                        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                          {favoriteItems.length ? favoriteItems.map((item) => (
                            <Card key={item.id || item.title} size="small" style={styles.listCard}>
                              <div style={styles.listRow}>
                                <Space align="start">
                                  <Avatar shape="square" src={item.image} icon={<HeartOutlined />} />
                                  <div>
                                    <Text strong>{item.title}</Text>
                                    <br />
                                    <Text type="secondary">{`${item.location || 'TravelPay'} · ${formatMoney(item.price)}`}</Text>
                                  </div>
                                </Space>
                                <Button type="link" onClick={() => navigate('/favorites')}>Открыть</Button>
                              </div>
                            </Card>
                          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Пока нет избранных туров" />}
                        </Space>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                      <Card title="Уведомления" style={styles.glassCard}>
                        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                          {(user?.notifications || []).slice(0, 5).length ? (user?.notifications || []).slice(0, 5).map((item) => (
                            <Card key={item.id} size="small" style={styles.listCard}>
                              <Space align="start">
                                <Avatar icon={<NotificationOutlined />} style={{ background: '#dbeafe', color: BRAND_BLUE }} />
                                <div>
                                  <Text strong>{item.title}</Text>
                                  <br />
                                  <Text type="secondary">{`${item.description} · ${formatDate(item.date)}`}</Text>
                                </div>
                              </Space>
                            </Card>
                          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Нет уведомлений" />}
                        </Space>
                      </Card>
                    </Col>
                  </Row>

                  <Card title="Редактирование профиля" style={styles.glassCard}>
                    <Form form={form} layout="vertical" onFinish={handleSaveProfile} className="travelpay-adaptive-form">
                      <Row gutter={16}>
                        <Col xs={24} md={12}><Form.Item name="name" label="Имя"><Input /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="phone" label="Телефон"><Input /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="email" label="Email"><Input type="email" /></Form.Item></Col>
                        <Col xs={24} md={12}><Form.Item name="country" label="Страна"><Input /></Form.Item></Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="preferredLanguage" label="Язык">
                            <Select options={['KG', 'RU', 'EN'].map((value) => ({ value, label: value }))} />
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item name="travelPreferences" label="Предпочтения">
                            <Input.TextArea rows={4} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Divider />
                      <Button htmlType="submit" type="primary" icon={<SafetyCertificateOutlined />} style={styles.primaryButton}>
                        Сохранить профиль
                      </Button>
                    </Form>
                  </Card>
                </Space>
              </Col>
            </Row>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

const styles = {
  page: (isDark) => ({
    minHeight: '100vh',
    background: isDark
      ? 'radial-gradient(circle at top left, rgba(20,184,166,0.15), transparent 28%), #081526'
      : 'linear-gradient(180deg, #f7fbff 0%, #edf5fb 100%)',
  }),
  sider: (isDark) => ({
    background: isDark ? 'rgba(14,31,52,0.96)' : 'linear-gradient(180deg, #17325c 0%, #102544 100%)',
  }),
  sidebarInner: {
    padding: 18,
    height: '100%',
  },
  drawerBody: {
    padding: 0,
  },
  content: {
    padding: 0,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd166)`,
    color: BRAND_BLUE,
    fontWeight: 900,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  kicker: {
    color: BRAND_GOLD,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  pageTitle: {
    margin: '8px 0 6px',
    color: BRAND_BLUE,
    fontSize: 'clamp(24px, 4vw, 40px)',
    lineHeight: 1.08,
    wordBreak: 'normal',
    whiteSpace: 'normal',
  },
  pageSubtitle: {
    maxWidth: 780,
    color: '#64748b',
    margin: 0,
    wordBreak: 'normal',
    whiteSpace: 'normal',
  },
  glassCard: {
    borderRadius: 20,
    border: '1px solid rgba(23,50,92,0.08)',
    boxShadow: '0 24px 55px rgba(23,50,92,0.08)',
    background: 'rgba(255,255,255,0.88)',
  },
  statCard: {
    borderRadius: 20,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(23,50,92,0.08)',
    boxShadow: '0 16px 40px rgba(23,50,92,0.08)',
  },
  achievementCard: {
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(252,163,17,0.12), rgba(20,184,166,0.08))',
  },
  listCard: {
    borderRadius: 16,
    background: 'rgba(23,50,92,0.04)',
  },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  primaryButton: {
    background: BRAND_BLUE,
    borderColor: BRAND_BLUE,
    fontWeight: 900,
  },
  mobileMenuButton: {
    marginBottom: 12,
    borderRadius: 14,
    height: 42,
    fontWeight: 700,
  },
};

export default ProfilePage;
