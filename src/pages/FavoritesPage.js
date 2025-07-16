import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FavoritesPage = ({ favorites, setFavorites }) => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');

  const handleRemove = (titleToRemove) => {
    const updated = favorites.filter((tour) => tour.title !== titleToRemove);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    setNotification('Тур удалён из избранного');
    setTimeout(() => setNotification(''), 3000);
  };

  const handleClearAll = () => {
    setFavorites([]);
    localStorage.setItem('favorites', JSON.stringify([]));
    setNotification('Избранное очищено');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div style={{
      padding: '40px 20px',
      fontFamily: "'Poppins', sans-serif",
      backgroundColor: '#f3f4f6',
      minHeight: '100vh',
    }}>
      {/* Логотип */}
      <div
        onClick={() => navigate('/')}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          fontSize: 24,
          fontWeight: 700,
          color: '#1e40af',
          cursor: 'pointer',
          userSelect: 'none',
          zIndex: 1000
        }}
      >
        TravelPay
      </div>

      <h2 style={{
        textAlign: 'center',
        fontSize: '32px',
        marginBottom: '20px',
        color: '#1e293b'
      }}>
        Избранные туры
      </h2>

      {notification && (
        <div style={{
          textAlign: 'center',
          background: '#d1fae5',
          color: '#065f46',
          padding: '10px',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '0 auto 30px',
          fontWeight: 600,
        }}>
          {notification}
        </div>
      )}

      {favorites.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={handleClearAll}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            Очистить всё
          </button>
        </div>
      )}

      {favorites.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280' }}>
          Вы пока не добавили ни одного тура в избранное.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {favorites.map((tour, index) => (
            <div key={index} style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img
                src={tour.image}
                alt={tour.title}
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover'
                }}
              />
              <div style={{ padding: '16px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: '#111827'
                }}>
                  {tour.title}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '6px',
                  height: '40px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {tour.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  <span>{tour.duration}</span>
                  <span>{tour.price}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => navigate('/booking', { state: { tour } })}
                    style={{
                      flex: 1,
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    Забронировать
                  </button>
                  <button
                    onClick={() => handleRemove(tour.title)}
                    style={{
                      flex: 1,
                      backgroundColor: '#f87171',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
