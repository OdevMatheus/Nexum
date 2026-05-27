export interface CreateClientRequest {
    name: string
    email: string
    phone?: string
    document?: string
}

export interface UpdateClientRequest {
    name: string
    email: string
    phone?: string
    document?: string
}

export interface ClientResponse {
    id: string
    name: string
    email: string
    phone: string | null
    document: string | null
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface PageResponse<T> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}