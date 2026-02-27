import { apiClient } from './client';
import { CreateWithdrawalRequest, Withdrawal, WithdrawalResponse } from '@/types/withdraw';
import { generateIdempotencyKey } from '../utils/idempotency';

export const withdrawalsApi = {
  async create(data: Omit<CreateWithdrawalRequest, 'idempotency_key'>): Promise<Withdrawal> {
    const idempotencyKey = generateIdempotencyKey();
    
    const response = await apiClient.post<WithdrawalResponse>('/withdrawals', {
      ...data,
      idempotency_key: idempotencyKey,
    });
    
    return response.data;
  },

  async getById(id: string): Promise<Withdrawal> {
    const response = await apiClient.get<WithdrawalResponse>(`/withdrawals/${id}`);
    return response.data;
  },
};