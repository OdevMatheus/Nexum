package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.request.CreatePlanRequest;
import com.matheushenrique.nexum.dtos.request.UpdatePlanRequest;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.dtos.response.PlanResponse;
import com.matheushenrique.nexum.services.impl.PlanServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/plans")
@RequiredArgsConstructor
@ApiGlobalErrors
@SecurityRequirement(name = "bearer-key")
@Tag(name = "2. Planos", description = "Gerenciamento de planos de assinatura oferecidos no sistema")
public class PlanController {

    private final PlanServiceImpl planService;

    @GetMapping
    @Operation(summary = "Listar Planos", description = "Retorna uma lista paginada de todos os planos. É possível filtrar resultados usando os parâmetros 'search' e 'active'.")
    public ResponseEntity<PageResponse<PlanResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(planService.findAll(page, size, search, active));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar Plano", description = "Retorna os detalhes completos de um plano específico a partir do seu ID.")
    public ResponseEntity<PlanResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Criar Plano", description = "Cadastra um novo plano de assinatura no sistema (ex: Mensal, Anual, Customizado).")
    public ResponseEntity<PlanResponse> create(@Valid @RequestBody CreatePlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar Plano", description = "Edita as informações principais de um plano existente.")
    public ResponseEntity<PlanResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePlanRequest request
    ) {
        return ResponseEntity.ok(planService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Alternar Status", description = "Ativa ou inativa (arquiva) um plano específico. Planos inativos não podem receber novas assinaturas.")
    public ResponseEntity<PlanResponse> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.toggleStatus(id));
    }
}