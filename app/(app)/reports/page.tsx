import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppIcon } from "@/components/app/icon";
import { reportDefinitions } from "@/features/reports/report-definitions";
import { localizeReportDefinition } from "@/features/reports/localize";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/server";

export const metadata = {
  title: "Reports"
};

export default async function ReportsPage() {
  const locale = await getLocale();
  const reports = reportDefinitions.map((report) => localizeReportDefinition(locale, report));

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t(locale, "reportsAndExports")}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-normal">{t(locale, "fullReportsSuite")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t(locale, "reportsDescription")}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription className="mt-2">{report.description}</CardDescription>
                </div>
                <Badge>{report.module}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {report.filters.map((filter) => (
                  <Badge key={filter} tone="muted">
                    {filter}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/exports/${report.key}?format=pdf`}>
                    <AppIcon name="file" />
                    {t(locale, "pdf")}
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={`/api/exports/${report.key}?format=csv`}>
                    <AppIcon name="download" />
                    {t(locale, "csv")}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
