# Community Portal

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), using [Supabase](https://supabase.com) for backend services.

## Project Overview

The Community Portal is a comprehensive discussion and collaboration platform where users can:
-   **Sign up and Login** securely via Supabase Auth.
-   **Create and Manage Profiles** with custom avatars, usernames, and bios.
-   **Create Posts** with rich text content, images, and tags.
-   **Engage in Discussions** with deeply nested, threaded comments.
-   **Vote** on posts and comments to curate content (upvote/downvote with toggle support).
-   **Save Posts** for later reading.
-   **Join Workshops** - Live video/audio sessions powered by LiveKit.
-   **Participate in Conclaves** - Focused discussion groups with moderation controls.
-   **Earn Flux Points** - Gamification system rewarding user engagement.
-   **View Leaderboards** - See top contributors ranked by Flux points.
-   **Admin Features** - Pin posts, create workshops, manage users (admin role required).

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Supabase Project (with PostgreSQL database)
-   LiveKit Server (for workshops/conclaves)
-   Email Service (Nodemailer/Resend for notifications)

### Installation

1.  Clone the repository.
2.  Install dependencies:

```bash
npm install
# or
yarn install
```

3.  **Environment Setup**: Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LiveKit (for workshops/conclaves)
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# Email (optional, for notifications)
# For Nodemailer:
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# For Resend:
RESEND_API_KEY=your_resend_api_key

# Site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
SENDER_NAME=Your Community Name
```

4.  **Database Setup**: Run the SQL migrations found in `supabase/migrations` in your Supabase SQL Editor to set up the tables and policies.

5.  Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Application Flow

### Authentication & Authorization
The app uses Supabase Auth with role-based access control.
-   **Public Routes:** `/login`, `/signup`.
-   **Protected Routes:** All main application routes require authentication:
    -   `/posts` - Main feed (all authenticated users)
    -   `/dashboard` - Admin dashboard (admin role required)
    -   `/workshops` - Workshop listings and live rooms
    -   `/profile` - User profile management
    -   `/conclave/[id]` - Conclave room pages
-   **Onboarding:** After signup, users are redirected to `/complete-profile` to set a unique username and display name.
-   **Profile Completion:** Users must complete their profile before accessing protected routes.

### Features

#### Core Features
-   **Feed (`/posts`)**: Main landing page showing recent discussions with pinned posts at the top. Supports search by tags, filtering, and pagination.
-   **Post Detail (`/posts/[id]`)**: Detailed view with Reddit-style threaded comments, voting, and save functionality.
-   **Create Post**: Rich text editor with image uploads and tag support.
-   **Comments**: Infinite nesting support for threaded discussions.
-   **Voting System**: Upvote/downvote posts and comments with toggle support (clicking same vote removes it).

#### Workshops & Conclaves
-   **Workshop Listings (`/workshops`)**: Browse upcoming, live, and past workshops. Filter by type (AUDIO/VIDEO) and status.
-   **Live Rooms (`/workshops/[id]/live`)**: Join live video/audio sessions powered by LiveKit.
-   **Watch Recordings (`/workshops/[id]/watch`)**: View past workshop recordings.
-   **Workshop Types**:
    -   **VIDEO**: All participants can publish video/audio.
    -   **AUDIO**: Only host and admins can speak; others raise hand to request permission.
-   **Moderation**: Hosts can mute participants, manage roles, remove participants, and control recording.

#### Gamification
-   **Flux Points**: Earn points for creating posts (10), comments (5), and joining conclaves (20).
-   **Leaderboard**: View top users ranked by Flux points.
-   **Flux Dashboard (`/flux-dashboard`)**: Personal Flux statistics and activity.

#### User Management
-   **Profile (`/profile/[userId]`)**: View user profiles with stats (posts, comments, Flux).
-   **Profile Settings (`/profile/settings`)**: Edit username, full name, bio, and avatar.
-   **Avatar Creation (`/create-avatar`)**: Create custom avatars using DiceBear.

#### Admin Features
-   **Admin Dashboard (`/dashboard`)**: Overview of community statistics (admin only).
-   **Post Pinning**: Pin important posts (only one pinned at a time).
-   **Workshop Creation**: Create and manage workshops.
-   **User Management**: View and manage all users.

#### Additional Features
-   **Saved Posts**: Save posts for later reading.
-   **Tag System**: Search and filter posts by tags.
-   **Email Notifications**: Get notified about new posts and workshop updates.
-   **Waitlist**: Join waitlists for workshops.
-   **Image Support**: Upload and display multiple images per post.

## Documentation

-   **[System Architecture](./architecture.md)** - Detailed technical breakdown of the system architecture, data model, and security.
-   **[API Documentation](./API.md)** - Complete documentation of all backend API routes and endpoints.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
