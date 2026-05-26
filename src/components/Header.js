import React, { useEffect, useState } from 'react';
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import {
  DownOutlined,
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearCurrentUser, readCurrentUser, subscribeToCurrentUser } from '../utils/currentUser';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_NAVY = '#24486f';
const BRAND_GOLD = '#fca311';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('travelpay_language') || 'RU');
  const [theme, setTheme] = useState(() => localStorage.getItem('travelpay_theme') || 'light');
  const isHome = location.pathname === '/';

  useEffect(() => {
    const syncCurrentUser = () => {
      const parsedUser = readCurrentUser();
      setCurrentUser(parsedUser?.isLoggedIn ? parsedUser : null);
    };

    syncCurrentUser();
    return subscribeToCurrentUser((user) => {
      setCurrentUser(user?.isLoggedIn ? user : null);
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 28);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('travelpay_theme', theme);
  }, [theme]);

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('travelpay_language', value);
    window.dispatchEvent(new CustomEvent('travelpay-language-change', { detail: value }));
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    navigate('/');
  };

  const goToPartnership = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth' }), 120);
      return;
    }
    document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems = [
    { key: '/', label: 'Главная' },
    { key: '/tours', label: 'Туры' },
    { key: '/favorites', label: 'Избранное' },
    { key: 'partnership', label: 'Партнёрство' },
  ];

  const selectedKey = location.pathname === '/'
    ? '/'
    : location.pathname.startsWith('/tours')
      ? '/tours'
      : location.pathname.startsWith('/favorites')
        ? '/favorites'
        : '';

  const glassMode = isHome && !isScrolled;
  const menuTextColor = glassMode || theme === 'dark' ? '#f6fbff' : BRAND_NAVY;

  const languageMenu = {
    selectedKeys: [language],
    items: ['KG', 'RU', 'EN'].map((key) => ({
      key,
      label: (
        <span style={key === language ? styles.languageActiveLabel : styles.languageLabel}>
          {key}
        </span>
      ),
    })),
    onClick: ({ key }) => handleLanguageChange(key),
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Профиль' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'profile') navigate('/profile');
      if (key === 'logout') handleLogout();
    },
  };

  return (
    <AntHeader 
    
      className="premium-site-header"
      style={{
        
        ...styles.header,
        ...(theme === 'dark' && !glassMode ? styles.darkHeader : {}),
        ...(glassMode ? styles.transparentHeader : {}),
        
      }}
    >
      <div style={styles.inner}>
        <button type="button" onClick={() => navigate('/')} style={styles.logoButton} aria-label="TravelPay home">
          <span style={styles.brandStack}>
            <span style={{ ...styles.logoText, color: menuTextColor }}>TravelPay</span>
            <span style={{ ...styles.logoSub, color: glassMode || theme === 'dark' ? 'rgba(246,251,255,0.68)' : 'rgba(29,53,87,0.58)' }}>
              by Barsbek Travel
            </span>
          </span>
        </button>

        <Menu
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={navItems}
          onClick={({ key }) => (key === 'partnership' ? goToPartnership() : navigate(key))}
          className="premium-header-menu"
          style={{ ...styles.menu, color: menuTextColor }}
        />

        <Space size={10} style={styles.actions}>
          <Dropdown menu={languageMenu} trigger={['click']} placement="bottomRight">
            <Button style={{ ...styles.dropdownButton, ...(glassMode ? styles.glassButton : {}) }}>
              <GlobalOutlined />
              {language}
              <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>

          <Button
            aria-label="Toggle light and dark theme"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
            style={{ ...styles.themeButton, ...(glassMode ? styles.themeGlass : {}) }}
          />

          {currentUser ? (
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <Button style={{ ...styles.profileButton, ...(glassMode ? styles.profileGlass : {}) }}>
                <Avatar size={24} src={currentUser.avatar} icon={<UserOutlined />} />
                <Text style={{ ...styles.profileName, color: menuTextColor }}>{currentUser.name}</Text>
              </Button>
            </Dropdown>
          ) : (
            <>
              <Button icon={<LoginOutlined />} onClick={() => navigate('/login')} style={{ ...styles.loginButton, ...(glassMode ? styles.loginGlass : {}) }}>
                Войти
              </Button>
              <Button type="primary" onClick={() => navigate('/tours')} style={styles.bookButton}>
                Book Tour
              </Button>
            </>
          )}
        </Space>
      </div>
    </AntHeader>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 900,
    height: 72,
    padding: 0,
    background: 'rgba(255,255,255,0.84)',
    borderBottom: '1px solid rgba(29,53,87,0.08)',
    boxShadow: '0 14px 40px rgba(29,53,87,0.08)',
    backdropFilter: 'blur(22px)',
    transition: 'background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
  },
  transparentHeader: {
    background: 'rgba(6,17,31,0.20)',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 18px 46px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(22px)',
  },
  darkHeader: {
    background: 'rgba(8,19,33,0.92)',
    borderBottom: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.24)',
  },
  inner: {
    maxWidth: 1200,
    height: '100%',
    margin: '0 auto',
    padding: '0 22px',
    display: 'flex',
    alignItems: 'center',
    gap: 30,
  },
  
  logoButton: {
    display: 'inline-flex',
    alignItems: 'center',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  },
  brandStack: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 3,
  },
  logoText: {
    display: 'block',
    fontSize: 20,
    fontWeight: 850,
    lineHeight: 1,
    letterSpacing: 0,
  },
  logoSub: {
    display: 'block',
    fontSize: 10.5,
    fontWeight: 650,
    lineHeight: 1.1,
    letterSpacing: 0.25,
    borderBottom: 'none',
  },
  menu: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    borderBottom: 'none',
    background: 'transparent',
    fontSize: 13,
    fontWeight: 760,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  },
  actions: {
    flexShrink: 0,
  },
 dropdownButton: {
  height: 38,
  borderRadius: 999,
  border: '1px solid rgba(59,130,246,0.24)',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  boxShadow: '0 10px 22px rgba(37,99,235,0.20)',
},
  glassButton: {
    background: 'linear-gradient(135deg, rgba(29,53,87,0.82), rgba(36,72,111,0.72))',
    borderColor: 'rgba(252,163,17,0.34)',
    color: '#f6fbff',
  },
  themeButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderColor: 'rgba(252,163,17,0.46)',
    color: BRAND_BLUE,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    boxShadow: '0 10px 24px rgba(252,163,17,0.24)',
  },
  themeGlass: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    borderColor: 'rgba(252,163,17,0.52)',
    color: BRAND_BLUE,
  },
  languageLabel: {
    fontWeight: 750,
  },
  languageActiveLabel: {
    color: BRAND_BLUE,
    fontWeight: 850,
    background: 'rgba(252,163,17,0.18)',
    borderRadius: 8,
    padding: '3px 8px',
  },
  profileButton: {
    height: 38,
    borderRadius: 999,
    borderColor: 'rgba(29,53,87,0.18)',
    color: '#ffffff',
    background: `linear-gradient(135deg, ${BRAND_BLUE}, #2e5d86)`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 10px',
    boxShadow: '0 10px 22px rgba(29,53,87,0.18)',
  },
  profileGlass: {
    background: 'linear-gradient(135deg, rgba(29,53,87,0.82), rgba(36,72,111,0.72))',
    borderColor: 'rgba(252,163,17,0.34)',
    color: '#f6fbff',
  },
  profileName: {
    maxWidth: 96,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 760,
    fontSize: 13,
  },
loginButton: {
  height: 38,
  borderRadius: 999,
  border: '1px solid rgba(59,130,246,0.24)',
  background: 'rgba(255,255,255,0.9)',
  color: '#2563eb',
  fontWeight: 800,
  boxShadow: '0 8px 18px rgba(37,99,235,0.12)',
},
  loginGlass: {
    background: 'linear-gradient(135deg, rgba(29,53,87,0.82), rgba(36,72,111,0.72))',
    borderColor: 'rgba(252,163,17,0.34)',
    color: '#f6fbff',
  },
 bookButton: {
  height: 38,
  borderRadius: 999,
  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
  border: 'none',
  color: '#ffffff',
  fontWeight: 850,
  boxShadow: '0 10px 22px rgba(37,99,235,0.28)',
},
};

export default Header;
