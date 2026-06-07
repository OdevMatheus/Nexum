export type NotificationType = 'PAYMENT_OVERDUE' | 'SUBSCRIPTION_SUSPENDED';

export interface NotificationResponse {
    id: string;
    subscriptionId: string;
    type: NotificationType;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}