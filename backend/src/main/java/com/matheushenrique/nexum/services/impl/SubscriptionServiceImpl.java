package com.matheushenrique.nexum.services.impl;

import com.matheushenrique.nexum.dtos.request.CreateSubscriptionRequest;
import com.matheushenrique.nexum.dtos.response.PageResponse;
import com.matheushenrique.nexum.dtos.response.SubscriptionCycleResponse;
import com.matheushenrique.nexum.dtos.response.SubscriptionResponse;
import com.matheushenrique.nexum.entities.Plan;
import com.matheushenrique.nexum.entities.Subscription;
import com.matheushenrique.nexum.entities.SubscriptionCycle;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.messaging.SubscriptionEventProducer;
import com.matheushenrique.nexum.messaging.events.SubscriptionStatusChangedEvent;
import com.matheushenrique.nexum.repositories.ClientRepository;
import com.matheushenrique.nexum.repositories.PlanRepository;
import com.matheushenrique.nexum.repositories.SubscriptionCycleRepository;
import com.matheushenrique.nexum.repositories.SubscriptionRepository;
import com.matheushenrique.nexum.security.exceptions.ClientNotFoundException;
import com.matheushenrique.nexum.security.exceptions.PlanNotFoundException;
import com.matheushenrique.nexum.security.exceptions.SubscriptionNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionCycleRepository cycleRepository;
    private final ClientRepository clientRepository;
    private final PlanRepository planRepository;
    private final SubscriptionEventProducer eventProducer;

    // create

    @Transactional
    public SubscriptionResponse create(CreateSubscriptionRequest request) {
        var owner = authenticatedUser();

        var client = clientRepository.findByIdAndActiveTrueAndOwnerId(request.clientId(), owner.getId()).orElseThrow(() -> new ClientNotFoundException("Client not found"));

        var plan = planRepository.findByIdAndOwnerId(request.planId(), owner.getId()).orElseThrow(() -> new PlanNotFoundException("Plan not found"));

        if (!plan.isActive()) {
            throw new IllegalStateException("Plan is not active");
        }

        boolean alreadyExists = subscriptionRepository.existsByClientIdAndPlanIdAndStatusNotIn(
                client.getId(),
                plan.getId(),
                List.of(Subscription.Status.CANCELLED)
        );

        if (alreadyExists) {
            throw new IllegalStateException("Client already has an active subscription for this plan");
        }

        LocalDate startDate = request.startDate();
        LocalDate nextDueDate = calculateNextDueDate(startDate, plan);
        
        Subscription.Status initialStatus = plan.getTrialDays() > 0 ? Subscription.Status.TRIAL : Subscription.Status.ACTIVE;

        var subscription = Subscription.builder()
                .owner(owner)
                .client(client)
                .plan(plan)
                .status(initialStatus)
                .startDate(startDate)
                .nextDueDate(nextDueDate)
                .build();

        subscriptionRepository.save(subscription);

        createCycle(subscription, nextDueDate, plan.getAmountCents());

        publishEvent(null, initialStatus, subscription);

        return SubscriptionResponse.from(subscription);
    }

    // read

    public PageResponse<SubscriptionResponse> findAll(
            int page, int size,
            String search,
            Subscription.Status status,
            UUID clientId,
            UUID planId,
            LocalDate startDateFrom,
            LocalDate startDateTo,
            LocalDate nextDueDateFrom,
            LocalDate nextDueDateTo
    ) {
        var owner = authenticatedUser();
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        var spec = org.springframework.data.jpa.domain.Specification.where(com.matheushenrique.nexum.repositories.specifications.SubscriptionSpecification.hasOwner(owner.getId()));

        if (search != null && !search.isBlank()) {
            spec = spec.and(com.matheushenrique.nexum.repositories.specifications.SubscriptionSpecification.searchByClientName(search));
        }
        if (status != null) {
            spec = spec.and(com.matheushenrique.nexum.repositories.specifications.SubscriptionSpecification.hasStatus(status));
        }
        if (clientId != null) {
            spec = spec.and(com.matheushenrique.nexum.repositories.specifications.SubscriptionSpecification.hasClient(clientId));
        }
        if (planId != null) {
            spec = spec.and(com.matheushenrique.nexum.repositories.specifications.SubscriptionSpecification.hasPlan(planId));
        }
        if (startDateFrom != null || startDateTo != null) {
            spec = spec.and(com.matheushenrique.nexum.repositories.specifications.SubscriptionSpecification.startDateBetween(startDateFrom, startDateTo));
        }
        if (nextDueDateFrom != null || nextDueDateTo != null) {
            spec = spec.and(com.matheushenrique.nexum.repositories.specifications.SubscriptionSpecification.nextDueDateBetween(nextDueDateFrom, nextDueDateTo));
        }

        Page<Subscription> result = subscriptionRepository.findAll(spec, pageable);

        return PageResponse.from(result.map(SubscriptionResponse::from));
    }

    public SubscriptionResponse findById(UUID id) {
        var owner = authenticatedUser();
        var subscription = subscriptionRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(SubscriptionNotFoundException::new);

        return SubscriptionResponse.from(subscription);
    }

    // cancel

    @Transactional
    public SubscriptionResponse cancel(UUID id) {
        var owner = authenticatedUser();
        var subscription = subscriptionRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(SubscriptionNotFoundException::new);

        if (subscription.getStatus() == Subscription.Status.CANCELLED) {
            throw new IllegalStateException("Subscription is already cancelled");
        }

        var previous = subscription.getStatus();

        subscription.setStatus(Subscription.Status.CANCELLED);
        subscription.setCancelledAt(Instant.now());
        subscriptionRepository.save(subscription);

        publishEvent(previous, Subscription.Status.CANCELLED, subscription);

        return SubscriptionResponse.from(subscription);
    }

    // reactivate

    @Transactional
    public SubscriptionResponse reactivate(UUID id) {
        var owner = authenticatedUser();
        var subscription = subscriptionRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(SubscriptionNotFoundException::new);

        if (subscription.getStatus() != Subscription.Status.CANCELLED) {
            throw new IllegalStateException("Subscription is not cancelled");
        }

        LocalDate today = LocalDate.now();
        LocalDate nextDueDate = calculateNextDueDate(today, subscription.getPlan());

        subscription.setStatus(Subscription.Status.REACTIVATED);
        subscription.setStartDate(today);
        subscription.setNextDueDate(nextDueDate);
        subscription.setCancelledAt(null);
        subscriptionRepository.save(subscription);

        createCycle(subscription, nextDueDate, subscription.getPlan().getAmountCents());

        publishEvent(Subscription.Status.CANCELLED, Subscription.Status.REACTIVATED, subscription);

        return SubscriptionResponse.from(subscription);
    }

    // reactivate

    @Transactional
    public SubscriptionResponse pay(UUID subscriptionId) {
        var owner = authenticatedUser();
        var subscription = subscriptionRepository.findByIdAndOwnerId(subscriptionId, owner.getId())
                .orElseThrow(SubscriptionNotFoundException::new);

        if (subscription.getStatus() == Subscription.Status.CANCELLED) {
            throw new IllegalStateException("Cannot pay a cancelled subscription");
        }

        var cycle = cycleRepository.findTopBySubscriptionIdAndStatusInOrderByDueDateAsc(
                subscriptionId,
                List.of(SubscriptionCycle.CycleStatus.PENDING, SubscriptionCycle.CycleStatus.OVERDUE)
        ).orElseThrow(() -> new IllegalStateException("No pending or overdue cycle found for this subscription"));

        cycle.setStatus(SubscriptionCycle.CycleStatus.PAID);
        cycle.setPaidAt(Instant.now());
        cycleRepository.save(cycle);

        var previousStatus = subscription.getStatus();
        if (previousStatus == Subscription.Status.OVERDUE || previousStatus == Subscription.Status.SUSPENDED || previousStatus == Subscription.Status.TRIAL) {
            subscription.setStatus(Subscription.Status.ACTIVE);
        }

        LocalDate newNextDueDate = calculateNextDueDate(subscription.getNextDueDate(), subscription.getPlan());
        subscription.setNextDueDate(newNextDueDate);
        subscriptionRepository.save(subscription);

        createCycle(subscription, newNextDueDate, subscription.getPlan().getAmountCents());

        if (previousStatus != subscription.getStatus()) {
            publishEvent(previousStatus, subscription.getStatus(), subscription);
        }

        return SubscriptionResponse.from(subscription);
    }

    // Ciclos

    public List<SubscriptionCycleResponse> findCycles(UUID subscriptionId) {
        var owner = authenticatedUser();

        subscriptionRepository.findByIdAndOwnerId(subscriptionId, owner.getId())
                .orElseThrow(SubscriptionNotFoundException::new);

        return cycleRepository
                .findBySubscriptionIdOrderByDueDateDesc(subscriptionId)
                .stream()
                .map(SubscriptionCycleResponse::from)
                .toList();
    }

    // Helpers

    private LocalDate calculateNextDueDate(LocalDate from, Plan plan) {
        if (plan.getTrialDays() > 0) {
            return from.plusDays(plan.getTrialDays());
        }
        return switch (plan.getRecurrence()) {
            case MONTHLY    -> from.plusMonths(1);
            case QUARTERLY  -> from.plusMonths(3);
            case SEMIANNUAL -> from.plusMonths(6);
            case ANNUAL     -> from.plusYears(1);
            case CUSTOM     -> from.plusDays(plan.getCustomDays());
        };
    }

    private void createCycle(Subscription subscription, LocalDate dueDate, int amountCents) {
        var cycle = SubscriptionCycle.builder()
                .subscription(subscription)
                .dueDate(dueDate)
                .amountCents(amountCents)
                .status(SubscriptionCycle.CycleStatus.PENDING)
                .build();

        cycleRepository.save(cycle);
    }

    private void publishEvent(Subscription.Status previous, Subscription.Status next, Subscription s) {
        var event = new SubscriptionStatusChangedEvent(
                s.getId(),
                s.getOwner().getId(),
                s.getClient().getId(),
                s.getClient().getName(),
                s.getClient().getEmail(),
                s.getPlan().getName(),
                previous != null ? previous.name() : null,
                next.name(),
                Instant.now()
        );

        eventProducer.publishStatusChanged(event);
    }

    private User authenticatedUser() {
        UserDetails principal = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = new User();
        user.setId(UUID.fromString(principal.getUsername()));
        return user;
    }
}