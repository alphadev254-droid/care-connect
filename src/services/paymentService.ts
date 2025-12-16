import { api } from '@/lib/api';

export interface PaymentTransaction {
  id: number;
  appointmentId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt?: string;
  createdAt: string;
  Appointment?: any;
}

export interface InitiatePaymentData {
  appointmentId: number;
}

export interface PaymentInitiationResponse {
  message: string;
  checkoutUrl: string;
  tx_ref: string;
  transaction: PaymentTransaction;
}

export const paymentService = {
  // Initiate payment for appointment
  initiatePayment: async (data: InitiatePaymentData): Promise<PaymentInitiationResponse> => {
    const response = await api.post('/payments/initiate', data);
    return response.data;
  },

  // Verify payment status
  verifyPayment: async (tx_ref: string) => {
    const response = await api.get(`/payments/verify/${tx_ref}`);
    return response.data;
  },

  // Get appointment payments
  getAppointmentPayments: async (appointmentId: number) => {
    const response = await api.get(`/payments/appointment/${appointmentId}`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
};
