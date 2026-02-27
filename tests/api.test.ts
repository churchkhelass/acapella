import { withdrawalsApi } from '../src/lib/api/withdrawals';
import { apiClient } from '../src/lib/api/client';

// Мокаем apiClient
jest.mock('../src/lib/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Withdrawals API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('create withdrawal успешно создает заявку', async () => {
    const mockResponse = {
      data: {
        id: '123',
        amount: 100,
        destination: '0x123',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await withdrawalsApi.create({
      amount: 100,
      destination: '0x123',
    });

    expect(result).toEqual(mockResponse.data);
    expect(apiClient.post).toHaveBeenCalledWith(
      '/withdrawals',
      expect.objectContaining({
        amount: 100,
        destination: '0x123',
        idempotency_key: expect.any(String),
      })
    );
  });

  test('обработка ошибки 409 Conflict', async () => {
    const conflictError = new Error('Конфликт идемпотентности. Заявка с таким ключом уже существует.');
    (apiClient.post as jest.Mock).mockRejectedValueOnce(conflictError);

    await expect(
      withdrawalsApi.create({
        amount: 100,
        destination: '0x123',
      })
    ).rejects.toThrow(conflictError.message);
  });

  test('retry логика при сетевых ошибках', async () => {
    const networkError = new Error('Network error');
    const successResponse = {
      data: {
        id: '123',
        amount: 100,
        destination: '0x123',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    (apiClient.post as jest.Mock)
      .mockRejectedValueOnce(networkError)
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce(successResponse);

    const result = await withdrawalsApi.create({
      amount: 100,
      destination: '0x123',
    });

    expect(result).toEqual(successResponse.data);
    expect(apiClient.post).toHaveBeenCalledTimes(3);
  });
});