const CURRENT_USER_KEY = 'currentUser';
const CURRENT_USER_EVENT = 'travelpay-current-user-change';

export const readCurrentUser = () => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

export const saveCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT, { detail: user }));
};

export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT, { detail: null }));
};

export const subscribeToCurrentUser = (listener) => {
  const handler = (event) => listener(event.detail ?? readCurrentUser());
  const storageHandler = (event) => {
    if (event.key === CURRENT_USER_KEY) {
      listener(readCurrentUser());
    }
  };

  window.addEventListener(CURRENT_USER_EVENT, handler);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(CURRENT_USER_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
};
