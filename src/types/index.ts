/**
 * @file index.ts
 * @description Global TypeScript type exports for MemoMed AI
 * @dependencies prisma schema
 * @created 2026-02-22
 */

export type { User, Profile, Medication, MedicationLog, Connection, ChatMessage } from '@prisma/client';
export type { Role, MedicationLogStatus, SyncStatus, ConnectionStatus, ChatRole } from '@prisma/client';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
}

export interface MedicationWithLogs {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  isActive: boolean;
  logs: Array<{
    id: string;
    scheduledAt: Date;
    actualAt: Date | null;
    status: string;
  }>;
}

export interface FeedEvent {
  id: string;
  patientName: string;
  medicationName: string;
  scheduledAt: Date;
  actualAt: Date | null;
  status: 'taken' | 'missed' | 'pending';
  delayMinutes: number | null;
}
