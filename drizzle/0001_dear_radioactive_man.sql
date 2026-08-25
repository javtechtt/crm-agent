CREATE TABLE "ad_insight_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uploaded_report_id" uuid NOT NULL,
	"date" date,
	"campaign_name" text,
	"ad_set_name" text,
	"ad_name" text,
	"product_angle" text NOT NULL,
	"spend" numeric(14, 2) DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"frequency" numeric(10, 4) DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"ctr" numeric(10, 4) DEFAULT 0 NOT NULL,
	"cpc" numeric(14, 4) DEFAULT 0 NOT NULL,
	"cpm" numeric(14, 4) DEFAULT 0 NOT NULL,
	"results" numeric(14, 2) DEFAULT 0 NOT NULL,
	"cost_per_result" numeric(14, 4) DEFAULT 0 NOT NULL,
	"raw_data_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ad_insight_rows_product_angle_check" CHECK ("ad_insight_rows"."product_angle" in ('Hotdog', 'Pepperoni', 'Mince', 'Parmesan', 'Cashew Cheese', 'Other'))
);
--> statement-breakpoint
CREATE TABLE "ai_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uploaded_report_id" uuid,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"summary_json" jsonb NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploaded_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"source" text DEFAULT 'meta_ads_upload' NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"date_start" date,
	"date_end" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ad_insight_rows" ADD CONSTRAINT "ad_insight_rows_uploaded_report_id_uploaded_reports_id_fk" FOREIGN KEY ("uploaded_report_id") REFERENCES "public"."uploaded_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_uploaded_report_id_uploaded_reports_id_fk" FOREIGN KEY ("uploaded_report_id") REFERENCES "public"."uploaded_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_insight_rows_report_idx" ON "ad_insight_rows" USING btree ("uploaded_report_id");--> statement-breakpoint
CREATE INDEX "ad_insight_rows_date_idx" ON "ad_insight_rows" USING btree ("date");--> statement-breakpoint
CREATE INDEX "ad_insight_rows_campaign_idx" ON "ad_insight_rows" USING btree ("campaign_name");--> statement-breakpoint
CREATE INDEX "ad_insight_rows_ad_idx" ON "ad_insight_rows" USING btree ("ad_name");--> statement-breakpoint
CREATE INDEX "ad_insight_rows_product_angle_idx" ON "ad_insight_rows" USING btree ("product_angle");--> statement-breakpoint
CREATE INDEX "ai_analyses_report_idx" ON "ai_analyses" USING btree ("uploaded_report_id");