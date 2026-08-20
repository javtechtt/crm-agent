import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { MetaAttachment, MetaMessagingEvent } from "@/lib/meta/types";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const channelAccounts = pgTable(
  "channel_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    platform: text("platform").notNull(),
    externalAccountId: text("external_account_id").notNull(),
    displayName: text("display_name").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("channel_accounts_platform_external_account_uidx").on(
      table.platform,
      table.externalAccountId,
    ),
    check(
      "channel_accounts_platform_check",
      sql`${table.platform} in ('facebook', 'instagram', 'whatsapp')`,
    ),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    platform: text("platform").notNull(),
    externalUserId: text("external_user_id").notNull(),
    displayName: text("display_name"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("customers_platform_external_user_uidx").on(
      table.platform,
      table.externalUserId,
    ),
    check(
      "customers_platform_check",
      sql`${table.platform} in ('facebook', 'instagram', 'whatsapp')`,
    ),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    channelAccountId: uuid("channel_account_id")
      .notNull()
      .references(() => channelAccounts.id, { onDelete: "restrict" }),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    platform: text("platform").notNull(),
    externalConversationId: text("external_conversation_id"),
    status: text("status").default("open").notNull(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("conversations_channel_customer_uidx").on(
      table.channelAccountId,
      table.customerId,
    ),
    index("conversations_last_message_idx").on(table.lastMessageAt),
    check(
      "conversations_platform_check",
      sql`${table.platform} in ('facebook', 'instagram', 'whatsapp')`,
    ),
    check("conversations_status_check", sql`${table.status} = 'open'`),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    externalMessageId: text("external_message_id").notNull(),
    direction: text("direction").notNull(),
    text: text("text"),
    attachments: jsonb("attachments")
      .$type<MetaAttachment[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull(),
    rawPayload: jsonb("raw_payload").$type<MetaMessagingEvent>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("messages_platform_external_message_uidx").on(
      table.platform,
      table.externalMessageId,
    ),
    index("messages_conversation_sent_at_idx").on(
      table.conversationId,
      table.sentAt,
    ),
    check(
      "messages_platform_check",
      sql`${table.platform} in ('facebook', 'instagram', 'whatsapp')`,
    ),
    check(
      "messages_direction_check",
      sql`${table.direction} in ('incoming', 'outgoing')`,
    ),
  ],
);
