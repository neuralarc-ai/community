/**
 * Shared API documentation data
 * This module contains the API documentation structure that can be used by
 * both /api/docs/json and /api/docs/openapi routes without circular dependencies
 */

export const apiDocsData = {
  info: {
    title: 'Community Portal API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for all backend routes in the Community Portal application',
    baseUrl: '/api',
  },
  authentication: {
    type: 'Supabase Auth',
    method: 'Cookies (handled automatically by Supabase client)',
    serverSide: 'createServerClient() from @/app/lib/supabaseServerClient',
  },
  rateLimiting: {
    get: '60 requests per minute per IP',
    post: '10 requests per minute per IP',
    headers: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
  },
  cors: 'All endpoints include CORS headers for cross-origin requests',
  responseFormat: {
    success: 'JSON response with data',
    error: {
      format: '{ "error": "Error message" }',
      statusCodes: [400, 401, 403, 404, 429, 500],
    },
  },
  endpoints: [
    {
      path: '/api/posts',
      methods: ['GET', 'POST'],
      description: 'Posts API',
      routes: [
        {
          method: 'GET',
          path: '/api/posts',
          description: 'Fetch all posts with pagination and filtering',
          queryParameters: [
            { name: 'search', type: 'string', required: false, description: 'Search posts by tags' },
            { name: 'limit', type: 'number', required: false, description: 'Limit number of results' },
          ],
          authentication: false,
          rateLimit: '60 requests/minute',
          response: {
            status: 200,
            schema: {
              posts: 'array of post objects',
              totalPostsCount: 'number',
            },
          },
        },
        {
          method: 'POST',
          path: '/api/posts',
          description: 'Create a new post',
          requestBody: {
            title: 'string (required, min 1, max 255)',
            body: 'string (required, min 1)',
            tags: 'array of strings (optional)',
            image_urls: 'array of strings (optional)',
          },
          authentication: true,
          rateLimit: '10 requests/minute',
          fluxPoints: 10,
          response: { status: 201 },
        },
        {
          method: 'GET',
          path: '/api/posts/[id]',
          description: 'Get a single post with all comments (threaded)',
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'DELETE',
          path: '/api/posts/[id]',
          description: 'Delete a post',
          authentication: true,
          authorization: 'author or admin',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/posts/pin',
          description: 'Pin or unpin a post (admin only)',
          requestBody: {
            postId: 'uuid',
            isPinned: 'boolean',
          },
          authentication: true,
          authorization: 'admin only',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/posts/save',
          description: 'Save or unsave a post for the current user',
          requestBody: {
            postId: 'uuid',
          },
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'GET',
          path: '/api/posts/saved',
          description: 'Get all saved posts for the current user',
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'GET',
          path: '/api/posts/user',
          description: 'Get all posts by a specific user',
          queryParameters: [
            { name: 'userId', type: 'string', required: false, description: 'User ID. If not provided, returns current user\'s posts' },
          ],
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/posts/vote',
          description: 'Vote on a post (upvote/downvote with toggle support)',
          requestBody: {
            target_type: 'post',
            target_id: 'uuid',
            value: '-1 | 1',
          },
          authentication: true,
          rateLimit: '10 requests/minute',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/comments',
      methods: ['POST', 'GET'],
      description: 'Comments API',
      routes: [
        {
          method: 'POST',
          path: '/api/comments',
          description: 'Create a new comment',
          requestBody: {
            post_id: 'uuid (required)',
            body: 'string (required)',
            parent_comment_id: 'uuid (optional, for replies)',
          },
          authentication: true,
          rateLimit: '10 requests/minute',
          fluxPoints: 5,
          response: { status: 201 },
        },
        {
          method: 'GET',
          path: '/api/comments/user',
          description: 'Get all comments by a specific user',
          queryParameters: [
            { name: 'userId', type: 'string', required: false, description: 'User ID. If not provided, returns current user\'s comments' },
          ],
          authentication: true,
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/votes',
      methods: ['POST'],
      description: 'Votes API',
      routes: [
        {
          method: 'POST',
          path: '/api/votes',
          description: 'Create, update, or remove a vote on a post or comment',
          requestBody: {
            target_type: 'post | comment',
            target_id: 'uuid',
            value: '-1 | 1',
          },
          authentication: true,
          rateLimit: '10 requests/minute',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/profile',
      methods: ['GET', 'PUT'],
      description: 'Profile API',
      routes: [
        {
          method: 'GET',
          path: '/api/profile',
          description: 'Get current user\'s profile',
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'PUT',
          path: '/api/profile',
          description: 'Update current user\'s profile',
          requestBody: {
            full_name: 'string',
            username: 'string',
            bio: 'string (optional)',
          },
          authentication: true,
          rateLimit: '10 requests/minute',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/profile/avatar',
          description: 'Upload or update user avatar',
          requestBody: {
            avatar_url: 'string',
          },
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'GET',
          path: '/api/avatar/[id]',
          description: 'Get avatar image for a user',
          response: { status: 200, type: 'image file or redirect' },
        },
      ],
    },
    {
      path: '/api/workshops',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      description: 'Workshops API',
      routes: [
        {
          method: 'GET',
          path: '/api/workshops',
          description: 'Get all workshops with filtering',
          queryParameters: [
            { name: 'search', type: 'string', required: false, description: 'Search by title or description' },
            { name: 'showArchived', type: 'boolean', required: false, description: 'Include archived workshops (admin only)' },
            { name: 'type', type: 'string', required: false, description: 'Filter by type (AUDIO | VIDEO)' },
            { name: 'status', type: 'string', required: false, description: 'Filter by status (SCHEDULED | LIVE | ENDED)' },
          ],
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/workshops',
          description: 'Create a new workshop (admin only)',
          requestBody: {
            title: 'string (required)',
            description: 'string (optional)',
            start_time: 'timestamp (required)',
            status: 'SCHEDULED | LIVE | ENDED (optional, default: SCHEDULED)',
            type: 'AUDIO | VIDEO (optional, default: VIDEO)',
          },
          authentication: true,
          authorization: 'admin only',
          response: { status: 201 },
        },
        {
          method: 'GET',
          path: '/api/workshops/[id]',
          description: 'Get a single workshop with host details and waitlist count',
          response: { status: 200 },
        },
        {
          method: 'PATCH',
          path: '/api/workshops/[id]',
          description: 'Update workshop status or archive status (host only)',
          requestBody: {
            status: 'SCHEDULED | LIVE | ENDED (optional)',
            is_archived: 'boolean (optional)',
          },
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
        {
          method: 'DELETE',
          path: '/api/workshops/[id]',
          description: 'Delete a workshop (host only)',
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/workshops/[id]/waitlist',
          description: 'Join workshop waitlist',
          requestBody: {
            email: 'string (required)',
          },
          response: { status: 201 },
        },
        {
          method: 'GET',
          path: '/api/workshops/[id]/waitlist',
          description: 'Get waitlist for a workshop (host only)',
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/livekit',
      methods: ['POST', 'DELETE'],
      description: 'LiveKit API',
      routes: [
        {
          method: 'POST',
          path: '/api/livekit/token',
          description: 'Generate LiveKit access token for joining a workshop/conclave',
          requestBody: {
            roomName: 'string (required)',
            participantName: 'string (required)',
            workshopId: 'uuid (required)',
          },
          authentication: true,
          fluxPoints: 20,
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/manage-role',
          description: 'Update participant permissions (host only)',
          requestBody: {
            roomName: 'string',
            participantIdentity: 'string',
            canPublish: 'boolean',
          },
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/manage-participant',
          description: 'Remove a participant from the room (host only)',
          requestBody: {
            roomName: 'string',
            participantIdentity: 'string',
          },
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/mute-participant',
          description: 'Mute or unmute a participant\'s track (host only)',
          requestBody: {
            roomName: 'string',
            participantIdentity: 'string',
            trackSid: 'string',
            muted: 'boolean',
          },
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/toggle-hand-raise',
          description: 'Toggle hand raise status for a participant',
          requestBody: {
            roomName: 'string',
            participantIdentity: 'string',
            isHandRaised: 'boolean',
          },
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/toggle-speak-permission',
          description: 'Toggle speak permission for a participant (host only)',
          requestBody: {
            roomName: 'string',
            participantIdentity: 'string',
            canSpeak: 'boolean',
          },
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/start-recording',
          description: 'Start recording a workshop (host only)',
          requestBody: {
            roomName: 'string',
            workshopId: 'uuid',
          },
          authentication: true,
          authorization: 'host only',
          prerequisites: 'Workshop must be in LIVE status',
          response: { status: 200 },
        },
        {
          method: 'DELETE',
          path: '/api/livekit/start-recording',
          description: 'Stop recording a workshop (host only)',
          queryParameters: [
            { name: 'egressId', type: 'string', required: true },
            { name: 'workshopId', type: 'string', required: true },
          ],
          authentication: true,
          authorization: 'host only',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/webhook',
          description: 'LiveKit webhook endpoint for room events',
          authentication: 'Validates webhook signature',
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/livekit/chat-moderation',
          description: 'Moderate chat messages in LiveKit rooms',
          requestBody: {
            roomName: 'string',
            message: 'string',
            action: 'allow | block',
          },
          authentication: true,
          authorization: 'host/admin',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/tags',
      methods: ['GET'],
      description: 'Tags API',
      routes: [
        {
          method: 'GET',
          path: '/api/tags',
          description: 'Get all unique tags from posts',
          queryParameters: [
            { name: 'q', type: 'string', required: false, description: 'Search/filter tags' },
            { name: 'limit', type: 'number', required: false, description: 'Limit results (default: 10)' },
          ],
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/dashboard',
      methods: ['GET'],
      description: 'Dashboard API',
      routes: [
        {
          method: 'GET',
          path: '/api/dashboard',
          description: 'Get dashboard statistics (currently returns mock data)',
          authentication: true,
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/leaderboard',
      methods: ['GET'],
      description: 'Leaderboard API',
      routes: [
        {
          method: 'GET',
          path: '/api/leaderboard',
          description: 'Get leaderboard data (currently returns mock data)',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/admin',
      methods: ['GET'],
      description: 'Admin API',
      routes: [
        {
          method: 'GET',
          path: '/api/admin/users',
          description: 'Get all users (admin only)',
          authentication: true,
          authorization: 'admin only',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/check-username',
      methods: ['GET'],
      description: 'Utility API',
      routes: [
        {
          method: 'GET',
          path: '/api/check-username',
          description: 'Check if a username is available',
          queryParameters: [
            { name: 'username', type: 'string', required: true, description: 'Username to check (min 3 chars, alphanumeric + underscore only)' },
          ],
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/events',
      methods: ['GET', 'POST'],
      description: 'Events API',
      routes: [
        {
          method: 'GET',
          path: '/api/events',
          description: 'Get events (currently returns mock data)',
          queryParameters: [
            { name: 'search', type: 'string', required: false, description: 'Search events' },
          ],
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/events',
          description: 'Create an event (currently mock implementation)',
          requestBody: {
            type: 'workshop',
            title: 'string',
            description: 'string',
            date: 'string',
            time: 'string',
            duration: 'number',
            maxParticipants: 'number',
            link: 'string',
          },
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/notify',
      methods: ['POST'],
      description: 'Notification API',
      routes: [
        {
          method: 'POST',
          path: '/api/notify/post',
          description: 'Send email notifications to all users about a new post',
          requestBody: {
            postId: 'uuid',
          },
          authentication: true,
          response: { status: 200 },
        },
        {
          method: 'POST',
          path: '/api/notify/conclave',
          description: 'Send conclave invitation emails',
          requestBody: {
            conclaveId: 'uuid',
            emails: 'array of strings',
          },
          authentication: true,
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/cron',
      methods: ['GET'],
      description: 'Cron Jobs',
      routes: [
        {
          method: 'GET',
          path: '/api/cron/check-workshop-notifications',
          description: 'Cron job to check and send workshop notifications (e.g., for waitlist)',
          authentication: 'Should be protected by cron secret or similar',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/email',
      methods: ['POST'],
      description: 'Email API',
      routes: [
        {
          method: 'POST',
          path: '/api/email/notify',
          description: 'Generic email notification endpoint',
          requestBody: {
            to: 'string',
            subject: 'string',
            html: 'string',
          },
          authentication: true,
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/health',
      methods: ['GET'],
      description: 'Health Check API',
      routes: [
        {
          method: 'GET',
          path: '/api/health',
          description: 'Check API health status and database connectivity',
          response: { status: 200 },
        },
      ],
    },
    {
      path: '/api/docs',
      methods: ['GET'],
      description: 'API Documentation',
      routes: [
        {
          method: 'GET',
          path: '/api/docs',
          description: 'Get API documentation in JSON format (use /api/docs/json for JSON)',
          response: { status: 200 },
        },
      ],
    },
  ],
};

