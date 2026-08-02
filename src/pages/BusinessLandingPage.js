import React, { useEffect } from 'react';
import { Button, Collapse, Tag } from 'antd';
import {
  ApartmentOutlined,
  ArrowRightOutlined,
  BankOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  CreditCardOutlined,
  HomeOutlined,
  LineChartOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import BusinessLandingHeader from '../components/business/BusinessLandingHeader';
import BusinessDashboardMockup from '../components/business/BusinessDashboardMockup';
import './BusinessLandingPage.css';

const reveal = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

const audience = [
  [HomeOutlined, 'Коттеджи и домики', 'Свободные даты, заезды, гости и оплаты по каждому объекту.'],
  [ApartmentOutlined, 'Базы отдыха', 'Несколько домиков, сотрудники и единый календарь загрузки.'],
  [BankOutlined, 'Гостевые дома', 'Брони, статусы гостей и понятная коммуникация с менеджером.'],
  [SafetyCertificateOutlined, 'Небольшие отели', 'Рабочее пространство для номеров, заявок и текущих задач.'],
  [CompassOutlined, 'Глэмпинги и юрты', 'Показывайте свободные даты и принимайте заявки без ручного хаоса.'],
  [TeamOutlined, 'Апартаменты и комплексы', 'Управляйте несколькими объектами из одного кабинета.'],
];

const features = [
  {
    type: 'calendar', icon: CalendarOutlined, title: 'Календарь занятости',
    text: 'Заезды, выезды, уборка и свободные даты всех объектов в одном расписании.',
    action: 'Открыть возможности', wide: true,
  },
  {
    type: 'booking', icon: HomeOutlined, title: 'Гости бронируют сами',
    text: 'Гость выбирает объект, даты и количество человек, а заявка сразу попадает в кабинет.',
    action: 'Попробовать бесплатно',
  },
  {
    type: 'notifications', icon: BellOutlined, title: 'Напоминания гостям',
    text: 'Держите в одном месте сообщения о заезде, остатке оплаты и правилах проживания.',
    action: 'Посмотреть сценарии',
  },
  {
    type: 'revenue', icon: LineChartOutlined, title: 'Больше бронирований — выше доход',
    text: 'Смотрите загрузку, средний чек, предоплаты и динамику по объектам.',
    action: 'Узнать больше', wide: true,
  },
  {
    type: 'objects', icon: ApartmentOutlined, title: 'Несколько объектов',
    text: 'Переключайтесь между домиками и назначайте ответственных менеджеров.',
    action: 'Для нескольких объектов',
  },
  {
    type: 'payments', icon: WalletOutlined, title: 'Управление оплатами',
    text: 'Предоплаты, чеки, задолженности и история операций без отдельных таблиц.',
    action: 'Посмотреть тарифы',
    prices: true,
  },
];

const steps = [
  ['1', 'Зарегистрируйте компанию', 'Создайте профиль владельца и добавьте контакты.'],
  ['2', 'Добавьте объект', 'Заполните данные домика, гостевого дома или базы отдыха.'],
  ['3', 'Настройте цены и даты', 'Укажите свободные дни, правила и стоимость проживания.'],
  ['4', 'Получайте заявки', 'Клиенты видят объект и отправляют запрос на бронирование.'],
  ['5', 'Управляйте заездами', 'Ведите гостей, статусы и оплаты через календарь.'],
];

const faqs = [
  ['Кому подходит TravelPay Business?', 'Владельцам коттеджей, домиков, гостевых домов, баз отдыха, небольших отелей, апартаментов, глэмпингов и юрт.'],
  ['Можно ли вести несколько объектов?', 'Да. В кабинете предусмотрена работа с несколькими объектами, их датами, бронированиями и ответственными сотрудниками.'],
  ['Что видит гость?', 'Гость видит публичную страницу объекта, доступные даты и информацию, необходимую для отправки заявки.'],
  ['Как работают оплаты?', 'В кабинете можно вести реквизиты, предоплаты, статусы чеков и историю операций. Подключённые способы оплаты зависят от настроек компании.'],
  ['Можно ли пригласить сотрудников?', 'Да. После подключения компании владелец сможет распределять рабочие задачи и доступы между сотрудниками.'],
];

function AnimatedSection({ children, className = '', id }) {
  const reduced = useReducedMotion();
  return (
    <motion.section
      id={id}
      className={`tp-business-section ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={reduced ? undefined : reveal}
      transition={{ duration: 0.48 }}
    >
      {children}
    </motion.section>
  );
}

function FeaturePreview({ type }) {
  if (type === 'calendar') {
    return (
      <div className="tp-business-preview tp-business-preview--calendar" aria-hidden="true">
        <div className="tp-business-preview__calendar-head"><span>Август</span><small>Неделя</small></div>
        <div className="tp-business-preview__calendar-days">{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => <span className={index === 2 ? 'is-current' : ''} key={day}>{day}<b>{12 + index}</b></span>)}</div>
        <div className="tp-business-preview__agenda">
          <div><time>10:00</time><span className="is-blue">Заезд · Коттедж «Ала-Тоо»</span></div>
          <div><time>12:00</time><span className="is-orange">Выезд · Домик №3</span></div>
          <div><time>14:00</time><span className="is-slate">Уборка · Домик №3</span></div>
        </div>
      </div>
    );
  }

  if (type === 'booking') {
    return (
      <div className="tp-business-preview tp-business-preview--booking" aria-hidden="true">
        <div className="tp-business-preview__stay-cover"><span>Коттедж у озера</span><i>6 гостей</i></div>
        <div className="tp-business-preview__booking-content"><b>12–14 августа</b><span>2 ночи · 6 гостей</span><div><i className="is-available" /><i className="is-available" /><i className="is-booked" /><i className="is-booked" /><i /><i /></div><strong>Заявка отправлена</strong></div>
      </div>
    );
  }

  if (type === 'notifications') {
    return (
      <div className="tp-business-preview tp-business-preview--notifications" aria-hidden="true">
        <p><BellOutlined /><span><b>Заезд завтра в 14:00</b><small>Коттедж «Ала-Тоо» · Айбек Т.</small></span></p>
        <p><WalletOutlined /><span><b>Осталось оплатить 4 000 сом</b><small>Напоминание гостю готово</small></span></p>
        <div><em>WhatsApp</em><em>Telegram</em><em className="is-soon">SMS · скоро</em></div>
      </div>
    );
  }

  if (type === 'revenue') {
    return (
      <div className="tp-business-preview tp-business-preview--revenue" aria-hidden="true">
        <div className="tp-business-preview__revenue-metrics"><span><small>Загрузка</small><b>68%</b></span><span><small>Броней</small><b>24</b></span><span><small>Средний чек</small><b>12,5k</b></span></div>
        <div className="tp-business-preview__revenue-chart">{[37, 54, 43, 68, 59, 82, 73, 92].map((height, index) => <i key={index} style={{ '--bar': `${height}%` }} />)}</div>
        <p><LineChartOutlined /> Демонстрационные показатели за 30 дней</p>
      </div>
    );
  }

  if (type === 'objects') {
    return (
      <div className="tp-business-preview tp-business-preview--objects" aria-hidden="true">
        <div><i className="is-lake"><HomeOutlined /></i><span><b>Домик №1</b><small>Занят до 14 августа</small></span><em>84%</em></div>
        <div><i className="is-mountain"><HomeOutlined /></i><span><b>Домик №2</b><small>Свободен 3 ночи</small></span><em>42%</em></div>
        <div><i className="is-forest"><HomeOutlined /></i><span><b>Коттедж «Ала-Тоо»</b><small>Заезд сегодня</small></span><em>91%</em></div>
      </div>
    );
  }

  return (
    <div className="tp-business-preview tp-business-preview--payments" aria-hidden="true">
      <div className="tp-business-preview__qr">{Array.from({ length: 25 }, (_, index) => <i className={index % 3 === 0 || index % 7 === 0 ? 'is-filled' : ''} key={index} />)}</div>
      <div><span>Оплата за бронь</span><b>8 000 сом</b><small>Предоплата · ожидает проверки</small><em><CheckCircleOutlined /> Чек прикреплён</em></div>
    </div>
  );
}

function BusinessFeatureCard({ feature, index, onRegister, onPrices }) {
  const Icon = feature.icon;
  const action = feature.prices ? onPrices : onRegister;
  return (
    <motion.article
      className={`tp-business-bento-card tp-business-bento-card--${feature.type} ${feature.wide ? 'is-wide' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.38, delay: index * 0.035 }}
    >
      <FeaturePreview type={feature.type} />
      <div className="tp-business-bento-card__content">
        <span className="tp-business-bento-card__icon"><Icon /></span>
        <h3>{feature.title}</h3>
        <p>{feature.text}</p>
        <button type="button" className="tp-business-card-link" onClick={action}>{feature.action}<ArrowRightOutlined /></button>
      </div>
    </motion.article>
  );
}

export default function BusinessLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduced = useReducedMotion();
  const register = () => navigate('/business/register');
  const showPrices = () => navigate('/prices');
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    const previousTitle = document.title;
    const description = 'Управляйте бронированиями, свободными датами, гостями и оплатами коттеджей, домиков и объектов размещения через TravelPay.';
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    let descriptionMeta = document.querySelector('meta[name="description"]');
    const createdDescription = !descriptionMeta;
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.name = 'description';
      document.head.appendChild(descriptionMeta);
    }
    document.title = 'TravelPay для владельцев домиков и коттеджей';
    descriptionMeta.content = description;

    return () => {
      document.title = previousTitle;
      if (createdDescription) descriptionMeta.remove();
      else descriptionMeta.content = previousDescription || '';
    };
  }, []);

  useEffect(() => {
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (!target) return undefined;
    const frame = window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    <main className="tp-business-landing" id="top">
      <BusinessLandingHeader />
      <div className="tp-business-landing__grain" aria-hidden="true" />
      <div className="tp-business-container">
        <section className="tp-business-hero" aria-labelledby="business-hero-title">
          <motion.div className="tp-business-hero__copy" initial={reduced ? false : { opacity: 0, y: 20 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <Tag className="tp-business-eyebrow" icon={<HomeOutlined />}>Система управления объектами размещения</Tag>
            <h1 id="business-hero-title">Все бронирования ваших домиков <span>в одном месте</span></h1>
            <p>Управляйте календарём занятости, принимайте заявки, контролируйте оплаты и показывайте свободные даты гостям через TravelPay.</p>
            <div className="tp-business-hero__cta">
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={register}>Зарегистрировать объект</Button>
              <Button size="large" onClick={() => scrollTo('features')}>Посмотреть возможности</Button>
            </div>
            <button type="button" className="tp-business-demo-link" onClick={() => scrollTo('demo')}>Посмотреть демо кабинета <ArrowRightOutlined /></button>
            <ul className="tp-business-hero__proof" aria-label="Возможности TravelPay Business">
              <li><CheckCircleOutlined /> Календарь занятости</li><li><CheckCircleOutlined /> Онлайн-заявки</li><li><CheckCircleOutlined /> Контроль оплат</li><li><CheckCircleOutlined /> Несколько объектов</li>
            </ul>
          </motion.div>
          <motion.div className="tp-business-hero__visual" initial={reduced ? false : { opacity: 0, scale: 0.96 }} animate={reduced ? undefined : { opacity: 1, scale: 1 }} transition={{ duration: 0.65, delay: 0.12 }}>
            <BusinessDashboardMockup />
          </motion.div>
        </section>

        <AnimatedSection className="tp-business-trust" aria-label="Что помогает решать TravelPay">
          <p>Для владельцев объектов, которым важно держать бронирования под контролем</p>
          {['Свободные даты', 'Заезды и выезды', 'Предоплаты', 'Команда и гости'].map((item) => <span key={item}><CheckCircleOutlined />{item}</span>)}
        </AnimatedSection>

        <AnimatedSection id="audience" className="tp-business-section--centered">
          <Tag className="tp-business-eyebrow">Для кого</Tag>
          <h2>Один кабинет для каждого формата размещения</h2>
          <p className="tp-business-lead">От одного домика до базы отдыха: данные об объектах, гостях, бронированиях и оплатах собраны в одном спокойном рабочем пространстве.</p>
          <div className="tp-business-audience-grid">
            {audience.map(([Icon, title, text], index) => (
              <motion.article key={title} className="tp-business-audience-card" variants={reduced ? undefined : reveal} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
                <span><Icon /></span><h3>{title}</h3><p>{text}</p>
              </motion.article>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection id="features" className="tp-business-features">
          <div className="tp-business-section__intro">
            <Tag className="tp-business-eyebrow">Возможности</Tag>
            <h2>Ежедневная работа без хаоса в сообщениях и таблицах</h2>
            <p className="tp-business-lead">Каждый блок показывает то, что действительно помогает управлять объектом: даты, гости, деньги, команда и загрузка.</p>
          </div>
          <div className="tp-business-bento">
            {features.map((feature, index) => <BusinessFeatureCard key={feature.type} feature={feature} index={index} onRegister={register} onPrices={showPrices} />)}
          </div>
        </AnimatedSection>

        <AnimatedSection id="workflow" className="tp-business-workflow">
          <div className="tp-business-workflow__intro"><Tag className="tp-business-eyebrow">Как это работает</Tag><h2>От первого объекта до понятного расписания</h2><p className="tp-business-lead">Заполняйте профиль по шагам, а потом управляйте всей операционной работой из одного кабинета.</p></div>
          <ol className="tp-business-steps">
            {steps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
          </ol>
        </AnimatedSection>

        <AnimatedSection id="pricing" className="tp-business-pricing tp-business-section--centered">
          <Tag className="tp-business-eyebrow">Тарифы</Tag>
          <h2>Выберите набор инструментов под количество объектов</h2>
          <p className="tp-business-lead">Тарифы подготовлены отдельно для владельцев домиков, коттеджей, гостевых домов и баз отдыха — без смешения с решениями для туроператоров.</p>
          <article className="tp-business-pricing-spotlight">
            <div><span className="tp-business-pricing-spotlight__icon"><CreditCardOutlined /></span><div><h3>Тарифы TravelPay для объектов размещения</h3><p>Сравните лимиты объектов, сотрудников и инструменты управления перед подключением.</p></div></div>
            <Button type="primary" size="large" onClick={showPrices}>Посмотреть тарифы <ArrowRightOutlined /></Button>
          </article>
          <p className="tp-business-price-note">Выбор тарифа не списывает деньги и его можно уточнить при регистрации.</p>
        </AnimatedSection>

        <AnimatedSection className="tp-business-why">
          <div><Tag className="tp-business-eyebrow">Почему TravelPay</Tag><h2>Не ещё один список задач, а понятный ритм работы с гостями</h2></div>
          <div className="tp-business-why__items"><span>Свободные даты видны сразу</span><span>Статусы не теряются в переписке</span><span>Оплаты и чеки в одном месте</span><span>Каждый объект под контролем</span></div>
        </AnimatedSection>

        <AnimatedSection id="faq" className="tp-business-faq">
          <Tag className="tp-business-eyebrow">Вопросы</Tag><h2>Частые вопросы владельцев объектов</h2>
          <Collapse ghost items={faqs.map(([label, children]) => ({ key: label, label, children }))} />
        </AnimatedSection>

        <AnimatedSection className="tp-business-final-cta">
          <div><Tag>TravelPay Business</Tag><h2>Сделайте бронирования понятнее для команды и гостей</h2><p>Создайте профиль объекта, настройте даты и начните принимать заявки через единый кабинет.</p></div>
          <div><Button type="primary" size="large" onClick={register}>Зарегистрировать объект</Button><Button size="large" onClick={showPrices}>Посмотреть тарифы</Button></div>
        </AnimatedSection>
      </div>
      <footer className="tp-business-footer"><div className="tp-business-container"><div><strong>TravelPay Business</strong><p>Инструменты для владельцев объектов размещения в Кыргызстане.</p></div><div><span>Продукт</span><a href="#features">Возможности</a><a href="/prices">Тарифы</a></div><div><span>Компания</span><a href="/about">О нас</a><a href="mailto:ulukbekmonolov07@gmail.com">Поддержка</a></div><div><span>Связь</span><a href="https://instagram.com/ulukbekmonolov07" target="_blank" rel="noreferrer">Instagram</a><a href="https://wa.me/996990909109" target="_blank" rel="noreferrer">WhatsApp</a></div><small>© {new Date().getFullYear()} TravelPay</small></div></footer>
    </main>
  );
}
