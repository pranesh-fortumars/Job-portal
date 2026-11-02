# Implementation Plan: Job Hai Recruiter Features for Job Portal

This plan outlines the architecture and execution steps to introduce the full suite of features from [employer.jobhai.com](https://employer.jobhai.com) into our Job Portal project.

---

## 1. Architectural Overview & New Features

### High-Level Feature Comparison
1. **Dedicated Recruiter Landing Funnel (`/hire`)**:
   - Hero banner with 48h hiring value proposition.
   - 3-Step visual hiring journey ("Post in < 1 min" ➔ "Direct candidate calls" ➔ "Interview & hire in 48h").
   - City & category browsing matrix for quick recruiter engagement.
   - Recruiter social proof & testimonials carousel.
   - Mobile app link SMS/WhatsApp trigger with validation.
   - Recruiter-centric FAQ accordion.

2. **Frontline & Direct Calling Job Capabilities**:
   - Employer toggle: `allowDirectCalls: boolean` and `callingWindow: { start: string, end: string }`.
   - Asset/credential checklist: `assetsRequired: { twoWheeler: boolean, dl: boolean, smartphone: boolean, laptop: boolean }`.
   - Shift & urgency flags: `isUrgentHiring: boolean`, `tatHours: number (e.g. 48)`.

3. **Direct Connect Candidate Workflow**:
   - Instant "Call Candidate" (`tel:+91...`) and "WhatsApp Candidate" direct CTA.
   - Fast disposition tracking ("Connected / Interview Scheduled", "Did not pick up", "Rejected").

4. **Recruiter Navigation & Entry Points**:
   - Prominent "Hire Staff / For Employers" button on header linking to `/hire`.
   - Dedicated "For Recruiters" links in the footer.

---

## 2. Phased Implementation Roadmap

### Phase 1: Data Model Updates (`src/lib/types.ts`)
- Extend `JobListing`:
  ```typescript
  allowDirectCalls?: boolean;
  callingContactNumber?: string;
  callingWindow?: { start: string; end: string };
  allowWhatsApp?: boolean;
  isUrgentHiring?: boolean;
  hireIn48Hours?: boolean;
  assetsRequired?: {
    twoWheeler?: boolean;
    drivingLicense?: boolean;
    smartphone?: boolean;
    laptop?: boolean;
  };
  ```

### Phase 2: Dedicated Employer Landing Page (`src/app/hire/page.tsx`)
- High-conversion responsive design mirroring Job Hai's recruiter funnel.
- Interactive sections:
  - **Hero CTA**: "Looking to hire staff in your city? Post a job for FREE & Hire in 48 Hours".
  - **3-Step Process Cards**: Visual flow with icons and micro-interactions.
  - **City & Category Explorer**: Quick links for popular local roles (Telecaller, Field Sales, Delivery, Back Office, Security, Driver).
  - **Recruiter Testimonials Carousel**: With quotes, hiring metrics, and company logos.
  - **Get App Link Component**: Validated 10-digit phone number with simulated instant SMS/WhatsApp link dispatch.
  - **Recruiter FAQs**: Accordion covering free postings, candidate verification, calling privacy, and TAT.

### Phase 3: Post-Job Experience Enhancements (`src/app/employer/post-job/page.tsx`)
- Add new card/section: **"Candidate Communication & Frontline Requirements"**:
  - Direct call toggle with calling hours selector (default `10:00 AM – 07:00 PM`).
  - WhatsApp chat toggle.
  - Asset requirements (Bike, Driving License, Smartphone, Laptop).
  - "Urgent Hiring / 48-Hour TAT" badge toggle.

### Phase 4: Job Seeker View & Direct Calling Action (`src/app/jobs/[jobId]/page.tsx`)
- Display "Direct Calling Allowed" badge on job details if enabled.
- If current time is within employer's calling window, show "Call Employer Directly" button (`tel:...`) and "WhatsApp HR".
- Display required assets checklist (e.g. Bike / Driving license required).

### Phase 5: Employer Dashboard & Resdex Direct Connect (`src/app/employer/dashboard/page.tsx`)
- Add fast "Call Candidate" & "WhatsApp Invite" buttons on applicant cards.
- Add quick call disposition modal/dropdown to mark status after call.

### Phase 6: Global Header & Footer Navigation
- Update `src/components/layout/Header.tsx` to include "Hire Staff" button pointing to `/hire`.
- Update `src/components/layout/Footer.tsx` with dedicated "For Employers / Recruiters" column.

---

## 3. Verification & Testing Plan
- Test `/hire` landing page on desktop and mobile viewports.
- Post a job with direct calling enabled and assets specified.
- Verify that the candidate view shows calling buttons during active calling hours.
- Verify that employer dashboard supports 1-click calling and WhatsApp invites.
