import React, { useState } from 'react';
import { Button, Checkbox, Divider, Form, Input, Space, Typography, message } from 'antd';
import {
  FacebookFilled,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import { emailRules, loginPasswordRules } from '../components/auth/authValidation';
import { getApiErrorMessage } from '../utils/apiErrors';
import { syncCurrentUser } from '../utils/user';

const { Text } = Typography;

const LoginPage = () => {
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
      const user = syncCurrentUser({ ...response.data, isLoggedIn: true });
      message.success('Добро пожаловать в TravelPay');
      if (location.state?.redirectTo && location.state?.tour) {
        navigate(location.state.redirectTo, { state: { tour: location.state.tour }, replace: true });
        return;
      }

      navigate(user.role === 'admin' ? '/admin/tours' : '/profile');
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
