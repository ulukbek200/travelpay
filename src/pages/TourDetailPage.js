import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Rate,
  Row,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import { normalizeTour } from './ActualToursPage';
import { TOUR_IMAGE_FALLBACK, withTourFallback } from '../utils/tourMedia';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#173B61';
const BRAND_GOLD = '#FCA311';

const tourContentMap = {
  'issyk-kul-premium': {
    heroText: 'Бирюзовое озеро, мягкий курортный ритм, красивые остановки по побережью и комфортный premium slow travel.',
    about: 'Этот маршрут собран для тех, кто хочет увидеть легендарный Иссык-Куль в более дорогой и спокойной подаче. Вместо спешки здесь акцент на красивых видах, удобном темпе, чистой логистике и ощущении качественного отдыха.',
    includes: ['Комфортный трансфер', 'Локальный гид', 'Проживание у озера', 'Завтраки и ужины', 'Экскурсии по маршруту'],
    reasons: [
      'Идеальный баланс между природой, комфортом и красивыми фото-локациями.',
      'Маршрут подходит и для пары, и для семьи, и для небольшого private-формата.',
      'Премиальный ритм без перегруза долгими переездами.',
    ],
  },
  'son-kul-nomad': {
    heroText: 'Высокогорное озеро, юрты, лошади и nomad-luxury атмосфера в одном из самых сильных маршрутов Кыргызстана.',
    about: 'Сон-Куль раскрывает другую сторону Кыргызстана: простор, чистый воздух, высокогорные пастбища и настоящее чувство свободы. TravelPay подаёт это через аккуратный маршрут, понятную организацию и сильный визуальный опыт.',
    includes: ['Трансфер на маршруте', 'Локальный гид', 'Проживание в юртах', 'Питание', 'Экскурсионная программа'],
    reasons: [
      'Настоящий nomad experience без потери комфорта.',
      'Один из самых фотогеничных туров по Кыргызстану.',
      'Подходит для тех, кто хочет сильные эмоции и атмосферу.',
    ],
  },
  'ala-archa-day': {
    heroText: 'Быстрый и очень красивый alpine escape рядом с Бишкеком: ущелье, хвойный воздух и чистая картинка гор.',
    about: 'Ала-Арча отлично подходит, когда нужен насыщенный, но не утомительный выезд. Это одна из самых сильных дневных локаций рядом с городом, особенно если хочется увидеть горы без сложной логистики.',
    includes: ['Трансфер туда-обратно', 'Сопровождение гида', 'Лёгкий trekking маршрут', 'Вода и stop-kit', 'Фото-стопы'],
    reasons: [
      'Идеально для короткого выезда без ночёвки.',
      'Красивый premium day-trip рядом с Бишкеком.',
      'Подходит и для гостей города, и для locals.',
    ],
  },
  'jeti-oguz-scenic': {
    heroText: 'Красные скалы, альпийские поляны и один из самых кинематографичных roadtrip-маршрутов Кыргызстана.',
    about: 'Джети-Огуз любят за мощную визуальную подачу: контрастные скалы, зелёные долины и красивые открытые пространства. Мы делаем маршрут спокойным, фотогеничным и удобным для полноценного отдыха.',
    includes: ['Трансфер по маршруту', 'Гид', 'Проживание', 'Питание', 'Экскурсионные остановки'],
    reasons: [
      'Очень сильная визуальная локация для фото и видео.',
      'Комфортный маршрут с ярким природным сценарием.',
      'Хороший выбор для романтического или private-trip формата.',
    ],
  },
  'karakol-active': {
    heroText: 'Горная база восточного Иссык-Куля с приключенческой атмосферой, красивыми панорамами и насыщенным маршрутом.',
    about: 'Каракол — это точка входа в более активный Кыргызстан: треккинг, смотровые точки, свежий горный воздух и сочетание природы с более живой travel-динамикой.',
    includes: ['Трансфер', 'Гид по маршруту', 'Проживание', 'Питание', 'Экскурсии и outdoor stops'],
    reasons: [
      'Подходит для тех, кто любит активный отдых и горную эстетику.',
      'Сильная база для красивых локаций восточного региона.',
      'Маршрут ощущается насыщенным, но остаётся удобным.',
    ],
  },
  'arslanbob-forest': {
    heroText: 'Ореховые леса, водопады и южный Кыргызстан в атмосферном boutique-формате с мягким темпом.',
    about: 'Арсланбоб отличается от классических lake-маршрутов. Здесь больше зелени, тёплая локальная среда и ощущение hidden gem-направления, которое хочется открывать неспешно.',
    includes: ['Трансфер', 'Локальный гид', 'Проживание', 'Питание', 'Экскурсии к водопадам'],
    reasons: [
      'Редкое направление с более приватной атмосферой.',
      'Подходит для тех, кто хочет увидеть другой Кыргызстан.',
      'Мягкая зелёная эстетика вместо классического alpine-сценария.',
    ],
  },
};

const defaultDetails = {
  heroText: 'Премиальный маршрут с красивыми видами, локальным сопровождением и комфортной организацией в стиле современной travel landing page.',
  about: 'Этот тур собран так, чтобы пользователь получил не просто маршрут, а цельный travel experience: понятную логистику, хорошие остановки, сильные виды и аккуратную premium-подачу.',
  includes: ['Трансфер', 'Гид', 'Проживание', 'Питание', 'Экскурсии'],
  reasons: [
    'Маршрут уже собран и визуально продуман.',
    'Подходит для тех, кто ценит комфорт и сильные локации.',
    'TravelPay делает поездку современной и удобной.',
  ],
};

const getTourDetails = (tour) => tourContentMap[tour.id] || defaultDetails;

const buildItinerary = (tour) => {
  const days = Math.max(1, Number(tour.durationDays || 3));
  const location = tour.location || 'Кыргызстан';
  const dayTemplates = [
    {
      title: 'Прибытие и знакомство с маршрутом',
      description: `Встреча, комфортный трансфер, первые панорамные остановки и мягкое погружение в локации ${location}.`,
    },
    {
      title: 'Главный визуальный день тура',
      description: 'Ключевые точки маршрута, смотровые площадки, фото-стопы, прогулки и сопровождение локального гида.',
    },
    {
      title: 'Культура, slow travel и отдых',
      description: 'Спокойный ритм, локальная кухня, дополнительные scenic-точки и возможность насладиться местом без спешки.',
    },
    {
      title: 'Финальный день и возвращение',
      description: 'Завершающие виды, короткие остановки по пути и комфортное возвращение с рекомендациями от TravelPay.',
    },
  ];

  return Array.from({ length: days }, (_, index) => ({
    title: `День ${index + 1}. ${dayTemplates[index]?.title || 'Свободный premium маршрут'}`,
    description: dayTemplates[index]?.description || `Продолжение маршрута по направлению ${location} с комфортным трансфером, красивыми видами и гибким темпом.`,
  }));
};

const detailStats = (tour) => [
  { label: 'Цена', value: `${Number(tour.price || 0).toLocaleString('ru-RU')} сом`, icon: <StarFilled /> },
  { label: 'Длительность', value: tour.duration || `${tour.durationDays || 1} дня`, icon: <CalendarOutlined /> },
  { label: 'Рейтинг', value: `${tour.rating || 4.8}/5`, icon: <SafetyCertificateOutlined /> },
];

const fallbackTour = normalizeTour({
  id: 'fallback-tour',
  title: 'Premium Kyrgyzstan Journey',
  location: 'Кыргызстан',
  description: defaultDetails.about,
  price: 28000,
  rating: 4.8,
  durationDays: 3,
  duration: '3 дня',
  image: TOUR_IMAGE_FALLBACK,
  gallery: [TOUR_IMAGE_FALLBACK, TOUR_IMAGE_FALLBACK, TOUR_IMAGE_FALLBACK],
});

const TourDetailPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [tour, setTour] = useState(state?.tour ? normalizeTour(state.tour) : null);
  const [loading, setLoading] = useState(!state?.tour);

  useEffect(() => {
    if (tour) return;

    const loadTour = async () => {
      try {
        const response = await api.get('/tours');
        const found = (response.data || []).map(normalizeTour).find((item) => String(item.id) === String(id));
        setTour(found || fallbackTour);
      } catch (error) {
        setTour(fallbackTour);
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [id, tour]);

  const currentTour = tour || fallbackTour;
  const details = getTourDetails(currentTour);
  const itinerary = useMemo(() => buildItinerary(currentTour), [currentTour]);
  const stats = useMemo(() => detailStats(currentTour), [currentTour]);

  const handleBook = () => {
    navigate('/tour-booking', { state: { tour: currentTour } });
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingShell}>
          <Skeleton.Image active style={{ width: '100%', height: 420 }} />
          <Skeleton active paragraph={{ rows: 10 }} />
        </section>
      </main>
    );
  }

  return (
    <main className="tour-detail-page" style={styles.page}>
      <section style={styles.hero}>
        <img src={currentTour.image || TOUR_IMAGE_FALLBACK} alt={currentTour.title} onError={withTourFallback} style={styles.heroImage} />
        <div style={styles.heroOverlay} />

        <div style={styles.heroShell}>
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} style={styles.heroCopy}>
            <Tag style={styles.heroTag}><EnvironmentOutlined /> {currentTour.location || 'Кыргызстан'}</Tag>
            <Title style={styles.heroTitle}>{currentTour.title}</Title>
            <Paragraph style={styles.heroText}>{details.heroText}</Paragraph>

            <Space wrap size={10} style={styles.heroMeta}>
              <Tag style={styles.glassTag}><CalendarOutlined /> {currentTour.duration}</Tag>
              <Tag style={styles.glassTag}><Rate disabled allowHalf value={currentTour.rating} style={{ color: BRAND_GOLD, fontSize: 14 }} /> {currentTour.rating}</Tag>
              <Tag style={styles.glassTag}><TeamOutlined /> small premium group</Tag>
            </Space>

            <div style={styles.heroActions}>
              <Button type="primary" size="large" onClick={handleBook} style={styles.bookButton}>
                Забронировать
              </Button>
              <Button size="large" onClick={() => navigate('/tours')} style={styles.backButton}>
                Назад к турам
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }} style={styles.heroCardShell}>
            <Card style={styles.heroInfoCard}>
              <div style={styles.heroPriceLabel}>от</div>
              <Title level={2} style={styles.heroPrice}>{Number(currentTour.price || 0).toLocaleString('ru-RU')} сом</Title>
              <Paragraph style={styles.heroCardText}>{currentTour.description || defaultDetails.about}</Paragraph>

              <div style={styles.heroStatsGrid}>
                {stats.map((item) => (
                  <div key={item.label} style={styles.heroStat}>
                    <span style={styles.heroStatIcon}>{item.icon}</span>
                    <div>
                      <div style={styles.heroStatLabel}>{item.label}</div>
                      <div style={styles.heroStatValue}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section style={styles.content}>
        <div style={styles.contentShell}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card style={styles.panel}>
                  <Tag style={styles.softTag}>О туре</Tag>
                  <Title level={2} style={styles.sectionTitle}>Путешествие в премиальном travel-формате</Title>
                  <Paragraph style={styles.text}>{details.about}</Paragraph>
                  <Paragraph style={styles.text}>{currentTour.description || defaultDetails.about}</Paragraph>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card style={styles.panel}>
                  <Tag style={styles.softTag}>Программа тура по дням</Tag>
                  <Timeline
                    style={{ marginTop: 24 }}
                    items={itinerary.map((item) => ({
                      color: BRAND_GOLD,
                      content: (
                        <div>
                          <Title level={4} style={styles.timelineTitle}>{item.title}</Title>
                          <Paragraph style={styles.text}>{item.description}</Paragraph>
                        </div>
                      ),
                    }))}
                  />
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Card style={styles.panel}>
                  <Tag style={styles.softTag}><CameraOutlined /> Галерея тура</Tag>
                  <div style={styles.galleryGrid}>
                    {currentTour.gallery.map((image, index) => (
                      <div key={`${image}-${index}`} style={styles.galleryTile}>
                        <img src={image || TOUR_IMAGE_FALLBACK} alt={`${currentTour.title} ${index + 1}`} onError={withTourFallback} style={styles.galleryImage} />
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={8}>
              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={styles.sidebar}>
                <Card style={styles.panel}>
                  <Tag style={styles.softTag}>Что входит</Tag>
                  <Space orientation="vertical" size={14} style={{ width: '100%', marginTop: 20 }}>
                    {details.includes.map((item) => (
                      <div key={item} style={styles.includeRow}>
                        <CheckCircleOutlined style={{ color: BRAND_GOLD, marginTop: 2 }} />
                        <Text>{item}</Text>
                      </div>
                    ))}
                  </Space>
                </Card>

                <Card style={styles.panel}>
                  <Tag style={styles.softTag}><RocketOutlined /> Почему стоит выбрать этот тур</Tag>
                  <Space orientation="vertical" size={14} style={{ width: '100%', marginTop: 20 }}>
                    {details.reasons.map((item) => (
                      <div key={item} style={styles.reasonRow}>
                        <CompassOutlined style={{ color: BRAND_BLUE, marginTop: 3 }} />
                        <Text>{item}</Text>
                      </div>
                    ))}
                  </Space>
                </Card>

                <Card style={styles.ctaCard}>
                  <Title level={3} style={styles.ctaTitle}>Готовы к поездке?</Title>
                  <Paragraph style={styles.ctaText}>Забронируйте маршрут сейчас и продолжите оформление в TravelPay без потери текущей логики.</Paragraph>
                  <Button type="primary" size="large" block onClick={handleBook} style={styles.bottomBookButton}>
                    Забронировать тур
                  </Button>
                </Card>
              </motion.div>
            </Col>
          </Row>

          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card style={styles.bottomBanner}>
              <div style={styles.bottomBannerCopy}>
                <Tag style={styles.bottomBannerTag}><HomeOutlined /> TravelPay Premium</Tag>
                <Title level={2} style={styles.bottomBannerTitle}>Хотите этот маршрут в удобном booking flow?</Title>
                <Paragraph style={styles.bottomBannerText}>Нажмите кнопку ниже, и TravelPay откроет стандартную страницу бронирования без поломки существующей логики авторизации, оплаты и профиля.</Paragraph>
              </div>
              <Button type="primary" size="large" onClick={handleBook} style={styles.bottomBookButton}>
                Забронировать тур
              </Button>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 8% 8%, rgba(22,182,196,0.10), transparent 24%), linear-gradient(180deg, #F8FBFF 0%, #EEF5FB 48%, #F9FBFF 100%)',
    color: BRAND_BLUE,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  },
  loadingShell: {
    maxWidth: 1180,
    margin: '0 auto',
    padding: '120px 24px',
  },
  hero: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    marginTop: -88,
  },
  heroImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(6,17,31,0.30), rgba(6,17,31,0.74)), linear-gradient(90deg, rgba(6,17,31,0.86), rgba(6,17,31,0.46), rgba(6,17,31,0.18)), radial-gradient(circle at 72% 24%, rgba(252,163,17,0.16), transparent 26%)',
  },
  heroShell: {
    position: 'relative',
    zIndex: 2,
    width: 'min(100% - 32px, 1200px)',
    minHeight: '100vh',
    margin: '0 auto',
    padding: '150px 0 84px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.25fr) minmax(320px, 420px)',
    gap: 28,
    alignItems: 'end',
  },
  heroCopy: {
    maxWidth: 760,
  },
  heroTag: {
    borderRadius: 999,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.12)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.18)',
    backdropFilter: 'blur(18px)',
    fontWeight: 800,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 'clamp(40px, 5.2vw, 74px)',
    lineHeight: 1.02,
    fontWeight: 900,
    margin: '22px 0 16px',
    textShadow: '0 24px 72px rgba(0,0,0,0.34)',
  },
  heroText: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 18,
    lineHeight: 1.72,
    maxWidth: 640,
    marginBottom: 22,
  },
  heroMeta: {
    marginBottom: 24,
  },
  glassTag: {
    borderRadius: 999,
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.18)',
    backdropFilter: 'blur(14px)',
    fontWeight: 700,
  },
  heroActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  bookButton: {
    height: 50,
    paddingInline: 28,
    borderRadius: 18,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #FFD27A)`,
    border: `1px solid ${BRAND_GOLD}`,
    color: BRAND_BLUE,
    fontWeight: 900,
    boxShadow: '0 18px 40px rgba(252,163,17,0.28)',
  },
  backButton: {
    height: 50,
    paddingInline: 24,
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.20)',
    background: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    fontWeight: 800,
  },
  heroCardShell: {
    width: '100%',
  },
  heroInfoCard: {
    borderRadius: 28,
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.12)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.20)',
    backdropFilter: 'blur(22px)',
  },
  heroPriceLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroPrice: {
    color: '#FFFFFF',
    margin: '8px 0 8px',
    fontWeight: 900,
  },
  heroCardText: {
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 1.65,
    marginBottom: 20,
  },
  heroStatsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 12,
  },
  heroStat: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  heroStatIcon: {
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 12,
    color: BRAND_BLUE,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #FFD27A)`,
    flexShrink: 0,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: 700,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontWeight: 800,
    marginTop: 2,
  },
  content: {
    position: 'relative',
    zIndex: 3,
    marginTop: -48,
    padding: '0 16px 90px',
  },
  contentShell: {
    width: 'min(100%, 1200px)',
    margin: '0 auto',
  },
  panel: {
    borderRadius: 28,
    border: '1px solid rgba(23,59,97,0.08)',
    background: 'rgba(255,255,255,0.90)',
    boxShadow: '0 22px 64px rgba(23,59,97,0.10)',
    marginBottom: 24,
  },
  ctaCard: {
    borderRadius: 28,
    border: '1px solid rgba(23,59,97,0.08)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,247,255,0.94))',
    boxShadow: '0 22px 64px rgba(23,59,97,0.10)',
  },
  softTag: {
    borderRadius: 999,
    padding: '6px 12px',
    color: BRAND_BLUE,
    background: 'rgba(252,163,17,0.12)',
    border: '1px solid rgba(252,163,17,0.22)',
    fontWeight: 800,
  },
  sectionTitle: {
    color: BRAND_BLUE,
    fontWeight: 900,
    marginTop: 16,
  },
  text: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 1.76,
  },
  timelineTitle: {
    color: BRAND_BLUE,
    marginBottom: 6,
    fontWeight: 800,
  },
  includeRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  reasonRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  galleryGrid: {
    marginTop: 22,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 14,
  },
  galleryTile: {
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: '0 18px 44px rgba(23,59,97,0.12)',
    minHeight: 190,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    minHeight: 190,
    objectFit: 'cover',
    display: 'block',
  },
  sidebar: {
    position: 'sticky',
    top: 92,
  },
  ctaTitle: {
    color: BRAND_BLUE,
    marginBottom: 10,
    fontWeight: 900,
  },
  ctaText: {
    color: '#64748B',
    lineHeight: 1.7,
    marginBottom: 20,
  },
  bottomBanner: {
    marginTop: 8,
    borderRadius: 30,
    border: '1px solid rgba(23,59,97,0.08)',
    background: 'linear-gradient(135deg, rgba(23,59,97,0.98), rgba(43,123,185,0.92))',
    boxShadow: '0 26px 72px rgba(23,59,97,0.18)',
  },
  bottomBannerCopy: {
    marginBottom: 24,
  },
  bottomBannerTag: {
    borderRadius: 999,
    padding: '6px 12px',
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.14)',
    fontWeight: 800,
  },
  bottomBannerTitle: {
    color: '#FFFFFF',
    marginTop: 18,
    fontWeight: 900,
  },
  bottomBannerText: {
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.72,
    maxWidth: 760,
  },
  bottomBookButton: {
    height: 50,
    borderRadius: 18,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #FFD27A)`,
    border: `1px solid ${BRAND_GOLD}`,
    color: BRAND_BLUE,
    fontWeight: 900,
    boxShadow: '0 18px 40px rgba(252,163,17,0.22)',
  },
};

export default TourDetailPage;
