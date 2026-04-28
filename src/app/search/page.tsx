'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchResponse, SearchResult } from '@/types';

const typeLabels: Record<string, string> = {
  SOP: 'СОП',
  Policy: 'Политика',
  Template: 'Шаблон',
  ICHGuideline: 'Руководство ICH',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 10 }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data.data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  let debounceTimer: NodeJS.Timeout;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Поиск</h1>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Введите запрос для поиска..."
          value={query}
          onChange={handleInputChange}
          className="max-w-md"
        />
      </div>

      {loading && (
        <div className="text-muted-foreground">
          Поиск...
        </div>
      )}

      {!loading && searched && results.length === 0 && query.trim() && (
        <div className="text-muted-foreground">
          Ничего не найдено
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <Badge variant="outline">
                    {typeLabels[result.type] || result.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-sm text-muted-foreground mb-3"
                  dangerouslySetInnerHTML={{ __html: result.excerpt }}
                />
                <a 
                  href={`/documents/${result.id}`}
                  className="text-primary hover:underline text-sm"
                >
                  Перейти к полному документу
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
