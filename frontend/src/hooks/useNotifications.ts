import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: () => notificationService.countUnread(),
        refetchInterval: 300000, // 5 minutes polling
        refetchOnWindowFocus: true,
    });
};

export const useNotifications = (page: number = 0, size: number = 20) => {
    return useQuery({
        queryKey: ['notifications', page, size],
        queryFn: () => notificationService.findAll(page, size),
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
};