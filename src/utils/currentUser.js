const CURRENT_USER_KEY = 'currentUser';
const CURRENT_USER_EVENT = 'travelpay-current-user-change';
const BUSINESS_USER_KEY = 'businessUser';
const BUSINESS_COMPANY_KEY = 'businessCompany';
const COMPANY_ID_KEY = 'companyId';
const ROLE_KEY = 'role';
const AUTH_REDIRECT_ERROR_KEY = 'travelpay-auth-error';
const AUTH_SESSION_TOKEN_KEY = 'travelpay-session-token';

const readJson = (key) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

export const readCurrentUser = () => {
  return readJson(CURRENT_USER_KEY);
};

export const saveCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT, { detail: user }));
};

// Some mobile browsers block cross-site cookies. Keep the fallback token only for
// the lifetime of the current browser tab; the httpOnly cookie remains primary.
export const readAuthToken = () => {
  try {
    return sessionStorage.getItem(AUTH_SESSION_TOKEN_KEY) || '';
  } catch (error) {
    return '';
  }
};
export const readBusinessUser = () => readJson(BUSINESS_USER_KEY);
export const readBusinessCompany = () => readJson(BUSINESS_COMPANY_KEY);
export const readStoredCompanyId = () => localStorage.getItem(COMPANY_ID_KEY) || '';
export const readStoredRole = () => localStorage.getItem(ROLE_KEY) || '';

export const saveBusinessSession = ({ user, company, companyId, role }) => {
  if (user) localStorage.setItem(BUSINESS_USER_KEY, JSON.stringify(user));
  if (company) localStorage.setItem(BUSINESS_COMPANY_KEY, JSON.stringify(company));
  if (companyId) localStorage.setItem(COMPANY_ID_KEY, String(companyId));
  if (role) localStorage.setItem(ROLE_KEY, String(role));
};

export const saveAuthSession = ({ user, role, companyId, company, token }) => {

  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT, { detail: user }));
  }

  if (role) {
    localStorage.setItem(ROLE_KEY, String(role));
  }

  if (companyId) {
    localStorage.setItem(COMPANY_ID_KEY, String(companyId));
  }

  if (company) {
    localStorage.setItem(BUSINESS_COMPANY_KEY, JSON.stringify(company));
  }

  if (token) {
    try {
      sessionStorage.setItem(AUTH_SESSION_TOKEN_KEY, String(token));
    } catch (error) {
      // The secure cookie still provides authentication when sessionStorage is unavailable.
    }
  }
};

export const clearBusinessSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem(BUSINESS_USER_KEY);
  localStorage.removeItem(BUSINESS_COMPANY_KEY);
  localStorage.removeItem(COMPANY_ID_KEY);
  localStorage.removeItem(ROLE_KEY);
};

export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  clearBusinessSession();
  try {
    sessionStorage.removeItem(AUTH_SESSION_TOKEN_KEY);
  } catch (error) {
    // Nothing to clear when browser storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT, { detail: null }));
};

export const hasActiveSession = (user) => Boolean(
  user?.id
  && user?.isLoggedIn
);

export const hasBusinessSession = (user = readCurrentUser()) => {
  const role = String(readStoredRole() || user?.role || '').trim().toLowerCase();
  const companyId = readStoredCompanyId() || user?.companyId || '';
  return Boolean(
    companyId
    && ['business', 'company_admin', 'company_manager', 'admin', 'super_admin'].includes(role),
  );
};

export const persistAuthRedirectError = (message) => {
  if (!message) return;
  localStorage.setItem(AUTH_REDIRECT_ERROR_KEY, String(message));
};

export const consumeAuthRedirectError = () => {
  const message = localStorage.getItem(AUTH_REDIRECT_ERROR_KEY) || '';
  if (message) {
    localStorage.removeItem(AUTH_REDIRECT_ERROR_KEY);
  }
  return message;
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
