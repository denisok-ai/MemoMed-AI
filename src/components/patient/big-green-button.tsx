/**
 * @file big-green-button.tsx
 * @description Large confirmation button for medication intake (120px, scale animation, vibration)
 * @created 2026-02-22
 */

'use client';

import { useState } from 'react';

interface BigGreenButtonProps {
  onPress: () => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
}

export function BigGreenButton({ onPress, disabled, isLoading }: BigGreenButtonProps) {
  const [pressed, setPressed] = useState(false);

  async function handleClick() {
    if (disabled || isLoading || pressed) return;

    setPressed(true);
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    try {
      await onPress();
    } finally {
      setTimeout(() => setPressed(false), 1500);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading || pressed}
      aria-label="Подтвердить приём лекарства"
      className={`
        relative rounded-full flex items-center justify-center
        transition-all duration-150 select-none
        focus-visible:outline-4 focus-visible:outline-[#4caf50]
        ${pressed ? 'scale-95 shadow-inner' : 'scale-100 shadow-2xl hover:scale-105 active:scale-95'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${pressed ? 'bg-[#43a047]' : 'bg-[#4caf50] hover:bg-[#43a047]'}
      `}
      style={{ width: 120, height: 120 }}
    >
      {isLoading ? (
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      ) : pressed ? (
        <span className="text-white text-5xl">✓</span>
      ) : (
        <span className="text-white text-5xl">✓</span>
      )}

      {pressed && (
        <span className="absolute inset-0 rounded-full bg-white opacity-0 animate-ping" />
      )}
    </button>
  );
}
