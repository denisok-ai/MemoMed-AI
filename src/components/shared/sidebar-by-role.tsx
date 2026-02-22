/**
 * @file sidebar-by-role.tsx
 * @description Выбор sidebar по роли пользователя для общих страниц (chat)
 * @created 2026-02-22
 */

import { PatientSidebar } from '@/components/patient/patient-sidebar';
import { RelativeSidebar } from '@/components/relative/relative-sidebar';
import { DoctorSidebar } from '@/components/doctor/doctor-sidebar';

interface SidebarByRoleProps {
  userRole: 'patient' | 'relative' | 'doctor';
}

export function SidebarByRole({ userRole }: SidebarByRoleProps) {
  if (userRole === 'doctor') return <DoctorSidebar />;
  return userRole === 'patient' ? <PatientSidebar /> : <RelativeSidebar />;
}
