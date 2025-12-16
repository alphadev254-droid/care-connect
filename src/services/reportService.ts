import { api } from '@/lib/api';

export interface CareSessionReport {
  id: number;
  appointmentId: number;
  observations: string;
  interventions: string;
  vitals?: any;
  patientStatus: 'stable' | 'improving' | 'deteriorating' | 'critical' | 'cured' | 'deceased';
  sessionSummary: string;
  recommendations?: string;
  followUpRequired?: boolean;
  attachments?: string[];
  createdAt?: string;
  Appointment?: any;
}

export interface CreateReportData {
  appointmentId: number;
  observations: string;
  interventions: string;
  vitals?: any;
  patientStatus: 'stable' | 'improving' | 'deteriorating' | 'critical' | 'cured' | 'deceased';
  sessionSummary: string;
  recommendations?: string;
  followUpRequired?: boolean;
  attachments?: string[];
}

export const reportService = {
  getReports: async (params?: any) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  getReportById: async (id: number) => {
    const response = await api.get(`/reports/${id}`);
    return response.data.report;
  },

  createReport: async (data: CreateReportData) => {
    const response = await api.post('/reports', data);
    return response.data.report;
  },
};
