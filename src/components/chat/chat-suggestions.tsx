/**
 * @file chat-suggestions.tsx
 * @description Быстрые вопросы-подсказки для чата — помогают начать разговор
 * @created 2026-02-22
 */

interface ChatSuggestionsProps {
  onSelect: (text: string) => void;
}

/** Типичные вопросы пациентов о лекарствах */
const SUGGESTIONS = [
  'Что делать если я забыл принять лекарство?',
  'Можно ли принимать это лекарство с едой?',
  'Какие побочные эффекты бывают при длительном приёме?',
  'Что такое «таблетки от давления» и как они работают?',
];

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="px-4 py-3 space-y-2" role="list" aria-label="Быстрые вопросы">
      <p className="text-sm text-[#9e9e9e] font-medium">Быстрые вопросы:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            role="listitem"
            className="px-4 py-2 text-sm bg-[#ede7f6] text-[#7e57c2] rounded-full
              hover:bg-[#d1c4e9] transition-colors text-left min-h-[40px]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
