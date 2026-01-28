import { api } from '@/lib/api';

export interface WithdrawalRequest {
  amount: number;
  recipientType: 'mobile_money' | 'bank';
  recipientNumber: string;
  token: string;
}

export interface Withdrawal {
  id: number;
  caregiverId: number;
  requestedAmount: number;
  withdrawalFee: number;
  netPayout: number;
  currency: string;
  recipientType: string;
  recipientNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentReference?: string;
  requestedAt: string;
  processedAt?: string;
}

export const withdrawalService = {
  // Request withdrawal token
  requestWithdrawalToken: async () => {
    const response = await api.post('/withdrawals/request-token');
    return response.data;
  },

  // Verify withdrawal token
  verifyWithdrawalToken: async (token: string, amount: number) => {
    const response = await api.post('/withdrawals/verify-token', { token, amount });
    return response.data;
  },

  // Request withdrawal using PayChangu with token
  requestWithdrawal: async (withdrawalData: WithdrawalRequest) => {
    const response = await api.post('/withdrawals/request', {
      ...withdrawalData,
      paymentProvider: 'paychangu',
      publicKey: import.meta.env.VITE_PAYCHANGU_PUBLIC_KEY
    });
    return response.data;
  },

  // Get caregiver balance
  getBalance: async () => {
    const response = await api.get('/withdrawals/balance');
    return response.data;
  },

  // Get withdrawal history
  getHistory: async () => {
    const response = await api.get('/withdrawals/history');
    return response.data;
  },

  // Verify withdrawal status
  verifyWithdrawal: async (paymentReference: string) => {
    const response = await api.get(`/withdrawals/verify/${paymentReference}`);
    return response.data;
  }
};