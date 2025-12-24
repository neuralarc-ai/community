import { RoomServiceClient } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

const livekitHost = process.env.LIVEKIT_HOST;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

export async function POST(req: NextRequest) {
  if (!livekitHost || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'LiveKit environment variables are not set' }, { status: 500 });
  }

  const { roomName, participantIdentity, canSpeak } = await req.json();

  if (!roomName || !participantIdentity || typeof canSpeak === 'undefined') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

  try {
    console.log(`[API] Attempting to get participant: ${participantIdentity} in room: ${roomName}`);
    const participantInfo = await roomService.getParticipant(roomName, participantIdentity);
    console.log(`[API] Participant found: ${participantInfo.identity}`);

    const existingMetadata = participantInfo.metadata ? JSON.parse(participantInfo.metadata) : {};

    const newMetadata = JSON.stringify({
      ...existingMetadata,
      canSpeak: canSpeak,
    });

    console.log(`[API] Updating participant metadata for ${participantIdentity} to: ${newMetadata}`);
    await roomService.updateParticipant(roomName, participantIdentity, {
      metadata: newMetadata,
    });
    console.log(`[API] Successfully updated participant metadata for ${participantIdentity}`);


    return NextResponse.json({ message: `Successfully set speak permission for ${participantIdentity} to ${canSpeak}` });
  } catch (error: any) { // Casting error to 'any' to access properties like 'message'
    console.error('Detailed LiveKit error toggling speak permission:', error); // This logs to your server console

    let errorMessage = 'Failed to toggle speak permission';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('room not found')) {
        errorMessage = 'LiveKit Room not found for the given roomName.';
        statusCode = 404;
      } else if (error.message.includes('participant not found')) {
        errorMessage = 'LiveKit Participant not found in the specified room.';
        statusCode = 404;
      } else {
        // Fallback for other LiveKit SDK errors
        errorMessage = `LiveKit API Error: ${error.message}`;
      }
    } else if (typeof error === 'string') {
        errorMessage = `LiveKit API Error: ${error}`;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

