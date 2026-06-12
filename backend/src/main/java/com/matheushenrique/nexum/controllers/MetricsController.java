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
@Tag(name = "5. Métricas", description = "Métricas e painel de controle do dashboard")
public class MetricsController {

    private final MetricsService metricsService;

    @GetMapping("/summary")
    @Operation(summary = "Obter Resumo do Dashboard", description = "Retorna o painel geral de faturamento e status (MRR, inadimplências, assinaturas ativas e a vencer).")
    public ResponseEntity<MetricsSummaryResponse> summary(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getSummary(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/revenue")
    @Operation(summary = "Obter Receita Mensal", description = "Retorna o histórico detalhado de receitas consolidadas mês a mês.")
    public ResponseEntity<List<MonthlyRevenueResponse>> monthlyRevenue(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getMonthlyRevenue(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Obter Faturas a Vencer", description = "Retorna as assinaturas com faturas que vencerão nos próximos dias.")
    public ResponseEntity<List<UpcomingSubscriptionResponse>> upcoming(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getUpcoming(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/recent-payments")
    @Operation(summary = "Obter Pagamentos Recentes", description = "Retorna os últimos ciclos de faturamento quitados no sistema.")
    public ResponseEntity<List<RecentPaymentResponse>> recentPayments(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getRecentPayments(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/active-by-plan")
    @Operation(summary = "Obter Assinaturas por Plano", description = "Retorna a volumetria de assinaturas ativas e em período de testes agrupadas por plano.")
    public ResponseEntity<List<PlanDistributionResponse>> activeByPlan(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getActiveByPlan(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/mrr-by-plan")
    @Operation(summary = "Obter Distribuição de MRR", description = "Retorna o faturamento recorrente mensal (MRR) distribuído por plano.")
    public ResponseEntity<List<MrrDistributionResponse>> mrrByPlan(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getMrrDistribution(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/mrr-contributors")
    @Operation(summary = "Obter Contribuintes do MRR", description = "Retorna a lista de clientes e faturas que compõem o faturamento recorrente do mês atual.")
    public ResponseEntity<List<MrrContributorResponse>> mrrContributors(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getMrrContributors(UUID.fromString(user.getUsername())));
    }

    @GetMapping("/client-growth")
    @Operation(summary = "Obter Crescimento de Clientes", description = "Retorna a evolução do número acumulado de clientes registrados ao longo do tempo.")
    public ResponseEntity<List<ClientGrowthResponse>> clientGrowth(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getClientGrowth(UUID.fromString(user.getUsername())));
    }
}