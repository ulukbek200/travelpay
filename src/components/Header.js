import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaHome, FaGlobe } from 'react-icons/fa';
import { motion, useAnimation } from 'framer-motion';

const HeaderPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isShrunk, setIsShrunk] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const controls = useAnimation();

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

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);
    setIsShrunk(currentScrollY > 100);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sidebarIcons = [
    { icon: <FaHome />, label: 'Главная', action: () => navigate('/') },
    { icon: <FaUser />, label: 'Профиль', action: () => navigate('/profile') },
    { icon: <FaGlobe />, label: 'Туры', action: () => navigate('/tours') },
    { icon: <FaSignOutAlt />, label: 'Выход', action: handleLogout },
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ width: '70px' }}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          backgroundColor: bgColor,
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
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
          <motion.div
            key={i}
            onClick={action}
            whileHover={{ scale: 1.05 }}
            style={{
              color: '#B0C4DE',
              fontSize: '19px',
              margin: '20px 0',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              width: '100%',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              paddingLeft: sidebarOpen ? '45px' : 0,
              fontFamily,
            }}
          >
            {icon}
            {sidebarOpen && <span style={{ marginLeft: '20px' }}>{label}</span>}
          </motion.div>
        ))}
      </motion.div>

      {/* Header */}
      <motion.header
        animate={controls}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          width: `calc(100% - ${sidebarWidth} - 10px)`,
          backgroundColor: bgColor,
          color: 'white',
          zIndex: 999,
          position: 'fixed',
          top: '5px',
          left: `calc(${sidebarWidth} + 5px)`,
          height: isShrunk ? '45px' : '65px',
          display: 'flex',
          alignItems: 'center',
          padding: isShrunk ? '0 10px' : '0 18px',
          transition: 'all 0.3s ease-in-out',
          fontFamily,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          borderRadius: '20px',
        }}
      >
        <h1
          style={{
            fontSize: isShrunk ? '16px' : '22px',
            fontWeight: 'bold',
            margin: 0,
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1001,
          }}
          onClick={() => navigate('/')}
        >
          TravelPay
        </h1>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1001 }}>
          {currentUser ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#fca311',
                color: '#fff',
                padding: isShrunk ? '4px 10px' : '10px 16px',
                borderRadius: '40px',
                boxShadow: '0 4px 10px rgba(252, 163, 17, 0.4)',
                fontWeight: '600',
                fontSize: isShrunk ? '13px' : '16px',
              }}
            >
              <img
                src={currentUser.avatar || 'https://www.w3schools.com/howto/img_avatar.png'}
                alt="avatar"
                style={{ width: isShrunk ? '24px' : '34px', height: isShrunk ? '24px' : '34px', borderRadius: '50%' }}
              />
              <span>
                {currentUser.name} | {Number(currentUser.balance).toLocaleString()}₽
              </span>
            </motion.div>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
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
                }}
              >
                Войти
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
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
                }}
              >
                Зарегистрироваться
              </motion.button>
            </>
          )}
        </div>
      </motion.header>
    </>
  );
};

export default HeaderPage;
