import { api } from '@/lib/api';

export interface Appointment {
  id: number;
  patientId: number;
  caregiverId: number;
  specialtyId: number;
  scheduledDate: string;
  duration: number;
  sessionType: 'in_person' | 'teleconference';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalCost: number;
  notes?: string;
  Patient?: any;
  Caregiver?: any;
  Specialty?: any;
}

export interface CreateAppointmentData {
  timeSlotId: number;
  specialtyId: number;
  sessionType: 'in_person' | 'teleconference';
  notes?: string;
}

export const appointmentService = {
  getAppointments: async (params?: any) => {
    const response = await api.get('/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id: number) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data.appointment;
  },

  createAppointment: async (data: CreateAppointmentData) => {
    const response = await api.post('/appointments', data);
    return response.data.appointment;
  },

  updateAppointmentStatus: async (id: number, status: string) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data.appointment;
  },

  confirmPayment: async (appointmentId: number) => {
    const response = await api.post('/appointments/confirm-payment', { appointmentId });
    return response.data.appointment;
  },
};
