import { api } from '@/lib/api';

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export const specialtyService = {
  getSpecialties: async () => {
    const response = await api.get('/specialties');
    return response.data.specialties;
  },
};
