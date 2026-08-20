export type MetaWebhookEventSource = "messaging" | "standby";

export interface MetaWebhookPayload {
  object?: string;
  entry?: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id?: string;
  time?: number;
  messaging?: MetaMessagingEvent[];
  standby?: MetaMessagingEvent[];
}

export interface MetaMessagingEvent {
  sender?: MetaEventParticipant;
  recipient?: MetaEventParticipant;
  timestamp?: number;
  message?: MetaMessage;
  referral?: MetaReferral;
  postback?: MetaPostback;
}

export interface MetaEventParticipant {
  id?: string;
}

export interface MetaMessage {
  mid?: string;
  text?: string;
  is_echo?: boolean;
  attachments?: MetaAttachment[];
  referral?: MetaReferral;
}

export interface MetaAttachment {
  type?: string;
  payload?: Record<string, unknown>;
}

export interface MetaReferral extends Record<string, unknown> {
  ref?: string;
  source?: string;
  type?: string;
}

export interface MetaPostback extends Record<string, unknown> {
  mid?: string;
  title?: string;
  payload?: string;
  referral?: MetaReferral;
}

export interface NormalizedMetaMessage {
  type: "message";
  eventSource: MetaWebhookEventSource;
  platform: "facebook";
  senderId: string | null;
  recipientId: string | null;
  messageId: string | null;
  text: string | null;
  timestamp: number | null;
  isFromBusiness: boolean;
  attachments: MetaAttachment[];
  referral: MetaReferral | null;
  rawPayload: MetaMessagingEvent;
}

export type NormalizedMetaEvent =
  | NormalizedMetaMessage
  | {
      type: "referral";
      eventSource: MetaWebhookEventSource;
      referral: MetaReferral;
    }
  | {
      type: "postback";
      eventSource: MetaWebhookEventSource;
      postback: MetaPostback;
    };
