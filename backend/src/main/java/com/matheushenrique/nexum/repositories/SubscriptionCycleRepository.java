package com.matheushenrique.nexum.repositories;

import com.matheushenrique.nexum.entities.SubscriptionCycle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionCycleRepository extends JpaRepository<SubscriptionCycle, UUID> {

    List<SubscriptionCycle> findBySubscriptionIdOrderByDueDateDesc(UUID subscriptionId);

    Optional<SubscriptionCycle> findTopBySubscriptionIdOrderByDueDateDesc(UUID subscriptionId);

    @Query("SELECT COALESCE(SUM(c.amountCents), 0) FROM SubscriptionCycle c WHERE c.subscription.owner.id = :ownerId AND c.status = 'PENDING' AND YEAR(c.dueDate) = :year AND MONTH(c.dueDate) = :month")
    Long sumMrrByOwnerAndMonth(@Param("ownerId") UUID ownerId,
                               @Param("year") int year,
                               @Param("month") int month);

    @Query("""
    SELECT YEAR(c.dueDate), MONTH(c.dueDate), COALESCE(SUM(c.amountCents), 0)
    FROM SubscriptionCycle c
    WHERE c.subscription.owner.id = :ownerId
      AND c.dueDate >= :from
    GROUP BY YEAR(c.dueDate), MONTH(c.dueDate)
    ORDER BY YEAR(c.dueDate), MONTH(c.dueDate)
    """)
    List<Object[]> findMonthlyRevenue(@Param("ownerId") UUID ownerId,
                                      @Param("from") LocalDate from);

    @Query("SELECT c FROM SubscriptionCycle c WHERE c.subscription.owner.id = :ownerId ORDER BY c.dueDate DESC")
    List<SubscriptionCycle> findRecentByOwnerId(@Param("ownerId") UUID ownerId, Pageable pageable);
}