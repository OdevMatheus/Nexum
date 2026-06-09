# Dashboard Interactive Modals - Overdue & Upcoming Subscriptions Spec

**Date:** 2026-06-09
**Feature:** Overdue & Upcoming Interactive Modals with WhatsApp Contact and Date Reset

## 1. Overview
The "Faturas Atrasadas" (Overdue Subscriptions) and "A Vencer (7 dias)" (Upcoming Subscriptions) dashboard summary cards will become clickable, opening dedicated modal overlays. 
These modals will let users:
1.  **Mark as Paid ("Marcar como paga")**: Triggers the `/v1/subscriptions/{id}/pay` endpoint. The backend calculation will be adjusted so that paying a subscription resets its next due date counting from **today (the day it was clicked)**, instead of the old due date.
2.  **Contact via WhatsApp ("Contatar via WhatsApp")**: Opens a prefilled WhatsApp chat with the client's sanitized phone number, using friendly business templates adapted to whether the subscription is overdue or upcoming.
3.  **Navigate to Client & Subscription details**: Closes the modal and navigates to the client's detail page or plans detail page.

## 2. Selected Architecture & Design Decisions
*   **Modal UX**: Centered modal overlays managed in `DashboardPage.tsx` using local state (`activeModal: 'ACTIVE_SUBS' | 'MRR' | 'OVERDUE' | 'UPCOMING' | null`).
*   **WhatsApp Number Sanitization**: A helper function in the frontend will strip non-numeric characters from the client's phone field, ensuring the `https://wa.me/{phone}?text={message}` link works perfectly.
*   **Pre-filled WhatsApp Messages**:
    *   **Overdue**: *"Olá, [Nome]! Tudo bem? Passando para lembrar que a fatura da sua assinatura do plano [Plano] está pendente desde [Data]. Se precisar de ajuda para regularizar, estamos à disposição!"*
    *   **Upcoming**: *"Olá, [Nome]! Tudo bem? Passando para avisar que a fatura da sua assinatura do plano [Plano] vencerá em [Data]. Qualquer dúvida, estamos por aqui!"*

## 3. Backend Changes (Java / Spring Boot)

### 3.1 Return Client Phone in Subscription DTO
Update `SubscriptionResponse.java` to return `String clientPhone` mapped from the underlying `Client` entity:
```java
public record SubscriptionResponse(
        // ... existing fields ...
        @Schema(description = "Telefone do cliente", example = "5511999999999")
        String clientPhone,
        // ... rest of fields ...
)
```

### 3.2 Update Next Due Date Recalculation on Payment
In `SubscriptionServiceImpl.java`'s `pay(UUID subscriptionId)` method:
Update the calculation of `newNextDueDate` to start from **today (`LocalDate.now()`)** instead of the previous `subscription.getNextDueDate()`:
```java
        // OLD: LocalDate newNextDueDate = calculateNextDueDate(subscription.getNextDueDate(), subscription.getPlan());
        // NEW:
        LocalDate newNextDueDate = calculateNextDueDate(LocalDate.now(), subscription.getPlan());
```

## 4. Frontend Changes (React / Vite)

### 4.1 Type Updates
Update `frontend/src/types/subscription.ts` to include `clientPhone?: string` in the `Subscription` interface.

### 4.2 State and Data Fetching
*   In `DashboardPage.tsx`, manage active modals:
    ```typescript
    const [activeModal, setActiveModal] = useState<'ACTIVE_SUBS' | 'MRR' | 'OVERDUE' | 'UPCOMING' | null>(null);
    ```
*   Query overdue subscriptions:
    ```typescript
    const { data: overdueData, isLoading: loadingOverdue } = useSubscriptions({ status: 'OVERDUE', size: 50 });
    ```
    *Note: The query repository counts both 'OVERDUE' and 'SUSPENDED' for overdue metrics, so the list should display overdue/suspended subscriptions.*
*   Query upcoming subscriptions using the existing `useUpcomingSubscriptions()` hook from `useMetrics.ts`, or `useSubscriptions` with a date window. To keep it aligned with the metrics card, we will reuse the `upcoming` list fetched by `useUpcomingSubscriptions()`, or add a custom hook to fetch detailed subscriptions due in 7 days.
    Wait, let's see. The metrics card uses:
    `summary?.upcomingDueIn7Days`
    And `useUpcomingSubscriptions()` fetches the list of upcoming subscriptions:
    `const { data: upcoming, isLoading: loadingUpcoming } = useUpcomingSubscriptions();`
    This returns a list of type `UpcomingSubscription[]` which has `subscriptionId`, `clientName`, `planName`, `dueDate`, `amount`. This is perfect for the list, but it doesn't have `clientPhone`.
    To ensure we have access to the phone number and full details, we can load upcoming subscriptions using:
    `useSubscriptions({ nextDueDateTo: format(addDays(new Date(), 7), 'yyyy-MM-dd'), size: 50 })` (excluding overdue) or simply update the metrics endpoint. Let's filter by querying `useSubscriptions` with `nextDueDateTo` or update `/v1/metrics/upcoming` to include phone, or query `useSubscriptions` with `nextDueDateFrom` and `nextDueDateTo` in the frontend!
    Since `useSubscriptions` supports `nextDueDateFrom` and `nextDueDateTo`, we can query it easily:
    ```typescript
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const next7DaysStr = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const { data: upcomingData, isLoading: loadingUpcomingDetailed } = useSubscriptions({
        nextDueDateFrom: todayStr,
        nextDueDateTo: next7DaysStr,
        size: 50
    });
    ```
    This is extremely elegant, requires zero modifications to metrics endpoints, and gives us full `Subscription` responses (with clientPhone, planDetails, etc.)!

### 4.3 UI Modals
1.  **Overdue Modal**:
    *   Table columns: Cliente, Plano, Atrasada Desde, Ações.
    *   Actions:
        *   "Marcar como Paga" button (triggers `usePaySubscription` mutation).
        *   "WhatsApp" button (opens WA link).
2.  **Upcoming Modal**:
    *   Table columns: Cliente, Plano, Vence Em, Ações.
    *   Actions:
        *   "Marcar como Paga" button.
        *   "WhatsApp" button.

### 4.4 WhatsApp Helper Function
```typescript
const getWhatsAppLink = (phone: string | undefined, clientName: string, planName: string, date: string, type: 'OVERDUE' | 'UPCOMING') => {
    if (!phone) return '#';
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') || cleanPhone.length > 11 ? cleanPhone : `55${cleanPhone}`;
    
    const message = type === 'OVERDUE'
        ? `Olá, ${clientName}! Tudo bem? Passando para lembrar que a fatura da sua assinatura do plano ${planName} está pendente desde ${date}. Se precisar de ajuda para regularizar, estamos à disposição!`
        : `Olá, ${clientName}! Tudo bem? Passando para avisar que a fatura da sua assinatura do plano ${planName} vencerá em ${date}. Qualquer dúvida, estamos por aqui!`;
        
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};
```

## 5. Out of Scope (YAGNI)
*   Modifying database schema (the phone field already exists in the client database).
*   Automatic email billing notifications in this task.
