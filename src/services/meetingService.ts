import { api } from '@/lib/api';

export interface MeetingAccessCheck {
  canJoin: boolean;
  status: 'available' | 'too_early' | 'expired';
  message: string;
  timeUntilExpiry?: number;
  timeUntilAvailable?: number;
  availableAt: string;
  expiresAt: string;
}

export interface Participant {
  role: 'patient' | 'caregiver';
  id: number;
  userId: number;
  name: string;
  firstName: string;
  email: string;
  isModerator: boolean;
}

export interface JitsiConfig {
  domain: string;
  roomName: string;
  userInfo: {
    displayName: string;
    email: string;
  };
  configOverwrite: {
    startWithAudioMuted: boolean;
    startWithVideoMuted: boolean;
    prejoinPageEnabled: boolean;
  };
}

export interface AppointmentDetails {
  id: number;
  scheduledDate: string;
  duration: number;
  sessionType: string;
  specialty: string;
  patientName: string;
  caregiverName: string;
  status: string;
}

export interface MeetingJoinResponse {
  success: boolean;
  appointment: AppointmentDetails;
  participant: Participant;
  accessCheck: MeetingAccessCheck;
  jitsiConfig: JitsiConfig;
}

export interface MeetingTrackData {
  appointmentId: number;
  participantRole: string;
  participantId: number;
  participantName: string;
  duration?: number;
}

export const meetingService = {
  /**
   * Join meeting using magic link token
   */
  joinWithToken: async (token: string): Promise<MeetingJoinResponse> => {
    const response = await api.get(`/meeting/join/${token}`);
    return response.data;
  },

  /**
   * Track when participant joins the meeting
   */
  trackJoin: async (data: MeetingTrackData) => {
    const response = await api.post('/meeting/track/join', data);
    return response.data;
  },

  /**
   * Track when participant leaves the meeting
   */
  trackLeave: async (data: MeetingTrackData) => {
    const response = await api.post('/meeting/track/leave', data);
    return response.data;
  }
};
