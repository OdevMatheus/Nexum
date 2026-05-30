package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.dtos.request.CreatePlanRequest;
import com.matheushenrique.nexum.dtos.request.UpdatePlanRequest;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.dtos.response.PlanResponse;
import com.matheushenrique.nexum.services.impl.PlanServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/plans")
@RequiredArgsConstructor
public class PlanController {

    private final PlanServiceImpl planService;

    @GetMapping
    public ResponseEntity<PageResponse<PlanResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(planService.findAll(page, size, search, active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PlanResponse> create(@Valid @RequestBody CreatePlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePlanRequest request
    ) {
        return ResponseEntity.ok(planService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PlanResponse> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.toggleStatus(id));
    }
}