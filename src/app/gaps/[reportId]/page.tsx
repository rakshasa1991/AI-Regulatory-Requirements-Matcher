'use client';

import { useQuery } from '@tanstack/react-query';
import { GapReportView } from '@/components/gaps/GapReportView';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GapReportData } from '@/types';

interface PageProps {
  params: { reportId: string };
}

async function fetchGapReport(reportId: string): Promise<GapReportData> {
  const response = await fetch(`/api/gaps/${reportId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch gap report');
  }
  const data = await response.json();
  return data.data;
}

export default function GapReportPage({ params }: PageProps) {
  const { data: report, isLoading, error } = useQuery({
    queryKey: ['gapReport', params.reportId],
    queryFn: () => fetchGapReport(params.reportId),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Загрузка gap-отчёта...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <p>Ошибка при загрузке gap-отчёта</p>
      </div>
    );
  }

  const itemCount = report.items.length;
  const criticalCount = report.items.filter((i) => i.severity === 'Critical').length;
  const highCount = report.items.filter((i) => i.severity === 'High').length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gap-отчёт</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Дата</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {new Date(report.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </CardContent>
        </Card>

        {report.requirementSetTitle && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Набор требований</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{report.requirementSetTitle}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Количество пунктов</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{itemCount}</p>
          </CardContent>
        </Card>
      </div>

        {report.executiveSummary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Исполнительное резюме и план обновления процедур</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{report.executiveSummary}</p>
          </CardContent>
        </Card>
      )}

      <div className="mb-6">
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
            <div className="text-sm text-red-600">Критические</div>
          </div>
          <div className="px-4 py-2 bg-orange-100 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">{highCount}</div>
            <div className="text-sm text-orange-600">Высокие</div>
          </div>
        </div>
      </div>

      <GapReportView items={report.items} reportId={params.reportId} />
    </div>
  );
}
