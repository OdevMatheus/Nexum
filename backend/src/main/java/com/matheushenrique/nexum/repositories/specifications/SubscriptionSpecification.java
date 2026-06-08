package com.matheushenrique.nexum.repositories.specifications;

import com.matheushenrique.nexum.entities.Subscription;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.UUID;

public class SubscriptionSpecification {

    public static Specification<Subscription> hasOwner(UUID ownerId) {
        return (root, query, cb) -> cb.equal(root.get("owner").get("id"), ownerId);
    }

    public static Specification<Subscription> hasStatus(Subscription.Status status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Subscription> hasClient(UUID clientId) {
        return (root, query, cb) -> cb.equal(root.get("client").get("id"), clientId);
    }

    public static Specification<Subscription> hasPlan(UUID planId) {
        return (root, query, cb) -> cb.equal(root.get("plan").get("id"), planId);
    }

    public static Specification<Subscription> searchByClientName(String search) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("client").get("name")), "%" + search.toLowerCase() + "%");
    }

    public static Specification<Subscription> startDateBetween(LocalDate start, LocalDate end) {
        return (root, query, cb) -> {
            if (start != null && end != null) {
                return cb.between(root.get("startDate"), start, end);
            } else if (start != null) {
                return cb.greaterThanOrEqualTo(root.get("startDate"), start);
            } else if (end != null) {
                return cb.lessThanOrEqualTo(root.get("startDate"), end);
            }
            return cb.conjunction();
        };
    }

    public static Specification<Subscription> nextDueDateBetween(LocalDate start, LocalDate end) {
        return (root, query, cb) -> {
            if (start != null && end != null) {
                return cb.between(root.get("nextDueDate"), start, end);
            } else if (start != null) {
                return cb.greaterThanOrEqualTo(root.get("nextDueDate"), start);
            } else if (end != null) {
                return cb.lessThanOrEqualTo(root.get("nextDueDate"), end);
            }
            return cb.conjunction();
        };
    }
}
