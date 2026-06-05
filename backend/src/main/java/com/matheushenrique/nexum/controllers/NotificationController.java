package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.response.NotificationResponse;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.services.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
@ApiGlobalErrors
@SecurityRequirement(name = "bearer-key")
@Tag(name = "5. Notificações", description = "Gerenciamento de alertas, eventos e avisos do sistema")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Listar Notificações", description = "Retorna uma lista paginada com todas as notificações recebidas pelo usuário logado.")
    public ResponseEntity<Page<NotificationResponse>> findAll(
            @AuthenticationPrincipal User user,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(notificationService.findAll(user.getId(), pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Contar Não Lidas", description = "Retorna a quantidade total de notificações que ainda não foram lidas pelo usuário.")
    public ResponseEntity<Long> countUnread(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.countUnread(user.getId()));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marcar como Lida", description = "Marca uma notificação específica como lida a partir do seu ID.")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        notificationService.markAsRead(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marcar Todas como Lidas", description = "Marca todas as notificações pendentes do usuário atual como lidas de uma só vez.")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.noContent().build();
    }
}