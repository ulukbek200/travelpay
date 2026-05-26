import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Calendar,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Layout,
  List,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  BankOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  DashboardOutlined,
  DollarOutlined,
  DownOutlined,
  FileTextOutlined,
  HeartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  NotificationOutlined,
  SearchOutlined,
  SettingOutlined,
  SunOutlined,
  TeamOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { clearCurrentUser, readCurrentUser, saveCurrentUser } from '../utils/currentUser';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';
const TURQUOISE = '#16b6c4';

const menuItems = [
  ['profile', 'Профиль', <UserOutlined />],
  ['bookings', 'Мои бронирования', <CompassOutlined />],
  ['favorites', 'Избранные туры', <HeartOutlined />],
  ['savings', 'Накопления', <BankOutlined />],
  ['calendar', 'Календарь', <CalendarOutlined />],
  ['payments', 'Платежи', <CreditCardOutlined />],
  ['instructions', 'Инструкции', <FileTextOutlined />],
  ['support', 'Поддержка', <CustomerServiceOutlined />],
  ['settings', 'Настройки', <SettingOutlined />],
  ['partnership', 'Партнёрство', <TeamOutlined />],
];

const languageLabels = {
  KG: { search: 'Издөө', dashboard: 'Жеке кабинет', save: 'Сактоо' },
  RU: { search: 'Поиск по кабинету', dashboard: 'Личный кабинет', save: 'Сохранить' },
  EN: { search: 'Search dashboard', dashboard: 'Dashboard', save: 'Save' },
};

const bookings = [
  {
    id: 'TP-IK-2048',
    destination: 'Issyk-Kul Premium Escape',
    date: '2026-06-18',
    travelers: 2,
    total: 42000,
    status: 'upcoming',
    payment: 'paid',
  },
  {
    id: 'TP-ALM-1182',
    destination: 'Kolsai Lakes & Kaindy',
    date: '2026-07-04',
    travelers: 4,
    total: 96000,
    status: 'upcoming',
    payment: 'unpaid',
  },
  {
    id: 'TP-CH-0904',
    destination: 'Charyn Canyon Private Tour',
    date: '2026-04-12',
    travelers: 2,
    total: 58000,
    status: 'completed',
    payment: 'paid',
  },
  {
    id: 'TP-SK-0670',
    destination: 'Song-Kol Nomad Experience',
    date: '2026-03-20',
    travelers: 3,
    total: 72000,
    status: 'canceled',
    payment: 'refunded',
  },
];

const payments = [
  { id: 'INV-2048', date: '2026-05-12', item: 'Issyk-Kul Premium Escape', amount: 42000, status: 'paid' },
  { id: 'INV-1182', date: '2026-05-20', item: 'Kolsai Lakes & Kaindy', amount: 96000, status: 'unpaid' },
  { id: 'INV-0904', date: '2026-04-01', item: 'Charyn Canyon Private Tour', amount: 58000, status: 'paid' },
];

const instructions = [
  ['Travel checklist', 'Passport, warm layers, comfortable shoes, power bank, sunglasses, reusable water bottle.'],
  ['Visa / passport reminders', 'Check passport validity and border requirements before Kazakhstan routes.'],
  ['What to bring', 'For mountains: jacket, trekking shoes, sunscreen, cash for small local stops.'],
  ['Safety rules', 'Follow guide instructions near canyons, lakes, horse routes, and high-altitude roads.'],
  ['Pickup instructions', 'Driver contacts are sent 24 hours before departure with exact pickup time.'],
  ['Guide contact', '+996 555 123 456 · WhatsApp available in KG / RU / EN.'],
];

const recommendedTours = [
  ['Kel-Suu Expedition', 'Remote canyon lake, premium 4x4 journey', 'Kyrgyzstan'],
  ['Big Almaty Lake', 'Luxury day route from Almaty', 'Kazakhstan'],
  ['Karakol Adventure', 'Mountains, food, culture, and hot springs', 'Kyrgyzstan'],
];

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} сом`;

const statusColor = {
  upcoming: 'gold',
  completed: 'green',
  canceled: 'red',
  paid: 'green',
  unpaid: 'orange',
  refunded: 'blue',
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [theme, setTheme] = useState(() => localStorage.getItem('dashboard_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('travelpay_language') || 'RU');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsBooking, setDetailsBooking] = useState(null);

  const isDark = theme === 'dark';
  const t = languageLabels[language] || languageLabels.RU;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const parsedUser = readCurrentUser();

        if (!parsedUser?.isLoggedIn || !parsedUser?.id) {
          navigate('/login');
          return;
        }

        const response = await api.get(`/users/${parsedUser.id}`);
        const hydratedUser = {
          preferredLanguage: language,
          country: 'Kyrgyzstan',
          travelPreferences: 'Mountains, lakes, private tours',
          phone: '',
          ...response.data,
          isLoggedIn: true,
        };

        saveCurrentUser(hydratedUser);
        setUser(hydratedUser);
        form.setFieldsValue(hydratedUser);
      } catch (error) {
        navigate('/login');
      }
    };

    loadUser();
  }, [form, language, navigate]);

  const completion = useMemo(() => {
    if (!user) return 0;
    const fields = ['name', 'email', 'phone', 'country', 'preferredLanguage', 'travelPreferences', 'avatar'];
    const filled = fields.filter((field) => Boolean(user[field])).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return [
      ...bookings.map((item) => ({ type: 'Booking', title: item.destination, meta: item.id })),
      ...payments.map((item) => ({ type: 'Payment', title: item.item, meta: item.id })),
      ...instructions.map(([title, meta]) => ({ type: 'Instruction', title, meta })),
      ...recommendedTours.map(([title, meta]) => ({ type: 'Tour', title, meta })),
      { type: 'Destination', title: 'Issyk-Kul', meta: 'Kyrgyzstan' },
      { type: 'Destination', title: 'Kolsai Lakes', meta: 'Kazakhstan' },
      { type: 'Support', title: 'Contact manager', meta: '+996 555 123 456' },
    ].filter((item) => `${item.type} ${item.title} ${item.meta}`.toLowerCase().includes(query));
  }, [searchQuery]);

  const themeStyles = {
    page: {
      background: isDark
        ? 'radial-gradient(circle at top left, rgba(22,182,196,0.18), transparent 28%), #091827'
        : 'linear-gradient(180deg, #f7fbfd 0%, #eef5f9 100%)',
      color: isDark ? '#e8f2ff' : '#172033',
    },
    panel: {
      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.82)',
      border: isDark ? '1px solid rgba(255,255,255,0.13)' : '1px solid rgba(29,53,87,0.08)',
      boxShadow: isDark ? '0 24px 70px rgba(0,0,0,0.28)' : '0 22px 55px rgba(29,53,87,0.10)',
      backdropFilter: 'blur(20px)',
    },
    text: isDark ? '#e8f2ff' : BRAND_BLUE,
    muted: isDark ? '#a9bad0' : '#64748b',
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('travelpay_language', value);
    window.dispatchEvent(new CustomEvent('travelpay-language-change', { detail: value }));
    setUser((prev) => ({ ...prev, preferredLanguage: value }));
    form.setFieldValue('preferredLanguage', value);
  };

  const handleThemeChange = (checked) => {
    const nextTheme = checked ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('dashboard_theme', nextTheme);
  };

  const handleAvatarUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const avatar = reader.result;
      setUser((prev) => ({ ...prev, avatar }));
      form.setFieldValue('avatar', avatar);
      message.success('Аватар обновлён');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleSaveProfile = async (values) => {
    try {
      const updatedUser = {
        ...user,
        ...values,
        preferredLanguage: values.preferredLanguage || language,
        isLoggedIn: true,
      };
      const response = await api.put(`/users/${user.id}`, updatedUser);
      const nextUser = { ...response.data, isLoggedIn: true };
      saveCurrentUser(nextUser);
      setUser(nextUser);
      message.success('Профиль сохранён');
    } catch (error) {
      message.error('Не удалось сохранить профиль. Проверьте backend.');
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate('/');
  };

  const shellCard = (extra = {}) => ({
    ...styles.glassCard,
    ...themeStyles.panel,
    ...extra,
  });

  const bookingColumns = [
    { title: 'Booking ID', dataIndex: 'id' },
    { title: 'Destination', dataIndex: 'destination' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'Travelers', dataIndex: 'travelers' },
    { title: 'Total', dataIndex: 'total', render: formatMoney },
    { title: 'Status', dataIndex: 'status', render: (value) => <Tag color={statusColor[value]}>{value}</Tag> },
    { title: 'Payment', dataIndex: 'payment', render: (value) => <Tag color={statusColor[value]}>{value}</Tag> },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => setDetailsBooking(record)}>View details</Button>
          {record.payment === 'unpaid' && <Button size="small" style={styles.goldButton}>Pay now</Button>}
          {record.status === 'upcoming' && <Button size="small" danger>Cancel</Button>}
          <Button size="small" onClick={() => setActiveSection('support')}>Manager</Button>
        </Space>
      ),
    },
  ];

  const paymentColumns = [
    { title: 'Invoice', dataIndex: 'id' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'Tour', dataIndex: 'item' },
    { title: 'Amount', dataIndex: 'amount', render: formatMoney },
    { title: 'Status', dataIndex: 'status', render: (value) => <Tag color={statusColor[value]}>{value}</Tag> },
    { title: 'Receipt', render: () => <Button size="small">Download</Button> },
  ];

  if (!user) return null;

  const renderDashboard = () => (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={[18, 18]}>
        {[
          ['Next trip', 'Kolsai Lakes & Kaindy', <CompassOutlined />, TURQUOISE],
          ['Bookings', bookings.length, <DashboardOutlined />, BRAND_GOLD],
          ['Savings balance', formatMoney(user.balance || 0), <BankOutlined />, '#2dd4bf'],
          ['Favorite tours', user?.favorites?.length || 0, <HeartOutlined />, '#fb7185'],
        ].map(([label, value, icon, color]) => (
          <Col xs={24} md={12} xl={6} key={label}>
            <motion.div whileHover={{ y: -5 }}>
              <Card style={shellCard({ minHeight: 136 })}>
                <div style={{ ...styles.widgetIcon, background: color }}>{icon}</div>
                <Text style={{ color: themeStyles.muted, fontWeight: 800 }}>{label}</Text>
                <Title level={4} style={{ color: themeStyles.text, margin: '8px 0 0' }}>{value}</Title>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} lg={15}>
          <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Next trip</span>}>
            <div style={styles.nextTrip}>
              <div>
                <Tag color="cyan">Kazakhstan · Almaty region</Tag>
                <Title level={2} style={{ color: '#fff', margin: '12px 0 8px' }}>Kolsai Lakes & Kaindy</Title>
                <Paragraph style={{ color: '#dbeafe', maxWidth: 560 }}>
                  Private lake journey with mountain viewpoints, premium transport, and consultation deadline on June 28.
                </Paragraph>
                <Space wrap>
                  <Button style={styles.goldButton}>View details</Button>
                  <Button ghost>Contact manager</Button>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Payment reminder</span>}>
            <Timeline
              items={[
                { color: 'orange', children: 'Kolsai Lakes invoice due: 96,000 сом' },
                { color: 'cyan', children: 'Consultation: June 24, 16:00' },
                { color: 'green', children: 'Issyk-Kul booking paid' },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} lg={14}>
          <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Recommended tours</span>}>
            <List
              dataSource={recommendedTours}
              renderItem={([title, text, country]) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar style={{ background: BRAND_GOLD, color: BRAND_BLUE }} icon={<CompassOutlined />} />}
                    title={<span style={{ color: themeStyles.text }}>{title}</span>}
                    description={<span style={{ color: themeStyles.muted }}>{country} · {text}</span>}
                  />
                  <Button onClick={() => navigate('/tours')}>Open</Button>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Partner invitation</span>}>
            <Paragraph style={{ color: themeStyles.muted }}>
              Tour companies, guides, hotels, guest houses, drivers, and agencies can cooperate with TravelPay.
            </Paragraph>
            <Button style={styles.goldButton} onClick={() => navigate('/#partnership')}>Become a partner</Button>
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const renderProfile = () => (
    <Row gutter={[18, 18]}>
      <Col xs={24} xl={8}>
        <Card style={shellCard()} bodyStyle={{ textAlign: 'center' }}>
          <div style={styles.avatarWrap}>
            <Avatar size={118} src={user.avatar} icon={<UserOutlined />} />
            <Upload showUploadList={false} beforeUpload={handleAvatarUpload}>
              <Button shape="circle" icon={<UploadOutlined />} style={styles.avatarEdit} />
            </Upload>
          </div>
          <Title level={3} style={{ color: themeStyles.text, marginTop: 18 }}>{user.name}</Title>
          <Tag color="gold" icon={<CheckCircleOutlined />}>Verified traveler</Tag>
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <Text style={{ color: themeStyles.muted }}>Profile completion</Text>
            <Progress percent={completion} strokeColor={{ '0%': TURQUOISE, '100%': BRAND_GOLD }} />
          </div>
        </Card>
        <Card style={shellCard({ marginTop: 18 })} title={<span style={{ color: themeStyles.text }}>Recent activity</span>}>
          <Timeline
            items={[
              { children: 'Saved Kel-Suu Expedition to favorites' },
              { children: 'Updated preferred language' },
              { children: 'Paid Issyk-Kul booking invoice' },
            ]}
          />
        </Card>
      </Col>

      <Col xs={24} xl={16}>
        <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Profile details</span>}>
          <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
            <Row gutter={16}>
              <Col xs={24} md={12}><Form.Item name="name" label="Name"><Input /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="phone" label="Phone"><Input placeholder="+996 ..." /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="email" label="Email"><Input type="email" /></Form.Item></Col>
              <Col xs={24} md={12}><Form.Item name="country" label="Country"><Input /></Form.Item></Col>
              <Col xs={24} md={12}>
                <Form.Item name="preferredLanguage" label="Preferred language">
                  <Select options={['KG', 'RU', 'EN'].map((value) => ({ value, label: value }))} onChange={handleLanguageChange} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="travelPreferences" label="Travel preferences">
                  <Input.TextArea rows={4} placeholder="Mountains, lakes, private tours, nomad culture..." />
                </Form.Item>
              </Col>
            </Row>
            <Button htmlType="submit" style={styles.goldButton}>{t.save}</Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );

  const renderBookings = () => (
    <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Bookings</span>}>
      <Table rowKey="id" dataSource={bookings} columns={bookingColumns} scroll={{ x: 1050 }} />
    </Card>
  );

  const renderCalendar = () => (
    <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Tour calendar</span>}>
      <Calendar
        fullscreen
        cellRender={(date) => {
          const day = date.format('YYYY-MM-DD');
          const booking = bookings.find((item) => item.date === day);
          const deadline = day === '2026-06-28';
          if (!booking && !deadline) return null;
          return (
            <div>
              {booking && <Badge color={BRAND_GOLD} text={booking.destination} />}
              {deadline && <Badge color="red" text="Payment deadline" />}
            </div>
          );
        }}
      />
    </Card>
  );

  const renderPayments = () => (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      <Row gutter={[18, 18]}>
        <Col xs={24} md={8}><Card style={shellCard()}><Statistic title="Paid" value={100000} suffix="сом" prefix={<DollarOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card style={shellCard()}><Statistic title="Unpaid" value={96000} suffix="сом" prefix={<NotificationOutlined />} /></Card></Col>
        <Col xs={24} md={8}><Card style={shellCard()}><Statistic title="Saved method" value="Visa •••• 4412" /></Card></Col>
      </Row>
      <Card style={shellCard()} title={<span style={{ color: themeStyles.text }}>Payment history</span>}>
        <Table rowKey="id" dataSource={payments} columns={paymentColumns} scroll={{ x: 760 }} />
      </Card>
    </Space>
  );

  const renderInstructions = () => (
    <Row gutter={[18, 18]}>
      {instructions.map(([title, text], index) => (
        <Col xs={24} md={12} key={title}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card style={shellCard({ height: '100%' })}>
              <Title level={4} style={{ color: themeStyles.text }}>{title}</Title>
              <Paragraph style={{ color: themeStyles.muted }}>{text}</Paragraph>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );

  const renderSimpleSection = (title, text, action) => (
    <Card style={shellCard()}>
      <Title level={2} style={{ color: themeStyles.text }}>{title}</Title>
      <Paragraph style={{ color: themeStyles.muted, maxWidth: 720 }}>{text}</Paragraph>
      {action}
    </Card>
  );

  const contentMap = {
    profile: renderProfile(),
    bookings: renderBookings(),
    favorites: renderSimpleSection('Избранные туры', 'Откройте сохранённые туры по Кыргызстану и Казахстану / Алматы региону.', <Button style={styles.goldButton} onClick={() => navigate('/favorites')}>Open favorites</Button>),
    savings: renderSimpleSection('Накопления', 'Планируйте бюджет на будущую поездку и отслеживайте прогресс накоплений.', <Button style={styles.goldButton} onClick={() => navigate('/savings-plan')}>Open savings</Button>),
    calendar: renderCalendar(),
    payments: renderPayments(),
    instructions: renderInstructions(),
    support: renderSimpleSection('Поддержка', 'Свяжитесь с менеджером TravelPay по бронированию, оплате, маршрутам и партнёрству.', <Space><Button style={styles.goldButton}>WhatsApp</Button><Button>Call manager</Button></Space>),
    settings: renderSimpleSection('Настройки', 'Управляйте языком, темой, уведомлениями и безопасностью аккаунта.', <Switch checked={isDark} onChange={handleThemeChange} checkedChildren="Dark" unCheckedChildren="Light" />),
    partnership: renderSimpleSection('Партнёрство', 'Тур компании, гиды, отели, транспортные компании и агентства могут сотрудничать с TravelPay.', <Button style={styles.goldButton} onClick={() => navigate('/#partnership')}>Become a partner</Button>),
  };

  return (
    <Layout style={{ ...styles.page, ...themeStyles.page }}>
      <Sider
        width={280}
        collapsedWidth={84}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{ ...styles.sider, ...themeStyles.panel }}
      >
        <div style={styles.sidebarHeader}>
          <div style={styles.logoMark}>TP</div>
          {!collapsed && (
            <div>
              <Text style={{ color: themeStyles.text, fontWeight: 950 }}>TravelPay</Text>
              <br />
              <Text style={{ color: BRAND_GOLD, fontSize: 12, fontWeight: 800 }}>Central Asia</Text>
            </div>
          )}
        </div>

        <div style={styles.sidebarMenu}>
          {menuItems.map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => key === 'logout' ? handleLogout() : setActiveSection(key)}
              style={{
                ...styles.sidebarItem,
                color: themeStyles.text,
                ...(activeSection === key ? styles.sidebarItemActive : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              {icon}
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
          <button type="button" onClick={handleLogout} style={{ ...styles.sidebarItem, color: '#ff8b8b', justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <LogoutOutlined />
            {!collapsed && <span>Выйти</span>}
          </button>
        </div>
      </Sider>

      <Layout style={{ background: 'transparent' }}>
        <div style={{ ...styles.topbar, ...themeStyles.panel }}>
          <Button
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
            style={styles.iconButton}
          />
          <Input
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t.search}
            style={styles.searchInput}
          />
          <div style={styles.languagePill}>
            {['KG', 'RU', 'EN'].map((item) => (
              <button key={item} type="button" onClick={() => handleLanguageChange(item)} style={{ ...styles.languageButton, ...(language === item ? styles.languageButtonActive : {}) }}>
                {item}
              </button>
            ))}
          </div>
          <Switch checked={isDark} onChange={handleThemeChange} checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} />
          <Badge count={3}>
            <Button shape="circle" icon={<BellOutlined />} style={styles.iconButton} />
          </Badge>
          <Dropdown
            menu={{
              items: [
                { key: 'profile', label: 'Профиль', icon: <UserOutlined /> },
                { key: 'logout', label: 'Выйти', icon: <LogoutOutlined />, danger: true },
              ],
              onClick: ({ key }) => key === 'logout' ? handleLogout() : setActiveSection('profile'),
            }}
          >
            <Button style={styles.avatarButton}>
              <Avatar src={user.avatar} icon={<UserOutlined />} />
              <DownOutlined />
            </Button>
          </Dropdown>
        </div>

        {searchResults.length > 0 && (
          <div style={{ ...styles.searchResults, ...themeStyles.panel }}>
            {searchResults.slice(0, 6).map((item) => (
              <button key={`${item.type}-${item.title}`} type="button" style={styles.searchResultItem}>
                <Tag color="gold">{item.type}</Tag>
                <span style={{ color: themeStyles.text }}>{item.title}</span>
                <small style={{ color: themeStyles.muted }}>{item.meta}</small>
              </button>
            ))}
          </div>
        )}

        <Content style={styles.content}>
          <div style={styles.contentHeader}>
            <div>
              <Text style={{ color: BRAND_GOLD, fontWeight: 950, textTransform: 'uppercase' }}>{t.dashboard}</Text>
              <Title level={1} style={{ color: themeStyles.text, margin: '6px 0 0' }}>
                Добро пожаловать, {user.name}
              </Title>
            </div>
            <Tag color="gold" style={{ fontWeight: 900 }}>Premium traveler</Tag>
          </div>

          {activeSection === 'profile' ? renderProfile() : activeSection === 'bookings' ? renderBookings() : contentMap[activeSection] || renderDashboard()}

          {activeSection === 'profile' && (
            <div style={{ marginTop: 18 }}>
              {renderDashboard()}
            </div>
          )}
        </Content>
      </Layout>

      <Modal open={!!detailsBooking} onCancel={() => setDetailsBooking(null)} footer={null} title={detailsBooking?.destination}>
        {detailsBooking && (
          <Space direction="vertical" size={12}>
            <Text>Booking ID: <strong>{detailsBooking.id}</strong></Text>
            <Text>Date: <strong>{detailsBooking.date}</strong></Text>
            <Text>Travelers: <strong>{detailsBooking.travelers}</strong></Text>
            <Text>Total: <strong>{formatMoney(detailsBooking.total)}</strong></Text>
            <Space>
              <Tag color={statusColor[detailsBooking.status]}>{detailsBooking.status}</Tag>
              <Tag color={statusColor[detailsBooking.payment]}>{detailsBooking.payment}</Tag>
            </Space>
          </Space>
        )}
      </Modal>
    </Layout>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: 'Inter, Poppins, Arial, sans-serif',
  },
  sider: {
    minHeight: '100vh',
    position: 'sticky',
    top: 0,
    padding: 18,
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  logoMark: {
    width: 46,
    height: 46,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_GOLD})`,
    color: '#fff',
    fontWeight: 950,
    boxShadow: '0 12px 28px rgba(252,163,17,0.25)',
  },
  sidebarMenu: {
    display: 'grid',
    gap: 8,
  },
  sidebarItem: {
    border: 'none',
    borderRadius: 16,
    background: 'transparent',
    minHeight: 44,
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    fontWeight: 850,
    transition: 'transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
  },
  sidebarItemActive: {
    background: `linear-gradient(135deg, rgba(252,163,17,0.95), rgba(22,182,196,0.82))`,
    color: `${BRAND_BLUE} !important`,
    boxShadow: '0 14px 28px rgba(252,163,17,0.22)',
    transform: 'translateX(3px)',
  },
  topbar: {
    margin: 18,
    borderRadius: 22,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    position: 'sticky',
    top: 18,
    zIndex: 20,
  },
  iconButton: {
    borderRadius: 12,
    borderColor: 'rgba(29,53,87,0.12)',
  },
  searchInput: {
    flex: 1,
    minWidth: 160,
    borderRadius: 14,
  },
  languagePill: {
    display: 'inline-flex',
    gap: 4,
    padding: 4,
    borderRadius: 999,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(252,163,17,0.20)',
  },
  languageButton: {
    border: 'none',
    borderRadius: 999,
    background: 'transparent',
    padding: '7px 10px',
    color: BRAND_BLUE,
    fontWeight: 950,
    cursor: 'pointer',
  },
  languageButtonActive: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffc15a)`,
    boxShadow: '0 8px 18px rgba(252,163,17,0.28)',
  },
  avatarButton: {
    height: 42,
    borderRadius: 14,
  },
  searchResults: {
    position: 'fixed',
    top: 86,
    left: 330,
    right: 40,
    zIndex: 30,
    borderRadius: 18,
    padding: 10,
    display: 'grid',
    gap: 8,
  },
  searchResultItem: {
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    cursor: 'pointer',
  },
  content: {
    padding: '0 18px 42px',
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    alignItems: 'flex-start',
    margin: '8px 0 20px',
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  widgetIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    fontSize: 22,
    marginBottom: 14,
  },
  nextTrip: {
    minHeight: 280,
    borderRadius: 24,
    padding: 26,
    display: 'flex',
    alignItems: 'flex-end',
    background:
      'linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.72)), url(https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  avatarWrap: {
    position: 'relative',
    display: 'inline-block',
  },
  avatarEdit: {
    position: 'absolute',
    right: -4,
    bottom: 4,
    background: BRAND_GOLD,
    color: BRAND_BLUE,
    borderColor: BRAND_GOLD,
  },
  goldButton: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffc15a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 950,
    boxShadow: '0 12px 26px rgba(252,163,17,0.22)',
  },
};

export default ProfilePage;
