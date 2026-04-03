import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const API_URL = 'https://travelpay-backend-production.up.railway.app';

const emptyForm = {
  title: '',
  description: '',
  duration: '',
  price: '',
  image: '',
  location: '',
};

const ActualToursAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTours, setLoadingTours] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTourId, setEditingTourId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const tourStats = [
    { month: 'Янв', count: 3 },
    { month: 'Фев', count: 5 },
    { month: 'Мар', count: 8 },
    { month: 'Апр', count: 2 },
    { month: 'Май', count: 9 },
  ];

  const currentTab = useMemo(() => {
    if (location.pathname === '/admin/users') return 'users';
    if (location.pathname === '/admin/stats') return 'stats';
    return 'tours';
  }, [location.pathname]);

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    if (currentTab === 'users') {
      fetchUsers();
    }
  }, [currentTab]);

  const fetchTours = async () => {
    try {
      setLoadingTours(true);
      const res = await axios.get(`${API_URL}/tours`);
      setTours(res.data || []);
    } catch (error) {
      console.error('Ошибка загрузки туров:', error);
      setTours([]);
    } finally {
      setLoadingTours(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data || []);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingTourId(null);
  };

  const addTour = async () => {
    if (!form.title || !form.description || !form.image || !form.price) {
      alert('Заполни хотя бы название, описание, цену и картинку');
      return;
    }

    try {
      const newTour = {
        ...form,
        price: Number(form.price),
      };

      const res = await axios.post(`${API_URL}/tours`, newTour);
      setTours((prev) => [...prev, res.data]);
      resetForm();
    } catch (error) {
      console.error('Ошибка при добавлении тура:', error);
      alert('Не удалось добавить тур');
    }
  };

  const startEditTour = (tour) => {
    setEditingTourId(tour.id);
    setForm({
      title: tour.title || '',
      description: tour.description || '',
      duration: tour.duration || '',
      price: tour.price || '',
      image: tour.image || '',
      location: tour.location || '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const updateTour = async () => {
    if (!editingTourId) return;

    if (!form.title || !form.description || !form.image || !form.price) {
      alert('Заполни хотя бы название, описание, цену и картинку');
      return;
    }

    try {
      const updatedTour = {
        ...form,
        price: Number(form.price),
      };

      const res = await axios.put(
        `${API_URL}/tours/${editingTourId}`,
        updatedTour
      );

      setTours((prev) =>
        prev.map((tour) => (tour.id === editingTourId ? res.data : tour))
      );

      resetForm();
      alert('Тур успешно обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении тура:', error);
      alert('Не удалось обновить тур');
    }
  };

  const deleteTour = async (id) => {
    try {
      await axios.delete(`${API_URL}/tours/${id}`);
      setTours((prev) => prev.filter((tour) => tour.id !== id));

      if (editingTourId === id) {
        resetForm();
      }
    } catch (error) {
      console.error('Ошибка при удалении тура:', error);
      alert('Не удалось удалить тур');
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      alert('Не удалось удалить пользователя');
    }
  };

  const toggleAdmin = async (user) => {
    const updatedUser = {
      ...user,
      role: user.role === 'admin' ? 'user' : 'admin',
    };

    try {
      await axios.put(`${API_URL}/users/${user.id}`, updatedUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? updatedUser : u))
      );
    } catch (error) {
      console.error('Ошибка обновления роли:', error);
      alert('Не удалось изменить роль');
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return name.includes(query) || email.includes(query);
  });

  const statsCards = [
    { title: 'Всего туров', value: tours.length },
    { title: 'Всего пользователей', value: users.length },
    {
      title: 'Активный раздел',
      value:
        currentTab === 'tours'
          ? 'Туры'
          : currentTab === 'users'
          ? 'Пользователи'
          : 'Статистика',
    },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h2 style={styles.logo}>TravelPay Admin</h2>

          <button
            style={sidebarButton(currentTab === 'tours')}
            onClick={() => navigate('/admin/tours')}
          >
            Туры
          </button>

          <button
            style={sidebarButton(currentTab === 'users')}
            onClick={() => navigate('/admin/users')}
          >
            Пользователи
          </button>

          <button
            style={sidebarButton(currentTab === 'stats')}
            onClick={() => navigate('/admin/stats')}
          >
            Статистика
          </button>

          <button style={styles.logoutButton} onClick={() => navigate('/')}>
            Выйти
          </button>
        </aside>

        <main style={styles.content}>
          <div style={styles.topbar}>
            <h1 style={styles.title}>Админка TravelPay</h1>
          </div>

          <div style={styles.cardsGrid}>
            {statsCards.map((card, index) => (
              <div key={index} style={styles.statCard}>
                <p style={styles.statLabel}>{card.title}</p>
                <h3 style={styles.statValue}>{card.value}</h3>
              </div>
            ))}
          </div>

          {currentTab === 'tours' && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>
                {editingTourId ? 'Редактировать тур' : 'Добавить тур'}
              </h2>

              <div style={styles.formGrid}>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Название"
                  style={styles.input}
                />
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Локация"
                  style={styles.input}
                />
                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="Длительность"
                  style={styles.input}
                />
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Цена"
                  style={styles.input}
                />
                <input
                  type="text"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="URL картинки"
                  style={styles.input}
                />
              </div>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Описание тура"
                style={styles.textarea}
              />

              <div style={styles.formActions}>
                {editingTourId ? (
                  <>
                    <button style={styles.primaryButton} onClick={updateTour}>
                      Сохранить изменения
                    </button>
                    <button style={styles.cancelButton} onClick={resetForm}>
                      Отмена
                    </button>
                  </>
                ) : (
                  <button style={styles.primaryButton} onClick={addTour}>
                    Добавить тур
                  </button>
                )}
              </div>

              <h3 style={{ marginTop: 30 }}>Список туров</h3>

              {loadingTours ? (
                <p>Загрузка туров...</p>
              ) : tours.length === 0 ? (
                <p>Пока туров нет</p>
              ) : (
                <div style={styles.toursGrid}>
                  {tours.map((tour) => (
                    <div key={tour.id} style={styles.tourCard}>
                      <img
                        src={tour.image}
                        alt={tour.title}
                        style={styles.tourImage}
                      />
                      <div style={styles.tourBody}>
                        <h3 style={styles.tourTitle}>{tour.title}</h3>
                        <p style={styles.tourText}>{tour.description}</p>
                        <p style={styles.tourMeta}>
                          <strong>Локация:</strong> {tour.location || 'Не указана'}
                        </p>
                        <p style={styles.tourMeta}>
                          <strong>Длительность:</strong> {tour.duration || 'Не указана'}
                        </p>
                        <p style={styles.tourMeta}>
                          <strong>Цена:</strong> {tour.price} $
                        </p>

                        <div style={styles.cardActions}>
                          <button
                            style={styles.editButton}
                            onClick={() => startEditTour(tour)}
                          >
                            Редактировать
                          </button>

                          <button
                            style={styles.deleteButton}
                            onClick={() => deleteTour(tour.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {currentTab === 'users' && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Пользователи</h2>

              <input
                type="text"
                placeholder="Поиск по имени или email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.input}
              />

              {loadingUsers ? (
                <p>Загрузка пользователей...</p>
              ) : filteredUsers.length === 0 ? (
                <p>Пользователи не найдены</p>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>№</th>
                        <th style={styles.th}>Имя</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Роль</th>
                        <th style={styles.th}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr key={user.id}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>{user.name}</td>
                          <td style={styles.td}>{user.email}</td>
                          <td style={styles.td}>{user.role || 'user'}</td>
                          <td style={styles.td}>
                            <div style={styles.actions}>
                              <button
                                style={styles.smallButton}
                                onClick={() => toggleAdmin(user)}
                              >
                                {user.role === 'admin'
                                  ? 'Снять админа'
                                  : 'Назначить админа'}
                              </button>
                              <button
                                style={styles.smallDeleteButton}
                                onClick={() => deleteUser(user.id)}
                              >
                                Удалить
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {currentTab === 'stats' && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Статистика</h2>
              <p style={{ marginBottom: 20 }}>
                Сейчас тут базовая статистика. Потом сюда можно добавить
                бронирования, оплаты и популярные туры.
              </p>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={tourStats}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2f80ed" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f7fb',
    fontFamily: 'Poppins, sans-serif',
  },
  layout: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '260px',
    background: '#17325c',
    color: '#fff',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  logo: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  content: {
    flex: 1,
    padding: '30px',
  },
  topbar: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '34px',
    color: '#17325c',
    margin: 0,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '20px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  },
  statLabel: {
    margin: 0,
    color: '#6b7280',
    fontSize: '14px',
  },
  statValue: {
    margin: '10px 0 0',
    fontSize: '28px',
    color: '#17325c',
  },
  section: {
    background: '#fff',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    marginTop: 0,
    color: '#17325c',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #d9e1ec',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #d9e1ec',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '14px',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    background: '#2f80ed',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  cancelButton: {
    background: '#9ca3af',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 'auto',
    background: '#f04f4f',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  toursGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
    marginTop: '20px',
  },
  tourCard: {
    background: '#f9fbff',
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid #e7eef8',
  },
  tourImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  tourBody: {
    padding: '16px',
  },
  tourTitle: {
    margin: '0 0 8px',
    color: '#17325c',
  },
  tourText: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '12px',
  },
  tourMeta: {
    margin: '6px 0',
    fontSize: '14px',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  editButton: {
    background: '#f59e0b',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
  },
  deleteButton: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f8fafc',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  smallButton: {
    background: '#2f80ed',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
  smallDeleteButton: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
};

const sidebarButton = (active) => ({
  background: active ? '#2f80ed' : 'transparent',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '12px',
  padding: '12px 14px',
  cursor: 'pointer',
  textAlign: 'left',
  fontWeight: '600',
});

export default ActualToursAdmin;