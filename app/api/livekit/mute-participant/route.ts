import { AccessToken, RoomServiceClient, TrackSource } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

const livekitHost = process.env.LIVEKIT_HOST;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

export async function POST(req: NextRequest) {
  if (!livekitHost || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'LiveKit environment variables are not set' }, { status: 500 });
  }

  const { roomName, participantIdentity, trackType } = await req.json();

  if (!roomName || !participantIdentity || !trackType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

  try {
    // Get participant information directly
    const participant = await roomService.getParticipant(roomName, participantIdentity);

    // Determine the track source based on trackType
    let source: TrackSource;
    let trackSid: string;
    let muted: boolean;

    if (trackType === 'audio') {
      source = TrackSource.MICROPHONE;
      // Find the audio track
      const audioTrack = participant.tracks?.find(t => t.source === TrackSource.MICROPHONE);
      if (!audioTrack) {
        return NextResponse.json({ error: 'Audio track not found' }, { status: 404 });
      }
      trackSid = audioTrack.sid;
      muted = !audioTrack.muted; // Toggle mute status
    } else if (trackType === 'video') {
      source = TrackSource.CAMERA;
      // Find the video track
      const videoTrack = participant.tracks?.find(t => t.source === TrackSource.CAMERA);
      if (!videoTrack) {
        return NextResponse.json({ error: 'Video track not found' }, { status: 404 });
      }
      trackSid = videoTrack.sid;
      muted = !videoTrack.muted; // Toggle mute status
    } else {
      return NextResponse.json({ error: 'Invalid track type' }, { status: 400 });
    }

    // Mute/unmute the participant's track
    await roomService.mutePublishedTrack(roomName, participantIdentity, trackSid, muted);

    return NextResponse.json({ message: `Successfully toggled ${trackType} for ${participantIdentity}` });
  } catch (error) {
    console.error('Error toggling participant mute status:', error);
    return NextResponse.json({ error: 'Failed to toggle participant mute status' }, { status: 500 });
  }
}

