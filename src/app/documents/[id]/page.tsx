'use client';

import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notFound } from 'next/navigation';

interface DocumentChunk {
  id: string;
  chunkIndex: number;
  content: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  category: string;
  version: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  chunks: DocumentChunk[];
}

interface PageProps {
  params: { id: string };
}

const typeLabels: Record<string, string> = {
  SOP: 'SOP',
  Policy: 'Политика',
  Template: 'Шаблон',
  ICHGuideline: 'ICH Руководство',
};

async function fetchDocument(id: string): Promise<Document> {
  const response = await fetch(`/api/documents/${id}`);
  if (!response.ok) {
    throw new Error('Document not found');
  }
  const data = await response.json();
  return data.data;
}

export default function DocumentPage({ params }: PageProps) {
  const { data: document, isLoading } = useQuery({
    queryKey: ['document', params.id],
    queryFn: () => fetchDocument(params.id),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!document) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>
            <strong>Тип:</strong> {typeLabels[document.type] || document.type}
          </span>
          <span>
            <strong>Категория:</strong> {document.category}
          </span>
          <span>
            <strong>Версия:</strong> {document.version}
          </span>
          <span>
            <strong>Дата:</strong>{' '}
            {format(new Date(document.createdAt), 'dd.MM.yyyy', { locale: ru })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="content" className="mt-6">
        <TabsList>
          <TabsTrigger value="content">Содержимое</TabsTrigger>
          <TabsTrigger value="chunks">Чанки</TabsTrigger>
          <TabsTrigger value="mappings">Сопоставления</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card>
            <CardContent className="p-6 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {document.content}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chunks" className="mt-4">
          <div className="space-y-4">
            {document.chunks.map((chunk) => (
              <Card key={chunk.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Чанк {chunk.chunkIndex + 1}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {chunk.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mappings" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Сопоставления с требованиями будут отображены здесь после запуска AI-анализа.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
