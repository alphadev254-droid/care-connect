import { api } from '@/lib/api';

export interface Caregiver {
  id: number;
  userId: number;
  licenseNumber?: string;
  yearsOfExperience?: number;
  bio?: string;
  hourlyRate?: number;
  availability?: any;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating?: number;
  averageRating?: string;
  totalRatings?: number;
  User?: any;
  Specialties?: any[];
}

export interface UpdateCaregiverProfileData {
  licenseNumber?: string;
  yearsOfExperience?: number;
  bio?: string;
  hourlyRate?: number;
  availability?: any;
}

export const caregiverService = {
  getCaregivers: async (params?: any) => {
    const response = await api.get('/caregivers', { params });
    return response.data;
  },

  getPublicCaregivers: async (params: {
    page: number;
    limit: number;
    search?: string;
    specialtyId?: string;
    region?: string;
    district?: string;
    traditionalAuthority?: string;
    village?: string;
  }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });
    const response = await api.get(`/public/caregivers?${queryParams}`);
    return response.data || {};
  },

  getCaregiverById: async (id: number) => {
    const response = await api.get(`/caregivers/${id}`);
    return response.data.caregiver;
  },

  updateProfile: async (data: UpdateCaregiverProfileData) => {
    const response = await api.put('/caregivers/profile', data);
    return response.data.caregiver;
  },

  updateSpecialties: async (specialtyIds: number[]) => {
    const response = await api.put('/caregivers/specialties', { specialtyIds });
    return response.data.caregiver;
  },
};
