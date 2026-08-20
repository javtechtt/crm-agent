import { and, eq, sql } from "drizzle-orm";

import { createDatabaseConnection } from "@/lib/db/client";
import {
  channelAccounts,
  conversations,
  customers,
  messages,
} from "@/lib/db/schema";
import type {
  NormalizedMetaEvent,
  NormalizedMetaMessage,
} from "@/lib/meta/types";

const FACEBOOK_PLATFORM = "facebook";
const CHANNEL_DISPLAY_NAME = "Kirvan's Kitchen";

export interface MetaPersistenceResult {
  attempted: number;
  inserted: number;
  duplicates: number;
  failed: number;
}

function getMessageIdentity(message: NormalizedMetaMessage, pageId: string) {
  const pageParticipantId = message.isFromBusiness
    ? message.senderId
    : message.recipientId;
  const customerId = message.isFromBusiness
    ? message.recipientId
    : message.senderId;

  if (!message.messageId || !customerId) {
    throw new Error("Meta message is missing a message ID or customer ID.");
  }

  if (pageParticipantId !== pageId) {
    throw new Error("Meta message does not match the configured Facebook Page ID.");
  }

  return { customerId, messageId: message.messageId };
}

async function persistMessage(
  message: NormalizedMetaMessage,
  pageId: string,
): Promise<"inserted" | "duplicate"> {
  const { customerId: externalCustomerId, messageId } = getMessageIdentity(
    message,
    pageId,
  );
  const sentAt = message.timestamp ? new Date(message.timestamp) : new Date();
  const { db, pool } = createDatabaseConnection();

  try {
    return await db.transaction(async (tx) => {
      const [channelAccount] = await tx
        .insert(channelAccounts)
        .values({
          platform: FACEBOOK_PLATFORM,
          externalAccountId: pageId,
          displayName: CHANNEL_DISPLAY_NAME,
        })
        .onConflictDoUpdate({
          target: [channelAccounts.platform, channelAccounts.externalAccountId],
          set: { displayName: CHANNEL_DISPLAY_NAME, updatedAt: new Date() },
        })
        .returning({ id: channelAccounts.id });

      const [customer] = await tx
        .insert(customers)
        .values({
          platform: FACEBOOK_PLATFORM,
          externalUserId: externalCustomerId,
        })
        .onConflictDoUpdate({
          target: [customers.platform, customers.externalUserId],
          set: { updatedAt: new Date() },
        })
        .returning({ id: customers.id });

      const [conversation] = await tx
        .insert(conversations)
        .values({
          channelAccountId: channelAccount.id,
          customerId: customer.id,
          platform: FACEBOOK_PLATFORM,
        })
        .onConflictDoUpdate({
          target: [conversations.channelAccountId, conversations.customerId],
          set: { updatedAt: new Date() },
        })
        .returning({ id: conversations.id });

      const [insertedMessage] = await tx
        .insert(messages)
        .values({
          conversationId: conversation.id,
          platform: FACEBOOK_PLATFORM,
          externalMessageId: messageId,
          direction: message.isFromBusiness ? "outgoing" : "incoming",
          text: message.text,
          attachments: message.attachments,
          sentAt,
          rawPayload: message.rawPayload,
        })
        .onConflictDoNothing({
          target: [messages.platform, messages.externalMessageId],
        })
        .returning({ id: messages.id });

      if (!insertedMessage) {
        return "duplicate";
      }

      await tx
        .update(conversations)
        .set({
          lastMessageAt: sql`greatest(coalesce(${conversations.lastMessageAt}, ${sentAt}), ${sentAt})`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(conversations.id, conversation.id),
            eq(conversations.platform, FACEBOOK_PLATFORM),
          ),
        );

      return "inserted";
    });
  } finally {
    await pool.end();
  }
}

export async function persistMetaMessages(
  events: NormalizedMetaEvent[],
): Promise<MetaPersistenceResult> {
  const messageEvents = events.filter(
    (event): event is NormalizedMetaMessage => event.type === "message",
  );
  const result: MetaPersistenceResult = {
    attempted: messageEvents.length,
    inserted: 0,
    duplicates: 0,
    failed: 0,
  };

  if (messageEvents.length === 0) {
    return result;
  }

  const pageId = process.env.META_PAGE_ID?.trim();

  if (!pageId) {
    throw new Error("META_PAGE_ID is not configured.");
  }

  for (const message of messageEvents) {
    try {
      const outcome = await persistMessage(message, pageId);
      result[outcome === "inserted" ? "inserted" : "duplicates"] += 1;
    } catch (error) {
      result.failed += 1;
      console.error("Meta message persistence failed.", {
        messageId: message.messageId,
        eventSource: message.eventSource,
        direction: message.isFromBusiness ? "outgoing" : "incoming",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return result;
}
