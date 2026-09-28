import { api } from '@/lib/api';

export interface WithdrawalRequest {
  amount: number;
  recipientType: 'mobile_money' | 'bank';
  recipientNumber: string;
  token: string;
  operator?: 'airtel' | 'tnm';
  bankCode?: string;
  accountName?: string;
}

export type WithdrawalDetails = Omit<WithdrawalRequest, 'token'>;

export interface Withdrawal {
  id: number;
  requestedAmount: string;
  withdrawalFee: string;
  netPayout: string;
  currency: string;
  recipientType: string;
  recipientNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentReference?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface PayoutBank {
  uuid: string;
  name: string;
}

export const withdrawalService = {
  // Request withdrawal token
  requestWithdrawalToken: async (details: WithdrawalDetails) => {
    const response = await api.post('/withdrawals/request-token', details);
    return response.data;
  },

  // Verify withdrawal token
  verifyWithdrawalToken: async (token: string, details: WithdrawalDetails) => {
    const response = await api.post('/withdrawals/verify-token', { token, ...details });
    return response.data;
  },

  // Request withdrawal using PayChangu with token
  requestWithdrawal: async (withdrawalData: WithdrawalRequest) => {
    const response = await api.post('/withdrawals/request', withdrawalData);
    return response.data;
  },

  // Get caregiver balance
  getBalance: async () => {
    const response = await api.get('/withdrawals/balance');
    return response.data;
  },

  getBanks: async (): Promise<PayoutBank[]> => {
    const response = await api.get('/withdrawals/banks');
    return response.data.banks;
  },

  // Get withdrawal history
  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get('/withdrawals/history', { params: { page, limit } });
    return response.data;
  },

  // Verify withdrawal status
  verifyWithdrawal: async (paymentReference: string) => {
    const response = await api.get(`/withdrawals/verify/${paymentReference}`);
    return response.data;
  }
};
