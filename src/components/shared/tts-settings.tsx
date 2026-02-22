/**
 * @file tts-settings.tsx
 * @description Компонент настроек Text-to-Speech в профиле пользователя.
 * Выбор голоса, скорости речи, включение/выключение озвучки.
 * @created 2026-02-22
 */

'use client';

import { useTts } from '@/hooks/use-tts';

export function TtsSettings() {
  const { isSupported, isSpeaking, settings, voices, updateSettings, speak, stop } = useTts();

  if (!isSupported) {
    return (
      <div className="bg-[#fff8e1] rounded-2xl p-4">
        <p className="text-sm text-[#e65100]">
          📵 Ваш браузер не поддерживает Text-to-Speech. Попробуйте Chrome или Safari.
        </p>
      </div>
    );
  }

  function handleTestVoice() {
    if (isSpeaking) {
      stop();
    } else {
      speak('Привет! Это тест голосового напоминания. Время принять лекарство: Аспирин, 100 мг.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Включение/выключение */}
      <div className="flex items-center justify-between p-4 bg-[#f5f5f5] rounded-2xl">
        <div>
          <p className="text-base font-semibold text-[#212121]">Голосовые напоминания</p>
          <p className="text-sm text-[#757575]">Озвучивать напоминания о приёме лекарств</p>
        </div>
        <button
          role="switch"
          aria-checked={settings.enabled}
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className={`relative w-14 h-7 rounded-full transition-colors
            ${settings.enabled ? 'bg-[#1565C0]' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform
              ${settings.enabled ? 'translate-x-8' : 'translate-x-1'}`}
          />
          <span className="sr-only">{settings.enabled ? 'Выключить' : 'Включить'}</span>
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Выбор голоса */}
          {voices.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="voice-select" className="text-base font-medium text-[#212121]">
                Голос
              </label>
              <select
                id="voice-select"
                value={settings.voiceName ?? ''}
                onChange={(e) => updateSettings({ voiceName: e.target.value || null })}
                className="w-full px-4 py-3 text-base rounded-2xl border border-gray-200
                  focus:outline-none focus:border-[#1565C0] bg-white"
              >
                <option value="">По умолчанию</option>
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Скорость речи */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="rate-slider" className="text-base font-medium text-[#212121]">
                Скорость речи
              </label>
              <span className="text-sm text-[#1565C0] font-medium">{settings.rate}x</span>
            </div>
            <input
              id="rate-slider"
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={settings.rate}
              onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#1565C0' }}
            />
            <div className="flex justify-between text-sm text-[#9e9e9e]">
              <span>Медленно</span>
              <span>Быстро</span>
            </div>
          </div>

          {/* Громкость */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="volume-slider" className="text-base font-medium text-[#212121]">
                Громкость
              </label>
              <span className="text-sm text-[#1565C0] font-medium">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <input
              id="volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#1565C0' }}
            />
          </div>

          {/* Кнопка теста */}
          <button
            onClick={handleTestVoice}
            className={`w-full py-3 text-base font-medium rounded-2xl transition-colors min-h-[48px]
              ${
                isSpeaking
                  ? 'bg-[#ffebee] text-[#c62828] hover:bg-[#ffcdd2]'
                  : 'bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB]'
              }`}
          >
            {isSpeaking ? '⏹️ Остановить' : '🔊 Проверить голос'}
          </button>
        </>
      )}
    </div>
  );
}
