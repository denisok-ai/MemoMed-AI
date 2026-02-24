/**
 * @file logo.tsx
 * @description Логотип MemoMedAI в стиле MedTech: MemoMed + AI с градиентным акцентом
 * AI выделен teal-to-cyan градиентом для передачи инновационности и технологичности
 * @dependencies MedCrossIcon
 * @created 2026-02-24
 */

import Link from 'next/link';
import { MedCrossIcon } from './nav-icons';

type LogoVariant =
  | 'header'
  | 'sidebar'
  | 'sidebar-compact'
  | 'landing'
  | 'auth'
  | 'auth-dark'
  | 'footer';

interface LogoProps {
  /** Вариант отображения: размер и контекст */
  variant?: LogoVariant;
  /** Ссылка при клике (если не указана — рендерится div) */
  href?: string;
  /** Показать иконку медкреста */
  showIcon?: boolean;
  /** Скрыть текст ниже брейкпоинта (например 'sm' для mobile-first) */
  hideTextBelow?: 'sm' | 'md';
  /** Обработчик клика (для закрытия sidebar и т.п.) */
  onClick?: () => void;
  /** Дополнительные классы */
  className?: string;
}

const VARIANT_STYLES: Record<
  LogoVariant,
  {
    iconSize: string;
    iconBox: string;
    textSize: string;
    textColor: string;
    aiClass: string;
  }
> = {
  header: {
    iconSize: 'w-5 h-5',
    iconBox: 'w-9 h-9 rounded-xl',
    textSize: 'text-lg',
    textColor: 'text-[var(--color-text-primary)]',
    aiClass: 'logo-ai-gradient',
  },
  sidebar: {
    iconSize: 'w-5 h-5',
    iconBox: 'w-10 h-10 rounded-xl',
    textSize: 'text-base sm:text-lg lg:text-base',
    textColor: 'text-[var(--color-primary)]',
    aiClass: 'logo-ai-gradient',
  },
  'sidebar-compact': {
    iconSize: 'w-4 h-4',
    iconBox: 'w-8 h-8 rounded-lg',
    textSize: 'text-sm',
    textColor: 'text-[var(--color-primary)]',
    aiClass: 'logo-ai-gradient',
  },
  landing: {
    iconSize: 'w-9 h-9',
    iconBox:
      'w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/10',
    textSize: 'text-5xl md:text-7xl',
    textColor: 'text-white',
    aiClass: 'logo-ai-gradient-landing',
  },
  auth: {
    iconSize: 'w-7 h-7',
    iconBox: 'w-12 h-12 rounded-2xl',
    textSize: 'text-2xl',
    textColor: 'text-[var(--color-text-primary)]',
    aiClass: 'logo-ai-gradient',
  },
  'auth-dark': {
    iconSize: 'w-7 h-7',
    iconBox: 'w-12 h-12 rounded-2xl bg-white/20 backdrop-blur',
    textSize: 'text-2xl',
    textColor: 'text-white',
    aiClass: 'logo-ai-gradient-auth-dark',
  },
  footer: {
    iconSize: 'w-5 h-5',
    iconBox: '',
    textSize: 'text-sm',
    textColor: 'text-white/80',
    aiClass: 'logo-ai-gradient-footer',
  },
};

export function Logo({
  variant = 'header',
  href,
  showIcon = true,
  hideTextBelow,
  onClick,
  className = '',
}: LogoProps) {
  const styles = VARIANT_STYLES[variant];
  const textVisibility = hideTextBelow ? `hidden ${hideTextBelow}:inline` : '';

  const logoContent = (
    <>
      {showIcon && variant !== 'footer' && (
        <div
          className={`${styles.iconBox} flex items-center justify-center shrink-0
            ${
              variant !== 'landing' && variant !== 'auth-dark'
                ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] shadow-sm'
                : ''
            }`}
        >
          <MedCrossIcon className={`${styles.iconSize} text-white`} />
        </div>
      )}
      {showIcon && variant === 'footer' && (
        <MedCrossIcon className={`${styles.iconSize} text-blue-400`} />
      )}
      <span
        className={`font-bold tracking-tight font-[family-name:var(--font-montserrat)]
          ${styles.textSize} ${styles.textColor} ${textVisibility}`}
      >
        MemoMed
        <span className={`font-black ${styles.aiClass}`}>AI</span>
      </span>
    </>
  );

  const wrapperClass = `flex items-center gap-2 ${variant === 'footer' ? '' : 'gap-2.5'} flex-shrink-0
    ${variant === 'sidebar' ? 'whitespace-nowrap' : ''} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`${wrapperClass} group`}
        aria-label="MemoMedAI — на главную"
      >
        {logoContent}
      </Link>
    );
  }

  return <div className={wrapperClass}>{logoContent}</div>;
}
