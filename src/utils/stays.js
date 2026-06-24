import { TOUR_IMAGE_FALLBACK } from './tourMedia';

export const STAY_TYPE_OPTIONS = [
  { value: 'all', label: 'Все типы' },
  { value: 'cottage', label: 'Коттедж' },
  { value: 'chalet', label: 'Шале' },
  { value: 'yurt', label: 'Юрта' },
  { value: 'glamping', label: 'Глэмпинг' },
  { value: 'guesthouse', label: 'Гостевой дом' },
];

export const STAY_AMENITIES = [
  'Wi-Fi',
  'Сауна',
  'Мангал',
  'Кухня',
  'Парковка',
  'Вид на горы',
  'У озера',
  'Можно с детьми',
  'Завтрак',
  'Отопление',
];

export const fallbackStays = [
  {
    id: 'ala-archa-chalet',
    title: 'Ala-Archa Glass Chalet',
    name: 'Ala-Archa Glass Chalet',
    type: 'chalet',
    location: 'Ала-Арча, Чуйская область',
    city: 'Ала-Арча',
    address: 'Горная линия, 18',
    description: 'Панорамное шале с камином, террасой и видом на хвойные склоны. Подходит для спокойного семейного отдыха и романтических выходных.',
    pricePerNight: 14500,
    capacity: 6,
    rooms: 3,
    totalCount: 4,
    availableCount: 2,
    rating: 4.9,
    status: 'available',
    images: [TOUR_IMAGE_FALLBACK],
    amenities: ['Wi-Fi', 'Кухня', 'Парковка', 'Вид на горы', 'Отопление'],
    rules: 'Заезд после 14:00, выезд до 12:00. Вечеринки по согласованию.',
    companyName: 'TravelPay Stays',
  },
  {
    id: 'issyk-kul-lake-cottage',
    title: 'Issyk-Kul Lake Cottage',
    name: 'Issyk-Kul Lake Cottage',
    type: 'cottage',
    location: 'Иссык-Куль, Бостери',
    city: 'Бостери',
    address: 'Береговая улица, 7',
    description: 'Светлый коттедж у озера с приватной зоной отдыха, мангалом и быстрым доступом к пляжу.',
    pricePerNight: 18000,
    capacity: 8,
    rooms: 4,
    totalCount: 3,
    availableCount: 1,
    rating: 4.8,
    status: 'available',
    images: [TOUR_IMAGE_FALLBACK],
    amenities: ['Wi-Fi', 'Мангал', 'Кухня', 'У озера', 'Можно с детьми'],
    rules: 'Без шумных мероприятий после 23:00. Домик бронируется минимум на 2 ночи.',
    companyName: 'Issyk Stay Group',
  },
  {
    id: 'son-kul-yurt-premium',
    title: 'Son-Kul Premium Yurt',
    name: 'Son-Kul Premium Yurt',
    type: 'yurt',
    location: 'Сон-Куль, Нарынская область',
    city: 'Сон-Куль',
    address: 'Юрточный лагерь TravelPay',
    description: 'Тёплая юрта в nomad-luxury стиле: мягкие кровати, питание, костровая зона и звёздное небо без городского шума.',
    pricePerNight: 9500,
    capacity: 4,
    rooms: 1,
    totalCount: 10,
    availableCount: 5,
    rating: 4.9,
    status: 'available',
    images: [TOUR_IMAGE_FALLBACK],
    amenities: ['Завтрак', 'Вид на горы', 'Отопление', 'Можно с детьми'],
    rules: 'Рекомендуем тёплую одежду. Трансфер доступен по запросу.',
    companyName: 'Nomad Comfort',
  },
  {
    id: 'karakol-forest-house',
    title: 'Karakol Forest House',
    name: 'Karakol Forest House',
    type: 'guesthouse',
    location: 'Каракол, Иссык-Кульская область',
    city: 'Каракол',
    address: 'Лесная, 24',
    description: 'Гостевой дом для активных путешественников: рядом треккинговые маршруты, горячий душ, кухня и зона хранения снаряжения.',
    pricePerNight: 7200,
    capacity: 5,
    rooms: 2,
    totalCount: 6,
    availableCount: 3,
    rating: 4.7,
    status: 'available',
    images: [TOUR_IMAGE_FALLBACK],
    amenities: ['Wi-Fi', 'Кухня', 'Парковка', 'Отопление'],
    rules: 'Можно раннее заселение при свободных местах.',
    companyName: 'Karakol Base',
  },
];

export const formatStayPrice = (value) => `${Number(value || 0).toLocaleString('ru-RU')} сом`;

export const getStayTypeLabel = (value) => STAY_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || 'Домик';

export const normalizeStay = (item = {}, index = 0) => {
  const fallback = fallbackStays[index % fallbackStays.length];
  const images = (Array.isArray(item.images) ? item.images : [item.image || item.images]).filter(Boolean);
  const price = Number(item.pricePerNight || item.price || fallback.pricePerNight);
  const capacity = Number(item.capacity || item.guests || fallback.capacity);
  const totalCount = Number(item.totalCount || fallback.totalCount || 1);
  const availableCount = Number(item.availableCount ?? item.freeCount ?? Math.min(totalCount, fallback.availableCount || totalCount));

  return {
    ...fallback,
    ...item,
    id: item.id || fallback.id,
    title: item.title || item.name || fallback.title,
    name: item.name || item.title || fallback.name,
    type: item.type || fallback.type,
    location: item.location || item.city || fallback.location,
    city: item.city || String(item.location || fallback.city).split(',')[0],
    address: item.address || fallback.address,
    description: item.description || fallback.description,
    pricePerNight: price,
    capacity,
    rooms: Number(item.rooms || item.roomCount || fallback.rooms),
    totalCount,
    availableCount,
    rating: Number(item.rating || fallback.rating || 4.8),
    status: item.status || fallback.status,
    images: images.length ? images : fallback.images,
    amenities: Array.isArray(item.amenities) && item.amenities.length ? item.amenities : fallback.amenities,
    rules: item.rules || fallback.rules,
    companyName: item.companyName || fallback.companyName || 'TravelPay',
  };
};

export const withStayFallback = (event) => {
  const image = event?.currentTarget;
  if (!image || image.dataset.fallbackApplied === 'true') return;
  image.dataset.fallbackApplied = 'true';
  image.src = TOUR_IMAGE_FALLBACK;
};
