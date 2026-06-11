package com.matheushenrique.nexum.controllers;

import com.matheushenrique.nexum.config.ApiGlobalErrors;
import com.matheushenrique.nexum.dtos.request.LoginRequest;
import com.matheushenrique.nexum.dtos.request.RefreshTokenRequest;
import com.matheushenrique.nexum.dtos.request.RegisterRequest;
import com.matheushenrique.nexum.dtos.request.ForgotPasswordRequest;
import com.matheushenrique.nexum.dtos.request.ResetPasswordRequest;
import com.matheushenrique.nexum.dtos.response.AuthResponse;
import com.matheushenrique.nexum.dtos.response.MessageResponse;
import com.matheushenrique.nexum.services.impl.AuthServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@ApiGlobalErrors
@SecurityRequirement(name = "bearer-key")
@Tag(name = "1. Autenticação", description = "Endpoints para registro, login, verificação e gerenciamento de tokens")
public class AuthController {

    private final AuthServiceImpl authService;

    @PostMapping("/register")
    @Operation(summary = "Registrar novo usuário", description = "Cria uma nova conta de usuário no sistema.")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verificar E-mail", description = "Valida a conta do usuário através do token enviado por e-mail.")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    @PostMapping("/login")
    @Operation(summary = "Realizar Login", description = "Autentica o usuário e retorna os tokens JWT de acesso e refresh.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Atualizar Token", description = "Gera um novo token de acesso usando um refresh token válido.")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Realizar Logout", description = "Invalida o refresh token do usuário atual, encerrando a sessão.")
    public ResponseEntity<MessageResponse> logout(@AuthenticationPrincipal UserDetails principal) {
        UUID userId = UUID.fromString(principal.getUsername());
        return ResponseEntity.ok(authService.logout(userId));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperação de senha", description = "Envia um e-mail com link para redefinir a senha do usuário.")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Redefinir senha", description = "Altera a senha do usuário utilizando o token de recuperação enviado por e-mail.")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}