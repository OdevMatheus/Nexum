export interface RegisterRequest {
    name: string
    email: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RefreshTokenRequest {
    refreshToken: string
}

export interface AuthResponse {
    userId: string
    name: string
    email: string
    accessToken: string
    refreshToken: string
}

export interface MessageResponse {
    message: string
}

export interface ErrorResponse {
    status: number
    error: string
    message: string
    timestamp: string
}