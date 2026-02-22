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

/** База данных Dexie */
class MemoMedDB extends Dexie {
  medications!: EntityTable<LocalMedication, 'id'>;
  logs!: EntityTable<LocalMedicationLog, 'localId'>;

  constructor() {
    super('memomed-db');

    this.version(1).stores({
      // Индексы для medications
      medications: 'id, scheduledTime, isActive',
      // Индексы для logs: localId первичный ключ, syncStatus для поиска несинхронизированных
      logs: 'localId, medicationId, scheduledAt, syncStatus, createdAt',
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
