export type EventStatus = "draft" | "published" | "cancelled";

export interface IortiEvent {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  tag: string | null;
  location: string;
  starts_at: string; // ISO 8601
  image_url: string | null;
  price_cents: number;
  currency: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EventInput {
  title: string;
  description?: string;
  tag?: string;
  location: string;
  starts_at: string; // ISO 8601, envoyé par un <input type="datetime-local">
  image_url?: string;
  price_cents: number;
  currency?: string;
  status: EventStatus;
}
