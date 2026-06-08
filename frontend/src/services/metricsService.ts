import api from './authService';
import type { MetricsSummary, MonthlyRevenue, RecentPayment, UpcomingSubscription } from '../types/metrics';

export const metricsService = {
    getSummary: async (): Promise<MetricsSummary> => {
        const response = await api.get<MetricsSummary>('/v1/metrics/summary');
        return response.data;
    },
    getMonthlyRevenue: async (): Promise<MonthlyRevenue[]> => {
        const response = await api.get<MonthlyRevenue[]>('/v1/metrics/revenue');
        return response.data;
    },
    getUpcoming: async (): Promise<UpcomingSubscription[]> => {
        const response = await api.get<UpcomingSubscription[]>('/v1/metrics/upcoming');
        return response.data;
    },
    getRecentPayments: async (): Promise<RecentPayment[]> => {
        const response = await api.get<RecentPayment[]>('/v1/metrics/recent-payments');
        return response.data;
    }
};
