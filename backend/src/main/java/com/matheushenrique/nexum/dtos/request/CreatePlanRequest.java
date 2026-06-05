package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.entities.Plan.Recurrence;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreatePlanRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        @Schema(description = "Nome de exibição do plano de assinatura", example = "Plano Premium Enterprise")
        String name,

        @Schema(description = "Descrição detalhada dos benefícios do plano", example = "Inclui suporte prioritário 24/7 e integrações customizadas.")
        String description,

        @NotNull(message = "Amount is required")
        @Min(value = 100, message = "Amount must be at least R$ 1,00")
        @Schema(description = "Valor mensal em centavos (ex: 4990 = R$ 49,90)", example = "4990")
        Integer amountCents,

        @NotNull(message = "Recurrence is required")
        @Schema(description = "Frequência de cobrança do ciclo", example = "MONTHLY")
        Recurrence recurrence,

        @Schema(description = "Duração customizada do ciclo em dias (usado se a recorrência for CUSTOM)", example = "15")
        Integer customDays,

        @Min(value = 0, message = "Trial days must be zero or positive")
        @Schema(description = "Dias de teste gratuito antes da primeira cobrança", example = "7")
        Integer trialDays,

        @Min(value = 1, message = "Max subscriptions must be at least 1")
        @Schema(description = "Limite máximo de assinaturas ativas para este plano", example = "100")
        Integer maxSubscriptions,

        @Schema(description = "Lista de funcionalidades incluídas no plano", example = "[\"Suporte Prioritário\", \"Integração via API\", \"Relatórios Avançados\"]")
        List<String> features

) {}