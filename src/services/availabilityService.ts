import { api } from '@/lib/api';

export interface AvailabilitySlot {
  dayOfWeek: number; // 0=Sunday, 1=Monday, etc.
  startTime: string;
  endTime: string;
}

export interface CaregiverAvailability {
  id: number;
  caregiverId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export const availabilityService = {
  setAvailability: async (availability: AvailabilitySlot[]) => {
    const response = await api.post('/availability', { availability });
    return response.data;
  },

  getAvailability: async (caregiverId: number) => {
    const response = await api.get(`/availability/${caregiverId}`);
    return response.data.availability;
  },
};