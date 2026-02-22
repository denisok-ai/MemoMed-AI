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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <p className="text-sm text-slate-500">
        Показано{' '}
        <span className="font-medium text-[#0D1B2A]">
          {from}–{to}
        </span>{' '}
        из <span className="font-medium text-[#0D1B2A]">{total.toLocaleString('ru')}</span>
      </p>

      <div className="flex items-center gap-1">
        {page > 1 && (
          <a
            href={buildHref(1)}
            className="w-10 h-10 min-w-[48px] flex items-center justify-center rounded-xl text-sm
              med-btn-secondary"
            aria-label="Первая страница"
          >
            «
          </a>
        )}
        {page > 1 && (
          <a
            href={buildHref(page - 1)}
            className="w-10 h-10 min-w-[48px] flex items-center justify-center rounded-xl text-sm
              med-btn-secondary"
            aria-label="Предыдущая"
          >
            ‹
          </a>
        )}
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`dots-${i}`}
              className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm"
            >
              …
            </span>
          ) : (
            <a
              key={p}
              href={buildHref(p as number)}
              className={`w-10 h-10 min-w-[48px] flex items-center justify-center rounded-xl text-sm font-medium
                transition-colors
                ${p === page ? 'med-btn-primary' : 'med-btn-secondary'}`}
            >
              {p}
            </a>
          )
        )}
        {page < totalPages && (
          <a
            href={buildHref(page + 1)}
            className="w-10 h-10 min-w-[48px] flex items-center justify-center rounded-xl text-sm
              med-btn-secondary"
            aria-label="Следующая"
          >
            ›
          </a>
        )}
        {page < totalPages && (
          <a
            href={buildHref(totalPages)}
            className="w-10 h-10 min-w-[48px] flex items-center justify-center rounded-xl text-sm
              med-btn-secondary"
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
