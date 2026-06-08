import { useQuery } from '@tanstack/react-query';
import { metricsService } from '../services/metricsService';

export const useMetricsSummary = () => {
    return useQuery({
        queryKey: ['metrics', 'summary'],
        queryFn: metricsService.getSummary,
        meta: {
            errorMessage: 'Erro ao carregar o resumo de métricas'
        }
    });
};

export const useMonthlyRevenue = () => {
    return useQuery({
        queryKey: ['metrics', 'revenue'],
        queryFn: metricsService.getMonthlyRevenue,
        meta: {
            errorMessage: 'Erro ao carregar o faturamento mensal'
        }
    });
};

export const useUpcomingSubscriptions = () => {
    return useQuery({
        queryKey: ['metrics', 'upcoming'],
        queryFn: metricsService.getUpcoming,
        meta: {
            errorMessage: 'Erro ao carregar faturas a vencer'
        }
    });
};

export const useRecentPayments = () => {
    return useQuery({
        queryKey: ['metrics', 'recent-payments'],
        queryFn: metricsService.getRecentPayments,
        meta: {
            errorMessage: 'Erro ao carregar pagamentos recentes'
        }
    });
};
