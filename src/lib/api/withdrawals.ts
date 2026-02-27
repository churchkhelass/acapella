import { apiClient } from './client';
import { CreateWithdrawalRequest, Withdrawal, WithdrawStatus } from '@/types/withdraw';
import { generateIdempotencyKey } from '../utils/idempotency';

// Храним 
const mockWithdrawals: Map<string, Withdrawal> = new Map();
// Обработки заявки
const statusFlow: WithdrawStatus[] = ['pending', 'processing', 'completed'];
let processingIntervals: Map<string, NodeJS.Timeout> = new Map();

function simulateProcessing(withdrawalId: string) {
  if (processingIntervals.has(withdrawalId)) {
    clearInterval(processingIntervals.get(withdrawalId));
  }

  let currentStatusIndex = 0;
  
  const interval = setInterval(() => {
    const withdrawal = mockWithdrawals.get(withdrawalId);
    if (!withdrawal) {
      clearInterval(interval);
      processingIntervals.delete(withdrawalId);
      return;
    }

    currentStatusIndex++;
    
    if (currentStatusIndex < statusFlow.length) {
      // Обновляем статус
      withdrawal.status = statusFlow[currentStatusIndex];
      withdrawal.updatedAt = new Date().toISOString();
      mockWithdrawals.set(withdrawalId, withdrawal);
      console.log(`[Polling] Заявка ${withdrawalId} обновлена: ${withdrawal.status}`);
    } else {
      clearInterval(interval);
      processingIntervals.delete(withdrawalId);
      
      // 10% шанс ошибки
      if (Math.random() < 0.1) {
        withdrawal.status = 'failed';
        withdrawal.updatedAt = new Date().toISOString();
        mockWithdrawals.set(withdrawalId, withdrawal);
        console.log(`[Polling] Заявка ${withdrawalId} завершилась ошибкой`);
      }
    }
  }, 5000);

  processingIntervals.set(withdrawalId, interval);
}

export const withdrawalsApi = {
  async create(data: Omit<CreateWithdrawalRequest, 'idempotency_key'>): Promise<Withdrawal> {
    const idempotencyKey = generateIdempotencyKey();
    
    // Задержкат сети
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 409 10% шанс
    if (Math.random() < 0.1) {
      throw new Error('Конфликт идемпотентности. Заявка с таким ключом уже существует.');
    }

    // Создаём мок заявку
    const withdrawal: Withdrawal = {
      id: `wd_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: data.amount,
      destination: data.destination,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Сохраняем в мок хранилище
    mockWithdrawals.set(withdrawal.id, withdrawal);
    
    // Запускаем симуляцию обработки
    simulateProcessing(withdrawal.id);
    
    return withdrawal;
  },

  async getById(id: string): Promise<Withdrawal> {
    // Задержка сети
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const withdrawal = mockWithdrawals.get(id);
    
    if (!withdrawal) {
      // создаём тестовую
      const testWithdrawal: Withdrawal = {
        id,
        amount: 100,
        destination: '0x12345678901234567890',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockWithdrawals.set(id, testWithdrawal);
      return testWithdrawal;
    }
    
    return withdrawal;
  },

  // Очистка интервалов тетс
  cleanup() {
    processingIntervals.forEach((interval) => clearInterval(interval));
    processingIntervals.clear();
  }
};
