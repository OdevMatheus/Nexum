package com.matheushenrique.nexum.dtos.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matheushenrique.nexum.entities.Plan;
import com.matheushenrique.nexum.entities.Plan.Recurrence;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PlanResponse(
        UUID id,
        String name,
        String description,
        Integer amountCents,
        String amountFormatted,
        Recurrence recurrence,
        String recurrenceLabel,
        Integer customDays,
        Integer trialDays,
        Integer maxSubscriptions,
        List<String> features,
        boolean active,
        Instant archivedAt,
        Instant createdAt,
        Instant updatedAt
) {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static PlanResponse from(Plan plan) {
        List<String> featureList = parseFeatures(plan.getFeatures());
        return new PlanResponse(
                plan.getId(),
                plan.getName(),
                plan.getDescription(),
                plan.getAmountCents(),
                formatAmount(plan.getAmountCents()),
                plan.getRecurrence(),
                formatRecurrence(plan.getRecurrence(), plan.getCustomDays()),
                plan.getCustomDays(),
                plan.getTrialDays(),
                plan.getMaxSubscriptions(),
                featureList,
                plan.isActive(),
                plan.getArchivedAt(),
                plan.getCreatedAt(),
                plan.getUpdatedAt()
        );
    }

    private static String formatAmount(Integer cents) {
        return String.format("R$ %,.2f", cents / 100.0)
                .replace(",", "X")
                .replace(".", ",")
                .replace("X", ".");
    }

    private static String formatRecurrence(Recurrence recurrence, Integer customDays) {
        return switch (recurrence) {
            case MONTHLY -> "Mensal";
            case QUARTERLY -> "Trimestral";
            case SEMIANNUAL -> "Semestral";
            case ANNUAL -> "Anual";
            case CUSTOM -> customDays + " dias";
        };
    }

    private static List<String> parseFeatures(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return mapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}