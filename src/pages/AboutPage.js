import React, { useState } from 'react';
import {
  ArrowRightOutlined,
  BankOutlined,
  CompassOutlined,
  LoginOutlined,
  RocketOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import AudienceComparison from '../components/about/AudienceComparison';
import AudienceSwitcher from '../components/about/AudienceSwitcher';
import AboutVideoPanel from '../components/about/AboutVideoPanel';
import HowItWorksSteps from '../components/about/HowItWorksSteps';

const audienceContent = {
  travelers: {
    id: 'travelers',
    kicker: 'Клиентам',
    label: 'Для путешественников',
    title: 'Путешествуйте проще вместе с TravelPay',
    description:
      'Выбирайте туры по Кыргызстану, сравнивайте предложения разных туркомпаний, бронируйте домики и коттеджи, сохраняйте понравившиеся маршруты и получайте поддержку на каждом этапе путешествия.',
    video: '/videos/travelpay-users.mov',
    poster: '/images/about/users-video-poster.jpg',
    caption:
      'Видео для путешественников: выбор тура, просмотр маршрута, бронирование, избранное, AI Concierge и личный кабинет.',
    fallbackTitle: 'Видео для путешественников',
    fallbackText: 'Пока видео загружается, TravelPay показывает poster без пустого экрана.',
    steps: [
      {
        title: 'Найдите подходящий тур',
        text: 'Выберите направление, даты, стоимость и формат путешествия.',
      },
      {
        title: 'Сравните предложения',
        text: 'Посмотрите программу тура, фотографии, условия и информацию о туркомпании.',
      },
      {
        title: 'Забронируйте тур или домик',
        text: 'Оставьте заявку, выберите размещение и получите подтверждение.',
      },
      {
        title: 'Управляйте поездкой',
        text: 'Следите за бронированием, сохраняйте туры и получайте помощь через TravelPay.',
      },
    ],
    actions: [
      { label: 'Перейти к турам', to: '/tours', icon: <ArrowRightOutlined /> },
    ],
  },
  business: {
    id: 'business',
    kicker: 'Бизнесу',
    label: 'Для туркомпаний',
    title: 'Управляйте туристическим бизнесом в одном сервисе',
    description:
      'TravelPay помогает туркомпаниям публиковать туры, управлять бронированиями, размещением, клиентами и расписанием через единую бизнес-панель.',
    video: '/videos/travelpay-business.mp4',
    poster: '/images/about/business-video-poster.jpg',
    caption:
      'Видео для туркомпаний: создание компании, публикация туров, загрузка фото, календарь бронирований, заявки и аналитика.',
    fallbackTitle: 'Видео для туркомпаний',
    fallbackText: 'Слот готов под отдельное бизнес-видео. После добавления файла оно автоматически появится здесь.',
    steps: [
      {
        title: 'Зарегистрируйте туркомпанию',
        text: 'Создайте бизнес-профиль и добавьте информацию о компании.',
      },
      {
        title: 'Публикуйте туры и размещение',
        text: 'Добавляйте маршруты, программы, фотографии, домики и коттеджи.',
      },
      {
        title: 'Принимайте бронирования',
        text: 'Получайте заявки от клиентов и управляйте свободными местами.',
      },
      {
        title: 'Контролируйте работу компании',
        text: 'Используйте календарь, CRM-инструменты, аналитику и управление клиентами.',
      },
    ],
    actions: [
      { label: 'Подключить туркомпанию', to: '/business/register', icon: <RocketOutlined /> },
      { label: 'Войти в TravelPay Business', to: '/business/login', icon: <LoginOutlined />, secondary: true },
    ],
  },
};

const comparisonCards = [
  {
    title: 'Путешественникам',
    icon: <CompassOutlined />,
    items: ['Поиск туров', 'Бронирование домиков', 'Избранное', 'Накопления', 'AI Concierge', 'Поддержка'],
  },
  {
    title: 'Туркомпаниям',
    icon: <BankOutlined />,
    items: ['Публикация туров', 'Управление домиками', 'Календарь бронирований', 'Заявки клиентов', 'CRM', 'Аналитика'],
  },
];

const audienceTabs = Object.values(audienceContent).map(({ id, kicker, label }) => ({
  id,
  kicker,
  label,
}));

const AboutPage = () => {
  const navigate = useNavigate();
  const [activeAudience, setActiveAudience] = useState('travelers');
  const activeContent = audienceContent[activeAudience];

  return (
    <main className="about-page about-page--product">
      <section className="about-hero about-hero--product">
        <div className="about-hero__bg" />
        <div className="about-hero__shade" />
        <div className="about-shell about-hero__layout about-hero__layout--product">
          <div className="about-hero__copy">
            <span className="about-kicker">TravelPay by barsbektravel</span>
            <h1 className="about-hero__title">
              TravelPay объединяет путешественников и туристический бизнес
            </h1>
            <p className="about-hero__lead">
              Один сервис для выбора туров, бронирования домиков, накоплений и управления туристическими услугами.
            </p>
            <p className="about-hero__text">
              Путешественники находят и бронируют маршруты, а туркомпании публикуют туры, управляют заявками и
              работают с клиентами через единую систему.
            </p>
            <div className="about-hero__actions">
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/tours')}>
                Найти тур
              </Button>
              <Button size="large" icon={<TeamOutlined />} onClick={() => navigate('/business/register')}>
                Для туркомпаний
              </Button>
            </div>
          </div>

          <div className="about-hero__signal" aria-label="Ключевые преимущества TravelPay">
            <div>
              <strong>2 сценария</strong>
              <span>клиенты и бизнес</span>
            </div>
            <div>
              <strong>1 система</strong>
              <span>туры, домики, заявки</span>
            </div>
            <div>
              <strong>AI + CRM</strong>
              <span>поддержка и управление</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-audience" aria-labelledby="about-audience-title">
        <div className="about-shell">
          <div className="about-audience__head">
            <span className="about-kicker">Как пользоваться TravelPay</span>
            <h2 id="about-audience-title">Выберите, для кого вы открываете платформу</h2>
            <p>
              Контент, шаги и видео меняются под выбранную аудиторию, чтобы сразу было понятно, как начать работу.
            </p>
          </div>

          <AudienceSwitcher
            activeAudience={activeAudience}
            audiences={audienceTabs}
            onChange={setActiveAudience}
          />

          <div
            aria-labelledby={`${activeContent.id}-tab`}
            className={`about-audience-panel about-audience-panel--${activeContent.id}`}
            id={`${activeContent.id}-panel`}
            key={activeContent.id}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="about-audience-panel__copy">
              <span className="about-audience-panel__kicker">{activeContent.kicker}</span>
              <h3>{activeContent.title}</h3>
              <p>{activeContent.description}</p>
            </div>

            <div className="about-audience-panel__video">
              <AboutVideoPanel content={activeContent} />
            </div>

            <HowItWorksSteps steps={activeContent.steps} />

            <div className="about-audience-panel__actions">
              {activeContent.actions.map((action) => (
                <Button
                  className={action.secondary ? 'about-button about-button--glass' : 'about-button about-button--primary'}
                  icon={action.icon}
                  key={action.to}
                  onClick={() => navigate(action.to)}
                  size="large"
                  type={action.secondary ? 'default' : 'primary'}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AudienceComparison cards={comparisonCards} />

      <section className="about-section about-final-cta">
        <div className="about-shell about-final-cta__inner">
          <span className="about-kicker">Начать сейчас</span>
          <h2>Выберите, как вы хотите использовать TravelPay</h2>
          <p>
            Найдите готовый маршрут по Кыргызстану или подключите туркомпанию, чтобы принимать заявки в единой системе.
          </p>
          <div className="about-final-cta__actions">
            <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/tours')}>
              Найти тур
            </Button>
            <Button size="large" icon={<RocketOutlined />} onClick={() => navigate('/business/register')}>
              Подключить туркомпанию
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
