import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopUpModal from '../components/TopUpModal';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: '',
    birthdate: '',
    gender: '',
    maritalStatus: '',
    phone: '',
    address: '',
    country: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setEditData((prev) => ({ ...prev, ...parsed }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleTopUp = async (amount) => {
    const updatedUser = { ...user, balance: (user.balance ?? 0) + amount };
    try {
      await axios.put(`http://localhost:3000/users/${user.id}`, updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowTopUp(false);
    } catch (error) {
      console.error('Ошибка при пополнении:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev) => ({ ...prev, avatar: reader.result }));
      };
      if (files && files[0]) reader.readAsDataURL(files[0]);
    } else {
      setEditData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveChanges = async () => {
    const updatedUser = { ...user, ...editData };
    try {
      await axios.put(`http://localhost:3000/users/${user.id}`, updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.darkBar}></div>
      <div style={styles.sidebar}></div>
      <div style={styles.bgOverlay}></div>
      <div style={styles.container}>
        <div style={styles.profileCard}>
          <div style={styles.profileHeader}>
            <div style={styles.avatarWrap}>
              <label style={styles.avatarLabel}>
                <img
                  src={user.avatar || 'https://via.placeholder.com/120'}
                  alt="avatar"
                  style={styles.avatar}
                />
                <span style={styles.avatarEditIcon}>✏️</span>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleEditChange}
                  style={styles.avatarInput}
                />
              </label>
            </div>
            <div style={styles.info}>
              <h2 style={styles.name}>{user.name}</h2>
              <p style={styles.email}>{user.email}</p>
              <div style={styles.actions}>
                <button style={styles.editBtn} onClick={() => setIsEditing(true)}>Редактировать профиль</button>
                <button style={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
              </div>
            </div>
            <div style={styles.balanceBox}>
              <p style={styles.balanceLabel}>Ваш Баланс</p>
              <p style={styles.balance}>{(user.balance ?? 0).toLocaleString()} ₽</p>
              <button style={styles.topUpBtn} onClick={() => setShowTopUp(true)}>Пополнить баланс</button>
            </div>
          </div>

          {isEditing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveChanges();
              }}
              style={styles.editForm}
            >
              <input type="text" name="name" value={editData.name} onChange={handleEditChange} placeholder="Имя" style={styles.editInput} required />
              <input type="email" name="email" value={editData.email} onChange={handleEditChange} placeholder="Email" style={styles.editInput} required />
              <input type="password" name="password" value={editData.password} onChange={handleEditChange} placeholder="Пароль" style={styles.editInput} />
              <input type="date" name="birthdate" value={editData.birthdate} onChange={handleEditChange} style={styles.editInput} />
              <input type="text" name="gender" value={editData.gender} onChange={handleEditChange} placeholder="Пол" style={styles.editInput} />
              <input type="text" name="maritalStatus" value={editData.maritalStatus} onChange={handleEditChange} placeholder="Семейное положение" style={styles.editInput} />
              <input type="tel" name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Телефон" style={styles.editInput} />
              <input type="text" name="address" value={editData.address} onChange={handleEditChange} placeholder="Адрес" style={styles.editInput} />
              <input type="text" name="country" value={editData.country} onChange={handleEditChange} placeholder="Страна" style={styles.editInput} />
              <button type="submit" style={styles.saveBtn}>Сохранить</button>
            </form>
          )}

          <TopUpModal show={showTopUp} onClose={() => setShowTopUp(false)} onTopUp={handleTopUp} />
        </div>

        <div style={styles.infoSection}>
          <h3 style={styles.infoHeader}>Ищите больше информации</h3>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={styles.infoCard}>
              <h4 style={styles.infoCardTitle}>Premium — это не просто цена, это подход.</h4>
              <p style={styles.infoCardText}>
                Это когда в каждом решении — забота о деталях, стиле и комфорте. Это про ценность, а не только про товар.
              </p>
              <a href="#" style={styles.readMore}>Больше</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


  const styles = {
    wrapper: {
      position: 'relative',
      minHeight: '100vh',
      backgroundImage: 'url(/bg-ship.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'right bottom',
      fontFamily: '"Poppins", sans-serif', // <-- исправлено здесь
      color: '#222',
    },
    darkBar: {
      height: '200px',
      backgroundColor: '#25436D',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 0,
    },
    sidebar: {
      position: 'absolute',
      top: '200px',
      bottom: 0,
      left: 0,
      width: '6px',
      backgroundColor: '#25436D',
      borderTopRightRadius: '6px',
      borderBottomRightRadius: '6px',
      zIndex: 1,
    },
    bgOverlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(255,255,255,0.95)',
      zIndex: 1,
    },
    container: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '60px 20px 40px',
      paddingLeft: '110px',
    },
    profileCard: {
      backgroundColor: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      padding: '30px',
      marginBottom: '40px',
      borderLeft: '5px solid #1d3557',
    },
    profileHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '30px',
      flexWrap: 'wrap',
    },
    avatarWrap: {
      flex: '0 0 auto',
      position: 'relative',
    },
    avatarLabel: {
      position: 'relative',
      cursor: 'pointer',
      display: 'inline-block',
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #fca311',
      boxShadow: '0 4px 15px rgba(246, 147, 30, 0.4)',
      transition: 'box-shadow 0.3s ease',
    },
    avatarEditIcon: {
      position: 'absolute',
      bottom: '5px',
      right: '5px',
      backgroundColor: '#fca311',
      borderRadius: '50%',
      padding: '6px 9px',
      fontSize: '14px',
      color: '#fff',
      boxShadow: '0 0 8px #fca311',
    },
    avatarInput: {
      display: 'none',
    },
    info: {
      flex: '1',
      minWidth: '220px',
    },
    name: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#1d3557',
      marginBottom: '8px',
    },
    email: {
      color: '#555',
      fontSize: '14px',
      marginBottom: '15px',
    },
    actions: {
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap',
    },
    editBtn: {
      backgroundColor: '#fca311',
      color: '#fff',
      padding: '12px 26px',
      borderRadius: '30px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '15px',
      boxShadow: '0 6px 15px rgba(252, 163, 17, 0.7)',
      transition: 'background-color 0.3s ease',
    },
    logoutBtn: {
      backgroundColor: '#e63946',
      color: '#fff',
      padding: '12px 26px',
      borderRadius: '30px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '15px',
      boxShadow: '0 6px 15px rgba(230, 57, 70, 0.7)',
      transition: 'background-color 0.3s ease',
    },
    balanceBox: {
      textAlign: 'center',
      minWidth: '160px',
      backgroundColor: '#e8f5e9',
      borderRadius: '16px',
      padding: '18px 30px',
      boxShadow: '0 6px 20px rgba(102, 187, 106, 0.3)',
      userSelect: 'none',
      fontWeight: '600',
      color: '#2e7d32',
      transition: 'transform 0.3s ease',
    },
    balanceLabel: {
      fontSize: '14px',
      marginBottom: '6px',
    },
    balance: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#388e3c',
      marginBottom: '10px',
    },
    topUpBtn: {
      backgroundColor: '#66bb6a',
      color: '#fff',
      padding: '10px 26px',
      border: 'none',
      borderRadius: '30px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '15px',
      boxShadow: '0 6px 15px rgba(102, 187, 106, 0.7)',
      transition: 'background-color 0.3s ease',
    },
    editForm: {
      marginTop: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    editInput: {
      padding: '14px 16px',
      fontSize: '16px',
      borderRadius: '12px',
      border: '1.5px solid #fca311',
      outline: 'none',
      fontWeight: '500',
      color: '#333',
      transition: 'border-color 0.3s ease',
    },
    saveBtn: {
      padding: '14px 0',
      borderRadius: '30px',
      backgroundColor: '#1d3557',
      color: '#fff',
      fontWeight: '700',
      fontSize: '18px',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(29, 53, 87, 0.8)',
      transition: 'background-color 0.3s ease',
    },
    infoSection: {
      marginTop: '20px',
      maxWidth: '900px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    infoHeader: {
      fontWeight: '600',
      fontSize: '22px',
      color: '#25436D',
      marginBottom: '12px',
    },
    infoCard: {
      backgroundColor: '#e9f0f7',
      padding: '22px',
      borderRadius: '14px',
      marginBottom: '14px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      cursor: 'pointer',
      outline: 'none',
    },
    infoCardTitle: {
      fontWeight: '600',
      fontSize: '18px',
      marginBottom: '6px',
      color: '#1d3557',
    },
    infoCardText: {
      fontWeight: '400',
      fontSize: '14px',
      color: '#444',
      marginBottom: '6px',
    },
    readMore: {
      color: '#fca311',
      fontWeight: '600',
      textDecoration: 'none',
      fontSize: '14px',
    },
  
};

export default ProfilePage;
