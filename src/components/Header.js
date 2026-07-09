import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Button, Drawer, Dropdown, Layout, Segmented, Space, Typography } from 'antd';
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
import { LayoutGroup, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { clearCurrentUser, readCurrentUser, subscribeToCurrentUser } from '../utils/currentUser';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const SCROLL_THRESHOLD = 72;
const HIDE_THRESHOLD = 132;
const DELTA_THRESHOLD = 6;

const BRAND_BLUE = '#173B61';

const navItems = [
  { key: '/', label: 'Главная' },
  { key: '/tours', label: 'Туры' },
  { key: '/stays', label: 'Домики' },
  { key: '/favorites', label: 'Избранное' },
  { key: 'partnership', label: 'Партнёрство' },
];

const springTransition = {
  type: 'spring',
  stiffness: 380,
  damping: 30,
  mass: 0.7,
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('travelpay_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('travelpay_language') || 'RU');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerState, setHeaderState] = useState({ scrolled: false, hidden: false });

  const lastScrollYRef = useRef(0);
  const frameRef = useRef(null);
  const headerStateRef = useRef(headerState);

  useEffect(() => {
    headerStateRef.current = headerState;
  }, [headerState]);

  useEffect(() => {
    const parsedUser = readCurrentUser();
    setCurrentUser(parsedUser?.isLoggedIn ? parsedUser : null);

    return subscribeToCurrentUser((user) => {
      setCurrentUser(user?.isLoggedIn ? user : null);
    });
  }, [location.pathname]);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('travelpay_theme', theme);
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new CustomEvent('travelpay-theme-change', { detail: theme }));
  }, [theme]);

  useEffect(() => {
    const updateHeaderState = () => {
      const nextY = window.scrollY || 0;
      const delta = nextY - lastScrollYRef.current;

      const nextScrolled = nextY > SCROLL_THRESHOLD;
      let nextHidden = headerStateRef.current.hidden;

      if (nextY <= 12) {
        nextHidden = false;
      } else if (delta > DELTA_THRESHOLD && nextY > HIDE_THRESHOLD) {
        nextHidden = true;
      } else if (delta < -DELTA_THRESHOLD) {
        nextHidden = false;
      }

      lastScrollYRef.current = nextY;

      const prev = headerStateRef.current;
      if (prev.scrolled !== nextScrolled || prev.hidden !== nextHidden) {
        const nextState = { scrolled: nextScrolled, hidden: nextHidden };
        headerStateRef.current = nextState;
        setHeaderState(nextState);
      }
    };

    const handleScroll = () => {
      if (frameRef.current) return;
      frameRef.current = window.requestAnimationFrame(() => {
        updateHeaderState();
        frameRef.current = null;
      });
    };

    updateHeaderState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const selectedKey = useMemo(() => {
    if (location.pathname === '/') return '/';
    if (location.pathname.startsWith('/tours')) return '/tours';
    if (location.pathname.startsWith('/stays')) return '/stays';
    if (location.pathname.startsWith('/favorites')) return '/favorites';
    return '';
  }, [location.pathname]);

  const handleLanguageChange = useCallback((value) => {
    setLanguage(value);
    localStorage.setItem('travelpay_language', value);
    window.dispatchEvent(new CustomEvent('travelpay-language-change', { detail: value }));
  }, []);

  const goToPartnership = useCallback(() => {
    setMobileMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return;
    }

    document.getElementById('partnership')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.pathname, navigate]);

  const handleNavigate = useCallback((key) => {
    setMobileMenuOpen(false);

    if (key === 'partnership') {
      goToPartnership();
      return;
    }

    navigate(key);
  }, [goToPartnership, navigate]);

  const handleLogout = useCallback(() => {
    clearCurrentUser();
    setCurrentUser(null);
    setMobileMenuOpen(false);
    navigate('/');
  }, [navigate]);

  const toggleTheme = useCallback(() => {
    setTheme((value) => (value === 'dark' ? 'light' : 'dark'));
  }, []);

  const languageMenu = useMemo(() => ({
    items: ['KG', 'RU', 'EN'].map((item) => ({
      key: item,
      label: (
        <span style={item === language ? styles.languageActive : styles.languageLabel}>
          {item}
        </span>
      ),
    })),
    selectedKeys: [language],
    onClick: ({ key }) => handleLanguageChange(key),
  }), [handleLanguageChange, language]);

  const userMenu = useMemo(() => ({
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Профиль' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'profile') navigate('/profile');
      if (key === 'logout') handleLogout();
    },
  }), [handleLogout, navigate]);

  const shellClassName = [
    'travelpay-premium-header-shell',
    headerState.scrolled ? 'is-scrolled' : 'is-top',
    headerState.hidden ? 'is-hidden' : 'is-visible',
    mobileMenuOpen ? 'is-drawer-open' : '',
  ].filter(Boolean).join(' ');

  const drawerContent = (
    <div style={styles.drawerBody}>
      <div style={styles.drawerTop}>
        <Button type="text" onClick={() => navigate('/')} style={styles.drawerBrandButton}>
          <span style={styles.brandCopy}>
            <span style={styles.drawerBrandTitle}>TravelPay</span>
            <span style={styles.drawerBrandSubtitle}>Premium travel platform</span>
          </span>
        </Button>
      </div>

      <Space orientation="vertical" size={10} style={{ width: '100%' }}>
        {navItems.map((item) => {
          const isSelected = selectedKey === item.key;
          return (
            <Button
              key={item.key}
              block
              type={isSelected ? 'primary' : 'default'}
              onClick={() => handleNavigate(item.key)}
              className="travelpay-drawer-nav-button"
              style={isSelected ? styles.drawerPrimaryNav : styles.drawerNavButton}
            >
              {item.label}
            </Button>
          );
        })}
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
        onClick={toggleTheme}
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
              style={styles.drawerPrimaryButton}
            >
              Профиль
            </Button>
            <Button
              block
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
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
              style={styles.drawerUtilityButton}
            >
              Войти
            </Button>
            <Button
              block
              type="primary"
              onClick={() => handleNavigate('/tours')}
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
    <AntHeader className={shellClassName}>
      <div className="travelpay-premium-header-surface">
        <div className="travelpay-premium-header-inner">
          <Button
            type="text"
            onClick={() => navigate('/')}
            aria-label="TravelPay home"
            className="travelpay-premium-brand-button"
            style={styles.logoButton}
          >
            <span className="travelpay-premium-brand-copy" style={styles.brandCopy}>
              <span className="travelpay-premium-brand-title">TravelPay</span>
              <span className="travelpay-premium-brand-subtitle">by Barsbek Travel</span>
            </span>
          </Button>

          <LayoutGroup id="travelpay-header-nav">
            <nav className="travelpay-premium-nav" aria-label="Primary">
              {navItems.map((item) => {
                const isActive = selectedKey === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key)}
                    className={`travelpay-premium-nav-item${isActive ? ' is-active' : ''}`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="travelpay-active-pill"
                        transition={springTransition}
                        className="travelpay-premium-nav-pill"
                      />
                    ) : null}
                    <span className="travelpay-premium-nav-label">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </LayoutGroup>

          <div className="travelpay-premium-actions">
            <Dropdown menu={languageMenu} trigger={['click']} placement="bottomRight">
              <Button className="travelpay-premium-action-button travelpay-premium-lang-button">
                <span className="travelpay-premium-action-icon travelpay-premium-lang-icon">
                  <GlobalOutlined />
                </span>
                <span>{language}</span>
                <DownOutlined style={{ fontSize: 10 }} />
              </Button>
            </Dropdown>

            <Button
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className="travelpay-premium-theme-button"
            >
              <motion.span
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                className="travelpay-premium-theme-icon"
              >
                {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              </motion.span>
            </Button>

            {currentUser ? (
              <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
                <Button className="travelpay-premium-profile-button">
                  <Avatar size={28} src={currentUser.avatar} icon={<UserOutlined />} />
                  <Text className="travelpay-premium-profile-name">
                    {currentUser.name}
                  </Text>
                </Button>
              </Dropdown>
            ) : (
              <>
                <Button
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                  className="travelpay-premium-action-button"
                >
                  Войти
                </Button>
                <Button
                  type="primary"
                  onClick={() => navigate('/tours')}
                  className="travelpay-premium-cta-button"
                >
                  Выбрать тур
                </Button>
              </>
            )}
          </div>

          <Button
            aria-label="Open menu"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            className="travelpay-premium-mobile-button"
          />
        </div>
      </div>

      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        placement="right"
        size="min(88vw, 360px)"
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
  logoButton: {
    height: '100%',
    border: 'none',
    paddingInline: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    background: 'transparent',
    boxShadow: 'none',
  },
  brandCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
    gap: 2,
  },
  languageLabel: {
    color: BRAND_BLUE,
    fontWeight: 700,
  },
  languageActive: {
    color: '#0B1320',
    fontWeight: 800,
  },
  drawerWrapper: {
    padding: 0,
    background: 'transparent',
  },
  drawerSurface: {
    background: 'linear-gradient(180deg, rgba(9,16,29,0.98), rgba(7,13,24,0.98))',
  },
  drawerBody: {
    minHeight: '100%',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    background: 'linear-gradient(180deg, rgba(8,15,28,0.98), rgba(6,11,20,0.98))',
  },
  drawerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerBrandButton: {
    height: 58,
    padding: 0,
    color: '#F8FBFF',
  },
  drawerBrandTitle: {
    fontSize: 22,
    lineHeight: 1,
    fontWeight: 900,
    color: '#F8FBFF',
  },
  drawerBrandSubtitle: {
    fontSize: 12,
    lineHeight: 1.2,
    fontWeight: 700,
    color: 'rgba(226,238,255,0.72)',
  },
  drawerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  drawerSectionLabel: {
    color: 'rgba(226,238,255,0.76)',
  },
  drawerNavButton: {
    height: 48,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.06)',
    color: '#F8FBFF',
    fontWeight: 800,
  },
  drawerPrimaryNav: {
    height: 48,
    borderRadius: 16,
    border: 'none',
    background: 'linear-gradient(135deg, rgba(252,163,17,0.96), rgba(255,210,122,0.94))',
    color: '#0B1320',
    fontWeight: 900,
    boxShadow: '0 18px 40px rgba(252,163,17,0.28)',
  },
  drawerUtilityButton: {
    height: 48,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.06)',
    color: '#F8FBFF',
    fontWeight: 800,
  },
  drawerPrimaryButton: {
    height: 50,
    borderRadius: 16,
    border: 'none',
    background: 'linear-gradient(135deg, #2B7BB9, #173B61)',
    color: '#FFFFFF',
    fontWeight: 900,
    boxShadow: '0 16px 36px rgba(23,59,97,0.28)',
  },
};

export default Header;
