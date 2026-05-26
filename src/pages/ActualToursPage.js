import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Rate,
  Row,
  Select,
  Skeleton,
  Slider,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import { readCurrentUser, saveCurrentUser } from '../utils/currentUser';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';

const fallbackTours = [
  {
    id: 'issyk-kul-premium',
    title: 'Issyk-Kul Premium Escape',
    country: 'Kyrgyzstan',
    city: 'Issyk-Kul · Karakol',
    location: 'Issyk-Kul, Kyrgyzstan',
    description: 'Премиальный маршрут вдоль бирюзового озера, ущелий Каракола и панорамных горных дорог.',
    price: 42000,
    rating: 4.9,
    durationDays: 4,
    duration: '4 дня',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    id: 'kolsai-kaindy-private',
    title: 'Kolsai & Kaindy Private Tour',
    country: 'Kazakhstan',
    city: 'Almaty region',
    location: 'Kolsai Lakes, Kazakhstan',
    description: 'Private travel experience к озёрам Кольсай и Каинды с комфортным транспортом и локальным гидом.',
    price: 58000,
    rating: 4.8,
    durationDays: 3,
    duration: '3 дня',
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    id: 'song-kol-nomad',
    title: 'Song-Kol Nomad Experience',
    country: 'Kyrgyzstan',
    city: 'Song-Kol',
    location: 'Song-Kol, Kyrgyzstan',
    description: 'Юрты, лошади, высокогорные пастбища и мягкая luxury-подача настоящей кочевой культуры.',
    price: 36000,
    rating: 4.9,
    durationDays: 3,
    duration: '3 дня',
    image: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    id: 'charyn-almaty-roadtrip',
    title: 'Charyn Canyon Signature Roadtrip',
    country: 'Kazakhstan',
    city: 'Almaty · Charyn Canyon',
    location: 'Charyn Canyon, Kazakhstan',
    description: 'Кинематографичный road trip из Алматы к Чарынскому каньону с остановками для лучших видов.',
    price: 30000,
    rating: 4.7,
    durationDays: 2,
    duration: '2 дня',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    id: 'ala-archa-bishkek',
    title: 'Ala-Archa Alpine Day',
    country: 'Kyrgyzstan',
    city: 'Bishkek · Ala-Archa',
    location: 'Ala-Archa, Kyrgyzstan',
    description: 'Идеальный однодневный alpine escape: ущелье, хвойный воздух, лёгкий треккинг и фотостопы.',
    price: 16000,
    rating: 4.6,
    durationDays: 1,
    duration: '1 день',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    id: 'big-almaty-lake',
    title: 'Big Almaty Lake Premium View',
    country: 'Kazakhstan',
    city: 'Almaty region',
    location: 'Big Almaty Lake, Kazakhstan',
    description: 'Комфортная поездка к высокогорному озеру с премиальным трансфером и мягким темпом.',
    price: 22000,
    rating: 4.8,
    durationDays: 1,
    duration: '1 день',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
    ],
  },
];

const popularDestinations = [
  ['Issyk-Kul', 'Kyrgyzstan', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'],
  ['Kolsai Lakes', 'Kazakhstan', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80'],
  ['Song-Kol', 'Kyrgyzstan', 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=900&q=80'],
  ['Charyn Canyon', 'Kazakhstan', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80'],
];

const formatPrice = (price) => `${Number(price || 0).toLocaleString('ru-RU')} сом`;

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-zа-я0-9]+/gi, '-')
  .replace(/^-+|-+$/g, '');

export const normalizeTour = (tour, index = 0) => {
  const fallback = fallbackTours[index % fallbackTours.length];
  const numericPrice = Number(String(tour.price || fallback.price).replace(/[^0-9]/g, '')) || fallback.price;
  const durationSource = tour.duration || fallback.duration;
  const durationDays = Number(String(tour.durationDays || durationSource).match(/\d+/)?.[0]) || fallback.durationDays;
  const country = tour.country || (String(tour.location || '').toLowerCase().includes('almaty') || String(tour.location || '').toLowerCase().includes('kaz') ? 'Kazakhstan' : fallback.country);

  return {
    ...fallback,
    ...tour,
    id: tour.id || slugify(tour.title) || fallback.id,
    title: tour.title || fallback.title,
    country,
    city: tour.city || tour.location || fallback.city,
    location: tour.location || fallback.location,
    description: tour.description || fallback.description,
    price: numericPrice,
    rating: Number(tour.rating || fallback.rating),
    durationDays,
    duration: tour.duration || `${durationDays} дня`,
    image: tour.image || fallback.image,
    gallery: tour.gallery?.length ? tour.gallery : fallback.gallery,
  };
};

const ActualToursPage = ({ favorites = [], setFavorites }) => {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 70000]);
  const [durationRange, setDurationRange] = useState([1, 7]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const response = await api.get('/tours');
        const source = response.data?.length ? response.data : fallbackTours;
        setTours(source.map(normalizeTour));
      } catch (error) {
        setTours(fallbackTours.map(normalizeTour));
        message.info('Сервер недоступен, показаны демо-туры.');
      } finally {
        setLoading(false);
      }
    };

    loadTours();
  }, []);

  const filteredTours = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tours.filter((tour) => {
      const haystack = `${tour.title} ${tour.description} ${tour.location} ${tour.country} ${tour.city}`.toLowerCase();
      const matchesSearch = haystack.includes(query);
      const matchesCountry = country === 'all' || tour.country === country;
      const matchesPrice = tour.price >= priceRange[0] && tour.price <= priceRange[1];
      const matchesDuration = tour.durationDays >= durationRange[0] && tour.durationDays <= durationRange[1];
      const matchesRating = tour.rating >= minRating;
      return matchesSearch && matchesCountry && matchesPrice && matchesDuration && matchesRating;
    });
  }, [tours, searchQuery, country, priceRange, durationRange, minRating]);

  const handleAddToFavorites = (tour) => {
    if (favorites.some((favorite) => favorite.id === tour.id || favorite.title === tour.title)) {
      message.info('Этот тур уже есть в избранном.');
      return;
    }

    const updatedFavorites = [...favorites, tour];
    const currentUser = readCurrentUser();

    if (!currentUser?.id) {
      message.info('Войдите в аккаунт, чтобы сохранять туры в избранное.');
      navigate('/login');
      return;
    }

    api.put(`/users/${currentUser.id}/favorites`, { favorites: updatedFavorites })
      .then((response) => {
        setFavorites(response.data?.favorites || updatedFavorites);
        saveCurrentUser({ ...currentUser, ...response.data, isLoggedIn: true });
        message.success('Тур добавлен в избранное.');
      })
      .catch((err) => {
        const serverMessage = err.response?.data?.message;
        message.error(serverMessage || 'Не удалось сохранить избранное на сервере.');
      });
  };

  const openTour = (tour) => navigate(`/tours/${tour.id}`, { state: { tour, tours } });

  return (
    <main className="tours-page" style={styles.page}>
      <section style={styles.hero}>
        <video autoPlay muted loop playsInline style={styles.heroVideo}>
          <source src="https://videos.pexels.com/video-files/854976/854976-hd_1920_1080_30fps.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2021/08/10/84776-587945089_large.mp4" type="video/mp4" />
        </video>
        <div style={styles.heroOverlay} />
        <motion.div style={styles.heroContent} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <Tag style={styles.heroTag}>Luxury Travel Platform</Tag>
          <Title style={styles.heroTitle}>Премиальные туры по Кыргызстану и региону Алматы</Title>
          <Paragraph style={styles.heroText}>
            Выбирайте маршруты с красивыми локациями, локальными гидами, комфортным транспортом и AI Concierge поддержкой.
          </Paragraph>
        </motion.div>
      </section>

      <motion.section className="tour-filters-shell" style={styles.filters} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Input
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Поиск: Иссык-Куль, Кольсай, Алматы..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={styles.search}
        />
        <Select
          size="large"
          value={country}
          onChange={setCountry}
          style={styles.select}
          options={[
            { value: 'all', label: 'Все страны' },
            { value: 'Kyrgyzstan', label: 'Кыргызстан' },
            { value: 'Kazakhstan', label: 'Казахстан / Алматы' },
          ]}
        />
        <div style={styles.filterPanel}>
          <Text strong>Цена</Text>
          <Slider range min={0} max={70000} step={5000} value={priceRange} onChange={setPriceRange} tooltip={{ formatter: formatPrice }} />
        </div>
        <div style={styles.filterPanel}>
          <Text strong>Длительность</Text>
          <Slider range min={1} max={7} value={durationRange} onChange={setDurationRange} tooltip={{ formatter: (value) => `${value} дн.` }} />
        </div>
        <div style={styles.filterPanel}>
          <Text strong>Рейтинг</Text>
          <Rate allowHalf value={minRating} onChange={setMinRating} style={{ color: BRAND_GOLD, fontSize: 16 }} />
        </div>
      </motion.section>

      <section style={styles.popularSection}>
        <div style={styles.sectionHead}>
          <Tag style={styles.softTag}>Популярные направления</Tag>
          <Title level={2} style={styles.sectionTitle}>Места, ради которых хочется ехать</Title>
        </div>
        <div style={styles.destinationStrip}>
          {popularDestinations.map(([name, label, image]) => (
            <motion.button key={name} type="button" style={styles.destinationPill} whileHover={{ y: -5 }} onClick={() => setSearchQuery(name)}>
              <img src={image} alt={name} style={styles.destinationPillImage} />
              <span>
                <strong>{name}</strong>
                <small>{label}</small>
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      <section style={styles.catalog}>
        <div className="tour-catalog-head" style={styles.catalogHead}>
          <div>
            <Tag style={styles.softTag}><ThunderboltOutlined /> Найдено {filteredTours.length}</Tag>
            <Title level={2} style={styles.sectionTitle}>Каталог туров</Title>
          </div>
          <Button onClick={() => navigate('/favorites')} icon={<HeartOutlined />} style={styles.favoritesButton}>
            Избранное
          </Button>
        </div>

        {loading ? (
          <Row gutter={[24, 24]}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Col xs={24} md={12} xl={8} key={item}>
                <Card style={styles.card}><Skeleton active paragraph={{ rows: 5 }} /></Card>
              </Col>
            ))}
          </Row>
        ) : filteredTours.length === 0 ? (
          <Empty description="Туры не найдены. Попробуйте изменить фильтры." style={styles.empty} />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredTours.map((tour, index) => (
              <Col xs={24} md={12} xl={8} key={tour.id || tour.title}>
                <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} whileHover={{ y: -8, scale: 1.01 }}>
                  <Card
                    hoverable
                    className="premium-tour-card"
                    style={styles.card}
                    bodyStyle={{ padding: 0 }}
                    onClick={() => openTour(tour)}
                  >
                    <div style={styles.imageWrap}>
                      <img src={tour.image} alt={tour.title} style={styles.image} />
                      <div style={styles.imageShade} />
                      <Badge count={`${tour.rating}`} style={styles.ratingBadge} />
                      <div className="tour-card-reveal" style={styles.reveal}>
                        <span>Гид · трансфер · фото-локации · поддержка</span>
                      </div>
                    </div>
                    <div style={styles.cardBody}>
                      <Space size={8} wrap>
                        <Tag style={styles.countryTag}><EnvironmentOutlined /> {tour.city}</Tag>
                        <Tag style={styles.durationTag}><CalendarOutlined /> {tour.duration}</Tag>
                      </Space>
                      <Title level={3} style={styles.cardTitle}>{tour.title}</Title>
                      <Paragraph ellipsis={{ rows: 2 }} style={styles.description}>{tour.description}</Paragraph>
                      <div style={styles.cardFooter}>
                        <div>
                          <Text style={styles.priceLabel}>от</Text>
                          <div style={styles.price}>{formatPrice(tour.price)}</div>
                        </div>
                        <Space>
                          <Button shape="circle" icon={<HeartOutlined />} onClick={(event) => { event.stopPropagation(); handleAddToFavorites(tour); }} />
                          <Button type="primary" style={styles.detailsButton} onClick={(event) => { event.stopPropagation(); openTour(tour); }}>
                            Подробнее
                          </Button>
                        </Space>
                      </div>
                      <div style={styles.ratingLine}>
                        <Rate disabled allowHalf value={tour.rating} style={{ color: BRAND_GOLD, fontSize: 14 }} />
                        <Text type="secondary">{tour.rating} · проверенный маршрут</Text>
                      </div>
                    </div>
                  </Card>
                </motion.article>
              </Col>
            ))}
          </Row>
        )}
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 8% 8%, rgba(22,182,196,0.10), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #eef5fb 48%, #f9fbff 100%)',
    color: BRAND_BLUE,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    paddingBottom: 72,
  },
  hero: {
    position: 'relative',
    minHeight: 520,
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    padding: '120px 24px 96px',
    marginTop: -72,
  },
  heroVideo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'saturate(1.08) contrast(1.04) brightness(0.86)',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(5,13,24,0.34), rgba(5,13,24,0.72)), radial-gradient(circle at 50% 40%, rgba(255,255,255,0.07), transparent 32%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 880,
    textAlign: 'center',
    color: '#fff',
  },
  heroTag: {
    borderRadius: 999,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.14)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.24)',
    backdropFilter: 'blur(18px)',
    fontWeight: 800,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 'clamp(36px, 5vw, 68px)',
    lineHeight: 1.04,
    fontWeight: 820,
    margin: '22px auto 18px',
    textShadow: '0 20px 70px rgba(0,0,0,0.36)',
  },
  heroText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 18,
    lineHeight: 1.7,
    maxWidth: 720,
    margin: '0 auto',
  },
  filters: {
    maxWidth: 1180,
    margin: '-48px auto 42px',
    position: 'relative',
    zIndex: 4,
    display: 'grid',
    gridTemplateColumns: '1.4fr 220px repeat(3, 1fr)',
    gap: 16,
    padding: 18,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(255,255,255,0.72)',
    boxShadow: '0 28px 78px rgba(29,53,87,0.14)',
    backdropFilter: 'blur(22px)',
  },
  search: {
    borderRadius: 18,
  },
  select: {
    width: '100%',
  },
  filterPanel: {
    minWidth: 0,
    padding: '3px 8px',
  },
  popularSection: {
    maxWidth: 1180,
    margin: '0 auto',
    padding: '18px 24px 58px',
  },
  sectionHead: {
    textAlign: 'center',
    marginBottom: 26,
  },
  softTag: {
    borderRadius: 999,
    padding: '6px 12px',
    color: BRAND_BLUE,
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(29,53,87,0.08)',
    fontWeight: 800,
  },
  sectionTitle: {
    color: BRAND_BLUE,
    fontWeight: 840,
    marginTop: 14,
  },
  destinationStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
  },
  destinationPill: {
    border: '1px solid rgba(29,53,87,0.08)',
    borderRadius: 24,
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(255,255,255,0.86)',
    boxShadow: '0 18px 44px rgba(29,53,87,0.08)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  destinationPillImage: {
    width: 62,
    height: 62,
    borderRadius: 18,
    objectFit: 'cover',
  },
  catalog: {
    maxWidth: 1180,
    margin: '0 auto',
    padding: '0 24px',
  },
  catalogHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  favoritesButton: {
    borderRadius: 999,
    height: 42,
    fontWeight: 800,
  },
  empty: {
    padding: 80,
    background: 'rgba(255,255,255,0.72)',
    borderRadius: 28,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 30,
    border: '1px solid rgba(29,53,87,0.08)',
    background: 'rgba(255,255,255,0.90)',
    boxShadow: '0 24px 70px rgba(29,53,87,0.10)',
  },
  imageWrap: {
    position: 'relative',
    height: 250,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  imageShade: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.48))',
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    background: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 900,
  },
  reveal: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    padding: '10px 12px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.16)',
    color: '#fff',
    backdropFilter: 'blur(16px)',
    fontWeight: 750,
  },
  cardBody: {
    padding: 22,
  },
  countryTag: {
    borderRadius: 999,
    color: BRAND_BLUE,
    background: 'rgba(22,182,196,0.10)',
    border: '1px solid rgba(22,182,196,0.18)',
    fontWeight: 750,
  },
  durationTag: {
    borderRadius: 999,
    color: BRAND_BLUE,
    background: 'rgba(252,163,17,0.12)',
    border: '1px solid rgba(252,163,17,0.20)',
    fontWeight: 750,
  },
  cardTitle: {
    color: BRAND_BLUE,
    margin: '16px 0 8px',
    fontWeight: 840,
    lineHeight: 1.15,
  },
  description: {
    color: '#64748b',
    lineHeight: 1.65,
    minHeight: 52,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    marginTop: 18,
  },
  priceLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 800,
  },
  price: {
    color: BRAND_BLUE,
    fontSize: 22,
    fontWeight: 900,
  },
  detailsButton: {
    borderRadius: 999,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 850,
  },
  ratingLine: {
    marginTop: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
};

export default ActualToursPage;
