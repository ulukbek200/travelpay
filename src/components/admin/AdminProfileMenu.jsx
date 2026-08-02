import React from 'react';
import { Avatar, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';

export default function AdminProfileMenu({ user, company, onLogout }) {
  return <Dropdown trigger={['click']} menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, danger: true, label: 'Выйти' }], onClick: ({ key }) => key === 'logout' && onLogout() }}>
    <button type="button" className="tp-admin-profile-chip" aria-label="Открыть меню профиля администратора"><Avatar src={user?.avatar} icon={<UserOutlined />} /><span className="tp-admin-profile-chip__copy"><strong>{user?.name || 'Администратор'}</strong><small>{company?.name || 'TravelPay'}</small></span></button>
  </Dropdown>;
}
