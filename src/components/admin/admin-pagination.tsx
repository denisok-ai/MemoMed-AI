/**
 * @file admin-pagination.tsx
 * @description Переиспользуемый компонент пагинации для таблиц администратора
 * @created 2026-02-22
 */

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  buildHref: (page: number) => string;
}

export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  buildHref,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-[#9e9e9e]">
        Показано{' '}
        <span className="font-medium text-[#424242]">
          {from}–{to}
        </span>{' '}
        из <span className="font-medium text-[#424242]">{total.toLocaleString('ru')}</span>
      </p>

      <div className="flex items-center gap-1">
        {/* Первая */}
        {page > 1 && (
          <a
            href={buildHref(1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-sm
              bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]
              hover:text-[#1565C0] transition-colors"
            aria-label="Первая страница"
          >
            «
          </a>
        )}

        {/* Предыдущая */}
        {page > 1 && (
          <a
            href={buildHref(page - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-sm
              bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]
              hover:text-[#1565C0] transition-colors"
            aria-label="Предыдущая"
          >
            ‹
          </a>
        )}

        {/* Страницы с многоточием */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`dots-${i}`}
              className="w-9 h-9 flex items-center justify-center text-[#bdbdbd] text-sm"
            >
              …
            </span>
          ) : (
            <a
              key={p}
              href={buildHref(p as number)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium
                transition-colors
                ${
                  p === page
                    ? 'bg-[#1565C0] text-white shadow-sm shadow-blue-200'
                    : 'bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0] hover:text-[#1565C0]'
                }`}
            >
              {p}
            </a>
          )
        )}

        {/* Следующая */}
        {page < totalPages && (
          <a
            href={buildHref(page + 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-sm
              bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]
              hover:text-[#1565C0] transition-colors"
            aria-label="Следующая"
          >
            ›
          </a>
        )}

        {/* Последняя */}
        {page < totalPages && (
          <a
            href={buildHref(totalPages)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-sm
              bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]
              hover:text-[#1565C0] transition-colors"
            aria-label="Последняя страница"
          >
            »
          </a>
        )}
      </div>
    </div>
  );
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (current > 4) pages.push('...');
  for (let p = Math.max(2, current - 2); p <= Math.min(total - 1, current + 2); p++) {
    pages.push(p);
  }
  if (current < total - 3) pages.push('...');
  pages.push(total);
  return pages;
}
