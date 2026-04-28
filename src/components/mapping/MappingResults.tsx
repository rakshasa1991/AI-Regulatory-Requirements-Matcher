"use client";

import { MappingResponse } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface MappingResultsProps {
  mappings: MappingResponse[];
}

const getCriticalityBadge = (criticality: string) => {
  const variants = {
    Critical: "bg-red-500 text-white",
    High: "bg-orange-500 text-white",
    Medium: "bg-yellow-500 text-white",
    Low: "bg-gray-500 text-white",
  };
  return variants[criticality as keyof typeof variants] || variants.Medium;
};

const getCoverageBadge = (status: string) => {
  switch (status) {
    case "Covered":
      return "bg-green-500 text-white";
    case "Partial":
      return "bg-yellow-500 text-white";
    case "Gap":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const truncateText = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export function MappingResults({ mappings }: MappingResultsProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">Требование</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Критичность</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Статус покрытия</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Документ</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Балл соответствия</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Обоснование</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((mapping, index) => (
            <tr key={mapping.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
              <td className="px-4 py-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-block max-w-[300px] truncate cursor-pointer">
                      {truncateText(mapping.requirementText, 120)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[400px]">{mapping.requirementText}</p>
                  </TooltipContent>
                </Tooltip>
              </td>
              <td className="px-4 py-3">
                <Badge className={getCriticalityBadge(mapping.criticality)}>
                  {mapping.criticality === "Critical" ? "Критический" :
                   mapping.criticality === "High" ? "Высокий" :
                   mapping.criticality === "Medium" ? "Средний" : "Низкий"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge className={getCoverageBadge(mapping.coverageStatus)}>
                  {mapping.coverageStatus === "Covered" ? "Покрыто" :
                   mapping.coverageStatus === "Partial" ? "Частично" :
                   mapping.coverageStatus === "Gap" ? "Пробел" : "Не сопоставлено"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <a href={`/documents/${mapping.documentId}`} className="text-primary hover:underline">
                  {mapping.documentTitle}
                </a>
              </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={mapping.matchScore * 100} className="w-24" />
                    <span className="text-sm text-muted-foreground">{Math.round(mapping.matchScore * 100)}%</span>
                  </div>
                </td>
              <td className="px-4 py-3">
                {mapping.aiRationale ? (
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-primary hover:underline list-none">
                      Показать
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {mapping.aiRationale}
                    </p>
                  </details>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
