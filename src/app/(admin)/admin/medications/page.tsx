/**
 * @file page.tsx
 * @description Обзор всех лекарств платформы: таблица с фильтрами по статусу и поиском
 * @dependencies prisma
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminPillIcon } from '@/components/admin/admin-icons';

export const metadata: Metadata = {
  title: 'Лекарства — Админ — MemoMed AI',
};

export default async function AdminMedicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  const { status: statusFilter, page: pageStr, q } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? '1'));
  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(statusFilter === 'active' ? { isActive: true } : {}),
    ...(statusFilter === 'archived' ? { isActive: false } : {}),
    ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
  };

  const [medications, total, totalActive, totalArchived] = await Promise.all([
    prisma.medication.findMany({
      where,
      take: pageSize,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        dosage: true,
        scheduledTime: true,
        isActive: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        _count: {
          select: { logs: true, feedback: true },
        },
      },
    }),
    prisma.medication.count({ where }),
    prisma.medication.count({ where: { isActive: true } }),
    prisma.medication.count({ where: { isActive: false } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Топ-10 самых назначаемых лекарств
  const topMeds = await prisma.medication.groupBy({
    by: ['name'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  return (
    <div className="space-y-6 med-animate">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-[#0D1B2A]">Лекарства</h1>
        <div className="flex gap-3 text-sm">
          <span className="med-badge-success px-3 py-1.5">
            Активных: {totalActive.toLocaleString('ru')}
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl font-semibold">
            В архиве: {totalArchived.toLocaleString('ru')}
          </span>
        </div>
      </div>

      {/* Топ препаратов */}
      <div className="med-card p-5 space-y-3">
        <h2 className="med-section-title">Топ-10 назначаемых препаратов</h2>
        <div className="flex flex-wrap gap-2">
          {topMeds.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
              <span className="text-sm font-bold text-slate-500">{i + 1}</span>
              <span className="text-sm font-medium text-[#1565C0]">{m.name}</span>
              <span className="text-sm text-slate-500">{m._count.id}×</span>
            </div>
          ))}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {[
            { value: '', label: 'Все' },
            { value: 'active', label: 'Активные' },
            { value: 'archived', label: 'В архиве' },
          ].map((f) => (
            <a
              key={f.value}
              href={`/admin/medications?status=${f.value}${q ? `&q=${q}` : ''}`}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold min-h-[48px] flex items-center
                ${statusFilter === f.value || (!statusFilter && !f.value) ? 'med-btn-primary' : 'med-btn-secondary'}`}
            >
              {f.label}
            </a>
          ))}
        </div>

        <form method="GET" action="/admin/medications" className="flex-1 max-w-xs">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Поиск по названию..."
            className="med-input"
          />
        </form>
      </div>

      {/* Таблица */}
      <div className="med-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-center px-3 py-3 text-slate-400 font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Лекарство</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">Пациент</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">Время</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">Приёмов</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">Отзывов</th>
              <th className="text-center px-4 py-3 text-slate-500 font-medium">Статус</th>
              <th className="text-right px-4 py-3 text-slate-500 font-medium">Добавлено</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {medications.map((med, idx) => (
              <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 text-center text-sm text-slate-400 font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0D1B2A]">{med.name}</p>
                  <p className="text-sm text-slate-500">{med.dosage}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-600 truncate max-w-[180px]">
                    {med.patient.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-sm text-slate-400 truncate max-w-[180px]">
                    {med.patient.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-center text-slate-600 font-mono text-sm">
                  {med.scheduledTime}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {med._count.logs.toLocaleString('ru')}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">{med._count.feedback}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-lg text-sm font-medium
                      ${med.isActive ? 'med-badge-success' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {med.isActive ? 'Активно' : 'В архиве'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-500 text-sm">
                  {med.createdAt.toLocaleDateString('ru')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {medications.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <AdminPillIcon className="w-8 h-8 text-white" aria-hidden />
            </div>
            <p>Лекарств не найдено</p>
          </div>
        )}
      </div>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        buildHref={(p) =>
          `/admin/medications?${statusFilter ? `status=${statusFilter}&` : ''}${q ? `q=${q}&` : ''}page=${p}`
        }
      />
    </div>
  );
}
