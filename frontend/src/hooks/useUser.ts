import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types/user'

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: () => userService.getMe(),
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        },
    })
}

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),
    })
}
