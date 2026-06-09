# Dashboard Interactive Charts - Client Growth Line Chart Spec

**Date:** 2026-06-09
**Feature:** SVG-based Client Growth Line Chart with Interactive Tooltips & Percentage Calculations

## 1. Overview
We will replace the existing "Receita Mensal" (Monthly Revenue) column chart on the dashboard with a premium, clean **"Crescimento de Clientes" (Client Growth)** line chart. 
The chart will:
1.  Display a continuous line of cumulative registered clients over the last 6 months.
2.  Use a sleek, modern visual aesthetic similar to cryptocurrency/Bitcoin charts (smooth colored line with a soft linear gradient fading out beneath it).
3.  Include interactive hover tooltips that display:
    - The cumulative client count for that month.
    - The percentage growth compared to the previous month (e.g., `+12%`).

## 2. Selected Architecture & Design Decisions
*   **Database-Agnostic Calculation**: To ensure seamless compatibility with both PostgreSQL in production and H2 in integration tests, the cumulative growth calculation will be performed in Java in-memory by fetching the list of clients and grouping them by creation month.
*   **Vanilla SVG/CSS Chart**: We will build the chart using a lightweight, responsive `<svg>` element with coordinates calculated in-react. This avoids the overhead and security risks of massive charting libraries, ensuring lightning-fast load times and perfect visual consistency.
*   **Bitcoin Chart Aesthetics**:
    *   Line stroke: `stroke-rose-500` (`#f43f5e`).
    *   Area Fill: A `<linearGradient>` from `rgba(244, 63, 94, 0.15)` at the top to `rgba(244, 63, 94, 0)` at the bottom.
    *   Hover dots: Interactive `<circle>` elements that grow on hover and trigger floating HTML tooltips showing count and percentage growth.

## 3. Backend Changes (Java / Spring Boot)

### 3.1 DTO Response
Create `ClientGrowthResponse.java` under `com.matheushenrique.nexum.dtos.response`:
```java
package com.matheushenrique.nexum.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record ClientGrowthResponse(
        @Schema(description = "Ano", example = "2026")
        int year,

        @Schema(description = "Mês", example = "6")
        int month,

        @Schema(description = "Nome resumido do mês", example = "Jun")
        String label,

        @Schema(description = "Quantidade de clientes acumulados até este mês", example = "42")
        long count
) {}
```

### 3.2 Repository Method
Add to `ClientRepository.java`:
```java
    List<Client> findAllByOwnerId(UUID ownerId);
```
Ensure `java.util.List` is imported.

### 3.3 Service Update
*   **`MetricsService.java`**: Add definition `List<ClientGrowthResponse> getClientGrowth(UUID ownerId);`
*   **`MetricsServiceImpl.java`**: Implement the method to calculate cumulative counts for the last 6 months.

### 3.4 Controller Endpoint
*   **`MetricsController.java`**: Add a new `GET` mapping:
    ```java
    @GetMapping("/client-growth")
    @Operation(summary = "Get Client Growth Over Time", description = "Retorna o crescimento acumulado de clientes registrados nos últimos 6 meses")
    public ResponseEntity<List<ClientGrowthResponse>> clientGrowth(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(metricsService.getClientGrowth(UUID.fromString(user.getUsername())));
    }
    ```

## 4. Frontend Changes (React / Vite)

### 4.1 Type Updates
Add `ClientGrowth` interface to `frontend/src/types/metrics.ts`:
```typescript
export interface ClientGrowth {
    year: number;
    month: number;
    label: string;
    count: number;
}
```

### 4.2 Services & Hooks
*   **`metricsService.ts`**: Add `getClientGrowth(): Promise<ClientGrowth[]>` to query `/v1/metrics/client-growth`.
*   **`useMetrics.ts`**: Add custom React Query hook `useClientGrowth()`.

### 4.3 UI Update (`DashboardPage.tsx`)
*   Replace the entire Monthly Revenue chart block with the **Client Growth** line chart.
*   Calculate coordinates:
    *   Determine the minimum value and range to auto-scale the SVG Y-axis.
    *   Generate SVG `<path d="..." />` using calculated coordinate points for 6 months.
    *   Add a linear gradient for the area underneath the line.
    *   Implement hovering states and tooltip display displaying client count and percentage change:
        $$\text{Porcentagem} = \frac{V_{\text{atual}} - V_{\text{anterior}}}{V_{\text{anterior}}} \times 100$$

## 5. Out of Scope (YAGNI)
*   Chart zooming and panning.
*   Displaying growth beyond 6 months in this specific view.
