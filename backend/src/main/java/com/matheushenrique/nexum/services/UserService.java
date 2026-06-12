package com.matheushenrique.nexum.services;

import com.matheushenrique.nexum.dtos.request.ChangePasswordRequest;
import com.matheushenrique.nexum.dtos.request.UpdateProfileRequest;
import com.matheushenrique.nexum.dtos.response.MessageResponse;
import com.matheushenrique.nexum.dtos.response.UserResponse;
import java.util.UUID;

public interface UserService {
    UserResponse getMe(UUID userId);
    MessageResponse updateProfile(UUID userId, UpdateProfileRequest request);
    MessageResponse changePassword(UUID userId, ChangePasswordRequest request);
}