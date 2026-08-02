// One source of truth for accommodation-owner plans. Keep this file in sync
// with the server before enabling a new self-service plan.
export const BUSINESS_MONTHLY_PLAN_ID = 'business_monthly';

export const cottagePlans = [
  {
    id: 'start',
    name: 'Старт',
    description: 'Для одного небольшого объекта размещения.',
    monthlyPrice: null,
    yearlyPrice: null,
    objectLimit: '1 объект',
    staffLimit: '1 сотрудник',
    features: [
      'Публичная страница объекта',
      'Календарь занятости',
      'Ручное создание бронирований',
      'Заявки с сайта и база гостей',
      'Базовый учёт оплат',
    ],
    restrictions: ['Условия подключения согласуются с менеджером'],
    selectable: false,
    cta: 'Уточнить условия',
  },
  {
    // This is the only plan currently recognised and billed by the backend.
    id: BUSINESS_MONTHLY_PLAN_ID,
    name: 'Бизнес',
    description: 'Для владельцев нескольких домиков или небольших баз отдыха.',
    monthlyPrice: 4500,
    yearlyPrice: null,
    objectLimit: 'до 5 объектов',
    staffLimit: 'до 5 сотрудников',
    features: [
      'Всё из тарифа «Старт»',
      'Единый календарь нескольких объектов',
      'Статусы заезда и выезда',
      'Учёт предоплат и задолженностей',
      'Базовая аналитика загрузки',
      'Финансовые отчёты и экспорт',
      'Приоритетная поддержка',
    ],
    restrictions: [],
    selectable: true,
    popular: true,
    cta: 'Выбрать Бизнес',
  },
  {
    id: 'pro',
    name: 'Профи',
    description: 'Для баз отдыха и комплексов с несколькими локациями.',
    monthlyPrice: null,
    yearlyPrice: null,
    objectLimit: 'до 20 объектов',
    staffLimit: 'до 15 сотрудников',
    features: [
      'Всё из тарифа «Бизнес»',
      'Роли и права доступа',
      'Расширенная аналитика',
      'Несколько локаций',
      'Отчёты по объектам',
      'Персональные настройки',
    ],
    restrictions: ['Подключение и набор функций — по согласованию'],
    selectable: false,
    cta: 'Запросить Профи',
  },
  {
    id: 'custom',
    name: 'Индивидуальный',
    description: 'Для крупных комплексов и нестандартных процессов.',
    monthlyPrice: null,
    yearlyPrice: null,
    objectLimit: 'Индивидуально',
    staffLimit: 'Индивидуально',
    features: [
      'Персональные лимиты',
      'Миграция данных',
      'Обучение команды',
      'Дополнительные интеграции по согласованию',
      'Персональная поддержка',
    ],
    restrictions: ['Стоимость и условия определяются после консультации'],
    selectable: false,
    cta: 'Связаться с нами',
  },
];

export const pricingComparison = [
  { label: 'Количество объектов', field: 'objectLimit' },
  { label: 'Сотрудники', field: 'staffLimit' },
  { label: 'Календарь занятости', values: ['included', 'included', 'included', 'included'] },
  { label: 'Публичная страница объекта', values: ['included', 'included', 'included', 'included'] },
  { label: 'Онлайн-заявки и база гостей', values: ['included', 'included', 'included', 'included'] },
  { label: 'Учёт оплат', values: ['included', 'included', 'included', 'included'] },
  { label: 'Аналитика и отчёты', values: ['basic', 'included', 'included', 'included'] },
  { label: 'Роли и несколько локаций', values: ['—', '—', 'included', 'included'] },
  { label: 'Приоритетная поддержка', values: ['—', 'included', 'included', 'included'] },
];

export const pricingFaq = [
  {
    key: 'change',
    question: 'Можно ли изменить тариф?',
    answer: 'Да. Перед подключением или изменением тарифа условия подтверждаются отдельно — без автоматического списания средств.',
  },
  {
    key: 'object',
    question: 'Что считается одним объектом?',
    answer: 'Отдельный домик, коттедж, номер, апартамент или другой вариант проживания, который имеет собственную доступность и бронирования.',
  },
  {
    key: 'limit',
    question: 'Что делать, если объектов стало больше?',
    answer: 'Оставьте запрос на изменение тарифа. Команда TravelPay подскажет доступный вариант и порядок подключения.',
  },
  {
    key: 'payments',
    question: 'Как принимаются оплаты?',
    answer: 'В кабинете можно вести статусы оплат и реквизиты. Подключение конкретных способов оплаты и автоматизации зависит от доступных функций кабинета.',
  },
  {
    key: 'migration',
    question: 'Можно ли перенести существующие бронирования?',
    answer: 'Для крупных объектов порядок переноса данных согласуется индивидуально до подключения.',
  },
];

export function findCottagePlan(id) {
  return cottagePlans.find((plan) => plan.id === id) || null;
}

// The public pricing page may show future plans, but registration must only
// offer a plan that the current server can actually create and bill.
export function isSelfServiceCottagePlan(planOrId) {
  const plan = typeof planOrId === 'string' ? findCottagePlan(planOrId) : planOrId;
  return Boolean(plan?.selectable && plan.id === BUSINESS_MONTHLY_PLAN_ID);
}

export function getPlanPrice(plan, period = 'monthly') {
  if (!plan) return null;
  return period === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
}

export function formatPlanPrice(plan, period = 'monthly') {
  const price = getPlanPrice(plan, period);
  if (price === null || price === undefined) return 'По запросу';
  return `${Number(price).toLocaleString('ru-RU')} сом`;
}
