package com.matheushenrique.nexum.integration;

import com.matheushenrique.nexum.config.IntegrationTestBase;
import com.matheushenrique.nexum.dtos.request.CreateSubscriptionRequest;
import com.matheushenrique.nexum.entities.*;
import com.matheushenrique.nexum.repositories.ClientRepository;
import com.matheushenrique.nexum.repositories.PlanRepository;
import com.matheushenrique.nexum.repositories.SubscriptionCycleRepository;
import com.matheushenrique.nexum.repositories.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("SubscriptionController IT")
class SubscriptionControllerIT extends IntegrationTestBase {

    @Autowired private SubscriptionRepository subscriptionRepository;
    @Autowired private SubscriptionCycleRepository cycleRepository;
    @Autowired private ClientRepository clientRepository;
    @Autowired private PlanRepository planRepository;

    private Client client;
    private Plan plan;

    @BeforeEach
    void setUpEntities() {
        User owner = new User();
        owner.setId(authenticatedUserId);

        client = clientRepository.save(Client.builder()
                .name("João Silva")
                .email("joao@nexum.dev")
                .active(true)
                .owner(owner)
                .build());

        plan = planRepository.save(Plan.builder()
                .name("Plano Basic Mensal")
                .amountCents(9990)
                .recurrence(Plan.Recurrence.MONTHLY)
                .trialDays(0)
                .active(true)
                .owner(owner)
                .build());
    }

    private Subscription createSubscription(Subscription.Status status) {
        User owner = new User();
        owner.setId(authenticatedUserId);

        Subscription subscription = subscriptionRepository.save(Subscription.builder()
                .owner(owner)
                .client(client)
                .plan(plan)
                .status(status)
                .startDate(LocalDate.now())
                .nextDueDate(LocalDate.now().plusMonths(1))
                .build());

        cycleRepository.save(SubscriptionCycle.builder()
                .subscription(subscription)
                .dueDate(LocalDate.now().plusMonths(1))
                .amountCents(plan.getAmountCents())
                .status(SubscriptionCycle.CycleStatus.PENDING)
                .build());

        return subscription;
    }

    // POST /v1/subscriptions

    @Nested
    @DisplayName("POST /v1/subscriptions")
    class Create {

        @Test
        @DisplayName("should create subscription and return 201")
        void shouldCreateSubscription() throws Exception {
            var request = new CreateSubscriptionRequest(
                    client.getId(), plan.getId(), LocalDate.now()
            );

            mockMvc.perform(post("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.clientId").value(client.getId().toString()))
                    .andExpect(jsonPath("$.planId").value(plan.getId().toString()))
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.nextDueDate").isNotEmpty());
        }

        @Test
        @DisplayName("should create first cycle on subscription creation")
        void shouldCreateFirstCycle() throws Exception {
            var request = new CreateSubscriptionRequest(
                    client.getId(), plan.getId(), LocalDate.now()
            );

            mockMvc.perform(post("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isCreated());

            var subscriptions = subscriptionRepository.findAll();
            var cycles = cycleRepository.findBySubscriptionIdOrderByDueDateDesc(
                    subscriptions.get(0).getId()
            );

            org.assertj.core.api.Assertions.assertThat(cycles).hasSize(1);
            org.assertj.core.api.Assertions.assertThat(cycles.get(0).getAmountCents()).isEqualTo(9990);
            org.assertj.core.api.Assertions.assertThat(cycles.get(0).getStatus())
                    .isEqualTo(SubscriptionCycle.CycleStatus.PENDING);
        }

        @Test
        @DisplayName("should return 409 for duplicate active subscription")
        void shouldReturn409ForDuplicate() throws Exception {
            createSubscription(Subscription.Status.ACTIVE);

            var request = new CreateSubscriptionRequest(
                    client.getId(), plan.getId(), LocalDate.now()
            );

            mockMvc.perform(post("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 404 for unknown client")
        void shouldReturn404ForUnknownClient() throws Exception {
            var request = new CreateSubscriptionRequest(
                    UUID.randomUUID(), plan.getId(), LocalDate.now()
            );

            mockMvc.perform(post("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 404 for unknown plan")
        void shouldReturn404ForUnknownPlan() throws Exception {
            var request = new CreateSubscriptionRequest(
                    client.getId(), UUID.randomUUID(), LocalDate.now()
            );

            mockMvc.perform(post("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 409 when plan is inactive")
        void shouldReturn409WhenPlanInactive() throws Exception {
            plan.setActive(false);
            planRepository.save(plan);

            var request = new CreateSubscriptionRequest(
                    client.getId(), plan.getId(), LocalDate.now()
            );

            mockMvc.perform(post("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 400 for invalid request body")
        void shouldReturn400ForInvalidBody() throws Exception {
            var request = new CreateSubscriptionRequest(null, null, null);

            mockMvc.perform(post("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            var request = new CreateSubscriptionRequest(
                    client.getId(), plan.getId(), LocalDate.now()
            );

            mockMvc.perform(post("/v1/subscriptions")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    // GET /v1/subscriptions

    @Nested
    @DisplayName("GET /v1/subscriptions")
    class FindAll {

        @Test
        @DisplayName("should return paginated list of subscriptions")
        void shouldReturnPaginatedSubscriptions() throws Exception {
            createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(get("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].status").value("ACTIVE"));
        }

        @Test
        @DisplayName("should filter by status ACTIVE")
        void shouldFilterByStatusActive() throws Exception {
            createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(get("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .param("status", "ACTIVE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("should filter by clientId")
        void shouldFilterByClientId() throws Exception {
            createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(get("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .param("clientId", client.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].clientId").value(client.getId().toString()));
        }

        @Test
        @DisplayName("should filter by planId")
        void shouldFilterByPlanId() throws Exception {
            createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(get("/v1/subscriptions")
                            .header("Authorization", bearer())
                            .param("planId", plan.getId().toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].planId").value(plan.getId().toString()));
        }

        @Test
        @DisplayName("should return empty list when no subscriptions exist")
        void shouldReturnEmptyList() throws Exception {
            mockMvc.perform(get("/v1/subscriptions")
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("should not return subscriptions from other owners")
        void shouldNotReturnOtherOwnerSubscriptions() throws Exception {
            User otherOwner = userRepository.save(User.builder()
                    .name("Other Owner")
                    .email("other@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(true)
                    .build());

            Client otherClient = clientRepository.save(Client.builder()
                    .name("Other Client")
                    .email("otherclient@nexum.dev")
                    .active(true)
                    .owner(otherOwner)
                    .build());

            Plan otherPlan = planRepository.save(Plan.builder()
                    .name("Other Plan")
                    .amountCents(9990)
                    .recurrence(Plan.Recurrence.MONTHLY)
                    .trialDays(0)
                    .active(true)
                    .owner(otherOwner)
                    .build());

            subscriptionRepository.save(Subscription.builder()
                    .owner(otherOwner)
                    .client(otherClient)
                    .plan(otherPlan)
                    .status(Subscription.Status.ACTIVE)
                    .startDate(LocalDate.now())
                    .nextDueDate(LocalDate.now().plusMonths(1))
                    .build());

            mockMvc.perform(get("/v1/subscriptions")
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(get("/v1/subscriptions"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // GET /v1/subscriptions/:id

    @Nested
    @DisplayName("GET /v1/subscriptions/:id")
    class FindById {

        @Test
        @DisplayName("should return subscription by id")
        void shouldReturnSubscriptionById() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(get("/v1/subscriptions/{id}", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(subscription.getId().toString()))
                    .andExpect(jsonPath("$.status").value("ACTIVE"))
                    .andExpect(jsonPath("$.clientName").value("João Silva"))
                    .andExpect(jsonPath("$.planName").value("Plano Basic Mensal"));
        }

        @Test
        @DisplayName("should return 404 for unknown subscription")
        void shouldReturn404ForUnknownSubscription() throws Exception {
            mockMvc.perform(get("/v1/subscriptions/{id}", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(get("/v1/subscriptions/{id}", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }

    // PATCH /v1/subscriptions/:id/cancel

    @Nested
    @DisplayName("PATCH /v1/subscriptions/:id/cancel")
    class Cancel {

        @Test
        @DisplayName("should cancel active subscription")
        void shouldCancelActiveSubscription() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(patch("/v1/subscriptions/{id}/cancel", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CANCELLED"))
                    .andExpect(jsonPath("$.cancelledAt").isNotEmpty());
        }

        @Test
        @DisplayName("should return 409 when subscription is already cancelled")
        void shouldReturn409WhenAlreadyCancelled() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.CANCELLED);

            mockMvc.perform(patch("/v1/subscriptions/{id}/cancel", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 404 for unknown subscription")
        void shouldReturn404ForUnknownSubscription() throws Exception {
            mockMvc.perform(patch("/v1/subscriptions/{id}/cancel", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(patch("/v1/subscriptions/{id}/cancel", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }

    // PATCH /v1/subscriptions/:id/reactivate

    @Nested
    @DisplayName("PATCH /v1/subscriptions/:id/reactivate")
    class Reactivate {

        @Test
        @DisplayName("should reactivate cancelled subscription")
        void shouldReactivateCancelledSubscription() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.CANCELLED);

            mockMvc.perform(patch("/v1/subscriptions/{id}/reactivate", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("REACTIVATED"))
                    .andExpect(jsonPath("$.cancelledAt").doesNotExist());
        }

        @Test
        @DisplayName("should create new cycle on reactivation")
        void shouldCreateNewCycleOnReactivation() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.CANCELLED);

            long cyclesBefore = cycleRepository
                    .findBySubscriptionIdOrderByDueDateDesc(subscription.getId()).size();

            mockMvc.perform(patch("/v1/subscriptions/{id}/reactivate", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk());

            long cyclesAfter = cycleRepository
                    .findBySubscriptionIdOrderByDueDateDesc(subscription.getId()).size();

            org.assertj.core.api.Assertions.assertThat(cyclesAfter).isEqualTo(cyclesBefore + 1);
        }

        @Test
        @DisplayName("should return 409 when subscription is not cancelled")
        void shouldReturn409WhenNotCancelled() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(patch("/v1/subscriptions/{id}/reactivate", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 404 for unknown subscription")
        void shouldReturn404ForUnknownSubscription() throws Exception {
            mockMvc.perform(patch("/v1/subscriptions/{id}/reactivate", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(patch("/v1/subscriptions/{id}/reactivate", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }

    // GET /v1/subscriptions/:id/cycles

    @Nested
    @DisplayName("GET /v1/subscriptions/:id/cycles")
    class FindCycles {

        @Test
        @DisplayName("should return cycles for subscription")
        void shouldReturnCycles() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.ACTIVE);

            mockMvc.perform(get("/v1/subscriptions/{id}/cycles", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].amountCents").value(9990))
                    .andExpect(jsonPath("$[0].status").value("PENDING"));
        }

        @Test
        @DisplayName("should return two cycles after reactivation")
        void shouldReturnTwoCyclesAfterReactivation() throws Exception {
            Subscription subscription = createSubscription(Subscription.Status.CANCELLED);

            mockMvc.perform(patch("/v1/subscriptions/{id}/reactivate", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/v1/subscriptions/{id}/cycles", subscription.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)));
        }

        @Test
        @DisplayName("should return 404 for unknown subscription")
        void shouldReturn404ForUnknownSubscription() throws Exception {
            mockMvc.perform(get("/v1/subscriptions/{id}/cycles", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(get("/v1/subscriptions/{id}/cycles", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }
}