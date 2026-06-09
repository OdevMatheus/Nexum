# Dashboard Interactive Modals - MRR Detailing Design Specification

**Date:** 2026-06-09
**Feature:** Clickable Dashboard Cards - MRR Interactive Modal

## 1. Overview
The MRR (Monthly Recurring Revenue) card on the main dashboard will become interactive. Clicking it will open a centralized modal overlay containing a "mini-dashboard" of the MRR distribution by plan, as well as a list of individual client/subscription cycles contributing to the MRR for the current month.

To ensure perfect consistency, both the distribution charts and the contributors list will be calculated using the pending subscription cycles of the current month (matching the formula of the dashboard MRR card).

## 2. Selected Architecture
*   **Modal UX:** A central modal overlay on the `DashboardPage.tsx` using local state (`activeModal: 'ACTIVE_SUBS' | 'MRR' | null`).
*   **MRR Distribution:** A horizontal progress bar chart showing the sum of MRR contributed by each plan in the current month.
*   **MRR Contributors:** A paginated or ordered list of pending cycles for the current month, showing Client, Plan, Due Date, and Value.

## 3. Backend Changes (Java / Spring Boot)

### 3.1 DTOs
We will create two new DTOs (Java records) under `backend/src/main/java/com/matheushenrique/nexum/dtos/response/`:

1.  **`MrrDistributionResponse.java`**:
    ```java
    package com.matheushenrique.nexum.dtos.response;

    import io.swagger.v3.oas.annotations.media.Schema;
    import java.util.UUID;

    public record MrrDistributionResponse(
            @Schema(description = "ID do plano", example = "123e4567-e89b-12d3-a456-426614174000")
            UUID planId,

            @Schema(description = "Nome do plano", example = "Plano Básico")
            String planName,

            @Schema(description = "Soma do MRR em centavos", example = "150000")
            long amount
    ) {}
    ```

2.  **`MrrContributorResponse.java`**:
    ```java
    package com.matheushenrique.nexum.dtos.response;

    import io.swagger.v3.oas.annotations.media.Schema;
    import java.time.LocalDate;
    import java.util.UUID;

    public record MrrContributorResponse(
            @Schema(description = "ID da assinatura", example = "123e4567-e89b-12d3-a456-426614174000")
            UUID subscriptionId,

            @Schema(description = "Nome do cliente", example = "João Silva")
            String clientName,

            @Schema(description = "ID do cliente", example = "123e4567-e89b-12d3-a456-426614174000")
            UUID clientId,

            @Schema(description = "Nome do plano", example = "Plano Básico")
            String planName,

            @Schema(description = "ID do plano", example = "123e4567-e89b-12d3-a456-426614174000")
            UUID planId,

            @Schema(description = "Data de vencimento do ciclo", example = "2026-06-15")
            LocalDate dueDate,

            @Schema(description = "Valor da fatura do ciclo em centavos", example = "9900")
            long amount
    ) {}
    ```

### 3.2 Repositories
We will add two new query methods to `SubscriptionCycleRepository.java`:

1.  **`sumMrrByPlan`**:
    ```java
    @Query("""
    SELECT new com.matheushenrique.nexum.dtos.response.MrrDistributionResponse(p.id, p.name, COALESCE(SUM(c.amountCents), 0))
    FROM SubscriptionCycle c
    JOIN c.subscription s
    JOIN s.plan p
    WHERE s.owner.id = :ownerId
      AND c.status = 'PENDING'
      AND YEAR(c.dueDate) = :year
      AND MONTH(c.dueDate) = :month
    GROUP BY p.id, p.name
    ORDER BY SUM(c.amountCents) DESC
    """)
    List<MrrDistributionResponse> sumMrrByPlan(
            @Param("ownerId") UUID ownerId,
            @Param("year") int year,
            @Param("month") int month
    );
    ```

2.  **`findPendingCyclesByMonth`**:
    ```java
    @Query("""
    SELECT c FROM SubscriptionCycle c
    JOIN FETCH c.subscription s
    JOIN FETCH s.client cl
    JOIN FETCH s.plan p
    WHERE s.owner.id = :ownerId
      AND c.status = 'PENDING'
      AND YEAR(c.dueDate) = :year
      AND MONTH(c.dueDate) = :month
    ORDER BY c.dueDate ASC
    """)
    List<SubscriptionCycle> findPendingCyclesByMonth(
            @Param("ownerId") UUID ownerId,
            @Param("year") int year,
            @Param("month") int month
    );
    ```

### 3.3 Services
*   **`MetricsService.java`**: Add two new method definitions:
    *   `List<MrrDistributionResponse> getMrrDistribution(UUID ownerId)`
    *   `List<MrrContributorResponse> getMrrContributors(UUID ownerId)`
*   **`MetricsServiceImpl.java`**: Implement the methods using the current month/year and mapped queries from `SubscriptionCycleRepository`.
    *   `getMrrContributors` will map the entity `SubscriptionCycle` list to a list of `MrrContributorResponse`.

### 3.4 Controllers
*   **`MetricsController.java`**: Add two new `GET` endpoints:
    *   `GET /v1/metrics/mrr-by-plan`: Returns `List<MrrDistributionResponse>`
    *   `GET /v1/metrics/mrr-contributors`: Returns `List<MrrContributorResponse>`

---

## 4. Frontend Changes (React / Vite)

### 4.1 State & Routing
*   No new pages/routes are needed.
*   Update state in `DashboardPage.tsx`:
    ```typescript
    const [activeModal, setActiveModal] = useState<'ACTIVE_SUBS' | 'MRR' | null>(null);
    ```

### 4.2 Services & Hooks
*   **`metricsService.ts`**:
    *   Add `getMrrByPlan()` to fetch `/v1/metrics/mrr-by-plan`.
    *   Add `getMrrContributors()` to fetch `/v1/metrics/mrr-contributors`.
*   **`useMetrics.ts`**:
    *   Add custom react-query hook `useMrrByPlan()`.
    *   Add custom react-query hook `useMrrContributors()`.

### 4.3 UI Updates (`DashboardPage.tsx`)
1.  **Card Interactivity:**
    *   Make the "MRR" summary card clickable by adding `cursor-pointer`, hover styling (`hover:border-rose-500/50` or `hover:border-emerald-500/50`), and `onClick={() => setActiveModal('MRR')}`.
2.  **MRR Modal Render:**
    *   Construct the central modal overlay inside an `<AnimatePresence>` block when `activeModal === 'MRR'`.
    *   **Header:** "Detalhamento: MRR" with close button.
    *   **Top Section:** Visual MRR progress bars showing distribution of MRR amounts per plan and percentages.
    *   **Bottom Section:** Contributor cycles list table displaying Client Name (clickable to detail), Plan Name (clickable to detail), Due Date (formatted `dd/MM/yyyy`), and Amount (formatted in BRL).

---

## 5. Out of Scope (YAGNI)
*   Any extra editing/creating forms in the modal.
*   Modals for Overdue or Upcoming summary cards in this specific task.
