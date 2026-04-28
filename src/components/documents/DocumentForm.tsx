'use client';

import { useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDocumentSchema } from '@/lib/validators';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { z } from 'zod';

type DocumentFormValues = z.infer<typeof createDocumentSchema>;

interface DocumentFormProps {
  onSuccess?: () => void;
}

const documentTypes = [
  { value: 'SOP', label: 'SOP' },
  { value: 'Policy', label: 'Политика' },
  { value: 'Template', label: 'Шаблон' },
  { value: 'ICHGuideline', label: 'ICH Руководство' },
];

export function DocumentForm({ onSuccess }: DocumentFormProps) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      version: '1.0',
    },
  });

  const handleTypeChange = (value: string) => {
    setValue('type', value as 'SOP' | 'Policy' | 'Template' | 'ICHGuideline');
  };

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании документа');
      }

      toast.success('Документ создан');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error('Ошибка при создании документа');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
        <Input id="title" {...register('title')} placeholder="Введите название документа" />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Тип</Label>
        <Select onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип документа" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Категория</Label>
        <Input
          id="category"
          {...register('category')}
          placeholder="Введите категорию"
        />
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">Версия</Label>
        <Input
          id="version"
          {...register('version')}
          placeholder="1.0"
        />
        {errors.version && (
          <p className="text-sm text-destructive">{errors.version.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Содержимое</Label>
        <Textarea
          id="content"
          {...register('content')}
          rows={15}
          placeholder="Пример GxP текста:

1. НАЗНАЧЕНИЕ
Настоящая стандартная операционная процедура (СОП) устанавливает требования к документированию данных в лабораторных условиях.

2. ОБЛАСТЬ ПРИМЕНЕНИЯ
Данная процедура применяется ко всем лабораторным подразделениям, осуществляющим испытания продукции.

3. ОТВЕТСТВЕННОСТЬ
3.1. Главный технолог отвечает за контроль соблюдения процедуры.
3.2. Лаборанты несут ответственность за корректное ведение документации."
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </form>
  );
}
