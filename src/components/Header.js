import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaHistory, FaSignOutAlt, FaBars, FaHome, FaCog } from 'react-icons/fa';

const HeaderPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const fontFamily = "'Poppins', sans-serif";
  const bgColor = '#1d3557';
  const sidebarWidth = sidebarOpen ? '220px' : '70px';

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

  const sidebarIcons = [
    { icon: <FaHome />, label: 'Главная', action: () => navigate('/') },
    { icon: <FaUser />, label: 'Профиль', action: () => navigate('/profile') },
    { icon: <FaHistory />, label: 'История', action: () => alert('Скоро появится') },
    { icon: <FaCog />, label: 'Настройки', action: () => alert('Скоро появится') },
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
          borderBottomRightRadius: '20px',
          fontFamily,
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#fca311',
            fontSize: '22px',
            marginBottom: '20px',
            cursor: 'pointer',
            fontFamily,
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
              fontSize: '19px',
              fontFamily,
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              width: '100%',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              paddingLeft: sidebarOpen ? '45px' : 0,
              transition: 'all 0.3s ease-in-out',
            }}
          >
            {icon}
            {sidebarOpen && <span style={{ marginLeft: '20px' }}>{label}</span>}
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
          height: '65px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out',
          fontFamily,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            margin: 0,
            cursor: 'pointer',
            fontFamily,
          }}
          onClick={() => navigate('/')}
        >
          TravelPay
        </h1>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily,
          }}
        >
          {currentUser ? (
            <span
              style={{
                fontWeight: '500',
                backgroundColor: '#fca311',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(252, 163, 17, 0.4)',
              }}
            >
              {currentUser.name} | {Number(currentUser.balance).toLocaleString()}₽
            </span>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  backgroundColor: '#fca311',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              >
                Войти
              </button>

              <button
                onClick={() => navigate('/register')}
                style={{
                  backgroundColor: '#457b9d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              >
                Зарегистрироваться
              </button>
            </>
          )}
        </div>
      </header>
    </>
  );
};

export default HeaderPage;
