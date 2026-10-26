# CampusConnect — Two-Minute Demo Script
## National Institute of Technology Andhra Pradesh (NIT-AP)

This script is designed for live product demonstrations or recorded walkthroughs for evaluators.

---

### Timeline & Workflow Script

#### **0:00 – 0:20 | Introduction & Student Dashboard**
- **Presenter**: "Welcome to **CampusConnect**, the unified community platform built specifically for the 172-acre campus of **NIT Andhra Pradesh** in Tadepalligudem.
- **Action**: Start at the Landing Page (`/`). Point out the live campus counters (verified students, upcoming events, belongings reunited, verified philanthropy raised).
- **Presenter**: "Campus life at NIT-AP has historically been fragmented across WhatsApp groups and paper notices. CampusConnect centralizes everything with institute email verification."
- **Action**: Click "Demo Evaluation Switcher" on the top navigation and select **Arun Kumar (Student)**. Navigate to `/dashboard` to showcase the unified student feed, registered events, and active reports.

---

#### **0:20 – 0:45 | Workflow 1: Event Discovery & Capacity-Enforced Registration**
- **Action**: Navigate to `/events`.
- **Presenter**: "Students can filter events by category—such as Technical, Cultural (like Vulcanzy 2026), Sports, and Workshops."
- **Action**: Search for `HackNITAP` or click on **Vulcanzy 2026**. Open the event details page (`/events/[id]`).
- **Presenter**: "Here we see full event logistics, venue at Sarvepalli Radhakrishnan Bhavan, and confirmed attendees. Notice the seat capacity indicator. When I click 'Confirm Event Registration', the system prevents duplicate registrations and atomically updates the attendee count."
- **Action**: Click **Register**. Show the instant confirmation badge, attendee counter increment, and registered event pass.

---

#### **0:45 – 1:05 | Workflow 2: Hyperlocal Lost & Found**
- **Action**: Navigate to `/lost-found`.
- **Presenter**: "Next is our hyperlocal Lost & Found hub, tailored to NIT-AP landmarks including Central Library, SRK Bhavan, and Hostels 1 through 4."
- **Action**: Filter by 'Found Belongings' or search `Casio`. Open the **Casio FX-991EX Calculator** report found in CSE Lab 2.
- **Presenter**: "To protect privacy and prevent theft, student phone numbers are guarded. Any student who lost their item can submit a claim with identifying proof. The finder can inspect the claim and mark the item as Resolved."
- **Action**: Switch to the reporter persona and show the 'Mark as Resolved' button transitioning the status to Reunited.

---

#### **1:05 – 1:25 | Workflow 3: Campus Community & SIH Teammate Matching**
- **Action**: Navigate to `/community`.
- **Presenter**: "Our community feed is designed for practical student coordination: finding hackathon teammates for SIH, booking cab shares to Tadepalligudem railway station, and sharing academic notes."
- **Action**: Open the pinned post: *'Looking for 2 MERN / Next.js developers for Smart India Hackathon (SIH 2026)'*.
- **Presenter**: "Students can react with likes, ask questions in the discussion thread, or flag inappropriate spam directly to moderators."
- **Action**: Like the post, type a quick comment, and submit. Show the real-time comment appearing in the thread.

---

#### **1:25 – 1:50 | Workflow 4: Philanthropy Verification & Simulated Donation Checkout**
- **Action**: Switch persona to **Prof. K. Ramesh (Administrator)** and navigate to `/admin`.
- **Presenter**: "Unlike conventional crowdfunding, CampusConnect enforces an administrative review workflow. No campaign can raise funds without faculty approval."
- **Action**: In the Admin Dashboard, show the pending campaign *'Rural STEM Outreach for ZP High School Tadepalligudem'*. Click **Approve & Grant Verified Badge**.
- **Action**: Switch persona back to **Student** and open `/philanthropy` to see the verified cause now live. Open the **NIT-AP Campus Paws** campaign and click **Test Donate**.
- **Presenter**: "Here is our simulated multi-rail payment checkout supporting demo UPI, test cards, and net banking. When a student contributes ₹500, an atomic server transaction updates the raised balance and creates an auditable transaction receipt."
- **Action**: Click 'Complete Simulated Test Donation'. Show the instant printable receipt with transaction reference `NITAP-SIM-XXXXXX`.

---

#### **1:50 – 2:00 | Technology Stack & Impact Summary**
- **Presenter**: "CampusConnect is built using **Next.js 14 App Router, TypeScript, Tailwind CSS, and Prisma ORM**, backed by automated test suites and complete role-based authorization for NIT Andhra Pradesh. Thank you!"

---

### Quick Demo Persona Credentials

| Persona | Name | Role | Test Email | Password |
|---|---|---|---|---|
| **Student** | Arun Kumar | `STUDENT` | `arun.cse@nitandhra.ac.in` | `Password123!` |
| **Moderator** | Priya Sharma | `MODERATOR` | `priya.ece@nitandhra.ac.in` | `Password123!` |
| **Administrator** | Prof. K. Ramesh | `ADMIN` | `admin@nitandhra.ac.in` | `Password123!` |
| **Pending Student** | Rahul Varma | `STUDENT (PENDING)` | `rahul.eee@nitandhra.ac.in` | `Password123!` |
