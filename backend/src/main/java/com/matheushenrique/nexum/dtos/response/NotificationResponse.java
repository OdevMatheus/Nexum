package com.matheushenrique.nexum.dtos.response;

import com.matheushenrique.nexum.entities.Notification;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        @Schema(description = "Identificador único da notificação", example = "f8c3de3d-1fea-4d7c-a8b0-9e32f4a1b2c3")
        UUID id,
        @Schema(description = "ID da assinatura vinculada à notificação", example = "a1b2c3d4-e5f6-7890-1234-56789abcdef0")
        UUID subscriptionId,
        @Schema(description = "Tipo ou categoria da notificação", example = "PAYMENT_SUCCESS")
        String type,
        @Schema(description = "Conteúdo da mensagem exibida ao usuário", example = "O pagamento da sua assinatura foi confirmado com sucesso.")
        String message,
        @Schema(description = "Status de leitura da notificação", example = "false")
        boolean read,
        @Schema(description = "Data e hora de emissão da notificação", example = "2026-06-05T06:30:00")
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getSubscriptionId(),
                n.getType(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}