import React, { useState } from 'react';
import { Alert, App, Button, Form, Input, Typography } from 'antd';
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import { emailRules, loginPasswordRules } from '../components/auth/authValidation';
import { getApiErrorMessage } from '../utils/apiErrors';
import { clearCurrentUser, saveAuthSession, saveBusinessSession } from '../utils/currentUser';
import { syncCurrentUser } from '../utils/user';

const { Paragraph, Text } = Typography;

const extractAdminAuthPayload = (payload, headers = {}) => {
  const responseUser = payload?.user || payload || null;
  const headerAuthorization = String(
    headers?.authorization
    || headers?.Authorization
    || headers?.['x-auth-token']
    || headers?.['X-Auth-Token']
    || '',
  ).trim();
  const bearerToken = headerAuthorization.toLowerCase().startsWith('bearer ')
    ? headerAuthorization.slice(7).trim()
    : headerAuthorization;
  const token = String(
    payload?.authToken
    || payload?.token
    || payload?.accessToken
    || payload?.access_token
    || payload?.jwt
    || payload?.jwtToken
    || responseUser?.authToken
    || responseUser?.token
    || responseUser?.accessToken
    || responseUser?.access_token
    || responseUser?.jwt
    || responseUser?.jwtToken
    || bearerToken
    || '',
  ).trim();
  const role = String(responseUser?.role || payload?.role || '').trim().toLowerCase();
  const companyId = String(responseUser?.companyId || payload?.companyId || '').trim();

  return {
    responseUser,
    token,
    role,
    companyId,
  };
};

const AdminLoginPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: values.email.trim().toLowerCase(),
        password: values.password.trim(),
      });

      console.log('ADMIN LOGIN RESPONSE:', response.data);

      const {
        responseUser,
        token,
        role,
        companyId,
      } = extractAdminAuthPayload(response.data, response.headers);

      console.log('ADMIN TOKEN:', token);
      console.log('ADMIN ROLE:', role);
      console.log('ADMIN COMPANY ID:', companyId);
      console.log('ADMIN RESPONSE HEADERS:', response.headers);

      if (!token) {
        clearCurrentUser();
        message.error('Не удалось завершить вход администратора. Сервер не выдал токен.');
        return;
      }

      if (role !== 'super_admin' && role !== 'admin') {
        clearCurrentUser();
        message.error('Этот аккаунт не имеет доступа к TravelPay Admin');
        return;
      }

      const user = syncCurrentUser({ ...responseUser, authToken: token, isLoggedIn: true });

      saveAuthSession({
        token,
        user,
        role,
        companyId,
      });

      saveBusinessSession({
        token,
        user,
        companyId,
        role,
      });

      message.success('Добро пожаловать в TravelPay Admin');
      navigate('/admin/tours', { replace: true });
    } catch (error) {
      clearCurrentUser();

      if (error?.response?.status === 401) {
        message.error('Неверный email или пароль super admin.');
        return;
      }

      message.error(getApiErrorMessage(error, 'Не удалось войти в TravelPay Admin.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="TravelPay Admin"
      title="Вход для super admin"
      subtitle="Отдельный защищённый вход для управления компаниями, оплатами, заявками и платформой."
    >
      <div style={{ marginBottom: 18, padding: 14, borderRadius: 14, background: 'rgba(22,119,255,0.08)' }}>
        <Paragraph style={{ margin: 0 }}>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          Используйте этот вход только для super admin TravelPay.
        </Paragraph>
      </div>

      <Alert
        showIcon
        type="info"
        style={{ marginBottom: 18, borderRadius: 14 }}
        message="Служебный вход"
        description={(
          <span>
            Можно войти под текущим email super admin или через служебный alias <Text code>admin@travelpay.kg</Text>.
          </span>
        )}
      />

      <Form layout="vertical" onFinish={handleSubmit} className="auth-form">
        <Form.Item
          name="email"
          label="Email"
          rules={emailRules}
          initialValue="admin@travelpay.kg"
        >
          <Input size="large" prefix={<MailOutlined />} type="email" autoComplete="email" placeholder="admin@travelpay.kg" />
        </Form.Item>

        <Form.Item name="password" label="Пароль" rules={loginPasswordRules}>
          <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" placeholder="Введите пароль" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-submit">
          Войти в TravelPay Admin
        </Button>
      </Form>

      <div style={{ marginTop: 16 }}>
        <Button type="link" block onClick={() => navigate('/staff')}>
          Назад в staff-портал
        </Button>
      </div>
    </AuthLayout>
  );
};

export default AdminLoginPage;
