# API Documentation

This document provides comprehensive documentation for all backend API routes in the Community Portal application.

## Base URL

All API routes are prefixed with `/api` and follow Next.js App Router conventions.

## Authentication

Most endpoints require authentication via Supabase Auth. The authentication token is sent via cookies (handled automatically by Supabase client).

**Authentication Headers:**
- Cookies are automatically managed by Supabase client
- Server-side authentication is handled via `createServerClient()` from `@/app/lib/supabaseServerClient`

## Rate Limiting

Most POST endpoints implement rate limiting:
- **GET requests**: 60 requests per minute per IP
- **POST requests**: 10 requests per minute per IP

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when rate limit resets

## CORS

All endpoints include CORS headers for cross-origin requests.

## Response Format

All endpoints return JSON responses. Error responses follow this format:
```json
{
  "error": "Error message"
}
```

---

## Posts API

### GET `/api/posts`

Fetch all posts with pagination and filtering.

**Query Parameters:**
- `search` (optional): Search posts by tags
- `limit` (optional): Limit number of results

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "author_id": "uuid",
      "title": "string",
      "body": "string",
      "tags": ["string"],
      "image_urls": ["string"],
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "vote_score": 0,
      "is_pinned": false,
      "comment_count": 0,
      "author": {
        "username": "string",
        "full_name": "string",
        "avatar_url": "string",
        "role": "user" | "admin"
      },
      "user_vote": -1 | 0 | 1
    }
  ],
  "totalPostsCount": 0
}
```

**Rate Limit:** 60 requests/minute

---

### POST `/api/posts`

Create a new post.

**Request Body:**
```json
{
  "title": "string (required, min 1, max 255)",
  "body": "string (required, min 1)",
  "tags": ["string"] (optional),
  "image_urls": ["string"] (optional)
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "author_id": "uuid",
  "title": "string",
  "body": "string",
  "tags": ["string"],
  "image_urls": ["string"],
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "vote_score": 0,
  "author": {
    "username": "string",
    "full_name": "string",
    "avatar_url": "string"
  }
}
```

**Authentication:** Required  
**Rate Limit:** 10 requests/minute  
**Flux Points:** Awards 10 Flux points on successful creation

---

### GET `/api/posts/[id]`

Get a single post with all comments (threaded).

**Response:**
```json
{
  "id": "uuid",
  "author_id": "uuid",
  "title": "string",
  "body": "string",
  "tags": ["string"],
  "image_urls": ["string"],
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "vote_score": 0,
  "is_pinned": false,
  "author": {
    "username": "string",
    "full_name": "string",
    "avatar_url": "string",
    "role": "user" | "admin"
  },
  "user_vote": -1 | 0 | 1,
  "comments": [
    {
      "id": "uuid",
      "post_id": "uuid",
      "author_id": "uuid",
      "parent_comment_id": "uuid" | null,
      "body": "string",
      "created_at": "timestamp",
      "author": {
        "username": "string",
        "full_name": "string",
        "avatar_url": "string"
      },
      "vote_score": 0,
      "user_vote": -1 | 0 | 1,
      "replies": []
    }
  ]
}
```

**Authentication:** Required

---

### DELETE `/api/posts/[id]`

Delete a post.

**Authentication:** Required (author or admin)  
**Response:** `200 OK`
```json
{
  "success": true
}
```

---

### POST `/api/posts/pin`

Pin or unpin a post (admin only).

**Request Body:**
```json
{
  "postId": "uuid",
  "isPinned": boolean
}
```

**Authentication:** Required (admin only)  
**Logic:** When pinning, all other posts are automatically unpinned (only one pinned post at a time)

**Response:**
```json
{
  "id": "uuid",
  "is_pinned": boolean,
  ...
}
```

---

### POST `/api/posts/save`

Save or unsave a post for the current user.

**Request Body:**
```json
{
  "postId": "uuid"
}
```

**Authentication:** Required  
**Response:**
```json
{
  "saved": boolean
}
```

---

### GET `/api/posts/saved`

Get all saved posts for the current user.

**Authentication:** Required  
**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "body": "string",
    ...
    "author": {
      "username": "string",
      "full_name": "string",
      "avatar_url": "string"
    }
  }
]
```

---

### GET `/api/posts/user`

Get all posts by a specific user.

**Query Parameters:**
- `userId` (optional): User ID. If not provided, returns current user's posts.

**Authentication:** Required  
**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "body": "string",
    "vote_score": 0,
    "comment_count": 0,
    "author": {
      "username": "string",
      "full_name": "string",
      "avatar_url": "string",
      "role": "user" | "admin"
    }
  }
]
```

---

### POST `/api/posts/vote`

Vote on a post (upvote/downvote with toggle support).

**Request Body:**
```json
{
  "target_type": "post",
  "target_id": "uuid",
  "value": -1 | 1
}
```

**Authentication:** Required  
**Rate Limit:** 10 requests/minute  
**Logic:**
- If no vote exists: Creates new vote
- If same vote exists: Removes vote (toggle off)
- If opposite vote exists: Updates to new vote

**Response:**
```json
{
  "action": "created" | "updated" | "removed",
  "value": -1 | 1,
  "previous_value": -1 | 1 (if updated)
}
```

---

## Comments API

### POST `/api/comments`

Create a new comment.

**Request Body:**
```json
{
  "post_id": "uuid (required)",
  "body": "string (required)",
  "parent_comment_id": "uuid (optional, for replies)"
}
```

**Authentication:** Required  
**Rate Limit:** 10 requests/minute  
**Flux Points:** Awards 5 Flux points on successful creation

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "author_id": "uuid",
  "parent_comment_id": "uuid" | null,
  "body": "string",
  "created_at": "timestamp",
  "author": {
    "username": "string",
    "full_name": "string",
    "avatar_url": "string"
  },
  "vote_score": 0
}
```

---

### GET `/api/comments/user`

Get all comments by a specific user.

**Query Parameters:**
- `userId` (optional): User ID. If not provided, returns current user's comments.

**Authentication:** Required  
**Response:**
```json
[
  {
    "id": "uuid",
    "post_id": "uuid",
    "body": "string",
    "created_at": "timestamp",
    ...
  }
]
```

---

## Votes API

### POST `/api/votes`

Create, update, or remove a vote on a post or comment.

**Request Body:**
```json
{
  "target_type": "post" | "comment",
  "target_id": "uuid",
  "value": -1 | 1
}
```

**Authentication:** Required  
**Rate Limit:** 10 requests/minute  
**Logic:** Same as `/api/posts/vote` but works for both posts and comments

**Response:**
```json
{
  "action": "created" | "updated" | "removed",
  "value": -1 | 1,
  "previous_value": -1 | 1 (if updated)
}
```

---

## Profile API

### GET `/api/profile`

Get current user's profile.

**Authentication:** Required  
**Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "full_name": "string",
  "email": "string",
  "avatar_url": "string",
  "role": "user" | "admin",
  "bio": "string",
  "total_flux": 0,
  "posts_count": 0,
  "comments_count": 0,
  "conclaves_attended": 0,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

### PUT `/api/profile`

Update current user's profile.

**Request Body:**
```json
{
  "full_name": "string",
  "username": "string",
  "bio": "string (optional)"
}
```

**Authentication:** Required  
**Rate Limit:** 10 requests/minute

**Response:**
```json
{
  "id": "uuid",
  "username": "string",
  "full_name": "string",
  "bio": "string",
  ...
}
```

---

### POST `/api/profile/avatar`

Upload or update user avatar.

**Request Body:** (FormData or JSON with image URL)
```json
{
  "avatar_url": "string"
}
```

**Authentication:** Required

---

### GET `/api/avatar/[id]`

Get avatar image for a user.

**Response:** Image file or redirect to avatar URL

---

## Workshops API

### GET `/api/workshops`

Get all workshops with filtering.

**Query Parameters:**
- `search` (optional): Search by title or description
- `showArchived` (optional): Include archived workshops (admin only)
- `type` (optional): Filter by type (`AUDIO` | `VIDEO`)
- `status` (optional): Filter by status (`SCHEDULED` | `LIVE` | `ENDED`)

**Response:**
```json
{
  "workshops": [
    {
      "id": "uuid",
      "host_id": "uuid",
      "title": "string",
      "description": "string",
      "start_time": "timestamp",
      "status": "SCHEDULED" | "LIVE" | "ENDED",
      "type": "AUDIO" | "VIDEO",
      "recording_url": "string" | null,
      "ended_at": "timestamp" | null,
      "is_archived": false,
      "created_at": "timestamp"
    }
  ],
  "totalWorkshopsCount": 0
}
```

---

### POST `/api/workshops`

Create a new workshop (admin only).

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "start_time": "timestamp (required)",
  "status": "SCHEDULED" | "LIVE" | "ENDED" (optional, default: SCHEDULED),
  "type": "AUDIO" | "VIDEO" (optional, default: VIDEO)
}
```

**Authentication:** Required (admin only)  
**Response:** `201 Created`

---

### GET `/api/workshops/[id]`

Get a single workshop with host details and waitlist count.

**Response:**
```json
{
  "id": "uuid",
  "host_id": "uuid",
  "title": "string",
  "description": "string",
  "start_time": "timestamp",
  "status": "SCHEDULED" | "LIVE" | "ENDED",
  "type": "AUDIO" | "VIDEO",
  "recording_url": "string" | null,
  "waitlist_count": 0,
  "host": {
    "username": "string",
    "full_name": "string",
    "avatar_url": "string"
  },
  ...
}
```

---

### PATCH `/api/workshops/[id]`

Update workshop status or archive status (host only).

**Request Body:**
```json
{
  "status": "SCHEDULED" | "LIVE" | "ENDED" (optional),
  "is_archived": boolean (optional)
}
```

**Authentication:** Required (host only)  
**Logic:** If status is set to `ENDED`, `ended_at` is automatically set

---

### DELETE `/api/workshops/[id]`

Delete a workshop (host only).

**Authentication:** Required (host only)  
**Response:**
```json
{
  "message": "Workshop deleted successfully",
  "workshopTitle": "string"
}
```

---

### POST `/api/workshops/[id]/waitlist`

Join workshop waitlist.

**Request Body:**
```json
{
  "email": "string (required)"
}
```

**Response:** `201 Created`
```json
{
  "message": "Successfully joined waitlist"
}
```

**Logic:** Prevents duplicate entries (same email for same workshop)

---

### GET `/api/workshops/[id]/waitlist`

Get waitlist for a workshop (host only).

**Authentication:** Required (host only)  
**Response:**
```json
[
  {
    "user_email": "string",
    "created_at": "timestamp"
  }
]
```

---

## LiveKit API

### POST `/api/livekit/token`

Generate LiveKit access token for joining a workshop/conclave.

**Request Body:**
```json
{
  "roomName": "string (required)",
  "participantName": "string (required)",
  "workshopId": "uuid (required)"
}
```

**Authentication:** Required  
**Flux Points:** Awards 20 Flux points on successful token generation

**Response:**
```json
{
  "token": "jwt_token",
  "serverUrl": "string",
  "canPublish": boolean,
  "type": "AUDIO" | "VIDEO"
}
```

**Logic:**
- For `VIDEO` workshops: All participants can publish
- For `AUDIO` workshops: Only host and admins can publish by default

---

### POST `/api/livekit/manage-role`

Update participant permissions (host only).

**Request Body:**
```json
{
  "roomName": "string",
  "participantIdentity": "string",
  "canPublish": boolean
}
```

**Authentication:** Required (host only)

---

### POST `/api/livekit/manage-participant`

Remove a participant from the room (host only).

**Request Body:**
```json
{
  "roomName": "string",
  "participantIdentity": "string"
}
```

**Authentication:** Required (host only)

---

### POST `/api/livekit/mute-participant`

Mute or unmute a participant's track (host only).

**Request Body:**
```json
{
  "roomName": "string",
  "participantIdentity": "string",
  "trackSid": "string",
  "muted": boolean
}
```

**Authentication:** Required (host only)

---

### POST `/api/livekit/toggle-hand-raise`

Toggle hand raise status for a participant.

**Request Body:**
```json
{
  "roomName": "string",
  "participantIdentity": "string",
  "isHandRaised": boolean
}
```

**Authentication:** Required

---

### POST `/api/livekit/toggle-speak-permission`

Toggle speak permission for a participant (host only).

**Request Body:**
```json
{
  "roomName": "string",
  "participantIdentity": "string",
  "canSpeak": boolean
}
```

**Authentication:** Required (host only)

---

### POST `/api/livekit/start-recording`

Start recording a workshop (host only).

**Request Body:**
```json
{
  "roomName": "string",
  "workshopId": "uuid"
}
```

**Authentication:** Required (host only)  
**Prerequisites:** Workshop must be in `LIVE` status

**Response:**
```json
{
  "egressId": "string",
  "status": "string",
  "filename": "string"
}
```

**Logic:**
- Records to Supabase Storage bucket `recordings`
- Uses layout based on workshop type (`speaker` for AUDIO, `grid` for VIDEO)

---

### DELETE `/api/livekit/start-recording`

Stop recording a workshop (host only).

**Query Parameters:**
- `egressId`: Egress ID from start recording
- `workshopId`: Workshop ID

**Authentication:** Required (host only)

---

### POST `/api/livekit/webhook`

LiveKit webhook endpoint for room events.

**Authentication:** Validates webhook signature

---

### POST `/api/livekit/chat-moderation`

Moderate chat messages in LiveKit rooms.

**Request Body:**
```json
{
  "roomName": "string",
  "message": "string",
  "action": "allow" | "block"
}
```

**Authentication:** Required (host/admin)

---

## Tags API

### GET `/api/tags`

Get all unique tags from posts.

**Query Parameters:**
- `q` (optional): Search/filter tags
- `limit` (optional): Limit results (default: 10)

**Response:**
```json
{
  "tags": ["string"]
}
```

---

## Dashboard API

### GET `/api/dashboard`

Get dashboard statistics (currently returns mock data).

**Authentication:** Required  
**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "value": "string",
    "unit": "string",
    "change": "string",
    "period": "string"
  }
]
```

---

## Leaderboard API

### GET `/api/leaderboard`

Get leaderboard data (currently returns mock data).

**Response:**
```json
{
  "leaderboard": [
    {
      "id": "string",
      "rank": 0,
      "username": "string",
      "avatar": "string",
      "flux": 0,
      "activity": "string"
    }
  ],
  "recentActivity": [
    {
      "id": "string",
      "username": "string",
      "avatar": "string",
      "action": "string",
      "fluxGained": 0,
      "timestamp": "string"
    }
  ]
}
```

---

## Admin API

### GET `/api/admin/users`

Get all users (admin only).

**Authentication:** Required (admin only)  
**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "full_name": "string",
      "username": "string",
      "avatar_url": "string",
      "role": "user" | "admin",
      "created_at": "timestamp",
      "total_flux": 0
    }
  ],
  "totalUsers": 0
}
```

---

## Utility API

### GET `/api/check-username`

Check if a username is available.

**Query Parameters:**
- `username` (required): Username to check (min 3 chars, alphanumeric + underscore only)

**Response:**
```json
{
  "exists": boolean
}
```

**Validation:**
- Minimum 3 characters
- Only letters, numbers, and underscores allowed

---

## Events API

### GET `/api/events`

Get events (currently returns mock data).

**Query Parameters:**
- `search` (optional): Search events

**Response:**
```json
{
  "workshops": [...],
  "totalWorkshopsCount": 0
}
```

---

### POST `/api/events`

Create an event (currently mock implementation).

**Request Body:**
```json
{
  "type": "workshop",
  "title": "string",
  "description": "string",
  "date": "string",
  "time": "string",
  "duration": 0,
  "maxParticipants": 0,
  "link": "string"
}
```

---

## Notification API

### POST `/api/notify/post`

Send email notifications to all users about a new post.

**Request Body:**
```json
{
  "postId": "uuid"
}
```

**Authentication:** Required  
**Logic:**
- Fetches all profiles
- Filters out emails ending with `@neuralarc.ai`
- Sends email to all eligible users
- Uses HTML email template with post title, excerpt, and link

**Response:**
```json
{
  "message": "Post announcement emails sent successfully!"
}
```

---

### POST `/api/notify/conclave`

Send conclave invitation emails.

**Request Body:**
```json
{
  "conclaveId": "uuid",
  "emails": ["string"]
}
```

**Authentication:** Required

---

## Cron Jobs

### GET `/api/cron/check-workshop-notifications`

Cron job to check and send workshop notifications (e.g., for waitlist).

**Authentication:** Should be protected by cron secret or similar

---

## Email API

### POST `/api/email/notify`

Generic email notification endpoint.

**Request Body:**
```json
{
  "to": "string",
  "subject": "string",
  "html": "string"
}
```

**Authentication:** Required

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden: [reason]"
}
```

### 404 Not Found
```json
{
  "error": "[Resource] not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Notes

1. **Flux System**: The Flux gamification system automatically awards points via database triggers when certain actions occur (post creation, comment creation, conclave join).

2. **Vote Scoring**: Vote scores are calculated dynamically but can be cached on posts for performance.

3. **Comment Threading**: Comments support infinite nesting via `parent_comment_id`. The API returns flat lists that are structured into trees on the client side.

4. **LiveKit Integration**: LiveKit is used for real-time video/audio communication in workshops/conclaves. Tokens are generated server-side with appropriate permissions based on user role and workshop type.

5. **Image Uploads**: Post images are handled via `uploadPostImages` utility and stored in Supabase Storage.

6. **Rate Limiting**: Rate limiting is implemented using an in-memory LRU cache. In production, consider using Redis for distributed rate limiting.

7. **CORS**: All endpoints include CORS headers via `setCorsHeaders` utility.

8. **Validation**: Input validation is performed using Zod schemas for type safety and security.

