import React, { useEffect, useState } from 'react';
import {
  App,
  Alert,
  Button,
  Card,
  Form,
  Input,
  Layout,
  Result,
  Space,
  Tag,
  Typography,
  Upload,
} from 'antd';
import {
  BankOutlined,
  CalendarOutlined,
  CompassOutlined,
  InboxOutlined,
  InstagramOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  clearCurrentUser,
  consumeAuthRedirectError,
  saveAuthSession,
  saveBusinessSession,
} from '../utils/currentUser';
import { syncCurrentUser } from '../utils/user';
import { getApiErrorMessage } from '../utils/apiErrors';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const ALLOWED_BUSINESS_ROLES = new Set(['business', 'company_admin', 'company_manager', 'admin', 'super_admin']);
const BUSINESS_SUBSCRIPTION_PRICE = 4500;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const BusinessLoginPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [companyState, setCompanyState] = useState(null);

  useEffect(() => {
    const authError = consumeAuthRedirectError();
    if (authError) {
      message.error(authError);
    }
  }, [message]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setCompanyState(null);

    try {
      const response = await api.post('/business/login', {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      const responseUser = response.data?.user || null;
      const token = String(response.data?.authToken || response.data?.token || responseUser?.authToken || '').trim();
      const companyId = String(responseUser?.companyId || response.data?.company?.id || '').trim();
      const role = String(responseUser?.role || '').trim().toLowerCase();

      if (!responseUser?.id || !companyId) {
        clearCurrentUser();
        message.error('Не удалось завершить вход в TravelPay Business.');
        return;
      }

      if (!ALLOWED_BUSINESS_ROLES.has(role)) {
        clearCurrentUser();
        message.error('Этот аккаунт не имеет доступа к TravelPay Business');
        return;
      }

      const user = syncCurrentUser({
        ...responseUser,
        companyId: Number(companyId) || responseUser?.companyId,
        role,
        isLoggedIn: true,
      });

      saveAuthSession({ user, role, companyId, token });
      saveBusinessSession({
        user: responseUser,
        company: response.data?.company || null,
        companyId,
        role,
      });

      await api.get(`/companies/${companyId}`);

      message.success('Добро пожаловать в TravelPay Business');
      navigate('/business/dashboard');
    } catch (error) {
      const data = error.response?.data;

      if (data?.status) {
        setCompanyState(data);
        return;
      }

      if (error.response?.status === 403) {
        clearCurrentUser();
        message.error('У вас нет доступа к этой компании');
        return;
      }

      message.error(getApiErrorMessage(error, 'Не удалось войти в TravelPay Business.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionPayment = async (values) => {
    try {
      setPaymentLoading(true);
      const receiptFile = values.receipt?.[0]?.originFileObj;
      const passportFile = values.passport?.[0]?.originFileObj;
      const isRejectedResubmission = companyState?.status === 'rejected';

      if (!receiptFile) {
        message.error('Загрузите чек оплаты подписки.');
        return;
      }

      if (isRejectedResubmission && !passportFile) {
        message.error('Загрузите паспорт для повторной проверки.');
        return;
      }

      const receiptImage = await fileToDataUrl(receiptFile);
      const passportImage = passportFile ? await fileToDataUrl(passportFile) : '';
      const response = await api.post('/business/subscription/pay', {
        companyId: companyState?.company?.id,
        email: companyState?.user?.email,
        receiptImage,
        receiptName: receiptFile.name,
        receiptType: receiptFile.type,
        passportImage,
        passportName: passportFile?.name || '',
        passportType: passportFile?.type || '',
        instagramUrl: values.instagramUrl,
        comment: values.comment,
      });

      setCompanyState((current) => ({
        ...(current || {}),
        status: 'payment_review',
        message: isRejectedResubmission
          ? 'Повторная заявка компании отправлена и ждёт подтверждения super admin.'
          : 'Оплата подписки отправлена и ждёт подтверждения super admin.',
        company: response.data.company,
      }));
      paymentForm.resetFields();
      message.success('Оплата подписки отправлена на проверку.');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось отправить оплату подписки.'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderCompanyState = () => {
    if (!companyState) return null;

    if (companyState.status === 'payment_review') {
      return (
        <Result
          status="info"
          title="Оплата подписки на проверке"
          subTitle="Super admin получил уведомление и проверит платёж. После подтверждения доступ откроется на 30 дней."
          extra={<Button onClick={() => setCompanyState(null)}>Вернуться ко входу</Button>}
        />
      );
    }

    if (companyState.status === 'subscription_required' || companyState.status === 'rejected') {
      const isRejected = companyState.status === 'rejected';
      return (
        <Space orientation="vertical" size={18} style={{ width: '100%' }}>
          <Alert
            type={isRejected ? 'warning' : 'info'}
            showIcon
            message={isRejected ? 'Заявка компании отклонена' : 'Нужна оплата подписки'}
            description={companyState.message || 'Оплатите подписку и отправьте чек на проверку.'}
          />

          <Card size="small" style={{ borderRadius: 16 }}>
            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
              <Text strong>Подписка TravelPay Business</Text>
              <Text>{BUSINESS_SUBSCRIPTION_PRICE.toLocaleString('ru-RU')} сом за 30 дней доступа</Text>
              <Text type="secondary">
                {isRejected
                  ? 'Для повторной проверки обновите документы компании: Instagram, паспорт владельца и новый чек оплаты.'
                  : 'После оплаты super admin и компания получат уведомления о статусе платежа.'}
              </Text>
            </Space>
          </Card>

          <Form form={paymentForm} layout="vertical" onFinish={handleSubscriptionPayment}>
            {isRejected && (
              <>
                <Form.Item
                  name="instagramUrl"
                  label="Ссылка на Instagram"
                  initialValue={companyState.company?.instagramUrl || ''}
                  rules={[
                    { required: true, message: 'Добавьте ссылку на Instagram' },
                    { type: 'url', message: 'Введите полную ссылку на Instagram' },
                  ]}
                >
                  <Input prefix={<InstagramOutlined />} placeholder="https://instagram.com/your_company" />
                </Form.Item>
                <Form.Item
                  name="passport"
                  label="Паспорт владельца"
                  valuePropName="fileList"
                  getValueFromEvent={(event) => event?.fileList || []}
                  rules={[{ required: true, message: 'Загрузите паспорт владельца' }]}
                >
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<InboxOutlined />}>Загрузить паспорт</Button>
                  </Upload>
                </Form.Item>
              </>
            )}

            <Form.Item
              name="receipt"
              label="Чек оплаты подписки"
              valuePropName="fileList"
              getValueFromEvent={(event) => event?.fileList || []}
              rules={[{ required: true, message: 'Загрузите чек оплаты' }]}
            >
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<InboxOutlined />}>Загрузить чек</Button>
              </Upload>
            </Form.Item>

            <Form.Item name="comment" label="Комментарий">
              <Input.TextArea rows={3} placeholder={isRejected ? 'Например: обновили паспорт и отправили новый чек' : 'Например: оплата за июль'} />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={paymentLoading} block icon={<WalletOutlined />}>
              {isRejected ? 'Отправить заявку повторно' : 'Отправить оплату подписки'}
            </Button>
          </Form>

          <Button onClick={() => setCompanyState(null)}>Назад ко входу</Button>
        </Space>
      );
    }

    if (companyState.status === 'pending') {
      return (
        <Result
          status="info"
          title="Компания ожидает завершения регистрации"
          subTitle="Примите договор и оплатите подписку, чтобы открыть Business."
          extra={<Button onClick={() => setCompanyState(null)}>Вернуться ко входу</Button>}
        />
      );
    }

    return (
      <Result
        status="warning"
        title="Доступ компании ограничен"
        subTitle={companyState.message || 'Свяжитесь с super admin TravelPay.'}
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
                Компании работают в отдельном кабинете: публикуют туры, управляют календарём, следят за оплатами и бронями.
              </Paragraph>
              <div className="business-login-metrics" style={styles.metrics}>
                <div style={styles.metric}>
                  <CompassOutlined />
                  <strong>Туры</strong>
                  <span>создание и управление расписанием</span>
                </div>
                <div style={styles.metric}>
                  <CalendarOutlined />
                  <strong>Подписка</strong>
                  <span>доступ открывается на 30 дней</span>
                </div>
                <div style={styles.metric}>
                  <SafetyCertificateOutlined />
                  <strong>Уведомления</strong>
                  <span>компания и super admin видят статусы оплаты</span>
                </div>
              </div>
              <Alert
                type="success"
                showIcon
                message="Данные компании защищены"
                description="После входа сотрудники компании видят только свои туры, бронирования, календарь и статусы подписки."
              />
            </div>

            <div className="business-form-pane" style={styles.formPane}>
              {companyState ? renderCompanyState() : (
                <Space orientation="vertical" size={18} style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary"><BankOutlined /> Business account</Text>
                    <Title level={3} style={{ margin: '8px 0 0' }}>Войти в кабинет</Title>
                  </div>
                  <Form form={loginForm} layout="vertical" onFinish={handleSubmit}>
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
