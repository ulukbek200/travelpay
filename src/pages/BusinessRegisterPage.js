import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Layout,
  Result,
  Row,
  Space,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  BankOutlined,
  FileProtectOutlined,
  InboxOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getApiErrorMessage } from '../utils/apiErrors';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const BusinessRegisterPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const logoFile = values.logo?.[0]?.originFileObj;
      const documents = values.documents || [];
      const logo = logoFile ? await fileToDataUrl(logoFile) : '';

      await api.post('/business/register', {
        companyName: values.companyName.trim(),
        ownerName: values.ownerName.trim(),
        phone: values.phone,
        email: values.email.trim().toLowerCase(),
        password: values.password,
        city: values.city,
        address: values.address,
        description: values.description,
        logo,
        documents: documents.map((item) => item.name).filter(Boolean),
      });

      setSubmitted(true);
      message.success('Заявка компании отправлена.');
      form.resetFields();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось отправить заявку компании.'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout className="business-page business-page--register" style={styles.page}>
        <Content style={styles.narrow}>
          <Card className="business-surface-card" style={styles.card}>
            <Result
              status="success"
              title="Заявка компании отправлена"
              subTitle="После проверки вы сможете публиковать туры."
              extra={[
                <Button key="login" type="primary" onClick={() => navigate('/business/login')}>
                  Войти в TravelPay Business
                </Button>,
                <Button key="home" onClick={() => navigate('/business')}>К Business-странице</Button>,
              ]}
            />
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="business-page business-page--register" style={styles.page}>
      <Content style={styles.content}>
        <Row gutter={[24, 24]} align="top">
          <Col xs={24} lg={8}>
            <Space direction="vertical" size={18}>
              <Button type="link" onClick={() => navigate('/business')} style={{ padding: 0 }}>
                Назад в TravelPay Business
              </Button>
              <div>
                <Text type="secondary">Партнёрская заявка</Text>
                <Title style={styles.title}>Регистрация тур-компании</Title>
                <Paragraph style={styles.subtitle}>
                  Заполните данные компании. TravelPay проверит заявку, после чего владелец получит доступ к публикации туров.
                </Paragraph>
              </div>
              <Alert
                type="info"
                showIcon
                message="До подтверждения статус компании будет pending."
                description="Компания сможет войти в Business, но публикация туров и управление каталогом будут закрыты."
              />
            </Space>
          </Col>
          <Col xs={24} lg={16}>
            <Card className="business-surface-card" style={styles.card} styles={{ body: { padding: 24 } }}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="companyName" label="Название компании" rules={[{ required: true, message: 'Введите название компании' }]}>
                      <Input size="large" prefix={<BankOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="ownerName" label="Имя владельца" rules={[{ required: true, message: 'Введите имя владельца' }]}>
                      <Input size="large" prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="phone" label="Телефон" rules={[{ required: true, message: 'Введите телефон' }]}>
                      <Input size="large" prefix={<PhoneOutlined />} placeholder="+996 555 123 456" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}>
                      <Input size="large" prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 4, message: 'Минимум 4 символа' }]}>
                      <Input.Password size="large" prefix={<LockOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="confirmPassword"
                      label="Повтор пароля"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Повторите пароль' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            return !value || getFieldValue('password') === value
                              ? Promise.resolve()
                              : Promise.reject(new Error('Пароли не совпадают'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password size="large" prefix={<LockOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="city" label="Город" rules={[{ required: true, message: 'Введите город' }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="address" label="Адрес офиса" rules={[{ required: true, message: 'Введите адрес офиса' }]}>
                      <Input size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="description" label="Описание компании" rules={[{ required: true, message: 'Опишите компанию' }]}>
                      <Input.TextArea rows={4} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="logo"
                      label="Логотип компании"
                      valuePropName="fileList"
                      getValueFromEvent={(event) => event?.fileList || []}
                    >
                      <Upload listType="picture" beforeUpload={() => false} maxCount={1}>
                        <Button icon={<InboxOutlined />}>Загрузить логотип</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="documents"
                      label="Документы компании"
                      valuePropName="fileList"
                      getValueFromEvent={(event) => event?.fileList || []}
                    >
                      <Upload beforeUpload={() => false} multiple>
                        <Button icon={<FileProtectOutlined />}>Прикрепить документы</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="agreement"
                      valuePropName="checked"
                      rules={[{ validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error('Нужно согласиться с правилами'))) }]}
                    >
                      <Checkbox>Я согласен с правилами TravelPay Business и политикой проверки компаний</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
                <Button type="primary" size="large" htmlType="submit" loading={loading} block>
                  Отправить заявку компании
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  content: { width: 'min(1180px, calc(100% - 32px))', margin: '0 auto', padding: '40px 0' },
  narrow: { width: 'min(760px, calc(100% - 32px))', margin: '0 auto', padding: '64px 0' },
  title: { marginTop: 8, color: '#111827' },
  subtitle: { fontSize: 16, color: '#475569' },
  card: { borderRadius: 8, border: '1px solid rgba(15, 23, 42, 0.08)' },
};

export default BusinessRegisterPage;
