export const TOUR_IMAGE_FALLBACK = '/images/kyrgyzstan-mountains.jpg';

export const KYRGYZSTAN_TOUR_SPOTS = [
  {
    key: 'ala-archa',
    title: 'Ала-Арча',
    location: 'Чуйская область',
    duration: '1 день',
    price: 16000,
    rating: 4.8,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Альпийские ущелья, хвойный воздух и лёгкие треккинги рядом с Бишкеком.',
  },
  {
    key: 'issyk-kul',
    title: 'Иссык-Куль',
    location: 'Иссык-Кульская область',
    duration: '4 дня',
    price: 42000,
    rating: 4.9,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Бирюзовое озеро, панорамные берега и мягкий курортный ритм.',
  },
  {
    key: 'son-kul',
    title: 'Сон-Куль',
    location: 'Нарынская область',
    duration: '3 дня',
    price: 36000,
    rating: 4.9,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Юрты, лошади, высокогорные пастбища и настоящий nomad-luxury формат.',
  },
  {
    key: 'karakol',
    title: 'Каракол',
    location: 'Восточный Иссык-Куль',
    duration: '3 дня',
    price: 39000,
    rating: 4.7,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Горные панорамы, треккинг и база для активных маршрутов по Тянь-Шаню.',
  },
  {
    key: 'jeti-oguz',
    title: 'Джети-Огуз',
    location: 'Иссык-Кульская область',
    duration: '2 дня',
    price: 24000,
    rating: 4.8,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Красные скалы, альпийские поляны и фотогеничные маршруты на рассвете.',
  },
  {
    key: 'arslanbob',
    title: 'Арсланбоб',
    location: 'Джалал-Абадская область',
    duration: '2 дня',
    price: 28000,
    rating: 4.7,
    image: TOUR_IMAGE_FALLBACK,
    description: 'Ореховые леса, водопады и южный колорит с тёплой локальной атмосферой.',
  },
];

export const withTourFallback = (event) => {
  const image = event?.currentTarget;
  if (!image || image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = TOUR_IMAGE_FALLBACK;
};
