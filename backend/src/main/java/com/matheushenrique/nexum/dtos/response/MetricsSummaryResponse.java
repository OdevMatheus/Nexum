package com.matheushenrique.nexum.dtos.response;

public record MetricsSummaryResponse(
        long activeSubscriptions,
        long overdueSubscriptions,
        long upcomingDueIn7Days,
        long mrr
) {}