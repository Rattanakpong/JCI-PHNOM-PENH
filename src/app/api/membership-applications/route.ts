import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { membershipApplicationSchema } from "@/lib/validation/membership-application";

export async function POST(request: Request) {
  const parsed = membershipApplicationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  await prisma.membershipApplication.create({
    data: {
      membershipStatus: data.membershipStatus,
      formerMemberYear: data.formerMemberYear || null,
      fullNameKhmer: data.fullNameKhmer,
      fullNameEnglish: data.fullNameEnglish,
      title: data.title,
      nationality: data.nationality,
      gender: data.gender,
      occupation: data.occupation,
      schoolName: data.schoolName || null,
      companyName: data.companyName || null,
      companyIndustry: data.companyIndustry || null,
      department: data.department || null,
      dateOfBirth: new Date(data.dateOfBirth),
      phone: data.phone,
      email: data.email,
      referralSource: data.referralSource,
      supportArea: data.supportArea,
      expectations: data.expectations || null,
      agreedToTerms: data.agreeToTerms,
    },
  });
  return NextResponse.json({ ok: true });
}
