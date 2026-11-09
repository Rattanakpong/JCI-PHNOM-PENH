"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCode } from "@/components/registration/qr-code";

type LocalizedText = { en: string; km: string };

export interface TicketTierOption {
  id: string;
  name: LocalizedText;
  priceUsd: number;
  saleEndsAt: string | null; // ISO string; tier stops being selectable after this
}

export interface RegistrationEvent {
  id: string;
  title: LocalizedText;
  ticketTiers: TicketTierOption[];
}

const detailsSchema = z
  .object({
    ticketTierId: z.string().min(1, "Select a ticket type"),
    fullName: z.string().min(2, "Enter your name"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(6, "Enter a valid phone number"),
    isJciMember: z.enum(["yes", "no"], { required_error: "Select an option" }),
    jciChapter: z.string().optional(),
  })
  .refine((data) => data.isJciMember !== "yes" || !!data.jciChapter, {
    message: "Select your JCI chapter",
    path: ["jciChapter"],
  });

type DetailsForm = z.infer<typeof detailsSchema>;

type Step = "details" | "payment" | "confirmation";

interface PaymentState {
  registrationId: string;
  amountUsd: number;
  qrPayload: string;
}

export function RegistrationModal({
  event,
  children,
}: {
  event: RegistrationEvent;
  children: React.ReactNode; // trigger element, e.g. a <Button>
}) {
  const t = useTranslations("registration");
  const locale = useLocale() as "en" | "km";

  const availableTiers = event.ticketTiers.filter(
    (tier) => !tier.saleEndsAt || new Date(tier.saleEndsAt) > new Date()
  );

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [payment, setPayment] = useState<PaymentState | null>(null);
  const [hasPaid, setHasPaid] = useState<"yes" | "no" | null>(null);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      ticketTierId: availableTiers[0]?.id ?? "",
      fullName: "",
      email: "",
      phone: "",
      isJciMember: "no",
      jciChapter: "",
    },
  });

  const isJciMember = form.watch("isJciMember");
  const selectedTierId = form.watch("ticketTierId");
  const selectedTier = event.ticketTiers.find((tier) => tier.id === selectedTierId);
  const isFreeTier = (selectedTier?.priceUsd ?? 0) === 0;

  function resetAndClose() {
    setOpen(false);
    setStep("details");
    setPayment(null);
    setHasPaid(null);
    setTelegramUrl(null);
    setError(null);
    form.reset();
  }

  // Step 1 -> 2: submit contact details, receive a KHQR payload pre-filled
  // with the event's ticket amount.
  async function onSubmitDetails(values: DetailsForm) {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ticketTierId: values.ticketTierId,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          isJciMember: values.isJciMember === "yes",
          jciChapter: values.isJciMember === "yes" ? values.jciChapter : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");

      if (data.isFree) {
        setTelegramUrl(data.telegramGroupUrl);
        setStep("confirmation");
        return;
      }

      setPayment({
        registrationId: data.registrationId,
        amountUsd: data.amountUsd,
        qrPayload: data.qrPayload,
      });
      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Step 2 -> 3: confirm the visitor says they've paid. Admin dashboards see
  // the registration + payment the moment it's created — no extra step
  // needed here.
  async function onConfirmPayment() {
    if (!payment || hasPaid !== "yes") return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/registrations/${payment.registrationId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not confirm payment");

      setTelegramUrl(data.telegramGroupUrl);
      setStep("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepIndex = { details: 0, payment: 1, confirmation: 2 }[step];

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title[locale]}</DialogTitle>
        </DialogHeader>

        <Stepper
          steps={[t("step1Title"), t("step2Title"), t("step3Title")]}
          currentStep={stepIndex}
        />

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {step === "details" && availableTiers.length === 0 && (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-brand-navy/70">
            {t("noTicketsAvailable")}
          </p>
        )}

        {step === "details" && availableTiers.length > 0 && (
          <form onSubmit={form.handleSubmit(onSubmitDetails)} className="space-y-4">
            {availableTiers.length > 1 && (
              <div className="space-y-1.5">
                <Label htmlFor="ticketTierId">{t("ticketTier")}</Label>
                <Select
                  value={form.watch("ticketTierId")}
                  onValueChange={(value) => form.setValue("ticketTierId", value)}
                >
                  <SelectTrigger id="ticketTierId">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name[locale]} — {tier.priceUsd === 0 ? t("free") : `$${tier.priceUsd.toFixed(2)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t("fullName")}</Label>
              <Input id="fullName" {...form.register("fullName")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>

            <div className="space-y-2">
              <Label>{t("isJciMember")}</Label>
              <Controller
                control={form.control}
                name="isJciMember"
                render={({ field }) => (
                  <RadioCardGroup
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    options={[
                      { value: "yes", label: t("isJciMemberYes") },
                      { value: "no", label: t("isJciMemberNo") },
                    ]}
                  />
                )}
              />
            </div>

            {isJciMember === "yes" && (
              <div className="space-y-1.5">
                <Label htmlFor="jciChapter">{t("jciChapter")}</Label>
                <Select
                  value={form.watch("jciChapter")}
                  onValueChange={(value) => form.setValue("jciChapter", value)}
                >
                  <SelectTrigger id="jciChapter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(t.raw("jciChapters") as string[]).map((chapter) => (
                      <SelectItem key={chapter} value={chapter}>
                        {chapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isFreeTier ? t("confirmPayment") : t("continueToPayment")}
            </Button>
          </form>
        )}

        {step === "payment" && payment && (
          <div className="flex flex-col items-center gap-4">
            <QrCode payload={payment.qrPayload} />
            <p className="text-sm text-muted-foreground">{t("scanToPay")}</p>
            <p className="text-2xl font-bold text-brand-navy">
              {t("amountDue")}: ${payment.amountUsd.toFixed(2)}
            </p>

            <div className="w-full space-y-2">
              <Label>{t("hasPaid")}</Label>
              <RadioCardGroup
                name="hasPaid"
                value={hasPaid ?? ""}
                onChange={(value) => setHasPaid(value as "yes" | "no")}
                options={[
                  { value: "yes", label: t("hasPaidYes") },
                  { value: "no", label: t("hasPaidNo") },
                ]}
              />
            </div>

            <Button
              className="w-full"
              disabled={hasPaid !== "yes" || isSubmitting}
              onClick={onConfirmPayment}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("verifying")}
                </>
              ) : (
                t("confirmPayment")
              )}
            </Button>
          </div>
        )}

        {step === "confirmation" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal/20 text-2xl">
              🎉
            </div>
            <p className="text-lg font-bold text-brand-navy">{t("successTitle")}</p>

            {telegramUrl && (
              <Button asChild size="lg" variant="secondary">
                <a href={telegramUrl} target="_blank" rel="noreferrer">
                  {t("telegramCta")}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}

            <Button variant="ghost" onClick={resetAndClose}>
              {t("close")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
