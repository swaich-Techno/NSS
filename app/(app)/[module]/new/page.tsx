import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModuleForm } from "@/components/app/module-form";
import { AppIcon } from "@/components/app/icon";
import { InvoiceForm } from "@/features/invoices/invoice-form";
import { getInvoiceProducts } from "@/features/invoices/product-lookup";
import { getModuleDefinition } from "@/features/modules/module-definitions";
import { localizeModuleDefinition } from "@/features/modules/localize";
import { requireUser } from "@/features/auth/session";
import { getLocale } from "@/lib/i18n/server";
import { localizeCategory, t } from "@/lib/i18n/dictionary";
import { can } from "@/lib/permissions/roles";

type PageProps = {
  params: Promise<{ module: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { module } = await params;
  const definition = getModuleDefinition(module);
  return {
    title: definition ? `${definition.createLabel ?? "New"} - ${definition.title}` : "New Record"
  };
}

export default async function NewModuleRecordPage({ params }: PageProps) {
  const [user, locale] = await Promise.all([requireUser(), getLocale()]);
  const { module } = await params;
  const baseDefinition = getModuleDefinition(module);
  if (!baseDefinition || baseDefinition.fields.length === 0) notFound();
  const definition = localizeModuleDefinition(locale, baseDefinition);

  const action = definition.key === "business-settings" ? "update" : "create";
  if (!can(user.roleKey, definition.key, action)) redirect(definition.href);
  const invoiceProducts = definition.key === "invoices" ? await getInvoiceProducts() : [];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={definition.href}>
            <AppIcon name="chevron" className="rotate-180" />
            {t(locale, "backTo")} {definition.navTitle}
          </Link>
        </Button>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{localizeCategory(locale, definition.category)}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-normal">{definition.createLabel ?? "Create record"}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{definition.description}</p>
      </section>
      {definition.key === "invoices" ? <InvoiceForm products={invoiceProducts} locale={locale} /> : <ModuleForm definition={definition} locale={locale} />}
    </div>
  );
}
