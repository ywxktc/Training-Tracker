# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
A Next.js 15 web application for tracking Competitive Programming training history and performance using Codeforces API. Data is stored in browser's local storage.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: SWR for data fetching
- **Charts**: Recharts for progress visualization
- **Runtime**: React 19 RC

## Key Architecture

### Directory Structure
```
├── app/                    # Next.js App Router pages
│   ├── training/          # Training page with problem generation
│   ├── statistics/        # Statistics page with progress charts
│   └── upsolve/           # Upsolving page
├── components/            # React components
│   ├── ui/               # Radix UI-based components
│   └── core features     # Training, History, ProgressChart, etc.
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
│   └── codeforces/       # Codeforces API integrations
├── types/                # TypeScript type definitions
└── public/data/          # Static JSON data (levels, tags)
```

### Core Features
- **Training**: Generate random problems with tag filtering
- **Statistics**: Track performance with charts and history
- **Upsolving**: Review and track solved problems
- **User Management**: Handle Codeforces handle input and profile

## Development Commands

### Setup
```bash
npm install           # Install dependencies (may need --legacy-peer-deps)
```

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Type Checking
```bash
# No dedicated typecheck script - use build or dev
npm run dev          # Shows TypeScript errors in development
npm run build        # Comprehensive type checking
```

## Key Files to Know
- `app/page.tsx` - Home page with handle input
- `app/training/page.tsx` - Problem training interface
- `app/statistics/page.tsx` - Performance analytics
- `hooks/useTraining.ts` - Training state management
- `utils/codeforces/` - Codeforces API integrations
- `types/` - Shared TypeScript interfaces

## API Integration
- **Codeforces API**: All user/problem data fetched from Codeforces
- **Local Storage**: All training history stored client-side
- **Rate Limiting**: Consider Codeforces API limits (may need delays)

## Testing
No formal test suite configured. Manual testing through development server.

## Performance Notes
- Data loads may be slow due to Codeforces API calls
- Consider implementing caching for frequently accessed data
- All data is ephemeral (stored in localStorage) - warn users about clearing browser data