import api from '../api';
import { normalizeSavings } from './savings';
import { readCurrentUser, saveCurrentUser } from './currentUser';

const DAY_MS = 24 * 60 * 60 * 1000;
const ADMIN_ROLES = new Set(['super_admin', 'company_admin', 'company_manager']);
const BUSINESS_ROLES = new Set(['business', 'company_admin', 'company_manager', 'super_admin']);

const ensureArray = (value) => (Array.isArray(value) ? value : []);
const normalizeRole = (value) => {
  const role = String(value || 'user').trim().toLowerCase();
  if (role === 'admin') return 'super_admin';
  if (role === 'manager') return 'company_manager';
  if (ADMIN_ROLES.has(role) || BUSINESS_ROLES.has(role) || role === 'user') return role;
  return 'user';
};
const normalizeDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

export const getUserLevel = (amount = 0) => {
  if (amount >= 150000) return 'Platinum';
  if (amount >= 100000) return 'Gold';
  if (amount >= 50000) return 'Silver';
  return 'Bronze';
};

export const normalizeUser = (user) => {
  if (!user) return null;

  const savings = normalizeSavings(user.savings);
  const topUps = ensureArray(user.topUps).map((entry, index) => ({
    id: entry?.id || `topup-${index}-${Date.now()}`,
    date: normalizeDate(entry?.date) || new Date().toISOString(),
    amount: Number(entry?.amount) || 0,
    status: entry?.status || 'completed',
    source: entry?.source || 'manual',
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  const travelHistory = ensureArray(user.travelHistory || user.bookings).map((entry, index) => ({
    id: entry?.id || `booking-${index}-${Date.now()}`,
    tourId: entry?.tourId || entry?.id || '',
    companyId: Number(entry?.companyId || user.companyId || 1),
    companyName: entry?.companyName || '',
    clientName: entry?.clientName || user.name || '',
    clientPhone: entry?.clientPhone || user.phone || '',
    clientEmail: entry?.clientEmail || user.email || '',
    tourTitle: entry?.tourTitle || entry?.title || '',
    location: entry?.location || '',
    image: entry?.image || '',
    amount: Number(entry?.amount ?? entry?.price) || 0,
    status: entry?.status || 'paid',
    paymentStatus: entry?.paymentStatus || (entry?.status === 'paid' ? 'paid' : 'pending'),
    purchasedAt: normalizeDate(entry?.purchasedAt || entry?.date) || new Date().toISOString(),
    travelDate: normalizeDate(entry?.travelDate || entry?.date),
    date: normalizeDate(entry?.date || entry?.travelDate || entry?.purchasedAt) || new Date().toISOString(),
    endDate: normalizeDate(entry?.endDate),
    durationMinutes: Number(entry?.durationMinutes) || 60,
    assignedTo: entry?.assignedTo || entry?.manager || '',
    paymentMethod: entry?.paymentMethod || 'savings',
    accommodation: entry?.accommodation || null,
    accommodationTotal: Number(entry?.accommodationTotal) || 0,
    extraBedSelected: Boolean(entry?.extraBedSelected),
    extraBedTotal: Number(entry?.extraBedTotal) || 0,
    baseTourAmount: Number(entry?.baseTourAmount) || 0,
  })).sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

  const notifications = ensureArray(user.notifications).map((entry, index) => ({
    id: entry?.id || `notification-${index}-${Date.now()}`,
    type: entry?.type || 'info',
    title: entry?.title || 'Уведомление',
    description: entry?.description || '',
    date: normalizeDate(entry?.date) || new Date().toISOString(),
    read: Boolean(entry?.read),
  })).sort((a, b) => new Date(b.date) - new Date(a.date));

  const challengeDefaults = {
    id: 'challenge-20000-30',
    title: 'Накопить 20 000 сом за 30 дней',
    targetAmount: 20000,
    periodDays: 30,
    startDate: new Date().toISOString(),
    completed: false,
    rewardTitle: 'Challenge completed',
  };

  const challenges = (ensureArray(user.challenges).length ? ensureArray(user.challenges) : [challengeDefaults]).map((entry) => ({
    ...challengeDefaults,
    ...entry,
    startDate: normalizeDate(entry?.startDate || challengeDefaults.startDate) || challengeDefaults.startDate,
    targetAmount: Number(entry?.targetAmount) || challengeDefaults.targetAmount,
    periodDays: Number(entry?.periodDays) || challengeDefaults.periodDays,
  }));

  const currentAmount = Number(savings.currentAmount) || 0;
  const topUpTotal = topUps.reduce((sum, item) => sum + item.amount, 0);
  const level = user.level || getUserLevel(Math.max(currentAmount, topUpTotal));

  const baseAchievements = new Set(ensureArray(user.achievements).filter(Boolean));
  if (currentAmount >= 10000) baseAchievements.add('Первые 10 000 сом');
  if (currentAmount >= 50000) baseAchievements.add('Первые 50 000 сом');
  if (savings.status === 'completed') baseAchievements.add('Цель достигнута');
  if (travelHistory.length > 0) baseAchievements.add('Первая поездка');

  const primaryChallenge = challenges[0];
  const challengeCurrentAmount = topUps
    .filter((item) => new Date(item.date).getTime() >= new Date(primaryChallenge.startDate).getTime())
    .reduce((sum, item) => sum + item.amount, 0);
  const challengeCompleted = challengeCurrentAmount >= primaryChallenge.targetAmount;
  if (challengeCompleted) {
    baseAchievements.add(primaryChallenge.rewardTitle);
  }

  const referral = {
    code: user.referral?.code || `travelpay-${user.id || 'user'}`,
    link: user.referral?.link || `https://travelpay.app/ref/${user.referral?.code || `travelpay-${user.id || 'user'}`}`,
    invitedCount: Number(user.referral?.invitedCount) || ensureArray(user.referral?.invitedUsers).length || 0,
    bonusAmount: Number(user.referral?.bonusAmount) || 0,
    invitedUsers: ensureArray(user.referral?.invitedUsers),
  };

  const bonusWheel = {
    lastSpinDate: normalizeDate(user.bonusWheel?.lastSpinDate),
    availableAt: normalizeDate(user.bonusWheel?.availableAt),
    history: ensureArray(user.bonusWheel?.history),
  };

  const streakMonths = Math.max(
    Number(user.travelStreakMonths) || 0,
    topUps.reduce((max, item) => {
      const diff = Math.floor((Date.now() - new Date(item.date).getTime()) / DAY_MS);
      return diff <= 120 ? Math.max(max, 1 + Math.floor((120 - diff) / 30)) : max;
    }, 0),
  );

  return {
    ...user,
    role: normalizeRole(user.role),
    companyId: Number(user.companyId) || 1,
    favorites: ensureArray(user.favorites),
    savings,
    topUps,
    travelHistory,
    bookings: travelHistory,
    notifications,
    challenges: challenges.map((challenge, index) => index === 0 ? {
      ...challenge,
      currentAmount: challengeCurrentAmount,
      completed: challenge.completed || challengeCompleted,
      deadline: new Date(new Date(challenge.startDate).getTime() + challenge.periodDays * DAY_MS).toISOString(),
    } : challenge),
    achievements: Array.from(baseAchievements),
    referral,
    bonusWheel,
    level,
    travelStreakMonths: streakMonths,
  };
};

export const canAccessAdminPanel = (user) => ADMIN_ROLES.has(normalizeRole(user?.role));
export const canAccessBusinessPanel = (user) => BUSINESS_ROLES.has(normalizeRole(user?.role));
export const canAccessTravelPayAdmin = (user) => normalizeRole(user?.role) === 'super_admin';
export const getAdminLandingPath = (user) => {
  const role = normalizeRole(user?.role);
  if (role === 'super_admin') return '/admin/tours';
  if (BUSINESS_ROLES.has(role)) return '/business/dashboard';
  return '/profile';
};

export const syncCurrentUser = (user) => {
  const normalizedUser = normalizeUser(user);

  if (normalizedUser) {
    saveCurrentUser(normalizedUser);
  }

  return normalizedUser;
};

export const updateUserById = async (userId, updates, method = 'put') => {
  const response = await api[method](`/users/${userId}`, updates);
  return normalizeUser(response.data);
};

export const mergeAndPersistCurrentUser = async (updates, method = 'put') => {
  const currentUser = normalizeUser(readCurrentUser());

  if (!currentUser?.id) {
    throw new Error('UNAUTHORIZED');
  }

  const nextUser = await updateUserById(currentUser.id, {
    ...currentUser,
    ...updates,
    isLoggedIn: true,
  }, method);

  return syncCurrentUser({
    ...nextUser,
    isLoggedIn: true,
  });
};
