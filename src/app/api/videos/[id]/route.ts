// ~/app/api/videos/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { id } = await params;
    const videoId = id;

    // Similar to documents, you'd verify access and serve the video file
    // For now, return a mock response

    return new NextResponse("Mock video content", {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `inline; filename="video-${videoId}.mp4"`,
        "Accept-Ranges": "bytes", // Important for video streaming
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
