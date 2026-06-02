import React, { useEffect, useState } from 'react';
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import {
  CloseOutlined,
  DownOutlined,
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
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

const navItems = [
  { key: '/', label: 'Главная' },
  { key: '/tours', label: 'Туры' },
  { key: '/favorites', label: 'Избранное' },
  { key: 'partnership', label: 'Партнерство' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('travelpay_language') || 'RU');
  const [theme, setTheme] = useState(() => localStorage.getItem('travelpay_theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const parsedUser = readCurrentUser();
    setCurrentUser(parsedUser?.isLoggedIn ? parsedUser : null);

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

  const selectedKey = location.pathname === '/'
    ? '/'
    : location.pathname.startsWith('/tours')
      ? '/tours'
      : location.pathname.startsWith('/favorites')
        ? '/favorites'
        : '';

  const glassMode = isHome && !isScrolled;
  const menuTextColor = glassMode || theme === 'dark' ? '#f6fbff' : BRAND_NAVY;

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('travelpay_language', value);
    window.dispatchEvent(new CustomEvent('travelpay-language-change', { detail: value }));
  };

  const goToPartnership = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth' }), 120);
      return;
    }
    document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigate = (key) => {
    setMobileMenuOpen(false);
    if (key === 'partnership') {
      goToPartnership();
      return;
    }
    navigate(key);
  };

  const handleLogout = () => {
    clearCurrentUser();
    setCurrentUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  };

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

  const drawer = (
    <Drawer
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      placement="right"
      size="min(86vw, 360px)"
      closeIcon={<CloseOutlined />}
      className="travelpay-mobile-drawer"
      styles={{
        body: styles.drawerBody,
        header: styles.drawerHeader,
        section: styles.drawerSectionStyle,
      }}
      title={
        <span style={styles.drawerTitle}>
          TravelPay
          <small style={styles.drawerSubtitle}>by Barsbek Travel</small>
        </span>
      }
    >
      <div style={styles.drawerNav}>
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleNavigate(item.key)}
            style={{
              ...styles.drawerNavButton,
              ...(selectedKey === item.key ? styles.drawerNavButtonActive : {}),
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={styles.drawerSection}>
        <Text strong>Язык</Text>
        <div style={styles.drawerSegment}>
          {['KG', 'RU', 'EN'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleLanguageChange(item)}
              style={{ ...styles.drawerSegmentButton, ...(language === item ? styles.drawerSegmentButtonActive : {}) }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Button
        block
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        style={styles.drawerActionButton}
      >
        {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
      </Button>

      {currentUser ? (
        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          <Button block icon={<UserOutlined />} onClick={() => handleNavigate('/profile')} style={styles.drawerPrimaryButton}>
            Профиль
          </Button>
          <Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Выйти
          </Button>
        </Space>
      ) : (
        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          <Button block icon={<LoginOutlined />} onClick={() => handleNavigate('/login')} style={styles.drawerActionButton}>
            Войти
          </Button>
          <Button block type="primary" onClick={() => handleNavigate('/tours')} style={styles.drawerPrimaryButton}>
            Book Tour
          </Button>
        </Space>
      )}
    </Drawer>
  );

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
          onClick={({ key }) => handleNavigate(key)}
          className="premium-header-menu"
          style={{ ...styles.menu, color: menuTextColor }}
        />

        <Space size={10} className="desktop-header-actions" style={styles.actions}>
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

        <Button
          aria-label="Open menu"
          className="mobile-menu-button"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuOpen(true)}
          style={{ ...styles.mobileMenuButton, ...(glassMode ? styles.mobileGlassButton : {}) }}
        />
      </div>
      {drawer}
    </AntHeader>
  );
};

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 900,
    width: '100%',
    maxWidth: '100%',
    height: 60,
    padding: 0,
    overflow: 'hidden',
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
    width: '100%',
    maxWidth: 1200,
    height: '100%',
    margin: '0 auto',
    padding: '0 clamp(12px, 4vw, 24px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    overflow: 'hidden',
  },
  logoButton: {
    display: 'inline-flex',
    alignItems: 'flex-start',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    minWidth: 0,
    maxWidth: 'min(220px, 52vw)',
    flexShrink: 0,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  },
  brandStack: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
  },
  logoText: {
    display: 'block',
    fontSize: 17,
    fontWeight: 850,
    lineHeight: 1,
    letterSpacing: 0,
  },
  logoSub: {
    display: 'block',
    fontSize: 10,
    fontWeight: 650,
    lineHeight: 1.1,
    letterSpacing: 0,
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
    minWidth: 0,
  },
  mobileMenuButton: {
    display: 'none',
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid rgba(29,53,87,0.12)',
    color: BRAND_BLUE,
    background: 'rgba(255,255,255,0.92)',
    flexShrink: 0,
  },
  mobileGlassButton: {
    color: BRAND_BLUE,
    background: 'rgba(240,247,255,0.92)',
    borderColor: 'rgba(148,163,184,0.28)',
  },
  dropdownButton: {
    height: 34,
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
    background: 'linear-gradient(135deg, rgba(241,247,255,0.94), rgba(224,239,255,0.9))',
    borderColor: 'rgba(148,163,184,0.28)',
    color: BRAND_BLUE,
  },
  themeButton: {
    width: 34,
    height: 34,
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
    height: 34,
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
    background: 'linear-gradient(135deg, rgba(241,247,255,0.94), rgba(224,239,255,0.9))',
    borderColor: 'rgba(148,163,184,0.28)',
    color: BRAND_BLUE,
  },
  profileName: {
    maxWidth: 82,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 760,
    fontSize: 13,
  },
  loginButton: {
    height: 34,
    borderRadius: 999,
    border: '1px solid rgba(59,130,246,0.24)',
    background: 'rgba(255,255,255,0.9)',
    color: '#2563eb',
    fontWeight: 800,
    boxShadow: '0 8px 18px rgba(37,99,235,0.12)',
  },
  loginGlass: {
    background: 'linear-gradient(135deg, rgba(241,247,255,0.94), rgba(224,239,255,0.9))',
    borderColor: 'rgba(148,163,184,0.28)',
    color: BRAND_BLUE,
  },
  bookButton: {
    height: 34,
    borderRadius: 999,
    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    border: 'none',
    color: '#ffffff',
    fontWeight: 850,
    boxShadow: '0 10px 22px rgba(37,99,235,0.28)',
  },
  drawerHeader: {
    borderBottom: '1px solid rgba(29,53,87,0.08)',
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    padding: 18,
  },
  drawerTitle: {
    display: 'grid',
    gap: 2,
    color: BRAND_BLUE,
    fontWeight: 900,
    lineHeight: 1.1,
  },
  drawerSubtitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 700,
  },
  drawerNav: {
    display: 'grid',
    gap: 8,
  },
  drawerNavButton: {
    minHeight: 46,
    border: '1px solid rgba(29,53,87,0.08)',
    borderRadius: 12,
    background: '#fff',
    color: BRAND_BLUE,
    cursor: 'pointer',
    fontWeight: 850,
    textAlign: 'left',
    padding: '0 14px',
  },
  drawerNavButtonActive: {
    background: 'rgba(252,163,17,0.14)',
    borderColor: 'rgba(252,163,17,0.36)',
  },
  drawerSection: {
    display: 'grid',
    gap: 10,
  },
  drawerSectionStyle: {
    background: '#fff',
  },
  drawerSegment: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  drawerSegmentButton: {
    height: 40,
    border: '1px solid rgba(29,53,87,0.08)',
    borderRadius: 12,
    background: '#fff',
    color: BRAND_BLUE,
    cursor: 'pointer',
    fontWeight: 900,
  },
  drawerSegmentButtonActive: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    borderColor: BRAND_GOLD,
  },
  drawerActionButton: {
    height: 44,
    borderRadius: 12,
    fontWeight: 850,
  },
  drawerPrimaryButton: {
    height: 44,
    borderRadius: 12,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 900,
  },
};

export default Header;
