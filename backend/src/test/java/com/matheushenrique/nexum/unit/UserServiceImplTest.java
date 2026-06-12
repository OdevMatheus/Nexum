package com.matheushenrique.nexum.unit;

import com.matheushenrique.nexum.dtos.request.ChangePasswordRequest;
import com.matheushenrique.nexum.dtos.request.UpdateProfileRequest;
import com.matheushenrique.nexum.dtos.response.MessageResponse;
import com.matheushenrique.nexum.dtos.response.UserResponse;
import com.matheushenrique.nexum.entities.User;
import com.matheushenrique.nexum.repositories.UserRepository;
import com.matheushenrique.nexum.security.EmailService;
import com.matheushenrique.nexum.security.exceptions.EmailAlreadyInUseException;
import com.matheushenrique.nexum.security.exceptions.IncorrectPasswordException;
import com.matheushenrique.nexum.security.exceptions.ResourceNotFoundException;
import com.matheushenrique.nexum.services.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl")
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private final UUID userId = UUID.randomUUID();
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(userId)
                .name("Matheus Teste")
                .email("matheus.test@nexum.com")
                .passwordHash("encoded_password")
                .emailVerified(true)
                .refreshToken("old_refresh_token")
                .build();
    }

    @Nested
    @DisplayName("getMe")
    class GetMe {

        @Test
        @DisplayName("should return UserResponse when user exists")
        void shouldReturnUserResponseWhenUserExists() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));

            UserResponse response = userService.getMe(userId);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(userId);
            assertThat(response.name()).isEqualTo("Matheus Teste");
            assertThat(response.email()).isEqualTo("matheus.test@nexum.com");
            verify(userRepository).findById(userId);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when user does not exist")
        void shouldThrowResourceNotFoundExceptionWhenUserDoesNotExist() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getMe(userId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("User not found with id: " + userId);
        }
    }

    @Nested
    @DisplayName("updateProfile")
    class UpdateProfile {

        @Test
        @DisplayName("should update only name when email is unchanged")
        void shouldUpdateOnlyNameWhenEmailIsUnchanged() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            UpdateProfileRequest request = new UpdateProfileRequest("Matheus Editado", "matheus.test@nexum.com");

            MessageResponse response = userService.updateProfile(userId, request);

            assertThat(response.message()).isEqualTo("Profile updated successfully.");
            assertThat(user.getName()).isEqualTo("Matheus Editado");
            assertThat(user.getEmail()).isEqualTo("matheus.test@nexum.com");
            assertThat(user.isEmailVerified()).isTrue(); // Unchanged
            verify(userRepository).save(user);
            verifyNoInteractions(emailService);
        }

        @Test
        @DisplayName("should update name and email, invalidate session, and send verification email when email is changed")
        void shouldUpdateNameEmailAndRequestVerificationWhenEmailIsChanged() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmail("novo@nexum.com")).thenReturn(false);
            UpdateProfileRequest request = new UpdateProfileRequest("Matheus Editado", "novo@nexum.com");

            MessageResponse response = userService.updateProfile(userId, request);

            assertThat(response.message()).contains("A verification email has been sent to your new email address");
            assertThat(user.getName()).isEqualTo("Matheus Editado");
            assertThat(user.getEmail()).isEqualTo("novo@nexum.com");
            assertThat(user.isEmailVerified()).isFalse();
            assertThat(user.getEmailVerificationToken()).isNotNull();
            assertThat(user.getEmailTokenExpiresAt()).isNotNull();
            assertThat(user.getRefreshToken()).isNull(); // Session invalidated
            assertThat(user.getRefreshTokenExpiresAt()).isNull();

            verify(userRepository).save(user);
            verify(emailService).sendVerificationEmail(eq("novo@nexum.com"), eq("Matheus Editado"), anyString());
        }

        @Test
        @DisplayName("should throw EmailAlreadyInUseException when new email is already registered")
        void shouldThrowExceptionWhenNewEmailIsAlreadyRegistered() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(userRepository.existsByEmail("existente@nexum.com")).thenReturn(true);
            UpdateProfileRequest request = new UpdateProfileRequest("Matheus Editado", "existente@nexum.com");

            assertThatThrownBy(() -> userService.updateProfile(userId, request))
                    .isInstanceOf(EmailAlreadyInUseException.class)
                    .hasMessageContaining("Email is already in use: existente@nexum.com");

            verify(userRepository, never()).save(any(User.class));
            verifyNoInteractions(emailService);
        }
    }

    @Nested
    @DisplayName("changePassword")
    class ChangePassword {

        @Test
        @DisplayName("should update password when current password is correct")
        void shouldUpdatePasswordWhenCurrentPasswordIsCorrect() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("senha_atual", "encoded_password")).thenReturn(true);
            when(passwordEncoder.encode("nova_senha123")).thenReturn("new_encoded_password");

            ChangePasswordRequest request = new ChangePasswordRequest("senha_atual", "nova_senha123");

            MessageResponse response = userService.changePassword(userId, request);

            assertThat(response.message()).isEqualTo("Password updated successfully.");
            assertThat(user.getPasswordHash()).isEqualTo("new_encoded_password");
            verify(userRepository).save(user);
        }

        @Test
        @DisplayName("should throw IncorrectPasswordException when current password is incorrect")
        void shouldThrowExceptionWhenCurrentPasswordIsIncorrect() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("senha_errada", "encoded_password")).thenReturn(false);

            ChangePasswordRequest request = new ChangePasswordRequest("senha_errada", "nova_senha123");

            assertThatThrownBy(() -> userService.changePassword(userId, request))
                    .isInstanceOf(IncorrectPasswordException.class)
                    .hasMessageContaining("Current password is incorrect");

            verify(userRepository, never()).save(any(User.class));
        }
    }
}