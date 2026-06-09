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

export const useActiveByPlan = () => {
    return useQuery({
        queryKey: ['metrics', 'active-by-plan'],
        queryFn: metricsService.getActiveByPlan,
        meta: {
            errorMessage: 'Erro ao carregar a distribuição por plano'
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

export const useMrrByPlan = () => {
    return useQuery({
        queryKey: ['metrics', 'mrr-by-plan'],
        queryFn: metricsService.getMrrByPlan,
        meta: {
            errorMessage: 'Erro ao carregar a distribuição de MRR por plano'
        }
    });
};

export const useMrrContributors = () => {
    return useQuery({
        queryKey: ['metrics', 'mrr-contributors'],
        queryFn: metricsService.getMrrContributors,
        meta: {
            errorMessage: 'Erro ao carregar os contribuintes do MRR'
        }
    });
};
