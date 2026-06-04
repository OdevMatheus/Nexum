package com.matheushenrique.nexum.integration;

import com.matheushenrique.nexum.config.IntegrationTestBase;
import com.matheushenrique.nexum.dtos.request.CreatePlanRequest;
import com.matheushenrique.nexum.dtos.request.UpdatePlanRequest;
import com.matheushenrique.nexum.entities.Plan;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.PlanRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("PlanController IT")
class PlanControllerIT extends IntegrationTestBase {

    @Autowired private PlanRepository planRepository;

    private Plan createPlan(String name, int amountCents, Plan.Recurrence recurrence) {
        User owner = new User();
        owner.setId(authenticatedUserId);

        return planRepository.save(Plan.builder()
                .name(name)
                .description("Descrição do plano")
                .amountCents(amountCents)
                .recurrence(recurrence)
                .trialDays(0)
                .active(true)
                .owner(owner)
                .build());
    }

    private Plan createCustomPlan(String name, int amountCents, int customDays) {
        User owner = new User();
        owner.setId(authenticatedUserId);

        return planRepository.save(Plan.builder()
                .name(name)
                .amountCents(amountCents)
                .recurrence(Plan.Recurrence.CUSTOM)
                .customDays(customDays)
                .trialDays(0)
                .active(true)
                .owner(owner)
                .build());
    }

    // GET /v1/plans

    @Nested
    @DisplayName("GET /v1/plans")
    class FindAll {

        @Test
        @DisplayName("should return paginated list of plans")
        void shouldReturnPaginatedPlans() throws Exception {
            createPlan("Plano Mensal", 9990, Plan.Recurrence.MONTHLY);
            createPlan("Plano Anual", 99900, Plan.Recurrence.ANNUAL);

            mockMvc.perform(get("/v1/plans")
                            .header("Authorization", bearer())
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(2)))
                    .andExpect(jsonPath("$.totalElements").value(2));
        }

        @Test
        @DisplayName("should filter by active status")
        void shouldFilterByActiveStatus() throws Exception {
            Plan active = createPlan("Plano Ativo", 9990, Plan.Recurrence.MONTHLY);
            Plan archived = createPlan("Plano Arquivado", 4990, Plan.Recurrence.MONTHLY);
            archived.setActive(false);
            planRepository.save(archived);

            mockMvc.perform(get("/v1/plans")
                            .header("Authorization", bearer())
                            .param("active", "true"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].name").value("Plano Ativo"));
        }

        @Test
        @DisplayName("should filter by search term")
        void shouldFilterBySearch() throws Exception {
            createPlan("Plano Basic", 9990, Plan.Recurrence.MONTHLY);
            createPlan("Plano Premium", 29990, Plan.Recurrence.MONTHLY);

            mockMvc.perform(get("/v1/plans")
                            .header("Authorization", bearer())
                            .param("search", "premium"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.content[0].name").value("Plano Premium"));
        }

        @Test
        @DisplayName("should not return plans from other owners")
        void shouldNotReturnPlansFromOtherOwners() throws Exception {
            User otherOwner = userRepository.save(User.builder()
                    .name("Other Owner")
                    .email("other@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(true)
                    .build());

            planRepository.save(Plan.builder()
                    .name("Plano Alheio")
                    .amountCents(9990)
                    .recurrence(Plan.Recurrence.MONTHLY)
                    .trialDays(0)
                    .active(true)
                    .owner(otherOwner)
                    .build());

            mockMvc.perform(get("/v1/plans")
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(get("/v1/plans"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // GET /v1/plans/:id

    @Nested
    @DisplayName("GET /v1/plans/:id")
    class FindById {

        @Test
        @DisplayName("should return plan by id")
        void shouldReturnPlanById() throws Exception {
            Plan plan = createPlan("Plano Mensal", 9990, Plan.Recurrence.MONTHLY);

            mockMvc.perform(get("/v1/plans/{id}", plan.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(plan.getId().toString()))
                    .andExpect(jsonPath("$.name").value("Plano Mensal"))
                    .andExpect(jsonPath("$.amountCents").value(9990));
        }

        @Test
        @DisplayName("should return 404 for unknown plan")
        void shouldReturn404ForUnknownPlan() throws Exception {
            mockMvc.perform(get("/v1/plans/{id}", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 404 for plan from another owner")
        void shouldReturn404ForOtherOwnerPlan() throws Exception {
            User otherOwner = userRepository.save(User.builder()
                    .name("Other Owner")
                    .email("other@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(true)
                    .build());

            Plan otherPlan = planRepository.save(Plan.builder()
                    .name("Plano Alheio")
                    .amountCents(9990)
                    .recurrence(Plan.Recurrence.MONTHLY)
                    .trialDays(0)
                    .active(true)
                    .owner(otherOwner)
                    .build());

            mockMvc.perform(get("/v1/plans/{id}", otherPlan.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(get("/v1/plans/{id}", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }

    // POST /v1/plans

    @Nested
    @DisplayName("POST /v1/plans")
    class Create {

        @Test
        @DisplayName("should create monthly plan and return 201")
        void shouldCreateMonthlyPlan() throws Exception {
            var request = new CreatePlanRequest(
                    "Plano Basic Mensal", "Acesso básico",
                    9990, Plan.Recurrence.MONTHLY,
                    null, 7, 100, List.of("Feature A", "Feature B")
            );

            mockMvc.perform(post("/v1/plans")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("Plano Basic Mensal"))
                    .andExpect(jsonPath("$.amountCents").value(9990))
                    .andExpect(jsonPath("$.id").isNotEmpty());
        }

        @Test
        @DisplayName("should create custom plan and return 201")
        void shouldCreateCustomPlan() throws Exception {
            var request = new CreatePlanRequest(
                    "Plano Custom 45 dias", "Contrato especial",
                    100000, Plan.Recurrence.CUSTOM,
                    45, 0, 10, null
            );

            mockMvc.perform(post("/v1/plans")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("Plano Custom 45 dias"));
        }

        @Test
        @DisplayName("should return 409 if plan name already exists")
        void shouldReturn409IfNameDuplicated() throws Exception {
            createPlan("Plano Basic Mensal", 9990, Plan.Recurrence.MONTHLY);

            var request = new CreatePlanRequest(
                    "Plano Basic Mensal", null,
                    9990, Plan.Recurrence.MONTHLY,
                    null, 0, null, null
            );

            mockMvc.perform(post("/v1/plans")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 409 for CUSTOM plan without customDays")
        void shouldReturn409ForCustomWithoutDays() throws Exception {
            var request = new CreatePlanRequest(
                    "Plano Custom Inválido", null,
                    50000, Plan.Recurrence.CUSTOM,
                    null, 0, null, null
            );

            mockMvc.perform(post("/v1/plans")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 400 for invalid request body")
        void shouldReturn400ForInvalidBody() throws Exception {
            var request = new CreatePlanRequest(
                    "", null, 0, null, null, null, null, null
            );

            mockMvc.perform(post("/v1/plans")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            var request = new CreatePlanRequest(
                    "Plano", null, 9990, Plan.Recurrence.MONTHLY, null, 0, null, null
            );

            mockMvc.perform(post("/v1/plans")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isUnauthorized());
        }
    }

    // PUT /v1/plans/:id

    @Nested
    @DisplayName("PUT /v1/plans/:id")
    class Update {

        @Test
        @DisplayName("should update plan successfully")
        void shouldUpdatePlan() throws Exception {
            Plan plan = createPlan("Plano Original", 9990, Plan.Recurrence.MONTHLY);

            var request = new UpdatePlanRequest(
                    "Plano Atualizado", "Nova descrição",
                    10990, Plan.Recurrence.MONTHLY,
                    null, 7, 150, List.of("Feature X")
            );

            mockMvc.perform(put("/v1/plans/{id}", plan.getId())
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Plano Atualizado"))
                    .andExpect(jsonPath("$.amountCents").value(10990));
        }

        @Test
        @DisplayName("should return 404 for unknown plan")
        void shouldReturn404ForUnknownPlan() throws Exception {
            var request = new UpdatePlanRequest(
                    "X", null, 1000, Plan.Recurrence.MONTHLY, null, 0, null, null
            );

            mockMvc.perform(put("/v1/plans/{id}", UUID.randomUUID())
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 409 if name is taken by another plan")
        void shouldReturn409IfNameTaken() throws Exception {
            Plan plan1 = createPlan("Plano A", 9990, Plan.Recurrence.MONTHLY);
            createPlan("Plano B", 4990, Plan.Recurrence.MONTHLY);

            var request = new UpdatePlanRequest(
                    "Plano B", null, 9990, Plan.Recurrence.MONTHLY, null, 0, null, null
            );

            mockMvc.perform(put("/v1/plans/{id}", plan1.getId())
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }
    }

    // PATCH /v1/plans/:id/status

    @Nested
    @DisplayName("PATCH /v1/plans/:id/status")
    class ToggleStatus {

        @Test
        @DisplayName("should archive active plan")
        void shouldArchiveActivePlan() throws Exception {
            Plan plan = createPlan("Plano Ativo", 9990, Plan.Recurrence.MONTHLY);

            mockMvc.perform(patch("/v1/plans/{id}/status", plan.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.active").value(false));
        }

        @Test
        @DisplayName("should reactivate archived plan")
        void shouldReactivateArchivedPlan() throws Exception {
            Plan plan = createPlan("Plano Arquivado", 9990, Plan.Recurrence.MONTHLY);
            plan.setActive(false);
            planRepository.save(plan);

            mockMvc.perform(patch("/v1/plans/{id}/status", plan.getId())
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.active").value(true));
        }

        @Test
        @DisplayName("should return 404 for unknown plan")
        void shouldReturn404ForUnknownPlan() throws Exception {
            mockMvc.perform(patch("/v1/plans/{id}/status", UUID.randomUUID())
                            .header("Authorization", bearer()))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(patch("/v1/plans/{id}/status", UUID.randomUUID()))
                    .andExpect(status().isUnauthorized());
        }
    }
}