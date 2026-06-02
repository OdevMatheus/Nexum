package com.matheushenrique.nexum.repositories;

import com.matheushenrique.nexum.entities.SubscriptionCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionCycleRepository extends JpaRepository<SubscriptionCycle, UUID> {

    List<SubscriptionCycle> findBySubscriptionIdOrderByDueDateDesc(UUID subscriptionId);

    Optional<SubscriptionCycle> findTopBySubscriptionIdOrderByDueDateDesc(UUID subscriptionId);
}