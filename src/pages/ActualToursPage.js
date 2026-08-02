import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Empty,
  Rate,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  FireOutlined,
  HeartOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import CompanyBadge from '../components/CompanyBadge';
import AppImage from '../components/AppImage';
import { readCurrentUser } from '../utils/currentUser';
import { syncCurrentUser } from '../utils/user';
import { KYRGYZSTAN_TOUR_SPOTS, TOUR_IMAGE_FALLBACK } from '../utils/tourMedia';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#173B61';
const BRAND_GOLD = '#FCA311';

const promoBadges = [
  { label: 'Горящий тур', note: 'Скидка до конца недели', color: '#FF6B35' },
  { label: 'Хит продаж', note: 'Популярно у семей', color: '#2563EB' },
  { label: 'Скидка', note: 'Осталось 3 места', color: '#FCA311' },
  { label: 'Новинка', note: 'Лучшее время для поездки', color: '#2BB8C5' },
  { label: 'Лучший выбор', note: 'Маршрут проверен TravelPay', color: '#7C3AED' },
];

const fallbackTours = [
  {
    id: 'issyk-kul-premium',
    title: 'Issyk-Kul Premium Escape',
    country: 'Kyrgyzstan',
    city: 'Issyk-Kul · Karakol',
    location: 'Issyk-Kul, Kyrgyzstan',
    description: 'Премиальный маршрут по береговой линии Иссык-Куля с красивыми остановками и мягким travel pace.',
    price: 42000,
    rating: 4.9,
    durationDays: 4,
    duration: '4 дня',
    image: KYRGYZSTAN_TOUR_SPOTS[1].image,
    gallery: [KYRGYZSTAN_TOUR_SPOTS[1].image, KYRGYZSTAN_TOUR_SPOTS[3].image, KYRGYZSTAN_TOUR_SPOTS[4].image],
  },
  {
    id: 'son-kul-nomad',
    title: 'Son-Kul Nomad Experience',
    country: 'Kyrgyzstan',
    city: 'Son-Kul',
    location: 'Son-Kul, Kyrgyzstan',
    description: 'Юрты, лошади, high-altitude meadows и атмосферный nomad-luxury отдых.',
    price: 36000,
    rating: 4.9,
    durationDays: 3,
    duration: '3 дня',
    image: KYRGYZSTAN_TOUR_SPOTS[2].image,
    gallery: [KYRGYZSTAN_TOUR_SPOTS[2].image, KYRGYZSTAN_TOUR_SPOTS[5].image, KYRGYZSTAN_TOUR_SPOTS[0].image],
  },
  {
    id: 'ala-archa-day',
    title: 'Ala-Archa Alpine Day',
    country: 'Kyrgyzstan',
    city: 'Bishkek · Ala-Archa',
    location: 'Ala-Archa, Kyrgyzstan',
    description: 'Идеальный однодневный alpine escape с комфортным трансфером и фотогеничными видами.',
    price: 16000,
    rating: 4.8,
    durationDays: 1,
    duration: '1 день',
    image: KYRGYZSTAN_TOUR_SPOTS[0].image,
    gallery: [KYRGYZSTAN_TOUR_SPOTS[0].image, KYRGYZSTAN_TOUR_SPOTS[3].image, KYRGYZSTAN_TOUR_SPOTS[4].image],
  },
  {
    id: 'jeti-oguz-scenic',
    title: 'Jeti-Oguz Scenic Route',
    country: 'Kyrgyzstan',
    city: 'Jeti-Oguz',
    location: 'Jeti-Oguz, Kyrgyzstan',
    description: 'Красные скалы, мягкий roadtrip и горные локации для scenic-photo маршрута.',
    price: 24000,
    rating: 4.8,
    durationDays: 2,
    duration: '2 дня',
    image: KYRGYZSTAN_TOUR_SPOTS[4].image,
    gallery: [KYRGYZSTAN_TOUR_SPOTS[4].image, KYRGYZSTAN_TOUR_SPOTS[1].image, KYRGYZSTAN_TOUR_SPOTS[3].image],
  },
  {
    id: 'karakol-active',
    title: 'Karakol Adventure Base',
    country: 'Kyrgyzstan',
    city: 'Karakol',
    location: 'Karakol, Kyrgyzstan',
    description: 'Горная база для trekking, lifestyle-отдыха и восточного Иссык-Куля.',
    price: 39000,
    rating: 4.7,
    durationDays: 3,
    duration: '3 дня',
    image: KYRGYZSTAN_TOUR_SPOTS[3].image,
    gallery: [KYRGYZSTAN_TOUR_SPOTS[3].image, KYRGYZSTAN_TOUR_SPOTS[1].image, KYRGYZSTAN_TOUR_SPOTS[0].image],
  },
  {
    id: 'arslanbob-forest',
    title: 'Arslanbob Forest Escape',
    country: 'Kyrgyzstan',
    city: 'Arslanbob',
    location: 'Arslanbob, Kyrgyzstan',
    description: 'Ореховые леса, водопады и южный Кыргызстан в спокойном boutique-формате.',
    price: 28000,
    rating: 4.7,
    durationDays: 2,
    duration: '2 дня',
    image: KYRGYZSTAN_TOUR_SPOTS[5].image,
    gallery: [KYRGYZSTAN_TOUR_SPOTS[5].image, KYRGYZSTAN_TOUR_SPOTS[2].image, KYRGYZSTAN_TOUR_SPOTS[0].image],
  },
];

const formatPrice = (price) => `${Number(price || 0).toLocaleString('ru-RU')} сом`;

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-zа-я0-9]+/gi, '-')
  .replace(/^-+|-+$/g, '');

const getPromoBadge = (index) => promoBadges[index % promoBadges.length];

export const normalizeTour = (tour, index = 0) => {
  const fallback = fallbackTours[index % fallbackTours.length];
  const numericPrice = Number(String(tour.price || fallback.price).replace(/[^0-9]/g, '')) || fallback.price;
  const durationSource = tour.duration || fallback.duration;
  const durationDays = Number(String(tour.durationDays || durationSource).match(/\d+/)?.[0]) || fallback.durationDays;
  const badge = getPromoBadge(index);

  return {
    ...fallback,
    ...tour,
    id: tour.id || slugify(tour.title) || fallback.id,
    title: tour.title || fallback.title,
    country: tour.country || 'Kyrgyzstan',
    city: tour.city || tour.location || fallback.city,
    location: tour.location || fallback.location,
    description: tour.description || fallback.description,
    price: numericPrice,
    rating: Number(tour.rating || fallback.rating),
    durationDays,
    duration: tour.duration || `${durationDays} дня`,
    image: tour.image || fallback.image || TOUR_IMAGE_FALLBACK,
    gallery: tour.gallery?.length ? tour.gallery : fallback.gallery,
    promoBadge: badge.label,
    promoNote: badge.note,
    promoColor: badge.color,
    hasAccommodation: Boolean(tour.hasAccommodation),
    accommodations: Array.isArray(tour.accommodations) ? tour.accommodations : [],
    companyId: tour.companyId || null,
    companyName: tour.companyName || 'TravelPay Partner',
    companyLogo: tour.companyLogo || '',
    companyCity: tour.companyCity || tour.city || 'Kyrgyzstan',
    companyVerified: Boolean(tour.companyVerified),
    createdByBusiness: Boolean(tour.createdByBusiness),
  };
};

const ActualToursPage = ({ favorites = [], setFavorites }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState(location.state?.companyFilter ? String(location.state.companyFilter) : 'all');
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === 'undefined' ? 1200 : window.innerWidth,
  );

  const isTablet = viewportWidth <= 900;
  const isMobile = viewportWidth <= 640;
  const isNarrow = viewportWidth <= 420;

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

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hotTours = useMemo(
    () => [...tours].sort((a, b) => b.rating - a.rating || a.price - b.price).slice(0, 3),
    [tours],
  );

  const companyOptions = useMemo(() => {
    const seen = new Map();
    tours.forEach((tour) => {
      const key = String(tour.companyId || tour.companyName || 'partner');
      if (!seen.has(key)) {
        seen.set(key, {
          value: key,
          label: tour.companyName || 'TravelPay Partner',
        });
      }
    });
    return [{ value: 'all', label: 'Все компании' }, ...Array.from(seen.values())];
  }, [tours]);

  const visibleTours = useMemo(() => {
    if (companyFilter === 'all') return tours;
    return tours.filter((tour) => String(tour.companyId || tour.companyName || 'partner') === companyFilter);
  }, [companyFilter, tours]);

  const featuredTours = useMemo(
    () => hotTours.length ? hotTours : fallbackTours.slice(0, 3).map(normalizeTour),
    [hotTours],
  );

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
        syncCurrentUser({ ...currentUser, ...response.data, isLoggedIn: true });
        message.success('Тур добавлен в избранное.');
      })
      .catch((error) => {
        message.error(error.response?.data?.message || 'Не удалось сохранить избранное.');
      });
  };

  const openTour = (tour) => navigate(`/tours/${tour.id}`, { state: { tour, tours } });

  const openBooking = (tour) => {
    const currentUser = readCurrentUser();

    if (!currentUser?.id || !currentUser?.isLoggedIn) {
      message.warning('Войдите в аккаунт, чтобы забронировать тур');
      navigate('/login', { state: { redirectTo: '/tour-booking', tour } });
      return;
    }

    navigate('/tour-booking', { state: { tour } });
  };

  const scrollToGrid = () => {
    document.getElementById('travelpay-tour-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToHotDeals = () => {
    document.getElementById('travelpay-hot-tours')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="tours-page premium-tour-page-shell" style={styles.page}>
      <section className="premium-tours-hero" style={{ ...styles.hero, ...(isMobile ? styles.heroMobile : {}) }}>
        <div
          className="premium-tours-hero__video"
          style={styles.heroVideo}
          aria-hidden="true"
        />
        <div className="premium-tours-hero__overlay" style={styles.heroOverlay} />

        <motion.div
          style={{ ...styles.heroContent, ...(isMobile ? styles.heroContentMobile : {}) }}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72 }}
        >
          <Tag style={{ ...styles.heroTag, ...(isNarrow ? styles.heroTagMobile : {}) }}>TravelPay Premium Tours</Tag>
          <Title style={{ ...styles.heroTitle, ...(isMobile ? styles.heroTitleMobile : {}) }}>Выберите тур мечты</Title>
          <Paragraph style={{ ...styles.heroText, ...(isMobile ? styles.heroTextMobile : {}) }}>
            Горящие предложения, проверенные маршруты и удобное накопление через TravelPay.
            От Иссык-Куля до Сон-Куля с красивой подачей, понятной ценой и быстрым бронированием.
          </Paragraph>
          <Space className="premium-tour-cta-stack" size={14} wrap style={{ ...styles.heroButtons, ...(isMobile ? styles.heroButtonsMobile : {}) }}>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              className="travelpay-primary-button"
              style={styles.heroPrimaryButton}
              onClick={scrollToGrid}
            >
              Смотреть туры
            </Button>
            <Button
              size="large"
              icon={<FireOutlined />}
              className="travelpay-secondary-button"
              style={styles.heroSecondaryButton}
              onClick={scrollToHotDeals}
            >
              Горящие предложения
            </Button>
          </Space>
        </motion.div>
      </section>

      <div className="premium-tours-overlap" style={{ ...styles.overlapShell, ...(isMobile ? styles.overlapShellMobile : {}) }}>
        <section id="travelpay-hot-tours" className="tours-section tours-container" style={styles.hotSection}>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ ...styles.hotCard, ...(isMobile ? styles.hotCardMobile : {}) }}
          >
            <div style={styles.hotGlow} />
            <div style={{ ...styles.hotContent, ...(isTablet ? styles.hotContentTablet : {}), ...(isMobile ? styles.hotContentMobile : {}) }}>
              <div style={styles.hotCopy}>
                <Tag style={{ ...styles.promoTag, ...(isMobile ? styles.promoTagMobile : {}) }}><FireOutlined /> Горящие туры недели</Tag>
                <Title level={2} style={{ ...styles.promoTitle, ...(isMobile ? styles.promoTitleMobile : {}) }}>Ловите лучшее окно для поездки по Кыргызстану</Title>
                <Paragraph style={{ ...styles.promoText, ...(isMobile ? styles.promoTextMobile : {}) }}>
                  Премиальные маршруты с быстрым бронированием, визуально красивой подачей и специальными условиями на ближайшие даты.
                </Paragraph>
              </div>
              <div className="hot-tour-marquee" style={{ ...styles.hotStats, ...(isTablet ? styles.hotStatsTablet : {}), ...(isMobile ? styles.hotStatsMobile : {}) }}>
                <div style={{ ...styles.hotStatCard, ...(isMobile ? styles.hotStatCardMobile : {}) }}>
                  <span style={styles.hotStatValue}>-20%</span>
                  <span style={styles.hotStatLabel}>на selected routes</span>
                </div>
                <div style={{ ...styles.hotStatCard, ...(isMobile ? styles.hotStatCardMobile : {}) }}>
                  <span style={styles.hotStatValue}>3 места</span>
                  <span style={styles.hotStatLabel}>осталось на выезд</span>
                </div>
                <div style={{ ...styles.hotStatCard, ...(isMobile ? styles.hotStatCardMobile : {}) }}>
                  <span style={styles.hotStatValue}>2 дня</span>
                  <span style={styles.hotStatLabel}>до конца акции</span>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                className="travelpay-primary-button"
                style={styles.promoButton}
                onClick={scrollToGrid}
              >
                Смотреть предложения
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="tours-section tours-container tours-instagram-section" style={styles.catalog}>
          <div className="tour-catalog-head" style={styles.catalogHead}>
            <div>
              <Tag style={styles.softTag}><ThunderboltOutlined /> Все туры</Tag>
              <Title level={2} style={styles.catalogTitle}>Подберите формат путешествия под свой ритм</Title>
              <Paragraph style={styles.catalogText}>
                Реальные направления, удобное бронирование и премиальная подача без лишних фильтров и перегруженных блоков.
              </Paragraph>
            </div>
            <Select
              value={companyFilter}
              onChange={setCompanyFilter}
              options={companyOptions}
              style={styles.companyFilter}
              popupMatchSelectWidth={false}
            />
            <Button
              onClick={() => navigate('/favorites')}
              icon={<HeartOutlined />}
              className="travelpay-secondary-button"
              style={styles.favoritesButton}
            >
              Избранное
            </Button>
          </div>

          {loading ? (
            <div className="tours-grid" style={{ ...styles.toursGrid, ...(isTablet ? styles.toursGridTablet : {}), ...(isMobile ? styles.toursGridMobile : {}) }}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card className="tour-card" style={styles.card} key={item}>
                  <Skeleton active paragraph={{ rows: 5 }} />
                </Card>
              ))}
            </div>
          ) : visibleTours.length === 0 ? (
            <Empty description="Туры пока не найдены. Попробуйте вернуться чуть позже." style={styles.empty} />
          ) : (
            <div id="travelpay-tour-grid" className="tours-grid tours-instagram-feed" style={{ ...styles.toursGrid, ...(isTablet ? styles.toursGridTablet : {}), ...(isMobile ? styles.toursGridMobile : {}) }}>
              {visibleTours.map((tour, index) => {
                const isHot = featuredTours.some((featured) => featured.id === tour.id);

                return (
                  <motion.article
                    className="tour-card-shell"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -8 }}
                    key={tour.id || tour.title}
                  >
                    <Card
                      hoverable
                      className="premium-tour-card tour-card"
                      style={styles.card}
                      styles={{ body: { padding: 0 } }}
                      onClick={() => openTour(tour)}
                    >
                      <div style={{ ...styles.imageWrap, ...(isMobile ? styles.imageWrapMobile : {}) }}>
                        <AppImage src={tour.image || TOUR_IMAGE_FALLBACK} alt={tour.title} aspectRatio="16 / 10" imgStyle={styles.image} />
                        <div style={styles.imageShade} />
                        <div style={{ ...styles.promoBadge, background: tour.promoColor }}>
                          {tour.promoBadge}
                        </div>
                        {isHot && (
                          <div style={styles.hotCornerBadge}>
                            <FireOutlined /> Hot
                          </div>
                        )}
                        <Badge count={tour.rating.toFixed(1)} style={styles.ratingBadge} />
                        <div className="tour-card-reveal" style={styles.reveal}>
                          <span>Гид · комфортный трансфер · красивые фото-локации</span>
                        </div>
                      </div>

                      <div style={{ ...styles.cardBody, ...(isMobile ? styles.cardBodyMobile : {}) }}>
                        <div style={styles.cardTopLine}>
                          <Tag className="tour-card-meta" style={styles.countryTag}>
                            <EnvironmentOutlined /> {tour.city}
                          </Tag>
                          <span style={styles.verifiedPill}>
                            <ThunderboltOutlined /> Premium route
                          </span>
                        </div>

                        <CompanyBadge
                          companyId={tour.companyId}
                          companyName={tour.companyName}
                          companyLogo={tour.companyLogo}
                          companyCity={tour.companyCity}
                          companyVerified={tour.companyVerified}
                          size="compact"
                          variant="glass"
                        />

                        <Title level={3} className="tour-card-title" style={styles.cardTitle}>{tour.title}</Title>
                        <Paragraph ellipsis={{ rows: 2 }} className="tour-card-text" style={styles.description}>
                          {tour.description}
                        </Paragraph>

                        <div className="tour-card-meta-grid" style={styles.metaGrid}>
                          <div style={styles.metaTile}>
                            <CalendarOutlined />
                            <span>{tour.duration}</span>
                          </div>
                          <div style={styles.metaTile}>
                            <EnvironmentOutlined />
                            <span>{tour.location || tour.city}</span>
                          </div>
                        </div>

                        <div style={styles.cardFooter}>
                          <div>
                            <Text style={styles.priceLabel}>от</Text>
                            <div className="tour-price" style={styles.price}>{formatPrice(tour.price)}</div>
                            <div style={styles.priceNote}>{tour.promoNote}</div>
                          </div>
                          <div className="tour-card-actions">
                            <Button
                              className="tour-card-favorite"
                              shape="circle"
                              icon={<HeartOutlined />}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleAddToFavorites(tour);
                              }}
                            />
                            <Button
                              className="travelpay-secondary-button"
                              style={styles.bookButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                openBooking(tour);
                              }}
                            >
                              Забронировать
                            </Button>
                            <Button
                              type="primary"
                              className="travelpay-primary-button"
                              style={styles.detailsButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                openTour(tour);
                              }}
                            >
                              Подробнее
                            </Button>
                          </div>
                        </div>

                        <div className="tour-card-meta" style={styles.ratingLine}>
                          <Rate disabled allowHalf value={tour.rating} style={{ color: BRAND_GOLD, fontSize: 14 }} />
                          <Text type="secondary">{tour.rating} · проверенный маршрут</Text>
                        </div>
                      </div>
                    </Card>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 8% 12%, rgba(43,184,197,0.12), transparent 24%), radial-gradient(circle at 88% 18%, rgba(252,163,17,0.14), transparent 22%), linear-gradient(180deg, #F4F8FD 0%, #EAF2FA 45%, #F8FBFF 100%)',
    color: BRAND_BLUE,
    paddingBottom: 96,
  },
  hero: {
    position: 'relative',
    minHeight: '86vh',
    marginTop: -88,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '140px 20px 130px',
  },
  heroMobile: {
    minHeight: 'auto',
    padding: '116px 14px 96px',
  },
  heroVideo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("/images/kyrgyzstan-mountains.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    width: 'min(100%, 880px)',
    margin: '0 auto',
    textAlign: 'center',
    color: '#FFFFFF',
    padding: '36px clamp(18px, 5vw, 42px)',
    borderRadius: 34,
    background: 'linear-gradient(180deg, rgba(8,19,33,0.34), rgba(8,19,33,0.18))',
    border: '1px solid rgba(255,255,255,0.16)',
    boxShadow: '0 28px 90px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(18px)',
  },
  heroContentMobile: {
    padding: '24px 16px',
    borderRadius: 24,
  },
  heroTag: {
    borderRadius: 999,
    padding: '8px 16px',
    marginBottom: 18,
    background: 'rgba(255,255,255,0.14)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.16)',
    fontWeight: 800,
    letterSpacing: 0.2,
  },
  heroTagMobile: {
    maxWidth: '100%',
    whiteSpace: 'normal',
    textAlign: 'center',
    lineHeight: 1.25,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 'clamp(38px, 6vw, 72px)',
    lineHeight: 1.02,
    fontWeight: 900,
    margin: '0 0 16px',
    textShadow: '0 20px 50px rgba(0,0,0,0.24)',
  },
  heroTitleMobile: {
    fontSize: 34,
    lineHeight: 1.08,
  },
  heroText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 'clamp(16px, 2vw, 19px)',
    lineHeight: 1.72,
    maxWidth: 700,
    margin: '0 auto',
  },
  heroTextMobile: {
    fontSize: 15,
    lineHeight: 1.55,
  },
  heroButtons: {
    justifyContent: 'center',
    marginTop: 28,
  },
  heroButtonsMobile: {
    width: '100%',
  },
  heroPrimaryButton: {
    minWidth: 186,
    height: 50,
    borderRadius: 16,
    fontWeight: 800,
  },
  heroSecondaryButton: {
    minWidth: 186,
    height: 50,
    borderRadius: 16,
    fontWeight: 800,
    background: 'rgba(255,255,255,0.16)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
    backdropFilter: 'blur(14px)',
  },
  overlapShell: {
    position: 'relative',
    zIndex: 2,
    marginTop: -88,
  },
  overlapShellMobile: {
    marginTop: -42,
  },
  hotSection: {
    width: 'min(100% - 32px, 1200px)',
    margin: '0 auto 34px',
  },
  hotCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 30,
    background: 'linear-gradient(135deg, rgba(10,25,47,0.92), rgba(19,59,97,0.9) 48%, rgba(43,123,185,0.82))',
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 30px 90px rgba(11,31,52,0.22)',
    backdropFilter: 'blur(20px)',
  },
  hotCardMobile: {
    borderRadius: 22,
  },
  hotGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: '50%',
    background: 'rgba(252,163,17,0.28)',
    filter: 'blur(42px)',
    top: -80,
    right: -40,
  },
  hotContent: {
    position: 'relative',
    zIndex: 1,
    padding: '30px clamp(20px, 4vw, 38px)',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.9fr)',
    gap: 24,
    alignItems: 'center',
  },
  hotContentTablet: {
    gridTemplateColumns: '1fr',
  },
  hotContentMobile: {
    padding: '22px 16px',
    gap: 18,
  },
  hotCopy: {
    minWidth: 0,
  },
  promoTag: {
    width: 'fit-content',
    borderRadius: 999,
    padding: '7px 13px',
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.16)',
    fontWeight: 800,
    marginBottom: 14,
  },
  promoTagMobile: {
    maxWidth: '100%',
    whiteSpace: 'normal',
    lineHeight: 1.25,
  },
  promoTitle: {
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: 900,
  },
  promoTitleMobile: {
    fontSize: 26,
    lineHeight: 1.14,
  },
  promoText: {
    maxWidth: 620,
    color: 'rgba(255,255,255,0.84)',
    lineHeight: 1.72,
    marginBottom: 0,
  },
  promoTextMobile: {
    fontSize: 14,
    lineHeight: 1.55,
  },
  hotStats: {
    display: 'grid',
    gap: 12,
  },
  hotStatsTablet: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  hotStatsMobile: {
    gridTemplateColumns: '1fr',
  },
  hotStatsNarrow: {
    gridTemplateColumns: '1fr',
  },
  hotStatCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '16px 18px',
    borderRadius: 22,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 16px 34px rgba(0,0,0,0.14)',
    backdropFilter: 'blur(16px)',
  },
  hotStatCardMobile: {
    minWidth: 0,
    padding: '14px 15px',
  },
  hotStatValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1.1,
  },
  hotStatLabel: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 13,
    fontWeight: 600,
  },
  promoButton: {
    width: 'fit-content',
    height: 48,
    marginTop: 8,
    borderRadius: 16,
    fontWeight: 800,
  },
  popularSection: {
    width: 'min(100% - 32px, 1200px)',
    margin: '0 auto',
    padding: '8px 0 48px',
  },
  sectionHead: {
    textAlign: 'center',
    marginBottom: 26,
  },
  softTag: {
    borderRadius: 999,
    padding: '6px 12px',
    color: BRAND_BLUE,
    background: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(23,59,97,0.08)',
    fontWeight: 800,
  },
  sectionTitle: {
    color: BRAND_BLUE,
    fontSize: 'clamp(28px, 5vw, 48px)',
    lineHeight: 1.1,
    fontWeight: 900,
    marginTop: 14,
  },
  destinationStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
    gap: 16,
  },
  destinationStripMobile: {
    gridTemplateColumns: '1fr',
    gap: 12,
  },
  destinationPill: {
    width: '100%',
    height: 'auto',
    padding: 10,
    borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.55)',
    background: 'rgba(255,255,255,0.72)',
    boxShadow: '0 18px 44px rgba(23,59,97,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    textAlign: 'left',
    backdropFilter: 'blur(18px)',
  },
  destinationPillMobile: {
    borderRadius: 18,
    padding: 8,
    minHeight: 74,
  },
  destinationPillImage: {
    width: 62,
    height: 62,
    borderRadius: 18,
    objectFit: 'cover',
    flexShrink: 0,
  },
  destinationPillImageMobile: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  destinationCopy: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
    whiteSpace: 'normal',
  },
  catalog: {
    width: 'min(100% - 32px, 1200px)',
    margin: '0 auto',
  },
  catalogHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 26,
  },
  catalogTitle: {
    color: BRAND_BLUE,
    margin: '14px 0 8px',
    fontSize: 'clamp(28px, 5vw, 46px)',
    lineHeight: 1.08,
    fontWeight: 900,
  },
  catalogText: {
    maxWidth: 680,
    marginBottom: 0,
    color: '#5C718A',
    fontSize: 16,
    lineHeight: 1.7,
  },
  favoritesButton: {
    height: 46,
    borderRadius: 16,
    fontWeight: 800,
  },
  companyFilter: {
    minWidth: 220,
  },
  empty: {
    padding: 'clamp(36px, 8vw, 80px)',
    background: 'rgba(255,255,255,0.74)',
    borderRadius: 28,
  },
  toursGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'clamp(18px, 3vw, 28px)',
  },
  toursGridTablet: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  toursGridMobile: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 18,
  },
  card: {
    width: '100%',
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.58)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,251,255,0.86))',
    boxShadow: '0 24px 70px rgba(23,59,97,0.13)',
    backdropFilter: 'blur(20px)',
    transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease',
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 248,
    overflow: 'hidden',
    borderBottom: '1px solid rgba(255,255,255,0.42)',
  },
  imageWrapMobile: {
    height: 210,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.35s ease',
  },
  imageShade: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(6,17,31,0.02) 18%, rgba(6,17,31,0.32) 58%, rgba(6,17,31,0.76) 100%)',
  },
  promoBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 2,
    padding: '8px 12px',
    borderRadius: 999,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 800,
    boxShadow: '0 12px 26px rgba(0,0,0,0.18)',
  },
  hotCornerBadge: {
    position: 'absolute',
    top: 16,
    right: 62,
    zIndex: 2,
    padding: '8px 11px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.16)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.16)',
    fontSize: 11,
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    backdropFilter: 'blur(12px)',
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
    padding: '8px 12px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.14)',
    color: '#FFFFFF',
    backdropFilter: 'blur(16px)',
    fontWeight: 700,
    fontSize: 12,
    lineHeight: 1.35,
  },
  cardBody: {
    padding: 22,
    display: 'grid',
    gap: 14,
  },
  cardBodyMobile: {
    padding: 16,
  },
  cardTopLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  countryTag: {
    borderRadius: 999,
    color: BRAND_BLUE,
    background: 'rgba(43,184,197,0.10)',
    border: '1px solid rgba(43,184,197,0.18)',
    fontWeight: 750,
  },
  durationTag: {
    borderRadius: 999,
    color: BRAND_BLUE,
    background: 'rgba(252,163,17,0.12)',
    border: '1px solid rgba(252,163,17,0.20)',
    fontWeight: 750,
  },
  verifiedPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 10px',
    borderRadius: 999,
    background: 'rgba(252,163,17,0.12)',
    color: BRAND_BLUE,
    border: '1px solid rgba(252,163,17,0.22)',
    fontSize: 12,
    fontWeight: 850,
  },
  cardTitle: {
    color: BRAND_BLUE,
    margin: 0,
    fontWeight: 900,
    lineHeight: 1.15,
  },
  description: {
    color: '#64748B',
    lineHeight: 1.66,
    minHeight: 52,
    marginBottom: 0,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  metaTile: {
    minHeight: 50,
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '10px 12px',
    borderRadius: 16,
    background: 'rgba(23,59,97,0.055)',
    border: '1px solid rgba(23,59,97,0.08)',
    color: BRAND_BLUE,
    fontSize: 13,
    fontWeight: 800,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
    marginTop: 2,
    paddingTop: 14,
    borderTop: '1px solid rgba(23,59,97,0.08)',
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 800,
  },
  price: {
    color: BRAND_GOLD,
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 0,
  },
  priceNote: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 12,
    fontWeight: 700,
  },
  bookButton: {
    borderRadius: 14,
    height: 42,
    fontWeight: 850,
    paddingInline: 16,
  },
  detailsButton: {
    borderRadius: 14,
    height: 42,
    fontWeight: 900,
    paddingInline: 18,
    boxShadow: '0 14px 30px rgba(37,99,235,0.24)',
  },
  ratingLine: {
    marginTop: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    padding: '10px 12px',
    borderRadius: 16,
    background: 'rgba(252,163,17,0.08)',
  },
};

export default ActualToursPage;
