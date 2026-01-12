# Brown Safety Hub

A lightweight, student-facing safety reporting interface designed for campus use.

Brown Safety Hub allows users to quickly submit incident reports with clear context (type, location, confidence, urgency) through a clean, mobile-first UI. This project is currently a **frontend prototype**, focused on usability and reporting flow rather than backend integration.

---

## What this project does

- Provides a simple interface for submitting safety or incident reports
- Captures:
  - Incident type
  - Location
  - Description
  - Confidence level
  - Urgency flag
- Shows a clear submission and success flow
- Optimized for clarity and speed during stressful situations

---

## What this project does NOT do

- Does **not** contact real emergency services
- Does **not** perform AI analysis or automated decision-making
- Does **not** yet integrate with official Brown University systems
- Does **not** yet store reports in a database

This is a **prototype UI only**.

---

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS

No backend. No external APIs required.

---

## Project structure (high level)

```
src/
├── components/
│   ├── Hub.tsx
│   ├── ReportForm.tsx
│   ├── LiveMap.tsx
│   └── History.tsx
├── App.tsx
├── index.tsx
├── constants.tsx
└── types.ts
```

---

## Run locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

---

## Project status

This is an **early-stage frontend prototype** exploring:
- UX design for campus safety reporting
- Information clarity under pressure
- Mobile-first interface design

Potential future directions may include:
- Backend persistence
- Authentication
- Integration with campus safety infrastructure

---

## Disclaimer

This project is **not an official Brown University product** and is **not connected to real emergency or safety services**.

It is a student-built prototype for exploration and demonstration purposes only.
