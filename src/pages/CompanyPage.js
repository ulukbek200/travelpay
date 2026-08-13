import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App, Button, Card, Col, Divider, Empty, Form, Input, Modal, Rate, Row,
  Skeleton, Space, Tag, Typography,
} from 'antd';
import {
  CalendarOutlined, CheckCircleFilled, EditOutlined, EnvironmentOutlined,
  GlobalOutlined, HeartOutlined, InstagramOutlined, MailOutlined, PhoneOutlined,
  SafetyCertificateOutlined, SendOutlined, StarFilled, TeamOutlined,
} from '@ant-design/icons';
import api from '../api';
import AppImage from '../components/AppImage';
import { readCurrentUser } from '../utils/currentUser';

const { Title, Text, Paragraph } = Typography;
const fallbackCover = '/images/kyrgyzstan-mountains.jpg';

const safeArray = (value) => (Array.isArray(value) ? value : []);
const number = (value) => Number(value) || 0;
const formatPrice = (value) => `${number(value).toLocaleString('ru-RU')} сом`;

export default function CompanyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [company, setCompany] = useState(null);
  const [tours, setTours] = useState([]);
  const [stays, setStays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [form] = Form.useForm();
  const user = readCurrentUser();

  const load = async () => {
    setLoading(true);
    try {
      const [companiesResponse, toursResponse, staysResponse] = await Promise.all([
        api.get('/companies'),
        api.get('/tours'),
        api.get('/accommodations').catch(() => ({ data: [] })),
      ]);
      const found = safeArray(companiesResponse.data).find((item) => String(item.id) === String(id));
      setCompany(found || null);
      setTours(safeArray(toursResponse.data).filter((tour) => String(tour.companyId) === String(id)));
      setStays(safeArray(staysResponse.data).filter((stay) => String(stay.companyId) === String(id)));
    } catch (error) {
      message.error('Не удалось загрузить страницу компании. Попробуйте ещё раз.');
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isOwner = Boolean(company && user?.isLoggedIn && (
    String(user.companyId) === String(company.id)
    || String(user.role).toLowerCase() === 'super_admin'
  ));
  const gallery = useMemo(() => {
    const mediaImages = safeArray(company?.imagesMedia).map((item) => item?.urls?.large || item?.url).filter(Boolean);
    return [...mediaImages, ...safeArray(company?.images), ...tours.map((tour) => tour.image), ...stays.map((stay) => stay.image)]
      .filter(Boolean).slice(0, 6);
  }, [company, stays, tours]);
  const rating = useMemo(() => {
    const values = [...tours.map((tour) => number(tour.rating)), ...stays.map((stay) => number(stay.rating))].filter(Boolean);
    return values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 4.9;
  }, [stays, tours]);
  const reviews = useMemo(() => ([
    ...tours.flatMap((tour) => safeArray(tour.reviews).map((review) => ({ ...review, service: tour.title }))),
    ...stays.flatMap((stay) => safeArray(stay.reviews).map((review) => ({ ...review, service: stay.name || stay.title }))),
  ]).slice(0, 4), [stays, tours]);

  const openEdit = () => {
    form.setFieldsValue({
      name: company.name, description: company.description, phone: company.phone,
      email: company.email, city: company.city, address: company.address,
      instagramUrl: company.instagramUrl, logo: company.logo, cover: company.cover,
    });
    setEditOpen(true);
    setFormDirty(false);
  };

  const closeEdit = () => {
    if (saving) return;
    if (!formDirty) {
      setEditOpen(false);
      return;
    }
    Modal.confirm({
      title: 'Закрыть без сохранения?',
      content: 'Внесённые изменения останутся в черновике этой формы до обновления страницы, но не будут опубликованы.',
      okText: 'Закрыть',
      cancelText: 'Продолжить редактирование',
      okButtonProps: { danger: true },
      onOk: () => setEditOpen(false),
    });
  };

  const save = async (values) => {
    if (saving) return;
    setSaving(true);
    try {
      const response = await api.put(`/companies/${company.id}`, values);
      setCompany(response.data);
      setEditOpen(false);
      setFormDirty(false);
      message.success('Страница компании обновлена.');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Не удалось сохранить изменения.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="company-page company-page--loading"><Skeleton active paragraph={{ rows: 12 }} /></main>;
  if (!company) return (
    <main className="company-page"><Empty description="Компания не найдена"><Button onClick={() => navigate('/tours')}>К турам</Button></Empty></main>
  );

  const mapQuery = encodeURIComponent(company.address || company.city || 'Bishkek, Kyrgyzstan');
  const whatsappPhone = company.whatsapp || company.managerPhone || company.phone;
  const contactUrl = whatsappPhone ? `https://wa.me/${String(whatsappPhone).replace(/\D/g, '')}` : company.email ? `mailto:${company.email}` : '';

  return (
    <main className="company-page">
      <section className="company-hero">
        <AppImage src={company.cover || gallery[0] || fallbackCover} fallbackSrc={fallbackCover} alt="" aspectRatio="21 / 8" priority imgClassName="company-hero__cover" />
        <div className="company-hero__shade" />
        <div className="company-hero__content">
          <div className="company-hero__identity">
            <AppImage src={company.logo || fallbackCover} fallbackSrc={fallbackCover} alt={`${company.name} логотип`} aspectRatio="1 / 1" className="company-hero__logo" />
            <div>
              <Space size={8} wrap>
                <Title level={1}>{company.name}</Title>
                {company.verified && <Tag className="company-verified"><CheckCircleFilled /> Проверенный партнёр</Tag>}
              </Space>
              <Text><EnvironmentOutlined /> {[company.city || company.region, company.address].filter(Boolean).join(' · ') || 'Кыргызстан'}</Text>
            </div>
          </div>
          <Space wrap className="company-hero__actions">
            <Button icon={<HeartOutlined />} onClick={() => { setFavorite((value) => !value); message.success(favorite ? 'Компания удалена из избранного.' : 'Компания добавлена в избранное.'); }}>
              {favorite ? 'В избранном' : 'В избранное'}
            </Button>
            {contactUrl && <Button icon={<SendOutlined />} href={contactUrl} target="_blank">Связаться с менеджером</Button>}
            <Button type="primary" icon={<CalendarOutlined />} onClick={() => tours[0] ? navigate(`/booking`, { state: { tour: tours[0] } }) : stays[0] ? navigate(`/stays/${stays[0].id}`) : navigate('/tours')}>Забронировать</Button>
            {isOwner && <Button icon={<EditOutlined />} onClick={openEdit}>Редактировать страницу</Button>}
          </Space>
        </div>
      </section>

      <section className="company-layout">
        <div className="company-main">
          <Card className="company-about">
            <Text className="company-eyebrow">О компании</Text>
            <Title level={2}>Путешествия с заботой о деталях</Title>
            <Paragraph>{company.description || `${company.name} — партнёр TravelPay. Организуем понятные, безопасные и запоминающиеся поездки по Кыргызстану.`}</Paragraph>
            <div className="company-advantages">
              <span><SafetyCertificateOutlined /> Проверенные условия</span>
              <span><TeamOutlined /> Локальная команда</span>
              <span><StarFilled /> Поддержка до поездки</span>
              {company.workingHours && <span><CalendarOutlined /> {company.workingHours}</span>}
            </div>
          </Card>

          <section className="company-section">
            <div className="company-section__head"><div><Text className="company-eyebrow">Предложения</Text><Title level={2}>Туры и услуги</Title></div><Button type="link" onClick={() => navigate('/tours', { state: { companyFilter: String(company.id) } })}>Все предложения</Button></div>
            {tours.length || stays.length ? <Row gutter={[18, 18]}>
              {tours.map((tour) => <Col xs={24} sm={12} key={`tour-${tour.id}`}><Card hoverable className="company-offer" cover={<AppImage src={tour.image} alt={tour.title} aspectRatio="16 / 10" />} onClick={() => navigate(`/tours/${tour.id}`)}><Tag color="blue">Тур</Tag><Title level={4}>{tour.title}</Title><Text type="secondary">{tour.location || tour.city}</Text><strong>{formatPrice(tour.price)}</strong></Card></Col>)}
              {stays.map((stay) => <Col xs={24} sm={12} key={`stay-${stay.id}`}><Card hoverable className="company-offer" cover={<AppImage src={stay.image} alt={stay.name} aspectRatio="16 / 10" />} onClick={() => navigate(`/stays/${stay.id}`)}><Tag color="cyan">Домик</Tag><Title level={4}>{stay.name}</Title><Text type="secondary">{stay.location || stay.city}</Text><strong>{formatPrice(stay.pricePerNight)} / ночь</strong></Card></Col>)}
            </Row> : <Empty description="Скоро здесь появятся предложения компании." />}
          </section>

          {gallery.length > 0 && <section className="company-section"><div className="company-section__head"><div><Text className="company-eyebrow">Галерея</Text><Title level={2}>Атмосфера поездок</Title></div></div><div className="company-gallery">{gallery.map((image, index) => <AppImage key={`${image}-${index}`} src={image} alt={`${company.name}, фото ${index + 1}`} aspectRatio="4 / 3" />)}</div></section>}

          <section className="company-section">
            <div className="company-section__head"><div><Text className="company-eyebrow">Отзывы</Text><Title level={2}>Что говорят гости</Title></div></div>
            {reviews.length ? <Row gutter={[16, 16]}>
              {reviews.map((review, index) => <Col xs={24} md={12} key={`${review.service}-${index}`}><Card><Rate disabled allowHalf value={number(review.rating) || 5} /><Paragraph>{review.text || review.comment || 'Отличная поездка и внимательная команда.'}</Paragraph><Text type="secondary">{review.author || review.name || 'Гость TravelPay'} · {review.service}</Text></Card></Col>)}
            </Row> : <Empty description="Отзывы появятся после первых поездок и бронирований." />}
          </section>
        </div>

        <aside className="company-side">
          <Card className="company-rating"><Text type="secondary">Рейтинг путешественников</Text><div><strong>{rating.toFixed(1)}</strong><Rate disabled allowHalf value={rating} /></div><Text>{tours.length ? `${tours.length} предложений компании` : 'Новые отзывы появятся после поездок'}</Text></Card>
          <Card><Title level={4}>Контакты</Title><Space direction="vertical" size={14} className="company-contact-list">
            {company.phone && <a href={`tel:${company.phone}`}><PhoneOutlined /> {company.phone}</a>}
            {company.whatsapp && <a href={`https://wa.me/${String(company.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><SendOutlined /> WhatsApp</a>}
            {company.email && <a href={`mailto:${company.email}`}><MailOutlined /> {company.email}</a>}
            {company.instagramUrl && <a href={company.instagramUrl} target="_blank" rel="noreferrer"><InstagramOutlined /> Instagram</a>}
            {company.website && <a href={company.website} target="_blank" rel="noreferrer"><GlobalOutlined /> Website</a>}
            {company.workingHours && <Text><CalendarOutlined /> {company.workingHours}</Text>}
          </Space><Divider /><Title level={5}>Условия бронирования</Title><Paragraph type="secondary">После заявки менеджер подтвердит свободные места и детали оплаты. Отмена и изменения доступны до подтверждения брони.</Paragraph></Card>
          <Card className="company-map-card"><Text className="company-eyebrow">Расположение</Text><Title level={4}>{company.address || company.city || 'Кыргызстан'}</Title><a className="company-map-link" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer"><EnvironmentOutlined /><span>Открыть на карте</span><GlobalOutlined /></a></Card>
        </aside>
      </section>

      <Modal title="Редактировать страницу компании" open={editOpen} onCancel={closeEdit} footer={null} destroyOnHidden={false} maskClosable={!formDirty} keyboard={!formDirty}>
        <Form layout="vertical" form={form} onFinish={save} onValuesChange={() => setFormDirty(true)}>
          <Form.Item label="Название" name="name" rules={[{ required: true, message: 'Укажите название' }]}><Input /></Form.Item>
          <Form.Item label="Описание" name="description"><Input.TextArea rows={4} /></Form.Item>
          <Row gutter={12}><Col span={12}><Form.Item label="Телефон" name="phone"><Input /></Form.Item></Col><Col span={12}><Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Укажите корректный email' }]}><Input /></Form.Item></Col></Row>
          <Form.Item label="Город" name="city"><Input /></Form.Item><Form.Item label="Адрес" name="address"><Input /></Form.Item>
          <Form.Item label="Instagram URL" name="instagramUrl"><Input /></Form.Item><Form.Item label="Ссылка на логотип" name="logo"><Input /></Form.Item><Form.Item label="Ссылка на обложку" name="cover"><Input /></Form.Item>
          <Space><Button onClick={closeEdit} disabled={saving}>Отменить</Button><Button htmlType="submit" type="primary" loading={saving}>Сохранить</Button></Space>
        </Form>
      </Modal>
    </main>
  );
}
