// AdminPanel.js — с анимациями, стилями, кнопкой выхода и полной логикой
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('adminAuthenticated') === 'true');
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('tours');
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', duration: '', price: '', image: '' });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tourStats = [
    { month: 'Янв', count: 3 },
    { month: 'Фев', count: 5 },
    { month: 'Мар', count: 8 },
    { month: 'Апр', count: 2 },
    { month: 'Май', count: 9 },
  ];

  useEffect(() => {
    if (activeTab === 'users') {
      setLoadingUsers(true);
      axios.get('https://travelpay-backend-production.up.railway.app/users')
        .then((res) => setUsers(res.data))
        .catch((err) => console.error('Ошибка загрузки пользователей', err))
        .finally(() => setLoadingUsers(false));
    }
  }, [activeTab]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addTour = () => {
    if (!form.title || !form.description || !form.image) return;
    setTours([...tours, form]);
    setForm({ title: '', description: '', duration: '', price: '', image: '' });
  };

  const deleteTour = (index) => {
    const newTours = [...tours];
    newTours.splice(index, 1);
    setTours(newTours);
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`https://travelpay-backend-production.up.railway.app/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      console.error('Ошибка при удалении пользователя:', err);
    }
  };

  const toggleAdmin = async (user) => {
    const updatedUser = { ...user, role: user.role === 'admin' ? 'user' : 'admin' };
    try {
      await axios.put(`https://travelpay-backend-production.up.railway.app/users/${user.id}`, updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    } catch (err) {
      console.error('Ошибка при обновлении роли:', err);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      setPasswordError('');
    } else {
      setPasswordError('Неверный пароль администратора');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setAdminPassword('');
    setPasswordError('');
  };

  const fadeStyle = { animation: 'fadeIn 0.5s ease-in-out' };
  const shakeStyle = { animation: 'shake 0.3s ease-in-out' };

  const globalStyle = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    .hover-lift:hover { transform: translateY(-4px); transition: 0.3s; }
    .hover-highlight:hover { background-color: #f9f9f9; }
  `;

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', background: '#f4f7fa', minHeight: '100vh', padding: '40px 20px' }}>
      <style>{globalStyle}</style>
      {!isAuthenticated ? (
        <div style={{ maxWidth: 400, margin: '0 auto', padding: 30, background: '#fff', borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', ...fadeStyle }}>
          <h2>Вход в админ-панель</h2>
          <input
            type="password"
            placeholder="Введите пароль администратора"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 20, borderRadius: 8, border: '1px solid #ccc' }}
          />
          {passwordError && (
            <div style={{ color: 'red', marginTop: 10, ...shakeStyle }}>{passwordError}</div>
          )}
          <button
            onClick={handleAdminLogin}
            style={{ marginTop: 20, padding: '10px 20px', background: '#1e88e5', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >Войти</button>
        </div>
      ) : (
        <div style={{ maxWidth: 1000, margin: '0 auto', ...fadeStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ textAlign: 'center', color: '#1d3557' }}>Админка TravelPay</h1>
            <button onClick={handleLogout} style={{ ...mainButtonStyle, backgroundColor: '#999' }}>Выйти</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 30 }}>
            <button onClick={() => setActiveTab('tours')} style={tabButtonStyle(activeTab === 'tours')}>Добавить тур</button>
            <button onClick={() => setActiveTab('stats')} style={tabButtonStyle(activeTab === 'stats')}>Статистика</button>
            <button onClick={() => setActiveTab('users')} style={tabButtonStyle(activeTab === 'users')}>Пользователи</button>
          </div>

          {activeTab === 'tours' && (
            <div style={blockStyle}>
              <h2>Добавить тур</h2>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Название" style={inputStyle} />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Описание" style={inputStyle} />
              <input type="text" name="duration" value={form.duration} onChange={handleChange} placeholder="Длительность" style={inputStyle} />
              <input type="text" name="price" value={form.price} onChange={handleChange} placeholder="Цена" style={inputStyle} />
              <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="URL картинки" style={inputStyle} />
              <button onClick={addTour} style={mainButtonStyle}>Добавить</button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 30 }}>
                {tours.map((tour, index) => (
                  <div key={index} className="hover-lift" style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <img src={tour.image} alt={tour.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                    <div style={{ padding: 16 }}>
                      <h3 style={{ margin: '0 0 8px', color: '#1d3557' }}>{tour.title}</h3>
                      <p style={{ fontSize: 14, color: '#555' }}>{tour.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 10 }}>
                        <span>{tour.duration}</span>
                        <span>{tour.price}</span>
                      </div>
                      <button onClick={() => deleteTour(index)} style={{ background: '#e57373', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 8, marginTop: 12, cursor: 'pointer' }}>
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div style={blockStyle}>
              <h2>Статистика</h2>
              <p>Всего туров: {tours.length}</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tourStats}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e88e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'users' && (
            <div style={blockStyle}>
              <h2>Список пользователей</h2>
              <input type="text" placeholder="Поиск по имени или email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={inputStyle} />
              {loadingUsers ? (
                <p>Загрузка...</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#eee' }}>
                      <th style={thTdStyle}>№</th>
                      <th style={thTdStyle}>Имя</th>
                      <th style={thTdStyle}>Email</th>
                      <th style={thTdStyle}>Роль</th>
                      <th style={thTdStyle}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((user, index) => (
                      <tr key={user.id} className="hover-highlight">
                        <td style={thTdStyle}>{index + 1}</td>
                        <td style={thTdStyle}>{user.name}</td>
                        <td style={thTdStyle}>{user.email}</td>
                        <td style={thTdStyle}>{user.role || 'user'}</td>
                        <td style={thTdStyle}>
                          <button onClick={() => toggleAdmin(user)} style={{ ...mainButtonStyle, padding: '6px 10px', fontSize: 13 }}>
                            {user.role === 'admin' ? 'Снять админа' : 'Назначить админа'}
                          </button>
                          <button onClick={() => deleteUser(user.id)} style={{ marginLeft: 8, background: '#e53935', color: 'white', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}>
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const blockStyle = {
  background: '#ffffff',
  padding: 20,
  borderRadius: 12,
  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
  marginBottom: 30
};

const inputStyle = {
  width: '100%',
  marginBottom: 15,
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 16
};

const mainButtonStyle = {
  background: 'linear-gradient(to right, #1e88e5, #1565c0)',
  color: 'white',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 10,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14
};

const tabButtonStyle = (active) => ({
  background: active ? '#1e88e5' : '#e0e0e0',
  color: active ? 'white' : '#333',
  padding: '10px 20px',
  border: 'none',
  borderRadius: 8,
  fontWeight: 'bold', 
  cursor: 'pointer'
});

const thTdStyle = {
  padding: 12,
  borderBottom: '1px solid #ddd',
  textAlign: 'center'
};

export default AdminPanel;
