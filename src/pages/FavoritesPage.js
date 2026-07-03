import React, { useState } from 'react';
import { App, Button, Card, Empty, Modal, Space, Tag, Typography } from 'antd';
import { CalendarOutlined, DeleteOutlined, EnvironmentOutlined, EyeOutlined, ShoppingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { readCurrentUser } from '../utils/currentUser';
import { syncCurrentUser } from '../utils/user';

const { Title, Text, Paragraph } = Typography;
const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';

const formatPrice = (price) => `${Number(String(price || 0).replace(/[^0-9]/g, '') || 0).toLocaleString()} сом`;

const FavoritesPage = ({ favorites, setFavorites }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [selectedTour, setSelectedTour] = useState(null);

  const handleRemove = async (tourToRemove) => {
    const currentUser = readCurrentUser();
    const updated = favorites.filter((tour) => tour.id !== tourToRemove.id && tour.title !== tourToRemove.title);

    if (!currentUser?.id) {
      setFavorites(updated);
      if (selectedTour?.title === tourToRemove.title) setSelectedTour(null);
      return;
    }

    try {
      const response = await api.put(`/users/${currentUser.id}/favorites`, { favorites: updated });
      setFavorites(response.data?.favorites || updated);
      syncCurrentUser({ ...currentUser, ...response.data, isLoggedIn: true });
      message.success('Tour removed from favorites');
      if (selectedTour?.title === tourToRemove.title) setSelectedTour(null);
    } catch (error) {
      message.error('Could not update favorites on the server');
    }
  };

  const handleClearAll = async () => {
    const currentUser = readCurrentUser();

    if (!currentUser?.id) {
      setFavorites([]);
      return;
    }

    try {
      const response = await api.put(`/users/${currentUser.id}/favorites`, { favorites: [] });
      setFavorites(response.data?.favorites || []);
      syncCurrentUser({ ...currentUser, ...response.data, isLoggedIn: true });
      message.success('Favorites cleared');
    } catch (error) {
      message.error('Could not clear favorites on the server');
    }
  };

  return (
    <main className="favorites-page" style={styles.page}>
      <section className="favorites-hero" style={styles.hero}>
        <div>
          <Text strong className="favorites-eyebrow" style={styles.eyebrow}>TravelPay Favorites</Text>
          <Title level={1} className="favorites-title" style={styles.title}>Избранные туры</Title>
          <Paragraph className="favorites-subtitle" style={styles.subtitle}>
            Сохраняйте лучшие варианты, сравнивайте детали и быстро переходите к бронированию.
          </Paragraph>
        </div>
        <div className="favorites-hero-stat" style={styles.heroStat}>
          <span className="favorites-hero-number" style={styles.heroNumber}>{favorites.length}</span>
          <span className="favorites-hero-label" style={styles.heroLabel}>сохранено</span>
        </div>
      </section>

      <section className="favorites-content" style={styles.content}>
        <div style={styles.toolbar}>
          <Title level={3} className="favorites-section-title" style={{ margin: 0, color: BRAND_BLUE }}>Моя подборка</Title>
          {favorites.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={handleClearAll}>
              Очистить все
            </Button>
          )}
        </div>

        {favorites.length === 0 ? (
          <Card className="favorites-empty-card" style={styles.emptyCard}>
            <Empty
              description="Вы пока не добавили туры в избранное"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" onClick={() => navigate('/tours')} style={styles.primaryButton}>
                Смотреть туры
              </Button>
            </Empty>
          </Card>
        ) : (
          <div style={styles.grid}>
            {favorites.map((tour, index) => (
              <motion.div
                key={`${tour.id || tour.title}-${index}`}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <Card
                  className="favorite-tour-card"
                  hoverable
                  style={styles.card}
                  cover={<img src={tour.image} alt={tour.title} style={styles.image} />}
                  actions={[
                    <Button type="link" icon={<EyeOutlined />} onClick={() => setSelectedTour(tour)}>
                      Детали
                    </Button>,
                    <Button type="link" icon={<ShoppingOutlined />} onClick={() => navigate('/booking', { state: { tour } })}>
                      Бронь
                    </Button>,
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemove(tour)}>
                      Удалить
                    </Button>,
                  ]}
                >
                  <Space orientation="vertical" size={10} style={{ width: '100%' }}>
                    <Tag className="favorite-tour-tag" color="gold" style={styles.tag}>
                      {tour.location || 'Кыргызстан'}
                    </Tag>
                    <Title level={4} className="favorite-tour-title" style={styles.cardTitle}>{tour.title}</Title>
                    <Paragraph ellipsis={{ rows: 2 }} className="favorite-tour-description" style={styles.description}>{tour.description}</Paragraph>
                    <div className="favorite-tour-meta" style={styles.metaRow}>
                      <span><CalendarOutlined /> {tour.duration || 'Срок уточняется'}</span>
                      <strong className="favorite-tour-price">{formatPrice(tour.price)}</strong>
                    </div>
                  </Space>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Modal
        className="favorite-tour-modal"
        rootClassName="favorite-tour-modal-root"
        open={!!selectedTour}
        title={<span className="favorite-tour-modal-title">{selectedTour?.title}</span>}
        onCancel={() => setSelectedTour(null)}
        footer={[
          <Button key="remove" className="favorite-tour-modal-remove" danger onClick={() => handleRemove(selectedTour)}>
            Удалить
          </Button>,
          <Button key="book" className="favorite-tour-modal-book" type="primary" style={styles.primaryButton} onClick={() => navigate('/booking', { state: { tour: selectedTour } })}>
            Забронировать
          </Button>,
        ]}
      >
        {selectedTour && (
          <Space orientation="vertical" size={16} style={{ width: '100%' }}>
            <img className="favorite-tour-modal-image" src={selectedTour.image} alt={selectedTour.title} style={styles.modalImage} />
            <Space className="favorite-tour-modal-tags" wrap>
              <Tag className="favorite-tour-modal-tag" icon={<EnvironmentOutlined />} color="blue">{selectedTour.location || 'Кыргызстан'}</Tag>
              <Tag className="favorite-tour-modal-tag" icon={<CalendarOutlined />} color="gold">{selectedTour.duration || 'Срок уточняется'}</Tag>
              <Tag className="favorite-tour-modal-tag favorite-tour-modal-price" color="green">{formatPrice(selectedTour.price)}</Tag>
            </Space>
            <Paragraph className="favorite-tour-modal-text" style={{ fontSize: 15, lineHeight: 1.7 }}>{selectedTour.description}</Paragraph>
          </Space>
        )}
      </Modal>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    paddingBottom: 60,
  },
  hero: {
    background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #27486f 72%, ${BRAND_GOLD} 100%)`,
    color: '#fff',
    padding: '54px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  eyebrow: {
    color: BRAND_GOLD,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  title: {
    color: '#fff',
    margin: '8px 0',
  },
  subtitle: {
    color: '#dce8f7',
    maxWidth: 620,
    margin: 0,
    fontSize: 16,
  },
  heroStat: {
    minWidth: 150,
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 18,
    padding: '18px 22px',
    textAlign: 'center',
  },
  heroNumber: {
    display: 'block',
    fontSize: 42,
    fontWeight: 950,
    color: BRAND_GOLD,
    lineHeight: 1,
  },
  heroLabel: {
    color: '#fff',
    fontWeight: 800,
  },
  content: {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '28px 20px 0',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 18,
  },
  emptyCard: {
    borderRadius: 14,
    border: 'none',
    boxShadow: '0 14px 34px rgba(29,53,87,0.08)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 320px))',
    gap: 22,
    alignItems: 'stretch',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid rgba(29,53,87,0.08)',
    boxShadow: '0 14px 34px rgba(29,53,87,0.09)',
  },
  image: {
    height: 180,
    width: '100%',
    objectFit: 'cover',
  },
  tag: {
    color: BRAND_BLUE,
    borderColor: 'rgba(252,163,17,0.35)',
    background: 'rgba(252,163,17,0.14)',
    fontWeight: 800,
  },
  cardTitle: {
    color: BRAND_BLUE,
    margin: 0,
    minHeight: 52,
  },
  description: {
    color: '#64748b',
    marginBottom: 0,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    color: '#475569',
  },
  primaryButton: {
    background: BRAND_GOLD,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 900,
  },
  modalImage: {
    width: '100%',
    height: 230,
    objectFit: 'cover',
    borderRadius: 14,
  },
};

export default FavoritesPage;
