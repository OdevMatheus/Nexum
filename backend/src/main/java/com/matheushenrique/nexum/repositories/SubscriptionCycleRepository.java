package com.matheushenrique.nexum.repositories;

import com.matheushenrique.nexum.dtos.response.MrrDistributionResponse;
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

    Optional<SubscriptionCycle> findTopBySubscriptionIdAndStatusInOrderByDueDateAsc(UUID subscriptionId, List<SubscriptionCycle.CycleStatus> statuses);

    @Query("SELECT COALESCE(SUM(c.amountCents), 0) FROM SubscriptionCycle c WHERE c.subscription.owner.id = :ownerId AND c.status = 'PENDING' AND YEAR(c.dueDate) = :year AND MONTH(c.dueDate) = :month")
    Long sumMrrByOwnerAndMonth(@Param("ownerId") UUID ownerId,
                               @Param("year") int year,
                               @Param("month") int month);

    @Query("""
    SELECT new com.matheushenrique.nexum.dtos.response.MrrDistributionResponse(p.id, p.name, COALESCE(SUM(c.amountCents), 0))
    FROM SubscriptionCycle c
    JOIN c.subscription s
    JOIN s.plan p
    WHERE s.owner.id = :ownerId
      AND c.status = 'PENDING'
      AND YEAR(c.dueDate) = :year
      AND MONTH(c.dueDate) = :month
    GROUP BY p.id, p.name
    ORDER BY SUM(c.amountCents) DESC
    """)
    List<MrrDistributionResponse> sumMrrByPlan(
            @Param("ownerId") UUID ownerId,
            @Param("year") int year,
            @Param("month") int month
    );

    @Query("""
    SELECT c FROM SubscriptionCycle c
    JOIN FETCH c.subscription s
    JOIN FETCH s.client cl
    JOIN FETCH s.plan p
    WHERE s.owner.id = :ownerId
      AND c.status = 'PENDING'
      AND YEAR(c.dueDate) = :year
      AND MONTH(c.dueDate) = :month
    ORDER BY c.dueDate ASC
    """)
    List<SubscriptionCycle> findPendingCyclesByMonth(
            @Param("ownerId") UUID ownerId,
            @Param("year") int year,
            @Param("month") int month
    );

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