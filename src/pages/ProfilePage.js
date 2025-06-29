import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TopUpModal from '../components/TopUpModal';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '', email: '', password: '', avatar: '', birthdate: '', gender: '', maritalStatus: '', phone: '', address: '', country: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setEditData({ ...editData, ...parsed });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleTopUp = async (amount) => {
    const updatedUser = { ...user, balance: user.balance + amount };
    try {
      await axios.put(`http://localhost:3000/users/${user.id}`, updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
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
      if (files[0]) reader.readAsDataURL(files[0]);
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
                <img src={user.avatar || 'https://via.placeholder.com/120'} alt="avatar" style={styles.avatar} />
                <span style={styles.avatarEditIcon}>✏️</span>
                <input type="file" name="avatar" accept="image/*" onChange={handleEditChange} style={styles.avatarInput} />
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
              <p style={styles.balance}>{user.balance.toLocaleString()} ₽</p>
              <button style={styles.topUpBtn} onClick={() => setShowTopUp(true)}>Пополнить баланс</button>
            </div>
          </div>

          {isEditing && (
            <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} style={styles.editForm}>
              <input type="text" name="name" value={editData.name} onChange={handleEditChange} placeholder="Имя" />
              <input type="email" name="email" value={editData.email} onChange={handleEditChange} placeholder="Email" />
              <input type="password" name="password" value={editData.password} onChange={handleEditChange} placeholder="Пароль" />
              <button type="submit" style={styles.saveBtn}>Сохранить</button>
            </form>
          )}

          <TopUpModal show={showTopUp} onClose={() => setShowTopUp(false)} onTopUp={handleTopUp} />
        </div>

        <div style={styles.infoSection}>
          <h3 style={styles.infoHeader}>Ищите больше информации</h3>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={styles.infoCard}>
              <h4>Premium — это не просто цена, это подход.</h4>
              <p>Это когда в каждом решении — забота о деталях, стиле и комфорте. Это про ценность, а не только про товар.</p>
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
  },
  darkBar: {
    height: '200px',
    backgroundColor: '#25436D',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
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
    zIndex: 1
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
    paddingLeft: '110px', // добавлено
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
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    backgroundColor: '#fff',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  },
  avatarInput: {
    display: 'none'
  },
  info: {
    flex: '1',
  },
  name: {
    fontSize: '22px',
    fontWeight: 'bold',
  },
  email: {
    color: '#777',
    marginBottom: '10px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  editBtn: {
    backgroundColor: '#fca311',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#e63946',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  balanceBox: {
    textAlign: 'center',
  },
  balanceLabel: {
    fontWeight: '600',
    marginBottom: '6px',
  },
  balance: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#0a0',
    marginBottom: '6px',
  },
  topUpBtn: {
    backgroundColor: '#fca311',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  saveBtn: {
    marginTop: '10px',
    padding: '10px 16px',
    backgroundColor: '#1d3557',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  infoSection: {
    backgroundColor: 'transparent',
  },
  infoHeader: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  readMore: {
    color: '#1d3557',
    textDecoration: 'none',
    fontWeight: '500',
  }
};

export default ProfilePage;
