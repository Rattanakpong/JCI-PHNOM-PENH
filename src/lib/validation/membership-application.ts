import { z } from "zod";

export const membershipStatusValues = ["NEW_MEMBER", "FORMER_MEMBER"] as const;
export const titleValues = ["MR", "MS", "MRS", "DR", "OTHER"] as const;
export const genderValues = ["MALE", "FEMALE", "OTHER"] as const;
export const occupationValues = ["BUSINESS_OWNER", "EMPLOYEE", "STUDENT", "OTHER"] as const;
export const referralSourceValues = ["FRIENDS_FAMILY", "COLLEAGUE", "SOCIAL_MEDIA", "OTHER"] as const;
export const supportAreaValues = [
  "SHARE_EXPERTISE",
  "PROJECT_ORGANIZER",
  "PROMOTE_SPONSORSHIP",
  "OTHER",
] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

// Conditional requirements (former-member year, and the student/employee/
// business-owner follow-ups) are enforced in superRefine below rather than
// with plain .min() so every branch shares one schema — both the client
// form and the API route import this same object, so they can never drift.
export const membershipApplicationSchema = z
  .object({
    membershipStatus: z.enum(membershipStatusValues),
    formerMemberYear: optionalText(20),
    fullNameKhmer: z.string().trim().min(2).max(120),
    fullNameEnglish: z.string().trim().min(2).max(120),
    title: z.enum(titleValues),
    nationality: z.string().trim().min(2).max(80),
    gender: z.enum(genderValues),
    occupation: z.enum(occupationValues),
    schoolName: optionalText(160),
    companyName: optionalText(160),
    companyIndustry: optionalText(200),
    department: optionalText(160),
    dateOfBirth: z.string().min(1),
    phone: z.string().trim().min(5).max(40),
    email: z.string().trim().email(),
    referralSource: z.enum(referralSourceValues),
    supportArea: z.enum(supportAreaValues),
    expectations: optionalText(2000),
    agreeToTerms: z.boolean().refine((v) => v === true, { message: "Required" }),
  })
  .superRefine((data, ctx) => {
    if (data.membershipStatus === "FORMER_MEMBER" && !data.formerMemberYear) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["formerMemberYear"], message: "Required" });
    }
    if (data.occupation === "STUDENT" && !data.schoolName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["schoolName"], message: "Required" });
    }
    if (data.occupation === "EMPLOYEE" || data.occupation === "BUSINESS_OWNER") {
      if (!data.companyName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyName"], message: "Required" });
      }
      if (!data.companyIndustry) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["companyIndustry"], message: "Required" });
      }
    }
    if (data.occupation === "EMPLOYEE" && !data.department) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["department"], message: "Required" });
    }
  });

export type MembershipApplicationInput = z.infer<typeof membershipApplicationSchema>;
