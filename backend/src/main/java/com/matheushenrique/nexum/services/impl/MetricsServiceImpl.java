package com.matheushenrique.nexum.services.impl;

import com.matheushenrique.nexum.dtos.response.*;
import com.matheushenrique.nexum.repositories.SubscriptionCycleRepository;
import com.matheushenrique.nexum.repositories.SubscriptionRepository;
import com.matheushenrique.nexum.services.MetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MetricsServiceImpl implements MetricsService {

    private static final int UPCOMING_DAYS     = 7;
    private static final int REVENUE_MONTHS    = 6;
    private static final int RECENT_PAYMENTS   = 10;

    private final SubscriptionRepository      subscriptionRepository;
    private final SubscriptionCycleRepository cycleRepository;

    @Override
    public MetricsSummaryResponse getSummary(UUID ownerId) {
        LocalDate today = LocalDate.now();

        long active   = subscriptionRepository.countActiveByOwnerId(ownerId);
        long overdue  = subscriptionRepository.countOverdueByOwnerId(ownerId);
        long upcoming = subscriptionRepository
                .findUpcoming(ownerId, today, today.plusDays(UPCOMING_DAYS))
                .size();
        long mrr      = cycleRepository.sumMrrByOwnerAndMonth(
                ownerId, today.getYear(), today.getMonthValue());

        return new MetricsSummaryResponse(active, overdue, upcoming, mrr);
    }

    @Override
    public List<MonthlyRevenueResponse> getMonthlyRevenue(UUID ownerId) {
        LocalDate from = LocalDate.now()
                .withDayOfMonth(1)
                .minusMonths(REVENUE_MONTHS - 1);

        List<Object[]> rows = cycleRepository.findMonthlyRevenue(ownerId, from);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM/yy", new Locale("pt", "BR"));

        List<MonthlyRevenueResponse> result = new ArrayList<>();
        for (Object[] row : rows) {
            int year   = ((Number) row[0]).intValue();
            int month  = ((Number) row[1]).intValue();
            long amount = ((Number) row[2]).longValue();
            String label = LocalDate.of(year, month, 1).format(fmt);
            result.add(new MonthlyRevenueResponse(year, month, label, amount));
        }
        return result;
    }

    @Override
    public List<UpcomingSubscriptionResponse> getUpcoming(UUID ownerId) {
        LocalDate today = LocalDate.now();
        return subscriptionRepository
                .findUpcoming(ownerId, today, today.plusDays(UPCOMING_DAYS))
                .stream()
                .map(UpcomingSubscriptionResponse::from)
                .toList();
    }

    @Override
    public List<RecentPaymentResponse> getRecentPayments(UUID ownerId) {
        return cycleRepository
                .findRecentByOwnerId(ownerId, PageRequest.of(0, RECENT_PAYMENTS))
                .stream()
                .map(RecentPaymentResponse::from)
                .toList();
    }
}