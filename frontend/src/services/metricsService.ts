import api from './authService';
import type { MetricsSummary, MonthlyRevenue, RecentPayment, UpcomingSubscription, PlanDistribution, MrrDistribution, MrrContributor, ClientGrowth } from '../types/metrics';

export const metricsService = {
    getSummary: async (): Promise<MetricsSummary> => {
        const response = await api.get<MetricsSummary>('/v1/metrics/summary');
        return response.data;
    },
    getActiveByPlan: async (): Promise<PlanDistribution[]> => {
        const response = await api.get<PlanDistribution[]>('/v1/metrics/active-by-plan');
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
    },
    getMrrByPlan: async (): Promise<MrrDistribution[]> => {
        const response = await api.get<MrrDistribution[]>('/v1/metrics/mrr-by-plan');
        return response.data;
    },
    getMrrContributors: async (): Promise<MrrContributor[]> => {
        const response = await api.get<MrrContributor[]>('/v1/metrics/mrr-contributors');
        return response.data;
    },
    getClientGrowth: async (): Promise<ClientGrowth[]> => {
        const response = await api.get<ClientGrowth[]>('/v1/metrics/client-growth');
        return response.data;
    }
};
