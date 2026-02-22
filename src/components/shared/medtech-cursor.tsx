'use client';

/**
 * @file medtech-cursor.tsx
 * @description Кастомный курсор MedTech 2025–2026
 * Минималистичный, футуристичный, клинические оттенки с мягким свечением
 * Поддержка: светлая, тёмная тема, повышенный контраст
 * @created 2026-02-22
 */

import { useEffect, useState } from 'react';

type CursorTheme = 'light' | 'dark' | 'contrast';

export function MedTechCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [theme, setTheme] = useState<CursorTheme>('light');
  const [hasPointer, setHasPointer] = useState(false);

  useEffect(() => {
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (isPointerFine) {
      document.documentElement.classList.add('medtech-cursor-active');
    }
    queueMicrotask(() => setHasPointer(isPointerFine));
    if (!isPointerFine) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      document.documentElement.classList.remove('medtech-cursor-active');
    };
  }, [visible]);

  useEffect(() => {
    if (!hasPointer) return;

    const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    const checkTheme = () => {
      const contrast = document.documentElement.getAttribute('data-contrast') === 'high';
      const dark = document.documentElement.classList.contains('dark') || mqDark.matches;
      if (contrast) setTheme('contrast');
      else if (dark) setTheme('dark');
      else setTheme('light');
    };

    checkTheme();
    mqDark.addEventListener('change', checkTheme);

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-contrast'],
    });

    return () => {
      mqDark.removeEventListener('change', checkTheme);
      observer.disconnect();
    };
  }, [hasPointer]);

  if (!hasPointer) return null;

  return (
    <div
      className="medtech-cursor"
      aria-hidden
      style={
        {
          '--cursor-x': `${pos.x}px`,
          '--cursor-y': `${pos.y}px`,
        } as React.CSSProperties
      }
      data-visible={visible}
      data-theme={theme}
    >
      <div className="medtech-cursor__glow" />
      <div className="medtech-cursor__dot" />
      <div className="medtech-cursor__ring" />
    </div>
  );
}
