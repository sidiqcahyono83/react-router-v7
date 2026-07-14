Roadmap Pengerjaan
Phase 1 — Project Foundation

Target: aplikasi bisa dijalankan dan fondasi siap.

✔ Install React Router 8
✔ Install Tailwind CSS 4
✔ Install Shadcn/UI
✔ Setup Folder Structure
✔ Setup Path Alias
✔ Setup Axios
✔ Setup Environment
✔ Setup Utility
✔ Setup Theme
✔ Setup Toast

Phase 2 — Authentication
✔ Landing Page
✔ Login
✔ Logout
✔ Session
✔ Auth Helper
✔ Protected Route
✔ Middleware

Phase 3 — Layout
✔ Admin Layout
✔ Sidebar
✔ Navbar
✔ Breadcrumb
✔ User Menu
✔ Theme Switch

Phase 4 — Dashboard
✔ Dashboard Card
✔ Revenue
✔ Customer Summary
✔ Payment Summary
✔ Chart
✔ Recent Activity

Phase 5 — Customer
✔ List
✔ Detail
✔ Add
✔ Edit
✔ Delete
✔ Search
✔ Pagination

Phase 6 — Internet Package
✔ List
✔ Add
✔ Edit
✔ Delete

Phase 7 — Invoice
✔ Generate
✔ List
✔ Detail
✔ Print

Phase 8 — Payment
✔ List
✔ New Payment
✔ History
✔ Receipt

Phase 9 — Report
✔ Daily
✔ Monthly
✔ Yearly
✔ Export Excel
✔ Export PDF

Phase 10 — Settings
✔ Company
✔ Admin
✔ Profile
✔ Backup

app/
│
├── assets/
│ ├── icons/
│ ├── images/
│ └── logo/
│
├── components/
│ ├── common/
│ ├── layouts/
│ ├── navigation/
│ └── ui/
│
├── features/
│ ├── auth/
│ ├── dashboard/
│ ├── customers/
│ ├── packages/
│ ├── invoices/
│ ├── payments/
│ ├── reports/
│ ├── settings/
│ └── users/
│
├── lib/
│ ├── api/
│ ├── auth/
│ ├── utils/
│ └── validations/
│
├── providers/
│
├── routes/
│
├── styles/
│
├── types/
│
├── root.tsx
├── entry.client.tsx
└── entry.server.tsx

Phase 1
✔ Project Foundation
✔ Folder Structure
✔ Alias
✔ Shadcn UI
✔ Axios
✔ Utils
✔ Environment

Phase 2
✔ Authentication
✔ Session
✔ Protected Route

Phase 3
✔ Admin Layout
✔ Sidebar
✔ Navbar

Phase 4
✔ Dashboard

Phase 5
✔ Customer

Phase 6
✔ Internet Package

Phase 7
✔ Invoice

Phase 8
✔ Payment

Phase 9
✔ Report

Phase 10
✔ Settings


features/
└── customers/
    ├── api/
    │   ├── create.ts
    │   ├── delete.ts
    │   ├── detail.ts
    │   ├── list.ts
    │   ├── update.ts
    │   └── index.ts
    │
    ├── components/
    │   ├── CustomerTable.tsx
    │   ├── CustomerForm.tsx
    │   ├── CustomerSearch.tsx
    │   ├── CustomerStatus.tsx
    │   └── DeleteDialog.tsx
    │
    ├── schemas/
    │   └── customer.schema.ts
    │
    ├── types.ts
    └── hooks/

    routes/
└── customers/
    ├── customers.tsx
    ├── create.tsx
    ├── edit.tsx
    └── detail.tsx