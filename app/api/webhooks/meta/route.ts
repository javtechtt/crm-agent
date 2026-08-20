import {
  isMetaWebhookPayload,
  normalizeMetaWebhook,
} from "@/lib/meta/webhook";
import { persistMetaMessages } from "@/lib/messages/persist-meta-messages";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.META_WEBHOOK_VERIFY_TOKEN &&
    challenge
  ) {
    console.info("Meta webhook verified.");
    return new Response(challenge, { status: 200 });
  }

  console.warn("Meta webhook verification failed.");
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.error("Meta webhook JSON parsing failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response("Bad Request", { status: 400 });
  }

  if (!isMetaWebhookPayload(body)) {
    return new Response("Bad Request", { status: 400 });
  }

  const events = normalizeMetaWebhook(body);

  console.info("Meta webhook received.", {
    object: body.object ?? null,
    entryCount: Array.isArray(body.entry) ? body.entry.length : 0,
    normalizedEventCount: events.length,
  });

  for (const event of events) {
    console.info(`Meta Messenger ${event.type}.`, event);
  }

  try {
    const persistence = await persistMetaMessages(events);
    console.info("Meta webhook persistence completed.", persistence);
  } catch (error) {
    console.error("Meta webhook persistence could not start.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  return Response.json({ received: true });
}
