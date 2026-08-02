import React, { useEffect, useMemo, useState } from 'react';
import { Button, Collapse, Segmented, Tag, Tooltip } from 'antd';
import {
  ArrowRightOutlined,
  CheckOutlined,
  CrownOutlined,
  MailOutlined,
  TeamOutlined,
  HomeOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BusinessLandingHeader from '../components/business/BusinessLandingHeader';
import {
  cottagePlans,
  BUSINESS_MONTHLY_PLAN_ID,
  findCottagePlan,
  formatPlanPrice,
  isSelfServiceCottagePlan,
  pricingComparison,
  pricingFaq,
} from '../config/businessPricing';
import './BusinessLandingPage.css';
import './PricesPage.css';

const mailtoForPlan = (plan) => `mailto:ulukbekmonolov07@gmail.com?subject=${encodeURIComponent(`TravelPay — тариф «${plan.name}»`)}&body=${encodeURIComponent(`Здравствуйте! Хочу уточнить условия тарифа «${plan.name}» для объекта размещения.`)}`;

function usePricingMeta() {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionContent = 'Выберите тариф TravelPay для управления коттеджами, домиками, бронированиями, гостями и оплатами.';
    const canonicalUrl = `${window.location.origin}/prices`;
    const entries = [
      ['description', 'name', descriptionContent],
      ['og:title', 'property', 'Тарифы TravelPay для коттеджей и домиков'],
      ['og:description', 'property', descriptionContent],
      ['og:type', 'property', 'website'],
      ['og:url', 'property', canonicalUrl],
    ];
    document.title = 'Тарифы TravelPay для коттеджей и домиков';
    const changed = entries.map(([key, attribute, value]) => {
      let tag = document.querySelector(`meta[${attribute}="${key}"]`);
      const created = !tag;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      const previous = tag.content;
      tag.content = value;
      return { tag, created, previous };
    });
    let canonical = document.querySelector('link[rel="canonical"]');
    const canonicalCreated = !canonical;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const previousCanonical = canonical.href;
    canonical.href = canonicalUrl;
    return () => {
      document.title = previousTitle;
      changed.forEach(({ tag, created, previous }) => {
        if (created) tag.remove();
        else tag.content = previous;
      });
      if (canonicalCreated) canonical.remove();
      else canonical.href = previousCanonical;
    };
  }, []);
}

function PricingCard({ plan, period, onSelect }) {
  const price = formatPlanPrice(plan, period);
  const isRequest = price === 'По запросу';
  const isSelfServicePlan = isSelfServiceCottagePlan(plan);
  const canSelfServe = isSelfServicePlan && period === 'monthly';
  const actionLabel = isSelfServicePlan && period === 'yearly' ? 'Уточнить годовые условия' : plan.cta;
  return (
    <article className={`tp-pricing-card${plan.popular ? ' is-popular' : ''}`}>
      {plan.popular && <Tag className="tp-pricing-card__popular" icon={<CrownOutlined />}>Популярный</Tag>}
      <div className="tp-pricing-card__head">
        <h2>{plan.name}</h2>
        <p>{plan.description}</p>
        {!isSelfServicePlan && <Tag className="tp-pricing-card__availability">По согласованию</Tag>}
      </div>
      <div className="tp-pricing-card__price" aria-label={`Стоимость тарифа ${plan.name}`}>
        <strong>{price}</strong>
        <span>{isRequest ? 'условия согласуются отдельно' : period === 'monthly' ? 'за 30 дней доступа' : 'условия годового формата'}</span>
      </div>
      <div className="tp-pricing-card__limits">
        <span><HomeOutlined />{plan.objectLimit}</span>
        <span><TeamOutlined />{plan.staffLimit}</span>
      </div>
      <Button
        type={plan.popular && canSelfServe ? 'primary' : 'default'}
        size="large"
        block
        icon={canSelfServe ? <ArrowRightOutlined /> : <MailOutlined />}
        onClick={canSelfServe ? () => onSelect(plan) : undefined}
        href={canSelfServe ? undefined : mailtoForPlan(plan)}
      >
        {actionLabel}
      </Button>
      <div className="tp-pricing-card__features">
        <p>{isSelfServicePlan ? 'Возможности' : 'Возможный состав'}</p>
        <ul>
          {plan.features.map((feature) => <li key={feature}><CheckOutlined aria-hidden="true" />{feature}</li>)}
        </ul>
      </div>
      {plan.restrictions.length > 0 && (
        <div className="tp-pricing-card__notice">
          <InfoCircleOutlined />{plan.restrictions[0]}
        </div>
      )}
    </article>
  );
}

function PricingCalculator({ onChoose, period }) {
  const [objects, setObjects] = useState(2);
  const [staff, setStaff] = useState(2);
  const [needsRoles, setNeedsRoles] = useState(false);
  const [needsFinance, setNeedsFinance] = useState(true);
  const recommendation = useMemo(() => {
    if (objects > 20 || staff > 15) return findCottagePlan('custom');
    if (objects > 5 || staff > 5 || needsRoles) return findCottagePlan('pro');
    if (objects <= 1 && staff <= 1 && !needsFinance) return findCottagePlan('start');
    return findCottagePlan(BUSINESS_MONTHLY_PLAN_ID);
  }, [objects, staff, needsFinance, needsRoles]);
  const canSelfServe = isSelfServiceCottagePlan(recommendation) && period === 'monthly';

  return (
    <section className="tp-pricing-calculator" aria-labelledby="pricing-calculator-title">
      <div>
        <Tag className="tp-business-eyebrow">Подбор тарифа</Tag>
        <h2 id="pricing-calculator-title">Выберите подходящий формат кабинета</h2>
        <p>Ответьте на несколько вопросов — рекомендация поможет сориентироваться, но не является офертой.</p>
      </div>
      <div className="tp-pricing-calculator__form">
        <label>Количество объектов
          <input type="number" min="1" max="99" value={objects} onChange={(event) => setObjects(Math.max(1, Number(event.target.value) || 1))} />
        </label>
        <label>Сотрудники
          <input type="number" min="1" max="99" value={staff} onChange={(event) => setStaff(Math.max(1, Number(event.target.value) || 1))} />
        </label>
        <label className="tp-pricing-switch"><input type="checkbox" checked={needsRoles} onChange={(event) => setNeedsRoles(event.target.checked)} /><span />Нужны роли и права</label>
        <label className="tp-pricing-switch"><input type="checkbox" checked={needsFinance} onChange={(event) => setNeedsFinance(event.target.checked)} /><span />Нужен финансовый учёт</label>
      </div>
      <div className="tp-pricing-calculator__result">
        <span>Рекомендуем</span>
        <strong>{recommendation.name}</strong>
        <p>{recommendation.description}</p>
        <Button
          type="primary"
          onClick={canSelfServe ? () => onChoose(recommendation) : undefined}
          href={canSelfServe ? undefined : mailtoForPlan(recommendation)}
        >
          {canSelfServe ? `Выбрать ${recommendation.name}` : 'Уточнить условия'}
        </Button>
      </div>
    </section>
  );
}

function PricingComparison() {
  const [selectedPlanId, setSelectedPlanId] = useState(BUSINESS_MONTHLY_PLAN_ID);
  const selectedPlan = findCottagePlan(selectedPlanId) || cottagePlans[0];
  const getValue = (row, index) => {
    const value = row.values ? row.values[index] : cottagePlans[index][row.field];
    if (value === 'included') return <CheckOutlined aria-label="Включено" />;
    if (value === 'basic') return 'Базово';
    return value;
  };
  return (
    <section className="tp-pricing-comparison" aria-labelledby="pricing-comparison-title">
      <div className="tp-pricing-section-intro">
        <Tag className="tp-business-eyebrow">Сравнение</Tag>
        <h2 id="pricing-comparison-title">Сравните инструменты для объектов размещения</h2>
        <p>Лимиты и возможности из этой таблицы — ориентир до индивидуального подтверждения условий подключения.</p>
      </div>
      <div className="tp-pricing-comparison__desktop" role="table" aria-label="Сравнение тарифов">
        <div className="tp-pricing-comparison__row is-head" role="row">
          <div role="columnheader">Возможность</div>
          {cottagePlans.map((plan) => <div key={plan.id} role="columnheader">{plan.name}</div>)}
        </div>
        {pricingComparison.map((row) => <div key={row.label} className="tp-pricing-comparison__row" role="row"><div role="rowheader">{row.label}</div>{cottagePlans.map((plan, index) => <div key={plan.id} role="cell">{getValue(row, index)}</div>)}</div>)}
      </div>
      <div className="tp-pricing-comparison__mobile">
        <Segmented value={selectedPlanId} onChange={setSelectedPlanId} options={cottagePlans.map((plan) => ({ value: plan.id, label: plan.name }))} block />
        <div className="tp-pricing-comparison__mobile-card">
          {pricingComparison.map((row) => <div key={row.label}><span>{row.label}</span><strong>{getValue(row, cottagePlans.findIndex((plan) => plan.id === selectedPlan.id))}</strong></div>)}
        </div>
      </div>
    </section>
  );
}

export default function PricesPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [period, setPeriod] = useState('monthly');
  usePricingMeta();
  const selectPlan = (plan) => {
    if (isSelfServiceCottagePlan(plan) && period === 'monthly') {
      navigate(`/business/register?plan=${encodeURIComponent(plan.id)}`);
    }
  };
  return (
    <main className="tp-prices-page" id="top">
      <BusinessLandingHeader />
      <div className="tp-prices-page__backdrop" aria-hidden="true" />
      <div className="tp-prices-container">
        <motion.section className="tp-prices-hero" initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <Tag className="tp-business-eyebrow">TravelPay для объектов размещения</Tag>
          <h1>Тарифы для владельцев домиков и коттеджей</h1>
          <p>Выберите формат для управления свободными датами, бронированиями, гостями и оплатами. Деньги не списываются без отдельного подтверждения.</p>
          <div className="tp-prices-period">
            <Segmented
              value={period}
              onChange={setPeriod}
              options={[
                { value: 'monthly', label: 'Ежемесячно' },
                { value: 'yearly', label: <Tooltip title="Годовая скидка будет опубликована после утверждения условий.">Ежегодно <InfoCircleOutlined /></Tooltip> },
              ]}
            />
            {period === 'yearly' && <span>Годовой формат сейчас согласуется индивидуально.</span>}
          </div>
        </motion.section>

        <section className="tp-pricing-grid" aria-label="Тарифы">
          {cottagePlans.map((plan) => <PricingCard key={plan.id} plan={plan} period={period} onSelect={selectPlan} />)}
        </section>

        <PricingCalculator onChoose={selectPlan} period={period} />
        <PricingComparison />

        <section className="tp-pricing-faq" aria-labelledby="pricing-faq-title">
          <Tag className="tp-business-eyebrow">Вопросы</Tag>
          <h2 id="pricing-faq-title">Прозрачные условия до подключения</h2>
          <Collapse items={pricingFaq.map(({ key, question, answer }) => ({ key, label: question, children: answer }))} />
        </section>

        <section className="tp-pricing-final">
          <div><Tag>TravelPay Business</Tag><h2>Готовы навести порядок в бронированиях?</h2><p>Зарегистрируйте компанию или обсудите условия для большого комплекса.</p></div>
          <div><Button type="primary" size="large" onClick={() => navigate(`/business/register?plan=${BUSINESS_MONTHLY_PLAN_ID}`)}>Зарегистрировать объект</Button><Button size="large" href={mailtoForPlan(findCottagePlan('custom'))}>Связаться с нами</Button></div>
        </section>
      </div>
    </main>
  );
}
