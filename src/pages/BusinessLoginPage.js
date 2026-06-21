import React, { useState } from 'react';
import { Alert, Button, Card, Form, Input, Layout, Result, Space, Tag, Typography, message } from 'antd';
import { BankOutlined, CalendarOutlined, CompassOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { saveCurrentUser } from '../utils/currentUser';
import { syncCurrentUser } from '../utils/user';
import { getApiErrorMessage } from '../utils/apiErrors';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const BusinessLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companyState, setCompanyState] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setCompanyState(null);
    try {
      const response = await api.post('/business/login', {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      if (response.data.status === 'pending') {
        setCompanyState(response.data);
        return;
      }

      const user = syncCurrentUser({ ...response.data.user, isLoggedIn: true });
      saveCurrentUser(user);
      message.success('Добро пожаловать в TravelPay Business');
      navigate('/business/dashboard');
    } catch (error) {
      const data = error.response?.data;
      if (data?.status === 'rejected' || data?.status === 'blocked') {
        setCompanyState(data);
        return;
      }
      message.error(getApiErrorMessage(error, 'Не удалось войти в TravelPay Business.'));
    } finally {
      setLoading(false);
    }
  };

  const renderCompanyState = () => {
    if (!companyState) return null;

    if (companyState.status === 'pending') {
      return (
        <Result
          status="info"
          title="Компания ожидает подтверждения"
          subTitle="После проверки TravelPay вы сможете публиковать туры."
          extra={<Button onClick={() => setCompanyState(null)}>Вернуться ко входу</Button>}
        />
      );
    }

    return (
      <Result
        status="warning"
        title={companyState.status === 'rejected' ? 'Заявка компании отклонена' : 'Доступ компании ограничен'}
        subTitle={companyState.message || companyState.company?.rejectionReason || 'Свяжитесь с администратором TravelPay.'}
        extra={<Button onClick={() => setCompanyState(null)}>Вернуться ко входу</Button>}
      />
    );
  };

  return (
    <Layout className="business-page business-page--login" style={styles.page}>
      <div className="business-login-bg-overlay" style={styles.bgOverlay} />
      <Content style={styles.content}>
        <Card className="business-login-card" style={styles.card} styles={{ body: { padding: 0 } }}>
          <div className="business-login-shell" style={styles.shell}>
            <div className="business-login-aside" style={styles.aside}>
              <Tag color="gold">TravelPay Business</Tag>
              <Title style={styles.title}>Вход для тур-компаний</Title>
              <Paragraph style={styles.subtitle}>
                Клиенты входят через обычный TravelPay. Компании используют отдельный Business-доступ.
              </Paragraph>
              <div className="business-login-metrics" style={styles.metrics}>
                <div style={styles.metric}>
                  <CompassOutlined />
                  <strong>Туры</strong>
                  <span>публикация после проверки</span>
                </div>
                <div style={styles.metric}>
                  <CalendarOutlined />
                  <strong>Календарь</strong>
                  <span>места, даты, брони</span>
                </div>
                <div style={styles.metric}>
                  <SafetyCertificateOutlined />
                  <strong>Доступ</strong>
                  <span>только своя компания</span>
                </div>
              </div>
              <Alert
                type="success"
                showIcon
                message="Данные компании защищены"
                description="После входа менеджеры видят только свои туры, бронирования, календарь и клиентов."
              />
            </div>
            <div className="business-form-pane" style={styles.formPane}>
              {companyState ? renderCompanyState() : (
                <Space direction="vertical" size={18} style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary"><BankOutlined /> Business account</Text>
                    <Title level={3} style={{ margin: '8px 0 0' }}>Войти в кабинет</Title>
                  </div>
                  <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
                      <Input size="large" prefix={<MailOutlined />} />
                    </Form.Item>
                    <Form.Item name="password" label="Пароль" rules={[{ required: true, message: 'Введите пароль' }]}>
                      <Input.Password size="large" prefix={<LockOutlined />} />
                    </Form.Item>
                    <Button type="primary" size="large" htmlType="submit" loading={loading} block>
                      Войти в TravelPay Business
                    </Button>
                  </Form>
                  <Button type="link" block onClick={() => navigate('/business/register')}>
                    Зарегистрировать компанию
                  </Button>
                </Space>
              )}
            </div>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(90deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.74) 46%, rgba(245, 158, 11, 0.26)), url("/images/kyrgyzstan-mountains.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.42), rgba(2, 6, 23, 0.88))',
    pointerEvents: 'none',
  },
  content: { width: 'min(1120px, calc(100% - 32px))', margin: '0 auto', padding: '56px 0', position: 'relative', zIndex: 1 },
  card: { borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 34px 110px rgba(0,0,0,0.42)', backdropFilter: 'blur(18px)' },
  shell: { display: 'grid', gridTemplateColumns: '0.95fr 1.05fr' },
  aside: { padding: 32, minHeight: 560, background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.9), rgba(3, 7, 18, 0.74))', color: '#fff' },
  title: { color: '#fff', marginTop: 18 },
  subtitle: { color: '#cbd5e1', fontSize: 16, lineHeight: 1.7 },
  metrics: { display: 'grid', gap: 10, margin: '24px 0' },
  metric: {
    display: 'grid',
    gridTemplateColumns: '28px 1fr',
    columnGap: 12,
    rowGap: 2,
    alignItems: 'center',
    padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  formPane: { padding: 32, background: 'rgba(15, 23, 42, 0.9)', display: 'flex', alignItems: 'center' },
};

export default BusinessLoginPage;
