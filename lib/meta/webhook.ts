import type {
  MetaMessagingEvent,
  MetaWebhookEventSource,
  MetaWebhookPayload,
  NormalizedMetaEvent,
  NormalizedMetaMessage,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isMetaWebhookPayload(value: unknown): value is MetaWebhookPayload {
  return isRecord(value);
}

function normalizeMessage(
  event: MetaMessagingEvent,
  eventSource: MetaWebhookEventSource,
): NormalizedMetaMessage {
  const message = event.message!;

  return {
    type: "message",
    eventSource,
    platform: "facebook",
    senderId: event.sender?.id ?? null,
    recipientId: event.recipient?.id ?? null,
    messageId: message.mid ?? null,
    text: message.text ?? null,
    timestamp: event.timestamp ?? null,
    isFromBusiness: Boolean(message.is_echo),
    attachments: Array.isArray(message.attachments) ? message.attachments : [],
    referral: event.referral ?? message.referral ?? null,
  };
}

function normalizeEvent(
  event: MetaMessagingEvent,
  eventSource: MetaWebhookEventSource,
): NormalizedMetaEvent[] {
  const normalized: NormalizedMetaEvent[] = [];

  if (isRecord(event.message)) {
    normalized.push(normalizeMessage(event, eventSource));
  }

  if (isRecord(event.referral)) {
    normalized.push({ type: "referral", eventSource, referral: event.referral });
  }

  if (isRecord(event.postback)) {
    normalized.push({ type: "postback", eventSource, postback: event.postback });
  }

  return normalized;
}

export function normalizeMetaWebhook(payload: MetaWebhookPayload): NormalizedMetaEvent[] {
  if (payload.object !== "page" || !Array.isArray(payload.entry)) {
    return [];
  }

  const normalized: NormalizedMetaEvent[] = [];

  for (const entry of payload.entry) {
    const groups: Array<{
      source: MetaWebhookEventSource;
      events: MetaMessagingEvent[] | undefined;
    }> = [
      { source: "messaging", events: entry.messaging },
      { source: "standby", events: entry.standby },
    ];

    for (const { source, events } of groups) {
      if (!Array.isArray(events)) {
        continue;
      }

      for (const event of events) {
        if (isRecord(event)) {
          normalized.push(...normalizeEvent(event, source));
        }
      }
    }
  }

  return normalized;
}
