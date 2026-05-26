import React, { useState } from 'react';
import { Button, Checkbox, Divider, Form, Input, Space, Typography, message } from 'antd';
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
import {
  agreementRules,
  confirmPasswordRules,
  emailRules,
  passwordRules,
  phoneRules,
  requiredRule,
} from '../components/auth/authValidation';
import { saveCurrentUser } from '../utils/currentUser';

const { Text } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const email = values.email.trim().toLowerCase();
      const existing = await api.get('/users', { params: { email } });

      if (existing.data.length > 0) {
        message.error('РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј email СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚.');
        return;
      }

      const response = await api.post('/users', {
        name: values.name.trim(),
        email,
        phone: values.phone,
        password: values.password,
        balance: 0,
        role: 'user',
        avatar: 'https://www.w3schools.com/howto/img_avatar.png',
        isLoggedIn: true,
        favorites: [],
      });

      saveCurrentUser({ ...response.data, isLoggedIn: true });
      message.success('РђРєРєР°СѓРЅС‚ СѓСЃРїРµС€РЅРѕ СЃРѕР·РґР°РЅ');
      navigate('/profile');
    } catch (err) {
      message.error('РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ. РџСЂРѕРІРµСЂСЊС‚Рµ, С‡С‚Рѕ backend Р·Р°РїСѓС‰РµРЅ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create profile"
      title="РЎРѕР·РґР°С‚СЊ Р°РєРєР°СѓРЅС‚"
      subtitle="РџРѕР»СѓС‡РёС‚Рµ РґРѕСЃС‚СѓРї Рє Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏРј, РёР·Р±СЂР°РЅРЅС‹Рј С‚СѓСЂР°Рј Рё premium travel-СЃРµСЂРІРёСЃСѓ."
    >
      <Form layout="vertical" onFinish={handleSubmit} className="auth-form">
        <Form.Item name="name" label="РРјСЏ" rules={[requiredRule('Р’РІРµРґРёС‚Рµ РёРјСЏ')]}>
          <Input size="large" prefix={<UserOutlined />} placeholder="Р’Р°С€Рµ РёРјСЏ" />
        </Form.Item>

        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input size="large" prefix={<MailOutlined />} type="email" placeholder="you@example.com" />
        </Form.Item>

        <Form.Item name="phone" label="РўРµР»РµС„РѕРЅ" rules={phoneRules}>
          <Input size="large" prefix={<PhoneOutlined />} placeholder="+996 555 123 456" />
        </Form.Item>

        <Form.Item name="password" label="РџР°СЂРѕР»СЊ" rules={passwordRules}>
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="Р’РІРµРґРёС‚Рµ РїР°СЂРѕР»СЊ" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="РџРѕРІС‚РѕСЂРёС‚СЊ РїР°СЂРѕР»СЊ"
          dependencies={['password']}
          rules={confirmPasswordRules}
        >
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="РџРѕРІС‚РѕСЂРёС‚Рµ РїР°СЂРѕР»СЊ" />
        </Form.Item>

        <Form.Item name="agreement" valuePropName="checked" rules={agreementRules}>
          <Checkbox>РЇ СЃРѕРіР»Р°СЃРµРЅ СЃ СѓСЃР»РѕРІРёСЏРјРё СЃРµСЂРІРёСЃР° Рё РїРѕР»РёС‚РёРєРѕР№ РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё</Checkbox>
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-submit">
          Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ
        </Button>
      </Form>

      <Divider plain>РёР»Рё Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ С‡РµСЂРµР·</Divider>

      <Space.Compact block className="auth-socials">
        <Button size="large" icon={<GoogleOutlined />}>Google</Button>
        <Button size="large" icon={<FacebookFilled />}>Facebook</Button>
      </Space.Compact>

      <div className="auth-footer">
        <Text type="secondary">РЈР¶Рµ РµСЃС‚СЊ Р°РєРєР°СѓРЅС‚?</Text>
        <Button type="link" onClick={() => navigate('/login')}>Р’РѕР№С‚Рё</Button>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
