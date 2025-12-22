import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

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
  });
  return at.toJwt();
};

export async function POST(req: NextRequest) {
  const { roomName, participantIdentity, isHandRaised } = await req.json();

  if (!roomName || !participantIdentity || typeof isHandRaised !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling hand raise on LiveKit:', error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error('LiveKit API Error details:', error.message, error.stack);
    } else {
      console.error('Unknown error details:', error);
    }
    return NextResponse.json({ error: 'Failed to toggle hand raise' }, { status: 500 });
  }
}

