import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Grid,
  Input,
  InputNumber,
  Rate,
  Row,
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
  HomeOutlined,
  SearchOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import CompanyBadge from '../components/CompanyBadge';
import {
  STAY_AMENITIES,
  STAY_TYPE_OPTIONS,
  fallbackStays,
  formatStayPrice,
  getStayTypeLabel,
  normalizeStay,
  withStayFallback,
} from '../utils/stays';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const heroMotion = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
};

const StaysPage = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(true);
  const [stays, setStays] = useState([]);
  const [filters, setFilters] = useState({
    query: '',
    type: 'all',
    company: 'all',
    guests: null,
    maxPrice: null,
    amenity: 'all',
  });

  useEffect(() => {
    document.body.classList.add('travelpay-stays-page-active');

    return () => {
      document.body.classList.remove('travelpay-stays-page-active');
    };
  }, []);

  useEffect(() => {
    const loadStays = async () => {
      try {
        const response = await api.get('/accommodations');
        const source = response.data?.length ? response.data : fallbackStays;
        setStays(source.map(normalizeStay));
      } catch (error) {
        setStays(fallbackStays.map(normalizeStay));
        message.info('Сервер временно недоступен, показаны демо-домики.');
      } finally {
        setLoading(false);
      }
    };

    loadStays();
  }, []);

  const filteredStays = useMemo(
    () =>
      stays.filter((stay) => {
        const haystack = `${stay.title} ${stay.location} ${stay.description} ${stay.companyName}`.toLowerCase();
        const matchesQuery = !filters.query || haystack.includes(filters.query.toLowerCase());
        const matchesType = filters.type === 'all' || stay.type === filters.type;
        const matchesGuests = !filters.guests || Number(stay.capacity) >= Number(filters.guests);
        const matchesPrice = !filters.maxPrice || Number(stay.pricePerNight) <= Number(filters.maxPrice);
        const matchesAmenity = filters.amenity === 'all' || stay.amenities.includes(filters.amenity);
        const matchesCompany = filters.company === 'all' || String(stay.companyId || stay.companyName || 'partner') === filters.company;
        const isVisible = stay.status !== 'archived' && stay.status !== 'sold_out';

        return matchesQuery && matchesType && matchesGuests && matchesPrice && matchesAmenity && matchesCompany && isVisible;
      }),
    [filters, stays],
  );

  const companyOptions = useMemo(() => {
    const seen = new Map();

    stays.forEach((stay) => {
      const key = String(stay.companyId || stay.companyName || 'partner');
      if (!seen.has(key)) {
        seen.set(key, { value: key, label: stay.companyName || 'TravelPay Partner' });
      }
    });

    return [{ value: 'all', label: 'Все компании' }, ...Array.from(seen.values())];
  }, [stays]);

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <main className="stays-page">
      <section className="stays-hero">
        <div className="stays-hero__bg" />
        <div className="stays-hero__ambient-glow stays-hero__ambient-glow--gold" />
        <div className="stays-hero__ambient-glow stays-hero__ambient-glow--blue" />

        <div className="stays-hero__layout">
          <motion.div className="stays-hero__content" {...heroMotion}>
            <Tag className="stays-kicker">
              <HomeOutlined />
              TravelPay Stays
            </Tag>

            <div className="stays-hero__headline">
              <Title>
                Домики и
                <br />
                коттеджи для
                <br />
                отдыха в
                <br />
                <span>Кыргызстане</span>
              </Title>
              <span className="stays-hero__sparkle">✦</span>
            </div>

            <div className="stays-hero__line" />

            <Paragraph>
              Выбирайте шале, юрты, глэмпинги и гостевые дома с понятной ценой, свободными местами и быстрым
              бронированием.
            </Paragraph>

            <Space wrap size={14} className="stays-hero__actions">
              <Button
                className="stays-hero__primary"
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={() => document.getElementById('stays-catalog')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Найти домик
              </Button>
              <Button
                className="stays-hero__secondary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={() => navigate('/business')}
              >
                Разместить объект
              </Button>
            </Space>
          </motion.div>

          <motion.div
            className="stays-hero__visual"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.82, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="stays-hero__visual-image" />
            <div className="stays-hero__visual-overlay" />
            <div className="stays-hero__visual-sheen" />
            <div className="stays-hero__visual-glow" />
            <div className="stays-hero__visual-line" />
          </motion.div>
        </div>
      </section>

      <section className="stays-search-shell">
        <Card className="stays-search-card">
          <Row gutter={[14, 14]} align="bottom">
            <Col xs={24} lg={7}>
              <Text>Поиск</Text>
              <Input
                size="large"
                prefix={<SearchOutlined />}
                placeholder="Иссык-Куль, шале, юрта..."
                value={filters.query}
                onChange={(event) => setFilter('query', event.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Text>Тип</Text>
              <Select size="large" value={filters.type} options={STAY_TYPE_OPTIONS} onChange={(value) => setFilter('type', value)} />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Text>Гости</Text>
              <InputNumber size="large" min={1} max={30} value={filters.guests} placeholder="2+" onChange={(value) => setFilter('guests', value)} />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Text>Компания</Text>
              <Select size="large" value={filters.company} options={companyOptions} onChange={(value) => setFilter('company', value)} />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Text>Цена до</Text>
              <InputNumber size="large" min={0} step={1000} value={filters.maxPrice} placeholder="сом" onChange={(value) => setFilter('maxPrice', value)} />
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Text>Даты</Text>
              <RangePicker size="large" style={{ width: '100%' }} placeholder={['Заезд', 'Выезд']} />
            </Col>
          </Row>

          <div className="stays-amenities-row">
            <Button type={filters.amenity === 'all' ? 'primary' : 'default'} onClick={() => setFilter('amenity', 'all')}>
              Все удобства
            </Button>
            {STAY_AMENITIES.slice(0, isMobile ? 5 : 10).map((amenity) => (
              <Button key={amenity} type={filters.amenity === amenity ? 'primary' : 'default'} onClick={() => setFilter('amenity', amenity)}>
                {amenity}
              </Button>
            ))}
          </div>
        </Card>
      </section>

      <section id="stays-catalog" className="stays-catalog">
        <div className="stays-section-head">
          <Tag className="stays-kicker">Каталог проживания</Tag>
          <Title level={2}>Домики, которые хочется забронировать сразу</Title>
          <Paragraph>Каждая карточка показывает цену за ночь, вместимость, удобства и доступность.</Paragraph>
        </div>

        {loading ? (
          <Row gutter={[22, 22]}>
            {[1, 2, 3].map((item) => (
              <Col xs={24} md={12} xl={8} key={item}>
                <Card className="stay-card"><Skeleton active /></Card>
              </Col>
            ))}
          </Row>
        ) : filteredStays.length ? (
          <Row gutter={[22, 22]}>
            {filteredStays.map((stay, index) => (
              <Col xs={24} md={12} xl={8} key={stay.id}>
                <motion.article
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.42, delay: Math.min(index * 0.04, 0.2) }}
                >
                  <Card className="stay-card" hoverable onClick={() => navigate(`/stays/${stay.id}`)}>
                    <div className="stay-card__media">
                      <img src={stay.images?.[0]} alt={stay.title} onError={withStayFallback} />
                      <Tag className="stay-card__type">{getStayTypeLabel(stay.type)}</Tag>
                      <div className="stay-card__rating">
                        <Rate disabled allowHalf value={stay.rating} />
                        <span>{stay.rating}</span>
                      </div>
                    </div>
                    <div className="stay-card__body">
                      <div className="stay-card__top">
                        <Tag>
                          <EnvironmentOutlined />
                          {' '}
                          {stay.city}
                        </Tag>
                        <span>{stay.availableCount} свободно</span>
                      </div>
                      <CompanyBadge
                        companyName={stay.companyName}
                        companyLogo={stay.companyLogo}
                        companyCity={stay.companyCity}
                        companyVerified={stay.companyVerified}
                        size="compact"
                        variant="glass"
                      />
                      <Title level={3}>{stay.title}</Title>
                      <Paragraph ellipsis={{ rows: 2 }}>{stay.description}</Paragraph>
                      <div className="stay-card__meta">
                        <div><TeamOutlined /><span>до {stay.capacity} гостей</span></div>
                        <div><HomeOutlined /><span>{stay.rooms} комнаты</span></div>
                        <div><CalendarOutlined /><span>заезд сегодня</span></div>
                      </div>
                      <div className="stay-card__amenities">
                        {stay.amenities.slice(0, 4).map((amenity) => <Tag key={amenity}>{amenity}</Tag>)}
                      </div>
                      <div className="stay-card__footer">
                        <div>
                          <Text>от</Text>
                          <strong>{formatStayPrice(stay.pricePerNight)}</strong>
                          <span>за ночь</span>
                        </div>
                        <Button
                          type="primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/stays/${stay.id}`);
                          }}
                        >
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.article>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Под эти фильтры пока нет домиков" />
        )}
      </section>
    </main>
  );
};

export default StaysPage;
