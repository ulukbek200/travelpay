export const TOUR_IMAGE_FALLBACK = '/images/tours/fallback-tour.svg';

export const KYRGYZSTAN_TOUR_SPOTS = [
  {
    key: 'ala-archa',
    title: 'Ала-Арча',
    location: 'Чуйская область',
    duration: '1 день',
    price: 16000,
    rating: 4.8,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Landscape%20view%2C%20Ala%20Archa%20National%20Park%2C%20Chuy%20region%2C%20Kyrgyzstan%2001.jpg',
    description: 'Альпийские ущелья, хвойный воздух и лёгкие треккинги рядом с Бишкеком.',
  },
  {
    key: 'issyk-kul',
    title: 'Иссык-Куль',
    location: 'Иссык-Кульская область',
    duration: '4 дня',
    price: 42000,
    rating: 4.9,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Issyk%20Kul%20Lake%2C%20Issyk%20Kul%20region%2C%20Kyrgyzstan.jpg',
    description: 'Бирюзовое озеро, панорамные берега и мягкий курортный ритм.',
  },
  {
    key: 'son-kul',
    title: 'Сон-Куль',
    location: 'Нарынская область',
    duration: '3 дня',
    price: 36000,
    rating: 4.9,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Yurt%20Camp%20in%20Song%20kol%20region.jpg',
    description: 'Юрты, лошади, высокогорные пастбища и настоящий nomad-luxury формат.',
  },
  {
    key: 'karakol',
    title: 'Каракол',
    location: 'Восточный Иссык-Куль',
    duration: '3 дня',
    price: 39000,
    rating: 4.7,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tian%20Shan%20in%20Kyrgyzstan%2001.jpg',
    description: 'Горные панорамы, треккинг и база для активных маршрутов по Тянь-Шаню.',
  },
  {
    key: 'jeti-oguz',
    title: 'Джети-Огуз',
    location: 'Иссык-Кульская область',
    duration: '2 дня',
    price: 24000,
    rating: 4.8,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jeti-Oguz%20rocks%2C%20Issyk%20Kul%20region%2C%20Kyrgyzstan%2002.jpg',
    description: 'Красные скалы, альпийские поляны и фотогеничные маршруты на рассвете.',
  },
  {
    key: 'arslanbob',
    title: 'Арсланбоб',
    location: 'Джалал-Абадская область',
    duration: '2 дня',
    price: 28000,
    rating: 4.7,
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Arslanbob%20Small%20Waterfall.jpg',
    description: 'Ореховые леса, водопады и южный колорит с тёплой локальной атмосферой.',
  },
];

export const withTourFallback = (event) => {
  const image = event?.currentTarget;
  if (!image || image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = TOUR_IMAGE_FALLBACK;
};
