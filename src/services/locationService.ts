import { api } from '@/lib/api';

export const locationService = {
  getRegions: async () => {
    const response = await api.get('/locations/regions');
    return response.data.data || [];
  },

  getDistricts: async (region: string) => {
    const response = await api.get(`/locations/districts/${region}`);
    return response.data.data || [];
  },

  getTraditionalAuthorities: async (region: string, district: string) => {
    const response = await api.get(`/locations/traditional-authorities/${region}/${district}`);
    return response.data.data || [];
  },

  getVillages: async (region: string, district: string, ta: string) => {
    const response = await api.get(`/locations/villages/${region}/${district}/${ta}`);
    return response.data.data || [];
  },
};
