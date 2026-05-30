package com.matheushenrique.nexum.dtos.request;

import com.matheushenrique.nexum.entities.Plan.Recurrence;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreatePlanRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        String description,

        @NotNull(message = "Amount is required")
        @Min(value = 100, message = "Amount must be at least R$ 1,00")
        Integer amountCents,

        @NotNull(message = "Recurrence is required")
        Recurrence recurrence,

        Integer customDays,

        @Min(value = 0, message = "Trial days must be zero or positive")
        Integer trialDays,

        @Min(value = 1, message = "Max subscriptions must be at least 1")
        Integer maxSubscriptions,

        List<String> features

) {}