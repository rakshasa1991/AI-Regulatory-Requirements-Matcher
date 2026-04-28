'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';

interface Requirement {
  id: string;
  orderIndex: number;
  text: string;
  category: string;
  criticality: string;
  status: string;
}

interface RequirementSet {
  id: string;
  title: string;
  source: string;
  status: string;
  requirements: Requirement[];
}

interface PageProps {
  params: { id: string };
}

const categoryLabels: Record<string, string> = {
  Safety: 'Безопасность',
  Efficacy: 'Эффективность',
  Quality: 'Качество',
  Labeling: 'Маркировка',
  Administrative: 'Административные',
  Other: 'Другое',
};

const criticalityLabels: Record<string, string> = {
  Critical: 'Критический',
  High: 'Высокий',
  Medium: 'Средний',
  Low: 'Низкий',
};

const statusLabels: Record<string, string> = {
  Covered: 'Покрыто',
  Partial: 'Частично',
  Gap: 'Разрыв',
  Unmapped: 'Не сопоставлено',
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Covered':
      return 'default';
    case 'Partial':
      return 'secondary';
    case 'Gap':
      return 'destructive';
    case 'Unmapped':
      return 'outline';
    default:
      return 'outline';
  }
};

async function fetchRequirementSet(id: string): Promise<RequirementSet> {
  const response = await fetch(`/api/requirements/${id}`);
  if (!response.ok) {
    throw new Error('Requirement set not found');
  }
  const data = await response.json();
  return data.data;
}

async function fetchRequirements(id: string, status?: string, criticality?: string): Promise<Requirement[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (criticality) params.set('criticality', criticality);
  
  const response = await fetch(`/api/requirements/${id}/items?${params}`);
  if (!response.ok) throw new Error('Failed to fetch requirements');
  const data = await response.json();
  return data.data ?? [];
}

export default function RequirementSetPage({ params }: PageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('');
  const [mappingLoading, setMappingLoading] = useState(false);
  const [gapLoading, setGapLoading] = useState(false);

  const { data: set, isLoading } = useQuery({
    queryKey: ['requirementSet', params.id],
    queryFn: () => fetchRequirementSet(params.id),
  });

  const { data: requirements = [] } = useQuery({
    queryKey: ['requirements', params.id, statusFilter, criticalityFilter],
    queryFn: () => fetchRequirements(params.id, statusFilter && statusFilter !== 'all' ? statusFilter : undefined, criticalityFilter && criticalityFilter !== 'all' ? criticalityFilter : undefined),
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; category?: string; criticality?: string }>) => {
      const response = await fetch(`/api/requirements/${params.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (!response.ok) {
        throw new Error('Failed to update');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements', params.id] });
      toast.success('Обновлено');
    },
  });

  const runMapping = async () => {
    setMappingLoading(true);
    try {
      const response = await fetch('/api/mapping/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirementSetId: params.id }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при запуске сопоставления');
      }
      
      toast.success('Сопоставление запущено');
      queryClient.invalidateQueries({ queryKey: ['requirements-stats'] });
      queryClient.invalidateQueries({ queryKey: ['documents-count'] });
      router.push(`/mapping/${params.id}`);
    } catch (error) {
      toast.error('Ошибка при запуске сопоставления');
    } finally {
      setMappingLoading(false);
    }
  };

  const generateGapReport = async () => {
    setGapLoading(true);
    try {
      const response = await fetch('/api/gaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirementSetId: params.id }),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при генерации gap-отчёта');
      }
      
      const data = await response.json();
      const reportId = data.data.reportId;
      
      toast.success('Gap-отчёт сформирован');
      queryClient.invalidateQueries({ queryKey: ['requirements-stats'] });
      router.push(`/gaps/${reportId}`);
    } catch (error) {
      toast.error('Ошибка при генерации gap-отчёта');
    } finally {
      setGapLoading(false);
    }
  };

  const handleCategoryChange = (requirementId: string, newCategory: string) => {
    updateMutation.mutate([{ id: requirementId, category: newCategory }]);
  };

  const handleCriticalityChange = (requirementId: string, newCriticality: string) => {
    updateMutation.mutate([{ id: requirementId, criticality: newCriticality }]);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="p-6">
        <p>Набор требований не найден</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{set.title}</h1>
        <p className="text-muted-foreground">Источник: {set.source}</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={runMapping} disabled={mappingLoading}>
          {mappingLoading ? 'Выполняется...' : 'Запустить AI-сопоставление'}
        </Button>
        {set.status === 'Mapped' && (
          <Button variant="outline" onClick={() => router.push(`/mapping/${params.id}`)}>
            Результаты сопоставления
          </Button>
        )}
        <Button
          variant="outline"
          onClick={generateGapReport}
          disabled={gapLoading || set.status !== 'Mapped'}
          title={set.status !== 'Mapped' ? 'Сначала запустите AI-сопоставление' : ''}
        >
          {gapLoading ? 'Выполняется...' : 'Сформировать gap-отчёт'}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="statusFilter">Статус</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="statusFilter" className="mt-1">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 max-w-xs">
              <Label htmlFor="criticalityFilter">Критичность</Label>
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger id="criticalityFilter" className="mt-1">
                  <SelectValue placeholder="Все уровни" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  {Object.entries(criticalityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Требование</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Критичность</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map((req) => (
            <TableRow key={req.id}>
              <TableCell>{req.orderIndex + 1}</TableCell>
              <TableCell className="max-w-md">{req.text}</TableCell>
              <TableCell>
                <Select
                  value={req.category}
                  onValueChange={(value) => handleCategoryChange(req.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  value={req.criticality}
                  onValueChange={(value) => handleCriticalityChange(req.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(criticalityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(req.status)}>
                  {statusLabels[req.status] || req.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
