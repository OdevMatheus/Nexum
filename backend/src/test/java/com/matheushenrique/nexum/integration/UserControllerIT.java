package com.matheushenrique.nexum.integration;

import com.matheushenrique.nexum.config.IntegrationTestBase;
import com.matheushenrique.nexum.dtos.request.ChangePasswordRequest;
import com.matheushenrique.nexum.dtos.request.UpdateProfileRequest;
import com.matheushenrique.nexum.entities.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("UserController IT")
class UserControllerIT extends IntegrationTestBase {

    @Nested
    @DisplayName("GET /v1/users/me")
    class GetMe {

        @Test
        @DisplayName("should return current authenticated user profile")
        void shouldReturnCurrentProfile() throws Exception {
            mockMvc.perform(get("/v1/users/me")
                            .header("Authorization", bearer()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(authenticatedUserId.toString()))
                    .andExpect(jsonPath("$.name").value("Test User"))
                    .andExpect(jsonPath("$.email").value("test@example.com"));
        }

        @Test
        @DisplayName("should return 401 when request is not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(get("/v1/users/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("PUT /v1/users/me")
    class UpdateProfile {

        @Test
        @DisplayName("should update name when email is unchanged")
        void shouldUpdateNameWhenEmailUnchanged() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest("Matheus Editado", "test@example.com");

            mockMvc.perform(put("/v1/users/me")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Profile updated successfully."));

            // Verify in DB
            User updatedUser = userRepository.findById(authenticatedUserId).orElseThrow();
            assert(updatedUser.getName().equals("Matheus Editado"));
            assert(updatedUser.getEmail().equals("test@example.com"));
            assert(updatedUser.isEmailVerified());
        }

        @Test
        @DisplayName("should update name and record pending email, leaving current email active when email is changed")
        void shouldTriggerVerificationWhenEmailIsChanged() throws Exception {
            UpdateProfileRequest request = new UpdateProfileRequest("Matheus Editado", "novo.email@example.com");

            mockMvc.perform(put("/v1/users/me")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("verification link has been sent")));

            // Verify in DB
            User updatedUser = userRepository.findById(authenticatedUserId).orElseThrow();
            assert(updatedUser.getName().equals("Matheus Editado"));
            assert(updatedUser.getEmail().equals("test@example.com"));
            assert(updatedUser.getPendingEmail().equals("novo.email@example.com"));
            assert(updatedUser.isEmailVerified());
            assert(updatedUser.getEmailVerificationToken() != null);
            assert(updatedUser.getRefreshToken() != null);
        }

        @Test
        @DisplayName("should return 400 when email is already in use by another user")
        void shouldReturn400WhenEmailAlreadyInUse() throws Exception {
            // Create another user
            userRepository.save(User.builder()
                    .name("Other User")
                    .email("other@example.com")
                    .passwordHash(passwordEncoder.encode("Password123!"))
                    .emailVerified(true)
                    .build());

            UpdateProfileRequest request = new UpdateProfileRequest("Matheus Editado", "other@example.com");

            mockMvc.perform(put("/v1/users/me")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Email is already in use: other@example.com"));
        }
    }

    @Nested
    @DisplayName("PUT /v1/users/me/password")
    class ChangePassword {

        @Test
        @DisplayName("should update password when current password is correct")
        void shouldUpdatePasswordWhenCorrect() throws Exception {
            // "password" is the default password seeded by IntegrationTestBase
            ChangePasswordRequest request = new ChangePasswordRequest("password", "NewPassword123!");

            mockMvc.perform(put("/v1/users/me/password")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Password updated successfully."));

            // Verify we can login with the new password
            User updatedUser = userRepository.findById(authenticatedUserId).orElseThrow();
            assert(passwordEncoder.matches("NewPassword123!", updatedUser.getPasswordHash()));
        }

        @Test
        @DisplayName("should return 400 when current password is incorrect")
        void shouldReturn400WhenCurrentPasswordIsIncorrect() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest("wrong_password", "NewPassword123!");

            mockMvc.perform(put("/v1/users/me/password")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message").value("Current password is incorrect"));
        }

        @Test
        @DisplayName("should return 400 when new password is too short")
        void shouldReturn400WhenNewPasswordTooShort() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest("password", "short");

            mockMvc.perform(put("/v1/users/me/password")
                            .header("Authorization", bearer())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors", hasItem("Password must be at least 8 characters")));
        }
    }
}