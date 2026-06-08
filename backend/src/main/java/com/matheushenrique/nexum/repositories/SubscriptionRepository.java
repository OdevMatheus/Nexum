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

    @Query("SELECT new com.matheushenrique.nexum.dtos.response.PlanDistributionResponse(p.id, p.name, COUNT(s.id)) FROM Subscription s JOIN s.plan p WHERE s.owner.id = :ownerId AND s.status IN ('ACTIVE', 'TRIAL') GROUP BY p.id, p.name ORDER BY COUNT(s.id) DESC")
    List<com.matheushenrique.nexum.dtos.response.PlanDistributionResponse> countActiveByPlan(@Param("ownerId") UUID ownerId);

    @Query("SELECT s FROM Subscription s WHERE s.owner.id = :ownerId AND s.status = 'ACTIVE' AND s.nextDueDate BETWEEN :from AND :to ORDER BY s.nextDueDate ASC")
    List<Subscription> findUpcoming(@Param("ownerId") UUID ownerId,
                                    @Param("from") LocalDate from,
                                    @Param("to") LocalDate to);

    @Query("""
        SELECT s FROM Subscription s
        JOIN FETCH s.client c
        JOIN FETCH s.plan p
        WHERE s.owner.id = :ownerId
        AND (:status IS NULL OR s.status = :status)
        AND (:clientId IS NULL OR c.id = :clientId)
        AND (:planId IS NULL OR p.id = :planId)
        AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
    """)
    Page<Subscription> findAllByOwner(
            @Param("ownerId") UUID ownerId,
            @Param("search") String search,
            @Param("status") Subscription.Status status,
            @Param("clientId") UUID clientId,
            @Param("planId") UUID planId,
            Pageable pageable
    );

    List<Subscription> findByStatusAndNextDueDateBefore(Subscription.Status status, LocalDate date);
}