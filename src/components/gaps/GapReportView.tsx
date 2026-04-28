"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GapItemWithRequirement, GapSeverity, GapItemStatus, DraftResponse } from "@/types";
import { toast } from "sonner";

interface GapReportViewProps {
  items: GapItemWithRequirement[];
  reportId: string;
}

const severityLabels: Record<GapSeverity, string> = {
  Critical: "Критический",
  High: "Высокий",
  Medium: "Средний",
  Low: "Низкий",
};

const statusLabels: Record<GapItemStatus, string> = {
  Open: "Открыт",
  InProgress: "В работе",
  Resolved: "Решён",
};

const gapTypeLabels: Record<string, string> = {
  Missing: "Отсутствует",
  Contradictory: "Противоречивый",
  Partial: "Частичный",
  Outdated: "Устаревший",
};

const getSeverityVariant = (severity: GapSeverity) => {
  switch (severity) {
    case "Critical":
      return "bg-red-500 text-white";
    case "High":
      return "bg-orange-500 text-white";
    case "Medium":
      return "bg-yellow-500 text-white";
    case "Low":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const getStatusVariant = (status: GapItemStatus) => {
  switch (status) {
    case "Resolved":
      return "bg-green-500 text-white";
    case "InProgress":
      return "bg-blue-500 text-white";
    case "Open":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

export function GapReportView({ items, reportId }: GapReportViewProps) {
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const draftMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/gaps/${reportId}/items/${itemId}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to generate draft");
      }
      const data: DraftResponse = await response.json();
      return data.data.draftResponseText;
    },
    onSuccess: (draftText) => {
      setSelectedDraft(draftText);
      setDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ["gapReport"] });
    },
    onError: () => {
      toast.error("Ошибка при генерации черновика");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: GapItemStatus }) => {
      const response = await fetch(`/api/gaps/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gapReport"] });
      toast.success("Статус обновлён");
    },
    onError: () => {
      toast.error("Ошибка при обновлении статуса");
    },
  });

  const handleGenerateDraft = (itemId: string) => {
    draftMutation.mutate(itemId);
  };

  const handleStatusChange = (itemId: string, status: GapItemStatus) => {
    updateStatusMutation.mutate({ itemId, status });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Скопировано в буфер");
    } catch (error) {
      toast.error("Ошибка при копировании");
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Нет пробелов для отображения</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Черновик ответа</DialogTitle>
          </DialogHeader>
          {selectedDraft && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                <p className="whitespace-pre-wrap">{selectedDraft}</p>
              </div>
              <Button onClick={() => copyToClipboard(selectedDraft)} variant="outline">
                Копировать
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Требование</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Тип gap</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Серьёзность</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Рекомендация</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Черновик</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Статус</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                <td className="px-4 py-3 max-w-xs truncate">
                  {item.requirementText}
                </td>
                <td className="px-4 py-3">
                  {gapTypeLabels[item.gapType] || item.gapType}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getSeverityVariant(item.severity)}>
                    {severityLabels[item.severity]}
                  </Badge>
                </td>
                <td className="px-4 py-3 max-w-md">
                  {item.recommendation || "—"}
                </td>
                <td className="px-4 py-3">
                  {item.draftResponseText ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedDraft(item.draftResponseText!);
                        setDialogOpen(true);
                      }}
                    >
                      Показать черновик
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleGenerateDraft(item.id)}
                      disabled={draftMutation.isPending}
                    >
                      {draftMutation.isPending ? "Генерация..." : "Сгенерировать черновик"}
                    </Button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Select
                    value={item.status}
                    onValueChange={(value) => handleStatusChange(item.id, value as GapItemStatus)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <Badge className={getStatusVariant(value as GapItemStatus)}>
                            {label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
