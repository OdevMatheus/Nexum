export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'OVERDUE' | 'SUSPENDED' | 'CANCELLED' | 'REACTIVATED';
export type CycleStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Subscription {
    id: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    planId: string;
    planName: string;
    planAmountFormatted: string;
    planRecurrenceLabel: string;
    status: SubscriptionStatus;
    statusLabel: string;
    startDate: string;
    nextDueDate: string;
    cancelledAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionCycle {
    id: string;
    dueDate: string;
    paidAt?: string;
    amountCents: number;
    amountFormatted: string;
    status: CycleStatus;
    statusLabel: string;
    createdAt: string;
}

export interface CreateSubscriptionRequest {
    clientId: string;
    planId: string;
    startDate: string;
}
