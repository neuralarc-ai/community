# System Architecture

For a high-level overview of the project, refer to the [main README file](./README.md).


## Overview
This project is a Community Portal application built with **Next.js 14+ (App Router)** and **Supabase**. It provides a platform for users to create posts, engage in threaded discussions, vote on content, and manage their profiles.

## Tech Stack
-   **Framework:** Next.js 14 (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS, Radix UI (Primitives), Lucide React (Icons)
-   **Database & Auth:** Supabase (PostgreSQL, GoTrue)
-   **State/Data:** Supabase Client (Client-side & Server-side)

## Directory Structure

```
├── app/
│   ├── (auth)/             # Authentication routes (login, signup) - Public
│   ├── (protected)/        # Protected routes (require auth)
│   │   ├── dashboard/      # User dashboard
│   │   ├── posts/          # Forum/Feed (List, Detail, Create)
│   │   ├── profile/        # User profile settings
│   │   └── complete-profile/ # Mandatory first-time setup
│   ├── api/                # Next.js API Routes (Backend logic)
│   ├── components/         # Shared React components
│   └── lib/                # Utilities & Supabase clients
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
-   `role`: 'user' | 'admin'.
-   `avatar_url`: Path to profile image.

### 2. Posts (`posts`)
Core content items.
-   `id`: UUID.
-   `author_id`: UUID (Foreign Key to `profiles`).
-   `title`: Text.
-   `body`: Text (Content).
    -   `tags`: Array of strings.

### 5. Workshops (`workshops`)
Interactive learning sessions.
-   `id`: UUID.
-   `host_id`: UUID (Foreign Key to `profiles`).
-   `title`: Text.
-   `description`: Text.
-   `scheduled_at`: Timestamp.

### 6. Conclaves (`conclaves`)
Focused discussion groups.
-   `id`: UUID.
-   `organizer_id`: UUID (Foreign Key to `profiles`).
-   `title`: Text.
-   `description`: Text.
-   `starts_at`: Timestamp.
-   `ends_at`: Timestamp.

### 3. Comments (`comments`)
Supports infinite nesting (threaded discussions).
-   `id`: UUID.
-   `post_id`: UUID.
-   `author_id`: UUID.
-   `parent_comment_id`: UUID (Self-referencing Foreign Key). Null for top-level comments.

### 4. Votes (`votes`)
Polymorphic voting system for posts and comments.
-   `user_id`: UUID.
-   `target_type`: 'post' | 'comment'.
-   `target_id`: UUID.
-   `value`: Integer (1 for upvote, -1 for downvote).

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

### 4. Workshops
-   **Creation:** Authenticated users can create new workshop listings.
-   **Viewing:** Users can browse upcoming workshops.
-   **Joining:** Users can register their interest or join a workshop.

### 5. Conclaves
-   **Creation:** Authenticated users can organize new conclave events.
-   **Viewing:** Users can see details of scheduled conclaves.
-   **Participation:** Users can join and engage in conclave discussions during their active period.

## Security
-   **RLS (Row Level Security):** Enabled on all tables.
    -   `posts`/`comments`: Publicly readable (authenticated), writeable only by author.
    -   `profiles`: Editable only by owner.
    -   `votes`: Managed only by owner.

