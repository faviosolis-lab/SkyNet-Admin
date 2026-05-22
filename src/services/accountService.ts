import { supabase } from '../lib/supabase';
import type { Account, PaymentHistory } from '../types';

function sortHistory(history: PaymentHistory[]): PaymentHistory[] {
  return history.sort((a, b) => a.period.localeCompare(b.period));
}

export async function fetchAllAccounts(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*, payment_history(*)')
    .order('name');

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    accountNumber: row.account_number,
    name: row.name,
    status: row.status,
    monthlyFee: Number(row.monthly_fee),
    dueDate: row.due_date || '---',
    comments: row.comments || '',
    paymentHistory: sortHistory(
      (row.payment_history || []).map((ph: any) => ({ period: ph.period, status: ph.status }))
    ),
    ruc: row.ruc || '',
    billingEmail: row.billing_email || '',
    contactName: row.contact_name || '',
    contactPhone: row.contact_phone || '',
  }));
}

export async function updateAccount(id: string, fields: Partial<{
  account_number: string;
  name: string;
  status: string;
  monthly_fee: number;
  due_date: string;
  comments: string;
  ruc: string;
  billing_email: string;
  contact_name: string;
  contact_phone: string;
}>): Promise<void> {
  const { error } = await supabase.from('accounts').update(fields).eq('id', id);
  if (error) throw error;
}

export async function createAccount(fields: {
  account_number: string;
  name: string;
  status: string;
  monthly_fee: number;
  due_date: string;
  comments: string;
}): Promise<void> {
  const { error } = await supabase.from('accounts').insert(fields);
  if (error) throw error;
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase.from('accounts').delete().eq('id', id);
  if (error) throw error;
}
