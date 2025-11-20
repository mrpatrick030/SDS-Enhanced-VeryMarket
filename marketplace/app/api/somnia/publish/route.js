// app/api/somnia/publish/route.js
import { publishEvent } from "@/scripts/publishEvents";

export async function POST(request) {
  try {
    const { eventName, payload } = await request.json();
    if (!eventName || !payload) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing eventName or payload" }),
        { status: 400 }
      );
    }

    const tx = await publishEvent(eventName, payload);

    return new Response(
      JSON.stringify({ success: true, tx }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Publish API error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
