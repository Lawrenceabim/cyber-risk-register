# Cyber Risk Register

A browser-based cybersecurity governance, risk, and compliance application built with React and TypeScript.

The application helps security and risk teams document cybersecurity risks, calculate their severity, assign ownership, monitor treatment deadlines, and maintain a portable local register.

> This is a portfolio and demonstration application. It supports cybersecurity risk management but does not scan systems, detect attacks, or replace a formal enterprise GRC platform.

## Purpose

Cybersecurity teams need a consistent way to answer questions such as:

- What risks currently affect the organization?
- Which risks require immediate attention?
- Who owns each risk?
- What treatment work is overdue or approaching its deadline?
- Which risks have been mitigated or accepted?
- Can the register be backed up and restored safely?

This project provides a focused interface for managing those decisions.

## Features

### Risk overview

The dashboard derives summary metrics directly from the current register:

- Total risks
- Critical risks
- Active risks
- Mitigated risks

Metrics update automatically when records are created, edited, imported, deleted, reset, or assigned a different status.

### Risk records

Each risk includes:

- Unique identifier
- Title and description
- Category
- Likelihood
- Impact
- Calculated score and severity
- Owner
- Treatment status
- Target date
- Last-updated date

### Search, filtering, and sorting

Users can:

- Search by risk ID, title, category, owner, or status
- Filter by status
- Filter by category
- Combine search and filters
- Sort by risk score, target date, or title
- Clear active filters while restoring keyboard focus

### Risk management

The application supports:

- Creating validated risk records
- Viewing complete risk details
- Editing risk metadata
- Updating treatment status
- Deleting risks after explicit confirmation
- Restoring the original demonstration register after confirmation

All state updates are immutable so the original seed data remains unchanged.

### Treatment timelines

Target dates are converted into clear treatment cues:

- Overdue
- Due today
- Due soon
- On track
- Completed
- Accepted

Timeline messages include exact day counts and do not rely on color alone.

### Local persistence

The current register is stored in browser `localStorage`.

Changes remain available after a browser refresh without requiring:

- A backend service
- Private credentials
- An external database
- Network access

Invalid or corrupted stored data is rejected safely, and the application falls back to the original demonstration data.

### JSON backup and restoration

Users can export the complete register as a versioned JSON document.

Example structure:

```json
{
  "kind": "cyber-risk-register",
  "version": 1,
  "exportedAt": "2026-08-18T12:34:56.000Z",
  "risks": []
}
```

Imported files are checked before they can replace existing data. Validation includes:

- Valid JSON syntax
- Correct application identifier
- Supported export version
- Valid export timestamp
- Complete risk records
- Supported categories and statuses
- Likelihood and impact values from 1 to 5
- Valid calendar dates
- Unique risk identifiers
- Maximum file size of 1 MB

A valid import still requires explicit user confirmation before replacing the current register.

## Risk scoring

Risk scores are derived from likelihood and impact:

```text
Risk score = likelihood x impact
```

Both likelihood and impact use values from 1 to 5.

| Score | Severity |
| ---: | --- |
| 20-25 | Critical |
| 12-19 | High |
| 6-11 | Medium |
| 1-5 | Low |

Severity is derived during rendering rather than stored independently, preventing the displayed severity from becoming inconsistent with the underlying risk factors.

## Accessibility

The interface was designed for keyboard and assistive-technology use.

Accessibility features include:

- Semantic headings, sections, tables, labels, and buttons
- A skip link to the main content
- Visible keyboard focus indicators
- Accessible names for controls and regions
- Keyboard-accessible table scrolling
- Focus trapping inside custom dialogs
- Escape-key dialog dismissal
- Focus restoration after dialogs close
- Live status announcements
- Confirmation before destructive replacement or deletion
- Text labels in addition to color-based status cues
- Responsive layouts for desktop and mobile screens
- Reduced-motion support

## Data and privacy

All demonstration risks are fictional.

The application:

- Does not send risk records to a server
- Does not require an account
- Does not contain client secrets
- Does not call external APIs
- Stores application data only in the current browser
- Creates exports locally through the browser
- Treats imported JSON as untrusted data and validates it before use

Clearing browser storage removes locally persisted changes unless they were exported first.

## Technology

- React 19
- TypeScript 6
- Vite 8
- Vitest
- Testing Library
- ESLint
- CSS

The project uses a single npm lockfile and is designed for Node.js 20 with npm 10.

## Getting started

### Prerequisites

Install:

- Node.js 20
- npm 10
- Git

Confirm the versions:

```bash
node --version
npm --version
git --version
```

### Install dependencies

Use the frozen lockfile:

```bash
npm ci
```

### Start development mode

```bash
npm run dev
```

Open the local address displayed by Vite, normally:

```text
http://localhost:5173
```

### Create a production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Quality checks

Run the automated test suite:

```bash
npm test
```

Run ESLint while treating warnings as failures:

```bash
npm run lint -- --max-warnings=0
```

Run the TypeScript and production-build checks:

```bash
npm run build
```

The test suite covers:

- Risk scoring and severity
- Timeline calculations
- Sorting
- Draft validation
- Persistence and corrupted-data fallback
- Search and combined filters
- Risk creation and editing
- Status updates
- Deletion confirmation
- Focus management
- JSON serialization and downloads
- JSON import validation
- Import replacement and cancellation
- Demo-data restoration

Tests are self-contained and do not require credentials, private services, or network access.

## Project structure

```text
src/
  components/    React interface components and component tests
  data/          Fictional seed risk records
  hooks/         Browser-persistence state management
  test/          Shared test configuration
  types/         Risk model and scoring rules
  utils/         Validation, timelines, sorting, import, and export logic
```

## Current limitations

This version is intentionally local and self-contained.

It does not currently provide:

- User authentication
- Role-based access control
- Server-side storage
- Multi-user collaboration
- Audit-log synchronization
- Organization-specific risk frameworks
- Encryption of browser storage

Those capabilities would require a trusted backend and a wider production-security design.