import { supabase } from '../lib/supabase';
import type { LinkedUser } from '../types';

export async function getLinkedUsers(accountId: string): Promise<LinkedUser[]> {
  const { data, error } = await supabase
    .from('user_accounts')
    .select('user_id, role, profiles(email)')
    .eq('account_id', accountId);

  if (error) throw error;

  return (data || []).map((row: any) => ({
    user_id: row.user_id,
    email: (row.profiles as any)?.email ?? row.user_id,
    role: row.role,
  }));
}

export async function linkUserByEmail(email: string, accountId: string): Promise<void> {
  // Buscar el usuario en profiles por email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim())
    .single();

  if (profileError || !profile) {
    throw new Error(`No existe ningún usuario registrado con el email "${email}".`);
  }

  // Insertar en user_accounts
  const { error } = await supabase
    .from('user_accounts')
    .insert({ user_id: profile.id, account_id: accountId, role: 'viewer' });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este usuario ya está vinculado a esta cuenta.');
    }
    throw error;
  }
}

export async function unlinkUser(userId: string, accountId: string): Promise<void> {
  const { error } = await supabase
    .from('user_accounts')
    .delete()
    .eq('user_id', userId)
    .eq('account_id', accountId);

  if (error) throw error;
}
