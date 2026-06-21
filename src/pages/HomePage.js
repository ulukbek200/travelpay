import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRightOutlined, CompassOutlined, CustomerServiceOutlined, EnvironmentOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, StarFilled, TeamOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Col, Input, Row, Segmented, Space, Tag, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { KYRGYZSTAN_TOUR_SPOTS, withTourFallback } from '../utils/tourMedia';

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
    galleryTitle: 'Живая галерея туров',
    galleryText: 'Реальные локации Кыргызстана с компактной сеткой, затемнением фото и быстрой навигацией.',
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
    galleryTitle: 'Live tour gallery',
    galleryText: 'Real Kyrgyzstan locations with responsive cards, image overlays, and clear travel metadata.',
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
    galleryTitle: 'Тирүү тур галереясы',
    galleryText: 'Чыныгы локациялар, адаптивдүү карточкалар жана сүрөт үстүндөгү маалымат менен.',
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
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sary%20Chelek%20Lake.jpg',
    description: 'Заповедное горное озеро, тихие панорамы и маршрут для спокойного premium nature-отдыха.',
  },
  {
    key: 'kol-suu',
    title: 'Кёль-Суу',
    location: 'Нарынская область',
    duration: '4 дня',
    price: 46000,
    rating: 4.9,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kol-Suu.jpg',
    description: 'Высокогорное озеро среди скал, удалённый маршрут и сильная adventure-атмосфера.',
  },
];

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

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail || localStorage.getItem('travelpay_language') || 'RU');
    };

    window.addEventListener('travelpay-language-change', handleLanguageChange);
    return () => window.removeEventListener('travelpay-language-change', handleLanguageChange);
  }, []);

  const t = copy[language] || copy.RU;

  const showcaseCards = useMemo(
    () =>
      KYRGYZSTAN_TOUR_SPOTS.map((spot, index) => ({
        ...spot,
        accent: index % 2 === 0 ? 'gold' : 'blue',
      })),
    [],
  );
  const galleryCards = useMemo(
    () =>
      [...KYRGYZSTAN_TOUR_SPOTS, ...extraGallerySpots].map((spot, index) => ({
        ...spot,
        accent: index % 2 === 0 ? 'gold' : 'blue',
      })),
    [],
  );

  const handlePartnerInput = (key) => (event) => {
    setPartnerForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handlePartnerSubmit = (event) => {
    event.preventDefault();
    setPartnerForm({ name: '', company: '', email: '', message: '' });
  };

  return (
    <main className="home-page" style={styles.page}>
      <section className="home-hero-section" style={styles.hero}>
        <div style={styles.heroVideo} aria-hidden="true" />
        <div style={styles.heroOverlay} />
        <div className="home-shell" style={styles.heroShell}>
          <motion.div {...motionCard} style={styles.heroContent}>
            <Tag style={styles.heroTag}>{t.heroTag}</Tag>
            <Title style={styles.heroTitle}>{t.heroTitle}</Title>
            <Paragraph style={styles.heroText}>{t.heroText}</Paragraph>
            <Space wrap size={14}>
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} className="travelpay-primary-button" style={styles.heroPrimary} onClick={() => navigate('/tours')}>
                {t.primary}
              </Button>
              <Button size="large" icon={<GlobalOutlined />} className="travelpay-secondary-button" style={styles.heroSecondary} onClick={() => window.dispatchEvent(new Event('open-ai-concierge'))}>
                {t.secondary}
              </Button>
            </Space>
          </motion.div>
        </div>
      </section>

      <section className="home-section" style={styles.section}>
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
                    <img src={spot.image} alt={spot.title} onError={withTourFallback} style={styles.showcaseImage} />
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
      </section>

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
                <Card hoverable className="home-gallery-tour-card" style={styles.galleryCard} styles={{ body: { padding: 0 } }} onClick={() => navigate('/tours')}>
                  <div style={styles.galleryImageWrap}>
                    <img src={spot.image} alt={spot.title} onError={withTourFallback} style={styles.galleryImage} />
                    <div style={styles.galleryShade} />
                    <div style={styles.galleryMetaTop}>
                      <Tag color="gold">{spot.rating}</Tag>
                      <Tag color="processing">{spot.duration}</Tag>
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

      <section id="partnership" className="home-section" style={styles.partnerSection}>
        <div className="home-shell" style={styles.partnerGrid}>
          <motion.div {...motionCard} style={styles.partnerCopy}>
            <Tag style={styles.darkTag}>TravelPay B2B</Tag>
            <Title level={2} style={styles.darkTitle}>{t.partnerTitle}</Title>
            <Paragraph style={styles.darkText}>{t.partnerText}</Paragraph>
            <Space wrap size={12} style={styles.partnerActions}>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                className="travelpay-primary-button"
                style={styles.partnerBusinessButton}
                onClick={() => navigate('/business')}
              >
                {t.partnerBusiness}
              </Button>
              <Button
                size="large"
                className="travelpay-secondary-button"
                style={styles.partnerBusinessGhost}
                onClick={() => navigate('/business/register')}
              >
                {t.partnerRegisterCompany}
              </Button>
            </Space>
          </motion.div>

          <motion.div {...motionCard}>
            <Card style={styles.partnerCard}>
              <form onSubmit={handlePartnerSubmit} style={styles.partnerForm}>
                <Input value={partnerForm.name} onChange={handlePartnerInput('name')} placeholder={t.partnerName} size="large" />
                <Input value={partnerForm.company} onChange={handlePartnerInput('company')} placeholder={t.partnerCompany} size="large" />
                <Input value={partnerForm.email} onChange={handlePartnerInput('email')} placeholder={t.partnerEmail} size="large" />
                <TextArea value={partnerForm.message} onChange={handlePartnerInput('message')} rows={4} placeholder={t.partnerMessage} />
                <Button htmlType="submit" type="primary" size="large" className="travelpay-primary-button" style={styles.partnerButton}>
                  {t.partnerSubmit}
                </Button>
              </form>
            </Card>
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

      <footer style={styles.footer}>
        <div className="home-shell" style={styles.footerInner}>
          <div>
            <Title level={3} style={styles.footerBrand}>TravelPay</Title>
            <Paragraph style={styles.footerText}>{t.footerText}</Paragraph>
            <Segmented
              value={language}
              options={['KG', 'RU', 'EN']}
              onChange={(value) => {
                setLanguage(value);
                localStorage.setItem('travelpay_language', value);
                window.dispatchEvent(new CustomEvent('travelpay-language-change', { detail: value }));
              }}
            />
          </div>

          <div style={styles.footerSocials}>
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
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    padding: '136px 24px 84px',
    overflow: 'hidden',
    marginTop: -94,
  },
  heroVideo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("/images/kyrgyzstan-mountains.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'saturate(1.08) contrast(1.04) brightness(0.82)',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(6,17,31,0.82), rgba(6,17,31,0.52), rgba(6,17,31,0.70)), radial-gradient(circle at 70% 20%, rgba(240,178,74,0.20), transparent 28%)',
  },
  heroShell: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
  },
  heroContent: {
    maxWidth: 760,
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
    fontSize: 'clamp(30px, 4.8vw, 52px)',
    lineHeight: 1.06,
    margin: '18px 0 14px',
    fontWeight: 900,
    textShadow: '0 24px 72px rgba(0,0,0,0.34)',
  },
  heroText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 16,
    lineHeight: 1.66,
    marginBottom: 24,
    maxWidth: 620,
  },
  heroPrimary: {
    minWidth: 176,
    height: 50,
    borderRadius: 18,
  },
  heroSecondary: {
    minWidth: 208,
    height: 50,
    borderRadius: 18,
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
    padding: '84px 24px',
    background: 'linear-gradient(135deg, #071523, #10233A 60%, #173B61)',
  },
  partnerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 24,
    alignItems: 'start',
  },
  partnerCopy: {
    alignSelf: 'center',
  },
  partnerActions: {
    marginTop: 24,
  },
  partnerBusinessButton: {
    minHeight: 48,
    borderRadius: 16,
  },
  partnerBusinessGhost: {
    minHeight: 48,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.08)',
    color: '#ffffff',
    borderColor: 'rgba(255,255,255,0.32)',
  },
  partnerCard: {
    borderRadius: 24,
    background: 'rgba(255,255,255,0.96)',
    boxShadow: '0 24px 72px rgba(0,0,0,0.24)',
  },
  partnerForm: {
    display: 'grid',
    gap: 12,
  },
  partnerButton: {
    height: 48,
    borderRadius: 16,
  },
  faq: {
    borderRadius: 24,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.92)',
    boxShadow: '0 22px 60px rgba(22,50,79,0.08)',
  },
  footer: {
    padding: '56px 24px 28px',
    background: 'linear-gradient(180deg, #08111D, #050D16)',
  },
  footerInner: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 24,
    flexWrap: 'wrap',
  },
  footerBrand: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  footerText: {
    maxWidth: 420,
    color: '#B7C6D8',
    lineHeight: 1.68,
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
    padding: '10px 14px',
    borderRadius: 14,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
};

export default HomePage;
