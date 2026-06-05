package com.matheushenrique.nexum.dtos.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.matheushenrique.nexum.entities.Plan;
import com.matheushenrique.nexum.entities.Plan.Recurrence;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PlanResponse(
        @Schema(description = "Identificador único do plano", example = "f0e1d2c3-b4a5-6789-0123-456789abcdef")
        UUID id,
        @Schema(description = "Nome do plano", example = "Plano Premium Enterprise")
        String name,
        @Schema(description = "Descrição dos benefícios", example = "Suporte 24/7 e integrações ilimitadas")
        String description,
        @Schema(description = "Valor em centavos", example = "4990")
        Integer amountCents,
        @Schema(description = "Valor formatado para exibição (R$)", example = "R$ 49,90")
        String amountFormatted,
        @Schema(description = "Tipo de recorrência (Enum)", example = "MONTHLY")
        Recurrence recurrence,
        @Schema(description = "Rótulo amigável da recorrência", example = "Mensal")
        String recurrenceLabel,
        @Schema(description = "Dias em caso de recorrência customizada", example = "15")
        Integer customDays,
        @Schema(description = "Dias de teste gratuito", example = "7")
        Integer trialDays,
        @Schema(description = "Limite máximo de assinaturas permitidas", example = "500")
        Integer maxSubscriptions,
        @Schema(description = "Lista de funcionalidades", example = "[\"Suporte\", \"API\"]")
        List<String> features,
        @Schema(description = "Status de ativação do plano", example = "true")
        boolean active,
        @Schema(description = "Data de arquivamento (se houver)", example = "2026-12-31T23:59:59Z")
        Instant archivedAt,
        @Schema(description = "Data de criação", example = "2026-06-05T10:00:00Z")
        Instant createdAt,
        @Schema(description = "Data da última atualização", example = "2026-06-05T10:00:00Z")
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