import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Withdrawal, RequestState, ApiError } from '@/types/withdraw';
import { withdrawalsApi } from '../api/withdrawals';

interface WithdrawState {
  // State
  currentWithdrawal: Withdrawal | null;
  requestState: RequestState;
  error: ApiError | null;
  lastUpdated: number | null;

  // Actions
  createWithdrawal: (amount: number, destination: string) => Promise<void>;
  fetchWithdrawal: (id: string) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

const EXPIRATION_TIME = 5 * 60 * 1000; // 5 минут

export const useWithdrawStore = create<WithdrawState>()(
  persist(
    (set, get) => ({
      currentWithdrawal: null,
      requestState: 'idle',
      error: null,
      lastUpdated: null,

      createWithdrawal: async (amount: number, destination: string) => {
        set({ requestState: 'loading', error: null });

        try {
          const withdrawal = await withdrawalsApi.create({ amount, destination });
          set({
            currentWithdrawal: withdrawal,
            requestState: 'success',
            lastUpdated: Date.now(),
          });
        } catch (error) {
          set({
            requestState: 'error',
            error: {
              message: error instanceof Error ? error.message : 'Произошла ошибка при создании заявки',
            },
          });
        }
      },

      fetchWithdrawal: async (id: string) => {
        set({ requestState: 'loading', error: null });

        try {
          const withdrawal = await withdrawalsApi.getById(id);
          set({
            currentWithdrawal: withdrawal,
            requestState: 'success',
            lastUpdated: Date.now(),
          });
        } catch (error) {
          set({
            requestState: 'error',
            error: {
              message: error instanceof Error ? error.message : 'Ошибка при получении заявки',
            },
          });
        }
      },

      reset: () => {
        set({
          currentWithdrawal: null,
          requestState: 'idle',
          error: null,
          lastUpdated: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'withdraw-storage',
      partialize: (state) => ({
        currentWithdrawal: state.currentWithdrawal,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Селекторы для проверки актуальности данных
export const useLastWithdrawal = () => {
  const { currentWithdrawal, lastUpdated } = useWithdrawStore();
  
  if (!currentWithdrawal || !lastUpdated) {
    return null;
  }

  const isExpired = Date.now() - lastUpdated > EXPIRATION_TIME;
  
  return isExpired ? null : currentWithdrawal;
};