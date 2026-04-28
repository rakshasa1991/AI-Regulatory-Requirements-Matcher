'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface RequirementSet {
  id: string;
  title: string;
  source: string;
  status: string;
  importDate: string;
  createdAt: string;
  updatedAt: string;
  requirementsCount: number;
}

async function fetchRequirementSets(): Promise<RequirementSet[]> {
  const response = await fetch('/api/requirements');
  const data = await response.json();
  return data.data;
}

export default function RequirementsPage() {
  const router = useRouter();

  const { data: sets = [], isLoading } = useQuery({
    queryKey: ['requirementSets'],
    queryFn: fetchRequirementSets,
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Наборы требований</h1>
        <Button onClick={() => router.push('/requirements/new')}>
          Новый импорт
        </Button>
      </div>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((set) => (
            <Card
              key={set.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/requirements/${set.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{set.title}</h3>
                  <Badge
                    variant={
                      set.status === 'Mapped'
                        ? 'default'
                        : set.status === 'Draft'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {set.status === 'Draft'
                      ? 'Черновик'
                      : set.status === 'Mapped'
                      ? 'Сопоставлено'
                      : set.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Источник:</strong> {set.source}
                  </p>
                  <p>
                    <strong>Требований:</strong> {set.requirementsCount}
                  </p>
                  <p>
                    <strong>Дата импорта:</strong>{' '}
                    {format(new Date(set.importDate), 'dd.MM.yyyy', {
                      locale: ru,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
