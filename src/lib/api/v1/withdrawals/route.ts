import { NextResponse } from 'next/server';
import { Withdrawal, WithdrawStatus } from '@/types/withdraw';

// Хранилище заявок в памяти
const withdrawals: Withdrawal[] = [];

export async function POST(request: Request) {
  const body = await request.json();
  const { amount, destination, idempotency_key } = body;
  
  // Проверка на дубликат (409)
  const existing = withdrawals.find(w => w.id === idempotency_key);
  if (existing) {
    return NextResponse.json(
      { error: 'Conflict: Idempotency key already exists' },
      { status: 409 }
    );
  }
  
  // Создаём новую заявку
  const withdrawal: Withdrawal = {
    id: idempotency_key || Math.random().toString(36).substring(7),
    amount,
    destination,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  withdrawals.push(withdrawal);
  
  return NextResponse.json({ data: withdrawal }, { status: 201 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    const withdrawal = withdrawals.find(w => w.id === id);
    if (!withdrawal) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data: withdrawal });
  }
  
  return NextResponse.json({ data: withdrawals });
}