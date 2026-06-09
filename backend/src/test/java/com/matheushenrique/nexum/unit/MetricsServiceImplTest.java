package com.matheushenrique.nexum.unit;

import com.matheushenrique.nexum.dtos.response.*;
import com.matheushenrique.nexum.entities.Client;
import com.matheushenrique.nexum.entities.Plan;
import com.matheushenrique.nexum.entities.Subscription;
import com.matheushenrique.nexum.entities.SubscriptionCycle;
import com.matheushenrique.nexum.repositories.SubscriptionCycleRepository;
import com.matheushenrique.nexum.repositories.SubscriptionRepository;
import com.matheushenrique.nexum.services.impl.MetricsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("MetricsServiceImpl")
class MetricsServiceImplTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private SubscriptionCycleRepository cycleRepository;

    @InjectMocks
    private MetricsServiceImpl metricsService;

    private final UUID ownerId = UUID.randomUUID();

    @Test
    @DisplayName("should return MRR distribution by plan")
    void shouldReturnMrrDistribution() {
        UUID planId = UUID.randomUUID();
        var distribution = new MrrDistributionResponse(planId, "Plano Básico", 150000L);

        when(cycleRepository.sumMrrByPlan(eq(ownerId), anyInt(), anyInt()))
                .thenReturn(List.of(distribution));

        var result = metricsService.getMrrDistribution(ownerId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).planId()).isEqualTo(planId);
        assertThat(result.get(0).planName()).isEqualTo("Plano Básico");
        assertThat(result.get(0).amount()).isEqualTo(150000L);
    }

    @Test
    @DisplayName("should return MRR contributors")
    void shouldReturnMrrContributors() {
        UUID subscriptionId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        UUID planId = UUID.randomUUID();

        Client client = Client.builder().id(clientId).name("João Silva").build();
        Plan plan = Plan.builder().id(planId).name("Plano Básico").build();
        Subscription subscription = Subscription.builder()
                .id(subscriptionId)
                .client(client)
                .plan(plan)
                .build();

        SubscriptionCycle cycle = SubscriptionCycle.builder()
                .id(UUID.randomUUID())
                .subscription(subscription)
                .dueDate(LocalDate.now())
                .amountCents(9900)
                .build();

        when(cycleRepository.findPendingCyclesByMonth(eq(ownerId), anyInt(), anyInt()))
                .thenReturn(List.of(cycle));

        var result = metricsService.getMrrContributors(ownerId);

        assertThat(result).hasSize(1);
        var contributor = result.get(0);
        assertThat(contributor.subscriptionId()).isEqualTo(subscriptionId);
        assertThat(contributor.clientName()).isEqualTo("João Silva");
        assertThat(contributor.clientId()).isEqualTo(clientId);
        assertThat(contributor.planName()).isEqualTo("Plano Básico");
        assertThat(contributor.planId()).isEqualTo(planId);
        assertThat(contributor.dueDate()).isEqualTo(cycle.getDueDate());
        assertThat(contributor.amount()).isEqualTo(9900L);
    }
}
