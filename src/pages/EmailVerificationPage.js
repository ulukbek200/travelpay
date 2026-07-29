import React, { useMemo, useState } from 'react';
import { App, Button, Form, Input, Typography } from 'antd';
import { MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import { getApiErrorMessage } from '../utils/apiErrors';
import { saveAuthSession } from '../utils/currentUser';
import { syncCurrentUser } from '../utils/user';

const { Text } = Typography;
const PENDING_EMAIL_KEY = 'travelpay_pending_verification_email';

const EmailVerificationPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const email = useMemo(() => String(
    location.state?.email || window.sessionStorage.getItem(PENDING_EMAIL_KEY) || '',
  ).trim().toLowerCase(), [location.state]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleConfirm = async ({ code }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/email-verification/confirm', { email, code: String(code || '').trim() });
      const rawUser = response.data?.user || response.data;
      const token = String(response.data?.authToken || rawUser?.authToken || '').trim();
      const user = syncCurrentUser({ ...rawUser, isLoggedIn: true });
      saveAuthSession({ user, role: user.role, companyId: user.companyId, token });
      window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
      message.success('Email подтверждён. Добро пожаловать в TravelPay!');
      navigate('/profile');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось подтвердить код.'));
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setResending(true);
    try {
      await api.post('/auth/email-verification/resend', { email });
      message.success('Новый код отправлен на email.');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Не удалось отправить код повторно.'));
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout eyebrow="Подтверждение" title="Сначала зарегистрируйтесь" subtitle="Мы отправим код подтверждения на указанный email.">
        <Button type="primary" size="large" block onClick={() => navigate('/register')}>К регистрации</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Безопасность аккаунта"
      title="Подтвердите email"
      subtitle={`Мы отправили шестизначный код на ${email}. Код действует 15 минут.`}
    >
      <Form layout="vertical" onFinish={handleConfirm} className="auth-form">
        <Form.Item name="code" label="Код из письма" rules={[{ required: true, pattern: /^\d{6}$/, message: 'Введите 6 цифр из письма.' }]}>
          <Input
            size="large"
            prefix={<SafetyCertificateOutlined />}
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            placeholder="000000"
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-submit">
          Подтвердить email
        </Button>
      </Form>
      <div className="auth-footer" style={{ justifyContent: 'space-between' }}>
        <Text type="secondary"><MailOutlined /> Не получили письмо?</Text>
        <Button type="link" loading={resending} onClick={resendCode}>Отправить ещё раз</Button>
      </div>
    </AuthLayout>
  );
};

export default EmailVerificationPage;
