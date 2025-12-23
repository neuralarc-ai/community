import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { setCorsHeaders } from '@/app/lib/setCorsHeaders';

const createToken = (participantIdentity: string, roomName: string) => {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantIdentity,
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });
  return at.toJwt();
};

export async function POST(req: NextRequest) {
  let response: NextResponse<any> = NextResponse.json({});
  response = setCorsHeaders(req, response);
  
  // Use try/catch for JSON parsing in case body is empty
  let body;
  try {
    body = await req.json();
  } catch (e) {
    let errorResponse: NextResponse<any> = NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    return setCorsHeaders(req, errorResponse);
  }

  const { roomName, participantIdentity, isHandRaised } = body;

  if (!roomName || !participantIdentity || typeof isHandRaised !== 'boolean') {
    // Re-use the 'response' variable which is already typed as <any>
    response = NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    response = setCorsHeaders(req, response);
    return response;
  }

  const roomService = new RoomServiceClient(
    process.env.LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  );

  try {
    // Get current participant info to update metadata
    const p = await roomService.getParticipant(roomName, participantIdentity);
    const currentMetadata = p.metadata ? JSON.parse(p.metadata) : {};

    const newMetadata = JSON.stringify({ ...currentMetadata, handRaised: isHandRaised });

    await roomService.updateParticipant(roomName, participantIdentity, { metadata: newMetadata });

    // ✅ FIX 1: Explicitly type successResponse as <any>
    let successResponse: NextResponse<any> = NextResponse.json({ success: true });
    successResponse = setCorsHeaders(req, successResponse);
    return successResponse;

  } catch (error) {
    console.error('Error toggling hand raise on LiveKit:', error);
    if (error instanceof Error) {
      console.error('LiveKit API Error details:', error.message, error.stack);
    } else {
      console.error('Unknown error details:', error);
    }

    // ✅ FIX 2: Explicitly type errorResponse as <any>
    let errorResponse: NextResponse<any> = NextResponse.json({ error: 'Failed to toggle hand raise' }, { status: 500 });
    errorResponse = setCorsHeaders(req, errorResponse);
    return errorResponse;
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}