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
  Statistic,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  BankOutlined,
  CameraOutlined,
  FileProtectOutlined,
  InboxOutlined,
  InstagramOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getApiErrorMessage } from '../utils/apiErrors';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const BUSINESS_SUBSCRIPTION_PRICE = 14900;

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
      const passportFile = values.passport?.[0]?.originFileObj;
      const receiptFile = values.receipt?.[0]?.originFileObj;
      const documents = values.documents || [];

      const logo = logoFile ? await fileToDataUrl(logoFile) : '';
      const passportImage = passportFile ? await fileToDataUrl(passportFile) : '';
      const receiptImage = receiptFile ? await fileToDataUrl(receiptFile) : '';

      await api.post('/business/register', {
        companyName: values.companyName.trim(),
        ownerName: values.ownerName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        city: values.city.trim(),
        address: values.address.trim(),
        instagramUrl: values.instagramUrl.trim(),
        description: values.description.trim(),
        logo,
        documents: documents.map((item) => item.name).filter(Boolean),
        passportImage,
        passportName: values.passport?.[0]?.name || '',
        passportType: values.passport?.[0]?.type || '',
        receiptImage,
        receiptName: values.receipt?.[0]?.name || '',
        receiptType: values.receipt?.[0]?.type || '',
        comment: values.comment?.trim() || '',
        agreementAccepted: true,
        contractAccepted: true,
      });

      setSubmitted(true);
      message.success('Заявка компании отправлена супер-админу.');
      form.resetFields();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось отправить заявку компании.'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout style={styles.page}>
        <Content style={styles.narrow}>
          <Card style={styles.card}>
            <Result
              status="success"
              title="Заявка отправлена"
              subTitle="Супер-админ получил договор, паспорт, Instagram и оплату подписки. После подтверждения вам откроется доступ в TravelPay Business."
              extra={[
                <Button key="login" type="primary" onClick={() => navigate('/business/login')}>
                  Перейти ко входу
                </Button>,
                <Button key="home" onClick={() => navigate('/business')}>
                  На страницу Business
                </Button>,
              ]}
            />
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={styles.page}>
      <Content style={styles.content}>
        <Row gutter={[24, 24]} align="top">
          <Col xs={24} lg={8}>
            <Space direction="vertical" size={18} style={{ width: '100%' }}>
              <Button type="link" onClick={() => navigate('/business')} style={{ padding: 0 }}>
                Назад в TravelPay Business
              </Button>

              <div>
                <Text type="secondary">Партнёрская регистрация</Text>
                <Title style={styles.title}>Заявка на подключение тур-компании</Title>
                <Paragraph style={styles.subtitle}>
                  Компания сразу заполняет данные, принимает договор, прикрепляет паспорт владельца,
                  Instagram и чек оплаты подписки. После этого заявка уходит супер-админу на подтверждение.
                </Paragraph>
              </div>

              <Card style={styles.priceCard}>
                <Statistic title="Подписка TravelPay Business" value={BUSINESS_SUBSCRIPTION_PRICE} suffix="сом / 30 дней" />
                <Paragraph style={styles.priceText}>
                  В стоимость входит кабинет компании, календарь, управление турами, домиками, клиентами и бронированиями.
                </Paragraph>
              </Card>

              <Alert
                type="info"
                showIcon
                message="Что проверяет супер-админ"
                description="Данные компании, согласие с договором, паспорт владельца, Instagram и чек оплаты подписки."
              />

              <Alert
                type="warning"
                showIcon
                message="Без полного пакета заявка не уйдёт"
                description="Все поля ниже обязательны: паспорт, Instagram, чек оплаты и согласие с договором."
              />
            </Space>
          </Col>

          <Col xs={24} lg={16}>
            <Card style={styles.card} styles={{ body: { padding: 24 } }}>
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
                    <Form.Item
                      name="instagramUrl"
                      label="Ссылка на Instagram"
                      rules={[
                        { required: true, message: 'Добавьте ссылку на Instagram' },
                        { type: 'url', message: 'Введите полную ссылку на Instagram' },
                      ]}
                    >
                      <Input size="large" prefix={<InstagramOutlined />} placeholder="https://instagram.com/your_company" />
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
                        <Button icon={<CameraOutlined />}>Загрузить логотип</Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="documents"
                      label="Дополнительные документы"
                      valuePropName="fileList"
                      getValueFromEvent={(event) => event?.fileList || []}
                    >
                      <Upload beforeUpload={() => false} multiple>
                        <Button icon={<FileProtectOutlined />}>Прикрепить документы</Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="passport"
                      label="Паспорт владельца"
                      valuePropName="fileList"
                      getValueFromEvent={(event) => event?.fileList || []}
                      rules={[{ required: true, message: 'Загрузите паспорт владельца' }]}
                    >
                      <Upload beforeUpload={() => false} maxCount={1}>
                        <Button icon={<SafetyCertificateOutlined />}>Загрузить паспорт</Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="receipt"
                      label="Чек оплаты подписки"
                      valuePropName="fileList"
                      getValueFromEvent={(event) => event?.fileList || []}
                      rules={[{ required: true, message: 'Загрузите чек оплаты' }]}
                    >
                      <Upload beforeUpload={() => false} maxCount={1}>
                        <Button icon={<WalletOutlined />}>Загрузить чек</Button>
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item name="comment" label="Комментарий к заявке">
                      <Input.TextArea rows={3} placeholder="Например: реквизиты, ФИО владельца, удобный контакт для проверки" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Card size="small" style={styles.contractCard}>
                      <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Text strong>Договор TravelPay Business</Text>
                        <Text type="secondary">
                          Подписка оформляется на 30 дней. Доступ в кабинет открывается только после подтверждения супер-админом.
                        </Text>
                        <Text type="secondary">
                          Вместе с заявкой отправляются данные компании, паспорт владельца, Instagram и чек оплаты.
                        </Text>
                        <Button type="link" style={{ padding: 0 }} onClick={() => navigate('/AgreePage')}>
                          Открыть страницу с договорами и условиями
                        </Button>
                      </Space>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      name="agreement"
                      valuePropName="checked"
                      rules={[{ validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error('Подтвердите согласие с условиями сервиса'))) }]}
                    >
                      <Checkbox>Я принимаю правила сервиса и обработку данных</Checkbox>
                    </Form.Item>

                    <Form.Item
                      name="contract"
                      valuePropName="checked"
                      rules={[{ validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error('Нужно принять договор и стоимость подписки'))) }]}
                    >
                      <Checkbox>Я принимаю договор и стоимость подписки: 14 900 сом за 30 дней</Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                <Button type="primary" size="large" htmlType="submit" loading={loading} block icon={<InboxOutlined />}>
                  Отправить заявку супер-админу
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
  priceCard: { borderRadius: 16, border: '1px solid rgba(15, 23, 42, 0.08)' },
  priceText: { margin: '12px 0 0', color: '#475569' },
  contractCard: { background: '#f8fafc', borderRadius: 14 },
};

export default BusinessRegisterPage;
