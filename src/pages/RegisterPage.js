import React, { useState } from 'react';
import { App, Button, Checkbox, Divider, Form, Input, Space, Typography } from 'antd';
import {
  FacebookFilled,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import {
  agreementRules,
  confirmPasswordRules,
  emailRules,
  passwordRules,
  phoneRules,
  requiredRule,
} from '../components/auth/authValidation';
import { getApiErrorMessage } from '../utils/apiErrors';
import { saveAuthSession } from '../utils/currentUser';
import { DEFAULT_SAVINGS } from '../utils/savings';
import { syncCurrentUser } from '../utils/user';

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
  const role = String(responseUser?.role || payload?.role || 'user').trim().toLowerCase();

  return {
    responseUser,
    token,
    companyId,
    role,
  };
};

const RegisterPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const email = values.email.trim().toLowerCase();
      const password = values.password.trim();
      const existing = await api.get('/users', { params: { email } });

      if (existing.data.length > 0) {
        message.error('Пользователь с таким email уже существует.');
        return;
      }

      const registerResponse = await api.post('/users', {
        name: values.name.trim(),
        email,
        phone: values.phone,
        password,
        balance: 0,
        role: 'user',
        avatar: 'https://www.w3schools.com/howto/img_avatar.png',
        isLoggedIn: true,
        favorites: [],
        savings: DEFAULT_SAVINGS,
      });

      let {
        responseUser,
        companyId,
        role,
      } = extractAuthPayload(registerResponse.data);

      if (!responseUser?.id) {
        message.error('Аккаунт создан, но сервер не выдал токен. Перезапустите backend и войдите снова.');
        return;
      }

      const user = syncCurrentUser({ ...responseUser, isLoggedIn: true });
      saveAuthSession({
        user,
        role,
        companyId,
      });

      message.success('Аккаунт успешно создан');
      navigate('/profile');
    } catch (err) {
      message.error(getApiErrorMessage(
        err,
        'Не удалось зарегистрироваться. Проверьте доступность backend.',
      ));
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSuccess = (responseUser) => {
    const user = syncCurrentUser({ ...responseUser, isLoggedIn: true });
    saveAuthSession({ user, role: user.role, companyId: user.companyId });
    message.success('Аккаунт Google подключён');
    navigate('/profile');
  };

  return (
    <AuthLayout
      eyebrow="Новый профиль"
      title="Создать аккаунт"
      subtitle="Получите доступ к бронированиям, избранным турам и персональным рекомендациям TravelPay."
    >
      <Form layout="vertical" onFinish={handleSubmit} className="auth-form">
        <Form.Item name="name" label="Имя" rules={[requiredRule('Введите имя')]}>
          <Input size="large" prefix={<UserOutlined />} placeholder="Ваше имя" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input size="large" prefix={<MailOutlined />} type="email" placeholder="you@example.com" />
        </Form.Item>

        <Form.Item name="phone" label="Телефон" rules={phoneRules}>
          <Input size="large" prefix={<PhoneOutlined />} placeholder="+996 555 123 456" />
        </Form.Item>

        <Form.Item name="password" label="Пароль" rules={passwordRules}>
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="Введите пароль" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Повторите пароль"
          dependencies={['password']}
          rules={confirmPasswordRules}
        >
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="Повторите пароль" />
        </Form.Item>

        <Form.Item name="agreement" valuePropName="checked" rules={agreementRules}>
          <Checkbox>Я согласен с условиями сервиса и политикой конфиденциальности</Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-submit">
          Зарегистрироваться
        </Button>
      </Form>
      <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={(error) => message.error(getApiErrorMessage(error, 'Не удалось зарегистрироваться через Google.'))} />

      <Divider plain>или зарегистрироваться через</Divider>

      <Space.Compact block className="auth-socials">
        <Button size="large" icon={<GoogleOutlined />}>Google</Button>
        <Button size="large" icon={<FacebookFilled />}>Facebook</Button>
      </Space.Compact>

      <div className="auth-footer">
        <Text type="secondary">Уже есть аккаунт?</Text>
        <Button type="link" onClick={() => navigate('/login')}>Войти</Button>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
