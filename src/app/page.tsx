"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, ClipboardList, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

async function getDocumentsStats() {
  const res = await fetch("/api/documents");
  if (!res.ok) throw new Error("Failed to fetch documents");
  const data = await res.json();
  return data.data?.length ?? 0;
}

async function getRequirementsStats() {
  const setsRes = await fetch("/api/requirements");
  if (!setsRes.ok) throw new Error("Failed to fetch requirements");
  const setsData = await setsRes.json();
  const sets: Array<{ id: string }> = setsData.data || [];

  if (sets.length === 0) {
    return { totalCount: 0, coveredCount: 0, gapCount: 0, setsCount: 0, criticalHighGapCount: 0 };
  }

  let allRequirements: Array<{ status: string }> = [];
  for (const set of sets) {
    const reqRes = await fetch(`/api/requirements/${set.id}/items`);
    if (reqRes.ok) {
      const reqData = await reqRes.json();
      allRequirements = allRequirements.concat(reqData.data || []);
    }
  }

  const totalCount = allRequirements.length;
  const coveredCount = allRequirements.filter((r) => r.status === "Covered").length;
  const gapCount = allRequirements.filter((r) => r.status === "Gap").length;

  return { totalCount, coveredCount, gapCount, setsCount: sets.length, criticalHighGapCount: 0 };
}

async function getLatestGapReport() {
  const res = await fetch("/api/gaps");
  if (!res.ok) return null;
  const data = await res.json();
  return data.data ?? null;
}

interface LatestReport {
  id: string;
  requirementSetTitle: string;
  createdAt: string;
  criticalCount: number;
  highCount: number;
  items: Array<{
    id: string;
    requirementText: string;
    severity: string;
    gapType: string;
    recommendation: string | null;
    status: string;
  }>;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  loading,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  loading?: boolean;
  href?: string;
}) {
  const content = (
    <Card className={href ? "hover:ring-2 hover:ring-ring transition-all cursor-pointer" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

const severityColors: Record<string, string> = {
  Critical: "destructive",
  High: "secondary",
  Medium: "outline",
  Low: "outline",
};

const severityLabels: Record<string, string> = {
  Critical: "Критический",
  High: "Высокий",
  Medium: "Средний",
  Low: "Низкий",
};

const gapTypeLabels: Record<string, string> = {
  Missing: "Отсутствует",
  Contradictory: "Противоречие",
  Partial: "Частичный",
  Outdated: "Устаревший",
};

export default function Dashboard() {
  const { data: documentsCount, isLoading: documentsLoading } = useQuery({
    queryKey: ["documents-count"],
    queryFn: getDocumentsStats,
  });

  const { data: requirementsData, isLoading: requirementsLoading } = useQuery({
    queryKey: ["requirements-stats"],
    queryFn: getRequirementsStats,
  });

  const { data: latestReport, isLoading: reportLoading } = useQuery<LatestReport | null>({
    queryKey: ["latest-gap-report"],
    queryFn: getLatestGapReport,
  });

  const totalRequirements = requirementsData?.totalCount || 0;
  const coveredCount = requirementsData?.coveredCount || 0;
  const gapCount = requirementsData?.gapCount || 0;
  const setsCount = requirementsData?.setsCount || 0;
  const coveragePercent = totalRequirements > 0
    ? Math.round((coveredCount / totalRequirements) * 100)
    : 0;
  const criticalHighCount = latestReport
    ? latestReport.criticalCount + latestReport.highCount
    : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Главная</h1>
        <p className="text-muted-foreground mt-1">
          Обзор статуса соответствия регуляторным требованиям
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Документов"
          value={documentsLoading ? "..." : documentsCount || 0}
          subtitle="в библиотеке"
          icon={FileText}
          loading={documentsLoading}
          href="/documents"
        />
        <StatCard
          title="Требований"
          value={requirementsLoading ? "..." : totalRequirements}
          subtitle={setsCount > 0 ? `в ${setsCount} ${setsCount === 1 ? "наборе" : "наборах"}` : undefined}
          icon={ClipboardList}
          loading={requirementsLoading}
          href="/requirements"
        />
        <StatCard
          title="Покрытие (AI)"
          value={`${coveragePercent}%`}
          subtitle={totalRequirements > 0 ? `${coveredCount} из ${totalRequirements} требований` : undefined}
          icon={CheckCircle2}
          loading={requirementsLoading}
          href="/requirements"
        />
        <StatCard
          title="Критических пробелов"
          value={reportLoading ? "..." : criticalHighCount}
          subtitle={
            latestReport
              ? `+ ${latestReport.items.filter(i => i.severity === "Medium" || i.severity === "Low").length} средних и низких`
              : undefined
          }
          icon={AlertCircle}
          loading={reportLoading}
          href={latestReport ? `/gaps/${latestReport.id}` : undefined}
        />
      </div>

      <div className="mb-8">
        {reportLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ) : latestReport && latestReport.items.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Приоритетные рекомендации</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {latestReport.requirementSetTitle} ·{" "}
                  {new Date(latestReport.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <Link
                href={`/gaps/${latestReport.id}`}
                className="text-sm text-primary hover:underline font-medium"
              >
                Открыть полный отчёт →
              </Link>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Требование</TableHead>
                    <TableHead className="w-32">Тип пробела</TableHead>
                    <TableHead className="w-32">Серьёзность</TableHead>
                    <TableHead>Рекомендация</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestReport.items.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="max-w-xs">
                        <span className="line-clamp-2 text-sm">{item.requirementText}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{gapTypeLabels[item.gapType] || item.gapType}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={severityColors[item.severity] as any}>
                          {severityLabels[item.severity] || item.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <span className="line-clamp-2 text-sm">{item.recommendation || "—"}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Приоритетные рекомендации</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gap-анализ ещё не проводился. Запустите AI-сопоставление для набора требований,
                затем сформируйте gap-отчёт.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/documents"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
          >
            Добавить документ
          </Link>
          <Link
            href="/requirements/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6"
          >
            Импортировать требования
          </Link>
          {latestReport && (
            <Link
              href={`/gaps/${latestReport.id}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6"
            >
              Открыть последний gap-отчёт
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
