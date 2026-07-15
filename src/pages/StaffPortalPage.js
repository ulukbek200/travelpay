import React from 'react';
import { Button, Card, Col, Layout, Row, Space, Tag, Typography } from 'antd';
import { BankOutlined, CompassOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const cards = [
  {
    key: 'admin',
    title: 'TravelPay Admin',
    description: 'Отдельный вход для super admin: компании, заявки, подписки, платежи и глобальные настройки платформы.',
    button: 'Войти как super admin',
    path: '/admin/login',
    icon: <SafetyCertificateOutlined />,
    accent: '#1677ff',
  },
  {
    key: 'business',
    title: 'TravelPay Business',
    description: 'Отдельный вход для тур-компаний: туры, брони, календарь, клиенты, оплаты и подписка компании.',
    button: 'Войти как компания',
    path: '/business/login',
    icon: <BankOutlined />,
    accent: '#f59e0b',
  },
];

const StaffPortalPage = () => {
  const navigate = useNavigate();

  return (
    <Layout style={styles.page}>
      <div style={styles.overlay} />
      <Content style={styles.content}>
        <Space orientation="vertical" size={20} style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Tag color="blue" style={{ padding: '6px 14px', borderRadius: 999 }}>TravelPay Staff Portal</Tag>
            <Title style={styles.title}>Отдельный вход для команды TravelPay</Title>
            <Paragraph style={styles.subtitle}>
              Эта страница не для клиентов. Выберите нужный рабочий кабинет и входите отдельно от основного сайта.
            </Paragraph>
          </div>

          <Row gutter={[18, 18]}>
            {cards.map((item) => (
              <Col xs={24} md={12} key={item.key}>
                <Card style={styles.card}>
                  <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                    <div style={{ ...styles.iconWrap, background: `${item.accent}18`, color: item.accent }}>
                      {item.icon}
                    </div>
                    <div>
                      <Title level={3} style={{ marginBottom: 8 }}>{item.title}</Title>
                      <Text type="secondary">{item.description}</Text>
                    </div>
                    <Button type="primary" size="large" block onClick={() => navigate(item.path)}>
                      {item.button}
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" icon={<CompassOutlined />} onClick={() => navigate('/')}>
              Вернуться на основной сайт
            </Button>
          </div>
        </Space>
      </Content>
    </Layout>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    backgroundImage: 'linear-gradient(135deg, rgba(3,7,18,0.94), rgba(15,23,42,0.92)), url("/images/kyrgyzstan-mountains.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backdropFilter: 'blur(6px)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: 'min(1100px, calc(100% - 32px))',
    margin: '0 auto',
    padding: '56px 0',
  },
  title: {
    color: '#fff',
    marginTop: 18,
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(226,232,240,0.82)',
    maxWidth: 760,
    margin: '0 auto',
    fontSize: 16,
  },
  card: {
    borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(10,18,32,0.86)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.34)',
  },
  iconWrap: {
    width: 56,
    height: 56,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    fontSize: 24,
  },
};

export default StaffPortalPage;
