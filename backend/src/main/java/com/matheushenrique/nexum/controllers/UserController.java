package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.request.ChangePasswordRequest;
import com.matheushenrique.nexum.dtos.request.UpdateProfileRequest;
import com.matheushenrique.nexum.dtos.response.MessageResponse;
import com.matheushenrique.nexum.dtos.response.UserResponse;
import com.matheushenrique.nexum.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@ApiGlobalErrors
@SecurityRequirement(name = "bearer-key")
@Tag(name = "6. Usuários", description = "Gerenciamento do perfil e segurança do usuário autenticado")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Obter dados do perfil", description = "Retorna os dados do usuário atualmente autenticado.")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails principal) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(userService.getMe(userId));
    }

    @PutMapping("/me")
    @Operation(summary = "Atualizar perfil", description = "Atualiza o nome e e-mail do usuário autenticado. Se o e-mail for alterado, exige nova verificação e invalida a sessão.")
    public ResponseEntity<MessageResponse> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Alterar senha", description = "Altera a senha de acesso do usuário após validar a senha atual.")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(userService.changePassword(userId, request));
    }
}