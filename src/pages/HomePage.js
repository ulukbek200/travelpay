import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Collapse, Input, Row, Col, Space, Tag, Typography, Segmented } from 'antd';
import {
  ArrowRightOutlined,
  CarOutlined,
  CompassOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  StarFilled,
  TeamOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const BRAND_BLUE = '#16324f';
const BRAND_GOLD = '#f0b24a';
const BRAND_TURQUOISE = '#2bb8c5';

const copy = {
  EN: {
    navBook: 'Book Tour',
    heroTag: 'Premium Central Asia Tours',
    heroTitle: 'Exclusive tours across Kyrgyzstan and Almaty',
    heroText: 'Premium routes, AI Concierge, local guides, and comfortable journeys through Central Asia.',
    primary: 'Choose Tour',
    secondary: 'AI will plan route',
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
    partnerFormTitle: 'Tell us about your company',
    partnerFormText: 'Leave your details and we will help connect your company to premium clients and curated routes.',
    partnerFormName: 'Your name',
    partnerFormCompany: 'Company',
    partnerFormEmail: 'Email',
    partnerFormMessage: 'What kind of partnership do you need?',
    partnerFormCta: 'Send partnership request',
  },
  RU: {
    navBook: 'Бронировать',
    heroTag: 'Премиальные туры по Центральной Азии',
    heroTitle: 'Эксклюзивные туры по Кыргызстану и Алматы',
    heroText: 'Премиальные маршруты, AI Concierge, локальные гиды и комфортные путешествия по Центральной Азии.',
    primary: 'Выбрать тур',
    secondary: 'AI подберёт маршрут',
    trusted: 'Нам доверяют путешественники, выбирающие премиальные горные, озёрные и кочевые маршруты',
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
    partnerFormTitle: 'Расскажите о вашей компании',
    partnerFormText: 'Оставьте контакты, и мы поможем подключить вашу компанию к премиальной аудитории и curated-маршрутам.',
    partnerFormName: 'Ваше имя',
    partnerFormCompany: 'Компания',
    partnerFormEmail: 'Email',
    partnerFormMessage: 'Какой формат сотрудничества вас интересует?',
    partnerFormCta: 'Отправить заявку',
  },
  KG: {
    navBook: 'Тур брондоо',
    heroTag: 'Премиум Борбор Азия турлары',
    heroTitle: 'Кыргызстан жана Алматы боюнча өзгөчө турлар',
    heroText: 'Премиум маршруттар, AI Concierge, жергиликтүү гиддер жана Борбор Азия боюнча ыңгайлуу саякаттар.',
    primary: 'Тур тандоо',
    secondary: 'AI маршрут тандайт',
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
    partnerFormTitle: 'Компанияңыз тууралуу жазыңыз',
    partnerFormText: 'Байланыш маалыматтарыңызды калтырыңыз, биз сизди премиум аудитория жана мыкты маршруттар менен байланыштырабыз.',
    partnerFormName: 'Атыңыз',
    partnerFormCompany: 'Компания',
    partnerFormEmail: 'Email',
    partnerFormMessage: 'Кайсы өнөктөштүк форматы керек?',
    partnerFormCta: 'Өтүнмө жөнөтүү',
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

const socialLinks = [
  { key: 'instagram', label: 'Instagram', href: 'https://instagram.com', icon: <InstagramOutlined /> },
  { key: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/996555123456', icon: <WhatsAppOutlined /> },
  { key: 'email', label: 'Email', href: 'mailto:hello@travelpay.kg', icon: <MailOutlined /> },
];

const footerColumns = [
  {
    title: 'Explore',
    links: ['Popular Destinations', 'Exclusive Tours', 'Tour Gallery', 'Partnership'],
  },
  {
    title: 'Destinations',
    links: ['Issyk-Kul', 'Karakol', 'Song-Kol', 'Almaty', 'Charyn Canyon'],
  },
  {
    title: 'Contact',
    links: ['+996 555 123 456', 'hello@travelpay.kg', 'Bishkek, Kyrgyzstan', 'Daily 09:00 - 21:00'],
  },
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
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
  });
  const t = copy[language] || copy.EN;

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail || localStorage.getItem('travelpay_language') || 'EN');
    };

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

  const handlePartnerInput = (key) => (event) => {
    const value = event?.target?.value || '';
    setPartnerForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePartnerSubmit = (event) => {
    event.preventDefault();
    navigate('/register');
  };

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

        <div className="home-shell home-hero-shell" style={styles.heroShell}>
          <motion.div className="home-hero-content" style={styles.heroContent} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
            <Tag style={styles.heroTag}>{t.heroTag}</Tag>
            <Title style={styles.heroTitle}>{t.heroTitle}</Title>
            <Paragraph style={styles.heroText}>{t.heroText}</Paragraph>
            <Space size={14} wrap className="home-hero-actions" style={styles.heroActions}>
              <Button size="large" type="primary" style={styles.goldButton} className="premium-cta" onClick={() => navigate('/tours')}>
                {t.primary} <ArrowRightOutlined />
              </Button>
              <Button size="large" style={styles.consultButton} className="premium-cta secondary" onClick={() => window.dispatchEvent(new Event('open-ai-concierge'))}>
                {t.secondary}
              </Button>
            </Space>
          </motion.div>
        </div>
      </section>

      <section className="home-trust-section" style={styles.trustSection}>
        <div className="home-shell" style={styles.trustShell}>
          <Text style={styles.trustText}>{t.trusted}</Text>
          <div className="home-logo-strip" style={styles.logoStrip}>
            {['Issyk-Kul', 'Karakol', 'Song-Kol', 'Almaty', 'Kolsai Lakes', 'Charyn Canyon'].map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="home-section" style={styles.section}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...fadeUp} className="home-section-header" style={styles.sectionHeader}>
            <Tag style={styles.sectionTag}><EnvironmentOutlined /> {t.destinationsTitle}</Tag>
            <Title level={2} style={styles.sectionTitle}>{t.destinationsTitle}</Title>
            <Paragraph style={styles.sectionText}>{t.destinationsText}</Paragraph>
          </motion.div>

          <div className="home-destination-grid" style={styles.destinationGrid}>
            {destinations.map(([title, country, text, image], index) => (
              <motion.article className="home-destination-card" key={title} style={styles.destinationCard} {...fadeUp} transition={{ delay: index * 0.03, duration: 0.48 }} whileHover={{ y: -6 }}>
                <img src={image} alt={title} style={styles.destinationImage} />
                <div style={styles.destinationOverlay}>
                  <Tag style={styles.countryTag}>{country}</Tag>
                  <Title level={3} style={styles.destinationTitle}>{title}</Title>
                  <Text style={styles.destinationText}>{text}</Text>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-dark-section" style={styles.darkSection}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...fadeUp} className="home-section-header" style={styles.sectionHeader}>
            <Tag style={styles.darkTag}>{t.toursTitle}</Tag>
            <Title level={2} style={styles.darkTitle}>{t.toursTitle}</Title>
          </motion.div>

          <Row gutter={[18, 18]}>
            {tours.map(([title, text], index) => (
              <Col xs={24} md={12} key={title}>
                <motion.div {...fadeUp} transition={{ delay: index * 0.06 }}>
                  <Card className="home-tour-card" style={styles.tourCard}>
                    <div style={styles.tourCardTop}>
                      <Tag style={styles.tourTag}>Premium Format</Tag>
                    </div>
                    <Title level={3} style={styles.tourTitle}>{title}</Title>
                    <Paragraph style={styles.tourText}>{text}</Paragraph>
                    <div style={styles.tourFooter}>
                      <span style={styles.tourMeta}>Curated itinerary</span>
                      <Button type="link" style={styles.tourLink} onClick={() => navigate('/tours')}>
                        {t.primary} <ArrowRightOutlined />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="home-section" style={styles.section}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...fadeUp} className="home-section-header" style={styles.sectionHeader}>
            <Tag style={styles.sectionTag}>{t.whyTitle}</Tag>
            <Title level={2} style={styles.sectionTitle}>{t.whyTitle}</Title>
          </motion.div>

          <Row gutter={[18, 18]}>
            {why.map(([title, text, icon], index) => (
              <Col xs={24} sm={12} lg={6} key={title}>
                <motion.div {...fadeUp} transition={{ delay: index * 0.06 }}>
                  <Card className="home-why-card" style={styles.whyCard}>
                    <div style={styles.whyIcon}>{icon}</div>
                    <Title level={4} style={styles.cardTitle}>{title}</Title>
                    <Paragraph style={styles.cardText}>{text}</Paragraph>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="home-gallery-section" style={styles.gallerySection}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...fadeUp} className="home-section-header" style={styles.sectionHeader}>
            <Tag style={styles.darkTag}>{t.galleryTitle}</Tag>
            <Title level={2} style={styles.darkTitle}>{t.galleryTitle}</Title>
          </motion.div>

          <div className="home-gallery-grid" style={styles.galleryGrid}>
            {gallery.map((image, index) => (
              <motion.div
                key={image}
                className={`home-gallery-item ${index === 0 || index === 3 ? 'is-tall' : ''}`}
                style={styles.galleryItem}
                whileHover={{ y: -4 }}
              >
                <img src={image} alt="Central Asia tour" style={styles.galleryImage} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="partnership" className="home-partnership-section" style={styles.partnershipSection}>
        <div className="home-shell">
          <motion.div className="partner-shell" {...fadeUp} style={styles.partnerShell}>
            <div style={styles.partnerIntro}>
              <Tag style={styles.darkTag}>{t.partnership}</Tag>
              <Title level={2} style={styles.partnerTitle}>{t.partnerTitle}</Title>
              <Paragraph style={styles.partnerText}>{t.partnerText}</Paragraph>
              <Button size="large" type="primary" style={styles.goldButton} className="premium-cta" onClick={() => navigate('/register')}>
                {t.partnerCta} <ArrowRightOutlined />
              </Button>
            </div>

            <Card className="home-partner-form-card" style={styles.partnerFormCard}>
              <Text style={styles.partnerFormEyebrow}>TravelPay B2B</Text>
              <Title level={3} style={styles.partnerFormTitle}>{t.partnerFormTitle}</Title>
              <Paragraph style={styles.partnerFormText}>{t.partnerFormText}</Paragraph>
              <form className="home-partner-form" style={styles.partnerForm} onSubmit={handlePartnerSubmit}>
                <Input value={partnerForm.name} onChange={handlePartnerInput('name')} placeholder={t.partnerFormName} style={styles.partnerInput} />
                <Input value={partnerForm.company} onChange={handlePartnerInput('company')} placeholder={t.partnerFormCompany} style={styles.partnerInput} />
                <Input value={partnerForm.email} onChange={handlePartnerInput('email')} placeholder={t.partnerFormEmail} style={styles.partnerInput} />
                <TextArea value={partnerForm.message} onChange={handlePartnerInput('message')} rows={4} placeholder={t.partnerFormMessage} style={styles.partnerTextarea} />
                <Button htmlType="submit" type="primary" style={styles.partnerSubmit}>
                  {t.partnerFormCta}
                </Button>
              </form>
            </Card>
          </motion.div>

          <div className="home-partner-grid" style={styles.partnerGrid}>
            {partnerCards.map(([title, text, icon]) => (
              <motion.div key={title} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                <Card className="home-partner-card" style={styles.partnerCard}>
                  <div style={styles.partnerIcon}>{icon}</div>
                  <Title level={4} style={styles.partnerCardTitle}>{title}</Title>
                  <Paragraph style={styles.partnerCardText}>{text}</Paragraph>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" style={styles.section}>
        <div className="home-shell" style={styles.sectionInner}>
          <motion.div {...fadeUp} className="home-section-header" style={styles.sectionHeader}>
            <Tag style={styles.sectionTag}>{t.testimonialsTitle}</Tag>
            <Title level={2} style={styles.sectionTitle}>{t.testimonialsTitle}</Title>
          </motion.div>

          <Row gutter={[18, 18]}>
            {testimonials.map(([name, route, text], index) => (
              <Col xs={24} md={8} key={name}>
                <motion.div {...fadeUp} transition={{ delay: index * 0.08 }}>
                  <Card className="home-testimonial-card" style={styles.testimonialCard}>
                    <Space size={4} style={styles.testimonialStars}>
                      {[1, 2, 3, 4, 5].map((star) => <StarFilled key={star} />)}
                    </Space>
                    <Paragraph style={styles.quote}>{text}</Paragraph>
                    <Text strong style={styles.testimonialName}>{name}</Text>
                    <Text style={styles.testimonialRoute}>{route}</Text>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="home-section" style={styles.section}>
        <div className="home-shell" style={styles.sectionInner}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} lg={10}>
              <motion.div {...fadeUp}>
                <Tag style={styles.sectionTag}>{t.faqTitle}</Tag>
                <Title level={2} style={styles.sectionTitle}>{t.faqTitle}</Title>
                <Paragraph style={styles.sectionText}>{t.destinationsText}</Paragraph>
              </motion.div>
            </Col>
            <Col xs={24} lg={14}>
              <Collapse className="home-faq" size="large" style={styles.faq} items={faqItems} />
            </Col>
          </Row>
        </div>
      </section>

      <footer className="home-footer" style={styles.footer}>
        <div className="home-shell">
          <div className="home-footer-grid" style={styles.footerGrid}>
            <div style={styles.footerBrand}>
              <div style={styles.footerLogo}>
                <span style={styles.footerLogoMark}>TP</span>
                <span style={styles.footerLogoText}>TravelPay Central Asia</span>
              </div>
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

            {footerColumns.map((column) => (
              <div key={column.title}>
                <Text style={styles.footerHeading}>{column.title}</Text>
                {column.links.map((link) => (
                  <a key={link} href="/" onClick={(event) => event.preventDefault()} className="home-footer-link" style={styles.footerLink}>
                    {link}
                  </a>
                ))}
              </div>
            ))}

            <div>
              <Text style={styles.footerHeading}>Social</Text>
              <div style={styles.socialList}>
                {socialLinks.map((item) => (
                  <a key={item.key} href={item.href} className="home-social-link" style={styles.socialLink}>
                    <span style={styles.socialIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
              <div style={styles.footerMeta}>
                <span style={styles.footerMetaRow}><PhoneOutlined /> +996 555 123 456</span>
                <span style={styles.footerMetaRow}><MailOutlined /> hello@travelpay.kg</span>
              </div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <span>© 2026 TravelPay. All rights reserved.</span>
            <span>Premium travel across Kyrgyzstan and Kazakhstan.</span>
          </div>
        </div>
      </footer>
    </main>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 12% 8%, rgba(43,184,197,0.10), transparent 28%), radial-gradient(circle at 88% 18%, rgba(240,178,74,0.12), transparent 24%), linear-gradient(180deg, #f5f8fc 0%, #edf3f8 46%, #f8fbff 100%)',
    color: BRAND_BLUE,
    fontFamily: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    scrollBehavior: 'smooth',
  },
  hero: {
    minHeight: '100vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '124px 24px 84px',
    overflow: 'hidden',
    marginTop: -78,
    background: '#06111f',
  },
  heroShell: {
    position: 'relative',
    zIndex: 2,
    display: 'block',
    width: '100%',
  },
  heroVideo: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.82,
    filter: 'saturate(1.08) contrast(1.04) brightness(0.9)',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.05), transparent 28%), linear-gradient(90deg, rgba(6,17,31,0.7), rgba(6,17,31,0.48), rgba(6,17,31,0.62)), linear-gradient(180deg, rgba(4,11,21,0.22), rgba(4,11,21,0.8))',
  },
  heroContent: {
    width: '100%',
    maxWidth: 760,
    minWidth: 0,
  },
  heroTag: {
    color: '#fff',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 999,
    padding: '8px 16px',
    fontWeight: 760,
    letterSpacing: 0.22,
    backdropFilter: 'blur(18px)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 'clamp(40px, 5vw, 72px)',
    lineHeight: 1.01,
    margin: '24px 0 18px',
    fontWeight: 820,
    letterSpacing: -1.1,
    textShadow: '0 22px 70px rgba(0,0,0,0.34)',
  },
  heroText: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 18,
    lineHeight: 1.7,
    maxWidth: 640,
    margin: '0 0 30px',
  },
  heroActions: {
    marginBottom: 0,
  },
  goldButton: {
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd48a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    height: 48,
    borderRadius: 999,
    paddingInline: 24,
    fontWeight: 840,
    boxShadow: '0 18px 42px rgba(240,178,74,0.28)',
    position: 'relative',
    overflow: 'hidden',
  },
  consultButton: {
    borderColor: 'rgba(255,255,255,0.28)',
    color: '#fff',
    background: 'rgba(255,255,255,0.08)',
    height: 48,
    borderRadius: 999,
    paddingInline: 24,
    fontWeight: 780,
    backdropFilter: 'blur(18px)',
    boxShadow: '0 14px 34px rgba(0,0,0,0.18)',
  },
  trustSection: {
    padding: '30px 24px',
    background: 'rgba(255,255,255,0.74)',
    borderBottom: '1px solid rgba(22,50,79,0.08)',
    backdropFilter: 'blur(18px)',
  },
  trustShell: {
    display: 'grid',
    gap: 18,
  },
  trustText: {
    color: '#526981',
    fontWeight: 760,
    textAlign: 'center',
  },
  logoStrip: {
    display: 'flex',
    justifyContent: 'center',
    gap: 18,
    flexWrap: 'wrap',
    color: BRAND_BLUE,
    fontWeight: 760,
    opacity: 0.78,
  },
  section: {
    padding: '84px 24px',
  },
  sectionInner: {
    width: '100%',
    minWidth: 0,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 760,
    margin: '0 auto 34px',
    textAlign: 'center',
  },
  sectionTag: {
    background: 'rgba(255,255,255,0.82)',
    borderColor: 'rgba(22,50,79,0.08)',
    color: BRAND_BLUE,
    borderRadius: 999,
    padding: '7px 14px',
    fontWeight: 780,
    boxShadow: '0 12px 32px rgba(22,50,79,0.06)',
  },
  sectionTitle: {
    color: BRAND_BLUE,
    fontSize: 'clamp(30px, 4vw, 48px)',
    fontWeight: 840,
    marginTop: 16,
    letterSpacing: -0.8,
  },
  sectionText: {
    color: '#62758a',
    fontSize: 16,
    lineHeight: 1.72,
  },
  destinationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16,
  },
  destinationCard: {
    position: 'relative',
    minHeight: 296,
    borderRadius: 24,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.78)',
    boxShadow: '0 24px 70px rgba(22,50,79,0.12)',
    minWidth: 0,
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
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minWidth: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.76))',
  },
  countryTag: {
    width: 'fit-content',
    color: BRAND_BLUE,
    background: 'rgba(255,255,255,0.88)',
    border: 'none',
    fontWeight: 860,
    marginInlineEnd: 0,
  },
  destinationTitle: {
    color: '#fff',
    margin: '10px 0 4px',
    fontWeight: 900,
    fontSize: 'clamp(24px, 3vw, 28px)',
  },
  destinationText: {
    color: '#e8f3ff',
    fontWeight: 650,
    lineHeight: 1.45,
  },
  darkSection: {
    padding: '84px 24px',
    background: 'linear-gradient(180deg, #071523, #10233a)',
  },
  darkTag: {
    background: 'rgba(240,178,74,0.16)',
    color: '#ffd48a',
    border: '1px solid rgba(240,178,74,0.28)',
    borderRadius: 999,
    fontWeight: 900,
    padding: '5px 12px',
  },
  darkTitle: {
    color: '#fff',
    fontSize: 'clamp(30px, 4vw, 48px)',
    fontWeight: 840,
    marginTop: 16,
    letterSpacing: -0.8,
  },
  tourCard: {
    height: '100%',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 24,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.07))',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
  },
  tourCardTop: {
    marginBottom: 12,
  },
  tourTag: {
    borderRadius: 999,
    marginInlineEnd: 0,
    borderColor: 'rgba(43,184,197,0.28)',
    color: '#9ce9ef',
    background: 'rgba(43,184,197,0.12)',
    fontWeight: 780,
  },
  tourTitle: {
    color: '#fff',
    fontWeight: 820,
    fontSize: 25,
    marginBottom: 12,
  },
  tourText: {
    color: '#d7e3f2',
    lineHeight: 1.68,
    minHeight: 108,
    marginBottom: 18,
  },
  tourFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 'auto',
  },
  tourMeta: {
    color: '#8fb2cf',
    fontSize: 13,
    fontWeight: 700,
  },
  tourLink: {
    color: BRAND_GOLD,
    fontWeight: 900,
    padding: 0,
  },
  whyCard: {
    height: '100%',
    border: '1px solid rgba(22,50,79,0.07)',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.88)',
    boxShadow: '0 20px 54px rgba(22,50,79,0.08)',
    backdropFilter: 'blur(18px)',
  },
  whyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_BLUE}, ${BRAND_TURQUOISE})`,
    color: '#fff',
    fontSize: 22,
    marginBottom: 18,
  },
  cardTitle: {
    color: BRAND_BLUE,
    fontWeight: 820,
  },
  cardText: {
    color: '#62758a',
    lineHeight: 1.66,
  },
  gallerySection: {
    padding: '84px 24px',
    background: 'linear-gradient(180deg, #10233a, #071523)',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gridAutoRows: 180,
    gap: 12,
  },
  galleryItem: {
    overflow: 'hidden',
    borderRadius: 22,
    boxShadow: '0 22px 60px rgba(0,0,0,0.22)',
    aspectRatio: '4 / 3',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  partnershipSection: {
    padding: '92px 24px',
    background: 'radial-gradient(circle at 80% 20%, rgba(240,178,74,0.18), transparent 34%), linear-gradient(135deg, #071523, #10233a 58%, #193b5d)',
  },
  partnerShell: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 22,
    alignItems: 'stretch',
    marginBottom: 22,
  },
  partnerIntro: {
    color: '#fff',
    padding: '8px 0',
    alignSelf: 'center',
  },
  partnerTitle: {
    color: '#fff',
    fontSize: 'clamp(32px, 4vw, 52px)',
    fontWeight: 820,
    lineHeight: 1.06,
    marginTop: 16,
    letterSpacing: -1,
  },
  partnerText: {
    color: '#d7e3f2',
    fontSize: 17,
    lineHeight: 1.76,
    marginBottom: 28,
    maxWidth: 560,
  },
  partnerFormCard: {
    borderRadius: 28,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,248,252,0.96))',
    border: '1px solid rgba(255,255,255,0.68)',
    boxShadow: '0 30px 84px rgba(0,0,0,0.18)',
  },
  partnerFormEyebrow: {
    display: 'inline-block',
    color: BRAND_TURQUOISE,
    fontWeight: 860,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  partnerFormTitle: {
    color: BRAND_BLUE,
    fontWeight: 840,
    marginBottom: 10,
  },
  partnerFormText: {
    color: '#62758a',
    lineHeight: 1.65,
    marginBottom: 20,
  },
  partnerForm: {
    display: 'grid',
    gap: 12,
  },
  partnerInput: {
    minHeight: 48,
    borderRadius: 16,
  },
  partnerTextarea: {
    borderRadius: 16,
    resize: 'vertical',
  },
  partnerSubmit: {
    height: 48,
    borderRadius: 999,
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd48a)`,
    borderColor: BRAND_GOLD,
    color: BRAND_BLUE,
    fontWeight: 860,
    boxShadow: '0 16px 36px rgba(240,178,74,0.24)',
  },
  partnerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  partnerCard: {
    height: '100%',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.16)',
    backdropFilter: 'blur(22px)',
    boxShadow: '0 24px 70px rgba(0,0,0,0.2)',
  },
  partnerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd48a)`,
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
    lineHeight: 1.66,
  },
  testimonialCard: {
    height: '100%',
    border: '1px solid rgba(22,50,79,0.06)',
    borderRadius: 24,
    background: 'rgba(255,255,255,0.88)',
    boxShadow: '0 22px 60px rgba(22,50,79,0.08)',
  },
  testimonialStars: {
    color: BRAND_GOLD,
    marginBottom: 14,
  },
  quote: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 1.72,
    marginBottom: 18,
  },
  testimonialName: {
    color: BRAND_BLUE,
    display: 'block',
    marginBottom: 4,
  },
  testimonialRoute: {
    color: '#64748b',
  },
  faq: {
    borderRadius: 24,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.92)',
    boxShadow: '0 22px 60px rgba(22,50,79,0.08)',
    border: '1px solid rgba(22,50,79,0.06)',
  },
  footer: {
    background: 'linear-gradient(180deg, #08111d, #050d16)',
    padding: '62px 24px 24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 24,
    paddingBottom: 24,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  footerBrand: {
    maxWidth: 360,
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  footerLogoMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: 'grid',
    placeItems: 'center',
    background: `linear-gradient(135deg, ${BRAND_GOLD}, #ffd48a)`,
    color: BRAND_BLUE,
    fontWeight: 900,
    letterSpacing: 0.3,
  },
  footerLogoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 840,
    letterSpacing: -0.5,
  },
  footerText: {
    color: '#b7c6d8',
    lineHeight: 1.7,
    marginBottom: 18,
  },
  footerHeading: {
    display: 'block',
    color: '#ffd48a',
    fontWeight: 900,
    marginBottom: 14,
  },
  footerLink: {
    display: 'block',
    color: '#d7e3f2',
    marginBottom: 10,
    transition: 'color 0.22s ease, transform 0.22s ease',
  },
  socialList: {
    display: 'grid',
    gap: 10,
    marginBottom: 18,
  },
  socialLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    color: '#d7e3f2',
    padding: '10px 12px',
    borderRadius: 16,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'transform 0.22s ease, background 0.22s ease, border-color 0.22s ease',
  },
  socialIcon: {
    width: 28,
    height: 28,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(240,178,74,0.14)',
    color: '#ffd48a',
  },
  footerMeta: {
    display: 'grid',
    gap: 8,
  },
  footerMetaRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: '#9eb0c2',
  },
  footerBottom: {
    paddingTop: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    color: '#8ea2b8',
    fontSize: 13,
    flexWrap: 'wrap',
  },
};

export default HomePage;
