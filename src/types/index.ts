import type { Locale } from '@/i18n/config';

export type TicketStatus = 'pending' | 'paid' | 'used' | 'cancelled';

export type PaymentMethod = 'cmi' | 'cashplus' | 'wafacash' | 'baridcash';

export interface EventSummary {
  id: string;
  title: Record<Locale, string>;
  date: string;
  venue: string;
  city: string;
  priceFrom: number;
  imageUrl?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  seat: string;
  row: string;
  section: string;
  price: number;
  status: TicketStatus;
  qrCodeToken: string;
}

export interface WaitingRoomEntry {
  position: number;
  estimatedWaitMinutes: number;
}
