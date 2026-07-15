import React from 'react';
import { Button, Card, Col, Layout, Row, Space, Steps, Tag, Typography } from 'antd';
import {
  ArrowRightOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const BusinessLandingPage = () => {
  const navigate = useNavigate();

  return (
    <Layout className="business-page business-page--landing" style={styles.page}>
      <Content style={styles.content}>
        <section className="business-hero-grid" style={styles.hero}>
          <div style={styles.heroCopy}>
            <Tag color="gold" style={styles.tag}>TravelPay Business</Tag>
            <Title style={styles.title}>Панель для тур-компаний TravelPay</Title>
            <Paragraph style={styles.subtitle}>
              Отдельный вход для партнёров: публикуйте туры после проверки компании, управляйте бронированиями,
              календарём, клиентами и отчётами в одном премиальном кабинете.
            </Paragraph>
            <Space wrap size={12}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/business/login')}
              >
                Войти в TravelPay Business
              </Button>
              <Button size="large" icon={<BankOutlined />} onClick={() => navigate('/business/register')}>
                Зарегистрировать компанию
              </Button>
            </Space>
          </div>
          <Card className="business-surface-card" style={styles.heroCard} styles={{ body: { padding: 24 } }}>
            <Space orientation="vertical" size={18} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Статус публикации</Text>
                <Title level={3} style={{ margin: '4px 0 0' }}>Только подтверждённые компании</Title>
              </div>
              <Steps
                orientation="vertical"
                size="small"
                current={1}
                items={[
                  { title: 'Заявка', content: 'Компания отправляет данные и документы.' },
                  { title: 'Проверка TravelPay', content: 'Админ подтверждает или отклоняет заявку.' },
                  { title: 'Публикация туров', content: 'Активная компания управляет своими турами.' },
                ]}
              />
            </Space>
          </Card>
        </section>

        <Row gutter={[16, 16]} style={styles.cards}>
          {[
            { icon: <CompassOutlined />, title: 'Свои туры', text: 'Компания видит и редактирует только маршруты, привязанные к её companyId.' },
            { icon: <CalendarOutlined />, title: 'Календарь', text: 'Расписание показывает даты, свободные места, статусы и бронирования компании.' },
            { icon: <SafetyCertificateOutlined />, title: 'Защита доступа', text: 'Клиенты остаются в обычном входе, партнёры работают через Business.' },
            { icon: <CheckCircleOutlined />, title: 'Модерация', text: 'Главный админ TravelPay подтверждает, блокирует или отклоняет компании.' },
          ].map((item) => (
            <Col xs={24} md={12} xl={6} key={item.title}>
              <Card hoverable className="business-surface-card" style={styles.featureCard}>
                <div style={styles.featureIcon}>{item.icon}</div>
                <Title level={4}>{item.title}</Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>{item.text}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 52%, #fff7ed 100%)' },
  content: { width: 'min(1180px, calc(100% - 32px))', margin: '0 auto', padding: '56px 0' },
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.7fr)', gap: 24, alignItems: 'center' },
  heroCopy: { minWidth: 0 },
  tag: { marginBottom: 16, padding: '6px 12px', borderRadius: 999 },
  title: { fontSize: 52, lineHeight: 1.02, marginBottom: 18, color: '#111827' },
  subtitle: { fontSize: 18, lineHeight: 1.7, maxWidth: 720, color: '#475569' },
  heroCard: { borderRadius: 8, border: '1px solid rgba(15, 23, 42, 0.08)', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)' },
  cards: { marginTop: 36 },
  featureCard: { height: '100%', borderRadius: 8 },
  featureIcon: { width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 8, background: '#111827', color: '#facc15', fontSize: 22, marginBottom: 14 },
};

export default BusinessLandingPage;
