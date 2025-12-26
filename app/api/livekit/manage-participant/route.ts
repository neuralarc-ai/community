import { NextRequest, NextResponse } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';
import { createServerClient } from '@/app/lib/supabaseServerClient';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(request: NextRequest) {
  try {
    const { roomName, participantIdentity } = await request.json();

    if (!roomName || !participantIdentity) {
      const response = NextResponse.json(
        { error: 'Missing required fields: roomName, participantIdentity' },
        { status: 400 }
      );
      return setCorsHeaders(request, response);
    }

    // Verify user is authenticated and check if they're the host
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return setCorsHeaders(request, response);
    }

    // Check if user is the host of this workshop (assuming roomName is workshopId)
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('host_id')
      .eq('id', roomName) // Assuming roomName is the workshopId
      .single();

    if (workshopError || !workshop || workshop.host_id !== user.id) {
      const response = NextResponse.json(
        { error: 'Forbidden: User is not the host of this room' },
        { status: 403 }
      );
      return setCorsHeaders(request, response);
    }

    // Remove participant
    await roomService.removeParticipant(roomName, participantIdentity);

    const finalResponse = NextResponse.json({ success: true });
    return setCorsHeaders(request, finalResponse);

  } catch (error) {
    console.error('Error removing participant:', error);
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return setCorsHeaders(request, errorResponse);
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
