export interface MetricsSummary {
    activeSubscriptions: number;
    overdueSubscriptions: number;
    upcomingDueIn7Days: number;
    mrr: number; // in cents
}

export interface MonthlyRevenue {
    year: number;
    month: number;
    label: string;
    amount: number; // in cents
}

export interface RecentPayment {
    cycleId: string;
    subscriptionId: string;
    clientName: string;
    planName: string;
    dueDate: string;
    status: string;
    amount: number; // in cents
}

export interface UpcomingSubscription {
    subscriptionId: string;
    clientName: string;
    planName: string;
    dueDate: string;
    amount: number; // in cents
}

export interface PlanDistribution {
    planId: string;
    planName: string;
    count: number;
}
