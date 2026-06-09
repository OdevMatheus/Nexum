import axios, { AxiosError } from 'axios'
import { translateError } from '../Utils/errorMessages.ts'
import type {
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    AuthResponse,
    MessageResponse,
    ErrorResponse,
} from '../types/auth'


export const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<ErrorResponse>
    const message = axiosError.response?.data?.message
    return message ? translateError(message) : 'Ocorreu um erro inesperado. Tente novamente.'
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponse>) => {
        const original = error.config

        const isAuthRoute = original?.url?.includes('/v1/auth/')
        if (isAuthRoute) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && original) {
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                try {
                    const { data } = await axios.post<AuthResponse>(
                        `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/v1/auth/refresh`,
                        { refreshToken }
                    )

                    localStorage.setItem('accessToken', data.accessToken)
                    localStorage.setItem('refreshToken', data.refreshToken)

                    original.headers.Authorization = `Bearer ${data.accessToken}`
                    return api(original)
                } catch {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    window.location.href = '/login'
                }
            } else {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export const authService = {
    register: async (data: RegisterRequest): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>('/v1/auth/register', data)
        return response.data

    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/v1/auth/login', data)
        localStorage.setItem('accessToken', response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        return response.data
    },

    logout: async (): Promise<MessageResponse> => {
        const response = await api.post<MessageResponse>('/v1/auth/logout')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return response.data
    },

    refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/v1/auth/refresh', data)
        return response.data
    },

    verifyEmail: async (token: string): Promise<MessageResponse> => {
        const response = await api.get<MessageResponse>(`/v1/auth/verify-email?token=${token}`)
        return response.data
    },

}

export default api