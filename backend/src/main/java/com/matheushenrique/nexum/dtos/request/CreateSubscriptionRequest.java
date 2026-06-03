package com.matheushenrique.nexum.dtos.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateSubscriptionRequest(
        @NotNull UUID clientId,
        @NotNull UUID planId,
        @NotNull LocalDate startDate
) {}