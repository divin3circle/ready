export type EventType = "wedding" | "interview" | "graduation" | "gala"

export type Undertone = "warm" | "cool" | "neutral" | "olive"

export type MetricKey =
  | "moisture"
  | "oiliness"
  | "redness"
  | "texture"
  | "pores"
  | "darkCircles"
  | "radiance"
  | "spots"

export interface SkinMetric {
  key: MetricKey
  label: string
  score: number // 0 - 100 (higher = healthier / better condition)
  targetByEvent: number // Projected score by event day
  concernLevel: "optimal" | "mild" | "moderate" | "priority"
  zone: "T-Zone" | "Cheeks" | "Periorbital" | "Full Face"
  plainSummary: string
  whatItMeans: string
  activeIngredient: string
}

export interface SkinScanResult {
  scanId: string
  stage: "baseline" | "midpoint" | "final"
  timestamp: string
  label: string // e.g. "Day 1 Baseline" or "Week 4 Midpoint Check-in"
  overallScore: number
  skinAge: number
  skinTone: string
  skinToneHex: string
  undertone: Undertone
  skinType: string
  metrics: SkinMetric[]
  topConcerns: MetricKey[]
  summaryHeadline: string
  summaryParagraph: string
  dermatologistReferral?: string
  imageDataUrl?: string
  source: "youcam-live" | "youcam-cached" | "calibrated-simulation"
  unitsConsumed: number
  cacheHit: boolean
}

export interface OutfitOption {
  id: string
  name: string
  category: EventType | "all"
  designerTag: string
  fabricAndCut: string
  primaryColor: string
  primaryHex: string
  secondaryHex: string
  accentHex: string
  recommendedUndertones: Undertone[]
  imageUrl: string
  garmentOverlaySvg: "emerald-midi" | "champagne-gown" | "navy-blazer" | "terracotta-suit" | "custom"
  styleNotes: string
}

export interface MakeupPrescription {
  id: string
  lookName: string
  vibeTag: string
  baseFinish: "Soft-Matte Velvet" | "Luminous Satin" | "Sheer Dewy Skin-Tint" | "High-Definition Natural"
  foundationShade: string
  foundationHex: string
  primerStrategy: string
  lipShadeName: string
  lipHex: string
  lipFinish: string
  cheekShadeName: string
  cheekHex: string
  eyeShadowName: string
  eyeHex: string
  whyItWorksWithSkin: string[]
  whyItWorksWithOutfit: string
}

export interface VTOLookResult {
  id: string
  outfit: OutfitOption
  makeup: MakeupPrescription
  alternateMakeup: MakeupPrescription
  selectedVariant: "primary" | "alternate"
  confidenceScore: number
  source: "youcam-live" | "youcam-cached" | "calibrated-simulation"
  unitsConsumed: number
  createdAt: string
}

export interface PlanTask {
  id: string
  title: string
  timing: "AM" | "PM" | "Weekly" | "Prep"
  category: "cleanse" | "hydrate" | "treat" | "protect" | "lifestyle" | "styling"
  whyThisTask: string
  completed: boolean
}

export interface PlanWeek {
  weekNumber: number
  title: string
  phaseName: string
  dateRangeLabel: string
  biologicalFocus: string
  cautionNote: string
  isCurrentWeek: boolean
  isMilestoneCheckIn: boolean
  tasks: PlanTask[]
}

export interface ShoppingItem {
  id: string
  productType: string
  keyIngredients: string
  targetConcern: string
  usageTiming: "AM" | "PM" | "AM & PM" | "2x Weekly"
  whyNeeded: string
  priceTier: "$" | "$$" | "$$$"
  retailerSearchUrl: string
}

export interface CountdownPlan {
  id: string
  generatedAt: string
  agentSummary: string
  biologicalGuardrail: string
  weeks: PlanWeek[]
  shoppingList: ShoppingItem[]
  checkInDates: {
    midpointDate: string
    finalPrepDate: string
  }
  adaptationNote?: string
  source: "gemini-agent" | "esthetician-engine"
}

export interface EventCountdownState {
  eventName: string
  eventType: EventType
  eventDate: string // YYYY-MM-DD
  eventRole: string
  daysRemaining: number
  weeksRemaining: number
  consentGranted: boolean
  isAdultConfirmed: boolean
  activeTimelineStage: "baseline" | "midpoint" | "final"
  scans: SkinScanResult[]
  selectedLook: VTOLookResult | null
  comparisonLook: VTOLookResult | null
  plan: CountdownPlan | null
  unitBudget: {
    totalAllocated: number
    usedUnits: number
    savedByCache: number
  }
}

export type AppStep =
  | "landing" // S1
  | "setup" // S2
  | "scan" // S3 + S4 (Consent + Live Camera / Upload)
  | "skin-summary" // S5
  | "look-studio" // S6 + S7 (VTO Look Picker + Side-by-Side Comparison)
  | "dashboard" // S8 + S9 (Plan Overview + Daily Countdown Dashboard)
  | "check-in" // S10 + S11 (Milestone Re-Scan + Before/After Slider + Timeline)
  | "share" // S12 (Shareable Plan Card with Privacy Toggles)
  | "settings" // S13 (API Keys, Unit Budget, 1-Click Data Deletion)
