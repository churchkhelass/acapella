import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Withdrawal, RequestState, ApiError } from '@/types/withdraw';
import { withdrawalsApi } from '../api/withdrawals';

interface WithdrawState {
  currentWithdrawal: Withdrawal | null;
  requestState: RequestState;
  error: ApiError | null;
  lastUpdated: number | null;
  isPolling: boolean;
  pollInterval: number | null;

  createWithdrawal: (amount: number, destination: string) => Promise<void>;
  fetchWithdrawal: (id: string) => Promise<void>;
  startPolling: (id: string) => void;
  stopPolling: () => void;
  reset: () => void;
  clearError: () => void;
}

const EXPIRATION_TIME = 5 * 60 * 1000; // 5 минут
const POLL_INTERVAL = 3000; // 3 секунды

export const useWithdrawStore = create<WithdrawState>()(
  persist(
    (set, get) => ({
      currentWithdrawal: null,
      requestState: 'idle',
      error: null,
      lastUpdated: null,
      isPolling: false,
      pollInterval: null,

      createWithdrawal: async (amount: number, destination: string) => {
        set({ requestState: 'loading', error: null });

        try {
          const withdrawal = await withdrawalsApi.create({ amount, destination });
          set({
            currentWithdrawal: withdrawal,
            requestState: 'success',
            lastUpdated: Date.now(),
          });
          
          // Автоматически запускаем polling для новой заявки
          get().startPolling(withdrawal.id);
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
        try {
          const withdrawal = await withdrawalsApi.getById(id);
          const currentWithdrawal = get().currentWithdrawal;
          
          // Проверяем, изменился ли статус
          if (currentWithdrawal?.status !== withdrawal.status) {
            set({
              currentWithdrawal: withdrawal,
              lastUpdated: Date.now(),
            });
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      },

      startPolling: (id: string) => {
        // Останавливаем предыдущий polling если был
        get().stopPolling();

        // Запускаем новый polling
        const intervalId = window.setInterval(() => {
          get().fetchWithdrawal(id);
        }, POLL_INTERVAL);

        set({ 
          isPolling: true, 
          pollInterval: intervalId 
        });

        console.log(`[Polling] Started for withdrawal ${id}`);
      },

      stopPolling: () => {
        const { pollInterval } = get();
        
        if (pollInterval) {
          clearInterval(pollInterval);
          console.log('[Polling] Stopped');
        }

        set({ 
          isPolling: false, 
          pollInterval: null 
        });
      },

      reset: () => {
        get().stopPolling();
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

// Селектор с проверкой актуальности
export const useLastWithdrawal = () => {
  const { currentWithdrawal, lastUpdated } = useWithdrawStore();
  
  if (!currentWithdrawal || !lastUpdated) {
    return null;
  }

  const isExpired = Date.now() - lastUpdated > EXPIRATION_TIME;
  
  return isExpired ? null : currentWithdrawal;
};

// Очистка при демонтировании (для SSR)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const state = useWithdrawStore.getState();
    state.stopPolling();
  });
}