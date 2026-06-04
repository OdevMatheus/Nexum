package com.matheushenrique.nexum.integration;

import com.matheushenrique.nexum.config.IntegrationTestBase;
import com.matheushenrique.nexum.dtos.request.LoginRequest;
import com.matheushenrique.nexum.dtos.request.RefreshTokenRequest;
import com.matheushenrique.nexum.dtos.request.RegisterRequest;
import com.matheushenrique.nexum.entities.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("POST /v1/auth")
class AuthControllerIT extends IntegrationTestBase {

    // register

    @Nested
    @DisplayName("POST /register")
    class Register {

        @Test
        @DisplayName("should register new user and return 201")
        void shouldRegisterNewUser() throws Exception {
            var request = new RegisterRequest("João Silva", "joao@nexum.dev", "senha1234");

            mockMvc.perform(post("/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value(containsString("Registration successful")));
        }

        @Test
        @DisplayName("should resend verification email if user exists but not verified")
        void shouldResendIfNotVerified() throws Exception {
            // Cria usuário não verificado
            userRepository.save(User.builder()
                    .name("Unverified")
                    .email("unverified@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(false)
                    .emailVerificationToken("old-token")
                    .emailTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                    .build());

            var request = new RegisterRequest("Unverified", "unverified@nexum.dev", "senha1234");

            mockMvc.perform(post("/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value(containsString("new verification email")));
        }

        @Test
        @DisplayName("should return 409 if email is already verified")
        void shouldReturn409IfEmailVerified() throws Exception {
            var request = new RegisterRequest("Test User", "test@nexum.dev", "senha1234");

            mockMvc.perform(post("/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("should return 400 if request body is invalid")
        void shouldReturn400ForInvalidBody() throws Exception {
            var request = new RegisterRequest("", "", "123");

            mockMvc.perform(post("/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isBadRequest());
        }
    }

    // verifyEmail

    @Nested
    @DisplayName("GET /verify-email")
    class VerifyEmail {

        @Test
        @DisplayName("should verify email with valid token")
        void shouldVerifyEmailWithValidToken() throws Exception {
            User user = userRepository.save(User.builder()
                    .name("To Verify")
                    .email("verify@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(false)
                    .emailVerificationToken("valid-token-123")
                    .emailTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                    .build());

            mockMvc.perform(get("/v1/auth/verify-email")
                            .param("token", "valid-token-123"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("verified successfully")));
        }

        @Test
        @DisplayName("should return 403 for unknown token")
        void shouldReturn403ForUnknownToken() throws Exception {
            mockMvc.perform(get("/v1/auth/verify-email")
                            .param("token", "unknown-token"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("should return 403 for expired token")
        void shouldReturn403ForExpiredToken() throws Exception {
            userRepository.save(User.builder()
                    .name("Expired")
                    .email("expired@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(false)
                    .emailVerificationToken("expired-token")
                    .emailTokenExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS))
                    .build());

            mockMvc.perform(get("/v1/auth/verify-email")
                            .param("token", "expired-token"))
                    .andExpect(status().isForbidden());
        }
    }

    // login

    @Nested
    @DisplayName("POST /login")
    class Login {

        @Test
        @DisplayName("should return tokens on successful login")
        void shouldReturnTokensOnSuccess() throws Exception {
            var request = new LoginRequest("test@nexum.dev", "senha1234");

            mockMvc.perform(post("/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                    .andExpect(jsonPath("$.email").value("test@nexum.dev"));
        }

        @Test
        @DisplayName("should return 401 for wrong password")
        void shouldReturn401ForWrongPassword() throws Exception {
            var request = new LoginRequest("test@nexum.dev", "wrongpass");

            mockMvc.perform(post("/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 401 for unknown email")
        void shouldReturn401ForUnknownEmail() throws Exception {
            var request = new LoginRequest("ghost@nexum.dev", "senha1234");

            mockMvc.perform(post("/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 403 if email not verified")
        void shouldReturn403IfNotVerified() throws Exception {
            userRepository.save(User.builder()
                    .name("Unverified")
                    .email("notverified@nexum.dev")
                    .passwordHash(passwordEncoder.encode("senha1234"))
                    .emailVerified(false)
                    .emailVerificationToken("token")
                    .emailTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                    .build());

            var request = new LoginRequest("notverified@nexum.dev", "senha1234");

            mockMvc.perform(post("/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(request)))
                    .andExpect(status().isForbidden());
        }
    }

    // refresh

    @Nested
    @DisplayName("POST /refresh")
    class Refresh {

        @Test
        @DisplayName("should return new tokens with valid refresh token")
        void shouldReturnNewTokens() throws Exception {
            MvcResult loginResult = mockMvc.perform(post("/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new LoginRequest("test@nexum.dev", "senha1234"))))
                    .andReturn();

            String refreshToken = objectMapper
                    .readTree(loginResult.getResponse().getContentAsString())
                    .get("refreshToken")
                    .asText();

            mockMvc.perform(post("/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new RefreshTokenRequest(refreshToken))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty());
        }

        @Test
        @DisplayName("should return 403 for invalid refresh token")
        void shouldReturn403ForInvalidToken() throws Exception {
            mockMvc.perform(post("/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new RefreshTokenRequest("invalid.token.here"))))
                    .andExpect(status().isForbidden());
        }
    }

    // logout

    @Nested
    @DisplayName("POST /logout")
    class Logout {

        @Test
        @DisplayName("should logout successfully")
        void shouldLogoutSuccessfully() throws Exception {
            mockMvc.perform(post("/v1/auth/logout")
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("Logged out")));
        }

        @Test
        @DisplayName("should return 401 without token")
        void shouldReturn401WithoutToken() throws Exception {
            mockMvc.perform(post("/v1/auth/logout"))
                    .andExpect(status().isUnauthorized());
        }
    }
}