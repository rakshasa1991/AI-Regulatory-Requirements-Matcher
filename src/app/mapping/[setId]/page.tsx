'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MappingResults } from '@/components/mapping/MappingResults';
import { toast } from 'sonner';
import { MappingResponse, MappingSummary } from '@/types';

interface PageProps {
  params: { setId: string };
}

async function fetchMappings(setId: string): Promise<MappingResponse[]> {
  const response = await fetch(`/api/mapping/${setId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch mappings');
  }
  const data = await response.json();
  return data.data;
}

function calculateSummary(mappings: MappingResponse[]): MappingSummary {
  const summary: MappingSummary = {
    covered: 0,
    partial: 0,
    gap: 0,
    unmapped: 0,
    total: mappings.length,
  };

  mappings.forEach((m) => {
    switch (m.coverageStatus) {
      case 'Covered':
        summary.covered++;
        break;
      case 'Partial':
        summary.partial++;
        break;
      case 'Gap':
        summary.gap++;
        break;
      case 'Unmapped':
        summary.unmapped++;
        break;
    }
  });

  return summary;
}

export default function MappingPage({ params }: PageProps) {
  const router = useRouter();

  const { data: mappings, isLoading } = useQuery({
    queryKey: ['mappings', params.setId],
    queryFn: () => fetchMappings(params.setId),
  });

  const summary = mappings ? calculateSummary(mappings) : null;

  const generateGapReport = async () => {
    try {
      const response = await fetch('/api/gaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirementSetId: params.setId }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при генерации gap-отчёта');
      }

      const data = await response.json();
      toast.success('Gap-отчёт сформирован');
      router.push(`/gaps/${data.data.reportId}`);
    } catch (error) {
      toast.error('Ошибка при генерации gap-отчёта');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Загрузка результатов...</p>
      </div>
    );
  }

  if (!mappings || mappings.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Результаты сопоставления</h1>
        <p>Нет данных для отображения. Запустите AI-сопоставление сначала.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Результаты сопоставления</h1>

      {summary && (
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{summary.covered}</div>
              <div className="text-sm text-green-600">Покрыто</div>
            </div>
            <div className="p-4 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{summary.partial}</div>
              <div className="text-sm text-yellow-600">Частично</div>
            </div>
            <div className="p-4 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{summary.gap}</div>
              <div className="text-sm text-red-600">Пробел</div>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{summary.unmapped}</div>
              <div className="text-sm text-gray-600">Не сопоставлено</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Общее покрытие</span>
              <span>
                {Math.round((summary.covered / summary.total) * 100)}%
              </span>
            </div>
            <Progress value={(summary.covered / summary.total) * 100} />
          </div>
        </div>
      )}

      <div className="mb-6">
        <Button onClick={generateGapReport}>Сформировать gap-отчёт</Button>
      </div>

      <MappingResults mappings={mappings} />
    </div>
  );
}
