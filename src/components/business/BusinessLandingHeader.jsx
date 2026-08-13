import React, { useEffect, useState } from 'react';
import { Button, Drawer, Tooltip } from 'antd';
import {
  CloseOutlined,
  LoginOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const sectionLinks = [
  ['features', 'Возможности'],
  ['audience', 'Для кого'],
  ['workflow', 'Как работает'],
  ['faq', 'Вопросы'],
];

export default function BusinessLandingHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const isLanding = location.pathname === '/business' || location.pathname === '/travelpay-business';

  useEffect(() => {
    if (!isLanding) {
      setActiveSection('');
      return undefined;
    }

    const updateScrolled = () => setIsScrolled(window.scrollY > 10);
    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });

    const sections = sectionLinks
      .map(([id]) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
      if (visible?.target?.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0.08, 0.25, 0.55] });

    sections.forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener('scroll', updateScrolled);
      observer.disconnect();
    };
  }, [isLanding]);

  const goToSection = (id) => {
    setDrawerOpen(false);
    if (!isLanding) {
      navigate(`/business#${id}`);
      return;
    }
    setActiveSection(id);
    window.history.replaceState(null, '', `${location.pathname}#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const navigation = sectionLinks.map(([id, label]) => (
    <button
      key={id}
      type="button"
      className={`tp-business-header__link ${activeSection === id ? 'is-active' : ''}`}
      onClick={() => goToSection(id)}
      aria-current={activeSection === id ? 'page' : undefined}
    >
      {label}
    </button>
  ));

  const priceLink = (
    <button
      type="button"
      className={`tp-business-header__link ${location.pathname === '/prices' ? 'is-active' : ''}`}
      onClick={() => { setDrawerOpen(false); navigate('/prices'); }}
      aria-current={location.pathname === '/prices' ? 'page' : undefined}
    >
      Тарифы
    </button>
  );

  const openLogin = () => navigate('/business/login');
  const openRegistration = () => navigate('/business/register');
  const themeLabel = theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';

  return (
    <header className={`tp-business-header ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="tp-business-header__inner">
        <button
          type="button"
          className="tp-business-header__brand"
          onClick={() => (isLanding ? window.scrollTo({ top: 0, behavior: 'smooth' }) : navigate('/business'))}
          aria-label="TravelPay для бизнеса — в начало"
        >
          <img src="/travelpay-logo.svg" alt="" width="36" height="36" />
          <span>TravelPay <b>Business</b></span>
        </button>

        <nav className="tp-business-header__nav" aria-label="Навигация для бизнеса">
          {navigation}
          {priceLink}
        </nav>

        <div className="tp-business-header__actions">
          <Tooltip title={themeLabel}>
            <Button
              type="text"
              className="tp-business-header__theme"
              icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleTheme}
              aria-label={themeLabel}
            />
          </Tooltip>
          <Button type="text" icon={<LoginOutlined />} onClick={openLogin}>Войти</Button>
          <Button type="primary" onClick={openRegistration}>Зарегистрировать объект</Button>
        </div>

        <Button
          className="tp-business-header__menu"
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerOpen(true)}
          aria-label="Открыть меню"
        />
      </div>

      <Drawer
        className="tp-business-header__drawer"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        placement="right"
        size="min(340px, 92vw)"
        closeIcon={<CloseOutlined />}
        title="TravelPay Business"
      >
        <div className="tp-business-header__drawer-content">
          <nav className="tp-business-header__drawer-nav" aria-label="Мобильная навигация для бизнеса">
            {navigation}
            {priceLink}
          </nav>
          <Button block icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme}>
            {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          </Button>
          <Button block onClick={openLogin}>Войти в кабинет</Button>
          <Button block type="primary" onClick={openRegistration}>Зарегистрировать объект</Button>
        </div>
      </Drawer>
    </header>
  );
}
