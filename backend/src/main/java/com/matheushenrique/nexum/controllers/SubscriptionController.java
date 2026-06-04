package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.dtos.request.CreateSubscriptionRequest;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.dtos.response.SubscriptionCycleResponse;
import com.matheushenrique.nexum.dtos.response.SubscriptionResponse;
import com.matheushenrique.nexum.entities.Subscription;
import com.matheushenrique.nexum.services.impl.SubscriptionServiceImpl;
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
public class SubscriptionController {

    private final SubscriptionServiceImpl subscriptionService;

    @PostMapping
    public ResponseEntity<SubscriptionResponse> create(
            @Valid @RequestBody CreateSubscriptionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subscriptionService.create(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<SubscriptionResponse>> findAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Subscription.Status status,
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) UUID planId
    ) {
        return ResponseEntity.ok(subscriptionService.findAll(page, size, status, clientId, planId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.findById(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SubscriptionResponse> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.cancel(id));
    }

    @PatchMapping("/{id}/reactivate")
    public ResponseEntity<SubscriptionResponse> reactivate(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.reactivate(id));
    }

    @GetMapping("/{id}/cycles")
    public ResponseEntity<List<SubscriptionCycleResponse>> findCycles(@PathVariable UUID id) {
        return ResponseEntity.ok(subscriptionService.findCycles(id));
    }
}


