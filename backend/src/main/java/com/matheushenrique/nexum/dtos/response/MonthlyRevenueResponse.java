package com.matheushenrique.nexum.dtos.response;

public record MonthlyRevenueResponse(
        int year,
        int month,
        String label,
        long amount
) {}