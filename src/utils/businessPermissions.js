const ROLE_ALIASES = {
  owner: 'owner',
  business: 'owner',
  company_owner: 'owner',
  company_admin: 'owner',
  super_admin: 'owner',
  admin: 'admin',
  company_manager: 'manager',
  manager: 'manager',
  guide: 'guide',
  driver: 'driver',
  accountant: 'accountant',
  content_manager: 'content_manager',
};

export const normalizeBusinessRole = (value) => ROLE_ALIASES[String(value || 'manager').trim().toLowerCase()] || 'manager';

export const BUSINESS_PERMISSION_KEYS = {
  VIEW_HOME: 'home.view',
  VIEW_SCHEDULE: 'schedule.view',
  VIEW_BOOKINGS: 'bookings.view',
  MANAGE_BOOKINGS: 'bookings.manage',
  VIEW_CLIENTS: 'clients.view',
  MANAGE_CLIENTS: 'clients.manage',
  VIEW_TOURS: 'tours.view',
  MANAGE_TOURS: 'tours.manage',
  VIEW_TOUR_PARTICIPANTS: 'tours.participants.view',
  VIEW_PROPERTIES: 'properties.view',
  MANAGE_PROPERTIES: 'properties.manage',
  VIEW_TEAM: 'team.view',
  MANAGE_TEAM: 'team.manage',
  VIEW_TASKS: 'tasks.view',
  MANAGE_TASKS: 'tasks.manage',
  VIEW_PAYMENTS: 'payments.view',
  MANAGE_PAYMENTS: 'payments.manage',
  VIEW_ANALYTICS: 'analytics.view',
  VIEW_NOTIFICATIONS: 'notifications.view',
  MANAGE_NOTIFICATIONS: 'notifications.manage',
  VIEW_ACTIVITY: 'activity.view',
  VIEW_SETTINGS: 'settings.view',
  MANAGE_SETTINGS: 'settings.manage',
  VIEW_COMPANY: 'company.view',
  MANAGE_COMPANY: 'company.manage',
  VIEW_SUPPORT: 'support.view',
};

const P = BUSINESS_PERMISSION_KEYS;

export const BUSINESS_ROLE_PERMISSIONS = {
  owner: new Set(Object.values(P)),
  admin: new Set([
    P.VIEW_HOME,
    P.VIEW_SCHEDULE,
    P.VIEW_BOOKINGS,
    P.MANAGE_BOOKINGS,
    P.VIEW_CLIENTS,
    P.MANAGE_CLIENTS,
    P.VIEW_TOURS,
    P.MANAGE_TOURS,
    P.VIEW_TOUR_PARTICIPANTS,
    P.VIEW_PROPERTIES,
    P.MANAGE_PROPERTIES,
    P.VIEW_TEAM,
    P.MANAGE_TEAM,
    P.VIEW_TASKS,
    P.MANAGE_TASKS,
    P.VIEW_PAYMENTS,
    P.MANAGE_PAYMENTS,
    P.VIEW_ANALYTICS,
    P.VIEW_NOTIFICATIONS,
    P.MANAGE_NOTIFICATIONS,
    P.VIEW_ACTIVITY,
    P.VIEW_SETTINGS,
    P.MANAGE_SETTINGS,
    P.VIEW_COMPANY,
    P.MANAGE_COMPANY,
    P.VIEW_SUPPORT,
  ]),
  manager: new Set([
    P.VIEW_HOME,
    P.VIEW_SCHEDULE,
    P.VIEW_BOOKINGS,
    P.MANAGE_BOOKINGS,
    P.VIEW_CLIENTS,
    P.MANAGE_CLIENTS,
    P.VIEW_TOURS,
    P.VIEW_PROPERTIES,
    P.VIEW_TASKS,
    P.MANAGE_TASKS,
    P.VIEW_PAYMENTS,
    P.VIEW_NOTIFICATIONS,
    P.VIEW_ACTIVITY,
    P.VIEW_COMPANY,
    P.VIEW_SUPPORT,
  ]),
  guide: new Set([
    P.VIEW_HOME,
    P.VIEW_SCHEDULE,
    P.VIEW_BOOKINGS,
    P.VIEW_TOURS,
    P.VIEW_TOUR_PARTICIPANTS,
    P.VIEW_TASKS,
    P.MANAGE_TASKS,
    P.VIEW_NOTIFICATIONS,
    P.VIEW_SUPPORT,
  ]),
  driver: new Set([
    P.VIEW_HOME,
    P.VIEW_SCHEDULE,
    P.VIEW_BOOKINGS,
    P.VIEW_TASKS,
    P.MANAGE_TASKS,
    P.VIEW_NOTIFICATIONS,
    P.VIEW_SUPPORT,
  ]),
  accountant: new Set([
    P.VIEW_HOME,
    P.VIEW_PAYMENTS,
    P.MANAGE_PAYMENTS,
    P.VIEW_ANALYTICS,
    P.VIEW_ACTIVITY,
    P.VIEW_COMPANY,
    P.VIEW_SUPPORT,
  ]),
  content_manager: new Set([
    P.VIEW_HOME,
    P.VIEW_TOURS,
    P.MANAGE_TOURS,
    P.VIEW_PROPERTIES,
    P.MANAGE_PROPERTIES,
    P.VIEW_NOTIFICATIONS,
    P.VIEW_COMPANY,
    P.VIEW_SUPPORT,
  ]),
};

export const getBusinessPermissions = (user) => {
  const role = normalizeBusinessRole(user?.businessRole || user?.companyRole || user?.staffRole || user?.role);
  return BUSINESS_ROLE_PERMISSIONS[role] || BUSINESS_ROLE_PERMISSIONS.manager;
};

export const canBusiness = (user, permission) => getBusinessPermissions(user).has(permission);

export const getBusinessHomePathForRole = (user, basePath = '/business') => {
  const permissions = getBusinessPermissions(user);
  if (permissions.has(P.VIEW_HOME)) return `${basePath}/dashboard`;
  if (permissions.has(P.VIEW_SCHEDULE)) return `${basePath}/schedule`;
  if (permissions.has(P.VIEW_PAYMENTS)) return `${basePath}/payments`;
  if (permissions.has(P.VIEW_ANALYTICS)) return `${basePath}/analytics`;
  if (permissions.has(P.VIEW_TOURS)) return `${basePath}/tours`;
  if (permissions.has(P.VIEW_TASKS)) return `${basePath}/tasks`;
  return `${basePath}/support`;
};

export const BUSINESS_TAB_PERMISSIONS = {
  home: P.VIEW_HOME,
  schedule: P.VIEW_SCHEDULE,
  bookings: P.VIEW_BOOKINGS,
  calendar: P.VIEW_SCHEDULE,
  clients: P.VIEW_CLIENTS,
  tours: P.VIEW_TOURS,
  accommodations: P.VIEW_PROPERTIES,
  properties: P.VIEW_PROPERTIES,
  company: P.VIEW_COMPANY,
  team: P.VIEW_TEAM,
  tasks: P.VIEW_TASKS,
  payments: P.VIEW_PAYMENTS,
  reports: P.VIEW_ANALYTICS,
  notifications: P.VIEW_NOTIFICATIONS,
  activity: P.VIEW_ACTIVITY,
  settings: P.VIEW_SETTINGS,
  support: P.VIEW_SUPPORT,
};
