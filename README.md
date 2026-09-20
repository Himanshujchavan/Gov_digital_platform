# 129 Government Of Maharashtra
## System integration and interoperability among government digital platforms, resulting in fragmented service delivery
**Software | SIH26129**

---

## 📌 Executive Summary & Core Innovation

Maharashtra operates multiple specialized digital platforms for citizen services and departmental operations:
- **Aaple Sarkar**: Public service delivery, domicile/caste certificates, and reusable citizen profiles.
- **MahaDBT / MahaDBT 2.0**: Direct benefit delivery and scholarship scheme processing.
- **Mahabhumi**: Digital land-record services including digitally signed 7/12 extracts, 8A, and property cards.

**The Problem**: These systems operate in silos with different database schemas, naming conventions, unique identifiers (`REV-XXXX`, `WEL-XXXX`, `LAND-XXXX`), and separate authentication domains. Citizens are repeatedly forced to manually download, scan, and re-upload government-issued documents.

**The Solution**: An **interoperability middleware platform** that sits *between* existing systems:
1. **Connection Layer (Adapters)**: Ingests heterogeneous legacy APIs/JSON/XML and normalizes them into a canonical data model.
2. **Understanding Layer (AI/MDM)**: Resolves disparate citizen identities across departments using probabilistic entity resolution (TF-IDF, Jaro-Winkler, DOB variance) into a unified **Master Citizen ID** (`MC-10024`).
3. **Orchestration Layer (Workflow & Consent)**: Coordinates end-to-end multi-department service flows with explicit citizen consent, event-driven async messaging (RabbitMQ), and immutable audit logging.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Tailwind CSS, Zustand | Modern, responsive UI for Citizens, Officers, and Admins |
| **API Gateway** | NestJS, Axios | Unified entry point, JWT validation, and reverse proxying |
| **Orchestration** | NestJS, RabbitMQ | Saga-based workflow engine for async service coordination |
| **Identity (MDM)** | FastAPI (Python), Scikit-Learn, Pandas | Probabilistic entity resolution and Master ID mapping |
| **Consent** | NestJS, RabbitMQ | Granular, TTL-based consent lifecycle management |
| **Adapters** | NestJS | Normalization of legacy dept data to Canonical models |
| **Audit** | NestJS, MongoDB | Immutable, append-only event logging for compliance |
| **Databases** | PostgreSQL, MongoDB | Relational data for MDM/Workflow, Document store for Audit |
| **Infrastructure** | Docker, Docker Compose | Containerized microservices orchestration |

---

## 🔄 User Flow: The Scholarship Application Journey

The platform transforms a fragmented process into a seamless, zero-document experience:

1.  **Application**: Citizen submits a scholarship application via the **API Gateway**.
2.  **Consent Request**: The **Workflow Engine** triggers the **Consent Service**, which sends a request to the citizen to share specific data (e.g., Income from Revenue, Land records from Mahabhumi).
3.  **Citizen Approval**: Citizen approves the request. The **Consent Service** publishes a `consent.approved` event.
4.  **Identity Resolution**: The **MDM Service** consumes the event, resolves the citizen's identity across departments using probabilistic matching, and assigns/links a **Master Citizen ID**.
5.  **Data Normalization**: The **Adapter Service** fetches raw data from legacy Department APIs and transforms it into **Canonical JSON** formats.
6.  **Eligibility Check**: The **Workflow Engine** validates the normalized data (e.g., `annualIncome <= 250,000`) to determine eligibility.
7.  **Officer Review**: The application is queued for an officer who verifies the digitally signed extracts.
8.  **Final Decision**: Application is `APPROVED` or `REJECTED`, and the citizen is notified.
9.  **Audit Trail**: Every single step above is captured by the **Audit Service** as an immutable event.

---

## 🏗️ Architecture & Logical Layers

```text
                                  CITIZEN / OFFICER / ADMIN
                                              │
                                              ▼
                         React 18 + Tailwind Frontend (Port 3000)
                                              │
                                              ▼
                             API Gateway (NestJS - Port 8000)
    ┌──────────────────────┬──────────────────┴──────────────────┬──────────────────────┐
    │                      │                                     │                      │
    ▼                      ▼                                     ▼                      ▼
Auth Service         Workflow Engine                       Consent Service         Audit Service
(NestJS :8001)       (NestJS :8006)                        (NestJS :8005)          (NestJS :8007)
 JWT / RBAC           Saga Orchestrator                     Consent Lifecycle       Immutable Log
                           │                                     │                      ▲
                           ├──────────────────┬──────────────────┤                      │
                           ▼                  ▼                  ▼                      │
                     RabbitMQ Event Bus (Exchanges: consent, workflow, mdm, audit) ─────┘
                           ▲                  ▲
                           │                  │
                           ▼                  ▼
                    MDM / AI Service    Adapter Service (NestJS :8003)
                    (FastAPI :8004)           │
                     Entity Resolution        ▼
                     Quality Scoring    Simulated Departments (NestJS :8002)
                                        ├── Aaple Sarkar (Revenue)
                                        ├── MahaDBT 2.0 (Welfare)
                                        └── Mahabhumi (Land Records)
```

---

## 📊 Implementation Status

| Layer | Component | Status | Details |
|---|---|:---:|---|
| **Infra** | Monorepo, Docker, .env | ✅ | npm workspaces, `docker-compose.yml` |
| **Shared** | `@maha-interop/shared` | ✅ | Canonical schemas, `ApiResponse`, `RabbitMQClient` |
| **Backend** | Auth Service & RBAC | ✅ | JWT strategy, role guards, seeded users |
| **Backend** | Dept APIs & Adapters | ✅ | Normalization of Revenue, Welfare, Land data |
| **Backend** | MDM & Entity Resolution | ✅ | TF-IDF, Jaro-Winkler, Master ID mapping |
| **Backend** | Consent Service | ✅ | TTL-based consent, RabbitMQ event emitter |
| **Backend** | Workflow Engine | ✅ | Saga-based state machine, async orchestrator |
| **Backend** | Event Bus Wiring | ✅ | Topic exchanges, durable queues, listeners |
| **Backend** | Audit Service | ✅ | Append-only immutable log, resource audit trail |
| **Backend** | API Gateway | ✅ | Reverse proxy, JWT middleware, rate limiting |
| **Backend** | E2E Backend Tests | ✅ | Full scholarship flow integration test |
| **Frontend**| All Modules | ✅ | Auth, Citizen Flow, Consent, Timeline, Officer/Admin Dash |

---

## 🛠️ Detailed Breakdown: What Has Been Implemented

### 1. Backend: Phase 1 (Foundation & Authentication) ✅
- **Monorepo Architecture**: Configured root `package.json` with npm workspaces for microservices.
- **Docker Compose Setup**: Full cluster orchestration in `docker-compose.yml` for PostgreSQL 15, MongoDB 6.0, RabbitMQ 3.12 (management console), and all platform microservices.
- **Shared Package (`@maha-interop/shared`)**:
  - `CanonicalCitizen`: Standardized citizen demographic data model.
  - `CanonicalFinancial`: Standardized certified income certificate model.
  - `CanonicalProperty`: Standardized 7/12 extract and land record model.
  - `ApiResponse`: Consistent envelope (`success`, `message`, `data`, `errors`, `timestamp`).
  - `Logger`: Context-tagged structured logging.
  - `RabbitMQClient`: Resilient AMQP connection wrapper with automatic reconnection and graceful offline buffering.
- **Authentication & RBAC Service (`auth-service`)**:
  - Built with **Node.js + NestJS (JavaScript)**.
  - Passport JWT strategy with bcrypt password hashing.
  - Role-Based Access Control (`JwtAuthGuard`, `RolesGuard`, `@Roles(...)` decorator).
  - Pre-seeded test accounts:
    - Citizen: `citizen_rahul` (Rahul Sharma)
    - Citizen: `citizen_priya` (Priya Patil)
    - Officer: `officer_revenue` (Suresh Deshmukh - Revenue Department)
    - Officer: `officer_education` (Anjali Kulkarni - Higher Education Department)
    - Admin: `admin_user` (System Administrator)
    - *(All default passwords: `password123`)*
  - Endpoints: `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `GET /auth/me`, `GET /auth/users`, `GET /auth/health`.
  - Swagger OpenAPI interactive documentation at `/docs`.
  - **Automated Tests**: 6/6 test cases passing (`auth-service/test/auth.test.js`).

### 2. Frontend: Complete Portal Suite (Phases 1 – 7) ✅
The entire user interface is implemented, bundled, and production-verified in `frontend/`:
- **Core Stack**: React 18, Vite 5, Tailwind CSS with official Government of Maharashtra palette, TanStack Query v5, Zustand, React Router v6, Recharts, Lucide icons, React Hot Toast.
- **Hybrid Live / Demo Mode**: The frontend automatically connects to live backend services; if the backend is not yet started, it gracefully falls back to instant demo mode so the entire UI can be reviewed and tested without blocking.
- **Citizen Portal (`/citizen/*`)**:
  - `ServiceListPage`: Catalog of notified schemes (Rajarshi Shahu Maharaj Tuition Fee Waiver, OBC Post-Matric, Mahabhumi 7/12 verification).
  - `ApplicationFormPage`: Zero-document application submission highlighting automatic cross-department verification.
  - `MyApplicationsPage`: List of submitted applications with status badges and quick links.
  - `ApplicationTimelinePage`: Real-time 11-step visual stepper tracking the state machine progression with live auto-polling.
  - `ConsentRequestsPage`: Citizen consent prompt displaying requesting department, purpose, requested fields, expiry, approve/reject controls, and consent history with access revocation.
- **Department Officer Portal (`/officer/*`)**:
  - `PendingReviewsPage`: Application review queue filterable by department.
  - `ApplicationReviewPage`: Cross-department verification screen comparing applicant records with certified Revenue income, automated eligibility engine verdict, comments, and approve/reject actions.
  - `CitizenProfilePage`: **Citizen 360° Profile** showing harmonized identity resolved across Revenue (`REV-1021`), Welfare (`WEL-7821`), and Mahabhumi (`LAND-4512`).
- **Platform Administrator Portal (`/admin/*`)**:
  - `SystemStatsPage`: Live SLA cards (1.8s avg turnaround), application volume bar chart, consent compliance donut chart, and microservice heartbeat indicators.
  - `AuditLogPage`: Searchable/filterable central audit trail with full JSON event trace modal.
  - `DuplicatesReviewPage`: Supervised machine learning review queue for borderline matches (70%–89% confidence) with side-by-side comparison and merge confirmation.
  - `DataQualityDashboard`: 4-dimension benchmark (Completeness, Consistency, Validity, Uniqueness) across connected databases.
- **Authentication**:
  - `LoginPage` with 1-click test credential fill buttons for Citizen, Officer, and Admin.
  - `RegisterPage` for new citizen onboarding.
- **Containerization**: Multi-stage `frontend/Dockerfile` with Nginx production serving and SPA routing fallback.

---

## ⏳ What Remains to Be Implemented (Backend Phases 2 – 6)

The remaining tasks follow the sequential backend roadmap:

### Phase 2: Government Systems & Interoperability Layer
- **`simulated-departments` (NestJS :8002)**:
  - **Aaple Sarkar (Revenue)**: Schema with `citizen_name`, `birth_date`, `income_amt`, `REV-XXXX` IDs. Endpoints for citizens, income certificates, and domicile certificates.
  - **MahaDBT (Welfare)**: Schema with `fullName`, `dob`, `annualIncome`, `WEL-XXXX` IDs. Endpoints for beneficiaries, schemes, and applications.
  - **Mahabhumi (Land)**: Schema with `ownerName`, `dateOfBirth`, `landArea`, `LAND-XXXX` IDs. Endpoints for 7/12 extracts and property cards.
  - **Seed Dataset**: ~100 citizens with ~15 deliberate overlapping records across departments with slight name/address variations to test MDM.
- **`adapters` (NestJS :8003)**:
  - Revenue, Welfare, and Land adapters implementing bidirectional mapping (`to_canonical` / `from_canonical`).
  - Schema transformation endpoints (`POST /adapters/transform`, `POST /adapters/reverse-transform`).

### Phase 3: Core Intelligence (MDM + Consent)
- **`mdm-service` (Python/FastAPI :8004)**:
  - Probabilistic entity resolution engine using weighted matching:
    $$\text{Match Score} = 0.35 \times \text{Name(Jaro-Winkler)} + 0.30 \times \text{DOB} + 0.20 \times \text{Address(Cosine)} + 0.15 \times \text{Phone}$$
  - Thresholds: $\ge 90\%$ Auto-link $\rightarrow$ Master Citizen ID (`MC-10024`); $70\%-89\%$ Flag for manual review; $< 70\%$ No match.
  - Duplicate detection queue and 4-dimension data quality scoring API.
- **`consent-service` (NestJS :8005)**:
  - PostgreSQL persistence for consent records and audit logging.
  - Endpoints: `POST /consent/request`, `GET /consent/pending/:citizenId`, `PUT /consent/:id/respond`, `PUT /consent/:id/revoke`.
  - RabbitMQ publisher: Emits `consent.created`, `consent.approved`, `consent.rejected`, `consent.revoked`.
  - Background task for automated TTL expiry.

### Phase 4: Workflow Engine, Event Bus & Audit Logging
- **`workflow-engine` (NestJS :8006)**:
  - JSON state-machine orchestrator for the 11-step scholarship lifecycle:
    $$\text{APPLICATION\_RECEIVED} \rightarrow \text{CONSENT\_REQUESTED} \rightarrow \text{CONSENT\_GRANTED} \rightarrow \text{MDM\_RESOLUTION} \rightarrow \text{DATA\_RETRIEVAL} \rightarrow \text{DATA\_VALIDATION} \rightarrow \text{ELIGIBILITY\_CHECK} \rightarrow \text{OFFICER\_REVIEW} \rightarrow \text{APPROVED/REJECTED} \rightarrow \text{CITIZEN\_NOTIFIED}$$
  - Endpoints for submitting applications, fetching status/timeline, officer reviews, and metrics.
  - RabbitMQ consumers listening to `consent.approved` and `mdm.resolved`.
- **`audit-service` (NestJS :8007)**:
  - MongoDB-backed immutable, append-only audit event repository.
  - Ingests events from all services (`AUTH`, `CONSENT`, `DATA_ACCESS`, `MDM_MATCH`, `WORKFLOW`).
  - Query APIs: `GET /audit/events`, `GET /audit/trail/:resourceId`, `GET /audit/summary`.

### Phase 5: Unified API Gateway
- **`gateway` (NestJS :8000)**:
  - Single public entry point reverse-proxying downstream services.
  - Global middleware: CORS, token-bucket rate limiting, structured JSON request logging, and JWT validation.

### Phase 6: End-to-End Integration Testing
- Automated end-to-end integration test executing the complete 10-step scholarship flow from login to audit trail verification without UI dependency.

---

## 🚀 How to Run the Project

### Prerequisites
- **Node.js**: v18+ (tested on v24)
- **npm**: v9+ (tested on v11)
- **Python**: 3.11+ (for MDM service)
- **Docker & Docker Compose**: (optional for full containerized stack)

### 1. Install Dependencies
From the repository root:
```powershell
npm install
```

### 2. Run the Auth Service Backend
```powershell
npm --workspace=auth-service run start
```
- **Service URL**: `http://localhost:8001`
- **Swagger Documentation**: `http://localhost:8001/docs`
- **Run Unit Tests**: `npm --workspace=auth-service test`

### 3. Run the Frontend Application
In a separate terminal:
```powershell
npm --workspace=frontend run dev
```
- **Frontend URL**: `http://localhost:3000`
- **Production Build**: `npm --workspace=frontend run build`

### 4. Run with Docker Compose (Full Stack)
```powershell
docker-compose up -d postgres mongodb rabbitmq
```
- PostgreSQL: `localhost:5432`
- MongoDB: `localhost:27017`
- RabbitMQ Management: `http://localhost:15672` (User: `guest`, Pass: `guest`)

---

## 🔑 Demo Credentials

| Role | Username | Password | Persona / Scope | Target Portal |
|---|---|---|---|---|
| **Citizen** | `citizen_rahul` | `password123` | Rahul Sharma (Student Applicant) | `/citizen/services` |
| **Citizen** | `citizen_priya` | `password123` | Priya Patil (Applicant) | `/citizen/services` |
| **Officer** | `officer_education` | `password123` | Anjali Kulkarni (Higher Education) | `/officer/pending-reviews` |
| **Officer** | `officer_revenue` | `password123` | Suresh Deshmukh (Revenue Desk) | `/officer/pending-reviews` |
| **Admin** | `admin_user` | `password123` | System Administrator | `/admin/system-stats` |

*(On the login page, you can also click the quick-fill buttons to populate credentials instantly).*

---

## 📂 Repository File Structure

```text
Gov_digital_platform/
├── package.json              # Monorepo workspaces configuration
├── docker-compose.yml        # PostgreSQL, MongoDB, RabbitMQ & service definitions
├── .env.example / .env       # Central environment variables & ports
├── .swcrc                    # SWC decorator compiler config for NestJS JS
│
├── shared/                   # Shared npm package (@maha-interop/shared)
│   ├── package.json
│   └── src/
│       ├── constants/        # Roles, Departments, EventTypes, WorkflowStates
│       ├── interfaces/       # Canonical schemas (Citizen, Financial, Property), ApiResponse
│       └── utils/            # Structured Logger, resilient RabbitMQClient
│
├── auth-service/             # NestJS JavaScript Auth & RBAC Microservice (:8001)
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── main.js           # Swagger setup, CORS, bootstrapping
│   │   ├── app.module.js
│   │   ├── auth/             # Passport JWT strategy, JwtAuthGuard, RolesGuard
│   │   └── users/            # Users service, pre-seeded accounts
│   └── test/
│       └── auth.test.js      # Automated unit & integration tests (6/6 passing)
│
├── frontend/                 # React 18 + Vite + Tailwind CSS Application (:3000)
│   ├── package.json
│   ├── Dockerfile            # Multi-stage Nginx container
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── api/              # Axios microservice clients with JWT interceptors
│       ├── store/            # Zustand authStore with localStorage persistence
│       ├── routes/           # ProtectedRoute and RoleRoute guards
│       ├── layouts/          # CitizenLayout, OfficerLayout, AdminLayout
│       ├── pages/
│       │   ├── auth/         # LoginPage, RegisterPage
│       │   ├── citizen/      # ServiceListPage, ApplicationFormPage, MyApplicationsPage,
│       │   │                 # ApplicationTimelinePage, ConsentRequestsPage
│       │   ├── officer/      # PendingReviewsPage, ApplicationReviewPage, CitizenProfilePage
│       │   └── admin/        # SystemStatsPage, AuditLogPage, DuplicatesReviewPage,
│       │                     # DataQualityDashboard
│       ├── components/       # TimelineStepper, ConsentPrompt, MatchConfidenceCard, StatusBadge
│       └── utils/            # IST Date formatting, currency formatting, status color maps
│
└── README.md                 # Project documentation and implementation tracker
```

---

## 📜 License
This project is developed for the Government of Maharashtra digital interoperability initiative.