import React from 'react';
import { Withdrawal } from '@/types/withdraw';

interface WithdrawStatusProps {
  withdrawal: Withdrawal;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'В обработке',
  processing: 'Выполняется',
  completed: 'Завершено',
  failed: 'Ошибка',
};

export const WithdrawStatus = React.memo(({ withdrawal }: WithdrawStatusProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">Статус заявки #{withdrawal.id}</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Сумма:</span>
          <span className="font-medium">{withdrawal.amount} USDT</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Адрес:</span>
          <span className="font-medium font-mono">{withdrawal.destination}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Статус:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[withdrawal.status]}`}>
            {statusLabels[withdrawal.status]}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Создано:</span>
          <span className="text-sm">
            {new Date(withdrawal.createdAt).toLocaleString('ru-RU')}
          </span>
        </div>
      </div>
    </div>
  );
});

WithdrawStatus.displayName = 'WithdrawStatus';