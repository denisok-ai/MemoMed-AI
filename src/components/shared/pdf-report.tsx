/**
 * @file pdf-report.tsx
 * @description React-PDF компонент для генерации PDF-отчёта для врача.
 * Содержит: дисциплина, история приёмов, самочувствие, AI-резюме.
 * @created 2026-02-22
 */

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { ReportData, ReportSummary } from '@/lib/ai/report.prompt';

// Подключаем шрифт с поддержкой кириллицы
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    padding: 40,
    color: '#212121',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#1565C0',
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 700, color: '#1565C0' },
  subtitle: { fontSize: 12, color: '#757575', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1565C0',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 160, fontWeight: 700, color: '#424242' },
  value: { flex: 1, color: '#616161' },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '4 6',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: 'center' },
  colHeader: { fontWeight: 700, fontSize: 10, color: '#616161' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
  },
  goodBadge: { color: '#2e7d32', backgroundColor: '#e8f5e9' },
  badBadge: { color: '#c62828', backgroundColor: '#ffebee' },
  warnBadge: { color: '#e65100', backgroundColor: '#fff8e1' },
  aiBox: {
    backgroundColor: '#f3e5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  aiText: { fontSize: 11, color: '#4a148c', lineHeight: 1.5 },
  recommendation: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: { width: 16, color: '#1565C0' },
  disclaimer: {
    marginTop: 32,
    padding: 12,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
  },
  disclaimerText: { fontSize: 9, color: '#616161', lineHeight: 1.4 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40 },
  footerText: { fontSize: 9, color: '#bdbdbd', textAlign: 'center' },
});

interface PdfReportProps {
  data: ReportData;
  summary: ReportSummary;
  generatedAt: string;
}

export function PdfReport({ data, summary, generatedAt }: PdfReportProps) {
  const disciplineColor =
    data.avgDisciplinePercent >= 80
      ? styles.goodBadge
      : data.avgDisciplinePercent >= 60
        ? styles.warnBadge
        : styles.badBadge;

  return (
    <Document
      title={`Отчёт MemoMed — ${data.patientName}`}
      author="MemoMed AI"
      subject="Отчёт о приёме лекарств"
    >
      <Page size="A4" style={styles.page}>
        {/* Шапка */}
        <View style={styles.header}>
          <Text style={styles.title}>MemoMed AI — Отчёт для врача</Text>
          <Text style={styles.subtitle}>
            Пациент: {data.patientName} · Период: {data.periodDays} дней · Создан: {generatedAt}
          </Text>
        </View>

        {/* Общая дисциплина */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дисциплина приёма лекарств</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Средний показатель:</Text>
            <Text style={[styles.badge, disciplineColor]}>{data.avgDisciplinePercent}%</Text>
          </View>
        </View>

        {/* Таблица лекарств */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Лекарства</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.col1, styles.colHeader]}>Название / доза</Text>
              <Text style={[styles.col2, styles.colHeader]}>Принято</Text>
              <Text style={[styles.col2, styles.colHeader]}>Пропущено</Text>
              <Text style={[styles.col2, styles.colHeader]}>Дисциплина</Text>
            </View>
            {data.medications.map((med, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>
                  {med.name} {med.dosage}
                </Text>
                <Text style={[styles.col2, { color: '#2e7d32' }]}>{med.takenCount}</Text>
                <Text style={[styles.col2, { color: med.missedCount > 0 ? '#c62828' : '#616161' }]}>
                  {med.missedCount}
                </Text>
                <Text style={styles.col2}>{med.disciplinePercent}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Самочувствие */}
        {data.journalEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Дневник самочувствия (шкала 1–5)</Text>
            {(() => {
              const entries = data.journalEntries;
              const avg = (key: keyof (typeof entries)[0]) => {
                const vals = entries.map((e) => e[key]).filter((v): v is number => v !== null);
                if (!vals.length) return '—';
                return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
              };
              return (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>Настроение:</Text>
                    <Text style={styles.value}>{avg('moodScore')}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Уровень боли:</Text>
                    <Text style={styles.value}>{avg('painLevel')}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Качество сна:</Text>
                    <Text style={styles.value}>{avg('sleepQuality')}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Уровень энергии:</Text>
                    <Text style={styles.value}>{avg('energyLevel')}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Записей в дневнике:</Text>
                    <Text style={styles.value}>{entries.length}</Text>
                  </View>
                </>
              );
            })()}
          </View>
        )}

        {/* Отзывы */}
        {data.feedbacks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Отзывы о лекарствах</Text>
            {data.feedbacks.map((f, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{f.medicationName}</Text>
                <Text style={styles.col2}>
                  {f.effectivenessScore ? `${f.effectivenessScore}/5` : '—'}
                </Text>
                <Text style={[styles.col1, { fontSize: 10, color: '#616161' }]}>
                  {f.sideEffects ?? 'Побочек нет'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* AI-резюме */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-заключение для врача</Text>
          <View style={styles.aiBox}>
            <Text style={[styles.aiText, { fontWeight: 700, marginBottom: 6 }]}>Общая оценка:</Text>
            <Text style={styles.aiText}>{summary.overallAssessment}</Text>

            <Text style={[styles.aiText, { fontWeight: 700, marginTop: 8, marginBottom: 4 }]}>
              Дисциплина:
            </Text>
            <Text style={styles.aiText}>{summary.disciplineComment}</Text>

            {summary.wellbeingTrend && (
              <>
                <Text style={[styles.aiText, { fontWeight: 700, marginTop: 8, marginBottom: 4 }]}>
                  Самочувствие:
                </Text>
                <Text style={styles.aiText}>{summary.wellbeingTrend}</Text>
              </>
            )}

            <Text style={[styles.aiText, { fontWeight: 700, marginTop: 8, marginBottom: 4 }]}>
              Рекомендации:
            </Text>
            {summary.recommendations.map((rec, i) => (
              <View key={i} style={styles.recommendation}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.aiText}>{rec}</Text>
              </View>
            ))}

            {summary.doctorNote && (
              <>
                <Text
                  style={[
                    styles.aiText,
                    { fontWeight: 700, marginTop: 8, color: '#c62828', marginBottom: 4 },
                  ]}
                >
                  Внимание врача:
                </Text>
                <Text style={[styles.aiText, { color: '#c62828' }]}>{summary.doctorNote}</Text>
              </>
            )}
          </View>
        </View>

        {/* Дисклеймер */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Данный отчёт сгенерирован автоматически системой MemoMed AI на основе данных, введённых
            пациентом. AI-заключение носит информационный характер и не является медицинским
            диагнозом. Все решения принимаются лечащим врачом на основе клинической картины.
          </Text>
        </View>

        {/* Нижний колонтитул */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            MemoMed AI · Конфиденциально · Только для медицинского персонала
          </Text>
        </View>
      </Page>
    </Document>
  );
}
