package com.matheushenrique.nexum.unit;

import com.matheushenrique.nexum.dtos.request.CreatePlanRequest;
import com.matheushenrique.nexum.dtos.request.UpdatePlanRequest;
import com.matheushenrique.nexum.entities.Plan;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.PlanRepository;
import com.matheushenrique.nexum.security.exceptions.EmailAlreadyInUseException;
import com.matheushenrique.nexum.security.exceptions.PlanNotFoundException;
import com.matheushenrique.nexum.services.impl.PlanServiceImpl;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlanServiceImpl")
class PlanServiceImplTest {

    @Mock private PlanRepository planRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;
    @Mock private UserDetails userDetails;

    @InjectMocks
    private PlanServiceImpl planService;

    private final UUID ownerId = UUID.randomUUID();
    private final UUID planId = UUID.randomUUID();
    private User owner;
    private Plan monthlyPlan;
    private Plan customPlan;

    @BeforeEach
    void setUp() {
        owner = User.builder()
                .id(ownerId)
                .name("Owner")
                .email("owner@example.com")
                .passwordHash("hash")
                .build();

        monthlyPlan = Plan.builder()
                .id(planId)
                .owner(owner)
                .name("Plano Basic Mensal")
                .amountCents(9990)
                .recurrence(Plan.Recurrence.MONTHLY)
                .trialDays(7)
                .active(true)
                .build();

        customPlan = Plan.builder()
                .id(UUID.randomUUID())
                .owner(owner)
                .name("Plano Custom")
                .amountCents(50000)
                .recurrence(Plan.Recurrence.CUSTOM)
                .customDays(45)
                .trialDays(0)
                .active(true)
                .build();

        when(userDetails.getUsername()).thenReturn(ownerId.toString());
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    // findAll

    @Nested
    @DisplayName("findAll")
    class FindAll {

        @Test
        @DisplayName("should return paginated list of plans")
        void shouldReturnPaginatedPlans() {
            var page = new PageImpl<>(List.of(monthlyPlan, customPlan));
            when(planRepository.findAllByOwner(eq(ownerId), isNull(), isNull(), any(Pageable.class)))
                    .thenReturn(page);

            var response = planService.findAll(0, 10, null, null);

            assertThat(response.content()).hasSize(2);
        }

        @Test
        @DisplayName("should filter by active status")
        void shouldFilterByActiveStatus() {
            var page = new PageImpl<>(List.of(monthlyPlan));
            when(planRepository.findAllByOwner(eq(ownerId), eq(true), isNull(), any(Pageable.class)))
                    .thenReturn(page);

            var response = planService.findAll(0, 10, null, true);

            assertThat(response.content()).hasSize(1);
            verify(planRepository).findAllByOwner(eq(ownerId), eq(true), isNull(), any(Pageable.class));
        }

        @Test
        @DisplayName("should pass null search when blank string is provided")
        void shouldPassNullForBlankSearch() {
            var page = new PageImpl<>(List.of(monthlyPlan));
            when(planRepository.findAllByOwner(eq(ownerId), isNull(), isNull(), any(Pageable.class)))
                    .thenReturn(page);

            planService.findAll(0, 10, "   ", null);

            verify(planRepository).findAllByOwner(eq(ownerId), isNull(), isNull(), any(Pageable.class));
        }
    }

    // findById

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("should return plan when found")
        void shouldReturnPlanWhenFound() {
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));

            var response = planService.findById(planId);

            assertThat(response.id()).isEqualTo(planId);
            assertThat(response.name()).isEqualTo("Plano Basic Mensal");
        }

        @Test
        @DisplayName("should throw PlanNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> planService.findById(planId))
                    .isInstanceOf(PlanNotFoundException.class);
        }
    }

    // create

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("should create monthly plan successfully")
        void shouldCreateMonthlyPlan() {
            var request = new CreatePlanRequest(
                    "Plano Basic Mensal", "Descrição", 9990,
                    Plan.Recurrence.MONTHLY, null, 7, 100, List.of("Feature A")
            );

            when(planRepository.existsByNameAndActiveTrueAndOwnerId("Plano Basic Mensal", ownerId))
                    .thenReturn(false);
            when(planRepository.save(any(Plan.class))).thenAnswer(i -> {
                Plan p = i.getArgument(0);
                p.setId(planId);
                return p;
            });

            var response = planService.create(request);

            assertThat(response.name()).isEqualTo("Plano Basic Mensal");
            assertThat(response.amountCents()).isEqualTo(9990);
            verify(planRepository).save(any(Plan.class));
        }

        @Test
        @DisplayName("should create custom plan successfully")
        void shouldCreateCustomPlan() {
            var request = new CreatePlanRequest(
                    "Plano Custom", "Descrição", 50000,
                    Plan.Recurrence.CUSTOM, 45, 0, null, null
            );

            when(planRepository.existsByNameAndActiveTrueAndOwnerId("Plano Custom", ownerId))
                    .thenReturn(false);
            when(planRepository.save(any(Plan.class))).thenAnswer(i -> {
                Plan p = i.getArgument(0);
                p.setId(UUID.randomUUID());
                return p;
            });

            var response = planService.create(request);

            assertThat(response.name()).isEqualTo("Plano Custom");
        }

        @Test
        @DisplayName("should throw IllegalArgumentException for CUSTOM plan without customDays")
        void shouldThrowForCustomPlanWithoutDays() {
            var request = new CreatePlanRequest(
                    "Plano Custom Inválido", null, 50000,
                    Plan.Recurrence.CUSTOM, null, 0, null, null
            );

            assertThatThrownBy(() -> planService.create(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Custom days");

            verify(planRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw EmailAlreadyInUseException if plan name already exists")
        void shouldThrowIfNameDuplicated() {
            var request = new CreatePlanRequest(
                    "Plano Basic Mensal", null, 9990,
                    Plan.Recurrence.MONTHLY, null, 0, null, null
            );

            when(planRepository.existsByNameAndActiveTrueAndOwnerId("Plano Basic Mensal", ownerId))
                    .thenReturn(true);

            assertThatThrownBy(() -> planService.create(request))
                    .isInstanceOf(EmailAlreadyInUseException.class);

            verify(planRepository, never()).save(any());
        }
    }

    // update

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("should update plan successfully")
        void shouldUpdatePlan() {
            var request = new UpdatePlanRequest(
                    "Plano Atualizado", "Nova descrição", 10990,
                    Plan.Recurrence.MONTHLY, null, 7, 150, List.of("Feature B")
            );

            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(planRepository.existsByNameAndActiveTrueAndIdNotAndOwnerId("Plano Atualizado", planId, ownerId))
                    .thenReturn(false);
            when(planRepository.save(any(Plan.class))).thenAnswer(i -> i.getArgument(0));

            var response = planService.update(planId, request);

            assertThat(response.name()).isEqualTo("Plano Atualizado");
            assertThat(response.amountCents()).isEqualTo(10990);
        }

        @Test
        @DisplayName("should throw PlanNotFoundException when plan does not exist")
        void shouldThrowWhenNotFound() {
            var request = new UpdatePlanRequest(
                    "X", null, 1000, Plan.Recurrence.MONTHLY, null, 0, null, null
            );

            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> planService.update(planId, request))
                    .isInstanceOf(PlanNotFoundException.class);
        }

        @Test
        @DisplayName("should throw IllegalArgumentException for CUSTOM update without customDays")
        void shouldThrowForCustomUpdateWithoutDays() {
            var request = new UpdatePlanRequest(
                    "Plano Custom", null, 50000,
                    Plan.Recurrence.CUSTOM, null, 0, null, null
            );

            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));

            assertThatThrownBy(() -> planService.update(planId, request))
                    .isInstanceOf(IllegalStateException.class);
        }

        @Test
        @DisplayName("should throw EmailAlreadyInUseException if name is taken by another plan")
        void shouldThrowIfNameTakenByOther() {
            var request = new UpdatePlanRequest(
                    "Nome Duplicado", null, 9990,
                    Plan.Recurrence.MONTHLY, null, 0, null, null
            );

            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(planRepository.existsByNameAndActiveTrueAndIdNotAndOwnerId("Nome Duplicado", planId, ownerId))
                    .thenReturn(true);

            assertThatThrownBy(() -> planService.update(planId, request))
                    .isInstanceOf(EmailAlreadyInUseException.class);

            verify(planRepository, never()).save(any());
        }
    }

    // toggleStatus

    @Nested
    @DisplayName("toggleStatus")
    class ToggleStatus {

        @Test
        @DisplayName("should archive active plan")
        void shouldArchiveActivePlan() {
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(planRepository.save(any(Plan.class))).thenAnswer(i -> i.getArgument(0));

            var response = planService.toggleStatus(planId);

            assertThat(response.active()).isFalse();
            assertThat(monthlyPlan.getArchivedAt()).isNotNull();
        }

        @Test
        @DisplayName("should reactivate archived plan")
        void shouldReactivateArchivedPlan() {
            monthlyPlan.setActive(false);

            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(planRepository.existsByNameAndActiveTrueAndOwnerId(monthlyPlan.getName(), ownerId))
                    .thenReturn(false);
            when(planRepository.save(any(Plan.class))).thenAnswer(i -> i.getArgument(0));

            var response = planService.toggleStatus(planId);

            assertThat(response.active()).isTrue();
            assertThat(monthlyPlan.getArchivedAt()).isNull();
        }

        @Test
        @DisplayName("should throw when reactivating plan with duplicate name")
        void shouldThrowWhenReactivatingWithDuplicateName() {
            monthlyPlan.setActive(false);

            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(planRepository.existsByNameAndActiveTrueAndOwnerId(monthlyPlan.getName(), ownerId))
                    .thenReturn(true);

            assertThatThrownBy(() -> planService.toggleStatus(planId))
                    .isInstanceOf(EmailAlreadyInUseException.class);
        }

        @Test
        @DisplayName("should throw PlanNotFoundException when plan does not exist")
        void shouldThrowWhenNotFound() {
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> planService.toggleStatus(planId))
                    .isInstanceOf(PlanNotFoundException.class);
        }
    }

    // delete

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("should archive plan on delete")
        void shouldArchivePlan() {
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.of(monthlyPlan));
            when(planRepository.save(any(Plan.class))).thenAnswer(i -> i.getArgument(0));

            var response = planService.delete(planId);

            assertThat(response.message()).contains("archived");
            assertThat(monthlyPlan.isActive()).isFalse();
            assertThat(monthlyPlan.getArchivedAt()).isNotNull();
        }

        @Test
        @DisplayName("should throw PlanNotFoundException when plan does not exist")
        void shouldThrowWhenNotFound() {
            when(planRepository.findByIdAndOwnerId(planId, ownerId))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> planService.delete(planId))
                    .isInstanceOf(PlanNotFoundException.class);

            verify(planRepository, never()).save(any());
        }
    }
}