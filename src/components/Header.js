import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Segmented, Space, Typography } from 'antd';
import {
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

const BRAND_BLUE = '#173B61';
const BRAND_BLUE_LIGHT = '#2B7BB9';
const BRAND_GOLD = '#FCA311';

const navItems = [
  { key: '/', label: 'Главная' },
  { key: '/tours', label: 'Туры' },
  { key: '/favorites', label: 'Избранное' },
  { key: 'partnership', label: 'Партнёрство' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('travelpay_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('travelpay_language') || 'RU');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = location.pathname === '/';
  const glassMode = isHome && !isScrolled;

  useEffect(() => {
    const parsedUser = readCurrentUser();
    setCurrentUser(parsedUser?.isLoggedIn ? parsedUser : null);

    return subscribeToCurrentUser((user) => {
      setCurrentUser(user?.isLoggedIn ? user : null);
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('travelpay_theme', theme);
  }, [theme]);

  const selectedKey = useMemo(() => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/tours')) return '/tours';
    if (location.pathname.startsWith('/favorites')) return '/favorites';
    return '';
  }, [location.pathname]);

  const surfaceStyle = {
    ...(theme === 'dark' ? styles.headerDark : styles.headerLight),
    ...(glassMode ? styles.headerGlass : {}),
  };
  const textColor = theme === 'dark' || glassMode ? '#F8FBFF' : BRAND_BLUE;

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('travelpay_language', value);
    window.dispatchEvent(new CustomEvent('travelpay-language-change', { detail: value }));
  };

  const goToPartnership = () => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return;
    }

    document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    items: ['KG', 'RU', 'EN'].map((item) => ({
      key: item,
      label: <span style={item === language ? styles.languageActive : styles.languageLabel}>{item}</span>,
    })),
    selectedKeys: [language],
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

  const drawerContent = (
    <div style={styles.drawerBody}>
      <div style={styles.drawerTop}>
        <Button type="text" onClick={() => navigate('/')} style={styles.drawerBrandButton}>
          <span style={styles.brandCopy}>
            <span style={styles.brandTitle}>TravelPay</span>
            <span style={styles.brandSubtitle}>Premium travel platform</span>
          </span>
        </Button>
      </div>

      <Space orientation="vertical" size={10} style={{ width: '100%' }}>
        {navItems.map((item) => (
          <Button
            key={item.key}
            block
            type={selectedKey === item.key ? 'primary' : 'default'}
            onClick={() => handleNavigate(item.key)}
            className="travelpay-header-button travelpay-drawer-nav-button"
            style={selectedKey === item.key ? styles.drawerPrimaryNav : styles.drawerNavButton}
          >
            {item.label}
          </Button>
        ))}
      </Space>

      <div style={styles.drawerSection}>
        <Text strong style={styles.drawerSectionLabel}>Язык</Text>
        <Segmented
          block
          value={language}
          options={['KG', 'RU', 'EN']}
          onChange={handleLanguageChange}
        />
      </div>

      <Button
        block
        icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        className="travelpay-header-button"
        style={styles.drawerUtilityButton}
      >
        {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      </Button>

      <Space orientation="vertical" size={10} style={{ width: '100%' }}>
        {currentUser ? (
          <>
            <Button
              block
              type="primary"
              icon={<UserOutlined />}
              onClick={() => handleNavigate('/profile')}
              className="travelpay-header-button"
              style={styles.drawerPrimaryButton}
            >
              Профиль
            </Button>
            <Button
              block
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="travelpay-header-button"
            >
              Выйти
            </Button>
          </>
        ) : (
          <>
            <Button
              block
              icon={<LoginOutlined />}
              onClick={() => handleNavigate('/login')}
              className="travelpay-header-button"
              style={styles.drawerUtilityButton}
            >
              Войти
            </Button>
            <Button
              block
              type="primary"
              onClick={() => handleNavigate('/tours')}
              className="travelpay-header-button"
              style={styles.drawerPrimaryButton}
            >
              Выбрать тур
            </Button>
          </>
        )}
      </Space>
    </div>
  );

  return (
    <AntHeader className="premium-site-header" style={{ ...styles.headerShell, ...surfaceStyle }}>
      <div style={styles.inner}>
        <Button
          type="text"
          onClick={() => navigate('/')}
          aria-label="TravelPay home"
          className="travelpay-logo-button"
          style={styles.logoButton}
        >
          <span className="brand" style={styles.brandCopy}>
            <span className="brand-title" style={{ ...styles.logoText, color: textColor }}>TravelPay</span>
            <span className="brand-subtitle" style={{ ...styles.logoSub, color: theme === 'dark' || glassMode ? 'rgba(248,251,255,0.72)' : 'rgba(23,59,97,0.62)' }}>
              by Barsbek Travel
            </span>
          </span>
        </Button>

        <Menu
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={navItems}
          onClick={({ key }) => handleNavigate(key)}
          className="premium-header-menu"
          style={{ ...styles.menu, color: textColor }}
        />

        <Space size={10} className="desktop-header-actions" style={styles.actions}>
          <Dropdown menu={languageMenu} trigger={['click']} placement="bottomRight">
            <Button
              icon={<GlobalOutlined />}
              className="travelpay-header-button"
              style={glassMode || theme === 'dark' ? styles.utilityButtonGlass : styles.utilityButton}
            >
              {language}
              <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>

          <Button
            aria-label="Toggle theme"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
            className="travelpay-header-button"
            style={styles.themeButton}
          />

          {currentUser ? (
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <Button
                className="travelpay-header-button"
                style={glassMode || theme === 'dark' ? styles.profileButtonGlass : styles.profileButton}
              >
                <Avatar size={24} src={currentUser.avatar} icon={<UserOutlined />} />
                <Text style={{ ...styles.profileName, color: textColor }}>{currentUser.name}</Text>
              </Button>
            </Dropdown>
          ) : (
            <>
              <Button
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                className="travelpay-header-button"
                style={glassMode || theme === 'dark' ? styles.utilityButtonGlass : styles.utilityButton}
              >
                Войти
              </Button>
              <Button
                type="primary"
                onClick={() => navigate('/tours')}
                className="travelpay-header-button"
                style={styles.primaryButton}
              >
                Выбрать тур
              </Button>
            </>
          )}
        </Space>

        <Button
          aria-label="Open menu"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuOpen(true)}
          className="mobile-menu-button travelpay-header-button"
          style={glassMode || theme === 'dark' ? styles.mobileButtonGlass : styles.mobileButton}
        />
      </div>

      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        placement="right"
        size="min(86vw, 360px)"
        closeIcon={null}
        className="travelpay-mobile-drawer"
        title={null}
        styles={{
          body: styles.drawerWrapper,
          section: styles.drawerSurface,
          header: { display: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
    </AntHeader>
  );
};

const styles = {
  headerShell: {
    position: 'sticky',
    top: 14,
    zIndex: 900,
    width: 'min(100% - 24px, 1240px)',
    margin: '0 auto 10px',
    height: 76,
    padding: 0,
    borderRadius: 28,
    overflow: 'hidden',
    backdropFilter: 'blur(24px)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
  },
  headerLight: {
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(255,255,255,0.88)',
    boxShadow: '0 24px 68px rgba(23,59,97,0.12)',
  },
  headerDark: {
    background: 'rgba(6,20,35,0.82)',
    border: '1px solid rgba(255,255,255,0.10)',
    boxShadow: '0 24px 68px rgba(0,0,0,0.30)',
  },
  headerGlass: {
    background: 'rgba(7, 23, 40, 0.42)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 26px 72px rgba(5,13,24,0.22)',
  },
  inner: {
    width: '100%',
    maxWidth: 1200,
    height: '100%',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoButton: {
    height: 52,
    border: 'none',
    paddingInline: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  brandCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
    gap: 2,
  },
  logoText: {
    fontSize: 19,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: -0.02,
  },
  logoSub: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.1,
  },
  menu: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    borderBottom: 'none',
    background: 'transparent',
    fontWeight: 800,
  },
  actions: {
    flexShrink: 0,
  },
  utilityButton: {
    height: 42,
    borderRadius: 16,
    border: '1px solid rgba(23,59,97,0.10)',
    background: 'rgba(255,255,255,0.86)',
    color: BRAND_BLUE,
    fontWeight: 800,
    boxShadow: '0 12px 30px rgba(23,59,97,0.08)',
  },
  utilityButtonGlass: {
    height: 42,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.08)',
    color: '#F8FBFF',
    fontWeight: 800,
    boxShadow: '0 12px 30px rgba(0,0,0,0.14)',
  },
  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    border: '1px solid rgba(252,163,17,0.38)',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #FFD27A)`,
    color: BRAND_BLUE,
    boxShadow: '0 14px 30px rgba(252,163,17,0.24)',
  },
  profileButton: {
    height: 42,
    borderRadius: 16,
    border: '1px solid rgba(23,59,97,0.10)',
    background: 'rgba(255,255,255,0.90)',
    color: BRAND_BLUE,
    fontWeight: 800,
    boxShadow: '0 12px 30px rgba(23,59,97,0.08)',
  },
  profileButtonGlass: {
    height: 42,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.08)',
    color: '#F8FBFF',
    fontWeight: 800,
    boxShadow: '0 12px 30px rgba(0,0,0,0.14)',
  },
  profileName: {
    maxWidth: 86,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 800,
  },
  primaryButton: {
    height: 42,
    borderRadius: 16,
    border: 'none',
    background: `linear-gradient(135deg, ${BRAND_BLUE_LIGHT}, ${BRAND_BLUE})`,
    color: '#FFFFFF',
    fontWeight: 800,
    boxShadow: '0 16px 34px rgba(43,123,185,0.26)',
  },
  mobileButton: {
    display: 'none',
    width: 42,
    height: 42,
    borderRadius: 16,
    border: '1px solid rgba(23,59,97,0.10)',
    background: 'rgba(255,255,255,0.90)',
    color: BRAND_BLUE,
  },
  mobileButtonGlass: {
    display: 'none',
    width: 42,
    height: 42,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.08)',
    color: '#F8FBFF',
  },
  languageLabel: {
    fontWeight: 800,
  },
  languageActive: {
    fontWeight: 900,
    color: BRAND_BLUE,
  },
  drawerWrapper: {
    padding: 12,
    background: 'transparent',
  },
  drawerSurface: {
    borderRadius: 28,
    overflow: 'hidden',
    background: 'linear-gradient(180deg, rgba(247,250,255,0.96), rgba(237,244,255,0.96))',
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  drawerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerBrandButton: {
    height: 'auto',
    padding: 0,
    color: BRAND_BLUE,
  },
  drawerSection: {
    display: 'grid',
    gap: 10,
  },
  drawerSectionLabel: {
    color: BRAND_BLUE,
  },
  drawerNavButton: {
    height: 48,
    borderRadius: 16,
    border: '1px solid rgba(23,59,97,0.08)',
    background: '#FFFFFF',
    color: BRAND_BLUE,
    fontWeight: 800,
    justifyContent: 'flex-start',
  },
  drawerPrimaryNav: {
    height: 48,
    borderRadius: 16,
    border: 'none',
    background: `linear-gradient(135deg, ${BRAND_BLUE_LIGHT}, ${BRAND_BLUE})`,
    color: '#FFFFFF',
    fontWeight: 800,
    justifyContent: 'flex-start',
  },
  drawerUtilityButton: {
    height: 46,
    borderRadius: 16,
    fontWeight: 800,
  },
  drawerPrimaryButton: {
    height: 46,
    borderRadius: 16,
    border: 'none',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #FFD27A)`,
    color: BRAND_BLUE,
    fontWeight: 900,
  },
};

export default Header;
