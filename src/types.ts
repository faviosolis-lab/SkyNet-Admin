export type AccountStatusValue = 'Activo' | 'Inactivo' | 'Suspendido' | 'Demorado' | 'Pendiente';
export type PaymentStatusValue = 'Pagado' | 'Demorado' | 'Pendiente' | 'Suspendido' | 'Próximo';

export interface PaymentHistory {
  period: string;
  status: PaymentStatusValue;
}

export interface Account {
  id: string;           // UUID from accounts table
  accountNumber: string;
  name: string;
  status: AccountStatusValue;
  monthlyFee: number;
  dueDate: string;
  comments: string;
  paymentHistory: PaymentHistory[];
  ruc: string;
  billingEmail: string;
  contactName: string;
  contactPhone: string;
}

export interface LinkedUser {
  user_id: string;
  email: string;
  role: string;
}
