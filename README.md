# Community Portal

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), using [Supabase](https://supabase.com) for backend services.

## Project Overview

The Community Portal is a discussion platform where users can:
-   **Sign up and Login** securely.
-   **Create and Manage Profiles** (Avatar, Username, Bio).
-   **Create Posts** with rich text content.
-   **Engage in Discussions** with deeply nested, threaded comments.
-   **Vote** on posts and comments to curate content.
-   **Join Workshops** to learn and collaborate.
-   **Participate in Conclaves** for focused discussions.

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Supabase Project

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
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4.  **Database Setup**: Run the SQL migrations found in `supabase/migrations` in your Supabase SQL Editor to set up the tables and policies.

5.  Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Application Flow

### Authentication
The app uses Supabase Auth.
-   **Public Routes:** `/login`, `/signup`.
-   **Protected Routes:** All main application routes (`/posts`, `/dashboard`, etc.) require a valid session.
-   **Onboarding:** After signup, users are redirected to `/complete-profile` to ensure they have a unique username and display name before accessing the app.

### Features

-   **Feed (`/posts`)**: The main landing page for authenticated users, showing a list of recent discussions.
-   **Discussion (`/posts/[id]`)**: Detailed view of a post with a Reddit-style threaded comment section.
-   **Dashboard (`/dashboard`)**: Personal overview (currently a placeholder for user stats/activity).
-   **Profile (`/profile`)**: Manage your personal settings.

## Documentation

For a detailed technical breakdown, please refer to the [System Architecture document](./architecture.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
