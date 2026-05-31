export type Recurrence = 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL' | 'CUSTOM'

export interface PlanResponse {
    id: string
    name: string
    description: string | null
    amountCents: number
    amountFormatted: string
    recurrence: Recurrence
    recurrenceLabel: string
    customDays: number | null
    trialDays: number
    maxSubscriptions: number | null
    features: string[]
    active: boolean
    archivedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface CreatePlanRequest {
    name: string
    description?: string
    amountCents: number
    recurrence: Recurrence
    customDays?: number
    trialDays?: number
    maxSubscriptions?: number
    features?: string[]
}

export type UpdatePlanRequest = CreatePlanRequest
