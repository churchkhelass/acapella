export type WithdrawStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Withdrawal {
  id: string;
  amount: number;
  destination: string;
  status: WithdrawStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  destination: string;
  idempotency_key: string;
}

export interface WithdrawalResponse {
  data: Withdrawal;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export type RequestState = 'idle' | 'loading' | 'success' | 'error';