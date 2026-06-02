package com.matheushenrique.nexum.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "subscription_cycles")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SubscriptionCycle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "amount_cents", nullable = false)
    private Integer amountCents;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CycleStatus status = CycleStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public enum CycleStatus {
        PENDING, PAID, OVERDUE
    }
}