# FoodieFinder

## Overview

FoodieFinder is a restaurant discovery platform that enables users to browse and explore restaurants while providing administrators with tools to manage restaurant listings and menus. The application features a dual-interface design: a public-facing customer experience for discovering restaurants and an authenticated admin dashboard for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Wouter for client-side routing, providing a lightweight alternative to React Router with simple declarative route definitions.

**State Management**: TanStack Query (React Query) for server state management, handling data fetching, caching, and synchronization between client and server.

**UI Component Library**: Shadcn/ui components built on Radix UI primitives, providing accessible and customizable components with Tailwind CSS styling.

**Styling Approach**: Tailwind CSS with a custom design system following the "New York" style from Shadcn. The design is inspired by OpenTable and Zomato, emphasizing visual-first discovery with distinct typography (Poppins for headings, Open Sans for body text, Roboto for UI elements).

**Form Management**: React Hook Form with Zod schema validation for type-safe form handling and data validation.

### Backend Architecture

**Runtime**: Node.js with Express.js framework serving both API endpoints and static assets in production.

**Development Setup**: Custom dev server using Vite's middleware mode for hot module replacement and optimized development experience.

**API Design**: RESTful API structure with separate route handlers for public restaurant data and authenticated admin operations.

**Session Management**: Express-session with PostgreSQL session store (connect-pg-simple) for persistent admin authentication. Sessions are configured with httpOnly cookies and environment-specific security settings.

**Authentication Strategy**: Bcrypt-based password hashing for admin credentials with session-based authentication. Admin routes are protected via middleware that validates session state.

**Request Validation**: Zod schemas shared between frontend and backend ensure consistent data validation across the application stack.

### Data Storage

**Database**: PostgreSQL accessed via Neon's serverless driver with WebSocket support for connection pooling.

**ORM**: Drizzle ORM for type-safe database queries and schema management. Schema definitions in TypeScript are shared across the application.

**Schema Design**:
- **Sessions table**: Stores session data for admin authentication
- **Users table**: Customer profiles (prepared for future user authentication)
- **Admins table**: Administrator accounts with hashed passwords
- **Restaurants table**: Complete restaurant information including location coordinates, images, hours, and contact details
- **Menu items table**: Restaurant menu items with category organization and pricing

**Migration Strategy**: Drizzle Kit for schema migrations with the migration files output to a dedicated migrations directory.

### External Dependencies

**UI Component System**: Radix UI primitives (@radix-ui/*) providing unstyled, accessible component foundations for dialogs, dropdowns, navigation, forms, and other interactive elements.

**Database Service**: Neon Serverless PostgreSQL (@neondatabase/serverless) providing serverless Postgres with WebSocket connectivity.

**Styling Utilities**: 
- Tailwind CSS for utility-first styling
- class-variance-authority for component variant management
- tailwind-merge and clsx for conditional class composition

**Form & Validation**:
- react-hook-form for performant form state management
- @hookform/resolvers for Zod schema integration
- zod for runtime type validation

**Session Storage**: connect-pg-simple for PostgreSQL-backed session persistence

**Security**: bcrypt for password hashing and credential verification

**Development Tools**:
- Replit-specific plugins for development banner, error overlay, and code cartography
- tsx for TypeScript execution in development
- esbuild for production server bundling

### Deployment Architecture

**Production Build**: Two-stage build process:
1. Vite builds the React client into static assets
2. esbuild bundles the Express server with external package references

**Static Asset Serving**: In production, Express serves pre-built static files from the dist/public directory with fallback to index.html for client-side routing.

**Environment Configuration**: Environment variables for database URL and session secrets, with strict validation to prevent misconfiguration.