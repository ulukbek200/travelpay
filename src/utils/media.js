import api from '../api';
import { TOUR_IMAGE_FALLBACK } from './tourMedia';

export const getMediaUrl = (media, variant = 'large', fallback = TOUR_IMAGE_FALLBACK) => {
  if (typeof media === 'string') return media || fallback;
  if (!media || typeof media !== 'object') return fallback;
  return media.urls?.[variant] || media.url || media.urls?.large || fallback;
};

export const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Не удалось прочитать файл изображения.'));
  reader.onload = () => resolve(String(reader.result || ''));
  reader.readAsDataURL(file);
});

export const uploadImage = async ({ file, folder, alt = '' }) => {
  const dataUrl = typeof file === 'string' ? file : await readFileAsDataUrl(file);
  const response = await api.post('/media/images', { dataUrl, folder, alt });
  return response.data.media;
};

export const deleteImage = async (media) => {
  if (!media?.storageKey) return;
  await api.delete('/media/images', { data: { media } });
};
