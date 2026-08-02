import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Drawer, Grid, Tooltip, Typography } from 'antd';
import { CompassOutlined, HeartOutlined, HomeOutlined, LogoutOutlined, MenuOutlined, TeamOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearCurrentUser, readCurrentUser, subscribeToCurrentUser } from '../utils/currentUser';
import { canAccessAdminPanel, getAdminLandingPath } from '../utils/user';

const { useBreakpoint } = Grid;
const { Text } = Typography;
const DEFAULT_AVATAR = 'https://www.w3schools.com/howto/img_avatar.png';

const UserSidebar = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(() => readCurrentUser());
  const compact = !screens.lg && Boolean(screens.md);

  useEffect(() => subscribeToCurrentUser(setUser), []);

  const items = useMemo(() => {
    const nextItems = [
      { to: '/profile', label: 'Профиль', icon: <UserOutlined /> },
      { to: '/savings', label: 'Накопления', icon: <WalletOutlined /> },
      { to: '/favorites', label: 'Избранное', icon: <HeartOutlined /> },
      { to: '/tours', label: 'Туры', icon: <CompassOutlined /> },
      { to: '/', label: 'Главная', icon: <HomeOutlined /> },
    ];
    if (canAccessAdminPanel(user)) nextItems.splice(4, 0, { to: getAdminLandingPath(user), label: 'Управление', icon: <TeamOutlined /> });
    return nextItems;
  }, [user]);

  const onLogout = () => {
    clearCurrentUser();
    setOpen(false);
    navigate('/');
  };

  const navigation = (isCompact = false) => (
    <nav className="tp-user-sidebar__nav" aria-label="Разделы личного кабинета">
      {items.map((item) => {
        const link = <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setOpen(false)} className={({ isActive }) => `tp-user-sidebar__link${isActive ? ' is-active' : ''}`}><span className="tp-user-sidebar__icon">{item.icon}</span>{!isCompact && <span>{item.label}</span>}</NavLink>;
        return isCompact ? <Tooltip key={item.to} title={item.label} placement="right">{link}</Tooltip> : link;
      })}
      <button type="button" className="tp-user-sidebar__link tp-user-sidebar__logout" onClick={onLogout}><span className="tp-user-sidebar__icon"><LogoutOutlined /></span>{!isCompact && <span>Выйти</span>}</button>
    </nav>
  );

  const content = (isCompact = false) => <><div className={`tp-user-sidebar__identity${isCompact ? ' is-compact' : ''}`}><Avatar size={isCompact ? 42 : 48} src={user?.avatar || DEFAULT_AVATAR} icon={<UserOutlined />} />{!isCompact && <div className="tp-user-sidebar__identity-copy"><Text strong>{user?.name || 'Путешественник'}</Text><Text type="secondary">{user?.email || 'Личный кабинет'}</Text></div>}</div>{navigation(isCompact)}</>;

  if (!screens.md) return <><Button className="tp-user-sidebar__mobile-trigger" type="primary" shape="circle" icon={<MenuOutlined />} aria-label="Открыть разделы кабинета" onClick={() => setOpen(true)} /><Drawer open={open} onClose={() => setOpen(false)} placement="left" width={304} className="tp-user-sidebar__drawer" title="Личный кабинет"><aside className="tp-user-sidebar tp-user-sidebar--drawer">{content()}</aside></Drawer></>;
  return <aside className={`tp-user-sidebar${compact ? ' tp-user-sidebar--compact' : ''}`}>{content(compact)}</aside>;
};

export default UserSidebar;
