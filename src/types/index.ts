/**
 * @file index.ts
 * @description Глобальные TypeScript типы для MemoMed AI
 * @dependencies prisma schema
 * @created 2026-02-22
 */

export type {
  User,
  Profile,
  Medication,
  MedicationLog,
  Connection,
  ChatMessage,
} from '@prisma/client';
export type {
  Role,
  MedicationLogStatus,
  SyncStatus,
  ConnectionStatus,
  ChatRole,
} from '@prisma/client';

/** Стандартный ответ API */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/** Пагинированный ответ (для будущих списков) */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** Событие живой ленты (SSE / polling) */
export interface FeedEvent {
  id: string;
  patientName: string;
  medicationName: string;
  scheduledAt: Date;
  actualAt: Date | null;
  status: 'taken' | 'missed' | 'pending';
  delayMinutes: number | null;
}
