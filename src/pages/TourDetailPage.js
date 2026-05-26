import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Carousel,
  Col,
  List,
  Rate,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import api from '../api';
import { normalizeTour } from './ActualToursPage';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';

const includes = [
  'Комфортный транспорт по маршруту',
  'Локальный гид RU/KG/EN',
  'Подбор фото-локаций и тайминга',
  'Помощь менеджера до и во время тура',
  'Базовая travel-инструкция и чеклист',
];

const reviews = [
  ['Алина', 'Очень красивый маршрут, всё было организовано спокойно и премиально.', 5],
  ['Daniyar', 'Гид знал лучшие точки, транспорт был комфортный, поездка прошла идеально.', 4.8],
  ['Mira', 'Понравился темп тура и поддержка менеджера. Очень достойный сервис.', 5],
];

const buildItinerary = (tour) => {
  const days = Math.max(1, Number(tour.durationDays || 3));
  const base = [
    ['Прибытие и welcome route', 'Встреча, комфортный трансфер, первые панорамные остановки и настройка маршрута с гидом.'],
    ['Главные локации тура', 'Озёра, горы, каньоны или ущелья: лучшие точки для прогулок, фотографий и локальных историй.'],
    ['Культура и slow travel', 'Локальная кухня, спокойный темп, дополнительные остановки и аутентичные впечатления.'],
    ['Финальный день и возвращение', 'Завершение маршрута, трансфер, рекомендации и помощь с дальнейшими планами.'],
  ];

  return Array.from({ length: days }, (_, index) => ({
    title: `День ${index + 1}. ${base[index]?.[0] || 'Свободный premium маршрут'}`,
    description: base[index]?.[1] || `Продолжение маршрута ${tour.location}: красивые локации, гид и комфортный трансфер.`,
  }));
};

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
        setTour(found || null);
      } catch (error) {
        setTour(null);
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [id, tour]);

  const itinerary = useMemo(() => (tour ? buildItinerary(tour) : []), [tour]);

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingShell}>
          <Skeleton.Image active style={{ width: '100%', height: 360 }} />
          <Skeleton active paragraph={{ rows: 8 }} />
        </section>
      </main>
    );
  }

  if (!tour) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingShell}>
          <Title level={2}>Тур не найден</Title>
          <Button type="primary" onClick={() => navigate('/tours')} style={styles.goldButton}>Вернуться к турам</Button>
        </section>
      </main>
    );
  }

  return (
    <main className="tour-detail-page" style={styles.page}>
      <section style={styles.hero}>
        <Carousel autoplay effect="fade" style={styles.carousel}>
          {tour.gallery.map((image) => (
            <div key={image}>
              <img src={image} alt={tour.title} style={styles.heroImage} />
            </div>
          ))}
        </Carousel>
        <div style={styles.heroOverlay} />
        <motion.div style={styles.heroContent} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}>
          <Tag style={styles.heroTag}><EnvironmentOutlined /> {tour.location}</Tag>
          <Title style={styles.heroTitle}>{tour.title}</Title>
          <Space size={14} wrap>
            <Tag style={styles.glassTag}><CalendarOutlined /> {tour.duration}</Tag>
            <Tag style={styles.glassTag}><TeamOutlined /> Осталось 8 мест</Tag>
            <Tag style={styles.glassTag}><Rate disabled allowHalf value={tour.rating} style={{ color: BRAND_GOLD, fontSize: 14 }} /> {tour.rating}</Tag>
          </Space>
        </motion.div>
      </section>

      <section style={styles.content}>
        <Row gutter={[28, 28]} align="top">
          <Col xs={24} lg={15}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card style={styles.panel}>
                <Tag style={styles.softTag}>Описание тура</Tag>
                <Title level={2} style={styles.sectionTitle}>Путешествие с премиальным темпом</Title>
                <Paragraph style={styles.text}>{tour.description}</Paragraph>
                <Paragraph style={styles.text}>
                  Маршрут создан для путешественников, которые хотят увидеть сильные природные локации Кыргызстана и Казахстана / региона Алматы без хаоса: с понятной логистикой, локальным гидом и комфортным сервисом.
                </Paragraph>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card style={styles.panel}>
                <Tag style={styles.softTag}><CompassOutlined /> Маршрут по дням</Tag>
                <Timeline
                  style={{ marginTop: 24 }}
                  items={itinerary.map((item) => ({
                    color: BRAND_GOLD,
                    children: (
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
                <Tag style={styles.softTag}>Фото локаций</Tag>
                <div style={styles.gallery}>
                  {tour.gallery.map((image, index) => (
                    <img key={image} src={image} alt={`${tour.title} ${index + 1}`} style={{ ...styles.galleryImage, gridRow: index === 0 ? 'span 2' : 'span 1' }} />
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card style={styles.panel}>
                <Tag style={styles.softTag}>Карта мест</Tag>
                <iframe
                  title="Tour map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=72.6%2C40.4%2C79.6%2C44.0&layer=mapnik"
                  style={styles.map}
                />
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card style={styles.panel}>
                <Tag style={styles.softTag}>Отзывы туристов</Tag>
                <List
                  itemLayout="horizontal"
                  dataSource={reviews}
                  renderItem={([name, text, rating]) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar style={{ background: BRAND_BLUE }} icon={<UserOutlined />} />}
                        title={<Space><Text strong>{name}</Text><Rate disabled allowHalf value={rating} style={{ color: BRAND_GOLD, fontSize: 13 }} /></Space>}
                        description={<span style={styles.text}>{text}</span>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} lg={9}>
            <motion.aside style={styles.bookingCard} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
              <Card style={styles.panel}>
                <Tag style={styles.softTag}><SafetyCertificateOutlined /> Включено</Tag>
                <List
                  dataSource={includes}
                  renderItem={(item) => (
                    <List.Item style={{ border: 'none', paddingLeft: 0, paddingRight: 0 }}>
                      <Space align="start">
                        <CheckCircleOutlined style={{ color: BRAND_GOLD, marginTop: 4 }} />
                        <Text>{item}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              <Card style={styles.panel}>
                <Space align="center">
                  <Avatar size={58} src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" />
                  <div>
                    <Text strong>Гид: Азамат</Text>
                    <br />
                    <Text type="secondary">KG / RU / EN · 7 лет опыта</Text>
                  </div>
                </Space>
                <Row gutter={12} style={{ marginTop: 18 }}>
                  <Col span={8}><Statistic title="Рейтинг" value={tour.rating} suffix={<StarIcon />} /></Col>
                  <Col span={8}><Statistic title="Группы" value="VIP" /></Col>
                  <Col span={8}><Statistic title="Места" value={8} /></Col>
                </Row>
              </Card>
            </motion.aside>
          </Col>
        </Row>
      </section>
    </main>
  );
};

const StarIcon = () => <span style={{ color: BRAND_GOLD, fontSize: 14 }}>★</span>;

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 8% 8%, rgba(22,182,196,0.10), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #eef5fb 48%, #f9fbff 100%)',
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
    minHeight: 560,
    overflow: 'hidden',
    marginTop: -72,
  },
  carousel: {
    position: 'absolute',
    inset: 0,
  },
  heroImage: {
    width: '100%',
    height: 560,
    objectFit: 'cover',
    display: 'block',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(5,13,24,0.34), rgba(5,13,24,0.76)), radial-gradient(circle at 50% 35%, rgba(255,255,255,0.08), transparent 32%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 980,
    margin: '0 auto',
    padding: '170px 24px 80px',
    color: '#fff',
    textAlign: 'center',
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
    fontWeight: 840,
    margin: '22px auto 18px',
    textShadow: '0 20px 70px rgba(0,0,0,0.36)',
  },
  glassTag: {
    borderRadius: 999,
    color: '#fff',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.20)',
    backdropFilter: 'blur(14px)',
    fontWeight: 750,
  },
  content: {
    maxWidth: 1180,
    margin: '-54px auto 0',
    padding: '0 24px 90px',
    position: 'relative',
    zIndex: 4,
  },
  panel: {
    borderRadius: 30,
    border: '1px solid rgba(29,53,87,0.08)',
    background: 'rgba(255,255,255,0.90)',
    boxShadow: '0 24px 70px rgba(29,53,87,0.10)',
    marginBottom: 24,
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
    fontWeight: 840,
    marginTop: 16,
  },
  text: {
    color: '#64748b',
    fontSize: 16,
    lineHeight: 1.75,
  },
  timelineTitle: {
    color: BRAND_BLUE,
    marginBottom: 6,
  },
  gallery: {
    marginTop: 22,
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gridAutoRows: 190,
    gap: 14,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 22,
    boxShadow: '0 18px 44px rgba(29,53,87,0.12)',
  },
  map: {
    width: '100%',
    height: 320,
    border: 'none',
    borderRadius: 24,
    marginTop: 22,
  },
  bookingCard: {
    position: 'sticky',
    top: 92,
  },
  price: {
    color: BRAND_BLUE,
    margin: '16px 0 2px',
    fontWeight: 900,
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  totalBox: {
    padding: 16,
    borderRadius: 20,
    background: 'rgba(252,163,17,0.12)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: BRAND_BLUE,
  },
  goldButton: {
    borderRadius: 999,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd27a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 850,
    boxShadow: '0 18px 42px rgba(252,163,17,0.28)',
  },
};

export default TourDetailPage;
