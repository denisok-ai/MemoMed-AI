/**
 * @file use-tts.ts
 * @description React-хук для Text-to-Speech через Web Speech API.
 * Проверяет поддержку браузера, читает текст голосом.
 * Настройки хранятся в localStorage.
 * @created 2026-02-22
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TtsSettings {
  enabled: boolean;
  /** Имя голоса из доступных системных голосов */
  voiceName: string | null;
  /** Скорость речи: 0.5 – 2.0, рекомендуется 0.85 для пожилых */
  rate: number;
  /** Тональность: 0.5 – 2.0 */
  pitch: number;
  /** Громкость: 0 – 1 */
  volume: number;
}

const DEFAULT_SETTINGS: TtsSettings = {
  enabled: false,
  voiceName: null,
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
};

const STORAGE_KEY = 'memomed-tts-settings';

/** Загружает настройки TTS из localStorage */
function loadSettings(): TtsSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<TtsSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Сохраняет настройки TTS в localStorage */
function saveSettings(settings: TtsSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useTts() {
  const [settings, setSettings] = useState<TtsSettings>(DEFAULT_SETTINGS);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) {
      queueMicrotask(() => setIsSupported(false));
      return;
    }

    function loadVoices() {
      const available = speechSynthesis.getVoices();
      const russianVoices = available.filter((v) => v.lang.startsWith('ru'));
      setVoices(russianVoices.length > 0 ? russianVoices : available);
    }

    queueMicrotask(() => {
      setIsSupported(true);
      setSettings(loadSettings());
      loadVoices();
    });
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<TtsSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }, []);

  /** Озвучивает текст с текущими настройками */
  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !settings.enabled) return;

      // Останавливаем предыдущее воспроизведение
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      if (settings.voiceName) {
        const voice = speechSynthesis.getVoices().find((v) => v.name === settings.voiceName);
        if (voice) utterance.voice = voice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    },
    [isSupported, settings]
  );

  /** Останавливает озвучивание */
  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  /** Озвучивает напоминание о лекарстве */
  const speakMedicationReminder = useCallback(
    (medicationName: string, dosage: string, time: string) => {
      const text = `Напоминание. Время принять лекарство: ${medicationName}, ${dosage}. Время: ${time}.`;
      speak(text);
    },
    [speak]
  );

  return {
    isSupported,
    isSpeaking,
    settings,
    voices,
    updateSettings,
    speak,
    stop,
    speakMedicationReminder,
  };
}
