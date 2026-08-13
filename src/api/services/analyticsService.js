import { bookingService } from './bookingService';
import { propertyService } from './propertyService';
import { tourService } from './tourService';

export const analyticsService = {
  getBusinessSnapshot: async (params) => {
    const [tourBookings, stayBookings, tours, properties] = await Promise.all([
      bookingService.listTourBookings(params),
      bookingService.listStayBookings(params),
      tourService.list(params),
      propertyService.list(params),
    ]);
    return { tourBookings, stayBookings, tours, properties };
  },
};
