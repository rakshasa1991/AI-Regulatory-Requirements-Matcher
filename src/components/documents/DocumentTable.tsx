'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  type: 'SOP' | 'Policy' | 'Template' | 'ICHGuideline';
  category: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentTableProps {
  documents: Document[];
  onDelete: (id: string) => Promise<void>;
}

const typeLabels: Record<string, string> = {
  SOP: 'SOP',
  Policy: 'Политика',
  Template: 'Шаблон',
  ICHGuideline: 'ICH Руководство',
};

const getTypeVariant = (type: string) => {
  switch (type) {
    case 'SOP':
      return 'secondary' as const;
    case 'Policy':
      return 'default' as const;
    case 'Template':
      return 'secondary' as const;
    case 'ICHGuideline':
      return 'default' as const;
    default:
      return 'default' as const;
  }
};

export function DocumentTable({ documents, onDelete }: DocumentTableProps) {
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Вы уверены, что хотите удалить документ "${title}"?`)) {
      return;
    }

    try {
      await onDelete(id);
      toast.success('Документ удалён');
      router.refresh();
    } catch (error) {
      toast.error('Ошибка при удалении документа');
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Название</TableHead>
          <TableHead>Тип</TableHead>
          <TableHead>Категория</TableHead>
          <TableHead>Версия</TableHead>
          <TableHead>Дата</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium">{doc.title}</TableCell>
            <TableCell>
              <Badge variant={getTypeVariant(doc.type)}>
                {typeLabels[doc.type] || doc.type}
              </Badge>
            </TableCell>
            <TableCell>{doc.category}</TableCell>
            <TableCell>{doc.version}</TableCell>
            <TableCell>
              {format(new Date(doc.createdAt), 'dd.MM.yyyy', { locale: ru })}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="default"
                className="mr-2"
                onClick={() => router.push(`/documents/${doc.id}`)}
              >
                Открыть
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => handleDelete(doc.id, doc.title)}
              >
                Удалить
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
