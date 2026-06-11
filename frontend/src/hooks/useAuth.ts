import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import type { RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth'

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
    })
}

export const useLogin = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: LoginRequest) => authService.login(data),
        onSuccess: () => {
            queryClient.invalidateQueries()
            navigate('/dashboard')
        },
    })
}

export const useLogout = () => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            queryClient.clear()
            navigate('/login')
        },
    })
}

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authService.forgotPassword(data),
    })
}

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
    })
}