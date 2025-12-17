# **App Name**: EchoThread

## Core Features:

- Post Display: Display the main post with title, content, and author information, mirroring the Reddit post structure.
- Nested Replies: Implement a nested commenting system to allow users to reply to the main post and other comments, creating threaded discussions.
- Upvote/Downvote: Enable users to upvote or downvote posts and comments, influencing their visibility.
- User Authentication: Allow users to register, login, and manage their profiles to participate in discussions. User sessions will expire 3 days from last login. Each profile will contain Karma.
- Comment Moderation: Use an AI tool to automatically identify and flag inappropriate comments based on keywords, sentiment, and user reports.
- Real-time updates: Display immediate comment Karma score updates based on the current thread activity
- Data persistence: Data of posts, votes, users etc will be persisted to Cloud SQL.

## Style Guidelines:

- blue (#a6c8d4 to create a calm and sophisticated environment.
- Background color: SHADE OF WHITE (#fef4eb), a desaturated version of the primary hue, to ensure comfortable readability.
- Accent color: SHADE OF PASTEL PURPLE (#e6b31c), an analogous color to BLUE , used for interactive elements.
- Body and headline font: 'Inter', a grotesque sans-serif with a modern, machined look; good for both headers and body.
- Use simple, clear icons for voting, commenting, and sharing.
- A clean, card-based layout to organize posts and comments. The main post should be prominently displayed at the top, followed by nested comments.
- Subtle animations for upvotes and downvotes to provide visual feedback.