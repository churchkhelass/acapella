'use client';

import { useEffect } from 'react';
import { useWithdrawStore } from '@/lib/store/withdrawStore';
import { withdrawalsApi } from '@/lib/api/withdrawals';

export function Cleanup() {
  useEffect(() => {
    return () => {
      // Очищаем polling при закрытии вкладки
      useWithdrawStore.getState().stopPolling();
      // Очищаем интервалы симуляции
      withdrawalsApi.cleanup?.();
    };
  }, []);

  return null;
}