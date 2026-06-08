package com.matheushenrique.nexum.services.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matheushenrique.nexum.dtos.request.CreatePlanRequest;
import com.matheushenrique.nexum.dtos.request.UpdatePlanRequest;
import com.matheushenrique.nexum.dtos.response.MessageResponse;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.dtos.response.PlanResponse;
import com.matheushenrique.nexum.entities.Plan;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.PlanRepository;
import com.matheushenrique.nexum.security.exceptions.EmailAlreadyInUseException;
import com.matheushenrique.nexum.security.exceptions.PlanNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl {

    private final PlanRepository planRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private UUID getCurrentUserId() {
        UserDetails principal = (UserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal.getUsername());
    }

    private String serializeFeatures(List<String> features) {
        if (features == null || features.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(features);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<PlanResponse> findAll(int page, int size, String search, Boolean active) {
        UUID ownerId = getCurrentUserId();
        var pageable = PageRequest.of(page, size, Sort.by("active").descending().and(Sort.by("name").ascending()));
        var result = planRepository.findAllByOwner(ownerId, active, search == null || search.isBlank() ? null : search, pageable);
        return PageResponse.from(result.map(PlanResponse::from));
    }

    @Transactional(readOnly = true)
    public PlanResponse findById(UUID id) {
        UUID ownerId = getCurrentUserId();
        return planRepository.findByIdAndOwnerId(id, ownerId)
                .map(PlanResponse::from)
                .orElseThrow(() -> new PlanNotFoundException("Plan not found"));
    }

    @Transactional
    public PlanResponse create(CreatePlanRequest request) {
        UUID ownerId = getCurrentUserId();

        if (request.recurrence() == Plan.Recurrence.CUSTOM && request.customDays() == null) {
            throw new IllegalStateException("Custom days is required for CUSTOM recurrence");
        }

        if (planRepository.existsByNameAndActiveTrueAndOwnerId(request.name(), ownerId)) {
            throw new EmailAlreadyInUseException("A plan with this name already exists");
        }

        User owner = new User();
        owner.setId(ownerId);

        Plan plan = Plan.builder()
                .owner(owner)
                .name(request.name())
                .description(request.description())
                .amountCents(request.amountCents())
                .recurrence(request.recurrence())
                .customDays(request.customDays())
                .trialDays(request.trialDays() != null ? request.trialDays() : 0)
                .maxSubscriptions(request.maxSubscriptions())
                .features(serializeFeatures(request.features()))
                .build();

        return PlanResponse.from(planRepository.save(plan));
    }

    @Transactional
    public PlanResponse update(UUID id, UpdatePlanRequest request) {
        UUID ownerId = getCurrentUserId();

        Plan plan = planRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new PlanNotFoundException("Plan not found"));

        if (request.recurrence() == Plan.Recurrence.CUSTOM && request.customDays() == null) {
            throw new IllegalStateException("Custom days is required for CUSTOM recurrence");
        }

        if (planRepository.existsByNameAndActiveTrueAndIdNotAndOwnerId(request.name(), id, ownerId)) {
            throw new EmailAlreadyInUseException("A plan with this name already exists");
        }

        plan.setName(request.name());
        plan.setDescription(request.description());
        plan.setAmountCents(request.amountCents());
        plan.setRecurrence(request.recurrence());
        plan.setCustomDays(request.customDays());
        plan.setTrialDays(request.trialDays() != null ? request.trialDays() : 0);
        plan.setMaxSubscriptions(request.maxSubscriptions());
        plan.setFeatures(serializeFeatures(request.features()));

        return PlanResponse.from(planRepository.save(plan));
    }

    @Transactional
    public PlanResponse toggleStatus(UUID id) {
        UUID ownerId = getCurrentUserId();

        Plan plan = planRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new PlanNotFoundException("Plan not found"));

        if (plan.isActive()) {
            plan.setActive(false);
            plan.setArchivedAt(Instant.now());
        } else {
            if (planRepository.existsByNameAndActiveTrueAndOwnerId(plan.getName(), ownerId)) {
                throw new EmailAlreadyInUseException("A plan with this name is already active");
            }
            plan.setActive(true);
            plan.setArchivedAt(null);
        }

        return PlanResponse.from(planRepository.save(plan));
    }

    @Transactional
    public MessageResponse delete(UUID id) {
        UUID ownerId = getCurrentUserId();
        Plan plan = planRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new PlanNotFoundException("Plan not found"));
        plan.setActive(false);
        plan.setArchivedAt(Instant.now());
        planRepository.save(plan);
        return new MessageResponse("Plan archived successfully");
    }
}