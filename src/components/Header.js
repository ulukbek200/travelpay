// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { FaUser, FaSignOutAlt, FaBars, FaHome, FaGlobe } from 'react-icons/fa';
// import { motion, useAnimation } from 'framer-motion';

// const HeaderPage = () => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [scrollY, setScrollY] = useState(0);
//   const [isShrunk, setIsShrunk] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const controls = useAnimation();

//   const fontFamily = "'Poppins', sans-serif";
//   const bgColor = '#1d3557';

//   useEffect(() => {
//     const user = localStorage.getItem('currentUser');
//     if (user) {
//       const parsed = JSON.parse(user);
//       setCurrentUser(parsed?.isLoggedIn ? parsed : null);
//     } else {
//       setCurrentUser(null);
//     }
//   }, [location.pathname]);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   const handleLogout = () => {
//     localStorage.removeItem('currentUser');
//     setCurrentUser(null);
//     navigate('/');
//   };

//   const handleScroll = () => {
//     const currentScrollY = window.scrollY;
//     setScrollY(currentScrollY);
//     setIsShrunk(currentScrollY > 100);
//   };

//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const sidebarIcons = [
//     { icon: <FaHome />, label: 'Главная', action: () => navigate('/') },
//     { icon: <FaUser />, label: 'Профиль', action: () => navigate('/profile') },
//     { icon: <FaGlobe />, label: 'Туры', action: () => navigate('/tours') },
//     { icon: <FaSignOutAlt />, label: 'Выход', action: handleLogout },
//   ];

//   return (
//     <>
//       {/* Sidebar */}
//       <motion.div
//         animate={{ width: sidebarOpen ? 180 : 50 }}
//         transition={{ duration: 0.3 }}
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           height: '100vh',
//           backgroundColor: bgColor,
//           zIndex: 998,
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: sidebarOpen ? 'flex-start' : 'center',
//           paddingTop: '80px',
//           borderTopRightRadius: '20px',
//           borderBottomRightRadius: '20px',
//           fontFamily,
//           boxShadow: '4px 0 12px rgba(0,0,0,0.3)',
//           overflow: 'hidden',
//         }}
//       >
//         <motion.div
//           onClick={toggleSidebar}
//           whileTap={{ scale: 0.95 }}
//           style={{
//             position: 'absolute',
//             top: '20px',
//             left: '5px',
//             background: 'transparent',
//             width: '40px',
//             height: '40px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             cursor: 'pointer',
//             zIndex: 999,
//             color: '#fca311',
//             fontSize: '20px'
//           }}
//         >
//           <FaBars />
//         </motion.div>

//         {sidebarIcons.map(({ icon, label, action }, i) => (
//           <motion.div
//             key={i}
//             onClick={action}
//             whileHover={{ scale: 1.05 }}
//             style={{
//               color: '#B0C4DE',
//               fontSize: '19px',
//               margin: '20px 0',
//               display: 'flex',
//               alignItems: 'center',
//               cursor: 'pointer',
//               width: '100%',
//               paddingLeft: sidebarOpen ? '20px' : '0px',
//               justifyContent: sidebarOpen ? 'flex-start' : 'center',
//             }}
//           >
//             {icon}
//             {sidebarOpen && <span style={{ marginLeft: '10px' }}>{label}</span>}
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Header */}
//       <motion.header
//         animate={controls}
//         transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//         style={{
//           width: '100%',
//           backgroundColor: bgColor,
//           color: 'white',
//           zIndex: 997,
//           position: 'sticky',
//           top: 0,
//           height: isShrunk ? '45px' : '65px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           padding: isShrunk ? '0 10px' : '0 18px',
//           transition: 'all 0.3s ease-in-out',
//           fontFamily,
//           boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
//           borderBottomLeftRadius: '20px',
//           borderBottomRightRadius: '20px',
//         }}
//       >
//         {/* Logo */}
//         <h1 style={{ margin: 0, fontSize: isShrunk ? '18px' : '22px', fontWeight: 'bold' }}>TravelPay</h1>

//         {/* Auth Controls */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1001 }}>
//           {currentUser ? (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '10px',
//                 backgroundColor: '#fca311',
//                 color: '#fff',
//                 padding: isShrunk ? '4px 10px' : '10px 16px',
//                 borderRadius: '40px',
//                 boxShadow: '0 4px 10px rgba(252, 163, 17, 0.4)',
//                 fontWeight: '600',
//                 fontSize: isShrunk ? '13px' : '16px',
//               }}
//             >
//               <img
//                 src={currentUser.avatar || 'https://www.w3schools.com/howto/img_avatar.png'}
//                 alt="avatar"
//                 style={{ width: isShrunk ? '24px' : '34px', height: isShrunk ? '24px' : '34px', borderRadius: '50%' }}
//               />
//               <span>
//                 {currentUser.name} | {Number(currentUser.balance).toLocaleString()}₽
//               </span>
//             </motion.div>
//           ) : (
//             <>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onClick={() => navigate('/login')}
//                 style={{
//                   backgroundColor: '#fca311',
//                   color: 'white',
//                   border: 'none',
//                   padding: '10px 20px',
//                   borderRadius: '30px',
//                   fontSize: '15px',
//                   cursor: 'pointer',
//                   fontWeight: '600',
//                 }}
//               >
//                 Войти
//               </motion.button>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 onClick={() => navigate('/register')}
//                 style={{
//                   backgroundColor: '#457b9d',
//                   color: 'white',
//                   border: 'none',
//                   padding: '10px 20px',
//                   borderRadius: '30px',
//                   fontSize: '15px',
//                   cursor: 'pointer',
//                   fontWeight: '600',
//                 }}
//               >
//                 Зарегистрироваться
//               </motion.button>
//             </>
//           )}
//         </div>
//       </motion.header>
//     </>
//   );
// };

// export default HeaderPage;



import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaChevronRight, FaHome, FaGlobe, FaBars } from 'react-icons/fa';
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
  const sidebarWidth = sidebarOpen ? '180px' : '50px';

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUser(parsed?.isLoggedIn ? parsed : null);
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
        animate={{ width: sidebarOpen ? 180 : 50 }}
        initial={false}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          backgroundColor: bgColor,
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarOpen ? 'flex-start' : 'center',
          paddingTop: '80px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '20px',
          fontFamily,
          boxShadow: '4px 0 12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          onClick={toggleSidebar}
          whileTap={{ scale: 0.95 }}
          style={{
            position: 'absolute',
            top: '20px',
            left: '5px',
            background: 'transparent',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 999,
            color: '#fca311',
            fontSize: '20px'
          }}
        >
          <FaBars />
        </motion.div>

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
              paddingLeft: sidebarOpen ? '20px' : '0px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              transition: 'padding-left 0.4s ease',
            }}
          >
            {icon}
            {sidebarOpen && <span style={{ marginLeft: '10px', transition: 'opacity 0.3s ease' }}>{label}</span>}
          </motion.div>
        ))}
      </motion.div>

      {/* Header */}
      <motion.header
        animate={controls}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          width: `calc(100% - ${sidebarWidth})`,
          backgroundColor: bgColor,
          color: 'white',
          zIndex: 997,
          position: 'fixed',
          top: 0,
          left: sidebarWidth,
          height: isShrunk ? '45px' : '65px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isShrunk ? '0 10px' : '0 18px',
          transition: 'all 0.3s ease-in-out',
          fontFamily,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '20px',
        }}
      >
        <h1
          style={{
            fontSize: isShrunk ? '16px' : '22px',
            fontWeight: 'bold',
            margin: 0,
            cursor: 'pointer',
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
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#fca311',
                color: '#fff',
                padding: isShrunk ? '4px 10px' : '6px 16px',
                borderRadius: '40px',
                boxShadow: '0 4px 10px rgba(252, 163, 17, 0.4)',
                fontWeight: '600',
                fontSize: isShrunk ? '14px' : '16px',
                marginRight: '15px',
                cursor: 'pointer',
              }}
            >
              <img
                src={currentUser.avatar || 'https://www.w3schools.com/howto/img_avatar.png'}
                alt="avatar"
                style={{
                  width: isShrunk ? '24px' : '34px',
                  height: isShrunk ? '24px' : '34px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <span style={{ whiteSpace: 'nowrap' }}>
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
