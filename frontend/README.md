# Nexum Frontend Application

**The sleek, interactive client-side application of Nexum. A highly responsive React 19 + TypeScript SPA built with Vite 8 and styled with Tailwind CSS v4, featuring Framer Motion micro-animations.**

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=for-the-badge&logo=vite)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Features & User Experience (UX)

The frontend interface focuses on clean design, fluid transitions, and immediate actionable feedback.

### 1. Interactive Metrics Dashboards
- **MRR, Overdue, and Upcoming Cards:** Interactive summary cards that open deep-dive modals.
- **Visual MRR Distribution & Growth:** Seamless SVG charts and custom metrics visualization showing 29-month historical trends.
- **Direct Pay Flows:** Trigger payment requests directly from client details with immediate feedback.

### 2. Session Persistence and Auto-Redirection
- Secure JWT context stored via `localStorage` allowing logins to persist across browser tabs and sessions (matching the 7-day database expiration window).
- Automatical dashboard redirection upon logging in or registering if an active session exists.

### 3. Localization & Country Dialing Codes (DDI)
- In client registration and detail edit forms, users select countries (Brazil `+55`, USA `+1`, Portugal `+351`, etc.) via an elegant, separate select component.
- The system automatically parses and stitches these codes with the phone numbers for frictionless, prefilled WhatsApp links to send overdue invoice reminders.

### 4. Scrolling Tab Title Marquee
- A custom React effect shifts browser tab titles sequentially at 300ms intervals when the window is inactive, creating a clean scrolling text marquee without memory leaks.

---

## 🏗️ Architecture & Folder Structure

The frontend files are organized symmetrically to simplify component tracing and logic flow.

```
frontend/src/
├── assets/             # Images, static media, and pre-seeded graphics
├── components/         # Reusable presentation and layout files
│   ├── landing/        # Hero, Header, and Landing page sections
│   ├── layout/         # Sidebar, Theme toggles, and Dashboard layout wrapper
│   └── ui/             # Modals, custom SVG charts, and interactive cards
├── contexts/           # React Contexts (Theme, Security/Auth State)
├── hooks/              # Query hooks wrapping business domains
├── pages/              # Routing destinations (Auth, Clients, Plans, Dashboard)
├── routes/             # Path definitions and ProtectedRoute guards
├── services/           # Axios-based REST Client API bindings
├── styles/             # Global stylesheets and Tailwind directives
├── types/              # Type definitions and system models
└── Utils/              # Help modules (Phone formats, dynamic titles, error handlers)
```

### Server Sync & Caching
Data fetching is managed exclusively via **TanStack React Query** (`@tanstack/react-query`). Components never make `useEffect` API calls directly. Instead, they consume specialized hooks like `useClients.ts`, `usePlans.ts`, `useSubscriptions.ts`, and `useMetrics.ts`, enabling caching and optimistic cache invalidation.

---

## 🚀 Setup & Execution

### Prerequisites
- **Node.js v20+**
- **npm** (included with Node.js)

### 1. Installation
Install the project dependencies inside the `frontend/` directory:
```powershell
npm install
```

### 2. Running Development Server
Start Vite's development server with hot-module reloading:
```powershell
npm run dev
```
The application will launch at `http://localhost:5173`.

### 3. Production Build
To build the optimized static assets under `dist/`:
```powershell
npm run build
```

---

## 🧪 Linters & Code Quality

Nexum enforces high coding standards. To validate types and check for syntax errors:
```powershell
# Run Eslint checks
npm run lint

# Run TypeScript static type verification
npx tsc --noEmit
```
**No hacks rule:** The project maintains strict TypeScript typings. Suppressions like `@ts-ignore` or casting as `any` are forbidden.
