# Government Digital Platform - Frontend

A modern, role-based frontend application for the Government Digital Platform, built with React, Vite, and Tailwind CSS. This portal provides tailored experiences for Citizens, Government Officers, and System Administrators.

## 🚀 Tech Stack

- **Framework:** [React 18](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Auth Store)
- **Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Routing:** [React Router DOM v6](https://reactrouter.com/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **UI Components:** [Lucide React](https://lucide.dev/) (Icons), [Recharts](https://recharts.org/) (Analytics)
- **Notifications:** [React Hot Toast](https://react-hot-toast.com/)

## 🛠️ Key Features

### 🔐 Authentication & Authorization
- **JWT-based Auth:** Secure login and registration flow.
- **Role-Based Access Control (RBAC):** Strict route protection based on user roles (`CITIZEN`, `OFFICER`, `ADMIN`).
- **Persistent Sessions:** Auth state persisted via LocalStorage and managed by Zustand.

### 👥 User Portals

#### 🏛️ Citizen Portal
- **Service Discovery:** Browse available government services.
- **Application Management:** Submit new applications and track existing ones via a visual timeline.
- **Consent Management:** Review and manage data consent requests.

#### 👮 Officer Portal
- **Application Review:** Process pending applications with detailed review screens.
- **Citizen 360 View:** Comprehensive profile view of citizens for informed decision-making.
- **Workflow Management:** Move applications through various processing stages.

#### ⚙️ Admin Portal
- **System Analytics:** High-level dashboard for system statistics and data quality.
- **Audit Logging:** Complete traceability of system actions.
- **Data Quality Control:** Review and resolve duplicate records to maintain a "Golden Record".

## 📁 Project Structure

```text
src/
├── api/            # API client and service-specific API definitions
├── components/     # Reusable UI components (Common, Application, MDM, Consent)
├── hooks/          # Custom React hooks
├── layouts/        # Role-specific layout wrappers (Admin, Citizen, Officer)
├── pages/          # Page components organized by role
│   ├── admin/      # Admin-only pages
│   ├── auth/       # Login and Registration
│   ├── citizen/    # Citizen-facing pages
│   └── officer/    # Officer-facing pages
├── routes/         # Route guards (ProtectedRoute, RoleRoute)
├── store/          # Global state management (authStore)
└── utils/          # Helper functions and role-based guards
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
Run the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Build
Create an optimized production build:
```bash
npm run build
```

## 🔌 API Integration
The frontend communicates with the backend via a centralized API client located in `src/api/client.js`, utilizing Axios for HTTP requests and TanStack Query for caching and synchronization.

