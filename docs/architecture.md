# CampusConnect System Architecture
## National Institute of Technology Andhra Pradesh

### 1. High-Level Architecture Overview

CampusConnect is structured as a full-stack Next.js application following modern software engineering principles: strict separation of concerns, atomic server transactions, role-based authorization, and persistent relational data modeling.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Presentation Layer (Browser)"]
        UI["Next.js App Router (React 18 + Tailwind CSS)"]
        DemoModal["Demo Persona Quick Switcher"]
        Nav["Responsive Campus Navigation & Unread Badges"]
    end

    subgraph ServerLayer ["Next.js Server API & Route Handlers"]
        AuthMiddleware["JWT Session & Verification Guard"]
        EventService["Event & Registration Controller"]
        LostFoundService["Hyperlocal Lost & Found Controller"]
        CommunityService["Campus Feed & Interaction Controller"]
        PhilanthropyService["Philanthropy & Atomic Donation Ledger"]
        ModService["Moderation & Content Flag Controller"]
        AdminService["Admin Verification & Statistics Controller"]
    end

    subgraph DataLayer ["Persistence & Storage"]
        PrismaORM["Prisma Client ORM"]
        RelationalDB[("Relational Database (SQLite / PostgreSQL)")]
        AuditLog[("Audit & Transaction Ledger")]
    end

    ClientLayer -->|HTTP/HTTPS REST & Cookie Auth| ServerLayer
    ServerLayer -->|Type-Safe Queries| PrismaORM
    PrismaORM --> RelationalDB
    PhilanthropyService --> AuditLog
```

---

### 2. Frontend & Backend Responsibilities

#### Frontend (Presentation)
- **Framework**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Lucide React icons.
- **State & UI Feedback**: Live capacity progress bars, immediate visual confirmation badges, optimistic toggling for likes and reactions, modal dialogs for content reporting and claims.
- **Evaluator Utilities**: Integrated `DemoSwitcherModal` that allows testers to change personas (Student, Moderator, Admin, Unverified) with 1 click without losing application context.

#### Backend (Business Logic & Authorization)
- **Authentication**: JWT session tokens signed with `JWT_SECRET`, transmitted via HTTP-only, SameSite cookies (`cc_session`) to mitigate XSS and CSRF.
- **Verification Guard**: Restricts sensitive actions (starting public philanthropy drives, moderation queues) to authenticated and authorized personas.
- **Atomic Operations**: Financial donations utilize `prisma.$transaction` to guarantee that updating `Campaign.raisedAmount` and creating the `Donation` audit record occur as a single indivisible operation.
- **Capacity Enforcement**: Queries current confirmed attendees against event capacity within server route handlers to prevent race conditions and overbooking.

---

### 3. Database Entity Relationship Model (ERD)

```mermaid
erDiagram
    Campus ||--o{ User : "houses"
    User ||--o{ Event : "creates"
    User ||--o{ EventRegistration : "registers"
    Event ||--o{ EventRegistration : "enrolls"
    User ||--o{ LostAndFoundItem : "reports"
    LostAndFoundItem ||--o{ LostAndFoundClaim : "receives"
    User ||--o{ LostAndFoundClaim : "files"
    User ||--o{ CommunityPost : "authors"
    CommunityPost ||--o{ Comment : "has"
    User ||--o{ Comment : "writes"
    CommunityPost ||--o{ Reaction : "receives"
    User ||--o{ Reaction : "gives"
    User ||--o{ Campaign : "organizes"
    User ||--o{ Campaign : "verifies (Admin)"
    Campaign ||--o{ Donation : "receives"
    Campaign ||--o{ CampaignUpdate : "publishes"
    User ||--o{ Donation : "contributes"
    User ||--o{ ContentReport : "submits"
    User ||--o{ ContentReport : "reviews (Mod/Admin)"
    User ||--o{ Notification : "receives"
```

---

### 4. Core Security & Business Workflows

#### A. Campus Verification Workflow
1. Student registers using `@nitandhra.ac.in` email -> Automatically designated as `VERIFIED`.
2. Student registers using other email domains or uploads ID card -> Designated as `PENDING`.
3. Administrator reviews the uploaded ID in `/admin` console -> Approves or Rejects identity with automated notification.

```mermaid
sequenceDiagram
    autonumber
    actor Student
    actor Admin
    participant Server as Next.js API
    participant DB as Relational Database

    Student->>Server: POST /api/auth/register (Uploads ID Card)
    Server->>DB: Create User (verificationStatus: PENDING)
    Server-->>Admin: Emit In-App Admin Notification
    Admin->>Server: PATCH /api/admin/verifications/:id (Approve)
    Server->>DB: Update verificationStatus = VERIFIED
    Server->>DB: Create Notification for Student
    Server-->>Admin: Confirmation response
```

#### B. Event Registration & Capacity Enforcement
1. Student requests registration for an upcoming event.
2. Server queries current `CONFIRMED` registrations count.
3. Server checks unique composite constraint `(eventId, userId)`: if already registered, returns HTTP 409 Conflict.
4. Server verifies `count < capacity`: if full, returns HTTP 400 Bad Request.
5. If valid, upserts registration and increments attendee counter.

#### C. Verified Crowdfunding & Atomic Donation Ledger
1. Student creates campaign with story and fund usage plan -> Enters `PENDING_REVIEW`.
2. Administrator reviews campaign in `/admin` -> Approves and grants `VERIFIED` status.
3. Public donors initiate test donation (UPI, Card, NetBanking).
4. Server generates audit transaction reference (`NITAP-SIM-XXXXXX`).
5. Server executes atomic `$transaction`:
   - Inserts `Donation` record.
   - Atomically increments `Campaign.raisedAmount`.
6. Immediate digital receipt emitted; campaign balance instantly updated without full page refresh.

```mermaid
sequenceDiagram
    autonumber
    actor Donor
    participant API as /api/philanthropy/:id/donate
    participant DB as SQLite / PostgreSQL

    Donor->>API: POST donation { amount: 1500, rail: DEMO_UPI }
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT INTO Donation (txnRef, amount, donor)
    API->>DB: UPDATE Campaign SET raisedAmount = raisedAmount + 1500
    API->>DB: COMMIT TRANSACTION
    API-->>Donor: HTTP 200 { receipt, newCampaignBalance }
```

---

### 5. Production Deployment Architecture

```mermaid
flowchart LR
    Dev[Local / Preview] -->|Git Push| GitHub[GitHub Repository]
    GitHub -->|CI/CD| Vercel[Vercel Serverless Edge Platform]
    Vercel -->|Prisma Client| Supabase[Supabase PostgreSQL Database]
    Vercel -->|Assets| CDN[Vercel Edge Network / CDN]
```

- **Database Migration to Production**: Replace `provider = "sqlite"` with `provider = "postgresql"` in `prisma/schema.prisma` and provide `DATABASE_URL` for hosted PostgreSQL (Supabase / Neon / AWS RDS).
