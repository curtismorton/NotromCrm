# replit.md

## Overview

CurtisOS is a unified life and work management system that centralizes everything across four key areas: Notrom (side hustle web development), podcast production (Behind The Screens), day job (Head of Talent Management at Socially Powerful), and general tasks. This full-stack application features a React frontend with TypeScript, Node.js/Express backend, PostgreSQL database with Drizzle ORM, and AI-powered features using OpenAI's GPT-4o model. The system is designed mobile-first with support for quick capture and unified dashboard views.

## Recent Changes

### CurtisOS Transformation (July 2025)
- ✅ Updated database schema with context enum for task categorization
- ✅ Added podcast episodes and life trackers tables
- ✅ Transformed navigation to reflect four main sections: Notrom, Podcast, Day Job, General Tasks
- ✅ Created dedicated pages for each life/work context
- ✅ Updated dashboard to show unified view with task distribution across contexts
- ✅ Successfully pushed schema changes to database using Drizzle
- ✅ Integrated context-aware filtering throughout the application

### Mobile-First Visual Enhancement (July 30, 2025)
- ✅ Added context field to leads table to distinguish Notrom vs day job
- ✅ Created comprehensive mobile-first pipeline with visual context separation
- ✅ Replaced table-based layouts with responsive card layouts for mobile
- ✅ Enhanced pipeline with icons, colors, and visual hierarchy
- ✅ Added mobile bottom navigation for touch-friendly access
- ✅ Implemented context-aware lead management with color coding
- ✅ Created comprehensive explainers throughout the system
- ✅ Improved dashboard widgets with functional interactions

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Express sessions with PostgreSQL store
- **AI Integration**: OpenAI GPT-4o for task suggestions and natural language processing
- **Logging**: Pino logger with pretty printing in development

### Database Schema
- **Users**: Authentication and profile management
- **Sessions**: Session storage for authentication
- **Leads**: Lead management with status tracking
- **Projects**: Project lifecycle management
- **Clients**: Client information and relationships
- **Tasks**: Task management with priorities and due dates
- **Tags**: Flexible tagging system for categorization
- **Activities**: Audit trail for all system activities
- **Development Plans**: AI-generated development strategies

## Key Components

### Authentication System
- User management with upsert functionality
- Session-based authentication using PostgreSQL session store
- Profile management with image support

### Business Management Features
- **Lead Management**: Track leads through sales pipeline (new, contacted, qualified, proposal, negotiation, won, lost)
- **Project Management**: Full project lifecycle with status tracking (planning, onboarding, in_progress, review, completed, on_hold, cancelled)
- **Client Management**: Client profiles with contact information and relationship tracking
- **Task Management**: Task assignment, prioritization, and progress tracking
- **Tagging System**: Flexible categorization across all entities

### AI-Powered Features
- **Task Suggestions**: AI generates relevant tasks based on project descriptions
- **Natural Language Updates**: Process task updates using natural language
- **Priority Analysis**: AI-powered priority recommendations
- **Development Planning**: Generate comprehensive development strategies

### Dashboard & Analytics
- Real-time statistics and metrics
- Recent activity tracking
- Upcoming task reminders
- Project progress visualization
- AI-powered priority insights

## Data Flow

1. **Client Requests**: React frontend makes API requests using TanStack Query
2. **API Processing**: Express backend processes requests with validation
3. **Database Operations**: Drizzle ORM handles all database interactions
4. **AI Integration**: OpenAI API called for intelligent features
5. **Response Handling**: Structured responses with proper error handling
6. **State Management**: TanStack Query manages caching and synchronization

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Services**: OpenAI GPT-4o API
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS framework
- **Validation**: Zod schema validation
- **Date Handling**: date-fns library

### Development Tools
- **Build System**: Vite with React plugin
- **TypeScript**: Full type safety across the stack
- **Database Migration**: Drizzle Kit for schema management
- **Code Quality**: ESLint and TypeScript compiler checks

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild compiles TypeScript server to `dist/index.js`
3. **Database Setup**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Local development with hot reloading
- **Production**: Optimized builds with environment-specific configurations
- **Database**: Connection via `DATABASE_URL` environment variable
- **AI Services**: OpenAI API key configuration
- **Security**: Session secret for authentication

### Runtime Requirements
- Node.js environment with ES module support
- PostgreSQL database (Neon serverless recommended)
- OpenAI API access for AI features
- Environment variables for configuration

The application is designed for scalability and maintainability, with clear separation of concerns, comprehensive error handling, and modern development practices throughout the stack.