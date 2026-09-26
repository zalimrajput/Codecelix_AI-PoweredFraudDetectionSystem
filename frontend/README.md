# CodeCelix AI-Powered Fraud & Risk Detection Platform - Frontend

CodeCelix is an enterprise-grade AI-powered fraud intelligence and threat detection platform. It provides real-time fraud scoring, neural behavioral anomaly correlation, automated heuristic rule enforcement, multi-hop entity linkage graph visualization, and AI-assisted investigation workflows.

> **FULL-STACK INTEGRATION STATUS:**
> The frontend is **100% integrated with the live FastAPI backend** via a central reverse proxy and typed API adapters.
> All components bind directly to live PostgreSQL database records, machine learning models, heuristic rules, and the Gemini AI assistant.
> There are ZERO mock databases, ZERO invented telemetry scores, and ZERO emojis.

---

## 1. Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.4
- **Styling**: Tailwind CSS (Enterprise Dark Intelligence Theme)
- **Routing**: React Router (`react-router-dom` v6)
- **Data Fetching & Cache**: TanStack React Query (`@tanstack/react-query`)
- **Visualizations & Charts**: Recharts (Risk Tier Donut & 30-Day Fraud Velocity Trends)
- **Interactive Graph Canvas**: React Flow (`@xyflow/react`)
- **Iconography**: Lucide React (`lucide-react`) strictly without emojis

---

## 2. Installation & Running

### Running with Zero Global Node/NPM Requirements (Windows)
The repository includes portable convenience launchers using the bundled runtime:
- **Start Dev Server**: Double-click `dev.bat` (or run `.\dev.bat` in PowerShell).
- **Run Production Build**: Double-click `build.bat` (or run `.\build.bat` in PowerShell).

### Running with Standard Node / NPM (Cross-Platform)
```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start local development server with Vite proxy
npm run dev

# 3. Compile and verify production build
npm run build
```
The development server will launch on `http://localhost:5173`. Requests to `/api/*` are automatically proxied to the backend at `http://localhost:8000`.

---

## 3. Directory Structure

```
CodeCelix/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.tsx                         # Platform entrypoint
    ├── App.tsx                          # Route registry & global providers
    ├── index.css                        # Tailwind & custom scrollbar styles
    ├── types/                           # Strongly typed domain models
    │   ├── auth.ts                      # User profiles, credentials, permissions
    │   ├── dashboard.ts                 # Metrics, distributions, fraud trends
    │   ├── transaction.ts               # Transactions, filters, payment methods
    │   ├── investigation.ts             # Dossiers, timeline, alerts, notes
    │   ├── network.ts                   # Nodes, edges, entity linkage types
    │   ├── rule.ts                      # Heuristic rules, operators, actions
    │   ├── report.ts                    # Formats, summaries, filter bounds
    │   ├── user.ts                      # User management accounts & statuses
    │   └── assistant.ts                 # AI prompts, streaming payloads, citations
    ├── api/                             # Clean service abstraction layer
    │   ├── client.ts                    # Base fetch client with Bearer auth token
    │   ├── auth.ts                      # POST /api/auth/login, /register, /me, /logout
    │   ├── dashboard.ts                 # GET /api/dashboard
    │   ├── transactions.ts              # GET /api/transactions, POST manual & CSV import
    │   ├── investigations.ts            # GET & PATCH /api/investigations
    │   ├── alerts.ts                    # GET & POST /api/alerts/:id/review
    │   ├── network.ts                   # GET /api/network
    │   ├── rules.ts                     # CRUD /api/rules
    │   ├── reports.ts                   # GET & POST /api/reports, export
    │   ├── users.ts                     # CRUD /api/users
    │   └── assistant.ts                 # POST /api/assistant/query
    ├── context/
    │   ├── AuthContext.tsx              # Auth state and role perspective switcher
    │   └── ToastContext.tsx             # Notification toast provider
    ├── layouts/
    │   ├── AppShell.tsx                 # Main layout shell with Sidebar & Topbar
    │   ├── Sidebar.tsx                  # Collapsible & mobile navigation
    │   ├── Topbar.tsx                   # Search, role switcher, notifications
    │   └── RoleGuard.tsx                # Role-based route authorization gate
    ├── components/
    │   ├── ui/                          # Button, Input, Select, Badge, Card, Modal,
    │   │                                # Drawer, Tabs, Dropdown, Skeleton, EmptyState,
    │   │                                # ErrorState, ConfirmDialog
    │   ├── common/                      # DataTable, PageHeader, Breadcrumbs,
    │   │                                # RiskBadge, DecisionBadge
    │   └── assistant/
    │       └── GlobalAiAssistant.tsx    # Slide-out AI assistant drawer
    ├── features/                        # Domain feature components
    │   ├── dashboard/                   # MetricCard, RiskDistributionChart, FraudTrendChart
    │   ├── transactions/                # TransactionFilters, ManualTransactionModal (with risk-signal overrides), CsvImportModal
    │   ├── investigations/              # RiskBreakdownCard, AiExplanationPanel, CustomerRiskProfile,
    │   │                                # TransactionTimeline, TriggeredRulesList, DetectedPatternsList,
    │   │                                # RelatedAlertsList, AnalystNotesCard
    │   ├── network/                     # NetworkGraph, NodeDetailPanel, NetworkToolbar, CustomNode
    │   ├── rules/                       # RuleCard, CreateRuleModal
    │   ├── reports/                     # ReportGenerator
    │   └── users/                       # UserFilters
    └── pages/
        ├── LoginPage.tsx                # /login
        ├── RegisterPage.tsx             # /register
        ├── DashboardPage.tsx            # /dashboard
        ├── TransactionsPage.tsx         # /transactions
        ├── InvestigationsPage.tsx       # /investigations
        ├── InvestigationDetailPage.tsx  # /investigations/:id
        ├── FraudNetworkPage.tsx         # /network
        ├── RulesPage.tsx                # /rules
        ├── ReportsPage.tsx              # /reports
        ├── UsersPage.tsx                # /users
        └── NotFoundPage.tsx             # 404 handler
```

---

## 4. Role-Based Navigation Architecture

The platform supports 3 core role permissions:

| Route | ADMIN | BUSINESS MANAGER | ANALYST | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/dashboard` | Yes | Yes | Yes | Executive KPIs, trend charts, risk segmentation |
| `/transactions` | Yes | Yes | Yes | Transaction audit register, CSV import, manual entry with risk-signal overrides |
| `/investigations` | Yes | - | Yes | Case dossier queue and review statuses |
| `/investigations/:id` | Yes | - | Yes | High-density case intelligence and disposition |
| `/network` | Yes | Yes | Yes | Interactive React Flow entity linkage graph |
| `/rules` | Yes | - | - | Deterministic fraud heuristic rule management |
| `/reports` | Yes | Yes | - | Compliance, audit, and loss prevention reporting |
| `/users` | Yes | - | - | User directory, invite provisioning, and status control |
| AI Assistant | Yes | - | Yes | Global floating investigation assistant drawer |

> **Development Note**: A role switcher widget is present in the Topbar header, allowing immediate switching between `ADMIN`, `BUSINESS_MANAGER`, and `ANALYST` so developers and reviewers can inspect all navigation states without requiring fake authentication.

---

## 5. Live Backend API Integration

All API integration points under `src/api/` are fully active and bound to the FastAPI backend. Requests are automatically passed through the Vite reverse proxy with Bearer token authentication and role normalization.

### Authentication & Security
- `src/api/client.ts` automatically attaches `Authorization: Bearer <token>` from browser `localStorage`.
- Unauthenticated requests trigger route guards in `AppShell` and `RoleGuard` redirecting to `/login`.
- Responses with `401 Unauthorized` automatically purge storage and redirect to `/login`.
- One-click Sign-Out is available from both the Topbar profile menu and the Sidebar footer.

### Endpoint Mapping Table

| Target Endpoint | Method | Service Function | File Location |
| :--- | :---: | :--- | :--- |
| `/api/auth/login` | POST | `login(credentials)` | `src/api/auth.ts` |
| `/api/auth/register` | POST | `register(payload)` | `src/api/auth.ts` |
| `/api/auth/me` | GET | `getCurrentUser()` | `src/api/auth.ts` |
| `/api/auth/logout` | POST | `logout()` | `src/api/auth.ts` |
| `/api/dashboard` | GET | `getDashboardData()` | `src/api/dashboard.ts` |
| `/api/transactions` | GET | `getTransactions(filter)` | `src/api/transactions.ts` |
| `/api/transactions/:id` | GET | `getTransactionById(id)` | `src/api/transactions.ts` |
| `/api/transactions/manual` | POST | `createTransaction(data)` | `src/api/transactions.ts` |
| `/api/transactions/import/csv` | POST | `importTransactionsCsv(file)` | `src/api/transactions.ts` |
| `/api/investigations` | GET | `getInvestigations()` | `src/api/investigations.ts` |
| `/api/investigations/:id` | GET | `getInvestigationById(id)` | `src/api/investigations.ts` |
| `/api/investigations/:id` | PATCH | `updateInvestigationNotes(id, payload)` | `src/api/investigations.ts` |
| `/api/customers/:id/risk-profile` | GET | `getCustomerRiskProfile(id)` | `src/api/investigations.ts` |
| `/api/alerts` | GET | `getAlerts()` | `src/api/alerts.ts` |
| `/api/alerts/:id/review` | POST | `reviewAlert(id, decision)` | `src/api/alerts.ts` |
| `/api/network` | GET | `getNetworkData(filter)` | `src/api/network.ts` |
| `/api/rules` | GET | `getRules()` | `src/api/rules.ts` |
| `/api/rules` | POST | `createRule(payload)` | `src/api/rules.ts` |
| `/api/rules/:id` | PATCH | `updateRule(id, payload)` | `src/api/rules.ts` |
| `/api/rules/:id` | DELETE | `deleteRule(id)` | `src/api/rules.ts` |
| `/api/reports` | GET | `getReports()` | `src/api/reports.ts` |
| `/api/reports/generate` | POST | `generateReport(filter)` | `src/api/reports.ts` |
| `/api/reports/:id/export` | GET | `exportReport(id, format)` | `src/api/reports.ts` |
| `/api/users` | GET | `getUsers(filter)` | `src/api/users.ts` |
| `/api/users` | POST | `createUser(payload)` | `src/api/users.ts` |
| `/api/users/:id/status` | PATCH | `updateUserStatus(id, status)` | `src/api/users.ts` |
| `/api/users/:id` | DELETE | `deleteUser(id)` | `src/api/users.ts` |
| `/api/assistant/query` | POST | `askAssistant(payload)` | `src/api/assistant.ts` |

### Manual Transaction Entry (Risk-Signal Overrides)

The `ManualTransactionModal` (`src/features/transactions/`) injects an evaluation transaction directly into the fraud scoring engine. Beyond the required identifiers (Customer ID, Amount, Payment Method, IP Address, Device Fingerprint), it captures optional risk-signal fields grouped into four sections:

| Section | Fields |
| :--- | :--- |
| Transaction Details | Country (required), City |
| Customer Profile | Account Age (days), Customer Average Amount (USD) |
| Device Intelligence | Device Type (Mobile/Desktop/Tablet), Device Age (days), New Device, Device Customer Count, Shared Device |
| Network Signals | IP Account Count, Shared IP, Distance From Home (km) |

Boolean signals (New Device, Shared IP, Shared Device) expose an **Auto-detect / Yes / No** selector: `Auto-detect` omits the field so the backend derives the value from customer/device/IP history, while an explicit choice is sent as a hard override consumed by the rules engine and the 43-feature ML vector.

---

## 6. Design System Guidelines

- **Low / Approved Status**: Emerald (`#10B981`)
- **Medium / Review Status**: Amber (`#F59E0B`)
- **High / Blocked Status**: Crimson (`#F43F5E`)
- **Network Entities**:
  - Customer: Blue (`#3B82F6`)
  - Device: Green (`#10B981`)
  - IP Address: Purple (`#8B5CF6`)
  - Transaction: Cyan (`#06B6D4`)
- **Compliance Rules**:
  - Zero emojis across all code, strings, tooltips, and comments.
  - Zero fake data hardcoded into components.
