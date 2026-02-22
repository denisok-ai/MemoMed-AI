/**
 * @file index.ts
 * @description Common utility functions
 * @created 2026-02-22
 */

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function getDelayMinutes(scheduled: Date, actual: Date): number {
  return Math.round((actual.getTime() - scheduled.getTime()) / 60000);
}

export function getMedicationStatusColor(
  status: 'taken' | 'missed' | 'pending',
  delayMinutes?: number
): string {
  if (status === 'missed') return '#f44336';
  if (status === 'taken') {
    if (!delayMinutes || delayMinutes <= 0) return '#4caf50';
    if (delayMinutes <= 30) return '#ffc107';
    return '#f44336';
  }
  return '#757575';
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
