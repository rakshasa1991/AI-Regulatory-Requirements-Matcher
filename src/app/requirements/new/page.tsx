'use client';

import { useRouter } from 'next/navigation';
import { ImportForm } from '@/components/requirements/ImportForm';

export default function NewRequirementPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Импорт новых требований</h1>
        <p className="text-muted-foreground">
          Вставьте текст требований для автоматического парсинга и создания набора
        </p>
      </div>

      <div className="max-w-3xl">
        <ImportForm
          onSuccess={() => {
            setTimeout(() => {
              router.push('/requirements');
            }, 1000);
          }}
        />
      </div>
    </div>
  );
}
