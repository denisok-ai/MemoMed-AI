/**
 * @file page.tsx
 * @description Обзор всех лекарств платформы: таблица с фильтрами по статусу и поиском
 * @dependencies prisma
 * @created 2026-02-22
 */

import type { Metadata } from 'next';
import { prisma } from '@/lib/db/prisma';
import { AdminPagination } from '@/components/admin/admin-pagination';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#212121]">Лекарства</h1>
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-xl font-medium">
            Активных: {totalActive.toLocaleString('ru')}
          </span>
          <span className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl font-medium">
            В архиве: {totalArchived.toLocaleString('ru')}
          </span>
        </div>
      </div>

      {/* Топ препаратов */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[#424242]">Топ-10 назначаемых препаратов</h2>
        <div className="flex flex-wrap gap-2">
          {topMeds.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-xl">
              <span className="text-xs font-bold text-[#9e9e9e]">{i + 1}</span>
              <span className="text-sm font-medium text-[#1565C0]">{m.name}</span>
              <span className="text-xs text-[#757575]">{m._count.id}×</span>
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${
                  statusFilter === f.value || (!statusFilter && !f.value)
                    ? 'bg-[#1565C0] text-white'
                    : 'bg-white border border-gray-200 text-[#424242] hover:border-[#1565C0]'
                }`}
            >
              {f.label}
            </a>
          ))}
        </div>

        {/* Поиск */}
        <form method="GET" action="/admin/medications" className="flex-1 max-w-xs">
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Поиск по названию..."
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm
              text-[#424242] placeholder-[#bdbdbd] focus:outline-none focus:border-[#1565C0]
              focus:ring-1 focus:ring-[#1565C0]"
          />
        </form>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-center px-3 py-3 text-[#bdbdbd] font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Лекарство</th>
              <th className="text-left px-4 py-3 text-[#757575] font-medium">Пациент</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">Время</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">Приёмов</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">Отзывов</th>
              <th className="text-center px-4 py-3 text-[#757575] font-medium">Статус</th>
              <th className="text-right px-4 py-3 text-[#757575] font-medium">Добавлено</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {medications.map((med, idx) => (
              <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-3 text-center text-xs text-[#bdbdbd] font-mono">
                  {skip + idx + 1}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#212121]">{med.name}</p>
                  <p className="text-xs text-[#9e9e9e]">{med.dosage}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[#424242] truncate max-w-[180px]">
                    {med.patient.profile?.fullName ?? '—'}
                  </p>
                  <p className="text-xs text-[#bdbdbd] truncate max-w-[180px]">
                    {med.patient.email}
                  </p>
                </td>
                <td className="px-4 py-3 text-center text-[#424242] font-mono text-xs">
                  {med.scheduledTime}
                </td>
                <td className="px-4 py-3 text-center text-[#424242]">
                  {med._count.logs.toLocaleString('ru')}
                </td>
                <td className="px-4 py-3 text-center text-[#424242]">{med._count.feedback}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium
                      ${med.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {med.isActive ? 'Активно' : 'В архиве'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[#9e9e9e] text-xs">
                  {med.createdAt.toLocaleDateString('ru')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {medications.length === 0 && (
          <div className="text-center py-12 text-[#9e9e9e]">
            <p className="text-4xl mb-3">💊</p>
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
