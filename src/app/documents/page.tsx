'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DocumentTable } from '@/components/documents/DocumentTable';
import { DocumentForm } from '@/components/documents/DocumentForm';
import { useState } from 'react';
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

async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch('/api/documents');
  const data = await response.json();
  return data.data;
}

export default function DocumentsPage() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Библиотека документов</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Добавить документ</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новый документ</DialogTitle>
            </DialogHeader>
            <DocumentForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Загрузка...</p>
      ) : (
        <DocumentTable
          documents={documents}
          onDelete={async (id) => {
            await deleteMutation.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}
