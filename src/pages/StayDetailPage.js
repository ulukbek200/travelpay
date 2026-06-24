import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Grid,
  InputNumber,
  Modal,
  Rate,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import {
  fallbackStays,
  formatStayPrice,
  getStayTypeLabel,
  normalizeStay,
  withStayFallback,
} from '../utils/stays';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const StayDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [loading, setLoading] = useState(true);
  const [stays, setStays] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const loadStays = async () => {
      try {
        const response = await api.get('/accommodations');
        const source = response.data?.length ? response.data : fallbackStays;
        setStays(source.map(normalizeStay));
      } catch (error) {
        setStays(fallbackStays.map(normalizeStay));
      } finally {
        setLoading(false);
      }
    };

    loadStays();
  }, []);

  const stay = useMemo(() => stays.find((item) => String(item.id) === String(id)), [id, stays]);
  const gallery = stay?.images?.length ? stay.images : fallbackStays[0].images;

  if (loading) {
    return (
      <main className="stay-detail-page">
        <Card className="stay-detail-shell"><Skeleton active paragraph={{ rows: 8 }} /></Card>
      </main>
    );
  }

  if (!stay) {
    return (
      <main className="stay-detail-page">
        <Empty description="Домик не найден">
          <Button type="primary" onClick={() => navigate('/stays')}>Вернуться в каталог</Button>
        </Empty>
      </main>
    );
  }

  const nightsPreview = 2;
  const totalPreview = stay.pricePerNight * nightsPreview;

  return (
    <main className="stay-detail-page">
      <section className="stay-detail-hero">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stays')}>
          Назад к домикам
        </Button>
        <Tag className="stays-kicker"><HomeOutlined /> {getStayTypeLabel(stay.type)}</Tag>
        <Title>{stay.title}</Title>
        <Space wrap size={12}>
          <Tag><EnvironmentOutlined /> {stay.location}</Tag>
          <Tag><BankOutlined /> {stay.companyName}</Tag>
          <Tag><Rate disabled allowHalf value={stay.rating} /> {stay.rating}</Tag>
        </Space>
      </section>

      <section className="stay-detail-layout">
        <div className="stay-gallery">
          <div className="stay-gallery__main">
            <img src={gallery[0]} alt={stay.title} onError={withStayFallback} />
          </div>
          <div className="stay-gallery__thumbs">
            {(gallery.length > 1 ? gallery : [gallery[0], gallery[0], gallery[0]]).slice(0, 3).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${stay.title} ${index + 1}`} onError={withStayFallback} />
            ))}
          </div>
        </div>

        <Card className="stay-booking-card">
          <Text>Стоимость</Text>
          <Title level={2}>{formatStayPrice(stay.pricePerNight)}</Title>
          <Paragraph>за ночь, без скрытых платежей</Paragraph>
          <Divider />
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <div>
              <Text>Даты проживания</Text>
              <RangePicker style={{ width: '100%', marginTop: 8 }} size={isMobile ? 'middle' : 'large'} />
            </div>
            <div>
              <Text>Гости</Text>
              <InputNumber min={1} max={stay.capacity} value={guests} onChange={setGuests} style={{ width: '100%', marginTop: 8 }} size={isMobile ? 'middle' : 'large'} />
            </div>
            <div className="stay-booking-total">
              <span>{nightsPreview} ночи</span>
              <strong>{formatStayPrice(totalPreview)}</strong>
            </div>
            <Button type="primary" size="large" block onClick={() => setBookingOpen(true)}>
              Забронировать
            </Button>
          </Space>
        </Card>
      </section>

      <section className="stay-detail-content">
        <Row gutter={[22, 22]}>
          <Col xs={24} lg={15}>
            <Card className="stay-info-card">
              <Title level={3}>О домике</Title>
              <Paragraph>{stay.description}</Paragraph>
              <div className="stay-info-grid">
                <div><TeamOutlined /><strong>{stay.capacity}</strong><span>гостей</span></div>
                <div><HomeOutlined /><strong>{stay.rooms}</strong><span>комнаты</span></div>
                <div><CalendarOutlined /><strong>{stay.availableCount}</strong><span>свободно</span></div>
                <div><SafetyCertificateOutlined /><strong>Проверено</strong><span>TravelPay</span></div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <Card className="stay-info-card">
              <Title level={4}>Удобства</Title>
              <div className="stay-amenity-list">
                {stay.amenities.map((amenity) => (
                  <span key={amenity}><CheckCircleOutlined /> {amenity}</span>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24}>
            <Card className="stay-info-card">
              <Title level={4}>Правила проживания</Title>
              <Paragraph>{stay.rules}</Paragraph>
              <Text type="secondary">Адрес: {stay.address}</Text>
            </Card>
          </Col>
        </Row>
      </section>

      <Modal
        open={bookingOpen}
        title="Заявка на бронирование"
        okText="Отправить заявку"
        cancelText="Отмена"
        onCancel={() => setBookingOpen(false)}
        onOk={() => {
          setBookingOpen(false);
          message.success('Заявка отправлена. Менеджер TravelPay свяжется с вами.');
        }}
      >
        <Paragraph>
          Сейчас это быстрый запрос на бронирование. На следующем этапе подключим полноценную оплату и календарь занятости.
        </Paragraph>
        <Card size="small">
          <strong>{stay.title}</strong>
          <p>{guests} гостей · ориентир {formatStayPrice(totalPreview)}</p>
        </Card>
      </Modal>
    </main>
  );
};

export default StayDetailPage;
