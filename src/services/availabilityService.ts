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
  // CREATE - Add single availability slot
  createSlot: async (slot: AvailabilitySlot) => {
    const response = await api.post('/availability/slot', slot);
    return response.data.availability;
  },

  // READ - Get all availability for a caregiver
  getAvailability: async (caregiverId: number) => {
    const response = await api.get(`/availability/${caregiverId}`);
    return response.data.availability;
  },

  // UPDATE - Update single availability slot
  updateSlot: async (id: number, slot: AvailabilitySlot) => {
    const response = await api.put(`/availability/${id}`, slot);
    return response.data.availability;
  },

  // DELETE - Delete single availability slot
  deleteSlot: async (id: number) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
  },

  // BULK SET - Replace all availability (legacy support)
  setAvailability: async (availability: AvailabilitySlot[]) => {
    const response = await api.post('/availability', { availability });
    return response.data;
  },

  // CLEAR ALL - Delete all availability
  clearAll: async () => {
    const response = await api.delete('/availability');
    return response.data;
  },
};