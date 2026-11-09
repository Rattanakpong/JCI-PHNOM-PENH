// SQLite has no native enum type, so these columns are plain `String` in
// prisma/schema.prisma. These const objects + union types are the single
// source of truth for valid values in app code — switch back to real
// Prisma enums only if/when the datasource moves to Postgres.

export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  BOARD_ADMIN: "BOARD_ADMIN",
  EVENT_ORGANIZER: "EVENT_ORGANIZER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const RegistrationStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;
export type RegistrationStatus =
  (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  SUBMITTED: "SUBMITTED",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const SlideCategory = {
  NEWS: "NEWS",
  EVENT: "EVENT",
  SPONSOR: "SPONSOR",
  MEMBER: "MEMBER",
} as const;
export type SlideCategory = (typeof SlideCategory)[keyof typeof SlideCategory];

// The four official JCI pillars — every community project belongs to one.
export const ProjectPillar = {
  BUSINESS_ENTREPRENEURSHIP: "BUSINESS_ENTREPRENEURSHIP",
  INTERNATIONAL_COOPERATION: "INTERNATIONAL_COOPERATION",
  INDIVIDUAL_DEVELOPMENT: "INDIVIDUAL_DEVELOPMENT",
  COMMUNITY_IMPACT: "COMMUNITY_IMPACT",
} as const;
export type ProjectPillar = (typeof ProjectPillar)[keyof typeof ProjectPillar];
