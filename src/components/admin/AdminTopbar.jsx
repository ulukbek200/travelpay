import React from 'react';
import { Button, Input, Switch, Tooltip, Typography } from 'antd';
import { EyeOutlined, LinkOutlined, MenuOutlined, MoonOutlined, SearchOutlined, SunOutlined } from '@ant-design/icons';
import NotificationsButton from './NotificationsButton';
import PaymentsQuickButton from './PaymentsQuickButton';
import AdminProfileMenu from './AdminProfileMenu';

const { Text } = Typography;
const titleByTab = { home: 'Главная', companies: 'Компании', clients: 'Пользователи', tours: 'Туры', accommodations: 'Домики', bookings: 'Бронирования', calendar: 'Календарь', payments: 'Оплаты', reports: 'Финансы', settings: 'Настройки', savings: 'Финансы' };

export default function AdminTopbar({ currentTab, branchText, isDesktop, onMenu, onCopyLink, theme, onThemeChange, onOpenSite, user, company, onLogout, notifications, notificationsLoading, notificationsError, onMarkRead, pendingPayments, onNavigate, paymentsPath = '/admin/payments', notificationsPath = '/admin/notifications' }) {
  const compact = !isDesktop;
  return <header className="tp-admin-topbar">
    <div className="tp-admin-topbar__left"><Button icon={<MenuOutlined />} onClick={onMenu} className="tp-admin-header__menu" aria-label="Открыть навигацию" /><div className="tp-admin-topbar__title"><Text type="secondary">Админ-панель / {branchText}</Text><strong>{titleByTab[currentTab] || 'Панель управления'}</strong></div></div>
    <div className="tp-admin-topbar__right"><Input className="tp-admin-topbar__search" prefix={<SearchOutlined />} placeholder="Поиск" aria-label="Поиск по панели" /><Tooltip title="Скопировать ссылку"><Button icon={<LinkOutlined />} onClick={onCopyLink} aria-label="Скопировать ссылку" /></Tooltip><PaymentsQuickButton compact={compact} pendingCount={pendingPayments} onNavigate={onNavigate} basePath={paymentsPath} /><NotificationsButton notifications={notifications} loading={notificationsLoading} error={notificationsError} mobile={compact} onMarkRead={onMarkRead} onViewAll={() => onNavigate(notificationsPath)} /><div className="tp-admin-theme-toggle"><Switch checked={theme === 'dark'} onChange={(checked) => onThemeChange(checked ? 'dark' : 'light')} checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} aria-label="Переключить тему" /></div><Tooltip title="Открыть сайт"><Button icon={<EyeOutlined />} onClick={onOpenSite} aria-label="Открыть сайт" /></Tooltip><AdminProfileMenu user={user} company={company} onLogout={onLogout} /></div>
  </header>;
}
