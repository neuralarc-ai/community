# System Architecture

For a high-level overview of the project, refer to the [main README file](./README.md).

## Overview
This project is a Community Portal application built with **Next.js 16 (App Router)** and **Supabase**. It provides a platform for users to create posts, engage in threaded discussions, vote on content, manage profiles, participate in live workshops/conclaves via LiveKit, and earn Flux points for engagement.

## Tech Stack
-   **Framework:** Next.js 16 (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS, Radix UI (Primitives), Lucide React (Icons)
-   **Database & Auth:** Supabase (PostgreSQL, GoTrue)
-   **State/Data:** Supabase Client (Client-side & Server-side)
-   **Real-time Communication:** LiveKit (for workshops/conclaves)
-   **Email:** Nodemailer/Resend (for notifications)
-   **Validation:** Zod
-   **Rate Limiting:** Custom rate limiting middleware

## Directory Structure

```
├── app/
│   ├── (auth)/             # Authentication routes (login, signup) - Public
│   ├── (protected)/        # Protected routes (require auth)
│   │   ├── dashboard/      # User dashboard (admin only)
│   │   ├── flux-dashboard/ # Flux points dashboard
│   │   ├── posts/          # Forum/Feed (List, Detail, Create)
│   │   ├── profile/        # User profile settings & view
│   │   ├── complete-profile/ # Mandatory first-time setup
│   │   ├── create-avatar/  # Avatar creation page
│   │   └── workshops/      # Workshop listing, live, and watch pages
│   ├── conclave/          # Conclave room pages
│   ├── api/                # Next.js API Routes (Backend logic)
│   │   ├── admin/          # Admin endpoints
│   │   ├── avatar/         # Avatar management
│   │   ├── comments/       # Comment CRUD operations
│   │   ├── cron/           # Scheduled tasks
│   │   ├── dashboard/      # Dashboard data
│   │   ├── events/         # Events API (mock data)
│   │   ├── leaderboard/   # Leaderboard data
│   │   ├── livekit/        # LiveKit integration (token, recording, moderation)
│   │   ├── notify/         # Notification endpoints
│   │   ├── posts/          # Post CRUD, voting, pinning, saving
│   │   ├── profile/        # Profile management
│   │   ├── tags/           # Tag search/autocomplete
│   │   ├── votes/          # Voting system
│   │   └── workshops/     # Workshop CRUD and waitlist
│   ├── components/         # Shared React components
│   │   ├── conclave/      # Conclave-specific components
│   │   ├── flux/          # Flux dashboard components
│   │   └── ui/            # Reusable UI components
│   ├── emails/            # Email templates
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & Supabase clients
│   ├── validationSchemas/ # Zod validation schemas
│   └── types.ts           # TypeScript type definitions
├── components/            # Root-level shared components
├── lib/                   # Root-level utilities (flux system)
├── supabase/
│   └── migrations/         # SQL migrations for database schema
└── public/                 # Static assets
```

## Data Model (Supabase)

The application uses a relational database schema on Supabase.

### 1. Profiles (`profiles`)
Extends the default Supabase `auth.users` table.
-   `id`: UUID (Foreign Key to `auth.users`)
-   `username`: Unique handle.
-   `full_name`: Display name.
-   `email`: Email address (synced with auth.users).
-   `role`: 'user' | 'admin'.
-   `avatar_url`: Path to profile image.
-   `bio`: Text (user biography).
-   `total_flux`: BigInt (total Flux points earned).
-   `posts_count`: Integer (cached count).
-   `comments_count`: Integer (cached count).
-   `conclaves_attended`: Integer (cached count).
-   `created_at`: Timestamp.
-   `updated_at`: Timestamp.

### 2. Posts (`posts`)
Core content items.
-   `id`: UUID.
-   `author_id`: UUID (Foreign Key to `profiles`).
-   `title`: Text.
-   `body`: Text (Content).
-   `tags`: Array of strings.
-   `image_urls`: Array of strings (image URLs).
-   `vote_score`: Integer (calculated from votes).
-   `is_pinned`: Boolean (admin can pin posts).
-   `created_at`: Timestamp.
-   `updated_at`: Timestamp.

### 3. Comments (`comments`)
Supports infinite nesting (threaded discussions).
-   `id`: UUID.
-   `post_id`: UUID (Foreign Key to `posts`).
-   `author_id`: UUID (Foreign Key to `profiles`).
-   `parent_comment_id`: UUID (Self-referencing Foreign Key). Null for top-level comments.
-   `body`: Text.
-   `created_at`: Timestamp.

### 4. Votes (`votes`)
Polymorphic voting system for posts and comments.
-   `id`: UUID.
-   `user_id`: UUID (Foreign Key to `profiles`).
-   `target_type`: 'post' | 'comment'.
-   `target_id`: UUID.
-   `value`: Integer (1 for upvote, -1 for downvote).
-   `created_at`: Timestamp.

### 5. Workshops (`workshops`)
Interactive learning sessions and conclaves (live video/audio rooms).
-   `id`: UUID.
-   `host_id`: UUID (Foreign Key to `profiles`).
-   `title`: Text.
-   `description`: Text.
-   `start_time`: Timestamp.
-   `status`: 'SCHEDULED' | 'LIVE' | 'ENDED'.
-   `type`: 'AUDIO' | 'VIDEO'.
-   `recording_url`: Text (URL to recording).
-   `ended_at`: Timestamp (when workshop ended).
-   `is_archived`: Boolean.
-   `created_at`: Timestamp.

### 6. Workshop Waitlist (`workshop_waitlist`)
Waitlist for workshop participants.
-   `id`: UUID.
-   `workshop_id`: UUID (Foreign Key to `workshops`).
-   `user_email`: Text.
-   `notified`: Boolean.
-   `created_at`: Timestamp.

### 7. Saved Posts (`saved_posts`)
User's saved posts for later reading.
-   `id`: UUID.
-   `user_id`: UUID (Foreign Key to `profiles`).
-   `post_id`: UUID (Foreign Key to `posts`).
-   `created_at`: Timestamp.

### 8. Flux Logs (`flux_logs`)
Gamification system for user engagement.
-   `id`: UUID.
-   `user_id`: UUID (Foreign Key to `profiles`).
-   `amount`: Integer (points awarded).
-   `action_type`: 'POST_CREATE' | 'COMMENT_CREATE' | 'CONCLAVE_JOIN'.
-   `created_at`: Timestamp.

### 9. Post Comment Counts (View)
Materialized view for efficient comment counting.
-   `post_id`: UUID.
-   `comment_count`: Integer.

## Core Flows

### 1. Authentication & Onboarding
1.  **Entry:** User visits root `/`.
2.  **Check:** Middleware/Effect checks for active Supabase session.
    -   *No Session:* Redirect to `/login`.
    -   *Has Session:* Check if `profiles` record exists.
        -   *No Profile:* Redirect to `/complete-profile` to set username/name.
        -   *Has Profile:* Redirect to `/posts` (Main Feed).

### 2. Posting & Discussion
-   **Feed:** Fetches posts with author details and vote counts.
-   **View Post:** Fetches post details + threaded comments.
-   **Commenting:** Users can reply to the post or other comments. The UI handles nested rendering recursively.

### 3. Voting
-   Optimistic UI updates are used for immediate feedback.
-   Backend enforces one vote per user per target (Upsert logic).
-   Users can toggle votes (clicking same vote removes it).
-   Vote scores are calculated and cached on posts.

### 4. Workshops & Conclaves
-   **Creation:** Only admins can create new workshop listings.
-   **Viewing:** Users can browse upcoming workshops with filtering (type, status, search).
-   **Live Rooms:** Workshops use LiveKit for real-time video/audio communication.
-   **Types:** 
    -   `VIDEO`: All participants can publish video/audio.
    -   `AUDIO`: Only host and admins can speak; others must raise hand.
-   **Recording:** Hosts can start/stop recordings, stored in Supabase Storage.
-   **Waitlist:** Users can join waitlist for workshops.
-   **Moderation:** Hosts can mute participants, manage roles, remove participants.

### 5. Flux System (Gamification)
-   Users earn Flux points for various actions:
    -   Creating a post: 10 points
    -   Creating a comment: 5 points
    -   Joining a conclave: 20 points
-   Flux is tracked in `flux_logs` and automatically updates `profiles.total_flux` via database trigger.
-   Leaderboard displays top users by Flux.

### 6. Post Management
-   **Pinning:** Admins can pin posts (only one pinned post at a time).
-   **Saving:** Users can save posts for later reading.
-   **Images:** Posts support multiple image URLs.
-   **Tags:** Posts can have tags for categorization and search.

### 7. Notifications
-   Email notifications for new posts (sent to all users except @neuralarc.ai emails).
-   Workshop waitlist notifications (via cron job).
-   Conclave invitation emails.

## Security

### Authentication & Authorization
-   **Middleware:** Protects routes, redirects unauthenticated users, enforces profile completion.
-   **Role-Based Access:** Admin role required for dashboard, workshop creation, post pinning.
-   **Ownership Checks:** Users can only edit/delete their own content (posts, comments, profiles).

### Row Level Security (RLS)
RLS is enabled on all tables with the following policies:
-   **`profiles`**: 
    -   Readable by all authenticated users.
    -   Editable only by owner.
-   **`posts`**: 
    -   Readable by all authenticated users.
    -   Creatable by authenticated users.
    -   Editable/deletable by author or admin.
-   **`comments`**: 
    -   Readable by all authenticated users.
    -   Creatable by authenticated users.
    -   Editable/deletable by author.
-   **`votes`**: 
    -   Users can only manage their own votes.
-   **`workshops`**: 
    -   Readable by all.
    -   Creatable only by admins.
    -   Editable/deletable only by host.
-   **`saved_posts`**: 
    -   Users can only view/manage their own saved posts.
-   **`flux_logs`**: 
    -   Users can only view their own flux logs.

### Rate Limiting
-   API endpoints implement rate limiting to prevent abuse:
    -   GET requests: 60 requests per minute per IP.
    -   POST requests: 10 requests per minute per IP.
-   Rate limit headers included in responses.

### CORS
-   All API endpoints include CORS headers for cross-origin requests.

### Data Validation
-   Input validation using Zod schemas.
-   Username validation (alphanumeric + underscore, min 3 chars).
-   Post/comment body validation.

