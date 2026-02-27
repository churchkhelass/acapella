import React, { useState, useCallback, useEffect } from 'react';
import { Input } from './ui/Input';
import { Checkbox } from './ui/Checkbox';
import { Button } from './ui/Button';

interface WithdrawFormProps {
  onSubmit: (amount: number, destination: string) => Promise<void>;
  isLoading: boolean;
}

export const WithdrawForm = React.memo(({ onSubmit, isLoading }: WithdrawFormProps) => {
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [touched, setTouched] = useState({
    amount: false,
    destination: false,
    confirm: false,
  });

  const validateAmount = useCallback((value: string) => {
    const num = parseFloat(value);
    if (!value) return 'Сумма обязательна';
    if (isNaN(num)) return 'Введите корректное число';
    if (num <= 0) return 'Сумма должна быть больше 0';
    return '';
  }, []);

  const validateDestination = useCallback((value: string) => {
    if (!value) return 'Адрес обязателен';
    if (value.length < 10) return 'Адрес слишком короткий';
    return '';
  }, []);

  const amountError = touched.amount ? validateAmount(amount) : '';
  const destinationError = touched.destination ? validateDestination(destination) : '';
  const confirmError = touched.confirm && !confirm ? 'Необходимо подтверждение' : '';

  const isFormValid = !validateAmount(amount) && !validateDestination(destination) && confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;

    try {
      await onSubmit(parseFloat(amount), destination);
      // Не сбрасываем форму при успехе, чтобы показать результат
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Вывод средств</h2>
      
      <Input
        label="Сумма (USDT)"
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={() => handleBlur('amount')}
        error={amountError}
        disabled={isLoading}
        placeholder="Введите сумму"
      />
      
      <Input
        label="Адрес получателя"
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        onBlur={() => handleBlur('destination')}
        error={destinationError}
        disabled={isLoading}
        placeholder="Введите адрес кошелька"
      />
      
      <Checkbox
        label="Я подтверждаю правильность введенных данных"
        checked={confirm}
        onChange={(e) => setConfirm(e.target.checked)}
        onBlur={() => handleBlur('confirm')}
        error={confirmError}
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        isLoading={isLoading}
        disabled={!isFormValid || isLoading}
        className="w-full"
      >
        Вывести средства
      </Button>
    </form>
  );
});

WithdrawForm.displayName = 'WithdrawForm';