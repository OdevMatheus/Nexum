package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.dtos.response.*;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.services.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/metrics")
@RequiredArgsConstructor
@Tag(name = "Metrics", description = "Dashboard metrics endpoints")
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/summary")
    @Operation(summary = "Get KPI summary", description = "Returns active subscriptions, overdue count, upcoming dues and MRR")
    public ResponseEntity<MetricsSummaryResponse> summary(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(metricsService.getSummary(user.getId()));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Monthly revenue", description = "Returns revenue aggregated by month for the last 6 months")
    public ResponseEntity<List<MonthlyRevenueResponse>> revenue(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(metricsService.getMonthlyRevenue(user.getId()));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Upcoming dues", description = "Returns subscriptions due within the next 7 days")
    public ResponseEntity<List<UpcomingSubscriptionResponse>> upcoming(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(metricsService.getUpcoming(user.getId()));
    }

    @GetMapping("/recent-payments")
    @Operation(summary = "Recent payments", description = "Returns the 10 most recent subscription cycles")
    public ResponseEntity<List<RecentPaymentResponse>> recentPayments(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(metricsService.getRecentPayments(user.getId()));
    }
}