package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.response.NotificationResponse;
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
import org.springframework.security.core.userdetails.UserDetails;
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
            @AuthenticationPrincipal UserDetails user,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(notificationService.findAll(UUID.fromString(user.getUsername()), pageable));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Contar Não Lidas", description = "Retorna a quantidade total de notificações que ainda não foram lidas pelo usuário.")
    public ResponseEntity<Long> countUnread(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(notificationService.countUnread(UUID.fromString(user.getUsername())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Marcar como Lida", description = "Marca uma notificação específica como lida a partir do seu ID.")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable UUID id
    ) {
        notificationService.markAsRead(UUID.fromString(user.getUsername()), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Marcar Todas como Lidas", description = "Marca todas as notificações pendentes do usuário atual como lidas de uma só vez.")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal UserDetails user) {
        notificationService.markAllAsRead(UUID.fromString(user.getUsername()));
        return ResponseEntity.noContent().build();
    }
}