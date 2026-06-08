package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.dtos.response.*;
import com.matheushenrique.nexum.services.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/metrics")
@RequiredArgsConstructor
@Tag(name = "5. Métricas", description = "Métricas e painel para o dashboard")
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/summary")
    @Operation(summary = "Get Dashboard Summary", description = "Retorna um resumo de assinaturas ativas, vencidas e a vencer e MRR")
    public ResponseEntity<MetricsSummaryResponse> summary(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getSummary(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get Monthly Revenue", description = "Retorna o historico de receita nos ultimos meses")
    public ResponseEntity<List<MonthlyRevenueResponse>> monthlyRevenue(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getMonthlyRevenue(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get Upcoming Subscriptions", description = "Retorna lista de faturas a vencer nos proximos dias")
    public ResponseEntity<List<UpcomingSubscriptionResponse>> upcoming(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getUpcoming(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/recent-payments")
    @Operation(summary = "Get Recent Payments", description = "Get recent subscription cycles")
    public ResponseEntity<List<RecentPaymentResponse>> recentPayments(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getRecentPayments(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/active-by-plan")
    @Operation(summary = "Get Active Subscriptions By Plan", description = "Retorna a distribuição de assinaturas ativas por plano")
    public ResponseEntity<List<PlanDistributionResponse>> activeByPlan(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getActiveByPlan(UUID.fromString(user.getUsername())));
    }
}