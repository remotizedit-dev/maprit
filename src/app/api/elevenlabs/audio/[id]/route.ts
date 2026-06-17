import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "ELEVENLABS_API_KEY environment variable is not configured." }, { status: 500 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${id}/audio`, {
      headers: {
        "xi-api-key": apiKey
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Failed to fetch audio from ElevenLabs for conv ${id}:`, errText);
      return NextResponse.json({ success: false, error: "Failed to download audio from ElevenLabs" }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch (error: any) {
    console.error("Audio proxy route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
