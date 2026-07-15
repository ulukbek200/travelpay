const routePreloaders = {
  '/about': () => import('../pages/AboutPage'),
  '/account/savings': () => import('../pages/AccountSavingsPage'),
  '/favorites': () => import('../pages/FavoritesPage'),
  '/login': () => import('../pages/LoginPage'),
  '/profile': () => import('../pages/ProfilePage'),
  '/register': () => import('../pages/RegisterPage'),
  '/savings': () => import('../pages/SavingsPlanPage'),
  '/savings-plan': () => import('../pages/SavingsPlanPage'),
  '/stays': () => import('../pages/StaysPage'),
  '/tours': () => import('../pages/ActualToursPage'),
};

const routePreloadCache = new Map();

const normalizeRouteKey = (key) => {
  if (!key || key === '/' || key === 'partnership') return '';
  if (key.startsWith('/tours')) return '/tours';
  if (key.startsWith('/stays')) return '/stays';
  return key;
};

export const preloadRoute = (key) => {
  const routeKey = normalizeRouteKey(key);
  const preload = routePreloaders[routeKey];

  if (!preload) {
    return Promise.resolve();
  }

  if (routePreloadCache.has(routeKey)) {
    return routePreloadCache.get(routeKey);
  }

  const promise = preload().catch((error) => {
    routePreloadCache.delete(routeKey);
    throw error;
  });

  routePreloadCache.set(routeKey, promise);
  return promise;
};
