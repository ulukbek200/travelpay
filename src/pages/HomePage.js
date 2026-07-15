import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightOutlined, ClockCircleOutlined, CompassOutlined, CustomerServiceOutlined, DownOutlined, EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, StarFilled, TeamOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Col, Input, Row, Segmented, Space, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import { FiArrowDown, FiBriefcase, FiCheckCircle, FiCreditCard, FiGlobe, FiMail, FiMap, FiMessageCircle, FiShield, FiStar, FiTrendingUp, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api, { getAssetUrl } from '../api';
import kyrgyzstanRegionsUrl from '../data/kyrgyzstan-regions.geojson';
import { KYRGYZSTAN_TOUR_SPOTS, TOUR_IMAGE_FALLBACK, withTourFallback } from '../utils/tourMedia';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const BRAND_BLUE = '#16324F';
const BRAND_TURQUOISE = '#2BB8C5';
const BRAND_GOLD = '#F0B24A';

const copy = {
  RU: {
    heroTag: 'Премиальные туры по Кыргызстану',
    heroTitle: 'TravelPay делает туры по Кыргызстану визуально богаче, удобнее и современнее.',
    heroText: 'Подбирайте маршруты по Ала-Арче, Иссык-Кулю, Сон-Кулю, Караколу, Джети-Огузу и Арсланбобу в премиальном digital-формате с красивой галереей, локальной экспертизой и поддержкой AI Concierge.',
    primary: 'Выбрать тур',
    secondary: 'Открыть AI Concierge',
    showcaseTitle: 'Главные локации Кыргызстана',
    showcaseText: 'Компактные карточки с реальными локациями, понятной ценой, длительностью и рейтингом.',
    toursTitle: 'Популярные форматы отдыха',
    toursText: 'Каждый формат построен вокруг красивой картинки, понятного предложения и удобного перехода к каталогу.',
    whyTitle: 'Почему выбирают TravelPay',
    galleryTitle: 'Действующие туры',
    galleryText: 'Актуальные туры по Кыргызстану с понятными карточками, ценами и быстрым переходом к бронированию.',
    faqTitle: 'Частые вопросы',
    partnerTitle: 'Партнёрство для туркомпаний',
    partnerText: 'Оставьте контакты, если хотите публиковать туры и получать заявки внутри TravelPay.',
    partnerName: 'Ваше имя',
    partnerCompany: 'Компания',
    partnerEmail: 'Email',
    partnerMessage: 'Какой формат партнёрства вам интересен?',
    partnerSubmit: 'Отправить заявку',
    partnerBusiness: 'Перейти в TravelPay Business',
    partnerRegisterCompany: 'Зарегистрировать компанию',
    footerText: 'Premium travel across Kyrgyzstan with a cleaner UI, stronger gallery and modern booking flow.',
  },
  EN: {
    heroTag: 'Premium tours in Kyrgyzstan',
    heroTitle: 'TravelPay makes Kyrgyzstan tours richer, cleaner, and more modern.',
    heroText: 'Explore Ala-Archa, Issyk-Kul, Son-Kul, Karakol, Jeti-Oguz, and Arslanbob with a premium visual flow, compact galleries, and AI Concierge support.',
    primary: 'Choose Tour',
    secondary: 'Open AI Concierge',
    showcaseTitle: 'Signature Kyrgyzstan spots',
    showcaseText: 'Compact cards with real locations, visible pricing, duration, and rating.',
    toursTitle: 'Popular travel formats',
    toursText: 'Each format is built around strong imagery, clean structure, and direct navigation to the catalog.',
    whyTitle: 'Why TravelPay',
    galleryTitle: 'Active tours',
    galleryText: 'Current tours across Kyrgyzstan with clear cards, pricing, and fast booking access.',
    faqTitle: 'FAQ',
    partnerTitle: 'Partnership for tour companies',
    partnerText: 'Leave your contacts if you want to publish tours and receive requests inside TravelPay.',
    partnerName: 'Your name',
    partnerCompany: 'Company',
    partnerEmail: 'Email',
    partnerMessage: 'What kind of partnership are you looking for?',
    partnerSubmit: 'Send request',
    partnerBusiness: 'Open TravelPay Business',
    partnerRegisterCompany: 'Register company',
    footerText: 'Premium travel across Kyrgyzstan with a cleaner UI, stronger gallery and modern booking flow.',
  },
  KG: {
    heroTag: 'Кыргызстан боюнча премиум турлар',
    heroTitle: 'TravelPay турларды заманбап, кооз жана ыңгайлуу кылып көрсөтөт.',
    heroText: 'Ала-Арча, Ысык-Көл, Соң-Көл, Каракол, Жети-Өгүз жана Арсланбапты премиум галерея, түшүнүктүү карточкалар жана AI Concierge менен тандаңыз.',
    primary: 'Тур тандоо',
    secondary: 'AI Concierge ачуу',
    showcaseTitle: 'Кыргызстандын кооз жерлери',
    showcaseText: 'Чыныгы локациялар, баа, узактык жана рейтинг көрсөтүлгөн компакт карточкалар.',
    toursTitle: 'Саякат форматтары',
    toursText: 'Ар бир формат кооз визуал, түшүнүктүү структура жана каталогго тез өтүү үчүн түзүлгөн.',
    whyTitle: 'Эмне үчүн TravelPay',
    galleryTitle: 'Учурдагы турлар',
    galleryText: 'Кыргызстан боюнча актуалдуу турлар баасы жана брондоого тез өтүү менен көрсөтүлөт.',
    faqTitle: 'FAQ',
    partnerTitle: 'Туркомпаниялар үчүн өнөктөштүк',
    partnerText: 'TravelPay ичинде тур жайгаштырып, суроо-талап алуу үчүн байланыш калтырыңыз.',
    partnerName: 'Атыңыз',
    partnerCompany: 'Компания',
    partnerEmail: 'Email',
    partnerMessage: 'Кайсы өнөктөштүк форматы кызыктырат?',
    partnerSubmit: 'Суроо жөнөтүү',
    partnerBusiness: 'TravelPay Business ачуу',
    partnerRegisterCompany: 'Компанияны каттоо',
    footerText: 'Premium travel across Kyrgyzstan with a cleaner UI, stronger gallery and modern booking flow.',
  },
};

const mapSectionCopy = {
  RU: {
    title: 'Карта Кыргызстана в atlas-стиле с живой анимацией регионов.',
    text: 'Бишкек, Чуй, Нарын, Ош, Баткен, Талас, Джалал-Абад и Ысык-Көл подсвечиваются как живая навигационная карта.',
  },
  EN: {
    title: 'A Kyrgyzstan atlas-style map with animated regional highlights.',
    text: 'Bishkek, Chuy, Naryn, Osh, Batken, Talas, Jalal-Abad, and Ysyk-Kol glow like a living navigation map.',
  },
  KG: {
    title: 'Atlas стилиндеги Кыргызстандын жандуу аймактык картасы.',
    text: 'Бишкек, Чүй, Нарын, Ош, Баткен, Талас, Жалал-Абад жана Ысык-Көл жарык акценттер менен жанданып турат.',
  },
};

const heroExperienceCopy = {
  RU: {
    benefits: [
      { key: 'rating', value: '4.9', label: 'Средний рейтинг путешественников' },
      { key: 'tours', value: '150+', label: 'Туров по Кыргызстану' },
      { key: 'verified', value: '100%', label: 'Проверенные туроператоры' },
    ],
    tourTitle: 'Kel-Suu Lake',
    rating: '4.9',
    duration: '3 дня',
    seats: '12 мест осталось',
    price: 'от 4500 сом',
    details: 'Подробнее',
    scroll: 'Исследуйте Кыргызстан',
  },
  EN: {
    benefits: [
      { key: 'rating', value: '4.9', label: 'Average traveler rating' },
      { key: 'tours', value: '150+', label: 'Tours across Kyrgyzstan' },
      { key: 'verified', value: '100%', label: 'Verified tour operators' },
    ],
    tourTitle: 'Kel-Suu Lake',
    rating: '4.9',
    duration: '3 days',
    seats: '12 spots left',
    price: 'from 4500 som',
    details: 'Details',
    scroll: 'Explore Kyrgyzstan',
  },
  KG: {
    benefits: [
      { key: 'rating', value: '4.9', label: 'Саякатчылардын орточо рейтинги' },
      { key: 'tours', value: '150+', label: 'Кыргызстан боюнча турлар' },
      { key: 'verified', value: '100%', label: 'Текшерилген туроператорлор' },
    ],
    tourTitle: 'Kel-Suu Lake',
    rating: '4.9',
    duration: '3 күн',
    seats: '12 орун калды',
    price: '4500 сомдон',
    details: 'Кененирээк',
    scroll: 'Кыргызстанды изилдеңиз',
  },
};

const heroTrustCopy = {
  RU: {
    title: 'Почему выбирают TravelPay',
    tourKicker: 'Рекомендуем сегодня',
    items: [
      { key: 'verified', label: 'Проверенные туркомпании' },
      { key: 'fast', label: 'Быстрое бронирование' },
      { key: 'wallet', label: 'Накопительная система' },
      { key: 'ai', label: 'AI Concierge' },
    ],
  },
  EN: {
    title: 'Why travelers choose TravelPay',
    tourKicker: 'Recommended today',
    items: [
      { key: 'verified', label: 'Verified operators' },
      { key: 'fast', label: 'Fast booking' },
      { key: 'wallet', label: 'Savings system' },
      { key: 'ai', label: 'AI Concierge' },
    ],
  },
  KG: {
    title: 'Эмне үчүн TravelPay',
    tourKicker: 'Бүгүн сунуштайбыз',
    items: [
      { key: 'verified', label: 'Текшерилген компаниялар' },
      { key: 'fast', label: 'Тез брондоо' },
      { key: 'wallet', label: 'Топтоо системасы' },
      { key: 'ai', label: 'AI Concierge' },
    ],
  },
};

const heroPopularTours = [
  {
    key: 'kel-suu',
    route: '/tours/kel-suu',
    title: { RU: 'Кель-Суу', EN: 'Kel-Suu', KG: 'Көл-Суу' },
    rating: '4.9',
    duration: { RU: '3 дня', EN: '3 days', KG: '3 күн' },
    seats: { RU: '12 мест осталось', EN: '12 spots left', KG: '12 орун калды' },
    price: { RU: 'от 4500 сом', EN: 'from 4500 som', KG: '4500 сомдон' },
  },
  {
    key: 'son-kul',
    route: '/tours/son-kul',
    title: { RU: 'Сон-Куль', EN: 'Son-Kul', KG: 'Соң-Көл' },
    rating: '4.8',
    duration: { RU: '2 дня', EN: '2 days', KG: '2 күн' },
    seats: { RU: '8 мест осталось', EN: '8 spots left', KG: '8 орун калды' },
    price: { RU: 'от 3800 сом', EN: 'from 3800 som', KG: '3800 сомдон' },
  },
  {
    key: 'ala-kul',
    route: '/tours/ala-kul',
    title: { RU: 'Ала-Куль', EN: 'Ala-Kul', KG: 'Ала-Көл' },
    rating: '4.9',
    duration: { RU: '4 дня', EN: '4 days', KG: '4 күн' },
    seats: { RU: '6 мест осталось', EN: '6 spots left', KG: '6 орун калды' },
    price: { RU: 'от 6500 сом', EN: 'from 6500 som', KG: '6500 сомдон' },
  },
  {
    key: 'jeti-oguz',
    route: '/tours/jeti-oguz',
    title: { RU: 'Джеты-Огуз', EN: 'Jeti-Oguz', KG: 'Жети-Өгүз' },
    rating: '4.7',
    duration: { RU: '1 день', EN: '1 day', KG: '1 күн' },
    seats: { RU: '15 мест осталось', EN: '15 spots left', KG: '15 орун калды' },
    price: { RU: 'от 2900 сом', EN: 'from 2900 som', KG: '2900 сомдон' },
  },
];

const kyrgyzstanMapStops = [
  { key: 'batken', label: 'Batken', x: 78, y: 232 },
  { key: 'osh', label: 'Osh', x: 168, y: 222 },
  { key: 'jalal-abad', label: 'Jalal-Abad', x: 136, y: 184 },
  { key: 'talas', label: 'Talas', x: 92, y: 112 },
  { key: 'bishkek', label: 'Bishkek', x: 154, y: 118 },
  { key: 'chuy', label: 'Chuy', x: 208, y: 108 },
  { key: 'naryn', label: 'Naryn', x: 246, y: 188 },
  { key: 'ysyk-kol', label: 'Ysyk-Kol', x: 350, y: 126 },
];

const premiumMapSectionCopy = {
  RU: {
    title: 'Исследуйте Кыргызстан по регионам',
    text: 'Выберите область, чтобы посмотреть маршруты, туры и популярные направления.',
    eyebrow: 'Digital atlas',
    tours: 'туров',
    viewTours: 'Посмотреть туры',
    activeRegion: 'Выбранный регион',
    regionList: 'Регионы',
    zoomIn: 'Приблизить карту',
    zoomOut: 'Отдалить карту',
    reset: 'Сбросить',
  },
  EN: {
    title: 'Explore Kyrgyzstan by region',
    text: 'Choose a region to see routes, tours, and popular travel directions.',
    eyebrow: 'Digital atlas',
    tours: 'tours',
    viewTours: 'View tours',
    activeRegion: 'Selected region',
    regionList: 'Regions',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    reset: 'Reset',
  },
  KG: {
    title: 'Кыргызстанды аймактар боюнча изилдеңиз',
    text: 'Маршруттарды, турларды жана популярдуу багыттарды көрүү үчүн аймакты тандаңыз.',
    eyebrow: 'Digital atlas',
    tours: 'тур',
    viewTours: 'Турларды көрүү',
    activeRegion: 'Тандалган аймак',
    regionList: 'Аймактар',
    zoomIn: 'Жакындатуу',
    zoomOut: 'Алыстатуу',
    reset: 'Калыбына келтирүү',
  },
};

const KYRGYZSTAN_MAP_VIEWBOX = { width: 900, height: 560 };

const kyrgyzstanMapDestinations = [
  { key: 'bishkek', label: 'Бишкек', coordinates: [74.6, 42.87] },
  { key: 'karakol', label: 'Каракол', coordinates: [78.38, 42.49] },
  { key: 'son-kul', label: 'Сон-Куль', coordinates: [75.12, 41.85] },
  { key: 'kel-suu', label: 'Кель-Суу', coordinates: [76.58, 40.62] },
  { key: 'osh', label: 'Ош', coordinates: [72.79, 40.52] },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

void mapSectionCopy;
void kyrgyzstanMapStops;

const travelFormats = [
  {
    title: 'Private Tours',
    text: 'Персональные маршруты с приватным гидом, гибким таймингом и премиальным трансфером.',
    icon: <TeamOutlined />,
  },
  {
    title: 'Lake & Mountain Escapes',
    text: 'Иссык-Куль, Сон-Куль, Каракол и высокогорные панорамы с выверенным темпом.',
    icon: <EnvironmentOutlined />,
  },
  {
    title: 'Photo-Ready Adventures',
    text: 'Джети-Огуз, Ала-Арча и scenic stop-пойнты для красивых фото и коротких треков.',
    icon: <CompassOutlined />,
  },
];

const extraGallerySpots = [
  {
    key: 'sary-chelek',
    title: 'Сары-Челек',
    location: 'Джалал-Абадская область',
    duration: '3 дня',
    price: 34000,
    rating: 4.8,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Заповедное горное озеро, тихие панорамы и маршрут для спокойного premium nature-отдыха.',
  },
  {
    key: 'kol-suu',
    title: 'Кёль-Суу',
    location: 'Нарынская область',
    duration: '4 дня',
    price: 46000,
    rating: 4.9,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Высокогорное озеро среди скал, удалённый маршрут и сильная adventure-атмосфера.',
  },
];

const fallbackGalleryCards = [...KYRGYZSTAN_TOUR_SPOTS, ...extraGallerySpots].map((spot, index) => ({
  ...spot,
  accent: index % 2 === 0 ? 'gold' : 'blue',
}));

const parseTourPrice = (value, fallback = 0) => Number(String(value || fallback).replace(/[^0-9]/g, '')) || fallback;

const resolveHomeTourImage = (tour, fallbackImage) => {
  const gallery = Array.isArray(tour?.gallery) ? tour.gallery.filter(Boolean) : [];
  const rawImage = String(tour?.image || tour?.coverImage || gallery[0] || fallbackImage || TOUR_IMAGE_FALLBACK);

  if (/^https?:\/\//i.test(rawImage) || rawImage.startsWith('data:') || rawImage.startsWith('/images/')) {
    return rawImage;
  }

  if (rawImage.startsWith('/uploads/') || rawImage.startsWith('uploads/')) {
    return getAssetUrl(rawImage);
  }

  return rawImage;
};

const getHomeTourStartLabel = (tour) => {
  const slots = Array.isArray(tour?.departureSlots) ? tour.departureSlots : [];
  const now = Date.now();
  const nextSlot = slots
    .filter((slot) => slot?.active !== false && slot?.startAt && new Date(slot.startAt).getTime() >= now)
    .sort((left, right) => new Date(left.startAt) - new Date(right.startAt))[0];
  const dateValue = nextSlot?.startAt || tour?.startDate || tour?.date;

  if (!dateValue) {
    return '';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date);
};

const isPublicHomeTour = (tour) => {
  const status = String(tour?.status || tour?.calendarStatus || '').toLowerCase();
  return Boolean(tour?.title)
    && tour?.active !== false
    && !['inactive', 'archived', 'draft', 'cancelled', 'canceled'].includes(status);
};

const normalizeHomeGalleryTour = (tour, index = 0) => {
  const fallback = fallbackGalleryCards[index % fallbackGalleryCards.length] || {};
  const durationSource = tour?.duration || fallback.duration || '';
  const durationDays = Number(String(tour?.durationDays || durationSource).match(/\d+/)?.[0]) || '';
  const price = parseTourPrice(tour?.price, fallback.price);
  const rating = Number(tour?.rating || fallback.rating || 4.8);

  return {
    ...fallback,
    ...tour,
    key: String(tour?.id || tour?.slug || tour?.title || fallback.key || `home-tour-${index}`),
    id: tour?.id || fallback.id,
    title: tour?.title || fallback.title,
    location: tour?.location || tour?.city || fallback.location || 'Кыргызстан',
    city: tour?.city || tour?.location || fallback.location || 'Кыргызстан',
    description: tour?.description || fallback.description || '',
    duration: durationSource || (durationDays ? `${durationDays} дня` : fallback.duration || ''),
    price,
    rating: Number.isFinite(rating) ? rating : 4.8,
    image: resolveHomeTourImage(tour, fallback.image),
    startLabel: getHomeTourStartLabel(tour),
    accent: index % 2 === 0 ? 'gold' : 'blue',
    isActualTour: true,
  };
};

const whyTravelPay = [
  ['Local Expertise', 'Маршруты по реальным локациям Кыргызстана с локальным контекстом.', <CompassOutlined />],
  ['Premium Support', 'KG, RU, EN коммуникация до, во время и после поездки.', <CustomerServiceOutlined />],
  ['Safe Planning', 'Понятные CTA, прозрачная стоимость и аккуратный booking flow.', <SafetyCertificateOutlined />],
];

const faqItems = {
  RU: [
    { key: '1', label: 'Какие локации доступны сейчас?', children: 'Ала-Арча, Иссык-Куль, Сон-Куль, Каракол, Джети-Огуз и Арсланбоб уже оформлены как приоритетные направления.' },
    { key: '2', label: 'Можно ли заказать приватный тур?', children: 'Да, TravelPay поддерживает private format с персональным гидом, транспортом и гибким маршрутом.' },
    { key: '3', label: 'Есть ли поддержка на нескольких языках?', children: 'Да, доступна поддержка на KG, RU и EN.' },
  ],
  EN: [
    { key: '1', label: 'Which locations are available?', children: 'Ala-Archa, Issyk-Kul, Son-Kul, Karakol, Jeti-Oguz, and Arslanbob are highlighted as key destinations.' },
    { key: '2', label: 'Can I request a private tour?', children: 'Yes, private format includes flexible routing, personal guide, and premium transfer.' },
    { key: '3', label: 'Is multilingual support available?', children: 'Yes, TravelPay supports KG, RU, and EN communication.' },
  ],
  KG: [
    { key: '1', label: 'Кайсы локациялар бар?', children: 'Ала-Арча, Ысык-Көл, Соң-Көл, Каракол, Жети-Өгүз жана Арсланбап негизги багыттар катары көрсөтүлдү.' },
    { key: '2', label: 'Жеке тур заказ кылса болобу?', children: 'Ооба, жеке гид, ыңгайлуу транспорт жана ийкемдүү маршрут менен private формат бар.' },
    { key: '3', label: 'Бир нече тилде колдоо барбы?', children: 'Ооба, KG, RU жана EN тилдеринде колдоо бар.' },
  ],
};

const socialLinks = [
  { key: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/996555123456', icon: <WhatsAppOutlined /> },
  { key: 'email', label: 'Email', href: 'mailto:hello@travelpay.kg', icon: <MailOutlined /> },
  { key: 'phone', label: '+996 555 123 456', href: 'tel:+996555123456', icon: <PhoneOutlined /> },
];

const partnershipBenefits = [
  { icon: <FiShield />, text: 'Проверенные заявки' },
  { icon: <FiTrendingUp />, text: 'Рост продаж' },
  { icon: <FiGlobe />, text: 'Клиенты со всего Кыргызстана' },
  { icon: <FiCreditCard />, text: 'Безопасные платежи' },
];

const partnershipStats = [
  { value: 150, suffix: '+', label: 'туров' },
  { value: 25, suffix: '+', label: 'туркомпаний' },
  { value: 5000, suffix: '+', label: 'клиентов' },
  { value: 4.9, suffix: '★', label: 'рейтинг', decimals: 1 },
];

const partnershipSteps = [
  'Зарегистрируйте компанию',
  'Добавьте туры',
  'Получайте заявки',
  'Развивайте продажи',
];

const partnerFormTrust = ['Ответ в течение 24 часов', 'Бесплатное подключение', 'Персональный менеджер'];

const partnerFloatingCards = [
  { icon: <FiTrendingUp />, text: '+42 новых бронирования', position: 'top' },
  { icon: <FiStar />, text: '4.9 рейтинг компаний', position: 'left' },
  { icon: <FiMap />, text: '150 опубликованных туров', position: 'right' },
];

const partnerLogos = ['Barsbek Travel', 'Doc Medical', 'TravelPay Business', 'Nomad Routes', 'Kyrgyz Peaks', 'Silk Road Hub'];

const CountUpStat = ({ stat }) => {
  const statRef = useRef(null);
  const rafRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const node = statRef.current;

    if (!node || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasStarted(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted || typeof window === 'undefined') {
      return undefined;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setDisplayValue(stat.value);
      return undefined;
    }

    const start = window.performance.now();
    const duration = 1200;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(stat.value * eased);

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(animate);
      }
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hasStarted, stat.value]);

  const value = stat.decimals
    ? displayValue.toFixed(stat.decimals)
    : Math.round(displayValue).toLocaleString('ru-RU');

  return (
    <article className="home-partner-stat" ref={statRef}>
      <strong>{value}{stat.suffix}</strong>
      <span>{stat.label}</span>
    </article>
  );
};

const motionCard = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.5 },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem('travelpay_language') || 'RU');
  const [partnerForm, setPartnerForm] = useState({ name: '', company: '', email: '', message: '' });
  const [heroVideoLoaded, setHeroVideoLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeHeroTourIndex, setActiveHeroTourIndex] = useState(0);
  const [isHeroTourPaused, setIsHeroTourPaused] = useState(false);
  const [isHeroTourSwitching, setIsHeroTourSwitching] = useState(false);
  const [regionsGeoJson, setRegionsGeoJson] = useState(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const [d3Geo, setD3Geo] = useState(null);
  const [activeRegionId, setActiveRegionId] = useState('issyk-kul');
  const [hoveredRegionId, setHoveredRegionId] = useState(null);
  const [mapPopup, setMapPopup] = useState(null);
  const [mapZoom, setMapZoom] = useState(1);
  const [actualGalleryTours, setActualGalleryTours] = useState([]);
  const heroVideoRef = useRef(null);
  const mapSectionRef = useRef(null);
  const mapStageRef = useRef(null);
  const heroTourSwitchTimeoutRef = useRef(null);
  const heroTourRevealTimeoutRef = useRef(null);

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail || localStorage.getItem('travelpay_language') || 'RU');
    };

    window.addEventListener('travelpay-language-change', handleLanguageChange);
    return () => window.removeEventListener('travelpay-language-change', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncReducedMotion = () => {
      const reduceMotion = mediaQuery.matches;
      setPrefersReducedMotion(reduceMotion);

      if (reduceMotion) {
        setHeroVideoLoaded(false);
        heroVideoRef.current?.pause();
      }
    };

    syncReducedMotion();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncReducedMotion);
      return () => mediaQuery.removeEventListener('change', syncReducedMotion);
    }

    mediaQuery.addListener(syncReducedMotion);
    return () => mediaQuery.removeListener(syncReducedMotion);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return undefined;
    }

    let ticking = false;
    let lastScrolledState = null;

    const applyHeroScrollState = () => {
      ticking = false;
      const nextScrolledState = window.scrollY > 12;
      if (nextScrolledState !== lastScrolledState) {
        document.body.classList.toggle('is-hero-scrolled', nextScrolledState);
        lastScrolledState = nextScrolledState;
      }
    };

    const syncHeroScrollState = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyHeroScrollState);
      }
    };

    applyHeroScrollState();
    window.addEventListener('scroll', syncHeroScrollState, { passive: true });
    return () => {
      window.removeEventListener('scroll', syncHeroScrollState);
      document.body.classList.remove('is-hero-scrolled');
    };
  }, []);

  useEffect(() => {
    if (shouldLoadMap) {
      return undefined;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setShouldLoadMap(true);
      return undefined;
    }

    const node = mapSectionRef.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoadMap]);

  useEffect(() => {
    if (!shouldLoadMap) {
      return undefined;
    }

    let isMounted = true;

    Promise.all([
      import('d3-geo'),
      fetch(kyrgyzstanRegionsUrl).then((response) => response.json()),
    ])
      .then(([module, data]) => {
        if (isMounted) {
          setD3Geo(module);
          setRegionsGeoJson(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRegionsGeoJson({ type: 'FeatureCollection', features: [] });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shouldLoadMap]);

  useEffect(() => {
    let isMounted = true;

    const loadActualTours = () => {
      api.get('/tours')
        .then((response) => {
          if (!isMounted) {
            return;
          }

          const source = Array.isArray(response.data) ? response.data : [];
          const normalizedTours = source
            .filter(isPublicHomeTour)
            .map(normalizeHomeGalleryTour)
            .sort((left, right) => {
              const leftTime = left.startDate ? new Date(left.startDate).getTime() : Infinity;
              const rightTime = right.startDate ? new Date(right.startDate).getTime() : Infinity;
              const leftDate = Number.isFinite(leftTime) ? leftTime : Infinity;
              const rightDate = Number.isFinite(rightTime) ? rightTime : Infinity;

              if (leftDate !== rightDate) {
                return leftDate - rightDate;
              }

              return Number(right.rating || 0) - Number(left.rating || 0);
            })
            .slice(0, 6);

          setActualGalleryTours(normalizedTours);
        })
        .catch(() => {
          if (isMounted) {
            setActualGalleryTours([]);
          }
        });
    };

    const idleId = typeof window !== 'undefined' && 'requestIdleCallback' in window
      ? window.requestIdleCallback(loadActualTours, { timeout: 1800 })
      : setTimeout(loadActualTours, 700);

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      } else {
        clearTimeout(idleId);
      }
    };
  }, []);

  const clearHeroTourTimers = useCallback(() => {
    if (heroTourSwitchTimeoutRef.current) {
      window.clearTimeout(heroTourSwitchTimeoutRef.current);
      heroTourSwitchTimeoutRef.current = null;
    }

    if (heroTourRevealTimeoutRef.current) {
      window.clearTimeout(heroTourRevealTimeoutRef.current);
      heroTourRevealTimeoutRef.current = null;
    }
  }, []);

  const switchHeroTour = useCallback((nextIndex) => {
    const normalizedNextIndex = (nextIndex + heroPopularTours.length) % heroPopularTours.length;

    if (normalizedNextIndex === activeHeroTourIndex || typeof window === 'undefined') {
      return;
    }

    clearHeroTourTimers();
    setIsHeroTourSwitching(true);

    heroTourSwitchTimeoutRef.current = window.setTimeout(() => {
      setActiveHeroTourIndex(normalizedNextIndex);
      heroTourRevealTimeoutRef.current = window.setTimeout(() => {
        setIsHeroTourSwitching(false);
      }, 40);
    }, 450);
  }, [activeHeroTourIndex, clearHeroTourTimers]);

  useEffect(() => {
    if (isHeroTourPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      switchHeroTour(activeHeroTourIndex + 1);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [activeHeroTourIndex, isHeroTourPaused, switchHeroTour]);

  useEffect(() => clearHeroTourTimers, [clearHeroTourTimers]);

  const t = copy[language] || copy.RU;
  const mapSection = premiumMapSectionCopy[language] || premiumMapSectionCopy.RU;
  const heroExperience = heroExperienceCopy[language] || heroExperienceCopy.EN;
  const heroTrust = heroTrustCopy[language] || heroTrustCopy.EN;
  const activeHeroTour = heroPopularTours[activeHeroTourIndex] || heroPopularTours[0];
  const getHeroTourText = (value) => (typeof value === 'string' ? value : value?.[language] || value?.EN || '');
  const isValidRegionsGeoJson = useMemo(
    () =>
      regionsGeoJson?.type === 'FeatureCollection' &&
      Array.isArray(regionsGeoJson.features) &&
      regionsGeoJson.features.length > 0 &&
      regionsGeoJson.features.every((feature) => feature.geometry && ['Polygon', 'MultiPolygon'].includes(feature.geometry.type)),
    [regionsGeoJson],
  );
  const regionFeatures = useMemo(() => (isValidRegionsGeoJson ? regionsGeoJson.features : []), [isValidRegionsGeoJson, regionsGeoJson]);
  const mapProjection = useMemo(() => {
    if (!d3Geo || !isValidRegionsGeoJson || !regionFeatures.length) {
      return null;
    }

    return d3Geo.geoMercator().fitExtent(
      [[36, 64], [KYRGYZSTAN_MAP_VIEWBOX.width - 36, KYRGYZSTAN_MAP_VIEWBOX.height - 64]],
      regionsGeoJson,
    );
  }, [d3Geo, isValidRegionsGeoJson, regionFeatures.length, regionsGeoJson]);
  const mapPath = useMemo(() => (d3Geo && mapProjection ? d3Geo.geoPath(mapProjection) : null), [d3Geo, mapProjection]);
  const projectedRegions = useMemo(
    () =>
      mapPath && mapProjection
        ? regionFeatures.map((feature) => {
          const properties = feature.properties || {};
          const centroid = d3Geo.geoCentroid(feature);
          const [labelX, labelY] = mapProjection(centroid) || mapPath.centroid(feature);
          const [offsetX = 0, offsetY = 0] = properties.labelOffset || [];

          return {
            feature,
            id: properties.id || feature.id,
            slug: properties.slug,
            path: mapPath(feature),
            labelX: labelX + offsetX,
            labelY: labelY + offsetY,
            calloutX: labelX,
            calloutY: labelY,
            properties,
          };
        })
        : [],
    [d3Geo, mapPath, mapProjection, regionFeatures],
  );
  const projectedDestinations = useMemo(
    () =>
      mapProjection
        ? kyrgyzstanMapDestinations.map((destination) => {
          const [x, y] = mapProjection(destination.coordinates) || [0, 0];
          return { ...destination, x, y };
        })
        : [],
    [mapProjection],
  );
  const projectedRouteSegments = useMemo(() => {
    const start = projectedDestinations.find((destination) => destination.key === 'bishkek');
    if (!start) {
      return [];
    }

    return projectedDestinations
      .filter((destination) => destination.key !== 'bishkek')
      .map((destination) => ({ from: start, to: destination }));
  }, [projectedDestinations]);
  const activeRegion = projectedRegions.find((region) => region.id === activeRegionId) || projectedRegions[0];
  const visibleRegionId = hoveredRegionId || activeRegion?.id;
  const visibleRegion = projectedRegions.find((region) => region.id === visibleRegionId) || activeRegion;
  const popupRegion = mapPopup ? projectedRegions.find((region) => region.id === mapPopup.regionId) : null;
  const getRegionName = (region) => {
    const properties = region?.properties || {};
    return language === 'EN' ? properties.nameEn : language === 'KG' ? properties.nameKg : properties.nameRu;
  };
  const getRegionShortName = (region) => {
    const properties = region?.properties || {};
    return language === 'EN' ? properties.shortEn || properties.nameEn : properties.shortRu || properties.nameRu;
  };
  const getRegionDescription = (region) => {
    const properties = region?.properties || {};
    return language === 'EN' ? properties.descriptionEn || properties.description : properties.description;
  };
  const mapTransform = `translate(${KYRGYZSTAN_MAP_VIEWBOX.width / 2} ${KYRGYZSTAN_MAP_VIEWBOX.height / 2}) scale(${mapZoom}) translate(${-KYRGYZSTAN_MAP_VIEWBOX.width / 2} ${-KYRGYZSTAN_MAP_VIEWBOX.height / 2})`;
  const heroBrief = {
    RU: {
      title: 'Кыргызстан ближе, чем кажется.',
      text: 'Маршруты, домики и впечатления в одном спокойном сервисе.',
    },
    EN: {
      title: 'Kyrgyzstan feels closer here.',
      text: 'Routes, stays, and local experiences in one clean travel service.',
    },
    KG: {
      title: 'Кыргызстан сиз ойлогондон жакын.',
      text: 'Маршруттар, эс алуу жайлары жана таасирлер бир сервисте.',
    },
  }[language] || {};

  void heroBrief;
  const showcaseCards = [];
  const kyrgyzstanRoutePath = 'M92 112 C116 120 132 118 154 118 C174 118 188 112 208 108 C228 106 238 146 246 188 C224 202 190 212 168 222 C146 214 142 198 136 184 C124 164 104 130 92 112 C82 146 80 190 78 232 C110 230 140 226 168 222 C214 206 286 160 350 126';
  void kyrgyzstanRoutePath;
  const galleryCards = useMemo(
    () => (actualGalleryTours.length ? actualGalleryTours : fallbackGalleryCards),
    [actualGalleryTours],
  );

  const handlePartnerInput = (key) => (event) => {
    setPartnerForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handlePartnerSubmit = (event) => {
    event.preventDefault();
    setPartnerForm({ name: '', company: '', email: '', message: '' });
  };

  const handleGalleryTourOpen = (tour) => {
    if (tour?.isActualTour && tour.id) {
      navigate(`/tours/${tour.id}`, { state: { tour, tours: actualGalleryTours } });
      return;
    }

    navigate('/tours');
  };

  const handleRegionSelect = (regionId) => {
    setActiveRegionId(regionId);
  };

  const updateMapPopup = (regionId, event) => {
    const stageRect = mapStageRef.current?.getBoundingClientRect();
    if (!stageRect) {
      return;
    }

    setMapPopup({
      regionId,
      x: clamp(event.clientX - stageRect.left + 18, 14, Math.max(14, stageRect.width - 278)),
      y: clamp(event.clientY - stageRect.top + 18, 14, Math.max(14, stageRect.height - 174)),
    });
  };

  const handleRegionKeyboard = (regionId) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRegionSelect(regionId);
    }
  };

  const handleRegionToursNavigate = (region) => {
    if (region?.properties?.route) {
      navigate(region.properties.route);
    }
  };

  const setConstrainedMapZoom = (nextZoom) => {
    setMapZoom((currentZoom) => clamp(typeof nextZoom === 'function' ? nextZoom(currentZoom) : nextZoom, 1, 1.65));
  };

  return (
    <main className="home-page" style={styles.page}>
      <section className="home-hero-section hero" style={styles.hero}>
        <div className={`hero__poster${heroVideoLoaded && !prefersReducedMotion ? ' is-hidden' : ''}`} aria-hidden="true" />
        {!prefersReducedMotion ? (
          <video
            ref={heroVideoRef}
            className={`home-hero-background-video hero__video${heroVideoLoaded ? ' is-loaded' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-poster.jpg"
            aria-hidden="true"
            onLoadedData={() => setHeroVideoLoaded(true)}
            onCanPlay={() => setHeroVideoLoaded(true)}
            src="/videos/hero-travel.mp4"
          />
        ) : null}
        <div className="hero__overlay" />
        <div className="home-shell" style={styles.heroShell}>
          <div className="home-hero-layout">
            <motion.div {...motionCard} className="home-hero-content hero__content" style={styles.heroContent}>
              <Title level={1} className="home-hero-title hero-reveal hero-reveal--title" style={styles.heroTitle}>
                {t.heroTitle}
              </Title>
              <Paragraph className="home-hero-text hero-reveal hero-reveal--text" style={styles.heroText}>
                {t.heroText}
              </Paragraph>
              <Space wrap size={12} className="home-hero-actions hero-reveal hero-reveal--actions">
                <Button type="primary" size="large" icon={<ArrowRightOutlined />} className="travelpay-primary-button" style={styles.heroPrimary} onClick={() => navigate('/tours')}>
                  {t.primary}
                </Button>
                <Button size="large" icon={<GlobalOutlined />} className="travelpay-secondary-button" style={styles.heroSecondary} onClick={() => window.dispatchEvent(new Event('open-ai-concierge'))}>
                  {t.secondary}
                </Button>
              </Space>
              <div className="home-hero-benefits" aria-label="TravelPay highlights">
                {heroExperience.benefits.map((benefit, index) => (
                  <article className="home-hero-benefit-card" key={benefit.key} style={{ '--hero-card-delay': `${0.52 + index * 0.1}s` }}>
                    <span className={`home-hero-benefit-icon home-hero-benefit-icon--${benefit.key}`} aria-hidden="true">
                      {benefit.key === 'rating' ? <StarFilled /> : benefit.key === 'tours' ? <EnvironmentOutlined /> : <SafetyCertificateOutlined />}
                    </span>
                    <strong>{benefit.value}</strong>
                    <span>{benefit.label}</span>
                  </article>
                ))}
              </div>
              <section className="home-hero-trust" aria-labelledby="home-hero-trust-title">
                <div className="home-hero-trust__head">
                  <span>TravelPay</span>
                  <strong id="home-hero-trust-title">{heroTrust.title}</strong>
                </div>
                <div className="home-hero-trust__grid">
                  {heroTrust.items.map((item, index) => (
                    <article className="home-hero-trust-card" key={item.key} style={{ '--hero-trust-delay': `${0.78 + index * 0.08}s` }}>
                      <span className={`home-hero-trust-card__icon home-hero-trust-card__icon--${item.key}`} aria-hidden="true">
                        {item.key === 'verified' ? <SafetyCertificateOutlined /> : item.key === 'fast' ? <ClockCircleOutlined /> : item.key === 'wallet' ? <GlobalOutlined /> : <CustomerServiceOutlined />}
                      </span>
                      <strong>{item.label}</strong>
                    </article>
                  ))}
                </div>
              </section>
            </motion.div>
            <aside
              className="home-hero-featured-tour hero-reveal hero-reveal--tour"
              aria-label={getHeroTourText(activeHeroTour.title)}
              onMouseEnter={() => setIsHeroTourPaused(true)}
              onMouseLeave={() => setIsHeroTourPaused(false)}
              onFocus={() => setIsHeroTourPaused(true)}
              onBlur={() => setIsHeroTourPaused(false)}
            >
              <div className="home-hero-featured-tour__kicker">{heroTrust.tourKicker}</div>
              <div className="home-hero-featured-tour__float">
                <div className={`home-hero-featured-tour__surface${isHeroTourSwitching ? ' is-switching' : ''}`}>
                  <span className="home-hero-featured-tour__icon" aria-hidden="true"><CompassOutlined /></span>
                  <div className="home-hero-featured-tour__content">
                    <div className="home-hero-featured-tour__indicators" aria-label="Popular tours">
                      {heroPopularTours.map((tour, index) => (
                        <button
                          type="button"
                          key={tour.key}
                          className={`home-hero-featured-tour__indicator${index === activeHeroTourIndex ? ' is-active' : ''}`}
                          aria-label={getHeroTourText(tour.title)}
                          aria-current={index === activeHeroTourIndex ? 'true' : undefined}
                          onClick={() => switchHeroTour(index)}
                        />
                      ))}
                    </div>
                    <strong>{getHeroTourText(activeHeroTour.title)}</strong>
                    <div className="home-hero-featured-tour__rating" aria-label={`Rating ${activeHeroTour.rating}`}>
                      {[1, 2, 3, 4, 5].map((star) => <StarFilled key={star} />)}
                      <span>{activeHeroTour.rating}</span>
                    </div>
                    <div className="home-hero-featured-tour__meta">
                      <span><ClockCircleOutlined /> {getHeroTourText(activeHeroTour.duration)}</span>
                      <span><TeamOutlined /> {getHeroTourText(activeHeroTour.seats)}</span>
                    </div>
                    <div className="home-hero-featured-tour__price">{getHeroTourText(activeHeroTour.price)}</div>
                    <Button type="text" className="home-hero-featured-tour__button" onClick={() => navigate(activeHeroTour.route)}>
                      {heroExperience.details} <ArrowRightOutlined />
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <button
          type="button"
          className="home-hero-scroll-indicator"
          onClick={() => document.querySelector('.home-section.dark')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <DownOutlined aria-hidden="true" />
          <span>{heroExperience.scroll}</span>
        </button>
      </section>

      {false && <section className="home-section" style={styles.section}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...motionCard} style={styles.sectionHeader}>
            <Tag style={styles.sectionTag}>{t.showcaseTitle}</Tag>
            <Title level={2} style={styles.sectionTitle}>{t.showcaseTitle}</Title>
            <Paragraph style={styles.sectionText}>{t.showcaseText}</Paragraph>
          </motion.div>

          <div className="home-tour-grid">
            {showcaseCards.map((spot, index) => (
              <motion.article key={spot.key} {...motionCard} transition={{ delay: index * 0.04 }} className="home-tour-card-shell">
                <Card className="home-tour-media-card" style={styles.showcaseCard} styles={{ body: { padding: 0 } }}>
                  <div style={styles.showcaseImageWrap}>
                    <img src={spot.image} alt={spot.title} loading="lazy" decoding="async" onError={withTourFallback} style={styles.showcaseImage} />
                    <div style={styles.showcaseOverlay} />
                    <div style={styles.showcaseTopMeta}>
                      <Tag color="gold">{spot.rating}</Tag>
                      <Tag color="blue">{spot.duration}</Tag>
                    </div>
                    <div style={styles.showcaseBottom}>
                      <Title level={3} style={styles.showcaseTitle}>{spot.title}</Title>
                      <Text style={styles.showcaseLocation}><EnvironmentOutlined /> {spot.location}</Text>
                    </div>
                  </div>
                  <div style={styles.showcaseBody}>
                    <Paragraph style={styles.showcaseText}>{spot.description}</Paragraph>
                    <div style={styles.showcaseFooter}>
                      <span style={styles.showcasePrice}>{Number(spot.price).toLocaleString('ru-RU')} сом</span>
                      <Button type="default" icon={<ArrowRightOutlined />} className="travelpay-secondary-button" style={styles.inlineGhostButton} onClick={() => navigate('/tours')}>
                        Каталог
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.article>
            ))}
          </div>
        </div>
      </section>}

      <section className="home-section dark" style={styles.darkSection}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...motionCard} style={styles.sectionHeader}>
            <Tag style={styles.darkTag}>{t.toursTitle}</Tag>
            <Title level={2} style={styles.darkTitle}>{t.toursTitle}</Title>
            <Paragraph style={styles.darkText}>{t.toursText}</Paragraph>
          </motion.div>

          <Row gutter={[20, 20]}>
            {travelFormats.map((item, index) => (
              <Col xs={24} md={12} lg={8} key={item.title}>
                <motion.div {...motionCard} transition={{ delay: index * 0.06 }}>
                  <Card className="home-format-card" style={styles.formatCard}>
                    <div style={styles.formatIcon}>{item.icon}</div>
                    <Title level={4} style={styles.formatTitle}>{item.title}</Title>
                    <Paragraph style={styles.formatText}>{item.text}</Paragraph>
                    <Button type="primary" className="travelpay-primary-button" style={styles.formatButton} onClick={() => navigate('/tours')}>
                      Перейти к турам
                    </Button>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="home-gallery-section" style={styles.gallerySection}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...motionCard} style={styles.sectionHeader}>
            <Tag style={styles.sectionTag}>{t.galleryTitle}</Tag>
            <Title level={2} style={styles.sectionTitle}>{t.galleryTitle}</Title>
            <Paragraph style={styles.sectionText}>{t.galleryText}</Paragraph>
          </motion.div>

          <div className="home-gallery-grid">
            {galleryCards.map((spot, index) => (
              <motion.article key={`${spot.key}-gallery`} {...motionCard} transition={{ delay: index * 0.04 }} className="home-gallery-card">
                <Card hoverable className="home-gallery-tour-card" style={styles.galleryCard} styles={{ body: { padding: 0 } }} onClick={() => handleGalleryTourOpen(spot)}>
                  <div style={styles.galleryImageWrap}>
                    <img src={spot.image} alt={spot.title} loading="lazy" decoding="async" onError={withTourFallback} style={styles.galleryImage} />
                    <div style={styles.galleryShade} />
                    <div style={styles.galleryMetaTop}>
                      <Tag color={spot.isActualTour ? 'green' : 'gold'}>{spot.isActualTour ? 'Действующий' : spot.rating}</Tag>
                      <Tag color="processing">{spot.startLabel || spot.duration}</Tag>
                    </div>
                    <div style={styles.galleryMetaBottom}>
                      <Title level={4} style={styles.galleryTitle}>{spot.title}</Title>
                      <Text style={styles.gallerySubtitle}>{spot.location}</Text>
                    </div>
                  </div>
                  <div style={styles.galleryBody}>
                    <Paragraph ellipsis={{ rows: 2 }} style={styles.galleryText}>{spot.description}</Paragraph>
                    <div style={styles.galleryFooter}>
                      <span style={styles.galleryPrice}>от {Number(spot.price).toLocaleString('ru-RU')} сом</span>
                      <Space size={6}>
                        {[1, 2, 3, 4, 5].map((star) => <StarFilled key={star} style={{ color: star <= Math.round(spot.rating) ? BRAND_GOLD : 'rgba(22,50,79,0.18)' }} />)}
                      </Space>
                    </div>
                  </div>
                </Card>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" style={styles.section}>
        <div className="home-shell home-about-preview">
          <div className="home-about-preview__copy">
            <Tag style={styles.sectionTag}>О нас</Tag>
            <Title level={2} style={styles.sectionTitle}>TravelPay — локальный проводник по турам Кыргызстана.</Title>
            <Paragraph style={styles.sectionText}>
              Мы собираем проверенные маршруты, домики и тур-компании в одном понятном сервисе.
              Скоро здесь будет видео основателя, где можно будет познакомиться с нами лично.
            </Paragraph>
            <Button type="primary" icon={<ArrowRightOutlined />} className="travelpay-primary-button" onClick={() => navigate('/about')}>
              Узнать больше
            </Button>
          </div>
          <div className="home-about-preview__video">
            <span>Видео скоро</span>
            <strong>Founder story</strong>
          </div>
        </div>
      </section>

      <section className="home-section" style={styles.section}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...motionCard} style={styles.sectionHeader}>
            <Tag style={styles.sectionTag}>{t.whyTitle}</Tag>
            <Title level={2} style={styles.sectionTitle}>{t.whyTitle}</Title>
          </motion.div>

          <Row gutter={[18, 18]}>
            {whyTravelPay.map(([title, text, icon], index) => (
              <Col xs={24} md={8} key={title}>
                <motion.div {...motionCard} transition={{ delay: index * 0.06 }}>
                  <Card style={styles.whyCard}>
                    <div style={styles.whyIcon}>{icon}</div>
                    <Title level={4} style={styles.whyTitle}>{title}</Title>
                    <Paragraph style={styles.whyText}>{text}</Paragraph>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section id="partnership" className="home-section home-partnership-section" style={styles.partnerSection}>
        <div className="home-partner-bg-lines" aria-hidden="true" />
        <div className="home-shell home-partner-grid" style={styles.partnerGrid}>
          <motion.div {...motionCard} className="home-partner-copy" style={styles.partnerCopy}>
            <div className="home-partner-badge" aria-label="TravelPay B2B онлайн">
              <span>TravelPay B2B</span>
              <span className="home-partner-badge__online">Онлайн</span>
            </div>
            <Title level={2} style={styles.darkTitle}>{t.partnerTitle}</Title>
            <Paragraph style={styles.darkText}>{t.partnerText}</Paragraph>

            <div className="home-partner-benefits" aria-label="Преимущества партнёрства">
              {partnershipBenefits.map((benefit, index) => (
                <article className="home-partner-benefit" key={benefit.text} style={{ '--partner-delay': `${index * 70}ms` }}>
                  <span>{benefit.icon}</span>
                  <strong>{benefit.text}</strong>
                </article>
              ))}
            </div>

            <div className="home-partner-stats" aria-label="Статистика TravelPay Business">
              {partnershipStats.map((stat) => (
                <CountUpStat key={stat.label} stat={stat} />
              ))}
            </div>

            <Space wrap size={12} className="home-partner-actions" style={styles.partnerActions}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                className="travelpay-primary-button home-partner-primary-button"
                style={styles.partnerBusinessButton}
                onClick={() => navigate('/business')}
              >
                {t.partnerBusiness}
              </Button>
              <Button
                size="large"
                className="travelpay-secondary-button home-partner-ghost-button"
                style={styles.partnerBusinessGhost}
                onClick={() => navigate('/business/register')}
              >
                {t.partnerRegisterCompany}
              </Button>
            </Space>

            <div className="home-partner-flow" aria-label="Как работает партнёрство">
              <span>Как это работает</span>
              <div>
                {partnershipSteps.map((step, index) => (
                  <article className="home-partner-flow-step" key={step} style={{ '--partner-delay': `${index * 70}ms` }}>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                    <p>{step}</p>
                    {index < partnershipSteps.length - 1 && <FiArrowDown aria-hidden="true" />}
                  </article>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div {...motionCard} className="home-partner-form-shell">
            {partnerFloatingCards.map((card) => (
              <div className={`home-partner-floating-card home-partner-floating-card--${card.position}`} key={card.text} aria-hidden="true">
                <span>{card.icon}</span>
                <strong>{card.text}</strong>
              </div>
            ))}

            <Card className="home-partner-form-card" style={styles.partnerCard}>
              <div className="home-partner-form-head">
                <span>Оставьте заявку</span>
                <p>Наш менеджер свяжется с вами в течение рабочего дня.</p>
              </div>

              <form onSubmit={handlePartnerSubmit} className="home-partner-form" style={styles.partnerForm}>
                <Input value={partnerForm.name} onChange={handlePartnerInput('name')} placeholder={t.partnerName} size="large" prefix={<FiUser aria-hidden="true" />} />
                <Input value={partnerForm.company} onChange={handlePartnerInput('company')} placeholder={t.partnerCompany} size="large" prefix={<FiBriefcase aria-hidden="true" />} />
                <Input value={partnerForm.email} onChange={handlePartnerInput('email')} placeholder={t.partnerEmail} size="large" prefix={<FiMail aria-hidden="true" />} />
                <label className="home-partner-message-field">
                  <FiMessageCircle aria-hidden="true" />
                  <TextArea value={partnerForm.message} onChange={handlePartnerInput('message')} rows={4} placeholder={t.partnerMessage} />
                </label>
                <Button htmlType="submit" type="primary" size="large" className="travelpay-primary-button home-partner-submit-button" style={styles.partnerButton}>
                  {t.partnerSubmit}
                </Button>
                <div className="home-partner-form-trust" aria-label="Условия подключения">
                  {partnerFormTrust.map((item) => (
                    <span key={item}><FiCheckCircle aria-hidden="true" /> {item}</span>
                  ))}
                </div>
              </form>
            </Card>
          </motion.div>
        </div>

        <div className="home-shell home-partner-logos" aria-label="Нам доверяют">
          <span>Нам доверяют</span>
          <div>
            {partnerLogos.map((logo) => (
              <strong key={logo}>{logo}</strong>
            ))}
          </div>
        </div>
      </section>

      <section className="home-map-section" ref={mapSectionRef} style={styles.mapSection}>
        <div className="home-map-section__backdrop" aria-hidden="true" />
        <div className="home-shell home-map-section__inner">
          <motion.div {...motionCard} className="home-map-section__copy">
            <Tag style={styles.darkTag}>{mapSection.eyebrow}</Tag>
            <Title level={2} className="home-map-section__title" style={styles.darkTitle}>{mapSection.title}</Title>
            <Paragraph className="home-map-section__text" style={styles.darkText}>{mapSection.text}</Paragraph>
            {activeRegion ? (
              <article className="home-map-active-card" aria-live="polite">
                <img src={activeRegion.properties.image} alt="" loading="lazy" decoding="async" />
                <div>
                  <span>{mapSection.activeRegion}</span>
                  <strong>{getRegionName(activeRegion)}</strong>
                  <p>{getRegionDescription(activeRegion)}</p>
                  <button type="button" onClick={() => handleRegionToursNavigate(activeRegion)}>
                    {mapSection.viewTours} <ArrowRightOutlined />
                  </button>
                </div>
              </article>
            ) : null}
            <div className="home-map-region-list" aria-label={mapSection.regionList}>
              {projectedRegions.map((region) => {
                const isActive = region.id === activeRegion?.id;
                const isHovered = region.id === hoveredRegionId;

                return (
                  <button
                    type="button"
                    key={region.id}
                    className={`home-map-region-item${isActive ? ' is-active' : ''}${isHovered ? ' is-hovered' : ''}`}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    onFocus={() => setHoveredRegionId(region.id)}
                    onBlur={() => setHoveredRegionId(null)}
                    onClick={() => handleRegionSelect(region.id)}
                  >
                    <span className="home-map-region-item__dot" aria-hidden="true" />
                    <span className="home-map-region-item__name">{getRegionName(region)}</span>
                    <span className="home-map-region-item__count">{region.properties.toursCount}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div {...motionCard} transition={{ duration: 0.7 }} className="home-map-stage" ref={mapStageRef}>
            <div className="home-map-stage__glow home-map-stage__glow--left" aria-hidden="true" />
            <div className="home-map-stage__glow home-map-stage__glow--right" aria-hidden="true" />
            <div className="home-map-controls" aria-label="Map zoom controls">
              <button type="button" aria-label={mapSection.zoomIn} onClick={() => setConstrainedMapZoom((zoom) => zoom + 0.18)}>+</button>
              <button type="button" aria-label={mapSection.zoomOut} onClick={() => setConstrainedMapZoom((zoom) => zoom - 0.18)}>-</button>
              <button type="button" onClick={() => setConstrainedMapZoom(1)}>{mapSection.reset}</button>
            </div>
            {regionsGeoJson && !isValidRegionsGeoJson ? (
              <div className="home-map-error" role="status">
                Не удалось загрузить геоданные карты Кыргызстана
              </div>
            ) : null}
            <svg className="home-kyrgyzstan-map" viewBox={`0 0 ${KYRGYZSTAN_MAP_VIEWBOX.width} ${KYRGYZSTAN_MAP_VIEWBOX.height}`} role="img" aria-label="Interactive map of Kyrgyzstan regions">
              <defs>
                <linearGradient id="kg-region-active-fill" x1="170" y1="90" x2="620" y2="410" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#62d4ff" stopOpacity="0.82" />
                  <stop offset="52%" stopColor="#2bb8c5" stopOpacity="0.66" />
                  <stop offset="100%" stopColor="#f0b24a" stopOpacity="0.72" />
                </linearGradient>
                <linearGradient id="kg-route-stroke" x1="170" y1="110" x2="620" y2="390" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8be2f0" />
                  <stop offset="100%" stopColor="#f0b24a" />
                </linearGradient>
                <filter id="kg-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g className="home-kyrgyzstan-map__viewport" transform={mapTransform}>
                {projectedRouteSegments.map((segment) => (
                  <line
                    key={`${segment.from.key}-${segment.to.key}`}
                    className="home-kyrgyzstan-map__route"
                    x1={segment.from.x}
                    y1={segment.from.y}
                    x2={segment.to.x}
                    y2={segment.to.y}
                  />
                ))}

                {projectedRegions.map((region, index) => {
                  const isActive = region.id === activeRegion?.id;
                  const isVisible = region.id === visibleRegion?.id;

                  return (
                    <motion.path
                      key={region.id}
                      className={`home-kyrgyzstan-map__region${isActive ? ' is-active' : ''}${isVisible ? ' is-visible' : ''}`}
                      d={region.path}
                      role="button"
                      tabIndex={0}
                      aria-label={`${getRegionName(region)}: ${region.properties.toursCount} ${mapSection.tours}`}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.55, delay: index * 0.045 }}
                      onMouseEnter={(event) => {
                        setHoveredRegionId(region.id);
                        updateMapPopup(region.id, event);
                      }}
                      onMouseMove={(event) => updateMapPopup(region.id, event)}
                      onMouseLeave={() => {
                        setHoveredRegionId(null);
                        setMapPopup(null);
                      }}
                      onFocus={() => {
                        setHoveredRegionId(region.id);
                        setMapPopup({ regionId: region.id, x: 22, y: 22 });
                      }}
                      onBlur={() => {
                        setHoveredRegionId(null);
                        setMapPopup(null);
                      }}
                      onClick={() => handleRegionSelect(region.id)}
                      onKeyDown={handleRegionKeyboard(region.id)}
                    />
                  );
                })}

                {projectedRegions.map((region) => {
                  const hasOffset = (region.properties.labelOffset || []).some((value) => value !== 0);
                  const isVisible = region.id === visibleRegion?.id;
                  const shouldShowLabel = region.properties.labelAlways || isVisible;

                  return (
                    <g key={`${region.id}-label`} className={`home-kyrgyzstan-map__label-group${shouldShowLabel ? ' is-visible' : ''}`}>
                      {hasOffset ? (
                        <line
                          className="home-kyrgyzstan-map__label-line"
                          x1={region.calloutX}
                          y1={region.calloutY}
                          x2={region.labelX}
                          y2={region.labelY}
                        />
                      ) : null}
                      <text className="home-kyrgyzstan-map__label" x={region.labelX} y={region.labelY}>
                        {getRegionShortName(region)}
                      </text>
                    </g>
                  );
                })}

                {projectedDestinations.map((destination, index) => (
                  <g
                    key={destination.key}
                    className="home-kyrgyzstan-map__destination"
                    style={{ animationDelay: `${index * 0.22}s` }}
                    transform={`translate(${destination.x} ${destination.y})`}
                  >
                    <title>{destination.label}</title>
                    <circle className="home-kyrgyzstan-map__destination-pulse" r="15" />
                    <circle className="home-kyrgyzstan-map__destination-dot" r="5" filter="url(#kg-soft-glow)" />
                  </g>
                ))}
              </g>
            </svg>
            {popupRegion ? (
              <motion.div
                className="home-map-popup"
                style={{ left: mapPopup.x, top: mapPopup.y }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                role="status"
              >
                <strong>{getRegionName(popupRegion)}</strong>
                <span>{popupRegion.properties.toursCount} {mapSection.tours}</span>
                <p>{getRegionDescription(popupRegion)}</p>
                <button type="button" onClick={() => handleRegionToursNavigate(popupRegion)}>
                  {mapSection.viewTours} <ArrowRightOutlined />
                </button>
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </section>

      <section className="home-section" style={styles.section}>
        <div className="home-shell" style={styles.sectionInner}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} lg={10}>
              <motion.div {...motionCard}>
                <Tag style={styles.sectionTag}>{t.faqTitle}</Tag>
                <Title level={2} style={styles.sectionTitle}>{t.faqTitle}</Title>
              </motion.div>
            </Col>
            <Col xs={24} lg={14}>
              <Collapse items={faqItems[language] || faqItems.RU} size="large" className="home-faq" style={styles.faq} />
            </Col>
          </Row>
        </div>
      </section>

      <footer className="home-footer" style={styles.footer}>
        <div className="home-shell home-footer__inner" style={styles.footerInner}>
          <div className="home-footer__brand">
            <Text className="home-footer__eyebrow">by barsbektravel</Text>
            <Title level={3} style={styles.footerBrand}>TravelPay</Title>
            <Paragraph style={styles.footerText}>Туры, домики и локальный сервис по Кыргызстану без хаоса в переписках.</Paragraph>
            <Segmented
              className="home-footer__language"
              value={language}
              options={['KG', 'RU', 'EN']}
              onChange={(value) => {
                setLanguage(value);
                localStorage.setItem('travelpay_language', value);
                window.dispatchEvent(new CustomEvent('travelpay-language-change', { detail: value }));
              }}
            />
          </div>

          <nav className="home-footer__nav" aria-label="Footer navigation">
            <button type="button" onClick={() => navigate('/tours')}>Туры</button>
            <button type="button" onClick={() => navigate('/stays')}>Домики</button>
            <button type="button" onClick={() => navigate('/about')}>О нас</button>
            <button type="button" onClick={() => navigate('/business')}>Партнёрство</button>
          </nav>

          <div className="home-footer-socials home-footer__contacts" style={styles.footerSocials}>
            <Text className="home-footer__contacts-title">Связаться</Text>
            {socialLinks.map((item) => (
              <a key={item.key} href={item.href} style={styles.footerLink}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 12% 10%, rgba(43,184,197,0.10), transparent 24%), radial-gradient(circle at 88% 14%, rgba(240,178,74,0.14), transparent 22%), linear-gradient(180deg, #F5F8FC 0%, #EDF4FA 48%, #F8FBFF 100%)',
    color: BRAND_BLUE,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  },
  hero: {
    position: 'relative',
    minHeight: '112vh',
    display: 'flex',
    alignItems: 'center',
    padding: '170px 24px 118px',
    overflow: 'hidden',
    marginTop: -94,
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(6,17,31,0.72), rgba(6,17,31,0.22) 48%, rgba(6,17,31,0.56)), linear-gradient(180deg, rgba(6,17,31,0.38), rgba(6,17,31,0.12) 42%, rgba(6,17,31,0.46))',
  },
  heroShell: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
  },
  heroContent: {
    maxWidth: 740,
  },
  heroTag: {
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: 999,
    padding: '6px 14px',
    fontWeight: 780,
    fontSize: 12,
    backdropFilter: 'blur(18px)',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 64,
    lineHeight: 0.98,
    margin: '0 0 24px',
    fontWeight: 900,
    textShadow: '0 24px 72px rgba(0,0,0,0.34)',
  },
  heroText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 17,
    lineHeight: 1.55,
    marginBottom: 32,
    maxWidth: 680,
  },
  heroPrimary: {
    minWidth: 176,
    height: 50,
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.20)',
    background: 'linear-gradient(135deg, #2F8DCE 0%, #1F6EAD 54%, #154E86 100%)',
    boxShadow: '0 18px 42px rgba(31,110,173,0.36), 0 0 0 1px rgba(255,255,255,0.08) inset',
    fontWeight: 800,
  },
  heroSecondary: {
    minWidth: 208,
    height: 50,
    borderRadius: 18,
    color: '#FFFFFF',
    background: 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.32)',
    boxShadow: '0 16px 38px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.20) inset',
    backdropFilter: 'blur(16px)',
    fontWeight: 800,
  },
  section: {
    padding: '84px 24px',
  },
  darkSection: {
    padding: '84px 24px',
    background: 'linear-gradient(180deg, #071523, #10233A)',
  },
  gallerySection: {
    padding: '84px 24px',
    background: 'linear-gradient(180deg, rgba(16,35,58,0.04), rgba(16,35,58,0.08))',
  },
  sectionInner: {
    width: '100%',
  },
  sectionHeader: {
    maxWidth: 760,
    margin: '0 auto 34px',
    textAlign: 'center',
  },
  sectionTag: {
    borderRadius: 999,
    padding: '7px 14px',
    background: 'rgba(255,255,255,0.88)',
    color: BRAND_BLUE,
    border: '1px solid rgba(22,50,79,0.08)',
    fontWeight: 800,
  },
  sectionTitle: {
    color: BRAND_BLUE,
    fontSize: 'clamp(30px, 4vw, 48px)',
    fontWeight: 900,
    marginTop: 16,
  },
  sectionText: {
    color: '#62758A',
    fontSize: 16,
    lineHeight: 1.7,
  },
  darkTag: {
    borderRadius: 999,
    padding: '7px 14px',
    background: 'rgba(240,178,74,0.16)',
    color: '#FFD48A',
    border: '1px solid rgba(240,178,74,0.26)',
    fontWeight: 800,
  },
  darkTitle: {
    color: '#FFFFFF',
    fontSize: 'clamp(30px, 4vw, 48px)',
    fontWeight: 900,
    marginTop: 16,
  },
  darkText: {
    color: 'rgba(215,227,242,0.84)',
    lineHeight: 1.7,
  },
  showcaseCard: {
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    border: '1px solid rgba(22,50,79,0.08)',
    boxShadow: '0 22px 64px rgba(22,50,79,0.10)',
    background: 'rgba(255,255,255,0.92)',
  },
  showcaseImageWrap: {
    position: 'relative',
    height: 220,
    overflow: 'hidden',
  },
  showcaseImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  showcaseOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.62))',
  },
  showcaseTopMeta: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    display: 'flex',
    justifyContent: 'space-between',
  },
  showcaseBottom: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  showcaseTitle: {
    color: '#FFFFFF',
    margin: 0,
    fontWeight: 900,
  },
  showcaseLocation: {
    color: 'rgba(255,255,255,0.82)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  showcaseBody: {
    padding: 18,
  },
  showcaseText: {
    color: '#607186',
    lineHeight: 1.64,
    minHeight: 52,
    marginBottom: 16,
  },
  showcaseFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  showcasePrice: {
    color: BRAND_GOLD,
    fontWeight: 900,
    fontSize: 20,
  },
  inlineGhostButton: {
    height: 40,
    borderRadius: 14,
  },
  formatCard: {
    height: '100%',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.14)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
  },
  formatIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #FFD48A)`,
    color: BRAND_BLUE,
    fontSize: 24,
    marginBottom: 18,
  },
  formatTitle: {
    color: '#FFFFFF',
    fontWeight: 800,
  },
  formatText: {
    color: '#D7E3F2',
    lineHeight: 1.66,
    minHeight: 72,
  },
  formatButton: {
    height: 44,
    borderRadius: 14,
  },
  galleryCard: {
    height: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    border: '1px solid rgba(22,50,79,0.08)',
    boxShadow: '0 18px 54px rgba(22,50,79,0.10)',
    background: 'rgba(255,255,255,0.94)',
  },
  galleryImageWrap: {
    position: 'relative',
    height: 210,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  galleryShade: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(6,17,31,0.12), rgba(6,17,31,0.68))',
  },
  galleryMetaTop: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    display: 'flex',
    justifyContent: 'space-between',
  },
  galleryMetaBottom: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
  },
  galleryTitle: {
    color: '#FFFFFF',
    margin: 0,
    fontWeight: 800,
  },
  gallerySubtitle: {
    color: 'rgba(255,255,255,0.78)',
  },
  galleryBody: {
    padding: 16,
  },
  galleryText: {
    color: '#607186',
    lineHeight: 1.6,
    minHeight: 42,
  },
  galleryFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  galleryPrice: {
    color: BRAND_GOLD,
    fontWeight: 900,
  },
  whyCard: {
    height: '100%',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.88)',
    border: '1px solid rgba(22,50,79,0.07)',
    boxShadow: '0 20px 54px rgba(22,50,79,0.08)',
  },
  whyIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_TURQUOISE})`,
    color: '#FFFFFF',
    fontSize: 22,
    marginBottom: 16,
  },
  whyTitle: {
    color: BRAND_BLUE,
    fontWeight: 800,
  },
  whyText: {
    color: '#607186',
    lineHeight: 1.65,
  },
  partnerSection: {
    position: 'relative',
    overflow: 'hidden',
    padding: '104px 24px 88px',
    background: 'linear-gradient(135deg, #061523 0%, #0b2036 54%, #102f4f 100%)',
  },
  partnerGrid: {
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.45fr) minmax(420px, 0.55fr)',
    gap: 48,
    alignItems: 'start',
  },
  partnerCopy: {
    alignSelf: 'center',
  },
  partnerActions: {
    marginTop: 28,
  },
  partnerBusinessButton: {
    minHeight: 54,
    borderRadius: 18,
  },
  partnerBusinessGhost: {
    minHeight: 54,
    borderRadius: 18,
    background: 'rgba(255,255,255,0.1)',
    color: '#ffffff',
    borderColor: 'rgba(255,255,255,0.26)',
  },
  partnerCard: {
    borderRadius: 28,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
    backdropFilter: 'blur(20px)',
  },
  partnerForm: {
    display: 'grid',
    gap: 14,
  },
  partnerButton: {
    height: 54,
    borderRadius: 16,
  },
  mapSection: {
    position: 'relative',
    padding: '96px 24px',
    background: 'linear-gradient(180deg, #08192A 0%, #0A1E33 52%, #0C2740 100%)',
    overflow: 'hidden',
  },
  faq: {
    borderRadius: 24,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.92)',
    boxShadow: '0 22px 60px rgba(22,50,79,0.08)',
  },
  footer: {
    padding: '68px 24px 34px',
    background: 'linear-gradient(180deg, #071523, #030914)',
  },
  footerInner: {
    gap: 28,
  },
  footerBrand: {
    color: '#FFFFFF',
    marginBottom: 8,
    fontSize: 34,
    lineHeight: 1,
  },
  footerText: {
    maxWidth: 420,
    color: '#B7C6D8',
    lineHeight: 1.62,
    fontSize: 15,
  },
  footerSocials: {
    display: 'grid',
    gap: 10,
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    color: '#E7F1FF',
    textDecoration: 'none',
    padding: '12px 14px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.10)',
  },
};

export default HomePage;
