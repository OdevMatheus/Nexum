package com.matheushenrique.nexum.services;

import com.matheushenrique.nexum.dtos.response.*;
import java.util.List;
import java.util.UUID;

public interface MetricsService {
    MetricsSummaryResponse getSummary(UUID ownerId);
    List<MonthlyRevenueResponse> getMonthlyRevenue(UUID ownerId);
    List<UpcomingSubscriptionResponse> getUpcoming(UUID ownerId);
    List<RecentPaymentResponse> getRecentPayments(UUID ownerId);
    List<PlanDistributionResponse> getActiveByPlan(UUID ownerId);
    List<MrrDistributionResponse> getMrrDistribution(UUID ownerId);
    List<MrrContributorResponse> getMrrContributors(UUID ownerId);
    List<ClientGrowthResponse> getClientGrowth(UUID ownerId);
}