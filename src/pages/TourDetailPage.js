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
import CompanyBadge from '../components/CompanyBadge';
import AppImage from '../components/AppImage';
import { normalizeTour } from './ActualToursPage';
import { TOUR_IMAGE_FALLBACK } from '../utils/tourMedia';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#173B61';
const BRAND_GOLD = '#FCA311';

const DEFAULT_LOCATION = '\u041a\u044b\u0440\u0433\u044b\u0437\u0441\u0442\u0430\u043d';

const formatPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} \u0441\u043e\u043c`;

const buildFallbackTour = () => normalizeTour({
  id: 'fallback-tour',
  title: '\u041f\u0440\u0435\u043c\u0438\u0443\u043c \u0442\u0443\u0440 \u043f\u043e \u041a\u044b\u0440\u0433\u044b\u0437\u0441\u0442\u0430\u043d\u0443',
  location: DEFAULT_LOCATION,
  description: '\u041a\u043e\u043c\u0444\u043e\u0440\u0442\u043d\u044b\u0439 \u043c\u0430\u0440\u0448\u0440\u0443\u0442 \u0441 \u043f\u0440\u0438\u0440\u043e\u0434\u043e\u0439, \u0432\u0438\u0434\u0430\u043c\u0438 \u0438 \u0445\u043e\u0440\u043e\u0448\u043e \u043f\u0440\u043e\u0434\u0443\u043c\u0430\u043d\u043d\u044b\u043c \u0440\u0438\u0442\u043c\u043e\u043c \u043f\u043e\u0435\u0437\u0434\u043a\u0438.',
  price: 28000,
  rating: 4.8,
  durationDays: 3,
  duration: '3 \u0434\u043d\u044f',
  image: TOUR_IMAGE_FALLBACK,
  gallery: [TOUR_IMAGE_FALLBACK, TOUR_IMAGE_FALLBACK, TOUR_IMAGE_FALLBACK],
});

const getTourNarrative = (tour) => ({
  heroText: tour.description || '\u041c\u0430\u0440\u0448\u0440\u0443\u0442 \u0441\u043e\u0431\u0440\u0430\u043d \u0442\u0430\u043a, \u0447\u0442\u043e\u0431\u044b \u0432\u044b \u0443\u0441\u043f\u0435\u043b\u0438 \u0438 \u043e\u0442\u0434\u043e\u0445\u043d\u0443\u0442\u044c, \u0438 \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0433\u043b\u0430\u0432\u043d\u043e\u0435.',
  about: '\u042d\u0442\u043e\u0442 \u0442\u0443\u0440 \u043f\u043e\u0434\u043e\u0439\u0434\u0451\u0442 \u0434\u043b\u044f \u0442\u0435\u0445, \u043a\u0442\u043e \u0445\u043e\u0447\u0435\u0442 \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0433\u043e\u0442\u043e\u0432\u044b\u0439 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439 \u043f\u043e\u0435\u0437\u0434\u043a\u0438 \u0431\u0435\u0437 \u0441\u0443\u0435\u0442\u044b: \u043f\u0440\u043e\u0434\u0443\u043c\u0430\u043d\u043d\u044b\u0439 \u043c\u0430\u0440\u0448\u0440\u0443\u0442, \u043a\u043e\u043c\u0444\u043e\u0440\u0442\u043d\u044b\u0439 \u0442\u0435\u043c\u043f \u0438 \u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043b\u043e\u0433\u0438\u0441\u0442\u0438\u043a\u0430.',
  reasons: [
    '\u0427\u0451\u0442\u043a\u043e \u0441\u043e\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043f\u043b\u0430\u043d \u0434\u043d\u044f \u0431\u0435\u0437 \u043b\u0438\u0448\u043d\u0435\u0439 \u0441\u043f\u0435\u0448\u043a\u0438.',
    '\u041f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u0446\u0435\u043d\u0430, \u0443\u0441\u043b\u043e\u0432\u0438\u044f \u0438 \u0431\u0440\u043e\u043d\u044c \u043f\u043e \u0433\u043e\u0442\u043e\u0432\u044b\u043c \u0441\u043b\u043e\u0442\u0430\u043c.',
    '\u041f\u043e\u0434\u0445\u043e\u0434\u0438\u0442 \u043a\u0430\u043a \u0434\u043b\u044f \u0441\u0435\u043c\u044c\u0438, \u0442\u0430\u043a \u0438 \u0434\u043b\u044f \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u0434\u0440\u0443\u0437\u0435\u0439.',
  ],
  included: [
    '\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043c\u0430\u0440\u0448\u0440\u0443\u0442 \u0438 \u0441\u043e\u043f\u0440\u043e\u0432\u043e\u0436\u0434\u0435\u043d\u0438\u0435 \u0442\u0443\u0440-\u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438.',
    '\u0422\u0440\u0430\u043d\u0441\u0444\u0435\u0440 \u0438\u043b\u0438 \u0442\u043e\u0447\u043a\u0430 \u0441\u0431\u043e\u0440\u0430 \u043f\u043e \u043f\u043b\u0430\u043d\u0443 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438.',
    '\u041e\u0441\u043d\u043e\u0432\u043d\u044b\u0435 \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0438, \u0432\u0438\u0434\u043e\u0432\u044b\u0435 \u0442\u043e\u0447\u043a\u0438 \u0438 \u0432\u0440\u0435\u043c\u044f \u043d\u0430 \u043e\u0442\u0434\u044b\u0445.',
  ],
});

const buildItinerary = (tour) => {
  const days = Math.max(Number(String(tour.durationDays || tour.duration || '').match(/\d+/)?.[0]) || 1, 1);
  return Array.from({ length: days }).map((_, index) => ({
    key: `day-${index + 1}`,
    title: `\u0414\u0435\u043d\u044c ${index + 1}`,
    description: index === 0
      ? '\u0421\u0431\u043e\u0440, \u0432\u044b\u0435\u0437\u0434 \u0438 \u043f\u0435\u0440\u0432\u044b\u0435 \u043b\u043e\u043a\u0430\u0446\u0438\u0438 \u043f\u043e \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0443.'
      : index === days - 1
        ? '\u0424\u0438\u043d\u0430\u043b\u044c\u043d\u044b\u0435 \u043e\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0438, \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u0438 \u0432\u043e\u0437\u0432\u0440\u0430\u0442.'
        : '\u041e\u0441\u043d\u043e\u0432\u043d\u0430\u044f \u0447\u0430\u0441\u0442\u044c \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0430, \u043f\u0440\u0438\u0440\u043e\u0434\u0430, \u043f\u0435\u0440\u0435\u0435\u0437\u0434\u044b \u0438 \u0432\u0438\u0434\u043e\u0432\u044b\u0435 \u0442\u043e\u0447\u043a\u0438.',
  }));
};

const detailStats = (tour) => [
  { label: '\u0426\u0435\u043d\u0430', value: formatPrice(tour.price), icon: <StarFilled /> },
  { label: '\u0414\u043b\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c', value: tour.duration || `${tour.durationDays || 1} \u0434\u043d\u044f`, icon: <CalendarOutlined /> },
  { label: '\u0420\u0435\u0439\u0442\u0438\u043d\u0433', value: `${tour.rating || 4.8}/5`, icon: <SafetyCertificateOutlined /> },
];

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
        setTour(found || buildFallbackTour());
      } catch (error) {
        setTour(buildFallbackTour());
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [id, tour]);

  const currentTour = tour || buildFallbackTour();
  const details = getTourNarrative(currentTour);
  const itinerary = useMemo(() => buildItinerary(currentTour), [currentTour]);
  const stats = useMemo(() => detailStats(currentTour), [currentTour]);
  const gallery = Array.isArray(currentTour.gallery) && currentTour.gallery.length
    ? currentTour.gallery
    : [currentTour.image || TOUR_IMAGE_FALLBACK, TOUR_IMAGE_FALLBACK, TOUR_IMAGE_FALLBACK];

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
        <AppImage
          src={currentTour.image || TOUR_IMAGE_FALLBACK}
          alt={currentTour.title}
          priority
          aspectRatio="auto"
          className="tour-detail-hero-image"
          imgStyle={styles.heroImage}
        />
        <div style={styles.heroOverlay} />

        <div className="tour-detail-hero-shell" style={styles.heroShell}>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={styles.heroCopy}
          >
            <Tag style={styles.heroTag}>
              <EnvironmentOutlined /> {currentTour.location || DEFAULT_LOCATION}
            </Tag>
            <Title style={styles.heroTitle}>{currentTour.title}</Title>
            <Paragraph style={styles.heroText}>{details.heroText}</Paragraph>

            <Space wrap size={10} style={styles.heroMeta}>
              <Tag style={styles.glassTag}><CalendarOutlined /> {currentTour.duration}</Tag>
              <Tag style={styles.glassTag}>
                <Rate disabled allowHalf value={currentTour.rating} style={{ color: BRAND_GOLD, fontSize: 14 }} /> {currentTour.rating}
              </Tag>
              <Tag style={styles.glassTag}><TeamOutlined /> {'\u041c\u0438\u043d\u0438-\u0433\u0440\u0443\u043f\u043f\u0430'}</Tag>
            </Space>

            <div className="tour-detail-hero-actions" style={styles.heroActions}>
              <Button type="primary" size="large" onClick={handleBook} style={styles.bookButton}>
                {'\u0417\u0430\u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0442\u0443\u0440'}
              </Button>
              <Button size="large" onClick={() => navigate('/tours')} style={styles.backButton}>
                {'\u041a \u0441\u043f\u0438\u0441\u043a\u0443 \u0442\u0443\u0440\u043e\u0432'}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="tour-detail-hero-card-shell"
            style={styles.heroCardShell}
          >
            <Card style={styles.heroInfoCard}>
              <div style={styles.heroPriceLabel}>{'\u0421\u0442\u0430\u0440\u0442\u043e\u0432\u0430\u044f \u0446\u0435\u043d\u0430'}</div>
              <Title level={2} style={styles.heroPrice}>{formatPrice(currentTour.price)}</Title>
              <Paragraph style={styles.heroCardText}>{details.about}</Paragraph>

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
        <div className="tour-detail-content-shell" style={styles.contentShell}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card style={styles.panel}>
                <Tag style={styles.softTag}>{'\u041e \u0442\u0443\u0440\u0435'}</Tag>
                <Title level={2} style={styles.sectionTitle}>{'\u0427\u0442\u043e \u0432\u0430\u0441 \u0436\u0434\u0451\u0442 \u0432 \u044d\u0442\u043e\u0439 \u043f\u043e\u0435\u0437\u0434\u043a\u0435'}</Title>
                <Paragraph style={styles.text}>{details.about}</Paragraph>

                <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                  {details.reasons.map((reason) => (
                    <div key={reason} style={styles.reasonRow}>
                      <RocketOutlined style={{ color: BRAND_GOLD, marginTop: 4 }} />
                      <Text style={styles.text}>{reason}</Text>
                    </div>
                  ))}
                </Space>
              </Card>

              <Card style={styles.panel}>
                <Tag style={styles.softTag}>{'\u041f\u043b\u0430\u043d \u043f\u043e\u0435\u0437\u0434\u043a\u0438'}</Tag>
                <Title level={2} style={styles.sectionTitle}>{'\u041c\u0430\u0440\u0448\u0440\u0443\u0442 \u043f\u043e \u0434\u043d\u044f\u043c'}</Title>

                <Timeline
                  items={itinerary.map((item) => ({
                    color: BRAND_GOLD,
                    content: (
                      <div>
                        <Title level={5} style={styles.timelineTitle}>{item.title}</Title>
                        <Text style={styles.text}>{item.description}</Text>
                      </div>
                    ),
                  }))}
                />
              </Card>

              <Card style={styles.panel}>
                <Tag style={styles.softTag}>{'\u0412 \u0441\u0442\u043e\u0438\u043c\u043e\u0441\u0442\u0438'}</Tag>
                <Title level={2} style={styles.sectionTitle}>{'\u0427\u0442\u043e \u0443\u0436\u0435 \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u043e'}</Title>

                <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                  {details.included.map((item) => (
                    <div key={item} style={styles.includeRow}>
                      <CheckCircleOutlined style={{ color: '#16A34A', marginTop: 4 }} />
                      <Text style={styles.text}>{item}</Text>
                    </div>
                  ))}
                </Space>
              </Card>

              <Card style={styles.panel}>
                <Tag style={styles.softTag}><CameraOutlined /> {'\u0413\u0430\u043b\u0435\u0440\u0435\u044f'}</Tag>
                <Title level={2} style={styles.sectionTitle}>{'\u0410\u0442\u043c\u043e\u0441\u0444\u0435\u0440\u0430 \u0438 \u043b\u043e\u043a\u0430\u0446\u0438\u0438'}</Title>

                <div className="tour-detail-gallery-grid" style={styles.galleryGrid}>
                  {gallery.slice(0, 3).map((image, index) => (
                    <div key={`${image}-${index}`} style={styles.galleryTile}>
                      <AppImage src={image || TOUR_IMAGE_FALLBACK} alt={`${currentTour.title}-${index + 1}`} aspectRatio="4 / 3" imgStyle={styles.galleryImage} />
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <div className="tour-detail-sidebar" style={styles.sidebar}>
                <Card style={styles.ctaCard}>
                  <Space orientation="vertical" size={16} style={{ width: '100%' }}>
                    <div>
                      <Tag style={styles.softTag}><CompassOutlined /> {'\u0411\u0440\u043e\u043d\u044c \u043f\u043e \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u044e'}</Tag>
                      <Title level={3} style={styles.ctaTitle}>{'\u041a\u0430\u043a \u043f\u0440\u043e\u0439\u0434\u0451\u0442 \u0431\u0440\u043e\u043d\u044c'}</Title>
                      <Paragraph style={styles.ctaText}>
                        {'\u0422\u0443\u0440-\u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f \u0441\u0430\u043c\u0430 \u0432\u044b\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u0442 \u0434\u0430\u0442\u044b \u0438 \u0432\u0440\u0435\u043c\u044f \u0432\u044b\u0435\u0437\u0434\u0430, \u0430 \u0432\u044b \u0432\u044b\u0431\u0438\u0440\u0430\u0435\u0442\u0435 \u0433\u043e\u0442\u043e\u0432\u044b\u0439 \u0441\u043b\u043e\u0442. \u041f\u043e\u0442\u043e\u043c \u043e\u0444\u043e\u0440\u043c\u043b\u044f\u0435\u0442\u0435 \u043e\u043f\u043b\u0430\u0442\u0443 \u0438 \u0432\u0438\u0434\u0438\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441 \u0432 \u043b\u0438\u0447\u043d\u043e\u043c \u043a\u0430\u0431\u0438\u043d\u0435\u0442\u0435.'}
                      </Paragraph>
                    </div>

                    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                      <div style={styles.reasonRow}>
                        <CalendarOutlined style={{ color: BRAND_GOLD, marginTop: 4 }} />
                        <Text style={styles.text}>{'\u0412\u044b\u0431\u043e\u0440 \u0438\u0437 \u0433\u043e\u0442\u043e\u0432\u044b\u0445 \u0434\u0430\u0442 \u0438 \u0432\u0440\u0435\u043c\u0435\u043d\u0438'}</Text>
                      </div>
                      <div style={styles.reasonRow}>
                        <HomeOutlined style={{ color: BRAND_GOLD, marginTop: 4 }} />
                        <Text style={styles.text}>{'\u041f\u0440\u0438 \u0436\u0435\u043b\u0430\u043d\u0438\u0438 \u043c\u043e\u0436\u043d\u043e \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0434\u043e\u043c\u0438\u043a \u043a \u0442\u0443\u0440\u0443'}</Text>
                      </div>
                      <div style={styles.reasonRow}>
                        <SafetyCertificateOutlined style={{ color: BRAND_GOLD, marginTop: 4 }} />
                        <Text style={styles.text}>{'\u0421\u0442\u0430\u0442\u0443\u0441\u044b \u0431\u0440\u043e\u043d\u0438 \u0438 \u043e\u043f\u043b\u0430\u0442\u044b \u0432\u0438\u0434\u043d\u044b \u0441\u0440\u0430\u0437\u0443'}</Text>
                      </div>
                    </Space>

                    <Button type="primary" block size="large" onClick={handleBook} style={styles.bookButton}>
                      {'\u041f\u0435\u0440\u0435\u0439\u0442\u0438 \u043a \u0431\u0440\u043e\u043d\u0438'}
                    </Button>
                  </Space>
                </Card>
              </div>
            </Col>
          </Row>

          <Card className="tour-detail-bottom-banner" style={styles.bottomBanner}>
            <Row gutter={[24, 24]} align="middle" justify="space-between">
              <Col xs={24} lg={15}>
                <div style={styles.bottomBannerCopy}>
                  <Tag style={styles.bottomBannerTag}>
                    <TeamOutlined /> {'\u0412\u0430\u0448 \u0442\u0443\u0440, \u0432\u0430\u0448 \u0441\u043b\u043e\u0442'}
                  </Tag>
                  <Title level={2} style={styles.bottomBannerTitle}>
                    {'\u0415\u0441\u043b\u0438 \u043c\u0430\u0440\u0448\u0440\u0443\u0442 \u043f\u043e\u0434\u0445\u043e\u0434\u0438\u0442, \u043c\u043e\u0436\u043d\u043e \u0431\u0440\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0441\u0440\u0430\u0437\u0443'}
                  </Title>
                  <Paragraph style={styles.bottomBannerText}>
                    {'\u0412\u0441\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0438\u0434\u0443\u0442 \u043e\u0442 \u0442\u0443\u0440-\u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438. \u0411\u0435\u0437 \u043b\u0438\u0448\u043d\u0438\u0445 \u0437\u0432\u043e\u043d\u043a\u043e\u0432, \u0431\u0435\u0437 \u0440\u0443\u0447\u043d\u043e\u0433\u043e \u0441\u043e\u0433\u043b\u0430\u0441\u043e\u0432\u0430\u043d\u0438\u044f \u0434\u0430\u0442: \u0432\u044b\u0431\u0440\u0430\u043b\u0438 \u043d\u0443\u0436\u043d\u044b\u0439 \u0432\u044b\u0435\u0437\u0434, \u043e\u043f\u043b\u0430\u0442\u0438\u043b\u0438 \u0438 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0435\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441 \u0432 TravelPay.'}
                  </Paragraph>
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <Card style={styles.heroInfoCard}>
                  <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                    <CompanyBadge
                      name={currentTour.companyName}
                      city={currentTour.companyCity || currentTour.location || DEFAULT_LOCATION}
                      logo={currentTour.companyLogo}
                      verified={currentTour.companyVerified}
                      compact
                    />
                    <Text style={{ color: '#FFFFFF' }}>{'\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440 \u0442\u0443\u0440\u0430'}</Text>
                    <Button type="primary" block size="large" onClick={handleBook} style={styles.bottomBookButton}>
                      {'\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0431\u0440\u043e\u043d\u044c'}
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f4f8fc 0%, #ffffff 100%)',
  },
  loadingShell: {
    width: 'min(100%, 1200px)',
    margin: '0 auto',
    padding: '32px 16px 80px',
  },
  hero: {
    position: 'relative',
    minHeight: 620,
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(15,36,63,0.94), rgba(23,59,97,0.72))',
  },
  heroShell: {
    position: 'relative',
    zIndex: 2,
    width: 'min(100%, 1200px)',
    margin: '0 auto',
    padding: '110px 16px 96px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 0.8fr)',
    gap: 24,
    alignItems: 'end',
  },
  heroCopy: {
    maxWidth: 720,
  },
  heroTag: {
    borderRadius: 999,
    padding: '8px 14px',
    color: '#fff',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.18)',
    backdropFilter: 'blur(14px)',
    fontWeight: 700,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 'clamp(34px, 5vw, 60px)',
    lineHeight: 1.04,
    marginTop: 18,
    marginBottom: 18,
    fontWeight: 900,
  },
  heroText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 18,
    lineHeight: 1.75,
    maxWidth: 640,
  },
  heroMeta: {
    marginTop: 24,
    marginBottom: 28,
  },
  glassTag: {
    borderRadius: 999,
    padding: '8px 14px',
    color: '#fff',
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
