'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRequirementSetSchema } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';

type ImportFormValues = z.infer<typeof createRequirementSetSchema>;

interface ImportFormProps {
  onSuccess?: (requirementCount: number) => void;
}

export function ImportForm({ onSuccess }: ImportFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ImportFormValues>({
    resolver: zodResolver(createRequirementSetSchema),
  });

  const onSubmit = async (data: ImportFormValues) => {
    try {
      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Ошибка при импорте требований');
      }

      const result = await response.json();
      const count = result.data?.requirementsCount || 0;

      toast.success(`Импортировано и распарсено ${count} требований`);
      reset();
      onSuccess?.(count);
    } catch (error) {
      toast.error('Ошибка при импорте требований');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Название набора требований</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Например: FDA Guidelines 2024"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="source">Источник (агентство)</Label>
        <Input
          id="source"
          {...register('source')}
          placeholder="Например: FDA, EMA, ICH"
        />
        {errors.source && (
          <p className="text-sm text-destructive">{errors.source.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rawText">Полный текст требований</Label>
        <Textarea
          id="rawText"
          {...register('rawText')}
          rows={15}
          placeholder="Вставьте список требований здесь. Каждый пункт с новой строки:

1. Производитель должен внедрить систему управления качеством.
2. Все лабораторные испытания должны проводиться в соответствии с GLP.
3. Документация должна храниться не менее 5 лет после выпуска продукции.
4. Критические отклонения должны быть расследованы в течение 10 рабочих дней."
        />
        {errors.rawText && (
          <p className="text-sm text-destructive">{errors.rawText.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Импорт...' : 'Импортировать и разобрать'}
      </Button>
    </form>
  );
}
