package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.response.*;
import com.matheushenrique.nexum.services.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@ApiGlobalErrors
@SecurityRequirement(name = "bearer-key")
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

    @GetMapping("/mrr-by-plan")
    @Operation(summary = "Get MRR Distribution By Plan", description = "Retorna a distribuição de MRR por plano para o mês atual")
    public ResponseEntity<List<MrrDistributionResponse>> mrrByPlan(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getMrrDistribution(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/mrr-contributors")
    @Operation(summary = "Get MRR Contributors", description = "Retorna a lista de faturas/clientes que contribuem para o MRR do mês atual")
    public ResponseEntity<List<MrrContributorResponse>> mrrContributors(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getMrrContributors(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/client-growth")
    @Operation(summary = "Get Client Growth Over Time", description = "Retorna o crescimento acumulado de clientes registrados nos últimos 6 meses")
    public ResponseEntity<List<ClientGrowthResponse>> clientGrowth(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getClientGrowth(UUID.fromString(user.getUsername())));
    }
}