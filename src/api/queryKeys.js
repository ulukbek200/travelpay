export const queryKeys = {
  bookings: {
    all: ['bookings'],
    list: (filters = {}) => ['bookings', 'list', filters],
    detail: (id) => ['bookings', 'detail', id],
    stayList: (filters = {}) => ['bookings', 'stay', 'list', filters],
    tourList: (filters = {}) => ['bookings', 'tour', 'list', filters],
  },
  schedule: {
    day: (date, filters = {}) => ['schedule', 'day', date, filters],
    week: (date, filters = {}) => ['schedule', 'week', date, filters],
    month: (date, filters = {}) => ['schedule', 'month', date, filters],
  },
  clients: {
    list: (filters = {}) => ['clients', 'list', filters],
    detail: (id) => ['clients', 'detail', id],
  },
  properties: {
    list: (filters = {}) => ['properties', 'list', filters],
    detail: (id) => ['properties', 'detail', id],
    availability: (id, range = {}) => ['properties', 'availability', id, range],
  },
  tours: {
    list: (filters = {}) => ['tours', 'list', filters],
    detail: (id) => ['tours', 'detail', id],
    departures: (tourId, filters = {}) => ['tours', 'departures', tourId, filters],
  },
  payments: {
    transactions: (filters = {}) => ['payments', 'transactions', filters],
    requests: (filters = {}) => ['payments', 'requests', filters],
    settings: (companyId) => ['payments', 'settings', companyId],
  },
  team: {
    list: (filters = {}) => ['team', 'list', filters],
    detail: (id) => ['team', 'detail', id],
  },
  analytics: {
    summary: (range = {}) => ['analytics', 'summary', range],
    charts: (range = {}) => ['analytics', 'charts', range],
  },
};

export const mutationInvalidations = {
  bookingCreated: (queryClient, booking) => {
    queryClient?.invalidateQueries?.({ queryKey: queryKeys.bookings.all });
    queryClient?.invalidateQueries?.({ queryKey: ['schedule'] });
    if (booking?.clientId) queryClient?.invalidateQueries?.({ queryKey: queryKeys.clients.detail(booking.clientId) });
    if (booking?.tourId) queryClient?.invalidateQueries?.({ queryKey: queryKeys.tours.departures(booking.tourId) });
    if (booking?.stayId) queryClient?.invalidateQueries?.({ queryKey: queryKeys.properties.availability(booking.stayId) });
  },
  paymentChanged: (queryClient, payment) => {
    queryClient?.invalidateQueries?.({ queryKey: ['payments'] });
    queryClient?.invalidateQueries?.({ queryKey: queryKeys.bookings.detail(payment?.bookingId) });
  },
  clientChanged: (queryClient, clientId) => {
    queryClient?.invalidateQueries?.({ queryKey: queryKeys.clients.list() });
    queryClient?.invalidateQueries?.({ queryKey: queryKeys.clients.detail(clientId) });
  },
};
