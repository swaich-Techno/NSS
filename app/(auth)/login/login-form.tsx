"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/features/auth/login-schema";
import { t, type Locale, type TranslationKey } from "@/lib/i18n/dictionary";

const demoUsers = [
  { email: "owner@nss.local", labelKey: "owner", helper: { en: "Full business access", pa: "ਪੂਰਾ ਬਿਜ਼ਨਸ ਐਕਸੈਸ" } },
  { email: "manager@nss.local", labelKey: "manager", helper: { en: "Operations access", pa: "ਓਪਰੇਸ਼ਨ ਐਕਸੈਸ" } },
  { email: "cashier@nss.local", labelKey: "cashier", helper: { en: "Billing counter", pa: "ਬਿਲਿੰਗ ਕਾਊਂਟਰ" } },
  { email: "inventory@nss.local", labelKey: "inventoryStaff", helper: { en: "Stock control", pa: "ਸਟਾਕ ਕੰਟਰੋਲ" } },
  { email: "accountant@nss.local", labelKey: "accountant", helper: { en: "Accounts and reports", pa: "ਅਕਾਊਂਟ ਅਤੇ ਰਿਪੋਰਟ" } },
  { email: "viewer@nss.local", labelKey: "readonlyStaff", helper: { en: "View only", pa: "ਸਿਰਫ਼ ਵੇਖੋ" } }
] satisfies { email: string; labelKey: TranslationKey; helper: Record<Locale, string> }[];

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "owner@nss.local",
      password: "Namdhari@123"
    }
  });

  async function onSubmit(values: LoginInput) {
    setMessage(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });
    const result = (await response.json()) as { ok: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setMessage(result.message ?? t(locale, "invalidLogin"));
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{t(locale, "email")}</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t(locale, "password")}</Label>
        <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
      </div>
      {message ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{message}</p> : null}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? t(locale, "signingIn") : t(locale, "signIn")}
      </Button>
      <div className="rounded-lg border border-border bg-muted/45 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t(locale, "demoUsers")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {demoUsers.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => {
                setValue("email", user.email);
                setValue("password", "Namdhari@123");
              }}
              className="rounded-md border border-border bg-white px-3 py-2 text-left transition hover:border-primary hover:text-primary"
            >
              <span className="block text-sm font-bold text-foreground">{t(locale, user.labelKey)}</span>
              <span className="block text-xs text-muted-foreground">{user.helper[locale]}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
