"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  IdCard,
  UserRound,
  GraduationCap,
  Briefcase,
  Building2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { QuickPickInput } from "@/components/ui/quick-pick-input";
import { Stepper } from "@/components/ui/stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  membershipApplicationSchema,
  membershipStatusValues,
  titleValues,
  genderValues,
  occupationValues,
  referralSourceValues,
  supportAreaValues,
  type MembershipApplicationInput,
} from "@/lib/validation/membership-application";

const TITLE_KEYS: Record<(typeof titleValues)[number], string> = {
  MR: "titleMr",
  MS: "titleMs",
  MRS: "titleMrs",
  DR: "titleDr",
  OTHER: "titleOther",
};
const GENDER_KEYS: Record<(typeof genderValues)[number], string> = {
  MALE: "genderMale",
  FEMALE: "genderFemale",
  OTHER: "genderOther",
};
const OCCUPATION_KEYS: Record<(typeof occupationValues)[number], string> = {
  BUSINESS_OWNER: "occupationBusinessOwner",
  EMPLOYEE: "occupationEmployee",
  STUDENT: "occupationStudent",
  OTHER: "occupationOther",
};
const REFERRAL_KEYS: Record<(typeof referralSourceValues)[number], string> = {
  FRIENDS_FAMILY: "referralFriendsFamily",
  COLLEAGUE: "referralColleague",
  SOCIAL_MEDIA: "referralSocialMedia",
  OTHER: "referralOther",
};
const SUPPORT_KEYS: Record<(typeof supportAreaValues)[number], string> = {
  SHARE_EXPERTISE: "supportShareExpertise",
  PROJECT_ORGANIZER: "supportProjectOrganizer",
  PROMOTE_SPONSORSHIP: "supportPromoteSponsorship",
  OTHER: "supportOther",
};

const FOUNDING_YEAR = 2010;
const CURRENT_YEAR = new Date().getFullYear();
const MEMBER_YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - FOUNDING_YEAR + 1 },
  (_, i) => String(CURRENT_YEAR - i)
);

type StepKey = "membership" | "personal" | "student" | "employee" | "business" | "final";

const STEP_ICONS: Record<StepKey, LucideIcon> = {
  membership: IdCard,
  personal: UserRound,
  student: GraduationCap,
  employee: Briefcase,
  business: Building2,
  final: Sparkles,
};

const FIELDS_BY_STEP: Record<StepKey, FieldPath<MembershipApplicationInput>[]> = {
  membership: ["membershipStatus", "formerMemberYear"],
  personal: [
    "fullNameKhmer",
    "fullNameEnglish",
    "title",
    "nationality",
    "gender",
    "dateOfBirth",
    "phone",
    "email",
    "occupation",
  ],
  student: ["schoolName"],
  employee: ["companyName", "companyIndustry", "department"],
  business: ["companyName", "companyIndustry"],
  final: ["referralSource", "supportArea", "expectations", "agreeToTerms"],
};

export function MembershipApplicationForm() {
  const t = useTranslations("joinPage");
  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const form = useForm<MembershipApplicationInput>({
    resolver: zodResolver(membershipApplicationSchema),
    defaultValues: {
      membershipStatus: "NEW_MEMBER",
      formerMemberYear: "",
      fullNameKhmer: "",
      fullNameEnglish: "",
      title: "MR",
      nationality: "",
      gender: "MALE",
      occupation: "EMPLOYEE",
      schoolName: "",
      companyName: "",
      companyIndustry: "",
      department: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      referralSource: "FRIENDS_FAMILY",
      supportArea: "SHARE_EXPERTISE",
      expectations: "",
      agreeToTerms: false,
    },
  });

  const membershipStatus = form.watch("membershipStatus");
  const occupation = form.watch("occupation");

  const steps = useMemo(() => {
    const result: { key: StepKey; title: string }[] = [
      { key: "membership", title: t("sectionMembership") },
      { key: "personal", title: t("sectionPersonal") },
    ];
    if (occupation === "STUDENT") result.push({ key: "student", title: t("sectionStudent") });
    else if (occupation === "EMPLOYEE") result.push({ key: "employee", title: t("sectionEmployee") });
    else if (occupation === "BUSINESS_OWNER") result.push({ key: "business", title: t("sectionBusiness") });
    result.push({ key: "final", title: t("sectionFinal") });
    return result;
  }, [occupation, t]);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];
  const isLastStep = stepIndex === steps.length - 1;
  const StepIcon = STEP_ICONS[currentStep.key];

  async function goNext() {
    const valid = await form.trigger(FIELDS_BY_STEP[currentStep.key]);
    if (valid) setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  // The form's single submit button never changes its `type` attribute
  // between steps (it's always type="submit") so that pressing Enter can't
  // land on a newly-swapped submit button mid-keystroke. Instead this one
  // handler decides, on every submit event, whether to just advance to the
  // next step or actually send the application.
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isLastStep) {
      e.preventDefault();
      void goNext();
      return;
    }
    return form.handleSubmit(onSubmit)(e);
  }

  async function onSubmit(values: MembershipApplicationInput) {
    setIsSubmitting(true);
    setSubmitError(null);

    const res = await fetch("/api/membership-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      setSubmitError("Please check your details and try again.");
      setIsSubmitting(false);
      return;
    }

    setDone(true);
    setIsSubmitting(false);
  }

  if (done) {
    return (
      <Card className="overflow-hidden rounded-3xl border-none shadow-card-hover">
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue via-brand-teal to-brand-gold" />
        <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <p className="max-w-sm text-lg font-bold text-brand-navy">{t("success")}</p>
        </CardContent>
      </Card>
    );
  }

  function fieldError(name: FieldPath<MembershipApplicationInput>) {
    return form.formState.errors[name] ? (
      <p className="text-xs font-medium text-red-600">{t("requiredError")}</p>
    ) : null;
  }

  function TextField({
    name,
    label,
    type = "text",
  }: {
    name: FieldPath<MembershipApplicationInput>;
    label: string;
    type?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Input id={name} type={type} {...form.register(name)} />
        {fieldError(name)}
      </div>
    );
  }

  function SelectField({
    name,
    label,
    options,
  }: {
    name: FieldPath<MembershipApplicationInput>;
    label: string;
    options: string[];
  }) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <Select value={(field.value as string) ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id={name}>
                <SelectValue placeholder={t("selectPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {fieldError(name)}
      </div>
    );
  }

  function QuickPickField({
    name,
    label,
    suggestions,
  }: {
    name: FieldPath<MembershipApplicationInput>;
    label: string;
    suggestions: string[];
  }) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <QuickPickInput
              id={name}
              value={(field.value as string) ?? ""}
              onChange={field.onChange}
              suggestions={suggestions}
            />
          )}
        />
        {fieldError(name)}
      </div>
    );
  }

  function TermsField({ name, label }: { name: FieldPath<MembershipApplicationInput>; label: string }) {
    return (
      <div className="space-y-1.5">
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
              <input
                type="checkbox"
                checked={(field.value as boolean) ?? false}
                onChange={(e) => field.onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              />
              <span className="text-sm text-brand-navy/80">{label}</span>
            </label>
          )}
        />
        {form.formState.errors[name] ? (
          <p className="text-xs font-medium text-red-600">{t("termsError")}</p>
        ) : null}
      </div>
    );
  }

  function RadioField({
    name,
    label,
    options,
  }: {
    name: FieldPath<MembershipApplicationInput>;
    label: string;
    options: Array<{ value: string; label: string }>;
  }) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <RadioCardGroup
              name={field.name}
              value={(field.value as string) ?? ""}
              onChange={field.onChange}
              options={options}
            />
          )}
        />
        {fieldError(name)}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-none shadow-card-hover">
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-blue via-brand-teal to-brand-gold" />
      <CardContent className="pt-8">
        <Stepper steps={steps.map((s) => s.title)} currentStep={stepIndex} />
        <p className="-mt-3 mb-6 text-xs font-medium text-muted-foreground sm:hidden">
          {t("stepOf", { current: stepIndex + 1, total: steps.length })}
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {submitError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>
          )}

          <div key={currentStep.key} className="animate-in fade-in slide-in-from-right-3 duration-300">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <StepIcon className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold text-brand-navy">{currentStep.title}</h2>
            </div>

            {currentStep.key === "membership" && (
              <div className="space-y-4">
                <RadioField
                  name="membershipStatus"
                  label={t("membershipStatusLabel")}
                  options={membershipStatusValues.map((v) => ({
                    value: v,
                    label: t(v === "NEW_MEMBER" ? "newMember" : "formerMember"),
                  }))}
                />
                {membershipStatus === "FORMER_MEMBER" && (
                  <SelectField
                    name="formerMemberYear"
                    label={t("formerMemberYear")}
                    options={MEMBER_YEAR_OPTIONS}
                  />
                )}
              </div>
            )}

            {currentStep.key === "personal" && (
              <div className="space-y-4">
                <TextField name="fullNameKhmer" label={t("fullNameKhmer")} />
                <TextField name="fullNameEnglish" label={t("fullNameEnglish")} />
                <RadioField
                  name="title"
                  label={t("titleLabel")}
                  options={titleValues.map((v) => ({ value: v, label: t(TITLE_KEYS[v]) }))}
                />
                <QuickPickField
                  name="nationality"
                  label={t("nationality")}
                  suggestions={t.raw("nationalitySuggestions") as string[]}
                />
                <RadioField
                  name="gender"
                  label={t("genderLabel")}
                  options={genderValues.map((v) => ({ value: v, label: t(GENDER_KEYS[v]) }))}
                />
                <TextField name="dateOfBirth" label={t("dateOfBirth")} type="date" />
                <TextField name="phone" label={t("phone")} />
                <TextField name="email" label={t("email")} type="email" />
                <RadioField
                  name="occupation"
                  label={t("occupationLabel")}
                  options={occupationValues.map((v) => ({ value: v, label: t(OCCUPATION_KEYS[v]) }))}
                />
              </div>
            )}

            {currentStep.key === "student" && (
              <div className="space-y-4">
                <TextField name="schoolName" label={t("schoolName")} />
              </div>
            )}

            {currentStep.key === "employee" && (
              <div className="space-y-4">
                <TextField name="companyName" label={t("employeeCompanyName")} />
                <QuickPickField
                  name="companyIndustry"
                  label={t("companyIndustry")}
                  suggestions={t.raw("industrySuggestions") as string[]}
                />
                <QuickPickField
                  name="department"
                  label={t("department")}
                  suggestions={t.raw("departmentSuggestions") as string[]}
                />
              </div>
            )}

            {currentStep.key === "business" && (
              <div className="space-y-4">
                <TextField name="companyName" label={t("businessCompanyName")} />
                <QuickPickField
                  name="companyIndustry"
                  label={t("companyIndustry")}
                  suggestions={t.raw("industrySuggestions") as string[]}
                />
              </div>
            )}

            {currentStep.key === "final" && (
              <div className="space-y-4">
                <RadioField
                  name="referralSource"
                  label={t("referralSourceLabel")}
                  options={referralSourceValues.map((v) => ({ value: v, label: t(REFERRAL_KEYS[v]) }))}
                />
                <RadioField
                  name="supportArea"
                  label={t("supportAreaLabel")}
                  options={supportAreaValues.map((v) => ({ value: v, label: t(SUPPORT_KEYS[v]) }))}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="expectations">{t("expectations")}</Label>
                  <Textarea id="expectations" {...form.register("expectations")} />
                  {fieldError("expectations")}
                </div>
                <TermsField name="agreeToTerms" label={t("termsLabel")} />
              </div>
            )}
          </div>

          <div className={cn("flex items-center gap-3 pt-4", stepIndex === 0 ? "justify-end" : "justify-between")}>
            {stepIndex > 0 && (
              <Button type="button" variant="ghost" onClick={goBack}>
                <ChevronLeft className="h-4 w-4" />
                {t("back")}
              </Button>
            )}

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLastStep ? t("submit") : t("next")}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
