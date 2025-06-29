import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaHistory, FaSignOutAlt, FaBars, FaHome } from 'react-icons/fa';

const Header = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUser(parsed.isLoggedIn ? parsed : null);
    } else {
      setCurrentUser(null);
    }
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/');
  };

  const sidebarWidth = sidebarOpen ? '200px' : '70px';
  const bgColor = '#1b2b45';

  const sidebarIcons = [
    { icon: <FaHome />, label: 'Главная', action: () => navigate('/') },
    { icon: <FaUser />, label: 'Профиль', action: () => navigate('/profile') },
    { icon: <FaHistory />, label: 'История', action: () => alert('Скоро появится') },
    { icon: <FaSignOutAlt />, label: 'Выход', action: handleLogout },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: sidebarWidth,
          backgroundColor: bgColor,
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
          transition: 'width 0.3s ease-in-out',
          borderBottomRightRadius: '20px'
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFA500',
            fontSize: '22px',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
        >
          <FaBars />
        </button>
        {sidebarIcons.map(({ icon, label, action }, i) => (
          <div
            key={i}
            onClick={action}
            style={{
              color: '#B0C4DE',
              fontSize: '20px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              width: '100%',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              paddingLeft: sidebarOpen ? '20px' : 0,
            }}
          >
            {icon}
            {sidebarOpen && <span style={{ marginLeft: '10px' }}>{label}</span>}
          </div>
        ))}
      </div>

      {/* Header */}
      <header
        style={{
          width: `calc(100% - ${sidebarWidth})`,
          backgroundColor: bgColor,
          color: 'white',
          zIndex: 999,
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out',
          borderBottomLeftRadius: '0px',
        }}
      >
        <h1
          style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          TravelPay
        </h1>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentUser ? (
            <span style={{ fontWeight: '500' }}>
              {currentUser.name} | {Number(currentUser.balance).toLocaleString()}₽
            </span>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#FFA500',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Войти
              </button>
              <button
                onClick={() => navigate('/register')}
                style={{
                  backgroundColor: '#007BFF',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Присоединиться
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
