import React from 'react';
import { Menu, Tooltip } from 'antd';
import {
  BankOutlined, BarChartOutlined, CalendarOutlined, CompassOutlined,
  HomeOutlined, SettingOutlined, TeamOutlined, WalletOutlined,
} from '@ant-design/icons';

const labels = {
  dashboard: '\u041f\u0430\u043d\u0435\u043b\u044c \u0443\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f',
  content: '\u041a\u043e\u043d\u0442\u0435\u043d\u0442',
  people: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438',
  finance: '\u0424\u0438\u043d\u0430\u043d\u0441\u044b',
  management: '\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435',
  tours: '\u0422\u0443\u0440\u044b', stays: '\u0414\u043e\u043c\u0438\u043a\u0438', calendarBookings: '\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u0438 \u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f',
  users: '\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438', companies: '\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u0438',
  payments: '\u041e\u043f\u043b\u0430\u0442\u044b', savings: '\u041d\u0430\u043a\u043e\u043f\u043b\u0435\u043d\u0438\u044f', analytics: '\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430', settings: '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438',
};

export default function AdminSidebar({ collapsed, businessMode, homePath, basePath, currentTab, company, onNavigate }) {
  const isAdmin = !businessMode;
  const calendarKey = isAdmin ? '/admin/calendar' : `${basePath}/bookings`;
  const selectedKey = currentTab === 'home' ? homePath : ['bookings', 'calendar'].includes(currentTab) ? calendarKey : `${basePath}/${currentTab}`;
  const item = (key, icon, label) => ({ key, icon: collapsed ? <Tooltip title={label} placement="right">{icon}</Tooltip> : icon, label });
  const items = [
    { type: 'group', label: labels.dashboard, children: [item(homePath, <HomeOutlined />, labels.dashboard)] },
    { type: 'group', label: labels.content, children: [
      item(`${basePath}/tours`, <CompassOutlined />, labels.tours),
      item(`${basePath}/accommodations`, <HomeOutlined />, labels.stays),
      item(calendarKey, <CalendarOutlined />, labels.calendarBookings),
    ] },
    { type: 'group', label: labels.people, children: [
      item(`${basePath}/clients`, <TeamOutlined />, labels.users),
      ...(isAdmin ? [item('/admin/companies', <BankOutlined />, labels.companies)] : []),
    ] },
    { type: 'group', label: labels.finance, children: [
      ...(isAdmin ? [item('/admin/payments', <WalletOutlined />, labels.payments), item('/admin/savings', <WalletOutlined />, labels.savings)] : [item(`${basePath}/payments`, <WalletOutlined />, labels.payments)]),
    ] },
    { type: 'group', label: labels.management, children: [
      item(`${basePath}/reports`, <BarChartOutlined />, labels.analytics),
      ...(isAdmin ? [item('/admin/settings', <SettingOutlined />, labels.settings)] : []),
    ] },
  ];

  return <div className={`tp-admin-sidebar-shell ${collapsed ? 'is-collapsed' : ''}`}>
    <div className="tp-admin-brand">
      <img src="/travelpay-logo.svg" alt="TravelPay" className="tp-admin-brand__mark-image" />
      {!collapsed && <div className="tp-admin-brand__copy"><strong>{businessMode ? 'TravelPay Business' : 'TravelPay'}</strong><span>{company?.name || 'Travel CRM Platform'}</span></div>}
    </div>
    <Menu mode="inline" inlineCollapsed={collapsed} selectedKeys={[selectedKey]} onClick={({ key }) => onNavigate({ key })} className="tp-admin-menu" items={items} />
  </div>;
}
