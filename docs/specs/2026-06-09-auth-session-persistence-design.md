# Authentication Session Persistence Specification

**Date:** 2026-06-09
**Feature:** Persistent 7-Day Session with Automatic Dashboard Redirection

## 1. Overview
Currently, the application stores the JWT `accessToken` in `sessionStorage` and the `refreshToken` in `localStorage`. Since `sessionStorage` is cleared whenever the browser tab or window is closed, users are logged out immediately upon closing the tab, despite having a valid `refreshToken` in `localStorage`. 

To provide a seamless, premium SaaS experience (similar to major industry platforms), we will:
1.  **Persist sessions**: Change `sessionStorage` to `localStorage` for the `accessToken` so it survives tab closes.
2.  **Auto-Redirect Logged-in Users**: Automatically redirect authenticated users (users with valid tokens in `localStorage`) away from the `/login` and `/register` landing pages directly into `/dashboard`.
3.  **Clean Logouts**: Clear all tokens from `localStorage` ONLY when the user explicitly clicks "Sair" (Logout).

## 2. Selected Architecture & Design Decisions
*   **Storage Location**: Both `accessToken` and `refreshToken` will be stored in `localStorage`.
*   **Auto-Redirection**: 
    - In `App.tsx`: `isAuthenticated()` will check `localStorage.getItem('accessToken')`.
    - In `LoginPage.tsx` and `RegisterPage.tsx`: A standard React `useEffect` will check for the presence of tokens in `localStorage` and trigger an immediate replacement redirect (`navigate('/dashboard', { replace: true })`) if present.

## 3. Frontend Changes

### 3.1 `authService.ts`
Replace all occurrences of `sessionStorage` with `localStorage` for `accessToken`.
*   In the Request Interceptor: `const token = localStorage.getItem('accessToken')`
*   In the Response Interceptor (Refresh success): `localStorage.setItem('accessToken', data.accessToken)`
*   In the Response Interceptor (Refresh fail): `localStorage.removeItem('accessToken')`
*   In `authService.login`: `localStorage.setItem('accessToken', response.data.accessToken)`
*   In `authService.logout`: `localStorage.removeItem('accessToken')`

### 3.2 `App.tsx`
Update the `isAuthenticated` check:
```typescript
const isAuthenticated = () => !!localStorage.getItem('accessToken')
```

### 3.3 `LoginPage.tsx`
Add automatic redirection inside `useEffect`:
```typescript
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

// Inside LoginPage component:
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('refreshToken');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);
```

### 3.4 `RegisterPage.tsx`
Add automatic redirection inside `useEffect`:
```typescript
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

// Inside RegisterPage component:
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('refreshToken');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);
```

## 4. Out of Scope (YAGNI)
*   Remember-me checkbox (sessions are persisted by default up to 7 days based on the JWT refresh token rotation).
