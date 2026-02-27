'use client';

import React, { useEffect } from 'react';
import { useWithdrawStore, useLastWithdrawal } from '@/lib/store/withdrawStore';
import { WithdrawForm } from '@/components/WithdrawForm';
import { WithdrawStatus } from '@/components/WithdrawStatus';
import { Button } from '@/components/ui/Button';

export default function WithdrawPage() {
  const { createWithdrawal, reset, requestState, error, clearError } = useWithdrawStore();
  const lastWithdrawal = useLastWithdrawal();

  const handleSubmit = async (amount: number, destination: string) => {
    await createWithdrawal(amount, destination);
  };

  useEffect(() => {
    // Проверяем, есть ли незавершенная заявка при загрузке
    if (lastWithdrawal) {
      console.log('Восстановлена последняя заявка:', lastWithdrawal);
    }
  }, [lastWithdrawal]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="text-red-700">{error.message}</p>
                <Button variant="secondary" onClick={clearError} className="ml-4">
                  Закрыть
                </Button>
              </div>
            </div>
          )}

          {requestState === 'success' && lastWithdrawal ? (
            <div className="space-y-4">
              <WithdrawStatus withdrawal={lastWithdrawal} />
              <Button onClick={reset} variant="secondary" className="w-full">
                Создать новую заявку
              </Button>
            </div>
          ) : (
            <WithdrawForm onSubmit={handleSubmit} isLoading={requestState === 'loading'} />
          )}
        </div>
      </div>
    </div>
  );
}