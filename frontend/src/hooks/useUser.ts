import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/userService'
import { useNavigate } from 'react-router-dom'
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types/user'

export const useUserProfile = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: () => userService.getMe(),
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => userService.updateProfile(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] })
            
            if (response.message.toLowerCase().includes('verification') || response.message.toLowerCase().includes('login again')) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                queryClient.clear()
                navigate('/login?emailChanged=true')
            }
        },
    })
}

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordRequest) => userService.changePassword(data),
    })
}
