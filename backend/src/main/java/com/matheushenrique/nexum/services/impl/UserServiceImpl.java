package com.matheushenrique.nexum.services.impl;

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
import com.matheushenrique.nexum.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMe(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }

    @Override
    @Transactional
    public MessageResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!user.getEmail().equalsIgnoreCase(request.email())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new EmailAlreadyInUseException("Email is already in use: " + request.email());
            }

            user.setEmail(request.email());
            user.setEmailVerified(false);

            String token = UUID.randomUUID().toString();
            user.setEmailVerificationToken(token);
            user.setEmailTokenExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));

            user.setRefreshToken(null);
            user.setRefreshTokenExpiresAt(null);

            user.setName(request.name());
            userRepository.save(user);

            emailService.sendVerificationEmail(user.getEmail(), user.getName(), token);

            return new MessageResponse("Profile updated successfully. A verification email has been sent to your new email address. Please verify your email and login again.");
        }

        user.setName(request.name());
        userRepository.save(user);

        return new MessageResponse("Profile updated successfully.");
    }

    @Override
    @Transactional
    public MessageResponse changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new IncorrectPasswordException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return new MessageResponse("Password updated successfully.");
    }
}