package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.entities.Plan.Recurrence;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdatePlanRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        @Schema(description = "Nome de exibição atualizado do plano", example = "Plano Premium Enterprise v2")
        String name,

        @Schema(description = "Descrição atualizada dos benefícios do plano", example = "Inclui agora um gerente de contas dedicado e suporte VIP.")
        String description,

        @NotNull(message = "Amount is required")
        @Min(value = 100, message = "Amount must be at least R$ 1,00")
        @Schema(description = "Novo valor mensal em centavos", example = "5990")
        Integer amountCents,

        @NotNull(message = "Recurrence is required")
        @Schema(description = "Recorrência de cobrança atualizada", example = "MONTHLY")
        Recurrence recurrence,

        @Schema(description = "Duração customizada do ciclo em dias", example = "15")
        Integer customDays,

        @Min(value = 0, message = "Trial days must be zero or positive")
        @Schema(description = "Dias de teste gratuito atualizados", example = "14")
        Integer trialDays,

        @Min(value = 1, message = "Max subscriptions must be at least 1")
        @Schema(description = "Novo limite máximo de assinaturas ativas", example = "200")
        Integer maxSubscriptions,

        @Schema(description = "Lista atualizada de funcionalidades incluídas", example = "[\"Suporte Prioritário\", \"Integração via API\", \"Gerente Dedicado\"]")
        List<String> features

) {}