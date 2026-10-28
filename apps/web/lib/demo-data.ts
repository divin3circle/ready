import type {
  CountdownPlan,
  EventType,
  MakeupPrescription,
  MetricKey,
  OutfitOption,
  PlanWeek,
  ShoppingItem,
  SkinMetric,
  SkinScanResult,
  Undertone,
  VTOLookResult,
} from "./types"

export const CURATED_OUTFITS: OutfitOption[] = [
  {
    id: "emerald-silk-midi",
    name: "Emerald Bias-Cut Silk Midi",
    category: "wedding",
    designerTag: "Atelier Verbena • Evening Edit",
    fabricAndCut: "100% Mulberry charmeuse silk, cowl neckline, high sheen",
    primaryColor: "Deep Botanical Emerald",
    primaryHex: "#144A39",
    secondaryHex: "#C9A96E",
    accentHex: "#B84A5A",
    recommendedUndertones: ["warm", "neutral", "olive"],
    imageUrl:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    garmentOverlaySvg: "emerald-midi",
    styleNotes:
      "High-luster emerald reflects cool green light upward onto the jawline—requires redness neutralization around the nose/cheeks and a warm satin lip so skin never looks washed out.",
  },
  {
    id: "champagne-satin-gown",
    name: "Champagne Draped Column Gown",
    category: "gala",
    designerTag: "Maison Solène • Black Tie",
    fabricAndCut: "Liquid pearl duchesse satin, structured boat neck",
    primaryColor: "Warm Champagne Gold",
    primaryHex: "#D8C3A5",
    secondaryHex: "#8E735B",
    accentHex: "#9E3B42",
    recommendedUndertones: ["warm", "cool", "neutral"],
    imageUrl:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
    garmentOverlaySvg: "champagne-gown",
    styleNotes:
      "Champagne tones blend close to light-medium skin tones; requires controlled T-zone shine so skin looks intentionally luminous rather than oily next to satin fabric.",
  },
  {
    id: "navy-tailored-blazer",
    name: "Architectural Navy Wool Blazer Set",
    category: "interview",
    designerTag: "Studio Kvadrat • Camera-Ready",
    fabricAndCut: "Super 130s matte virgin wool, sharp lapel, ivory silk cami",
    primaryColor: "Midnight Admiral Navy",
    primaryHex: "#1B2838",
    secondaryHex: "#E8E2D5",
    accentHex: "#C25953",
    recommendedUndertones: ["cool", "neutral", "warm"],
    imageUrl:
      "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=900&q=85",
    garmentOverlaySvg: "navy-blazer",
    styleNotes:
      "Deep navy emphasizes under-eye shadows under studio or Zoom lighting. Priorities are periorbital brightening, pore-blurring micro-powder, and a crisp neutral-rose lip.",
  },
  {
    id: "terracotta-linen-suit",
    name: "Terracotta Silk-Linen Two-Piece",
    category: "graduation",
    designerTag: "Casa Ora • Daylight Editorial",
    fabricAndCut: "Woven raw silk & Belgian linen, tailored waist",
    primaryColor: "Sunbaked Terracotta",
    primaryHex: "#B85D43",
    secondaryHex: "#F0E5D8",
    accentHex: "#A84232",
    recommendedUndertones: ["warm", "olive", "neutral"],
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    garmentOverlaySvg: "terracotta-suit",
    styleNotes:
      "Warm terracotta amplifies natural golden undertones in outdoor daylight photos, but will accentuate facial flushing if cheek redness is left unbuffered.",
  },
]

export const BASELINE_SKIN_SCAN: SkinScanResult = {
  scanId: "scan-baseline-001",
  stage: "baseline",
  timestamp: new Date().toISOString(),
  label: "Day 1 Baseline Scan",
  overallScore: 71,
  skinAge: 27,
  skinTone: "Warm Golden Beige (Fitzpatrick III)",
  skinToneHex: "#D5A787",
  undertone: "warm",
  skinType: "Combination • Dehydrated Surface with Oily T-Zone",
  topConcerns: ["moisture", "redness", "oiliness"],
  summaryHeadline: "Good structural bounce, but barrier dehydration is triggering T-zone shine and cheek redness.",
  summaryParagraph:
    "YouCam Skin AI detected a classic event-prep mismatch: your skin barrier is slightly dehydrated (62/100), causing your T-zone sebaceous glands to overcompensate with excess oil (59/100) and mild perinasal redness (66/100). With 6 weeks until the wedding, we have enough biological turnover time to calm redness and raise moisture before event day.",
  source: "youcam-cached",
  unitsConsumed: 0,
  cacheHit: true,
  metrics: [
    {
      key: "moisture",
      label: "Deep Hydration",
      score: 62,
      targetByEvent: 84,
      concernLevel: "priority",
      zone: "Cheeks",
      plainSummary: "Surface dehydration across outer cheeks",
      whatItMeans:
        "Low stratum corneum water content makes foundation cling to micro-flakes after 3 hours of wear.",
      activeIngredient: "Multi-weight Hyaluronic Acid + Beta-Glucan + Ceramide NP",
    },
    {
      key: "oiliness",
      label: "Sebum Balance",
      score: 59,
      targetByEvent: 79,
      concernLevel: "priority",
      zone: "T-Zone",
      plainSummary: "Reactive T-zone shine across forehead and nose bridge",
      whatItMeans:
        "Flash photography reflects off excess sebum on the center forehead; balancing hydration reduces rebound oil.",
      activeIngredient: "4% Niacinamide + Zinc PCA",
    },
    {
      key: "redness",
      label: "Redness & Reactivity",
      score: 66,
      targetByEvent: 83,
      concernLevel: "moderate",
      zone: "Cheeks",
      plainSummary: "Mild vascular flushing around nose alae and mid-cheek",
      whatItMeans:
        "Green-toned outfits (like emerald silk) create complementary color contrast that makes cheek redness appear stronger.",
      activeIngredient: "10% Azelaic Acid + Centella Asiatica (Cica)",
    },
    {
      key: "texture",
      label: "Surface Smoothness",
      score: 72,
      targetByEvent: 86,
      concernLevel: "mild",
      zone: "Full Face",
      plainSummary: "Mild congestion along jawline and chin",
      whatItMeans:
        "Gentle chemical exfoliation in Weeks 1–4 will smooth micro-relief so satin makeup glides evenly.",
      activeIngredient: "5% Lactic Acid / PHA (2x weekly, paused 7 days pre-event)",
    },
    {
      key: "pores",
      label: "Pore Refinement",
      score: 70,
      targetByEvent: 82,
      concernLevel: "mild",
      zone: "T-Zone",
      plainSummary: "Visible pores on inner cheek next to nose",
      whatItMeans:
        "Keeping pores clear of oxidized sebum allows a blurring primer to sit invisibly on event day.",
      activeIngredient: "BHA 0.5% + Niacinamide",
    },
    {
      key: "darkCircles",
      label: "Periorbital Brightness",
      score: 74,
      targetByEvent: 85,
      concernLevel: "mild",
      zone: "Periorbital",
      plainSummary: "Slight blue-violet vascular shadow at inner tear trough",
      whatItMeans:
        "Responds well to caffeine vasoconstriction and a peach-undertone corrector prior to concealer.",
      activeIngredient: "Caffeine 5% + EGCG Peptide Eye Serum",
    },
    {
      key: "radiance",
      label: "Luminosity & Tone",
      score: 76,
      targetByEvent: 89,
      concernLevel: "optimal",
      zone: "Full Face",
      plainSummary: "Healthy baseline glow with minor post-summer dullness",
      whatItMeans:
        "Morning antioxidant protection will brighten overall reflectance for outdoor golden-hour photos.",
      activeIngredient: "Vitamin C (THD Ascorbate 10%) + Ferulic Acid",
    },
    {
      key: "spots",
      label: "Pigment Uniformity",
      score: 83,
      targetByEvent: 88,
      concernLevel: "optimal",
      zone: "Full Face",
      plainSummary: "Minimal hyperpigmentation; strong UV defense baseline",
      whatItMeans:
        "Daily SPF 50 prevents latent UV spots from surfacing before the big day.",
      activeIngredient: "Broad-Spectrum SPF 50 PA++++ (Invisible Fluid)",
    },
  ],
}

export const MIDPOINT_SKIN_SCAN: SkinScanResult = {
  scanId: "scan-midpoint-002",
  stage: "midpoint",
  timestamp: new Date(Date.now() + 21 * 86400000).toISOString(),
  label: "Week 4 Milestone Check-In",
  overallScore: 83,
  skinAge: 24,
  skinTone: "Warm Golden Beige (Fitzpatrick III)",
  skinToneHex: "#D8AC8C",
  undertone: "warm",
  skinType: "Balanced Combination • Calm Barrier",
  topConcerns: ["pores", "darkCircles"],
  summaryHeadline: "Hydration jumped +19 pts and T-zone oiliness dropped significantly—unlocking a luminous satin event base!",
  summaryParagraph:
    "Your 4-week barrier protocol worked: deep moisture climbed from 62 → 81 and cheek redness calmed from 66 → 82. Because your T-zone is no longer overproducing oil, our Stylist Agent upgraded your Wedding Day VTO base from Soft-Matte Velvet to Luminous Satin so your skin catches golden-hour light without midday shine.",
  source: "youcam-cached",
  unitsConsumed: 0,
  cacheHit: true,
  metrics: [
    {
      key: "moisture",
      label: "Deep Hydration",
      score: 81,
      targetByEvent: 86,
      concernLevel: "optimal",
      zone: "Cheeks",
      plainSummary: "+19 pts improvement • Plump stratum corneum water retention",
      whatItMeans:
        "Your skin barrier can now hold luminous satin foundation for 10+ hours without creasing.",
      activeIngredient: "Continue Ceramide NP + Polyglutamic Acid",
    },
    {
      key: "oiliness",
      label: "Sebum Balance",
      score: 77,
      targetByEvent: 82,
      concernLevel: "optimal",
      zone: "T-Zone",
      plainSummary: "+18 pts improvement • Forehead sebum normalized",
      whatItMeans:
        "No heavy mattifying powder needed—only a whisper of micro-silica on the nasal bridge.",
      activeIngredient: "Maintain 4% Niacinamide AM",
    },
    {
      key: "redness",
      label: "Redness & Reactivity",
      score: 82,
      targetByEvent: 86,
      concernLevel: "optimal",
      zone: "Cheeks",
      plainSummary: "+16 pts improvement • Perinasal flushing resolved",
      whatItMeans:
        "Your Emerald Silk Midi dress will no longer pull pink tones out of your cheeks.",
      activeIngredient: "Azelaic Acid 10% + Centella maintenance",
    },
    {
      key: "texture",
      label: "Surface Smoothness",
      score: 84,
      targetByEvent: 88,
      concernLevel: "optimal",
      zone: "Full Face",
      plainSummary: "+12 pts improvement • Refined micro-relief across jawline",
      whatItMeans:
        "Reminder: Taper off exfoliating acids 7 days before the wedding to protect barrier integrity.",
      activeIngredient: "Final PHA session in Week 5, then pause",
    },
    {
      key: "pores",
      label: "Pore Refinement",
      score: 79,
      targetByEvent: 84,
      concernLevel: "mild",
      zone: "T-Zone",
      plainSummary: "+9 pts improvement • Clean, minimized inner-cheek pores",
      whatItMeans:
        "Use a targeted blurring balm only on the inner cheek triangle on event day.",
      activeIngredient: "Niacinamide + Salicylic 0.5%",
    },
    {
      key: "darkCircles",
      label: "Periorbital Brightness",
      score: 80,
      targetByEvent: 86,
      concernLevel: "mild",
      zone: "Periorbital",
      plainSummary: "+6 pts improvement • Reduced morning puffiness",
      whatItMeans:
        "Add chilled hydrogel eye masks 30 minutes before makeup application on event morning.",
      activeIngredient: "Caffeine Peptide Eye Gel + Chilled Cryo-spoons",
    },
    {
      key: "radiance",
      label: "Luminosity & Tone",
      score: 87,
      targetByEvent: 91,
      concernLevel: "optimal",
      zone: "Full Face",
      plainSummary: "+11 pts improvement • High natural light reflectance",
      whatItMeans:
        "Camera flash and outdoor sunlight will diffuse evenly across cheekbones.",
      activeIngredient: "Vitamin C + Ferulic AM",
    },
    {
      key: "spots",
      label: "Pigment Uniformity",
      score: 87,
      targetByEvent: 89,
      concernLevel: "optimal",
      zone: "Full Face",
      plainSummary: "+4 pts improvement • Even tone maintained",
      whatItMeans:
        "Spot concealing only needed on 1–2 pinpoint areas instead of full-face coverage.",
      activeIngredient: "SPF 50 PA++++ daily",
    },
  ],
}

export const FINAL_SKIN_SCAN: SkinScanResult = {
  ...MIDPOINT_SKIN_SCAN,
  scanId: "scan-final-003",
  stage: "final",
  label: "Event Eve Readiness Scan (48h Out)",
  overallScore: 89,
  skinAge: 23,
  summaryHeadline: "Event-Ready Peak: 89/100 Skin Score (+18 pts from Day 1). Active exfoliants locked out; pure hydration mode active.",
  summaryParagraph:
    "Your skin is at peak optical smoothness and hydration (87/100) with calm redness (87/100). For the next 48 hours, follow the Zero-New-Actives rule: only gentle cleansing, barrier ceramides, cryo eye de-puffing, and your pre-selected Luminous Satin VTO look.",
  metrics: MIDPOINT_SKIN_SCAN.metrics.map((m) => ({
    ...m,
    score: Math.min(94, m.targetByEvent + 1),
    concernLevel: "optimal",
  })),
}

export function buildLookForSkinAndOutfit(
  scan: SkinScanResult,
  outfit: OutfitOption
): VTOLookResult {
  const moistureScore = scan.metrics.find((m) => m.key === "moisture")?.score ?? 70
  const oilinessScore = scan.metrics.find((m) => m.key === "oiliness")?.score ?? 70
  const rednessScore = scan.metrics.find((m) => m.key === "redness")?.score ?? 70

  // Dynamic skin-driven base finish selection!
  // When oiliness is low-score (<68) or moisture is low, we prescribe Soft-Matte Velvet with hydrating grip.
  // Once check-in improves moisture/oiliness (>=75), it unlocks Luminous Satin!
  const isBalancedAndHydrated = moistureScore >= 75 && oilinessScore >= 72
  const needsRednessCorrection = rednessScore < 75

  const primaryMakeup: MakeupPrescription = {
    id: `makeup-${outfit.id}-primary-${scan.stage}`,
    lookName: isBalancedAndHydrated
      ? `Golden-Hour Luminous Satin (${outfit.primaryColor.split(" ").pop()} Edit)`
      : `Velvet Grip Soft-Matte (${outfit.primaryColor.split(" ").pop()} Edit)`,
    vibeTag: isBalancedAndHydrated
      ? "Unlocked by Week 4 Hydration Gain"
      : "Calibrated for Day 1 Oil & Redness Control",
    baseFinish: isBalancedAndHydrated ? "Luminous Satin" : "Soft-Matte Velvet",
    foundationShade:
      scan.undertone === "warm"
        ? "Shade 240W • Warm Honey Neutral"
        : scan.undertone === "cool"
          ? "Shade 210C • Cool Porcelain Rose"
          : "Shade 230N • Balanced Ivory Sand",
    foundationHex: scan.skinToneHex || "#D5A787",
    primerStrategy: needsRednessCorrection
      ? "Zone-Mapped Primer: Sheer mint-cica neutralizing base on mid-cheeks + pore-blurring silk on T-zone"
      : "Zone-Mapped Primer: Illuminating peptide gripping serum across cheekbones + micro-velvet on nasal bridge",
    lipShadeName:
      outfit.id === "emerald-silk-midi"
        ? "Spiced Rosewood Satin (#A64B52)"
        : outfit.id === "champagne-satin-gown"
          ? "Crushed Berry Velvet (#8C3444)"
          : outfit.id === "navy-tailored-blazer"
            ? "Warm Terracotta Rose (#B55852)"
            : "Toasted Cinnamon Silk (#A84B3B)",
    lipHex:
      outfit.id === "emerald-silk-midi"
        ? "#A64B52"
        : outfit.id === "champagne-satin-gown"
          ? "#8C3444"
          : outfit.id === "navy-tailored-blazer"
            ? "#B55852"
            : "#A84B3B",
    lipFinish: "Hydrating Cushioned Satin",
    cheekShadeName:
      scan.undertone === "warm" ? "Warm Apricot Fig (#C96E5B)" : "Soft Dusty Rose (#C46D7E)",
    cheekHex: scan.undertone === "warm" ? "#C96E5B" : "#C46D7E",
    eyeShadowName:
      outfit.id === "emerald-silk-midi"
        ? "Antique Champagne & Espresso Tightline"
        : "Burnished Bronze & Soft Taupe Wash",
    eyeHex: "#8C6D58",
    whyItWorksWithSkin: [
      isBalancedAndHydrated
        ? `Your Hydration (${moistureScore}/100) & Sebum Balance (${oilinessScore}/100) are now in the optimal zone—allowing a Luminous Satin finish that won't separate.`
        : `Because YouCam Skin AI scored T-Zone Sebum at ${oilinessScore}/100 and Hydration at ${moistureScore}/100, a Soft-Matte Velvet base controls flash bounce while ceramide prep prevents clinging.`,
      needsRednessCorrection
        ? `Cheek Redness (${rednessScore}/100) is buffered with a sheer green-cica color corrector before foundation so ${outfit.primaryColor} doesn't accentuate flushing.`
        : `Calm Cheek Redness (${rednessScore}/100) means you only need sheer skin-tint coverage, letting natural skin texture shine through.`,
      `Matched to your ${scan.undertone.toUpperCase()} undertone (${scan.skinTone}) with a peach-neutral under-eye corrector for tear-trough brightness.`,
    ],
    whyItWorksWithOutfit: outfit.styleNotes,
  }

  const alternateMakeup: MakeupPrescription = {
    id: `makeup-${outfit.id}-alt-${scan.stage}`,
    lookName: `Editorial Statement Lip & Glass Skin`,
    vibeTag: "High-Contrast Evening Alternative",
    baseFinish: "Sheer Dewy Skin-Tint",
    foundationShade: primaryMakeup.foundationShade,
    foundationHex: primaryMakeup.foundationHex,
    primerStrategy: "Full-face hydro-grip essence + targeted T-zone blotting powder",
    lipShadeName: "Deep Venetian Garnet (#7C2533)",
    lipHex: "#7C2533",
    lipFinish: "Blurred Velvet Matte",
    cheekShadeName: "Sculpted Sunlit Bronzer (#B67659)",
    cheekHex: "#B67659",
    eyeShadowName: "Clean Glossy Lid & Feathered Lash",
    eyeHex: "#A3826C",
    whyItWorksWithSkin: [
      `Uses high-contrast lip color to draw focus away from minor texture while keeping skin coverage ultra-light.`,
      `Requires blotting paper touch-ups every 2.5 hours if T-zone sebum score is below 70.`,
    ],
    whyItWorksWithOutfit: `Creates a dramatic editorial contrast against ${outfit.name}, ideal for evening reception lighting.`,
  }

  return {
    id: `vto-${outfit.id}-${scan.stage}`,
    outfit,
    makeup: primaryMakeup,
    alternateMakeup,
    selectedVariant: "primary",
    confidenceScore: 96,
    source: scan.source,
    unitsConsumed: 0,
    createdAt: new Date().toISOString(),
  }
}

export function generateDeterministicPlan(
  scan: SkinScanResult,
  eventName: string,
  eventType: EventType,
  daysRemaining: number,
  outfit: OutfitOption
): CountdownPlan {
  const weeksCount = Math.max(2, Math.min(8, Math.ceil(daysRemaining / 7)))
  const moisture = scan.metrics.find((m) => m.key === "moisture")?.score ?? 65
  const oiliness = scan.metrics.find((m) => m.key === "oiliness")?.score ?? 65
  const redness = scan.metrics.find((m) => m.key === "redness")?.score ?? 68

  const isUpdatedAfterCheckIn = scan.stage !== "baseline"

  const weeks: PlanWeek[] = []

  for (let w = 1; w <= weeksCount; w++) {
    const isFirstPhase = w <= Math.ceil(weeksCount * 0.35)
    const isFinalWeek = w === weeksCount
    const isMidpointWeek = w === Math.max(2, Math.ceil(weeksCount * 0.6))

    if (isFirstPhase) {
      weeks.push({
        weekNumber: w,
        title: `Week ${w}: Barrier Reset & Hydration Reservoir`,
        phaseName: "Phase 1 • Cellular Foundation",
        dateRangeLabel: `${Math.max(1, daysRemaining - (w - 1) * 7)} days out`,
        biologicalFocus:
          "Rebuild stratum corneum lipid bilayers so T-zone sebaceous glands stop over-secreting rebound oil.",
        cautionNote:
          "Introduce only one new product every 72 hours to monitor reactivity.",
        isCurrentWeek: scan.stage === "baseline" && w === 1,
        isMilestoneCheckIn: false,
        tasks: [
          {
            id: `w${w}-t1`,
            title: "AM: Amino-acid low-pH cleanse + 4% Niacinamide & Zinc serum",
            timing: "AM",
            category: "treat",
            whyThisTask: `Targets T-Zone Sebum score (${oiliness}/100) without stripping cheek moisture.`,
            completed: w === 1 || scan.stage !== "baseline",
          },
          {
            id: `w${w}-t2`,
            title: "AM: Invisible fluid SPF 50 PA++++ (2-finger rule)",
            timing: "AM",
            category: "protect",
            whyThisTask: "Prevents UV-induced erythema and protects pigment uniformity before photos.",
            completed: w === 1 || scan.stage !== "baseline",
          },
          {
            id: `w${w}-t3`,
            title: "PM: Double-layer Beta-Glucan + Ceramide NP barrier cream on damp cheeks",
            timing: "PM",
            category: "hydrate",
            whyThisTask: `Directly lifts Deep Hydration (${moisture}/100) so makeup won't cling to dry patches.`,
            completed: scan.stage !== "baseline",
          },
        ],
      })
    } else if (!isFinalWeek) {
      weeks.push({
        weekNumber: w,
        title: isMidpointWeek
          ? `Week ${w}: Milestone Check-In & Tone Calibration`
          : `Week ${w}: Redness Neutralization & Micro-Texture Polish`,
        phaseName: isMidpointWeek
          ? "Phase 2 • YouCam AI Progress Check-In"
          : "Phase 2 • Targeted Refinement",
        dateRangeLabel: `${Math.max(7, daysRemaining - (w - 1) * 7)} days out`,
        biologicalFocus:
          "Accelerate keratinocyte turnover with gentle PHA/Lactic acid and calm vascular cheek redness with Azelaic Acid.",
        cautionNote: isMidpointWeek
          ? "Run your Midpoint YouCam Skin Scan this week to recalibrate your event-day foundation finish."
          : "Never layer exfoliating acids on the same night as retinoids.",
        isCurrentWeek: scan.stage === "midpoint" && isMidpointWeek,
        isMilestoneCheckIn: isMidpointWeek,
        tasks: [
          {
            id: `w${w}-t1`,
            title: "PM (Tue/Fri): 5% Lactic Acid + PHA resurfacing toner",
            timing: "Weekly",
            category: "treat",
            whyThisTask: "Polishes jawline texture so satin base reflects light evenly.",
            completed: scan.stage === "final" || (scan.stage === "midpoint" && w < 4),
          },
          {
            id: `w${w}-t2`,
            title: `AM & PM: 10% Azelaic Acid + Centella spot serum on cheeks & nose alae`,
            timing: "PM",
            category: "treat",
            whyThisTask: `Calms vascular redness (${redness}/100) to harmonize with your ${outfit.name}.`,
            completed: scan.stage === "final",
          },
          {
            id: `w${w}-t3`,
            title: isMidpointWeek
              ? "Milestone: Complete Midpoint YouCam Skin AI Re-Scan & VTO Finish Audit"
              : "AM: Caffeine 5% + Peptide periorbital eye serum with lymphatic sweep",
            timing: isMidpointWeek ? "Prep" : "AM",
            category: isMidpointWeek ? "styling" : "hydrate",
            whyThisTask: isMidpointWeek
              ? "Measures 21-day barrier recovery and unlocks Luminous Satin VTO finish."
              : "Brightens inner tear trough shadows before photography.",
            completed: scan.stage === "final" || (scan.stage === "midpoint" && isMidpointWeek),
          },
        ],
      })
    } else {
      weeks.push({
        weekNumber: w,
        title: `Week ${w}: Event Week Lock-In (Zero New Actives)`,
        phaseName: "Phase 3 • Peak Optical Readiness",
        dateRangeLabel: "Final 7 Days",
        biologicalFocus:
          "LOCKOUT PROTOCOL: Stop all exfoliating acids & retinoids 7 days out. Focus 100% on water-binding humectants, cryo de-puffing, and VTO primer rehearsal.",
        cautionNote:
          "CRITICAL: Do not wax, thread, or test unfamiliar actives within 5 days of the event.",
        isCurrentWeek: scan.stage === "final",
        isMilestoneCheckIn: true,
        tasks: [
          {
            id: `w${w}-t1`,
            title: "STOP all AHA/BHA/Retinoids 7 days before event",
            timing: "Prep",
            category: "protect",
            whyThisTask: "Prevents microscopic peeling under high-definition event photography.",
            completed: scan.stage === "final",
          },
          {
            id: `w${w}-t2`,
            title: "Night Before: Hydro-gel biocellulose sheet mask + elevated pillow sleep",
            timing: "PM",
            category: "hydrate",
            whyThisTask: "Maximizes corneocyte plumping and prevents morning periorbital fluid retention.",
            completed: false,
          },
          {
            id: `w${w}-t3`,
            title: `Event Morning: Zone-mapped primer + ${
              scan.stage !== "baseline" ? "Luminous Satin" : "Soft-Matte Velvet"
            } look matched to ${outfit.name}`,
            timing: "AM",
            category: "styling",
            whyThisTask: "Executes your connected YouCam Skin AI + VTO look prescription.",
            completed: false,
          },
        ],
      })
    }
  }

  const shoppingList: ShoppingItem[] = [
    {
      id: "shop-1",
      productType: "Barrier-Repair Ceramide & Beta-Glucan Cream",
      keyIngredients: "Ceramide NP, Cholesterol, Beta-Glucan, Squalane",
      targetConcern: `Deep Hydration (${moisture}/100 → Target 85)`,
      usageTiming: "AM & PM",
      whyNeeded: "Restores lipid matrix on outer cheeks so makeup sits smoothly without caking.",
      priceTier: "$$",
      retailerSearchUrl:
        "https://www.sephora.com/search?keyword=ceramide+barrier+cream",
    },
    {
      id: "shop-2",
      productType: "Oil-Balancing Niacinamide 4% + Zinc PCA Serum",
      keyIngredients: "4% Niacinamide, 1% Zinc PCA, Panthenol",
      targetConcern: `T-Zone Sebum (${oiliness}/100 → Target 80)`,
      usageTiming: "AM",
      whyNeeded: "Regulates forehead & nasal sebum output so camera flash never looks greasy.",
      priceTier: "$",
      retailerSearchUrl:
        "https://www.sephora.com/search?keyword=niacinamide+zinc+serum",
    },
    {
      id: "shop-3",
      productType: "Redness-Calming Azelaic Acid 10% Suspension",
      keyIngredients: "10% Azelaic Acid, Centella Asiatica (Madecassoside)",
      targetConcern: `Cheek Redness (${redness}/100) vs. ${outfit.primaryColor}`,
      usageTiming: "PM",
      whyNeeded: `Neutralizes cheek flushing so the ${outfit.primaryColor} fabric flatters your ${scan.undertone} undertone.`,
      priceTier: "$$",
      retailerSearchUrl:
        "https://www.sephora.com/search?keyword=azelaic+acid+redness+serum",
    },
    {
      id: "shop-4",
      productType: "Gentle Lactic Acid 5% + PHA Resurfacing Essence",
      keyIngredients: "5% Lactic Acid, Gluconolactone (PHA), Hyaluronic Acid",
      targetConcern: "Surface Smoothness & Jawline Texture",
      usageTiming: "2x Weekly",
      whyNeeded: "Polishes micro-texture during Weeks 1–4 without compromising barrier hydration.",
      priceTier: "$$",
      retailerSearchUrl:
        "https://www.sephora.com/search?keyword=lactic+acid+gentle+exfoliant",
    },
  ]

  const midpointOffsetDays = Math.max(3, Math.floor(daysRemaining * 0.5))
  const finalPrepOffsetDays = Math.max(1, daysRemaining - 2)

  const midpointDate = new Date(Date.now() + midpointOffsetDays * 86400000)
    .toISOString()
    .slice(0, 10)
  const finalPrepDate = new Date(Date.now() + finalPrepOffsetDays * 86400000)
    .toISOString()
    .slice(0, 10)

  return {
    id: `plan-${scan.scanId}-${outfit.id}`,
    generatedAt: new Date().toISOString(),
    agentSummary: isUpdatedAfterCheckIn
      ? `Check-In Adaptation for ${eventName}: Because your Hydration climbed +19 pts (to ${moisture}/100) and Redness calmed to ${redness}/100, we tapered down corrective actives early and upgraded your event-day VTO look to Luminous Satin to pair with the ${outfit.name}.`
      : `Personalized ${weeksCount}-Week Event Protocol for ${eventName}: Calibrated to lift cheek hydration (${moisture} → 85), regulate T-zone sebum (${oiliness} → 80), and neutralize cheek redness so your ${outfit.name} and ${scan.undertone}-undertone makeup look effortless in every photo.`,
    biologicalGuardrail:
      daysRemaining <= 10
        ? "Condensed Sprint Guardrail (<10 Days): Because epidermal turnover takes ~28 days, this plan avoids harsh exfoliants or retinoids that could trigger purging, focusing strictly on barrier hydration, vasoconstrictive de-puffing, and redness calming."
        : "Full Epidermal Cycle Guardrail: Weeks 1–4 leverage cellular turnover (Lactic/PHA + Azelaic Acid), followed by a strict 7-day 'Zero New Actives' lockout before event day so skin is calm, plump, and flake-free.",
    weeks,
    shoppingList,
    checkInDates: {
      midpointDate,
      finalPrepDate,
    },
    adaptationNote: isUpdatedAfterCheckIn
      ? "Routine automatically adjusted after Week 4 YouCam Skin AI Check-In: Reduced exfoliation frequency from 2x to 1x/week and unlocked Luminous Satin VTO finish."
      : undefined,
    source: "esthetician-engine",
  }
}

export interface DemoPersonaPreset {
  id: string
  personaName: string
  roleBadge: string
  eventName: string
  eventType: EventType
  daysOut: number
  defaultOutfitId: string
  description: string
}

export const DEMO_PERSONAS: DemoPersonaPreset[] = [
  {
    id: "wedding-guest",
    personaName: "Maya Lin",
    roleBadge: "Primary Demo Persona • Wedding Guest",
    eventName: "Sofia & Luca's Tuscan Garden Wedding",
    eventType: "wedding",
    daysOut: 42, // 6 weeks
    defaultOutfitId: "emerald-silk-midi",
    description:
      "6 weeks out • Combination skin with dehydrated cheeks & T-zone shine • Wearing an Emerald Bias-Cut Silk Midi.",
  },
  {
    id: "job-interview",
    personaName: "Jordan Vance",
    roleBadge: "Condensed Sprint • Executive Keynote",
    eventName: "Series B Founder Keynote & Press Portraits",
    eventType: "interview",
    daysOut: 10, // 10 days condensed plan
    defaultOutfitId: "navy-tailored-blazer",
    description:
      "10 days out • Needs fast under-eye brightening & studio flash control without risking skin purging.",
  },
  {
    id: "graduation-gala",
    personaName: "Elena Rostova",
    roleBadge: "Milestone Celebration • Gala Host",
    eventName: "Architecture Commencement & Evening Gala",
    eventType: "graduation",
    daysOut: 28, // 4 weeks
    defaultOutfitId: "champagne-satin-gown",
    description:
      "4 weeks out • Preparing for both outdoor daylight photos and evening reception lighting.",
  },
]
