export interface RoleDescription {
  min: number;
  max: number;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  descriptions: RoleDescription[];
}

export const roles: Role[] = [
  {
    id: "ad-campaign-managers",
    name: "Ad Campaign Managers",
    descriptions: [
      { min: 1, max: 20, description: "Basic campaign setup & monitoring" },
      { min: 21, max: 80, description: "Full campaign management with A/B testing" },
      { min: 81, max: 150, description: "Multi-platform campaign strategy & optimization" },
      { min: 151, max: 250, description: "Enterprise-level ad management with dedicated oversight" },
    ],
  },
  {
    id: "administrative-assistants",
    name: "Administrative Assistants",
    descriptions: [
      { min: 1, max: 20, description: "Email management & basic scheduling" },
      { min: 21, max: 80, description: "Full calendar management & correspondence" },
      { min: 81, max: 150, description: "Complete admin support with process documentation" },
      { min: 151, max: 250, description: "Dedicated admin support with team coordination" },
    ],
  },
  {
    id: "automation-engineers",
    name: "Automation Engineers",
    descriptions: [
      { min: 1, max: 20, description: "Basic workflow automation setup" },
      { min: 21, max: 80, description: "Custom integrations & multi-step automations" },
      { min: 81, max: 150, description: "Full systems automation & maintenance" },
      { min: 151, max: 250, description: "Enterprise automation architecture & continuous optimization" },
    ],
  },
  {
    id: "bookkeepers",
    name: "Bookkeepers",
    descriptions: [
      { min: 1, max: 20, description: "Monthly reconciliation & basic entries" },
      { min: 21, max: 80, description: "Full bookkeeping with reporting" },
      { min: 81, max: 150, description: "Comprehensive financial management" },
      { min: 151, max: 250, description: "Complete financial operations with forecasting" },
    ],
  },
  {
    id: "copywriters",
    name: "Copywriters",
    descriptions: [
      { min: 1, max: 20, description: "Blog posts & basic content" },
      { min: 21, max: 80, description: "Full content calendar & multi-format writing" },
      { min: 81, max: 150, description: "Brand voice development & content strategy" },
      { min: 151, max: 250, description: "Complete content operations with editorial management" },
    ],
  },
  {
    id: "crm-admins",
    name: "CRM Admins",
    descriptions: [
      { min: 1, max: 20, description: "Basic CRM setup & data entry" },
      { min: 21, max: 80, description: "Pipeline optimization & reporting" },
      { min: 81, max: 150, description: "Full CRM management & integrations" },
      { min: 151, max: 250, description: "Enterprise CRM strategy & team training" },
    ],
  },
  {
    id: "customer-success-managers",
    name: "Customer Success Managers",
    descriptions: [
      { min: 1, max: 20, description: "Basic customer check-ins" },
      { min: 21, max: 80, description: "Proactive account management" },
      { min: 81, max: 150, description: "Full customer lifecycle management" },
      { min: 151, max: 250, description: "Strategic accounts with expansion planning" },
    ],
  },
  {
    id: "grant-writers",
    name: "Grant Writers",
    descriptions: [
      { min: 1, max: 20, description: "Grant research & basic applications" },
      { min: 21, max: 80, description: "Full grant writing & submission" },
      { min: 81, max: 150, description: "Grant strategy with multiple applications" },
      { min: 151, max: 250, description: "Complete grant operations & compliance tracking" },
    ],
  },
  {
    id: "paralegals",
    name: "Paralegals",
    descriptions: [
      { min: 1, max: 20, description: "Document preparation & filing" },
      { min: 21, max: 80, description: "Legal research & case support" },
      { min: 81, max: 150, description: "Full paralegal support with multiple matters" },
      { min: 151, max: 250, description: "Comprehensive legal operations support" },
    ],
  },
  {
    id: "real-estate-coordinators",
    name: "Real Estate Coordinators",
    descriptions: [
      { min: 1, max: 20, description: "Transaction coordination basics" },
      { min: 21, max: 80, description: "Full transaction management" },
      { min: 81, max: 150, description: "Multiple transaction oversight" },
      { min: 151, max: 250, description: "Complete real estate operations management" },
    ],
  },
  {
    id: "seo-specialists",
    name: "SEO, GEO, AEO Specialists",
    descriptions: [
      { min: 1, max: 20, description: "Basic keyword research & on-page SEO" },
      { min: 21, max: 80, description: "Technical SEO & content optimization" },
      { min: 81, max: 150, description: "Full SEO strategy & link building" },
      { min: 151, max: 250, description: "Enterprise SEO with competitive analysis" },
    ],
  },
  {
    id: "social-media-managers",
    name: "Social Media Managers",
    descriptions: [
      { min: 1, max: 20, description: "Basic posting & engagement" },
      { min: 21, max: 80, description: "Full social calendar & community management" },
      { min: 81, max: 150, description: "Multi-platform strategy & analytics" },
      { min: 151, max: 250, description: "Complete social operations with influencer outreach" },
    ],
  },
  {
    id: "video-editors",
    name: "Video Editors",
    descriptions: [
      { min: 1, max: 20, description: "Basic cuts & simple edits" },
      { min: 21, max: 80, description: "Full video production with graphics" },
      { min: 81, max: 150, description: "Multi-video production with brand consistency" },
      { min: 151, max: 250, description: "Complete video operations with content repurposing" },
    ],
  },
  {
    id: "web-developers",
    name: "Web Developers",
    descriptions: [
      { min: 1, max: 20, description: "Minor updates & bug fixes" },
      { min: 21, max: 80, description: "Feature development & integrations" },
      { min: 81, max: 150, description: "Full website management & optimization" },
      { min: 151, max: 250, description: "Complete web operations with architecture planning" },
    ],
  },
];

export interface PlanTier {
  name: string;
  minHours: number;
  maxHours: number;
  price: number | null;
  priceLabel: string;
}

export const planTiers: PlanTier[] = [
  { name: "Essentials", minHours: 1, maxHours: 39, price: 497, priceLabel: "$497/mo" },
  { name: "Emerge", minHours: 40, maxHours: 99, price: 1197, priceLabel: "$1,197/mo" },
  { name: "Expansion", minHours: 100, maxHours: 199, price: 2497, priceLabel: "$2,497/mo" },
  { name: "Elite", minHours: 200, maxHours: 299, price: 4997, priceLabel: "$4,997/mo" },
  { name: "Enterprise", minHours: 300, maxHours: Infinity, price: null, priceLabel: "Custom" },
];

export const getPlanUrl = (planName: string): string => {
  const planUrls: Record<string, string> = {
    "Essentials": "/plans/essentials",
    "Emerge": "/plans/emerge",
    "Expansion": "/plans/expansion",
    "Elite": "/plans/elite",
    "Enterprise": "/plans/enterprise",
  };
  return planUrls[planName] || "/plans/essentials";
};

export const getRecommendedPlan = (totalHours: number): PlanTier | null => {
  if (totalHours < 40) return null; // Don't show Essentials, require 40+ hours for a plan
  return planTiers.find(tier => totalHours >= tier.minHours && totalHours <= tier.maxHours) || planTiers[planTiers.length - 1];
};

export const getRoleDescription = (role: Role, hours: number): string | null => {
  if (hours === 0) return null;
  const desc = role.descriptions.find(d => hours >= d.min && hours <= d.max);
  return desc?.description || null;
};
