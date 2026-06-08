package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.request.CreateSubscriptionRequest;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.dtos.response.SubscriptionCycleResponse;
import com.matheushenrique.nexum.dtos.response.SubscriptionResponse;
import com.matheushenrique.nexum.entities.Subscription;
import com.matheushenrique.nexum.services.impl.SubscriptionServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/subscriptions")
@RequiredArgsConstructor
@ApiGlobalErrors
@SecurityRequirement(name = "bearer-key")
@Tag(name = "4. Assinaturas", description = "Gerenciamento de assinaturas e histórico de faturas/ciclos")
public class SubscriptionController {

    private final SubscriptionServiceImpl subscriptionService;

    @PostMapping
    @Operation(summary = "Criar Assinatura", description = "Cria uma nova assinatura para um cliente vinculada a um plano do sistema.")
    public ResponseEntity<SubscriptionResponse> create(
            @Valid @RequestBody CreateSubscriptionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.create(request));
    }

    @GetMapping
    @Operation(summary = "Listar Assinaturas", description = "Retorna uma lista paginada de todas as assinaturas. É possível filtrar por status, ID do cliente ou ID do plano.")
    public ResponseEntity<PageResponse<SubscriptionResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Subscription.Status status,
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) UUID planId
    ) {
        return ResponseEntity.ok(subscriptionService.findAll(page, size, search, status, clientId, planId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Assinatura", description = "Retorna os detalhes completos de uma assinatura específica a partir do seu ID.")
    public ResponseEntity<SubscriptionResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.findById(id));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancelar Assinatura", description = "Muda o status de uma assinatura ativa para cancelada, interrompendo futuras cobranças.")
    public ResponseEntity<SubscriptionResponse> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.cancel(id));
    }

    @PatchMapping("/{id}/reactivate")
    @Operation(summary = "Reativar Assinatura", description = "Retoma uma assinatura que estava cancelada, reativando o ciclo de cobranças.")
    public ResponseEntity<SubscriptionResponse> reactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.reactivate(id));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Pay Subscription", description = "Registra o pagamento manual de uma assinatura.")
    public ResponseEntity<SubscriptionResponse> pay(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.pay(id));
    }

    @GetMapping("/{id}/cycles")
    @Operation(summary = "Listar Ciclos", description = "Retorna todo o histórico de faturas e ciclos de cobrança gerados para essa assinatura.")
    public ResponseEntity<List<SubscriptionCycleResponse>> findCycles(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.findCycles(id));
    }
}


