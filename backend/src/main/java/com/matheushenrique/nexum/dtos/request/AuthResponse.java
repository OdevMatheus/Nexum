package com.matheushenrique.nexum.dtos.response;

import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String name,
        String email,
        String accessToken,
        String refreshToken
) {}