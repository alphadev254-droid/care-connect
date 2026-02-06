import { api } from '@/lib/api';

export interface ReferralStats {
  totalConverted: number;
  pendingClicks: number;
  boostScore: number;
  referralCount: number;
}

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: ReferralStats;
}

export const referralService = {
  getReferralCode: async (): Promise<ReferralData> => {
    const response = await api.get('/caregivers/referral/code');
    return response.data;
  },

  getReferralStats: async (): Promise<{ stats: ReferralStats }> => {
    const response = await api.get('/caregivers/referral/stats');
    return response.data;
  },

  sendReferralEmail: async (recipientEmail: string, personalMessage?: string) => {
    const response = await api.post('/caregivers/referral/send-email', {
      recipientEmail,
      personalMessage: personalMessage || ''
    });
    return response.data;
  },
};
