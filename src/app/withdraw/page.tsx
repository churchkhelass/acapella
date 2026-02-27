'use client';

import React, { useEffect } from 'react';
import { useWithdrawStore, useLastWithdrawal } from '@/lib/store/withdrawStore';
import { WithdrawForm } from '@/components/WithdrawForm';
import { Button } from '@/components/ui/Button';

export default function WithdrawPage() {
  const { 
    createWithdrawal, 
    reset, 
    requestState, 
    error, 
    clearError,
    currentWithdrawal,
    isPolling,
    stopPolling
  } = useWithdrawStore();
  
  const lastWithdrawal = useLastWithdrawal();

  // Останавливаем polling при размонтировании
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const handleSubmit = async (amount: number, destination: string) => {
    await createWithdrawal(amount, destination);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      pending: '⏳ В обработке',
      processing: '⚙️ Выполняется',
      completed: '✅ Завершено',
      failed: '❌ Ошибка',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const ProgressBar = ({ status }: { status: string }) => {
    if (status === 'completed') return null;
    
    const progress = {
      pending: 25,
      processing: 60,
      failed: 100,
    };

    const width = progress[status as keyof typeof progress] || 0;
    
    return (
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Прогресс обработки</span>
          <span>{width}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Вывод средств</h1>
          <p className="text-gray-600 mt-2">USDT (ERC-20)</p>
        </div>

        {/* Блок с ошибкой */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-red-700 text-sm">{error.message}</p>
              <button 
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Индикатор polling */}
        {isPolling && (
          <div className="mb-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
              <span className="animate-pulse mr-2">●</span>
              Автообновление статуса
            </span>
          </div>
        )}

        {/* Основной контент */}
        {requestState === 'success' && currentWithdrawal ? (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                currentWithdrawal.status === 'completed' ? 'bg-green-100' :
                currentWithdrawal.status === 'failed' ? 'bg-red-100' :
                'bg-blue-100 animate-pulse'
              }`}>
                {currentWithdrawal.status === 'completed' && (
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {currentWithdrawal.status === 'failed' && (
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {(currentWithdrawal.status === 'pending' || currentWithdrawal.status === 'processing') && (
                  <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </div>
              <h2 className="text-xl font-semibold">
                {currentWithdrawal.status === 'completed' && 'Заявка выполнена'}
                {currentWithdrawal.status === 'failed' && 'Ошибка выполнения'}
                {(currentWithdrawal.status === 'pending' || currentWithdrawal.status === 'processing') && 'Заявка в обработке'}
              </h2>
              {currentWithdrawal.status === 'processing' && (
                <p className="text-sm text-gray-500 mt-1">
                  Средства будут зачислены в течение нескольких минут
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-b py-4 my-4">
              <div className="flex justify-between">
                <span className="text-gray-600">ID заявки:</span>
                <span className="font-mono text-sm">{currentWithdrawal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Сумма:</span>
                <span className="font-medium">{currentWithdrawal.amount} USDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Адрес:</span>
                <span className="font-mono text-sm">
                  {currentWithdrawal.destination.slice(0, 6)}...{currentWithdrawal.destination.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Статус:</span>
                <StatusBadge status={currentWithdrawal.status} />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Создано: {new Date(currentWithdrawal.createdAt).toLocaleTimeString()}</span>
                <span>Обновлено: {new Date(currentWithdrawal.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Прогресс бар для незавершенных заявок */}
            <ProgressBar status={currentWithdrawal.status} />

            {/* Действия */}
            <div className="mt-6 space-y-3">
              {currentWithdrawal.status === 'completed' && (
                <Button 
                  onClick={reset} 
                  variant="primary" 
                  className="w-full"
                >
                  Создать новый вывод
                </Button>
              )}
              
              {currentWithdrawal.status === 'failed' && (
                <>
                  <Button 
                    onClick={() => createWithdrawal(currentWithdrawal.amount, currentWithdrawal.destination)} 
                    variant="primary" 
                    className="w-full"
                  >
                    Повторить попытку
                  </Button>
                  <Button 
                    onClick={reset} 
                    variant="secondary" 
                    className="w-full"
                  >
                    Создать другой вывод
                  </Button>
                </>
              )}

              {(currentWithdrawal.status === 'pending' || currentWithdrawal.status === 'processing') && (
                <div className="text-center text-sm text-gray-500">
                  Статус обновляется автоматически каждые 3 секунды
                </div>
              )}
            </div>
          </div>
        ) : (
          <WithdrawForm 
            onSubmit={handleSubmit} 
            isLoading={requestState === 'loading'} 
          />
        )}

        {/* Информация о восстановлении */}
        {lastWithdrawal && requestState !== 'success' && (
          <p className="text-xs text-center text-gray-400 mt-4">
            Последняя заявка будет восстановлена при перезагрузке (до 5 минут)
          </p>
        )}
      </div>
    </div>
  );
}