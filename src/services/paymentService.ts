import { supabase } from '../lib/supabase';
import type { PaymentStatusValue } from '../types';

export async function updatePaymentStatus(accountId: string, period: string, status: PaymentStatusValue): Promise<void> {
  const { error } = await supabase
    .from('payment_history')
    .update({ status })
    .eq('account_id', accountId)
    .eq('period', period);
  if (error) throw error;
}

export async function addPeriod(accountId: string, period: string, status: PaymentStatusValue): Promise<void> {
  const { error } = await supabase
    .from('payment_history')
    .insert({ account_id: accountId, period, status });
  if (error) throw error;
}

export async function deletePeriod(accountId: string, period: string): Promise<void> {
  const { error } = await supabase
    .from('payment_history')
    .delete()
    .eq('account_id', accountId)
    .eq('period', period);
  if (error) throw error;
}
