import React, { useState } from 'react';
import { Button, Checkbox, Divider, Form, Input, Space, Typography, message } from 'antd';
import {
  FacebookFilled,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthLayout from '../components/auth/AuthLayout';
import { emailRules, loginPasswordRules } from '../components/auth/authValidation';
import { saveCurrentUser } from '../utils/currentUser';

const { Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });
      const user = { ...response.data, isLoggedIn: true };

      saveCurrentUser(user);
      message.success('Р”РѕР±СЂРѕ РїРѕР¶Р°Р»РѕРІР°С‚СЊ РІ TravelPay');
      navigate(user.role === 'admin' ? '/admin/tours' : '/profile');
    } catch (err) {
      message.error('РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕР№С‚Рё. РџСЂРѕРІРµСЂСЊС‚Рµ backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Р’РѕР№С‚Рё РІ Р°РєРєР°СѓРЅС‚"
      subtitle="РџСЂРѕРґРѕР»Р¶РёС‚Рµ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРµ С‚СѓСЂРѕРІ, РёР·Р±СЂР°РЅРЅРѕРµ Рё РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹Рµ СЂРµРєРѕРјРµРЅРґР°С†РёРё."
    >
      <Form layout="vertical" onFinish={handleSubmit} className="auth-form">
        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input size="large" prefix={<MailOutlined />} type="email" placeholder="you@example.com" />
        </Form.Item>

        <Form.Item name="password" label="РџР°СЂРѕР»СЊ" rules={loginPasswordRules}>
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="Р’РІРµРґРёС‚Рµ РїР°СЂРѕР»СЊ" />
        </Form.Item>

        <div className="auth-form-row">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Р—Р°РїРѕРјРЅРёС‚СЊ РјРµРЅСЏ</Checkbox>
          </Form.Item>
          <Button type="link" className="auth-inline-link">Р—Р°Р±С‹Р»Рё РїР°СЂРѕР»СЊ?</Button>
        </div>

        <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-submit">
          Р’РѕР№С‚Рё
        </Button>
      </Form>

      <Divider plain>РёР»Рё РІРѕР№С‚Рё С‡РµСЂРµР·</Divider>

      <Space.Compact block className="auth-socials">
        <Button size="large" icon={<GoogleOutlined />}>Google</Button>
        <Button size="large" icon={<FacebookFilled />}>Facebook</Button>
      </Space.Compact>

      <div className="auth-footer">
        <Text type="secondary">РќРµС‚ Р°РєРєР°СѓРЅС‚Р°?</Text>
        <Button type="link" onClick={() => navigate('/register')}>Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ</Button>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
