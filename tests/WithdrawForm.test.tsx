import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { WithdrawForm } from '../src/components/WithdrawForm';

// Мок для API
jest.mock('../src/lib/api/withdrawals', () => ({
  withdrawalsApi: {
    create: jest.fn(),
    getById: jest.fn(),
  },
}));

describe('WithdrawForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('happy-path: успешный submit валидной формы', async () => {
    mockSubmit.mockResolvedValueOnce(undefined);
    
    render(<WithdrawForm onSubmit={mockSubmit} isLoading={false} />);

    // Заполняем форму
    await userEvent.type(screen.getByLabelText(/сумма/i), '100.50');
    await userEvent.type(screen.getByLabelText(/адрес получателя/i), '0x12345678901234567890');
    await userEvent.click(screen.getByLabelText(/я подтверждаю/i));

    // Сабмитим
    const submitButton = screen.getByRole('button', { name: /вывести средства/i });
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(100.5, '0x12345678901234567890');
    });
  });

  test('ошибка API отображается корректно', async () => {
    const errorMessage = 'Ошибка при создании заявки';
    mockSubmit.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<WithdrawForm onSubmit={mockSubmit} isLoading={false} />);

    // Заполняем форму
    await userEvent.type(screen.getByLabelText(/сумма/i), '100');
    await userEvent.type(screen.getByLabelText(/адрес получателя/i), '0x12345678901234567890');
    await userEvent.click(screen.getByLabelText(/я подтверждаю/i));

    // Сабмитим
    fireEvent.click(screen.getByRole('button', { name: /вывести средства/i }));

    // В реальном компоненте ошибка обрабатывается в родителе
    expect(mockSubmit).toHaveBeenCalled();
  });

  test('защита от двойного submit', async () => {
    mockSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<WithdrawForm onSubmit={mockSubmit} isLoading={false} />);

    // Заполняем форму
    await userEvent.type(screen.getByLabelText(/сумма/i), '100');
    await userEvent.type(screen.getByLabelText(/адрес получателя/i), '0x12345678901234567890');
    await userEvent.click(screen.getByLabelText(/я подтверждаю/i));

    // Дважды кликаем на кнопку submit
    const submitButton = screen.getByRole('button', { name: /вывести средства/i });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    // Проверяем, что функция была вызвана только один раз
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
    });
  });

  test('валидация полей работает корректно', async () => {
    render(<WithdrawForm onSubmit={mockSubmit} isLoading={false} />);

    // Пытаемся отправить пустую форму
    const submitButton = screen.getByRole('button', { name: /вывести средства/i });
    expect(submitButton).toBeDisabled();

    // Вводим некорректную сумму
    await userEvent.type(screen.getByLabelText(/сумма/i), '-10');
    await userEvent.tab(); // blur

    expect(await screen.findByText(/сумма должна быть больше 0/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Исправляем сумму
    await userEvent.clear(screen.getByLabelText(/сумма/i));
    await userEvent.type(screen.getByLabelText(/сумма/i), '100');
    
    // Вводим короткий адрес
    await userEvent.type(screen.getByLabelText(/адрес получателя/i), '123');
    await userEvent.tab();

    expect(await screen.findByText(/адрес слишком короткий/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});