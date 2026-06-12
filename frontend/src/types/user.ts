export interface UserProfileResponse {
    id: string;
    name: string;
    email: string;
}

export interface UpdateProfileRequest {
    name: string;
    email: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
