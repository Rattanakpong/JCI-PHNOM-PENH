import type { ProjectPillar } from "@/lib/enums";

// Official JCI committee colors — kept distinct per pillar so a project's
// focus area is recognizable by color alone, matching the brand palette
// used in JCI Phnom Penh's own committee materials.
export const PILLAR_COLORS: Record<
  ProjectPillar,
  { hex: string; badgeClassName: string; dotClassName: string }
> = {
  BUSINESS_ENTREPRENEURSHIP: {
    hex: "#35B393",
    badgeClassName: "border-transparent bg-[#35B393]/15 text-[#1E7A61]",
    dotClassName: "bg-[#35B393]",
  },
  INDIVIDUAL_DEVELOPMENT: {
    hex: "#F3B323",
    badgeClassName: "border-transparent bg-[#F3B323]/20 text-[#8A6300]",
    dotClassName: "bg-[#F3B323]",
  },
  INTERNATIONAL_COOPERATION: {
    hex: "#0B92CD",
    badgeClassName: "border-transparent bg-[#0B92CD]/15 text-[#0B92CD]",
    dotClassName: "bg-[#0B92CD]",
  },
  COMMUNITY_IMPACT: {
    hex: "#2B59A2",
    badgeClassName: "border-transparent bg-[#2B59A2]/15 text-[#2B59A2]",
    dotClassName: "bg-[#2B59A2]",
  },
};
