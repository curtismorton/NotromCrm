# CurtisOS

A unified work management system for talent management and business operations. Centralizes everything across brands, talent, deals, projects, and content creation.

## Purpose

CurtisOS is designed to manage the complete workflow for talent management operations including:
- Brand and talent relationship management
- Lead qualification and deal pipeline tracking
- Project lifecycle management from kickoff to delivery
- Content creation and publishing workflows
- Task management with priorities and deadlines
- Meeting scheduling and activity tracking

## Technology Stack

- **Frontend**: React 18 + TypeScript with Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Radix UI + shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query for server state
- **Authentication**: Session-based with PostgreSQL store

## Local Development

1. **Prerequisites**
   ```bash
   Node.js 18+ and PostgreSQL 14+
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other config
   ```

4. **Database setup**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `NODE_ENV` - Environment (development/production)

## Core Features

- **Dashboard**: Today view with pipeline tiles and urgent tasks
- **Inbox**: Unified view of new leads, approvals, and tasks
- **Brands & Talent**: Comprehensive contact and relationship management
- **Leads & Deals**: Pipeline tracking from discovery to contract
- **Projects**: Full lifecycle management with health indicators
- **Content**: Platform-specific scheduling and metrics
- **Tasks**: Priority-based task management with keyboard shortcuts
- **Reports**: Performance tracking and deal analytics

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push schema changes to database
npm test             # Run tests
```