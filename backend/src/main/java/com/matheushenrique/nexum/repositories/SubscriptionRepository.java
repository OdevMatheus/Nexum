package com.matheushenrique.nexum.repositories;

import com.matheushenrique.nexum.entities.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByIdAndOwnerId(UUID id, UUID ownerId);

    boolean existsByClientIdAndPlanIdAndStatusNotIn(
            UUID clientId, UUID planId, List<Subscription.Status> statuses
    );

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.owner.id = :ownerId AND s.status = 'ACTIVE'")
    long countActiveByOwnerId(@Param("ownerId") UUID ownerId);

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.owner.id = :ownerId AND s.status IN ('OVERDUE', 'SUSPENDED')")
    long countOverdueByOwnerId(@Param("ownerId") UUID ownerId);

    @Query("SELECT s FROM Subscription s WHERE s.owner.id = :ownerId AND s.status = 'ACTIVE' AND s.nextDueDate BETWEEN :from AND :to ORDER BY s.nextDueDate ASC")
    List<Subscription> findUpcoming(@Param("ownerId") UUID ownerId,
                                    @Param("from") LocalDate from,
                                    @Param("to") LocalDate to);

    @Query("""
        SELECT s FROM Subscription s
        JOIN FETCH s.client
        JOIN FETCH s.plan
        WHERE s.owner.id = :ownerId
        AND (:status IS NULL OR s.status = :status)
        AND (:clientId IS NULL OR s.client.id = :clientId)
        AND (:planId IS NULL OR s.plan.id = :planId)
    """)
    Page<Subscription> findAllByOwner(
            @Param("ownerId") UUID ownerId,
            @Param("status") Subscription.Status status,
            @Param("clientId") UUID clientId,
            @Param("planId") UUID planId,
            Pageable pageable
    );

    List<Subscription> findByStatusAndNextDueDateBefore(Subscription.Status status, LocalDate date);
}