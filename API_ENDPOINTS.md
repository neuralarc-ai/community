# Community Portal API - API Endpoints

Comprehensive API documentation for all backend routes in the Community Portal application

**Version:** 1.0.0
**Base URL:** `/api`

---

## Authentication

Type: Supabase Auth
Method: Cookies (handled automatically by Supabase client)
Server-side: createServerClient() from @/app/lib/supabaseServerClient

---

## Rate Limiting

- **GET requests**: 60 requests per minute per IP
- **POST requests**: 10 requests per minute per IP

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when rate limit resets

---

## CORS

All endpoints include CORS headers for cross-origin requests

---

## Response Format

All endpoints return JSON responses. Error responses follow this format:
```json
{ "error": "Error message" }
```

---

## Posts API

### GET `/api/posts`

Fetch all posts with pagination and filtering

**Query Parameters:**
- `search` (optional): Search posts by tags
- `limit` (optional): Limit number of results

**Rate Limit:** 60 requests/minute
**Response:** `200 OK`
**Response Schema:**
```json
{
  "posts": "array of post objects",
  "totalPostsCount": "number"
}
```

---

### POST `/api/posts`

Create a new post

**Request Body:**
```json
{
  "title": string (required, min 1, max 255),
  "body": string (required, min 1),
  "tags": array of strings (optional),
  "image_urls": array of strings (optional)
}
```

**Authentication:** Required
**Rate Limit:** 10 requests/minute
**Flux Points:** Awards 10 Flux points on successful operation
**Response:** `201 Created`

---

### GET `/api/posts/[id]`

Get a single post with all comments (threaded)

**Authentication:** Required
**Response:** `200 OK`

---

### DELETE `/api/posts/[id]`

Delete a post

**Authentication:** Required
**Authorization:** author or admin
**Response:** `200 OK`

---

### POST `/api/posts/pin`

Pin or unpin a post (admin only)

**Request Body:**
```json
{
  "postId": uuid,
  "isPinned": boolean
}
```

**Authentication:** Required
**Authorization:** admin only
**Response:** `200 OK`

---

### POST `/api/posts/save`

Save or unsave a post for the current user

**Request Body:**
```json
{
  "postId": uuid
}
```

**Authentication:** Required
**Response:** `200 OK`

---

### GET `/api/posts/saved`

Get all saved posts for the current user

**Authentication:** Required
**Response:** `200 OK`

---

### GET `/api/posts/user`

Get all posts by a specific user

**Query Parameters:**
- `userId` (optional): User ID. If not provided, returns current user's posts

**Authentication:** Required
**Response:** `200 OK`

---

### POST `/api/posts/vote`

Vote on a post (upvote/downvote with toggle support)

**Request Body:**
```json
{
  "target_type": post,
  "target_id": uuid,
  "value": -1 | 1
}
```

**Authentication:** Required
**Rate Limit:** 10 requests/minute
**Response:** `200 OK`

---

## Comments API

### POST `/api/comments`

Create a new comment

**Request Body:**
```json
{
  "post_id": uuid (required),
  "body": string (required),
  "parent_comment_id": uuid (optional, for replies)
}
```

**Authentication:** Required
**Rate Limit:** 10 requests/minute
**Flux Points:** Awards 5 Flux points on successful operation
**Response:** `201 Created`

---

### GET `/api/comments/user`

Get all comments by a specific user

**Query Parameters:**
- `userId` (optional): User ID. If not provided, returns current user's comments

**Authentication:** Required
**Response:** `200 OK`

---

## Votes API

### POST `/api/votes`

Create, update, or remove a vote on a post or comment

**Request Body:**
```json
{
  "target_type": post | comment,
  "target_id": uuid,
  "value": -1 | 1
}
```

**Authentication:** Required
**Rate Limit:** 10 requests/minute
**Response:** `200 OK`

---

## Profile API

### GET `/api/profile`

Get current user's profile

**Authentication:** Required
**Response:** `200 OK`

---

### PUT `/api/profile`

Update current user's profile

**Request Body:**
```json
{
  "full_name": string,
  "username": string,
  "bio": string (optional)
}
```

**Authentication:** Required
**Rate Limit:** 10 requests/minute
**Response:** `200 OK`

---

### POST `/api/profile/avatar`

Upload or update user avatar

**Request Body:**
```json
{
  "avatar_url": string
}
```

**Authentication:** Required
**Response:** `200 OK`

---

### GET `/api/avatar/[id]`

Get avatar image for a user

**Response:** `200 OK`
**Response Type:** image file or redirect

---

## Workshops API

### GET `/api/workshops`

Get all workshops with filtering

**Query Parameters:**
- `search` (optional): Search by title or description
- `showArchived` (optional): Include archived workshops (admin only)
- `type` (optional): Filter by type (AUDIO | VIDEO)
- `status` (optional): Filter by status (SCHEDULED | LIVE | ENDED)

**Response:** `200 OK`

---

### POST `/api/workshops`

Create a new workshop (admin only)

**Request Body:**
```json
{
  "title": string (required),
  "description": string (optional),
  "start_time": timestamp (required),
  "status": SCHEDULED | LIVE | ENDED (optional, default: SCHEDULED),
  "type": AUDIO | VIDEO (optional, default: VIDEO)
}
```

**Authentication:** Required
**Authorization:** admin only
**Response:** `201 Created`

---

### GET `/api/workshops/[id]`

Get a single workshop with host details and waitlist count

**Response:** `200 OK`

---

### PATCH `/api/workshops/[id]`

Update workshop status or archive status (host only)

**Request Body:**
```json
{
  "status": SCHEDULED | LIVE | ENDED (optional),
  "is_archived": boolean (optional)
}
```

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

### DELETE `/api/workshops/[id]`

Delete a workshop (host only)

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

### POST `/api/workshops/[id]/waitlist`

Join workshop waitlist

**Request Body:**
```json
{
  "email": string (required)
}
```

**Response:** `201 Created`

---

### GET `/api/workshops/[id]/waitlist`

Get waitlist for a workshop (host only)

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

## LiveKit API

### POST `/api/livekit/token`

Generate LiveKit access token for joining a workshop/conclave

**Request Body:**
```json
{
  "roomName": string (required),
  "participantName": string (required),
  "workshopId": uuid (required)
}
```

**Authentication:** Required
**Flux Points:** Awards 20 Flux points on successful operation
**Response:** `200 OK`

---

### POST `/api/livekit/manage-role`

Update participant permissions (host only)

**Request Body:**
```json
{
  "roomName": string,
  "participantIdentity": string,
  "canPublish": boolean
}
```

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

### POST `/api/livekit/manage-participant`

Remove a participant from the room (host only)

**Request Body:**
```json
{
  "roomName": string,
  "participantIdentity": string
}
```

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

### POST `/api/livekit/mute-participant`

Mute or unmute a participant's track (host only)

**Request Body:**
```json
{
  "roomName": string,
  "participantIdentity": string,
  "trackSid": string,
  "muted": boolean
}
```

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

### POST `/api/livekit/toggle-hand-raise`

Toggle hand raise status for a participant

**Request Body:**
```json
{
  "roomName": string,
  "participantIdentity": string,
  "isHandRaised": boolean
}
```

**Authentication:** Required
**Response:** `200 OK`

---

### POST `/api/livekit/toggle-speak-permission`

Toggle speak permission for a participant (host only)

**Request Body:**
```json
{
  "roomName": string,
  "participantIdentity": string,
  "canSpeak": boolean
}
```

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

### POST `/api/livekit/start-recording`

Start recording a workshop (host only)

**Request Body:**
```json
{
  "roomName": string,
  "workshopId": uuid
}
```

**Authentication:** Required
**Authorization:** host only
**Prerequisites:** Workshop must be in LIVE status
**Response:** `200 OK`

---

### DELETE `/api/livekit/start-recording`

Stop recording a workshop (host only)

**Query Parameters:**
- `egressId` (required): string parameter
- `workshopId` (required): string parameter

**Authentication:** Required
**Authorization:** host only
**Response:** `200 OK`

---

### POST `/api/livekit/webhook`

LiveKit webhook endpoint for room events

**Authentication:** Validates webhook signature
**Response:** `200 OK`

---

### POST `/api/livekit/chat-moderation`

Moderate chat messages in LiveKit rooms

**Request Body:**
```json
{
  "roomName": string,
  "message": string,
  "action": allow | block
}
```

**Authentication:** Required
**Authorization:** host/admin
**Response:** `200 OK`

---

## Tags API

### GET `/api/tags`

Get all unique tags from posts

**Query Parameters:**
- `q` (optional): Search/filter tags
- `limit` (optional): Limit results (default: 10)

**Response:** `200 OK`

---

## Dashboard API

### GET `/api/dashboard`

Get dashboard statistics (currently returns mock data)

**Authentication:** Required
**Response:** `200 OK`

---

## Leaderboard API

### GET `/api/leaderboard`

Get leaderboard data (currently returns mock data)

**Response:** `200 OK`

---

## Admin API

### GET `/api/admin/users`

Get all users (admin only)

**Authentication:** Required
**Authorization:** admin only
**Response:** `200 OK`

---

## Utility API

### GET `/api/check-username`

Check if a username is available

**Query Parameters:**
- `username` (required): Username to check (min 3 chars, alphanumeric + underscore only)

**Response:** `200 OK`

---

## Events API

### GET `/api/events`

Get events (currently returns mock data)

**Query Parameters:**
- `search` (optional): Search events

**Response:** `200 OK`

---

### POST `/api/events`

Create an event (currently mock implementation)

**Request Body:**
```json
{
  "type": workshop,
  "title": string,
  "description": string,
  "date": string,
  "time": string,
  "duration": number,
  "maxParticipants": number,
  "link": string
}
```

**Response:** `200 OK`

---

## Notification API

### POST `/api/notify/post`

Send email notifications to all users about a new post

**Request Body:**
```json
{
  "postId": uuid
}
```

**Authentication:** Required
**Response:** `200 OK`

---

### POST `/api/notify/conclave`

Send conclave invitation emails

**Request Body:**
```json
{
  "conclaveId": uuid,
  "emails": array of strings
}
```

**Authentication:** Required
**Response:** `200 OK`

---

## Cron Jobs

### GET `/api/cron/check-workshop-notifications`

Cron job to check and send workshop notifications (e.g., for waitlist)

**Authentication:** Should be protected by cron secret or similar
**Response:** `200 OK`

---

## Email API

### POST `/api/email/notify`

Generic email notification endpoint

**Request Body:**
```json
{
  "to": string,
  "subject": string,
  "html": string
}
```

**Authentication:** Required
**Response:** `200 OK`

---

## Health Check API

### GET `/api/health`

Check API health status and database connectivity

**Response:** `200 OK`

---

## API Documentation

### GET `/api/docs`

Get API documentation in JSON format

**Response:** `200 OK`

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{ "error": "Error message" }
```

### 401 Unauthorized
```json
{ "error": "Error message" }
```

### 403 Forbidden
```json
{ "error": "Error message" }
```

### 404 Not Found
```json
{ "error": "Error message" }
```

### 429 Too Many Requests
```json
{ "error": "Error message" }
```

### 500 Internal Server Error
```json
{ "error": "Error message" }
```

