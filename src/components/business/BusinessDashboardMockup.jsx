import React, { useMemo, useState } from 'react';
import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  HomeOutlined,
  MoreOutlined,
  WalletOutlined,
} from '@ant-design/icons';

const tabs = {
  overview: { label: 'Объекты', title: 'Загрузка на этой неделе', value: '68%', bars: [42, 58, 49, 74, 62, 88, 70] },
  calendar: { label: 'Календарь', title: 'Свободно в августе', value: '4 ночи', bars: [62, 36, 75, 46, 84, 58, 68] },
  bookings: { label: 'Заявки', title: 'Новые обращения', value: '2 заявки', bars: [30, 52, 64, 48, 82, 66, 77] },
};

const properties = [
  { name: 'Коттедж «Ала-Тоо»', meta: '12–14 августа · 6 гостей', state: 'Заезд', tone: 'blue' },
  { name: 'Домик №3', meta: '15–17 августа · свободен', state: 'Свободен', tone: 'green' },
];

function DashboardContent({ active, current }) {
  if (active === 'calendar') {
    return (
      <>
        <div className="tp-business-dashboard__metric-row">
          <div><small>{current.title}</small><strong>{current.value}</strong><span>после обновления календаря</span></div>
          <div className="tp-business-dashboard__compact-calendar" aria-label="Мини-календарь демо">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => <span key={day}>{day}</span>)}
            {[11, 12, 13, 14, 15, 16, 17].map((day) => <b className={day === 13 || day === 14 ? 'is-booked' : ''} key={day}>{day}</b>)}
          </div>
        </div>
        <div className="tp-business-dashboard__events">
          <div><b>10:00</b><span>Заезд · Коттедж «Ала-Тоо»</span><em className="is-new">Новая</em></div>
          <div><b>12:00</b><span>Выезд · Домик №3</span><em className="is-muted">Выезд</em></div>
          <div><b>14:00</b><span>Уборка · Домик №3</span><em className="is-success">Готово</em></div>
        </div>
      </>
    );
  }

  if (active === 'bookings') {
    return (
      <>
        <div className="tp-business-dashboard__metric-row">
          <div><small>{current.title}</small><strong>{current.value}</strong><span>требуют ответа сегодня</span></div>
          <div className="tp-business-dashboard__payment"><WalletOutlined /><span>Предоплата ожидает проверки</span></div>
        </div>
        <div className="tp-business-dashboard__events">
          <div><b>Новая</b><span>Айбек Т. · 12–14 августа</span><em className="is-new">6 гостей</em></div>
          <div><b>Оплата</b><span>Коттедж «Ала-Тоо»</span><em className="is-success">Чек</em></div>
          <div><b>Вопрос</b><span>Поздний заезд после 20:00</span><em className="is-muted">Чат</em></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="tp-business-dashboard__metric-row">
        <div><small>{current.title}</small><strong>{current.value}</strong><span>по четырём объектам</span></div>
        <div className="tp-business-dashboard__payment"><CheckCircleFilled /><span>Оплата за вчера подтверждена</span></div>
      </div>
      <div className="tp-business-dashboard__properties">
        {properties.map((property) => (
          <div key={property.name}>
            <span className={`tp-business-dashboard__property-image is-${property.tone}`} aria-hidden="true"><HomeOutlined /></span>
            <div><strong>{property.name}</strong><small>{property.meta}</small></div>
            <em className={`is-${property.tone}`}>{property.state}</em>
          </div>
        ))}
      </div>
    </>
  );
}

export default function BusinessDashboardMockup() {
  const [active, setActive] = useState('overview');
  const current = tabs[active];
  const chartLabel = useMemo(() => `${current.title}: ${current.value}`, [current.title, current.value]);

  return (
    <div className="tp-business-dashboard" id="demo" aria-label="Интерактивная демонстрация кабинета TravelPay Business">
      <div className="tp-business-dashboard__topline">
        <span className="tp-business-dashboard__signal" />
        <span>TravelPay Business · демо</span>
        <BellOutlined aria-label="Уведомления" />
      </div>
      <div className="tp-business-dashboard__body">
        <aside className="tp-business-dashboard__side" aria-label="Разделы демонстрации">
          <span className="is-active"><HomeOutlined /></span>
          <span><CalendarOutlined /></span>
          <span><WalletOutlined /></span>
        </aside>
        <div className="tp-business-dashboard__main">
          <div className="tp-business-dashboard__tabs" role="tablist" aria-label="Режимы демо-кабинета">
            {Object.entries(tabs).map(([key, tab]) => (
              <button key={key} type="button" role="tab" aria-selected={active === key} className={active === key ? 'is-active' : ''} onClick={() => setActive(key)}>
                {tab.label}
              </button>
            ))}
          </div>
          <DashboardContent active={active} current={current} />
          <div className="tp-business-dashboard__chart" aria-label={chartLabel}>
            {current.bars.map((height, index) => <i key={index} style={{ '--bar': `${height}%` }} />)}
          </div>
          <div className="tp-business-dashboard__footer-row"><ClockCircleOutlined /><span>Следующий заезд через 2 часа</span><MoreOutlined /></div>
        </div>
      </div>
      <span className="tp-business-dashboard__float tp-business-dashboard__float--booking">Новая заявка · 12–14 августа</span>
      <span className="tp-business-dashboard__float tp-business-dashboard__float--payment">Оплата подтверждена</span>
      <span className="tp-business-dashboard__float tp-business-dashboard__float--available">Домик №3 свободен</span>
    </div>
  );
}
