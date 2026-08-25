import { relations, sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { MetaAttachment, MetaMessagingEvent } from "@/lib/meta/types";
import type { AdsAnalysisSummary, ProductAngle } from "@/lib/ads/types";

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

export const uploadedReports = pgTable("uploaded_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: text("file_name").notNull(),
  source: text("source").default("meta_ads_upload").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  rowCount: integer("row_count").default(0).notNull(),
  dateStart: date("date_start", { mode: "date" }),
  dateEnd: date("date_end", { mode: "date" }),
  notes: text("notes"),
  ...timestamps,
});

export const adInsightRows = pgTable(
  "ad_insight_rows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    uploadedReportId: uuid("uploaded_report_id")
      .notNull()
      .references(() => uploadedReports.id, { onDelete: "cascade" }),
    date: date("date", { mode: "date" }),
    campaignName: text("campaign_name"),
    adSetName: text("ad_set_name"),
    adName: text("ad_name"),
    productAngle: text("product_angle").$type<ProductAngle>().notNull(),
    spend: numeric("spend", { precision: 14, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    impressions: integer("impressions").default(0).notNull(),
    reach: integer("reach").default(0).notNull(),
    frequency: numeric("frequency", {
      precision: 10,
      scale: 4,
      mode: "number",
    })
      .default(0)
      .notNull(),
    clicks: integer("clicks").default(0).notNull(),
    ctr: numeric("ctr", { precision: 10, scale: 4, mode: "number" })
      .default(0)
      .notNull(),
    cpc: numeric("cpc", { precision: 14, scale: 4, mode: "number" })
      .default(0)
      .notNull(),
    cpm: numeric("cpm", { precision: 14, scale: 4, mode: "number" })
      .default(0)
      .notNull(),
    results: numeric("results", {
      precision: 14,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),
    costPerResult: numeric("cost_per_result", {
      precision: 14,
      scale: 4,
      mode: "number",
    })
      .default(0)
      .notNull(),
    rawDataJson: jsonb("raw_data_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("ad_insight_rows_report_idx").on(table.uploadedReportId),
    index("ad_insight_rows_date_idx").on(table.date),
    index("ad_insight_rows_campaign_idx").on(table.campaignName),
    index("ad_insight_rows_ad_idx").on(table.adName),
    index("ad_insight_rows_product_angle_idx").on(table.productAngle),
    check(
      "ad_insight_rows_product_angle_check",
      sql`${table.productAngle} in ('Hotdog', 'Pepperoni', 'Mince', 'Parmesan', 'Cashew Cheese', 'Other')`,
    ),
  ],
);

export const aiAnalyses = pgTable(
  "ai_analyses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    uploadedReportId: uuid("uploaded_report_id").references(
      () => uploadedReports.id,
      { onDelete: "set null" },
    ),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    summaryJson: jsonb("summary_json").$type<AdsAnalysisSummary>().notNull(),
    createdByUserId: text("created_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("ai_analyses_report_idx").on(table.uploadedReportId)],
);

export const uploadedReportsRelations = relations(
  uploadedReports,
  ({ many }) => ({
    rows: many(adInsightRows),
    analyses: many(aiAnalyses),
  }),
);

export const adInsightRowsRelations = relations(adInsightRows, ({ one }) => ({
  report: one(uploadedReports, {
    fields: [adInsightRows.uploadedReportId],
    references: [uploadedReports.id],
  }),
}));

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  report: one(uploadedReports, {
    fields: [aiAnalyses.uploadedReportId],
    references: [uploadedReports.id],
  }),
}));
