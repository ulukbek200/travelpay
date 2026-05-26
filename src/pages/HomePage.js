import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Collapse, Row, Col, Space, Tag, Typography, Segmented } from 'antd';
import {
  ArrowRightOutlined,
  CarOutlined,
  CompassOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  TeamOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const BRAND_BLUE = '#1d3557';
const BRAND_GOLD = '#fca311';
const TURQUOISE = '#16b6c4';

const copy = {
  EN: {
    navBook: 'Book Tour',
    heroTag: 'Premium Central Asia Tours',
    heroTitle: 'Exclusive tours across Kyrgyzstan and Almaty',
    heroText: 'Premium routes, AI Concierge, local guides, and comfortable journeys through Central Asia.',
    primary: 'Choose Tour',
    secondary: 'AI will plan route',
    stats: [['16', 'Signature destinations'], ['24/7', 'Concierge support'], ['3', 'Languages']],
    trusted: 'Trusted by travelers seeking premium mountain, lake, and nomadic experiences',
    destinationsTitle: 'Popular Destinations',
    destinationsText: 'Only Kyrgyzstan and Kazakhstan routes, curated for cinematic landscapes and authentic culture.',
    toursTitle: 'Exclusive Tours',
    whyTitle: 'Why Choose Us',
    galleryTitle: 'Tour Gallery',
    testimonialsTitle: 'Traveler Stories',
    faqTitle: 'FAQ',
    footerText: 'Luxury tours across Kyrgyzstan and Almaty region with local expertise and premium service.',
    partnership: 'Partnership',
    partnerTitle: 'Partnership for tour companies',
    partnerText: 'Cooperate with us, publish your tours, receive clients, and grow your tourism business in Kyrgyzstan and Kazakhstan.',
    partnerCta: 'Become a Partner',
  },
  RU: {
    navBook: 'Бронировать',
    heroTag: 'Премиальные туры по Центральной Азии',
    heroTitle: 'Эксклюзивные туры по Кыргызстану и Алматы',
    heroText:
      'Премиальные маршруты, AI Concierge, локальные гиды и комфортные путешествия по Центральной Азии.',
    primary: 'Выбрать тур',
    secondary: 'AI подберёт маршрут',
    stats: [['16', 'направлений'], ['24/7', 'поддержка'], ['3', 'языка']],
    trusted: 'Нам доверяют путешественники, выбирающие премиальные горные и озерные маршруты',
    destinationsTitle: 'Популярные направления',
    destinationsText: 'Только Кыргызстан и Казахстан: кинематографичные пейзажи и настоящая культура региона.',
    toursTitle: 'Эксклюзивные туры',
    whyTitle: 'Почему выбирают нас',
    galleryTitle: 'Галерея туров',
    testimonialsTitle: 'Истории путешественников',
    faqTitle: 'FAQ',
    footerText: 'Премиальные туры по Кыргызстану и региону Алматы с локальной экспертизой и высоким сервисом.',
    partnership: 'Партнёрство',
    partnerTitle: 'Партнёрство для тур компаний',
    partnerText: 'Сотрудничайте с нами, размещайте свои туры, получайте клиентов и развивайте туристический бизнес в Кыргызстане и Казахстане.',
    partnerCta: 'Стать партнёром',
  },
  KG: {
    navBook: 'Тур брондоо',
    heroTag: 'Премиум Борбор Азия турлары',
    heroTitle: 'Кыргызстан жана Алматы боюнча өзгөчө турлар',
    heroText:
      'Премиум маршруттар, AI Concierge, жергиликтүү гиддер жана Борбор Азия боюнча ыңгайлуу саякаттар.',
    primary: 'Тур тандоо',
    secondary: 'AI маршрут тандайт',
    stats: [['16', 'багыт'], ['24/7', 'колдоо'], ['3', 'тил']],
    trusted: 'Премиум тоо, көл жана көчмөн тажрыйбасын тандаган саякатчылар бизге ишенет',
    destinationsTitle: 'Популярдуу багыттар',
    destinationsText: 'Кыргызстан жана Казахстан гана: кооз табият жана чыныгы жергиликтүү маданият.',
    toursTitle: 'Эксклюзив турлар',
    whyTitle: 'Эмне үчүн биз',
    galleryTitle: 'Тур галереясы',
    testimonialsTitle: 'Саякатчылардын пикирлери',
    faqTitle: 'FAQ',
    footerText: 'Кыргызстан жана Алматы аймагы боюнча локалдык тажрыйба жана премиум сервис.',
    partnership: 'Өнөктөштүк',
    partnerTitle: 'Тур компаниялар үчүн өнөктөштүк',
    partnerText: 'Биз менен кызматташып, турларыңызды жайгаштырып, кардарларды алып, Кыргызстан жана Казахстандагы туризм бизнесин өнүктүрүңүз.',
    partnerCta: 'Өнөктөш болуу',
  },
};

const destinations = [
  ['Issyk-Kul', 'Kyrgyzstan', 'Turquoise alpine lake', 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=1200&q=80'],
  ['Ala-Archa', 'Kyrgyzstan', 'Glacier valley near Bishkek', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'],
  ['Karakol', 'Kyrgyzstan', 'Adventure base for mountains', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'],
  ['Jeti-Oguz', 'Kyrgyzstan', 'Red rocks and alpine meadows', 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1200&q=80'],
  ['Song-Kol', 'Kyrgyzstan', 'Yurts, horses, high pastures', 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80'],
  ['Kel-Suu', 'Kyrgyzstan', 'Remote canyon lake expedition', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'],
  ['Almaty', 'Kazakhstan', 'Elegant city and mountain lifestyle', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80'],
  ['Charyn Canyon', 'Kazakhstan', 'Desert canyon landscapes', 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80'],
  ['Kolsai Lakes', 'Kazakhstan', 'Forest lakes and quiet luxury', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1200&q=80'],
  ['Kaindy Lake', 'Kazakhstan', 'Sunken forest mountain lake', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80'],
  ['Medeu', 'Kazakhstan', 'Iconic alpine sports complex', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'],
  ['Big Almaty Lake', 'Kazakhstan', 'High mountain turquoise lake', 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80'],
];

const tours = [
  ['VIP Group Tours', 'Small premium groups, curated routes, boutique stays, and carefully timed scenic stops.'],
  ['Private Tours', 'Fully personalized journeys with private guide, premium vehicle, and flexible pace.'],
  ['Adventure Tours', 'Kel-Suu, Ala-Archa, Karakol, Charyn Canyon, Kolsai Lakes, and high mountain experiences.'],
  ['Luxury Nomad Experiences', 'Yurt stays, horses, local cuisine, eagle culture, and sunset camp atmospheres.'],
];

const why = [
  ['Local Guides', 'Expert guides from Kyrgyzstan and Kazakhstan who know hidden viewpoints and real stories.', <CompassOutlined />],
  ['Luxury Transport', 'Comfortable vehicles for mountain roads, airport pickup, and private transfers.', <CarOutlined />],
  ['Authentic Experiences', 'Nomadic culture, yurts, horses, lakes, canyons, and warm local hospitality.', <SafetyCertificateOutlined />],
  ['Multilingual Support', 'KG, RU, EN service for smooth communication before and during the tour.', <CustomerServiceOutlined />],
];

const partnerCards = [
  ['Тур компании', 'Размещайте авторские маршруты и получайте качественные заявки.', <CompassOutlined />],
  ['Локальные гиды', 'Показывайте гостям настоящую культуру, природу и скрытые локации.', <TeamOutlined />],
  ['Отели и гостевые дома', 'Заполняйте номера через премиальные турпакеты и сезонные маршруты.', <ShopOutlined />],
  ['Транспортные компании', 'Получайте заказы на трансферы, внедорожники и комфортные поездки.', <CarOutlined />],
  ['Агентства и партнёры', 'Расширяйте продажи через совместные туры и локальную экспертизу.', <GlobalOutlined />],
];

const gallery = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=900&q=80',
];

const testimonials = [
  ['Elena M.', 'Private Issyk-Kul Tour', 'The route felt premium and personal. Our guide knew every viewpoint and the transport was excellent.'],
  ['Arman S.', 'Almaty Region Escape', 'Kolsai, Kaindy and Charyn were organized beautifully. It felt like a luxury mountain retreat.'],
  ['Sofia K.', 'Nomad Experience', 'Song-Kol with yurts and horses was unforgettable, but still comfortable and very well planned.'],
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.62 },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem('travelpay_language') || 'EN');
  const t = copy[language] || copy.EN;

  useEffect(() => {
    const handleLanguageChange = (event) => setLanguage(event.detail || localStorage.getItem('travelpay_language') || 'EN');
    window.addEventListener('travelpay-language-change', handleLanguageChange);
    return () => window.removeEventListener('travelpay-language-change', handleLanguageChange);
  }, []);

  const faqItems = useMemo(() => [
    {
      key: '1',
      label: language === 'RU' ? 'Какие направления доступны?' : language === 'KG' ? 'Кайсы багыттар бар?' : 'Which destinations are available?',
      children: 'Issyk-Kul, Bishkek, Ala-Archa, Karakol, Jeti-Oguz, Song-Kol, Tash-Rabat, Kel-Suu, Sary-Chelek, Almaty, Charyn Canyon, Kolsai Lakes, Kaindy Lake, Medeu, Shymbulak, Big Almaty Lake.',
    },
    {
      key: '2',
      label: language === 'RU' ? 'Можно ли заказать приватный тур?' : language === 'KG' ? 'Жеке тур брондосо болобу?' : 'Can I book a private tour?',
      children: language === 'RU' ? 'Да, мы делаем приватные маршруты с гидом, транспортом и гибким графиком.' : language === 'KG' ? 'Ооба, гид, транспорт жана ийкемдүү график менен жеке маршрут даярдайбыз.' : 'Yes, private tours include a guide, transport, and flexible routing.',
    },
    {
      key: '3',
      label: language === 'RU' ? 'На каких языках есть поддержка?' : language === 'KG' ? 'Кайсы тилдерде колдоо бар?' : 'Which languages are supported?',
      children: 'KG | RU | EN',
    },
  ], [language]);

  return (
    <main className="home-page" style={styles.page}>
      <section className="home-hero-section" style={styles.hero}>
        <video className="central-asia-hero-video" autoPlay muted loop playsInline style={styles.heroVideo}>
          <source src="https://videos.pexels.com/video-files/854976/854976-hd_1920_1080_30fps.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2021/08/10/84776-587945089_large.mp4" type="video/mp4" />
        </video>
        <div className="hero-gradient-layer hero-gradient-layer-one" />
        <div className="hero-gradient-layer hero-gradient-layer-two" />
        <div className="hero-gradient-layer hero-gradient-layer-three" />
        <div style={styles.heroOverlay} />

        <motion.div style={styles.heroContent} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
          <Tag style={styles.heroTag}>{t.heroTag}</Tag>
          <Title style={styles.heroTitle}>{t.heroTitle}</Title>
          <Paragraph style={styles.heroText}>{t.heroText}</Paragraph>
          <Space size={14} wrap style={styles.heroActions}>
            <Button size="large" type="primary" style={styles.goldButton} className="premium-cta" onClick={() => navigate('/tours')}>
              {t.primary} <ArrowRightOutlined />
            </Button>
            <Button size="large" style={styles.consultButton} className="premium-cta secondary" onClick={() => window.dispatchEvent(new Event('open-ai-concierge'))}>
              {t.secondary}
            </Button>
          </Space>
        </motion.div>

      </section>

      <section style={styles.trustSection}>
        <Text style={styles.trustText}>{t.trusted}</Text>
        <div style={styles.logoStrip}>
          {['Issyk-Kul', 'Karakol', 'Song-Kol', 'Almaty', 'Kolsai Lakes', 'Charyn Canyon'].map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </section>

      <section id="destinations" style={styles.section}>
        <motion.div {...fadeUp} style={styles.sectionHeader}>
          <Tag style={styles.sectionTag}><EnvironmentOutlined /> {t.destinationsTitle}</Tag>
          <Title level={2} style={styles.sectionTitle}>{t.destinationsTitle}</Title>
          <Paragraph style={styles.sectionText}>{t.destinationsText}</Paragraph>
        </motion.div>

        <div style={styles.destinationGrid}>
          {destinations.map(([title, country, text, image], index) => (
            <motion.article key={title} style={styles.destinationCard} {...fadeUp} transition={{ delay: index * 0.035, duration: 0.5 }} whileHover={{ y: -8 }}>
              <img src={image} alt={title} style={styles.destinationImage} />
              <div style={styles.destinationOverlay}>
                <Tag style={styles.countryTag}>{country}</Tag>
                <Title level={3} style={styles.destinationTitle}>{title}</Title>
                <Text style={styles.destinationText}>{text}</Text>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section style={styles.darkSection}>
        <motion.div {...fadeUp} style={styles.sectionHeader}>
          <Tag style={styles.darkTag}>{t.toursTitle}</Tag>
          <Title level={2} style={styles.darkTitle}>{t.toursTitle}</Title>
        </motion.div>

        <Row gutter={[20, 20]}>
          {tours.map(([title, text], index) => (
            <Col xs={24} md={12} key={title}>
              <motion.div {...fadeUp} transition={{ delay: index * 0.08 }}>
                <Card style={styles.tourCard}>
                  <Title level={3} style={styles.tourTitle}>{title}</Title>
                  <Paragraph style={styles.tourText}>{text}</Paragraph>
                  <Button type="link" style={styles.tourLink} onClick={() => navigate('/tours')}>
                    {t.primary} <ArrowRightOutlined />
                  </Button>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      <section style={styles.section}>
        <motion.div {...fadeUp} style={styles.sectionHeader}>
          <Tag style={styles.sectionTag}>{t.whyTitle}</Tag>
          <Title level={2} style={styles.sectionTitle}>{t.whyTitle}</Title>
        </motion.div>

        <Row gutter={[20, 20]}>
          {why.map(([title, text, icon], index) => (
            <Col xs={24} md={12} lg={6} key={title}>
              <motion.div {...fadeUp} transition={{ delay: index * 0.06 }}>
                <Card style={styles.whyCard}>
                  <div style={styles.whyIcon}>{icon}</div>
                  <Title level={4} style={styles.cardTitle}>{title}</Title>
                  <Paragraph style={styles.cardText}>{text}</Paragraph>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      <section style={styles.gallerySection}>
        <motion.div {...fadeUp} style={styles.sectionHeader}>
          <Tag style={styles.darkTag}>{t.galleryTitle}</Tag>
          <Title level={2} style={styles.darkTitle}>{t.galleryTitle}</Title>
        </motion.div>
        <div style={styles.galleryGrid}>
          {gallery.map((image, index) => (
            <motion.img key={image} src={image} alt="Central Asia tour" style={{ ...styles.galleryImage, gridRow: index === 0 || index === 3 ? 'span 2' : 'span 1' }} whileHover={{ scale: 1.025 }} />
          ))}
        </div>
      </section>

      <section id="partnership" style={styles.partnershipSection}>
        <motion.div className="partner-shell" {...fadeUp} style={styles.partnerShell}>
          <div style={styles.partnerIntro}>
            <Tag style={styles.darkTag}>{t.partnership}</Tag>
            <Title level={2} style={styles.partnerTitle}>{t.partnerTitle}</Title>
            <Paragraph style={styles.partnerText}>{t.partnerText}</Paragraph>
            <Button size="large" type="primary" style={styles.goldButton} className="premium-cta" onClick={() => navigate('/register')}>
              {t.partnerCta} <ArrowRightOutlined />
            </Button>
          </div>

          <div style={styles.partnerGrid}>
            {partnerCards.map(([title, text, icon]) => (
              <motion.div key={title} whileHover={{ y: -7 }} transition={{ duration: 0.2 }}>
                <Card style={styles.partnerCard}>
                  <div style={styles.partnerIcon}>{icon}</div>
                  <Title level={4} style={styles.partnerCardTitle}>{title}</Title>
                  <Paragraph style={styles.partnerCardText}>{text}</Paragraph>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section style={styles.section}>
        <motion.div {...fadeUp} style={styles.sectionHeader}>
          <Tag style={styles.sectionTag}>{t.testimonialsTitle}</Tag>
          <Title level={2} style={styles.sectionTitle}>{t.testimonialsTitle}</Title>
        </motion.div>
        <Row gutter={[20, 20]}>
          {testimonials.map(([name, route, text], index) => (
            <Col xs={24} md={8} key={name}>
              <motion.div {...fadeUp} transition={{ delay: index * 0.08 }}>
                <Card style={styles.testimonialCard}>
                  <Space size={4} style={{ color: BRAND_GOLD, marginBottom: 14 }}>
                    {[1, 2, 3, 4, 5].map((star) => <StarFilled key={star} />)}
                  </Space>
                  <Paragraph style={styles.quote}>{text}</Paragraph>
                  <Text strong style={{ color: BRAND_BLUE }}>{name}</Text>
                  <br />
                  <Text type="secondary">{route}</Text>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </section>

      <section style={styles.section}>
        <Row gutter={[28, 28]} align="middle">
          <Col xs={24} lg={10}>
            <motion.div {...fadeUp}>
              <Tag style={styles.sectionTag}>{t.faqTitle}</Tag>
              <Title level={2} style={styles.sectionTitle}>{t.faqTitle}</Title>
              <Paragraph style={styles.sectionText}>{t.destinationsText}</Paragraph>
            </motion.div>
          </Col>
          <Col xs={24} lg={14}>
            <Collapse size="large" style={styles.faq} items={faqItems} />
          </Col>
        </Row>
      </section>

      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div>
            <div style={styles.footerLogo}>TravelPay Central Asia</div>
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
          {[
            ['Kyrgyzstan', 'Issyk-Kul', 'Ala-Archa', 'Karakol', 'Song-Kol'],
            ['Kazakhstan', 'Almaty', 'Charyn Canyon', 'Kolsai Lakes', 'Medeu'],
            ['Contact', '+996 555 123 456', 'hello@travelpay.kg', 'Instagram · WhatsApp'],
          ].map(([heading, ...links]) => (
            <div key={heading}>
              <Text style={styles.footerHeading}>{heading}</Text>
              {links.map((link) => <span key={link} style={styles.footerLink}>{link}</span>)}
            </div>
          ))}
        </div>
      </footer>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 12% 8%, rgba(22,182,196,0.10), transparent 28%), radial-gradient(circle at 88% 18%, rgba(252,163,17,0.10), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #eef5fb 48%, #f9fbff 100%)',
    color: BRAND_BLUE,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    scrollBehavior: 'smooth',
  },
  hero: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '136px max(24px, calc((100vw - 1180px) / 2 + 24px)) 92px',
    overflow: 'hidden',
    marginTop: -78,
    background: '#06111f',
  },
  heroVideo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.82,
    filter: 'saturate(1.08) contrast(1.04) brightness(0.90)',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.05), transparent 28%), linear-gradient(90deg, rgba(6,17,31,0.64), rgba(6,17,31,0.46), rgba(6,17,31,0.64)), linear-gradient(180deg, rgba(4,11,21,0.22), rgba(4,11,21,0.76))',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 850,
    textAlign: 'center',
  },
  heroTag: {
    color: '#fff',
    background: 'rgba(255,255,255,0.13)',
    border: '1px solid rgba(255,255,255,0.24)',
    borderRadius: 999,
    padding: '8px 16px',
    fontWeight: 760,
    letterSpacing: 0.25,
    backdropFilter: 'blur(18px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 'clamp(38px, 5.2vw, 72px)',
    lineHeight: 1.03,
    margin: '24px auto 20px',
    fontWeight: 760,
    letterSpacing: 0,
    textShadow: '0 22px 70px rgba(0,0,0,0.34)',
  },
  heroText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 19,
    lineHeight: 1.65,
    maxWidth: 690,
    margin: '0 auto 32px',
  },
  heroActions: {
    justifyContent: 'center',
  },
  goldButton: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffc15a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    height: 48,
    borderRadius: 999,
    paddingInline: 24,
    fontWeight: 820,
    boxShadow: '0 18px 42px rgba(252,163,17,0.32)',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    transform: 'translateZ(0)',
  },
  consultButton: {
    borderColor: 'rgba(255,255,255,0.34)',
    color: '#fff',
    background: 'rgba(255,255,255,0.10)',
    height: 48,
    borderRadius: 999,
    paddingInline: 24,
    fontWeight: 780,
    backdropFilter: 'blur(18px)',
    boxShadow: '0 14px 34px rgba(0,0,0,0.18)',
    outline: 'none',
  },
  trustSection: {
    padding: '34px 24px',
    background: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    borderBottom: '1px solid rgba(29,53,87,0.08)',
    backdropFilter: 'blur(18px)',
  },
  trustText: {
    color: '#64748b',
    fontWeight: 800,
  },
  logoStrip: {
    margin: '22px auto 0',
    maxWidth: 940,
    display: 'flex',
    justifyContent: 'center',
    gap: 26,
    flexWrap: 'wrap',
    color: BRAND_BLUE,
    fontWeight: 820,
    opacity: 0.76,
  },
  section: {
    maxWidth: 1180,
    margin: '0 auto',
    padding: '96px 24px',
  },
  sectionHeader: {
    maxWidth: 760,
    margin: '0 auto 42px',
    textAlign: 'center',
  },
  sectionTag: {
    background: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(29,53,87,0.08)',
    color: BRAND_BLUE,
    borderRadius: 999,
    padding: '6px 14px',
    fontWeight: 780,
    boxShadow: '0 12px 32px rgba(29,53,87,0.06)',
  },
  sectionTitle: {
    color: BRAND_BLUE,
    fontSize: 'clamp(30px, 4vw, 50px)',
    fontWeight: 820,
    marginTop: 16,
  },
  sectionText: {
    color: '#64748b',
    fontSize: 16,
    lineHeight: 1.7,
  },
  destinationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 18,
  },
  destinationCard: {
    position: 'relative',
    minHeight: 350,
    borderRadius: 28,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.72)',
    boxShadow: '0 24px 70px rgba(29,53,87,0.12)',
  },
  destinationImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  destinationOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 22,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.72))',
  },
  countryTag: {
    width: 'fit-content',
    color: BRAND_BLUE,
    background: 'rgba(255,255,255,0.86)',
    border: 'none',
    fontWeight: 900,
  },
  destinationTitle: {
    color: '#fff',
    margin: '10px 0 4px',
    fontWeight: 950,
  },
  destinationText: {
    color: '#e8f3ff',
    fontWeight: 700,
  },
  darkSection: {
    padding: '92px 24px',
    background: 'linear-gradient(180deg, #071523, #10233a)',
  },
  darkTag: {
    background: 'rgba(252,163,17,0.16)',
    color: BRAND_GOLD,
    border: '1px solid rgba(252,163,17,0.28)',
    borderRadius: 999,
    fontWeight: 950,
    padding: '5px 12px',
  },
  darkTitle: {
    color: '#fff',
    fontSize: 'clamp(30px, 4vw, 48px)',
    fontWeight: 820,
    marginTop: 16,
  },
  tourCard: {
    height: '100%',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 28,
    background: 'rgba(255,255,255,0.09)',
    backdropFilter: 'blur(22px)',
    boxShadow: '0 26px 70px rgba(0,0,0,0.22)',
  },
  tourTitle: {
    color: '#fff',
    fontWeight: 820,
  },
  tourText: {
    color: '#d7e3f2',
    lineHeight: 1.7,
  },
  tourLink: {
    color: BRAND_GOLD,
    fontWeight: 950,
    padding: 0,
  },
  whyCard: {
    height: '100%',
    border: '1px solid rgba(29,53,87,0.06)',
    borderRadius: 28,
    background: 'rgba(255,255,255,0.86)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 22px 60px rgba(29,53,87,0.08)',
  },
  whyIcon: {
    width: 54,
    height: 54,
    borderRadius: 20,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_BLUE}, ${TURQUOISE})`,
    color: '#fff',
    fontSize: 24,
    marginBottom: 18,
  },
  cardTitle: {
    color: BRAND_BLUE,
    fontWeight: 820,
  },
  cardText: {
    color: '#64748b',
    lineHeight: 1.65,
  },
  gallerySection: {
    padding: '92px 24px',
    background: 'linear-gradient(180deg, #10233a, #071523)',
  },
  partnershipSection: {
    padding: '100px 24px',
    background: 'radial-gradient(circle at 80% 20%, rgba(252,163,17,0.18), transparent 34%), linear-gradient(135deg, #071523, #10233a 58%, #193b5d)',
  },
  partnerShell: {
    maxWidth: 1180,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '0.85fr 1.15fr',
    gap: 28,
    alignItems: 'center',
  },
  partnerIntro: {
    color: '#fff',
  },
  partnerTitle: {
    color: '#fff',
    fontSize: 'clamp(32px, 4vw, 52px)',
    fontWeight: 820,
    lineHeight: 1.08,
    marginTop: 16,
  },
  partnerText: {
    color: '#d7e3f2',
    fontSize: 17,
    lineHeight: 1.75,
    marginBottom: 28,
  },
  partnerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: 16,
  },
  partnerCard: {
    height: '100%',
    borderRadius: 28,
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.18)',
    backdropFilter: 'blur(22px)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
  },
  partnerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffc15a)`,
    color: BRAND_BLUE,
    fontSize: 22,
    marginBottom: 14,
  },
  partnerCardTitle: {
    color: '#fff',
    fontWeight: 820,
  },
  partnerCardText: {
    color: '#d7e3f2',
    lineHeight: 1.65,
  },
  galleryGrid: {
    maxWidth: 1180,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gridAutoRows: 190,
    gap: 16,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 28,
    boxShadow: '0 22px 60px rgba(0,0,0,0.24)',
  },
  testimonialCard: {
    height: '100%',
    border: '1px solid rgba(29,53,87,0.06)',
    borderRadius: 28,
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 22px 60px rgba(29,53,87,0.08)',
  },
  quote: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 1.7,
  },
  faq: {
    borderRadius: 28,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.90)',
    boxShadow: '0 22px 60px rgba(29,53,87,0.08)',
    border: '1px solid rgba(29,53,87,0.06)',
  },
  footer: {
    background: '#071523',
    padding: '62px 24px',
  },
  footerGrid: {
    maxWidth: 1180,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.5fr repeat(3, 1fr)',
    gap: 28,
  },
  footerLogo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 850,
    marginBottom: 12,
  },
  footerText: {
    color: '#b7c6d8',
    maxWidth: 350,
  },
  footerHeading: {
    display: 'block',
    color: BRAND_GOLD,
    fontWeight: 950,
    marginBottom: 12,
  },
  footerLink: {
    display: 'block',
    color: '#d7e3f2',
    marginBottom: 8,
  },
};

export default HomePage;
