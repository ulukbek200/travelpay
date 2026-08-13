export const endpoints = {
  bookings: {
    stay: '/stay-bookings',
    stayAvailability: '/stay-bookings/availability',
    tour: '/tour-bookings',
    tourAvailability: '/tour-bookings/availability',
    waitlist: '/tour-bookings/waitlist',
    refund: '/booking-refunds',
    tourDepartureOperations: (tourId, slotId) => `/tour-departures/${tourId}/${slotId}/operations`,
  },
  clients: {
    list: '/users',
    detail: (id) => `/users/${id}`,
  },
  properties: {
    list: '/accommodations',
    detail: (id) => `/accommodations/${id}`,
  },
  tours: {
    list: '/tours',
    detail: (id) => `/tours/${id}`,
  },
  payments: {
    requests: '/payment-requests',
    approveRequest: (id) => `/payment-requests/${id}/approve`,
    rejectRequest: (id) => `/payment-requests/${id}/reject`,
    settings: '/business/payment-settings',
  },
  team: {
    list: '/business/managers',
    detail: (id) => `/business/managers/${id}`,
  },
  analytics: {
    adminTopups: '/api/admin/topups',
    businessSubscriptions: '/api/admin/business-subscriptions',
  },
};

export const TODO_ENDPOINT = (description) => ({
  available: false,
  description,
});
