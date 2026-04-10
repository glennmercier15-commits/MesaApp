# MindBridge Project Context

**Client:** MacKay Manor Inc. / MESA Mobile Outreach, Renfrew County, Ontario
**Project:** MindBridge — Community Mental Health & Recovery Companion App
**Stack:** React Native (Expo), Node.js backend, PostgreSQL, AWS ca-central-1
**Compliance:** PHIPA (Ontario), PIPEDA, WCAG 2.1 AA

## Core Brief
Build a full-stack mobile and web application that digitally extends MacKay Manor's MESA Mobile Outreach program and its four core services — Inpatient Recovery, Community Withdrawal Management (CWMS), Addiction Supportive Housing (ASH), and STOP Smoking — into the hands of clients, outreach workers, and paramedics across Renfrew and North Lanark Counties.

## User Roles
1. **Client** — individuals in active recovery, withdrawal management, or supportive housing.
2. **Outreach Worker / Paramedic** — mobile field staff conducting community check-ins.
3. **Case Manager / Admin** — MacKay Manor clinical staff managing caseloads.

## Core Feature Set (Client-Facing Wellness Hub)
- **Design:** Calming, stigma-free home screen using de-saturated teal and warm earth tones.
- **Daily Check-in:** Mood and craving check-in (emoji scale, no streaks, cumulative milestone counter — e.g. "You've checked in 30 times — that's 30 days you showed up for yourself").
- **Recovery Stage Tracker:** Aligned to MacKay Manor's 12-week program curriculum (coping strategies → stages of recovery → relapse prevention).
- **Safety Plan Builder:** Personal safety plan builder (editable, stored encrypted, shareable with assigned case manager).
- **Guided Exercises:** CBT exercises, breathwork (box breathing, 4-7-8), and grounding techniques (5-4-3-2-1 sensory).
- **STOP Smoking Log:** Tobacco craving log integrated with STOP Smoking program — tracks NRT usage and craving intensity over time.
- **Milestones:** Sobriety milestone markers (non-streak, opt-in — 1 week, 30 days, 90 days — framed as celebration, never shame).
- **Crisis & Emergency Layer:** Persistent crisis bar linking to Crisis Services Canada, MacKay Manor 24hr line, MESA team, and 911.
- **Community & Group Features:** Virtual group rooms (Daily.co), peer support channel (moderated/anonymous), and event calendar.
- **Housing & Stability (ASH):** Stability checklist, life skills library, task assignment, and rent supplement tracking.

## Design System
- **Primary:** #3D8B7A (Safety, Calm)
- **Secondary:** #7B9E87 (Growth)
- **Accent:** #C47B5A (Warmth, Humanity)
- **Background:** #F7F5F2 (Warm off-white)
- **Animations:** Slow, fluid (300–500ms ease-in-out).
- **Accessibility:** 16px min font, 44x44px min tap targets.
- **Tone:** Trauma-informed microcopy (e.g., "how you're feeling" instead of "symptoms").

## Technical Requirements
- **Mobile:** React Native (Expo) for iOS/Android.
- **Web:** Next.js portal for case managers.
- **Backend:** Node.js REST API with RBAC.
- **Database:** PostgreSQL with Row-Level Security (RLS).
- **Hosting:** AWS ca-central-1 (Canadian data residency).
- **Security:** AES-256 at rest, TLS 1.3 in transit, full audit logs.
- **Interoperability:** FHIR R4-compatible patient schema.
- **Video:** Twilio / Daily.co (PHIPA-compliant).
- **Architecture:** Offline-first with React Query + local SQLite.

## Monetization / Funding Model
This app operates on a B2G (Business-to-Government) + grant model, not consumer subscription:
- **Primary revenue:** County of Renfrew / Province of Ontario service contract (MacKay Manor received $1.8M federal SUAP funding in 2024 — this app fits directly within that scope).
- **Secondary:** White-label licensing to other rural Ontario MESA partner organizations and HART Hub communities (17 other communities received similar provincial funding in 2025).
- **Tertiary:** Grant applications to Health Canada's Substance Use and Addictions Program (SUAP) for digital health infrastructure.

## Location Privacy & Tracking (Two-Mode Design)
The app implements two distinct location modes to ensure PHIPA compliance and respect Ontario privacy rulings regarding meaningful disclosure:
- **Snapshot Mode (Default):** Captures a single GPS coordinate only when a Welfare Check is submitted. No continuous tracking.
- **Patrol Mode (Opt-in):** Background pings every 5 minutes for active sweeps. 
    - **Requirement:** Requires a separate, explicit disclosure and permission prompt.
    - **Visibility:** Must show a persistent notification/indicator while active so the worker is always aware of tracking.
- **Legal Context:** Continuous tracking without explicit, ongoing disclosure is a high-risk non-compliance area in Ontario.

## Agent Instructions
- **Compliance First:** Always consider PHIPA/PIPEDA requirements when designing data models or API routes.
- **Accessibility:** Ensure all UI components meet WCAG 2.1 AA standards (color contrast, touch targets).
- **Tone:** The UI and copy should be trauma-informed, calm, clear, and supportive. Avoid shame-based mechanics like "streaks" that reset to zero.
