import api from './authService';
import type { NotificationResponse } from '../types/notification';
import type { PageResponse } from '../types/client';

export const notificationService = {
    findAll: async (page: number = 0, size: number = 20) => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });
        const response = await api.get<PageResponse<NotificationResponse>>(`/v1/notifications?${params.toString()}`);
        return response.data;
    },

    countUnread: async () => {
        const response = await api.get<number>('/v1/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (id: string) => {
        await api.patch(`/v1/notifications/${id}/read`);
    },

    markAllAsRead: async () => {
        await api.patch('/v1/notifications/read-all');
    }
};