import api from './authService'
import type { UserProfileResponse, UpdateProfileRequest, ChangePasswordRequest } from '../types/user'
import type { MessageResponse } from '../types/auth'

export const userService = {
    getMe: async (): Promise<UserProfileResponse> => {
        const response = await api.get<UserProfileResponse>('/v1/users/me')
        return response.data
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<MessageResponse> => {
        const response = await api.put<MessageResponse>('/v1/users/me', data)
        return response.data
    },

    changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
        const response = await api.put<MessageResponse>('/v1/users/me/password', data)
        return response.data
    },
}
