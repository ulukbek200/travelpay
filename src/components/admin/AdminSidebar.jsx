import React from 'react';
import { Avatar, Button, Menu, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  CompassOutlined,
  CustomerServiceOutlined,
  HistoryOutlined,
  HomeOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { BUSINESS_PERMISSION_KEYS, canBusiness } from '../../utils/businessPermissions';

const labels = {
  dashboard: 'Главная',
  work: 'Работа',
  business: 'Бизнес',
  management: 'Управление',
  system: 'Система',
  tours: 'Туры',
  objects: 'Объекты',
  bookings: 'Бронирования',
  schedule: 'Расписание',
  clients: 'Клиенты',
  team: 'Команда',
  tasks: 'Задачи',
  payments: 'Оплаты',
  savings: 'Накопления',
  analytics: 'Аналитика',
  notifications: 'Уведомления',
  activity: 'Activity Log',
  settings: 'Настройки',
  support: 'Поддержка',
  companies: 'Компании',
};

const isTourBusiness = (company) => {
  const category = String(company?.category || '').toLowerCase();
  if (!category) return true;
  const tourMatch = /тур|tour|operator|оператор|гид|guide|transport|транспорт/.test(category);
  const stayMatch = /коттедж|дом|гост|отель|hotel|cottage|stay|base|база|жиль|прожив/.test(category);
  return tourMatch || !stayMatch;
};

const isStayBusiness = (company) => {
  const category = String(company?.category || '').toLowerCase();
  if (!category) return true;
  const tourMatch = /тур|tour|operator|оператор|гид|guide|transport|транспорт/.test(category);
  const stayMatch = /коттедж|дом|гост|отель|hotel|cottage|stay|base|база|жиль|прожив/.test(category);
  return stayMatch || !tourMatch;
};

const planLabel = (company) => {
  if (!company?.subscriptionPlan) return 'Business';
  if (company.subscriptionPlan === 'business_monthly') return 'Business Monthly';
  return company.subscriptionPlan;
};

export default function AdminSidebar({
  collapsed,
  businessMode,
  homePath,
  basePath,
  currentTab,
  company,
  user,
  onNavigate,
}) {
  const isAdmin = !businessMode;
  const showTours = isAdmin || isTourBusiness(company);
  const showObjects = isAdmin || isStayBusiness(company);
  const P = BUSINESS_PERMISSION_KEYS;
  const can = (permission) => isAdmin || canBusiness(user, permission);
  const withTooltip = (icon, label) => collapsed ? <Tooltip title={label} placement="right">{icon}</Tooltip> : icon;
  const item = (key, icon, label) => ({ key, icon: withTooltip(icon, label), label });
  const maybe = (condition, value) => (condition ? [value] : []);

  const selectedMap = {
    home: homePath,
    schedule: isAdmin ? '/admin/schedule' : `${basePath}/schedule`,
    bookings: `${basePath}/bookings`,
    clients: `${basePath}/clients`,
    tours: `${basePath}/tours`,
    accommodations: businessMode ? `${basePath}/objects` : `${basePath}/accommodations`,
    properties: '/admin/properties',
    team: `${basePath}/team`,
    tasks: `${basePath}/tasks`,
    payments: `${basePath}/payments`,
    reports: `${basePath}/analytics`,
    notifications: `${basePath}/notifications`,
    activity: `${basePath}/activity`,
    company: businessMode ? `${basePath}/company` : '/admin/company',
    settings: `${basePath}/settings`,
    support: `${basePath}/support`,
    savings: '/admin/savings',
    companies: '/admin/companies',
  };

  const selectedKey = selectedMap[currentTab] || homePath;
  const businessItems = [
    {
      type: 'group',
      label: labels.work,
      children: [
        ...maybe(can(P.VIEW_HOME), item(homePath, <HomeOutlined />, labels.dashboard)),
        ...maybe(can(P.VIEW_SCHEDULE), item(`${basePath}/schedule`, <CalendarOutlined />, labels.schedule)),
        ...maybe(can(P.VIEW_BOOKINGS), item(`${basePath}/bookings`, <AppstoreOutlined />, labels.bookings)),
        ...maybe(can(P.VIEW_CLIENTS), item(`${basePath}/clients`, <TeamOutlined />, labels.clients)),
      ],
    },
    {
      type: 'group',
      label: labels.business,
      children: [
        ...maybe(showTours && can(P.VIEW_TOURS), item(`${basePath}/tours`, <CompassOutlined />, labels.tours)),
        ...maybe(showObjects && can(P.VIEW_PROPERTIES), item(`${basePath}/objects`, <HomeOutlined />, labels.objects)),
        ...maybe(can(P.VIEW_COMPANY), item(`${basePath}/company`, <BankOutlined />, 'Профиль компании')),
        ...maybe(can(P.VIEW_TEAM), item(`${basePath}/team`, <CustomerServiceOutlined />, labels.team)),
      ],
    },
    {
      type: 'group',
      label: labels.management,
      children: [
        ...maybe(can(P.VIEW_TASKS), item(`${basePath}/tasks`, <CheckSquareOutlined />, labels.tasks)),
        ...maybe(can(P.VIEW_PAYMENTS), item(`${basePath}/payments`, <WalletOutlined />, labels.payments)),
        ...maybe(can(P.VIEW_ANALYTICS), item(`${basePath}/analytics`, <BarChartOutlined />, labels.analytics)),
        ...maybe(can(P.VIEW_NOTIFICATIONS), item(`${basePath}/notifications`, <BellOutlined />, labels.notifications)),
        ...maybe(can(P.VIEW_ACTIVITY), item(`${basePath}/activity`, <HistoryOutlined />, labels.activity)),
      ],
    },
    {
      type: 'group',
      label: labels.system,
      children: [
        ...maybe(can(P.VIEW_SETTINGS), item(`${basePath}/settings`, <SettingOutlined />, labels.settings)),
        ...maybe(can(P.VIEW_SUPPORT), item(`${basePath}/support`, <QuestionCircleOutlined />, labels.support)),
      ],
    },
  ].filter((group) => group.children.length);

  const adminItems = [
    { type: 'group', label: labels.dashboard, children: [item(homePath, <HomeOutlined />, labels.dashboard)] },
    {
      type: 'group',
      label: 'Контент',
      children: [
        item(`${basePath}/tours`, <CompassOutlined />, labels.tours),
        item(`${basePath}/accommodations`, <HomeOutlined />, 'Домики'),
        item('/admin/properties', <HomeOutlined />, labels.objects),
        item('/admin/schedule', <CalendarOutlined />, labels.schedule),
        item('/admin/calendar', <CalendarOutlined />, 'Календарь'),
      ],
    },
    {
      type: 'group',
      label: 'Пользователи',
      children: [
        item(`${basePath}/clients`, <TeamOutlined />, 'Пользователи'),
        item('/admin/companies', <BankOutlined />, labels.companies),
        item('/admin/company', <BankOutlined />, 'Профиль компании'),
      ],
    },
    {
      type: 'group',
      label: 'Финансы',
      children: [
        item('/admin/payments', <WalletOutlined />, labels.payments),
        item('/admin/savings', <WalletOutlined />, labels.savings),
      ],
    },
    {
      type: 'group',
      label: labels.management,
      children: [
        item('/admin/team', <CustomerServiceOutlined />, labels.team),
        item('/admin/analytics', <BarChartOutlined />, labels.analytics),
        item('/admin/notifications', <BellOutlined />, labels.notifications),
        item('/admin/activity', <HistoryOutlined />, labels.activity),
        item('/admin/tasks', <CheckSquareOutlined />, labels.tasks),
        item('/admin/settings', <SettingOutlined />, labels.settings),
      ],
    },
  ];

  const items = businessMode ? businessItems : adminItems;
  const profileTitle = businessMode ? (company?.name || 'TravelPay Business') : (user?.name || 'Администратор');
  const profileSubtitle = businessMode ? planLabel(company) : (company?.name || 'TravelPay');

  return (
    <div className={`tp-admin-sidebar-shell ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="tp-admin-brand">
        <img src="/travelpay-logo.svg" alt="TravelPay" className="tp-admin-brand__mark-image" />
        {!collapsed && (
          <div className="tp-admin-brand__copy">
            <strong>{businessMode ? 'TravelPay Business OS' : 'TravelPay'}</strong>
            <span>{company?.name || 'Travel CRM Platform'}</span>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        onClick={({ key }) => onNavigate({ key })}
        className="tp-admin-menu"
        items={items}
      />

      <div className="tp-admin-sidebar-account">
        <Avatar src={user?.avatar} icon={<UserOutlined />} />
        {!collapsed && (
          <div className="tp-admin-sidebar-account__copy">
            <strong>{profileTitle}</strong>
            <span>{profileSubtitle}</span>
          </div>
        )}
        {!collapsed && (
          <Button type="text" icon={<LogoutOutlined />} onClick={() => onNavigate({ key: 'logout' })} />
        )}
      </div>
    </div>
  );
}
