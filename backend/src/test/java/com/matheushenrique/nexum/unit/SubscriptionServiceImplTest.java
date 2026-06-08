package com.matheushenrique.nexum.unit;

import com.matheushenrique.nexum.dtos.request.CreateSubscriptionRequest;
import com.matheushenrique.nexum.entities.*;
import com.matheushenrique.nexum.messaging.SubscriptionEventProducer;
import com.matheushenrique.nexum.repositories.ClientRepository;
import com.matheushenrique.nexum.repositories.PlanRepository;
import com.matheushenrique.nexum.repositories.SubscriptionCycleRepository;
import com.matheushenrique.nexum.repositories.SubscriptionRepository;
import com.matheushenrique.nexum.security.exceptions.ClientNotFoundException;
import com.matheushenrique.nexum.security.exceptions.PlanNotFoundException;
import com.matheushenrique.nexum.security.exceptions.SubscriptionNotFoundException;
import com.matheushenrique.nexum.services.impl.SubscriptionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubscriptionServiceImpl")
class SubscriptionServiceImplTest {

    @Mock private SubscriptionRepository subscriptionRepository;
    @Mock private SubscriptionCycleRepository cycleRepository;
    @Mock private ClientRepository clientRepository;
    @Mock private PlanRepository planRepository;
    @Mock private SubscriptionEventProducer eventProducer;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    private final UUID ownerId      = UUID.randomUUID();
    private final UUID clientId     = UUID.randomUUID();
    private final UUID planId       = UUID.randomUUID();
    private final UUID subscriptionId = UUID.randomUUID();

    private User owner;
    private Client client;
    private Plan monthlyPlan;
    private Subscription activeSubscription;
    private Subscription cancelledSubscription;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(ownerId)
                .name("Owner")
                .email("owner@example.com")
                .passwordHash("hash")
                .build();

        client = Client.builder()
                .id(clientId)
                .name("João Silva")
                .email("joao@example.com")
                .active(true)
                .owner(owner)
                .build();

        monthlyPlan = Plan.builder()
                .id(planId)
                .owner(owner)
                .name("Plano Basic Mensal")
                .amountCents(9990)
                .recurrence(Plan.Recurrence.MONTHLY)
                .trialDays(0)
                .active(true)
                .build();

        activeSubscription = Subscription.builder()
                .id(subscriptionId)
                .owner(owner)
                .client(client)
                .plan(monthlyPlan)
                .status(Subscription.Status.ACTIVE)
                .startDate(LocalDate.now())
                .nextDueDate(LocalDate.now().plusMonths(1))
                .build();

        cancelledSubscription = Subscription.builder()
                .id(subscriptionId)
                .owner(owner)
                .client(client)
                .plan(monthlyPlan)
                .status(Subscription.Status.CANCELLED)
                .startDate(LocalDate.now().minusMonths(1))
                .nextDueDate(LocalDate.now())
                .build();

        UserDetails userDetailsMock = mock(UserDetails.class);
        when(userDetailsMock.getUsername()).thenReturn(ownerId.toString());
        when(authentication.getPrincipal()).thenReturn(userDetailsMock);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    // create

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("should create subscription and first cycle successfully")
        void shouldCreateSubscriptionSuccessfully() {
            var request = new CreateSubscriptionRequest(clientId, planId, LocalDate.now());

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(subscriptionRepository.existsByClientIdAndPlanIdAndStatusNotIn(eq(clientId), eq(planId), any()))
                    .thenReturn(false);
            when(subscriptionRepository.save(any(Subscription.class))).thenAnswer(i -> {
                Subscription s = i.getArgument(0);
                s.setId(subscriptionId);
                return s;
            });
            when(cycleRepository.save(any(SubscriptionCycle.class))).thenAnswer(i -> i.getArgument(0));

            var response = subscriptionService.create(request);

            assertThat(response.clientId()).isEqualTo(clientId);
            assertThat(response.planId()).isEqualTo(planId);
            assertThat(response.status()).isEqualTo(Subscription.Status.ACTIVE);
            assertThat(response.nextDueDate()).isEqualTo(LocalDate.now().plusMonths(1));
            verify(subscriptionRepository).save(any(Subscription.class));
            verify(cycleRepository).save(any(SubscriptionCycle.class));
            verify(eventProducer).publishStatusChanged(any());
        }

        @Test
        @DisplayName("should throw ClientNotFoundException when client does not belong to owner")
        void shouldThrowWhenClientNotFound() {
            var request = new CreateSubscriptionRequest(clientId, planId, LocalDate.now());

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> subscriptionService.create(request))
                    .isInstanceOf(ClientNotFoundException.class);

            verify(subscriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw PlanNotFoundException when plan does not belong to owner")
        void shouldThrowWhenPlanNotFound() {
            var request = new CreateSubscriptionRequest(clientId, planId, LocalDate.now());

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> subscriptionService.create(request))
                    .isInstanceOf(PlanNotFoundException.class);

            verify(subscriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw IllegalStateException when plan is inactive")
        void shouldThrowWhenPlanInactive() {
            monthlyPlan.setActive(false);
            var request = new CreateSubscriptionRequest(clientId, planId, LocalDate.now());

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));

            assertThatThrownBy(() -> subscriptionService.create(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("not active");

            verify(subscriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw IllegalStateException when active subscription already exists")
        void shouldThrowWhenDuplicateSubscription() {
            var request = new CreateSubscriptionRequest(clientId, planId, LocalDate.now());

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(clientId, ownerId))
                    .thenReturn(Optional.of(client));
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(subscriptionRepository.existsByClientIdAndPlanIdAndStatusNotIn(eq(clientId), eq(planId), any()))
                    .thenReturn(true);

            assertThatThrownBy(() -> subscriptionService.create(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("already has an active subscription");

            verify(subscriptionRepository, never()).save(any());
        }

        @Test
        @DisplayName("should calculate nextDueDate correctly for each recurrence type")
        void shouldCalculateNextDueDateCorrectly() {
            LocalDate start = LocalDate.of(2026, 6, 1);

            Plan quarterlyPlan = Plan.builder()
                    .id(UUID.randomUUID()).owner(owner).name("Trimestral")
                    .amountCents(2990).recurrence(Plan.Recurrence.QUARTERLY)
                    .trialDays(0).active(true).build();

            Plan annualPlan = Plan.builder()
                    .id(UUID.randomUUID()).owner(owner).name("Anual")
                    .amountCents(9900).recurrence(Plan.Recurrence.ANNUAL)
                    .trialDays(0).active(true).build();

            Plan customPlan = Plan.builder()
                    .id(UUID.randomUUID()).owner(owner).name("Custom 30")
                    .amountCents(5000).recurrence(Plan.Recurrence.CUSTOM)
                    .customDays(30).trialDays(0).active(true).build();

            var requestQuarterly = new CreateSubscriptionRequest(clientId, quarterlyPlan.getId(), start);
            var requestAnnual    = new CreateSubscriptionRequest(clientId, annualPlan.getId(), start);
            var requestCustom    = new CreateSubscriptionRequest(clientId, customPlan.getId(), start);

            when(clientRepository.findByIdAndActiveTrueAndOwnerId(any(), eq(ownerId)))
                    .thenReturn(Optional.of(client));
            when(subscriptionRepository.existsByClientIdAndPlanIdAndStatusNotIn(any(), any(), any()))
                    .thenReturn(false);
            when(subscriptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(cycleRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            when(planRepository.findByIdAndOwnerId(quarterlyPlan.getId(), ownerId))
                    .thenReturn(Optional.of(quarterlyPlan));
            var r1 = subscriptionService.create(requestQuarterly);
            assertThat(r1.nextDueDate()).isEqualTo(start.plusMonths(3));

            when(planRepository.findByIdAndOwnerId(annualPlan.getId(), ownerId))
                    .thenReturn(Optional.of(annualPlan));
            var r2 = subscriptionService.create(requestAnnual);
            assertThat(r2.nextDueDate()).isEqualTo(start.plusYears(1));

            when(planRepository.findByIdAndOwnerId(customPlan.getId(), ownerId))
                    .thenReturn(Optional.of(customPlan));
            var r3 = subscriptionService.create(requestCustom);
            assertThat(r3.nextDueDate()).isEqualTo(start.plusDays(30));
        }
    }

    // findAll

    @Nested
    @DisplayName("findAll")
    class FindAll {

        @Test
        @DisplayName("should return paginated list of subscriptions")
        void shouldReturnPaginatedSubscriptions() {
            var page = new PageImpl<>(List.of(activeSubscription));
            when(subscriptionRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class)))
                    .thenReturn(page);

            var response = subscriptionService.findAll(0, 10, null, null, null, null, null, null, null, null);

            assertThat(response.content()).hasSize(1);
            assertThat(response.content().get(0).status()).isEqualTo(Subscription.Status.ACTIVE);
        }

        @Test
        @DisplayName("should filter by status")
        void shouldFilterByStatus() {
            var page = new PageImpl<>(List.of(activeSubscription));
            when(subscriptionRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class)))
                    .thenReturn(page);

            var response = subscriptionService.findAll(0, 10, null, Subscription.Status.ACTIVE, null, null, null, null, null, null);

            assertThat(response.content()).hasSize(1);
            verify(subscriptionRepository).findAll(
                    any(org.springframework.data.jpa.domain.Specification.class), any(Pageable.class)
            );
        }
    }

    // findById

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("should return subscription when found")
        void shouldReturnSubscriptionWhenFound() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.of(activeSubscription));

            var response = subscriptionService.findById(subscriptionId);

            assertThat(response.id()).isEqualTo(subscriptionId);
            assertThat(response.status()).isEqualTo(Subscription.Status.ACTIVE);
        }

        @Test
        @DisplayName("should throw SubscriptionNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> subscriptionService.findById(subscriptionId))
                    .isInstanceOf(SubscriptionNotFoundException.class);
        }
    }

    // cancel

    @Nested
    @DisplayName("cancel")
    class Cancel {

        @Test
        @DisplayName("should cancel active subscription")
        void shouldCancelActiveSubscription() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.of(activeSubscription));
            when(subscriptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            var response = subscriptionService.cancel(subscriptionId);

            assertThat(response.status()).isEqualTo(Subscription.Status.CANCELLED);
            assertThat(activeSubscription.getCancelledAt()).isNotNull();
            verify(eventProducer).publishStatusChanged(any());
        }

        @Test
        @DisplayName("should throw SubscriptionNotFoundException when subscription does not exist")
        void shouldThrowWhenNotFound() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> subscriptionService.cancel(subscriptionId))
                    .isInstanceOf(SubscriptionNotFoundException.class);
        }

        @Test
        @DisplayName("should throw IllegalStateException when subscription is already cancelled")
        void shouldThrowWhenAlreadyCancelled() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.of(cancelledSubscription));

            assertThatThrownBy(() -> subscriptionService.cancel(subscriptionId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("already cancelled");

            verify(subscriptionRepository, never()).save(any());
        }
    }

    // reactivate

    @Nested
    @DisplayName("reactivate")
    class Reactivate {

        @Test
        @DisplayName("should reactivate cancelled subscription and create new cycle")
        void shouldReactivateCancelledSubscription() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.of(cancelledSubscription));
            when(subscriptionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
            when(cycleRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            var response = subscriptionService.reactivate(subscriptionId);

            assertThat(response.status()).isEqualTo(Subscription.Status.REACTIVATED);
            assertThat(cancelledSubscription.getCancelledAt()).isNull();
            assertThat(cancelledSubscription.getNextDueDate()).isEqualTo(LocalDate.now().plusMonths(1));
            verify(cycleRepository).save(any(SubscriptionCycle.class));
            verify(eventProducer).publishStatusChanged(any());
        }

        @Test
        @DisplayName("should throw SubscriptionNotFoundException when subscription does not exist")
        void shouldThrowWhenNotFound() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> subscriptionService.reactivate(subscriptionId))
                    .isInstanceOf(SubscriptionNotFoundException.class);
        }

        @Test
        @DisplayName("should throw IllegalStateException when subscription is not cancelled")
        void shouldThrowWhenNotCancelled() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.of(activeSubscription));

            assertThatThrownBy(() -> subscriptionService.reactivate(subscriptionId))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("not cancelled");

            verify(subscriptionRepository, never()).save(any());
        }
    }

    // findCycles

    @Nested
    @DisplayName("findCycles")
    class FindCycles {

        @Test
        @DisplayName("should return cycles for a valid subscription")
        void shouldReturnCycles() {
            SubscriptionCycle cycle = SubscriptionCycle.builder()
                    .id(UUID.randomUUID())
                    .subscription(activeSubscription)
                    .dueDate(LocalDate.now().plusMonths(1))
                    .amountCents(9990)
                    .status(SubscriptionCycle.CycleStatus.PENDING)
                    .build();

            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.of(activeSubscription));
            when(cycleRepository.findBySubscriptionIdOrderByDueDateDesc(subscriptionId))
                    .thenReturn(List.of(cycle));

            var response = subscriptionService.findCycles(subscriptionId);

            assertThat(response).hasSize(1);
            assertThat(response.get(0).amountCents()).isEqualTo(9990);
            assertThat(response.get(0).status()).isEqualTo(SubscriptionCycle.CycleStatus.PENDING);
        }

        @Test
        @DisplayName("should throw SubscriptionNotFoundException for unknown subscription")
        void shouldThrowWhenSubscriptionNotFound() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> subscriptionService.findCycles(subscriptionId))
                    .isInstanceOf(SubscriptionNotFoundException.class);
        }

        @Test
        @DisplayName("should return empty list when subscription has no cycles")
        void shouldReturnEmptyListWhenNoCycles() {
            when(subscriptionRepository.findByIdAndOwnerId(subscriptionId, ownerId))
                    .thenReturn(Optional.of(activeSubscription));
            when(cycleRepository.findBySubscriptionIdOrderByDueDateDesc(subscriptionId))
                    .thenReturn(List.of());

            var response = subscriptionService.findCycles(subscriptionId);

            assertThat(response).isEmpty();
        }
    }
}