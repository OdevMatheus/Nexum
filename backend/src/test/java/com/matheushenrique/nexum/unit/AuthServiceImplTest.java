package com.matheushenrique.nexum.unit;

import com.matheushenrique.nexum.dtos.request.LoginRequest;
import com.matheushenrique.nexum.dtos.request.RefreshTokenRequest;
import com.matheushenrique.nexum.dtos.request.RegisterRequest;
import com.matheushenrique.nexum.dtos.request.ForgotPasswordRequest;
import com.matheushenrique.nexum.dtos.request.ResetPasswordRequest;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.UserRepository;
import com.matheushenrique.nexum.security.EmailService;
import com.matheushenrique.nexum.security.JwtService;
import com.matheushenrique.nexum.security.exceptions.EmailAlreadyInUseException;
import com.matheushenrique.nexum.security.exceptions.EmailNotVerifiedException;
import com.matheushenrique.nexum.security.exceptions.InvalidCredentialsException;
import com.matheushenrique.nexum.security.exceptions.InvalidTokenException;
import com.matheushenrique.nexum.services.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthServiceImpl")
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User verifiedUser;
    private User unverifiedUser;
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        verifiedUser = User.builder()
                .id(userId)
                .name("Matheus")
                .email("matheus@example.com")
                .passwordHash("hashed_password")
                .emailVerified(true)
                .refreshToken("old_refresh_token")
                .refreshTokenExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .build();

        unverifiedUser = User.builder()
                .id(UUID.randomUUID())
                .name("Unverified")
                .email("unverified@example.com")
                .passwordHash("hashed_password")
                .emailVerified(false)
                .emailVerificationToken("valid_token")
                .emailTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
    }

    // register

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("should register new user and send verification email")
        void shouldRegisterNewUser() {
            var request = new RegisterRequest("Matheus", "new@example.com", "senha1234");

            when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            var response = authService.register(request);

            assertThat(response.message()).contains("Registration successful");
            verify(emailService).sendVerificationEmail(eq("new@example.com"), eq("Matheus"), anyString());
            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("should resend verification email if user exists but is not verified")
        void shouldResendEmailIfNotVerified() {
            var request = new RegisterRequest("Unverified", "unverified@example.com", "senha1234");

            when(userRepository.findByEmail("unverified@example.com")).thenReturn(Optional.of(unverifiedUser));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            var response = authService.register(request);

            assertThat(response.message()).contains("new verification email");
            verify(emailService).sendVerificationEmail(eq("unverified@example.com"), anyString(), anyString());
        }

        @Test
        @DisplayName("should throw EmailAlreadyInUseException if email is already verified")
        void shouldThrowIfEmailAlreadyVerified() {
            var request = new RegisterRequest("Matheus", "matheus@example.com", "senha1234");

            when(userRepository.findByEmail("matheus@example.com")).thenReturn(Optional.of(verifiedUser));

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(EmailAlreadyInUseException.class);

            verify(userRepository, never()).save(any());
            verify(emailService, never()).sendVerificationEmail(any(), any(), any());
        }
    }

    // verifyEmail

    @Nested
    @DisplayName("verifyEmail")
    class VerifyEmail {

        @Test
        @DisplayName("should verify email with valid token")
        void shouldVerifyEmailWithValidToken() {
            when(userRepository.findByEmailVerificationToken("valid_token"))
                    .thenReturn(Optional.of(unverifiedUser));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            var response = authService.verifyEmail("valid_token");

            assertThat(response.message()).contains("verified successfully");
            assertThat(unverifiedUser.isEmailVerified()).isTrue();
            assertThat(unverifiedUser.getEmailVerificationToken()).isNull();
        }

        @Test
        @DisplayName("should throw InvalidTokenException for unknown token")
        void shouldThrowForUnknownToken() {
            when(userRepository.findByEmailVerificationToken("unknown")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.verifyEmail("unknown"))
                    .isInstanceOf(InvalidTokenException.class);
        }

        @Test
        @DisplayName("should throw InvalidTokenException for expired token")
        void shouldThrowForExpiredToken() {
            unverifiedUser.setEmailTokenExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS));

            when(userRepository.findByEmailVerificationToken("valid_token"))
                    .thenReturn(Optional.of(unverifiedUser));

            assertThatThrownBy(() -> authService.verifyEmail("valid_token"))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessageContaining("expired");
        }
    }

    // login

    @Nested
    @DisplayName("login")
    class Login {

        @Test
        @DisplayName("should return tokens on successful login")
        void shouldReturnTokensOnSuccess() {
            var request = new LoginRequest("matheus@example.com", "senha1234");

            when(userRepository.findByEmail("matheus@example.com")).thenReturn(Optional.of(verifiedUser));
            when(passwordEncoder.matches("senha1234", "hashed_password")).thenReturn(true);
            when(jwtService.generateAccessToken(any(), anyString())).thenReturn("access_token");
            when(jwtService.generateRefreshToken(any(), anyString())).thenReturn("refresh_token");
            when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            var response = authService.login(request);

            assertThat(response.accessToken()).isEqualTo("access_token");
            assertThat(response.refreshToken()).isEqualTo("refresh_token");
            assertThat(response.email()).isEqualTo("matheus@example.com");
        }

        @Test
        @DisplayName("should throw InvalidCredentialsException for unknown email")
        void shouldThrowForUnknownEmail() {
            when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(new LoginRequest("unknown@example.com", "senha1234")))
                    .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        @DisplayName("should throw InvalidCredentialsException for wrong password")
        void shouldThrowForWrongPassword() {
            when(userRepository.findByEmail("matheus@example.com")).thenReturn(Optional.of(verifiedUser));
            when(passwordEncoder.matches("wrong", "hashed_password")).thenReturn(false);

            assertThatThrownBy(() -> authService.login(new LoginRequest("matheus@example.com", "wrong")))
                    .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        @DisplayName("should throw EmailNotVerifiedException if email not verified")
        void shouldThrowIfEmailNotVerified() {
            when(userRepository.findByEmail("unverified@example.com")).thenReturn(Optional.of(unverifiedUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

            assertThatThrownBy(() -> authService.login(new LoginRequest("unverified@example.com", "senha1234")))
                    .isInstanceOf(EmailNotVerifiedException.class);
        }
    }

    // refresh

    @Nested
    @DisplayName("refresh")
    class Refresh {

        @Test
        @DisplayName("should return new tokens with valid refresh token")
        void shouldReturnNewTokens() {
            var request = new RefreshTokenRequest("old_refresh_token");

            when(jwtService.isTokenValid("old_refresh_token")).thenReturn(true);
            when(jwtService.extractUserId("old_refresh_token")).thenReturn(userId);
            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));
            when(jwtService.generateAccessToken(any(), anyString())).thenReturn("new_access");
            when(jwtService.generateRefreshToken(any(), anyString())).thenReturn("new_refresh");
            when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            var response = authService.refresh(request);

            assertThat(response.accessToken()).isEqualTo("new_access");
            assertThat(response.refreshToken()).isEqualTo("new_refresh");
        }

        @Test
        @DisplayName("should throw InvalidTokenException for invalid JWT")
        void shouldThrowForInvalidJwt() {
            when(jwtService.isTokenValid("bad_token")).thenReturn(false);

            assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("bad_token")))
                    .isInstanceOf(InvalidTokenException.class);
        }

        @Test
        @DisplayName("should throw InvalidTokenException if refresh token does not match stored token")
        void shouldThrowIfTokenMismatch() {
            verifiedUser.setRefreshToken("different_token");

            when(jwtService.isTokenValid("old_refresh_token")).thenReturn(true);
            when(jwtService.extractUserId("old_refresh_token")).thenReturn(userId);
            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));

            assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("old_refresh_token")))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessageContaining("expired or already used");
        }

        @Test
        @DisplayName("should throw InvalidTokenException if refresh token is expired")
        void shouldThrowIfTokenExpired() {
            verifiedUser.setRefreshTokenExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS));

            when(jwtService.isTokenValid("old_refresh_token")).thenReturn(true);
            when(jwtService.extractUserId("old_refresh_token")).thenReturn(userId);
            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));

            assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest("old_refresh_token")))
                    .isInstanceOf(InvalidTokenException.class);
        }
    }

    // logout

    @Nested
    @DisplayName("logout")
    class Logout {

        @Test
        @DisplayName("should clear refresh token on logout")
        void shouldClearRefreshToken() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(verifiedUser));
            when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

            var response = authService.logout(userId);

            assertThat(response.message()).contains("Logged out");
            assertThat(verifiedUser.getRefreshToken()).isNull();
            assertThat(verifiedUser.getRefreshTokenExpiresAt()).isNull();
        }

        @Test
        @DisplayName("should throw RuntimeException if user not found")
        void shouldThrowIfUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.logout(userId))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    // forgotPassword

    @Nested
    @DisplayName("forgotPassword")
    class ForgotPassword {

        @Test
        @DisplayName("should set password reset token and send email if user exists")
        void shouldSetResetTokenAndSendEmail() {
            var request = new ForgotPasswordRequest("matheus@example.com");

            when(userRepository.findByEmail("matheus@example.com")).thenReturn(Optional.of(verifiedUser));
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            var response = authService.forgotPassword(request);

            assertThat(response.message()).contains("Se o e-mail estiver cadastrado");
            verify(userRepository).save(verifiedUser);
            assertThat(verifiedUser.getPasswordResetToken()).isNotNull();
            assertThat(verifiedUser.getPasswordResetTokenExpiresAt()).isNotNull();
            verify(emailService).sendPasswordResetEmail(eq("matheus@example.com"), eq("Matheus"), anyString());
        }

        @Test
        @DisplayName("should do nothing but return success if user does not exist")
        void shouldDoNothingIfUserDoesNotExist() {
            var request = new ForgotPasswordRequest("nonexistent@example.com");

            when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

            var response = authService.forgotPassword(request);

            assertThat(response.message()).contains("Se o e-mail estiver cadastrado");
            verify(userRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), any(), any());
        }
    }

    // resetPassword

    @Nested
    @DisplayName("resetPassword")
    class ResetPassword {

        @Test
        @DisplayName("should change password with valid token")
        void shouldChangePasswordWithValidToken() {
            verifiedUser.setPasswordResetToken("reset_token");
            verifiedUser.setPasswordResetTokenExpiresAt(Instant.now().plus(1, ChronoUnit.HOURS));

            var request = new ResetPasswordRequest("reset_token", "new_secure_password");

            when(userRepository.findByPasswordResetToken("reset_token")).thenReturn(Optional.of(verifiedUser));
            when(passwordEncoder.encode("new_secure_password")).thenReturn("new_encoded_password");
            when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

            var response = authService.resetPassword(request);

            assertThat(response.message()).contains("sucesso");
            assertThat(verifiedUser.getPasswordHash()).isEqualTo("new_encoded_password");
            assertThat(verifiedUser.getPasswordResetToken()).isNull();
            assertThat(verifiedUser.getPasswordResetTokenExpiresAt()).isNull();
            verify(userRepository).save(verifiedUser);
        }

        @Test
        @DisplayName("should throw InvalidTokenException for unknown token")
        void shouldThrowForUnknownToken() {
            var request = new ResetPasswordRequest("unknown_token", "new_secure_password");

            when(userRepository.findByPasswordResetToken("unknown_token")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(InvalidTokenException.class);
        }

        @Test
        @DisplayName("should throw InvalidTokenException for expired token")
        void shouldThrowForExpiredToken() {
            verifiedUser.setPasswordResetToken("expired_token");
            verifiedUser.setPasswordResetTokenExpiresAt(Instant.now().minus(1, ChronoUnit.HOURS));

            var request = new ResetPasswordRequest("expired_token", "new_secure_password");

            when(userRepository.findByPasswordResetToken("expired_token")).thenReturn(Optional.of(verifiedUser));

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(InvalidTokenException.class)
                    .hasMessageContaining("expired");
        }
    }
}