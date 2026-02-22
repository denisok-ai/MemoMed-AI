/**
 * @file indexeddb.ts
 * @description Схема локальной базы данных IndexedDB через Dexie.js
 * Хранит лекарства и логи приёма для работы в офлайн-режиме
 * @dependencies dexie
 * @created 2026-02-22
 */

import Dexie, { type EntityTable } from 'dexie';

/** Лекарство в локальном хранилище */
export interface LocalMedication {
  id: string;
  name: string;
  dosage: string;
  instruction: string | null;
  photoUrl: string | null;
  scheduledTime: string;
  isActive: boolean;
  updatedAt: number;
}

/** Лог приёма в локальном хранилище */
export interface LocalMedicationLog {
  /** UUID генерируется на клиенте */
  localId: string;
  /** Реальный серверный ID после синхронизации */
  serverId: string | null;
  medicationId: string;
  scheduledAt: string;
  actualAt: string | null;
  status: 'taken' | 'missed' | 'pending';
  /** pending — ожидает отправки на сервер, synced — уже синхронизировано */
  syncStatus: 'pending' | 'synced';
  createdAt: string;
}

/** Запись дневника самочувствия в локальном хранилище */
export interface LocalJournalEntry {
  /** Дата в формате YYYY-MM-DD — первичный ключ */
  logDate: string;
  moodScore: number | null;
  painLevel: number | null;
  sleepQuality: number | null;
  energyLevel: number | null;
  freeText: string | null;
  /** pending — ожидает отправки, synced — отправлено */
  syncStatus: 'pending' | 'synced';
  updatedAt: number;
}

/** База данных Dexie */
class MemoMedDB extends Dexie {
  medications!: EntityTable<LocalMedication, 'id'>;
  logs!: EntityTable<LocalMedicationLog, 'localId'>;
  journal!: EntityTable<LocalJournalEntry, 'logDate'>;

  constructor() {
    super('memomed-db');

    this.version(1).stores({
      medications: 'id, scheduledTime, isActive',
      logs: 'localId, medicationId, scheduledAt, syncStatus, createdAt',
    });

    // Версия 2: добавляем дневник самочувствия
    this.version(2).stores({
      medications: 'id, scheduledTime, isActive',
      logs: 'localId, medicationId, scheduledAt, syncStatus, createdAt',
      journal: 'logDate, syncStatus, updatedAt',
    });
  }
}

/** Глобальный синглтон базы данных (только клиентская сторона) */
let db: MemoMedDB | null = null;

export function getDB(): MemoMedDB {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB доступна только в браузере');
  }
  if (!db) {
    db = new MemoMedDB();
  }
  return db;
}

export type { MemoMedDB };
