import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';

const AudienceComparison = ({ cards }) => (
  <section className="about-section about-comparison-section" aria-labelledby="about-comparison-title">
    <div className="about-shell">
      <div className="about-section__head about-section__head--dark">
        <span className="about-kicker">Две стороны одной платформы</span>
        <h2 id="about-comparison-title">TravelPay соединяет путешественников и туркомпании</h2>
        <p>
          Пользователи получают понятный путь к поездке, а бизнес получает аккуратную систему для заявок,
          размещения, клиентов и аналитики.
        </p>
      </div>

      <div className="about-comparison">
        {cards.map((card) => (
          <article className="about-comparison-card" key={card.title}>
            <span className="about-comparison-card__icon">{card.icon}</span>
            <h3>{card.title}</h3>
            <ul>
              {card.items.map((item) => (
                <li key={item}>
                  <CheckCircleOutlined />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default AudienceComparison;
