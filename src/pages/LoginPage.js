import React, { useState } from 'react';
import { App, Button, Checkbox, Divider, Form, Input, Space, Typography } from 'antd';
import {
  FacebookFilled,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import { emailRules, loginPasswordRules } from '../components/auth/authValidation';
import { getApiErrorMessage } from '../utils/apiErrors';
import { clearCurrentUser, saveAuthSession, saveBusinessSession } from '../utils/currentUser';
import { canAccessBusinessPanel, getAdminLandingPath, syncCurrentUser } from '../utils/user';

const { Text } = Typography;

const extractAuthPayload = (payload) => {
  const responseUser = payload?.user || payload || null;
  const token = String(
    payload?.authToken
    || payload?.token
    || responseUser?.authToken
    || responseUser?.token
    || '',
  ).trim();
  const companyId = String(responseUser?.companyId || payload?.companyId || '').trim();
  const role = String(responseUser?.role || payload?.role || '').trim().toLowerCase();

  return {
    responseUser,
    token,
    companyId,
    role,
  };
};

const LoginPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const login = async ({ email, password }) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const {
        responseUser,
        token,
        companyId,
        role,
      } = extractAuthPayload(response.data);
      const businessAccount = canAccessBusinessPanel(responseUser);

      console.log('LOGIN RESPONSE:', response.data);
      console.log('TOKEN:', token);
      console.log('COMPANY ID:', companyId);
      console.log('ROLE:', role);

      if (!responseUser?.id) {
        clearCurrentUser();
        message.error('Не удалось завершить вход. Сервер не выдал токен.');
        return;
      }

      const user = syncCurrentUser({ ...responseUser, isLoggedIn: true });
      saveAuthSession({
        user,
        role,
        companyId,
      });

      if (businessAccount) {
        if (!companyId) {
          clearCurrentUser();
          message.error('Не удалось определить компанию для TravelPay Business.');
          return;
        }

        saveBusinessSession({
          user,
          companyId,
          role,
        });

        try {
          await api.get(`/companies/${companyId}`);
        } catch (companyError) {
          clearCurrentUser();
          if (companyError.response?.status === 403) {
            message.error('У вас нет доступа к этой компании');
            return;
          }
          throw companyError;
        }
      }

      if (location.state?.redirectTo && location.state?.tour) {
        message.success('Добро пожаловать в TravelPay');
        navigate(location.state.redirectTo, { state: { tour: location.state.tour }, replace: true });
        return;
      }

      message.success(businessAccount ? 'Добро пожаловать в TravelPay Business' : 'Добро пожаловать в TravelPay');
      navigate(getAdminLandingPath(user));
    } catch (err) {
      message.error(getApiErrorMessage(
        err,
        'Не удалось войти. Проверьте email, пароль и доступность backend.',
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (values) => login(values);
  const handleGoogleSuccess = (responseUser) => {
    const user = syncCurrentUser({ ...responseUser, isLoggedIn: true });
    saveAuthSession({ user, role: user.role, companyId: user.companyId });
    message.success('Вход через Google выполнен');
    navigate(getAdminLandingPath(user));
  };

  return (
    <AuthLayout
      eyebrow="С возвращением"
      title="Войти в аккаунт"
      subtitle="Продолжайте бронирование туров, смотрите избранное и управляйте своим профилем."
    >
      <Form layout="vertical" onFinish={handleSubmit} className="auth-form">
        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input
            size="large"
            prefix={<MailOutlined />}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Form.Item>

        <Form.Item name="password" label="Пароль" rules={loginPasswordRules}>
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            autoComplete="current-password"
            placeholder="Введите пароль"
          />
        </Form.Item>

        <div className="auth-form-row">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Запомнить меня</Checkbox>
          </Form.Item>
          <Button type="link" className="auth-inline-link">Забыли пароль?</Button>
        </div>

        <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-submit">
          Войти
        </Button>
      </Form>
      <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={(error) => message.error(getApiErrorMessage(error, 'Не удалось войти через Google.'))} />

      <Divider plain>или войти через</Divider>

      <Space.Compact block className="auth-socials">
        <Button size="large" icon={<GoogleOutlined />}>Google</Button>
        <Button size="large" icon={<FacebookFilled />}>Facebook</Button>
      </Space.Compact>

      <div className="auth-footer">
        <Text type="secondary">Нет аккаунта?</Text>
        <Button type="link" onClick={() => navigate('/register')}>Зарегистрироваться</Button>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
