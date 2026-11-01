"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Switch } from "@workspace/ui/components/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
  IconSparkles,
  IconCalendarEvent,
  IconCamera,
  IconHanger,
  IconChecklist,
  IconTimeline,
  IconShare,
  IconSettings,
  IconBolt,
  IconArrowRight,
  IconCheck,
  IconUpload,
  IconTrash,
  IconExternalLink,
  IconScale,
  IconShoppingBag,
  IconInfoCircle,
  IconChevronRight,
  IconLock,
  IconCrown,
} from "@tabler/icons-react"
import {
  BASELINE_SKIN_SCAN,
  buildLookForSkinAndOutfit,
  CURATED_OUTFITS,
  FINAL_SKIN_SCAN,
  generateDeterministicPlan,
  MIDPOINT_SKIN_SCAN,
} from "@/lib/demo-data"
import type {
  CountdownPlan,
  EventType,
  OutfitOption,
  SkinMetric,
  SkinScanResult,
  VTOLookResult,
  WardrobeGender,
} from "@/lib/types"
import LycorisSpecimen from "@/components/ui/lycoris-specimen"
import { AnalyticsBento } from "@/components/ui/analytics-bento"
import { VTOPortraitCanvas } from "./vto-portrait-canvas"
import { CameraScanner } from "./camera-scanner"
import { BeforeAfterSlider } from "./before-after-slider"
import { ShareCardBuilder } from "./share-card-builder"

type PrimaryView = "overview" | "scan" | "look" | "countdown" | "progress"
type OnboardingStep = 1 | 2 | 3

function getDefaultDateDaysOut(days: number): string {
  const d = new Date(Date.now() + days * 86400000)
  return d.toISOString().slice(0, 10)
}

const bell = (x: number, m: number, s: number) =>
  Math.exp(-(((x - m) / s) ** 2) / 2)
const hours = Array.from({ length: 25 }, (_, h) => h)
const hydrationWaves = [0, 1, 2].map((w) =>
  hours.map((h) =>
    Math.round(
      88 *
        (1 - w * 0.12) *
        (bell(h, 11 - w * 0.5, 4.2) * 0.92 + bell(h, 21, 3.0) * 0.35)
    )
  )
)
const sebumWaves = [0, 1, 2].map((w) =>
  hours.map((h) =>
    Math.round(
      84 *
        (1 - w * 0.14) *
        (bell(h, 19.5 - w * 0.4, 3.6) * 0.94 + bell(h, 8, 2.2) * 0.25)
    )
  )
)

export function ReadyApp() {
  const [view, setView] = React.useState<PrimaryView>("overview")

  // Onboarding & Paywall State (No pre-loaded dummy user data!)
  const [onboardingOpen, setOnboardingOpen] = React.useState(false)
  const [onboardingStep, setOnboardingStep] = React.useState<OnboardingStep>(1)
  const [isPro, setIsPro] = React.useState(false)

  // Modals & Sheets State
  const [eventDialogOpen, setEventDialogOpen] = React.useState(false)
  const [cameraDialogOpen, setCameraDialogOpen] = React.useState(false)
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [compareDialogOpen, setCompareDialogOpen] = React.useState(false)
  const [selectedMetric, setSelectedMetric] = React.useState<SkinMetric | null>(
    null
  )

  // Event State (Starts empty for a genuine 1st-time user loop)
  const [eventName, setEventName] = React.useState("")
  const [eventType, setEventType] = React.useState<EventType>("wedding")
  const [eventDate, setEventDate] = React.useState(() =>
    getDefaultDateDaysOut(42)
  )

  // Consent State
  const [consentGranted, setConsentGranted] = React.useState(true)
  const [isAdultConfirmed, setIsAdultConfirmed] = React.useState(true)

  // Timeline & Scans State (Starts empty: `[]` until user scans!)
  const [activeStage, setActiveStage] = React.useState<
    "baseline" | "midpoint" | "final"
  >("baseline")
  const [scans, setScans] = React.useState<SkinScanResult[]>([])
  const [isScanning, setIsScanning] = React.useState(false)

  // Wardrobe Gender & Outfits State (Defaults to Menswear so male users get tailored suits, not gowns!)
  const [selectedGender, setSelectedGender] =
    React.useState<WardrobeGender>("menswear")
  const [outfits, setOutfits] = React.useState<OutfitOption[]>(CURATED_OUTFITS)
  const [selectedOutfitId, setSelectedOutfitId] =
    React.useState<string>("mens-bespoke-tuxedo")
  const [compareOutfitId, setCompareOutfitId] = React.useState<string>(
    "mens-terracotta-linen-suit"
  )
  const [vtoLook, setVtoLook] = React.useState<VTOLookResult | null>(null)
  const [compareVtoLook, setCompareVtoLook] =
    React.useState<VTOLookResult | null>(null)
  const [isGeneratingVto, setIsGeneratingVto] = React.useState(false)

  // Countdown Plan State (Null until user completes onboarding & first scan)
  const [plan, setPlan] = React.useState<CountdownPlan | null>(null)
  const [activeWeekTab, setActiveWeekTab] = React.useState("week-1")

  // API Keys & Unit Budget State (Starts at 0 units used!)
  const [youcamApiKey, setYoucamApiKey] = React.useState("")
  const [geminiApiKey, setGeminiApiKey] = React.useState("")
  const [serverHasYouCam, setServerHasYouCam] = React.useState(false)
  const [unitsUsed, setUnitsUsed] = React.useState(0)
  const [cacheHitsSaved, setCacheHitsSaved] = React.useState(0)
  const [dataDeletedBanner, setDataDeletedBanner] = React.useState(false)

  const customOutfitInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    try {
      const savedGender = localStorage.getItem("ready_wardrobe_gender") as WardrobeGender | null
      if (savedGender === "menswear" || savedGender === "womenswear") {
        setSelectedGender(savedGender)
        const match = CURATED_OUTFITS.find((o) => o.gender === savedGender)
        if (match) setSelectedOutfitId(match.id)
      }
      const savedYce = localStorage.getItem("ready_yce_api_key") || ""
      const savedGem = localStorage.getItem("ready_gemini_api_key") || ""
      const savedPro = localStorage.getItem("ready_is_pro") === "true"
      if (savedYce) setYoucamApiKey(savedYce)
      if (savedGem) setGeminiApiKey(savedGem)
      setIsPro(savedPro)
    } catch {}
    fetch("/api/youcam/status")
      .then((r) => r.json())
      .then((data) => {
        if (data?.hasEnvYouCamKey) setServerHasYouCam(true)
      })
      .catch(() => {})
  }, [])

  const handleSelectGender = (gender: WardrobeGender) => {
    setSelectedGender(gender)
    try {
      localStorage.setItem("ready_wardrobe_gender", gender)
    } catch {}
    const firstMatch = outfits.find((o) => o.gender === gender)
    if (firstMatch) {
      setSelectedOutfitId(firstMatch.id)
      const secondMatch = outfits.find(
        (o) => o.gender === gender && o.id !== firstMatch.id
      )
      if (secondMatch) {
        setCompareOutfitId(secondMatch.id)
      }
    }
  }

  const handleTogglePro = (checked: boolean) => {
    setIsPro(checked)
    try {
      localStorage.setItem("ready_is_pro", String(checked))
    } catch {}
  }

  const hasPlannedEvent = eventName.trim().length > 0
  const hasCompletedScan = scans.length > 0

  const currentScan = React.useMemo<SkinScanResult | null>(() => {
    if (scans.length === 0) return null
    return (
      scans.find((s) => s.stage === activeStage) ||
      scans[scans.length - 1] ||
      null
    )
  }, [scans, activeStage])

  const baselineScan = React.useMemo<SkinScanResult | null>(() => {
    if (scans.length === 0) return null
    return scans.find((s) => s.stage === "baseline") || scans[0] || null
  }, [scans])

  const visibleOutfits = React.useMemo(() => {
    return outfits.filter((o) => !o.gender || o.gender === selectedGender)
  }, [outfits, selectedGender])

  const selectedOutfit = React.useMemo(() => {
    return (
      visibleOutfits.find((o) => o.id === selectedOutfitId) ||
      visibleOutfits[0] ||
      CURATED_OUTFITS[0]!
    )
  }, [visibleOutfits, selectedOutfitId])

  const compareOutfit = React.useMemo(() => {
    return (
      visibleOutfits.find(
        (o) => o.id === compareOutfitId && o.id !== selectedOutfit.id
      ) ||
      visibleOutfits[1] ||
      visibleOutfits[0] ||
      CURATED_OUTFITS[1]!
    )
  }, [visibleOutfits, compareOutfitId, selectedOutfit])

  const daysRemaining = React.useMemo(() => {
    const target = new Date(eventDate).getTime()
    const now = Date.now()
    const baseDays = Math.max(
      7,
      Math.min(180, Math.ceil((target - now) / 86400000))
    )
    if (activeStage === "midpoint") {
      return Math.max(3, Math.round(baseDays * 0.45))
    }
    if (activeStage === "final") {
      return 2
    }
    return baseDays
  }, [eventDate, activeStage])

  React.useEffect(() => {
    if (!currentScan) {
      setVtoLook(null)
      setCompareVtoLook(null)
      return
    }
    setVtoLook((prev) => {
      if (prev && prev.outfit.id === selectedOutfit.id) return prev
      return buildLookForSkinAndOutfit(currentScan, selectedOutfit)
    })
    setCompareVtoLook((prev) => {
      if (prev && prev.outfit.id === compareOutfit.id) return prev
      return buildLookForSkinAndOutfit(currentScan, compareOutfit)
    })
  }, [currentScan, selectedOutfit, compareOutfit])

  const refreshAgenticPlan = async (
    scanToUse: SkinScanResult,
    outfitToUse: OutfitOption,
    customEventName?: string
  ) => {
    const activeEventTitle =
      (customEventName ?? eventName).trim() || "Upcoming Milestone Event"
    try {
      const res = await fetch("/api/agent/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(geminiApiKey ? { "x-gemini-key": geminiApiKey } : {}),
        },
        body: JSON.stringify({
          scan: scanToUse,
          eventName: activeEventTitle,
          eventType,
          daysRemaining,
          outfit: outfitToUse,
        }),
      })
      const data = await res.json()
      if (data?.plan) {
        setPlan(data.plan)
      }
    } catch {
      setPlan(
        generateDeterministicPlan(
          scanToUse,
          activeEventTitle,
          eventType,
          daysRemaining,
          outfitToUse
        )
      )
    }
  }

  const handleRunSkinScan = async (
    imageDataUrl?: string,
    targetStage: "baseline" | "midpoint" | "final" = activeStage
  ) => {
    setIsScanning(true)
    const ensuredEventName =
      eventName.trim() || "My Event Countdown"
    if (!eventName.trim()) {
      setEventName(ensuredEventName)
    }
    try {
      const res = await fetch("/api/youcam/skin-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(youcamApiKey ? { "x-youcam-key": youcamApiKey } : {}),
        },
        body: JSON.stringify({
          stage: targetStage,
          imageDataUrl,
        }),
      })
      const data = await res.json()
      if (data?.scan) {
        const returnedScan: SkinScanResult = data.scan
        setScans((prev) => {
          const filtered = prev.filter((s) => s.stage !== targetStage)
          return [...filtered, returnedScan]
        })
        setActiveStage(targetStage)
        if (returnedScan.unitsConsumed > 0) {
          setUnitsUsed((u) => u + returnedScan.unitsConsumed)
        } else {
          setCacheHitsSaved((c) => c + 1)
        }
        await refreshAgenticPlan(
          returnedScan,
          selectedOutfit,
          ensuredEventName
        )
      }
      setCameraDialogOpen(false)
      setOnboardingOpen(false)
      setView("scan")
    } finally {
      setIsScanning(false)
    }
  }

  const handleRunVtoOutfit = async (outfitId: string) => {
    if (!currentScan) return
    setSelectedOutfitId(outfitId)
    const chosen =
      outfits.find((o) => o.id === outfitId) || CURATED_OUTFITS[0]!
    setIsGeneratingVto(true)
    try {
      const res = await fetch("/api/youcam/vto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(youcamApiKey ? { "x-youcam-key": youcamApiKey } : {}),
          ...(geminiApiKey ? { "x-gemini-key": geminiApiKey } : {}),
        },
        body: JSON.stringify({
          scan: currentScan,
          outfitId: chosen.id,
          customOutfit: chosen,
          userImageBase64: currentScan.imageDataUrl,
        }),
      })
      const data = await res.json()
      if (data?.look) {
        setVtoLook(data.look)
        if (data.look.unitsConsumed > 0) {
          setUnitsUsed((u) => u + data.look.unitsConsumed)
        } else {
          setCacheHitsSaved((c) => c + 1)
        }
      }
      await refreshAgenticPlan(currentScan, chosen)
    } finally {
      setIsGeneratingVto(false)
    }
  }

  const handleCustomOutfitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const customOutfit: OutfitOption = {
          id: `custom-outfit-${Date.now()}`,
          name: `Custom Look (${file.name.replace(/\.[^.]+$/, "").slice(0, 14)})`,
          gender: selectedGender,
          category: eventType,
          designerTag: "Uploaded Garment",
          fabricAndCut: "Analyzed via YouCam VTO",
          primaryColor: "Custom Palette",
          primaryHex: "#7A2E46",
          secondaryHex: "#E8D5C4",
          accentHex: "#B84A5A",
          recommendedUndertones: ["warm", "neutral", "cool", "olive"],
          imageUrl: reader.result,
          garmentOverlaySvg: "custom",
          styleNotes:
            "Custom uploaded outfit paired with skin-calibrated primer and undertone-matched lip & cheek shades.",
        }
        setOutfits((prev) => [customOutfit, ...prev])
        handleRunVtoOutfit(customOutfit.id)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSimulateTrajectoryStage = async (
    targetStage: "baseline" | "midpoint" | "final"
  ) => {
    if (!baselineScan) return
    setActiveStage(targetStage)

    // Build realistic progression derived from the user's actual baseline scan!
    const boost = targetStage === "midpoint" ? 9 : targetStage === "final" ? 15 : 0
    const simulatedScan: SkinScanResult =
      targetStage === "baseline"
        ? baselineScan
        : {
            ...baselineScan,
            scanId: `${baselineScan.scanId}-${targetStage}`,
            stage: targetStage,
            label:
              targetStage === "midpoint"
                ? "Week 4 Check-In Scan"
                : "Event Eve Readiness Scan",
            overallScore: Math.min(96, baselineScan.overallScore + boost),
            skinAge: Math.max(21, baselineScan.skinAge - (targetStage === "final" ? 2 : 1)),
            metrics: baselineScan.metrics.map((m) => {
              const nextScore = Math.min(96, m.score + boost)
              return {
                ...m,
                score: nextScore,
                concernLevel:
                  nextScore < 64
                    ? "priority"
                    : nextScore < 74
                      ? "moderate"
                      : nextScore < 80
                        ? "mild"
                        : "optimal",
              }
            }),
          }

    setScans((prev) => {
      const withoutTarget = prev.filter((s) => s.stage !== targetStage)
      return [...withoutTarget, simulatedScan]
    })

    await refreshAgenticPlan(simulatedScan, selectedOutfit)
  }

  const toggleTask = (weekNumber: number, taskId: string) => {
    setPlan((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        weeks: prev.weeks.map((w) =>
          w.weekNumber === weekNumber
            ? {
                ...w,
                tasks: w.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
              }
            : w
        ),
      }
    })
  }

  const handleDeleteAllData = () => {
    try {
      localStorage.removeItem("ready_yce_api_key")
      localStorage.removeItem("ready_gemini_api_key")
      localStorage.removeItem("ready_is_pro")
    } catch {}
    setScans([])
    setPlan(null)
    setVtoLook(null)
    setCompareVtoLook(null)
    setEventName("")
    setIsPro(false)
    setActiveStage("baseline")
    setUnitsUsed(0)
    setCacheHitsSaved(0)
    setDataDeletedBanner(true)
    setTimeout(() => setDataDeletedBanner(false), 3500)
  }

  const openOnboardingAt = (step: OnboardingStep = 1) => {
    setOnboardingStep(step)
    setOnboardingOpen(true)
  }

  const activeMakeup =
    vtoLook?.selectedVariant === "alternate"
      ? vtoLook.alternateMakeup
      : vtoLook?.makeup

  // Build Check-In AnalyticsBento props dynamically from user's scan history
  const checkInBentoProps = React.useMemo(() => {
    const base = baselineScan || BASELINE_SKIN_SCAN
    const compareTarget =
      currentScan && currentScan.stage !== "baseline"
        ? currentScan
        : {
            ...base,
            label: "Projected Event Readiness",
            overallScore: Math.min(95, base.overallScore + 12),
            metrics: base.metrics.map((m) => ({
              ...m,
              score: Math.min(95, m.score + 12),
            })),
          }

    const zoneMap: Record<string, string> = {
      Cheeks: "cheeks",
      "T-Zone": "tzone",
      Periorbital: "eyes",
      "Full Face": "full",
    }

    const scoreDelta = Math.max(0, compareTarget.overallScore - base.overallScore)
    const seriesPoints = Array.from({ length: 30 }, (_, i) => ({
      label: `Day ${i + 1}`,
      value: Math.round(base.overallScore + (scoreDelta * i) / 29),
    }))

    return {
      currency: "",
      proLocked: !isPro,
      onUnlockPro: () => handleTogglePro(true),
      colors: {
        revenue: ["#d91b5c", "#12b863"] as [string, string],
        desktop: ["#38bdf8", "#6366f1"] as [string, string],
        mobile: ["#f59e0b", "#ec4899"] as [string, string],
        radar: "#12b863",
      },
      revenue: {
        label: "Readiness Change Over Time",
        value: compareTarget.overallScore,
        delta: `+${scoreDelta} pts`,
        note: (
          <>
            Baseline{" "}
            <span className="text-foreground font-mono font-semibold">
              {base.overallScore}
            </span>{" "}
            → {compareTarget.overallScore}/100
          </>
        ),
        caption: `${daysRemaining}-Day Countdown Trajectory`,
        series: seriesPoints,
      },
      sessions: {
        label: "Hydration vs. Sebum Balance Shift",
        value: compareTarget.metrics[0]?.score ?? 81,
        delta: `+${Math.max(0, (compareTarget.metrics[0]?.score ?? 81) - (base.metrics[0]?.score ?? 62))} pts`,
        note: `Unlocked VTO: ${
          buildLookForSkinAndOutfit(compareTarget, selectedOutfit).makeup
            .baseFinish
        }`,
        desktop: hydrationWaves,
        mobile: sebumWaves,
        labels: {
          desktop: "Deep Hydration",
          mobile: "Sebum Control",
          prior: "Day 1 Baseline",
          current: compareTarget.label,
        },
      },
      categories: {
        title: "Marker Improvement Treemap (Tap Any Tile for Rx)",
        groups: [
          { id: "cheeks", name: "Cheeks", color: "#8B3DFF", ink: "light" as const },
          { id: "tzone", name: "T-Zone", color: "#7CFF5B", ink: "dark" as const },
          { id: "full", name: "Full Face", color: "#FFB800", ink: "dark" as const },
          { id: "eyes", name: "Periorbital", color: "#FF5A1F", ink: "dark" as const },
        ],
        periods: [
          {
            label: compareTarget.label,
            total: compareTarget.overallScore,
            delta: `+${scoreDelta} pts`,
            compare: `vs ${base.overallScore} on Day 1`,
          },
          {
            label: "Event Eve Target",
            total: Math.min(96, base.overallScore + 16),
            delta: `+${Math.min(96, base.overallScore + 16) - base.overallScore} pts`,
            compare: `vs ${base.overallScore} on Day 1`,
          },
          {
            label: "Day 1 Baseline",
            total: base.overallScore,
            delta: "Start",
            compare: `${daysRemaining}d Out`,
          },
        ],
        items: base.metrics.map((bm, idx) => ({
          name: bm.label,
          group: zoneMap[bm.zone] || "full",
          values: [
            compareTarget.metrics[idx]?.score ?? bm.targetByEvent,
            Math.min(96, bm.targetByEvent + 2),
            bm.score,
          ],
        })),
        table: {
          columns: ["Marker", "Day 1", "Current", "Delta"],
          rows: base.metrics.slice(0, 4).map((bm, idx) => {
            const afterVal =
              compareTarget.metrics[idx]?.score ?? bm.targetByEvent
            return {
              label: bm.label,
              values: [
                `${bm.score}`,
                `${afterVal}`,
                `+${Math.max(0, afterVal - bm.score)} pts`,
              ],
            }
          }),
        },
        onSelectItem: (labelName: string) => {
          const found = compareTarget.metrics.find((m) => m.label === labelName)
          if (found) setSelectedMetric(found)
        },
      },
      seasonality: {
        title: "8-Axis Harmony Radar",
        axis: [
          "Hydr",
          "Sebum",
          "Redn",
          "Textr",
          "Pores",
          "Eyes",
          "Glow",
          "Spots",
        ],
        years: [
          {
            label: "Current",
            values: compareTarget.metrics.map((m) => m.score),
            stats: [
              {
                label: "Hydration",
                value: compareTarget.metrics[0]?.score ?? 81,
                delta: `+${Math.max(0, (compareTarget.metrics[0]?.score ?? 81) - (base.metrics[0]?.score ?? 62))} pts`,
                note: `from ${base.metrics[0]?.score ?? 62}`,
              },
              {
                label: "Sebum Control",
                value: compareTarget.metrics[1]?.score ?? 77,
                delta: `+${Math.max(0, (compareTarget.metrics[1]?.score ?? 77) - (base.metrics[1]?.score ?? 59))} pts`,
                note: `from ${base.metrics[1]?.score ?? 59}`,
              },
            ],
            rows: base.metrics.slice(2, 5).map((bm, i) => {
              const targetM = compareTarget.metrics[i + 2]
              const nextVal = targetM?.score ?? bm.targetByEvent
              return {
                label: bm.label,
                value: `${bm.score} → ${nextVal} (+${Math.max(0, nextVal - bm.score)})`,
              }
            }),
          },
          {
            label: "Day 1",
            values: base.metrics.map((m) => m.score),
            stats: [
              {
                label: "Hydration",
                value: base.metrics[0]?.score ?? 62,
                delta: "Baseline",
                note: `Target ${base.metrics[0]?.targetByEvent ?? 84}`,
              },
              {
                label: "Sebum Control",
                value: base.metrics[1]?.score ?? 59,
                delta: "Baseline",
                note: `Target ${base.metrics[1]?.targetByEvent ?? 79}`,
              },
            ],
            rows: base.metrics.slice(5, 8).map((bm) => ({
              label: bm.label,
              value: `${bm.score} → Target ${bm.targetByEvent}`,
            })),
          },
        ],
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baselineScan, currentScan, selectedOutfit, daysRemaining, isPro])

  const isHero = view === "overview"

  // Reusable First-Time User Empty Loop Component
  const renderEmptyJourneyLoop = (contextTitle: string, contextDesc: string) => (
    <div className="mx-auto max-w-2xl rounded-[32px] border border-border bg-card p-8 shadow-sm sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconSparkles className="size-7" />
        </div>
        <Badge variant="secondary" className="mt-4 font-mono uppercase">
          First-Time Setup Loop
        </Badge>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {contextTitle}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {contextDesc}
        </p>
      </div>

      {/* 3-Step Visual Journey Loop */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => openOnboardingAt(1)}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
            hasPlannedEvent
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-primary bg-primary/5 ring-2 ring-primary/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
              Step 01
            </span>
            {hasPlannedEvent ? (
              <IconCheck className="size-4 text-emerald-500" />
            ) : (
              <IconCalendarEvent className="size-4 text-primary" />
            )}
          </div>
          <div className="mt-3">
            <div className="font-heading text-sm font-bold">
              {hasPlannedEvent ? eventName : "Plan Your Event"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {hasPlannedEvent
                ? `${daysRemaining} days countdown`
                : "Set event name & date"}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openOnboardingAt(2)}
          className="flex flex-col justify-between rounded-2xl border border-border bg-muted/20 p-4 text-left transition hover:border-primary/40"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
              Step 02
            </span>
            <IconCrown
              className={`size-4 ${isPro ? "text-amber-500" : "text-muted-foreground"}`}
            />
          </div>
          <div className="mt-3">
            <div className="font-heading text-sm font-bold">
              {isPro ? "Ready Pro Active" : "Free / Pro Tier"}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {isPro
                ? "All 8 markers & radar unlocked"
                : "4 core markers (Tap to switch)"}
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openOnboardingAt(hasPlannedEvent ? 3 : 1)}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
            hasPlannedEvent
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border bg-muted/20 hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
              Step 03
            </span>
            <IconCamera className="size-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="font-heading text-sm font-bold">
              Baseline Skin Scan
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Live camera or selfie upload
            </div>
          </div>
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          size="lg"
          className="w-full font-semibold sm:w-auto"
          onClick={() => openOnboardingAt(hasPlannedEvent ? 3 : 1)}
        >
          <IconSparkles className="size-4" />
          {hasPlannedEvent
            ? "Step 3: Capture Baseline Skin Scan"
            : "Start 3-Step Event Onboarding"}
          <IconArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col">
      {/* =========================================================
          FLOATING HEADER ON HERO (Transparent on Hero, Dark Glass Pill)
         ========================================================= */}
      <header
        className={
          isHero
            ? "fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-black/25 text-white backdrop-blur-md"
            : "sticky top-0 z-40 border-b border-white/10 bg-stone-950/92 text-white backdrop-blur-md"
        }
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Dark-Mode R Logo Only + Event Setup Pill */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView("overview")}
              aria-label="Go to Home"
              className="flex items-center transition hover:opacity-85"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-dark.png"
                alt="Ready Logo"
                className="size-11 object-contain"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                hasCompletedScan
                  ? setEventDialogOpen(true)
                  : openOnboardingAt(1)
              }
              className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90 transition hover:bg-white/15 sm:inline-flex"
            >
              <IconCalendarEvent className="size-3.5 text-primary" />
              <span className="max-w-[160px] truncate font-medium">
                {hasPlannedEvent ? eventName : "Plan Your Event"}
              </span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-[10px]">
                {hasPlannedEvent ? `${daysRemaining}d` : "Setup"}
              </span>
            </button>

            <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Event Countdown</DialogTitle>
                  <DialogDescription>
                    Update your event name, category, or target countdown date.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Event Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Sister's Tuscan Wedding"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">
                        Category
                      </label>
                      <select
                        value={eventType}
                        onChange={(e) =>
                          setEventType(e.target.value as EventType)
                        }
                        className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="wedding">Wedding</option>
                        <option value="interview">Interview / Keynote</option>
                        <option value="graduation">Graduation</option>
                        <option value="gala">Evening Gala</option>
                      </select>
                    </div>
                  </div>

                  {hasCompletedScan && (
                    <div className="border-t border-border pt-3">
                      <Button
                        variant="ghost"
                        size="xs"
                        className="w-full text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          handleDeleteAllData()
                          setEventDialogOpen(false)
                        }}
                      >
                        <IconTrash className="size-3.5" />
                        Reset Event & Wipe Scan Data
                      </Button>
                    </div>
                  )}
                </div>

                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>
          </div>

          {/* Center: Sleek Expandable Icon Pill Nav (Active = Icon + Name; Inactive = Icon Only) */}
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md"
          >
            {(
              [
                { id: "overview", label: "Home", icon: <IconSparkles className="size-4" /> },
                { id: "scan", label: "Skin AI", icon: <IconCamera className="size-4" /> },
                { id: "look", label: "VTO Look", icon: <IconHanger className="size-4" /> },
                { id: "countdown", label: "Plan", icon: <IconChecklist className="size-4" /> },
                { id: "progress", label: "Check-In", icon: <IconTimeline className="size-4" /> },
              ] as const
            ).map((item) => {
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => setView(item.id)}
                  className={`flex h-8 items-center justify-center rounded-full whitespace-nowrap text-xs font-medium transition-all duration-200 ${
                    active
                      ? "gap-1.5 bg-white px-3.5 text-stone-950 shadow-sm"
                      : "w-8 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {active && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>

          {/* Right: Single Crown Pro Toggle Icon (Like a theme button) + Camera + Share */}
          <div className="flex items-center gap-1.5">
            {/* Minimal Pro Mode Icon Toggle Button */}
            <button
              type="button"
              onClick={() => handleTogglePro(!isPro)}
              title={isPro ? "Ready Pro Active" : "Ready Free (Click to toggle Pro)"}
              aria-label="Toggle Pro Plan"
              className={`inline-flex size-8 items-center justify-center rounded-full transition ${
                isPro
                  ? "bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/40"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <IconCrown className="size-4" />
            </button>

            {/* Global Camera Scan Modal Trigger */}
            <Dialog open={cameraDialogOpen} onOpenChange={setCameraDialogOpen}>
              <DialogTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-medium text-white transition hover:bg-white/20"
                  />
                }
              >
                <IconCamera className="size-3.5 text-primary" />
                <span className="hidden sm:inline">Scan</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>YouCam Skin AI Scanner</DialogTitle>
                  <DialogDescription>
                    Take a live browser photo or upload a selfie to analyze 8
                    skin markers.
                  </DialogDescription>
                </DialogHeader>
                <CameraScanner
                  stage={activeStage}
                  consentGranted={consentGranted}
                  isAdultConfirmed={isAdultConfirmed}
                  onConsentChange={(c, a) => {
                    setConsentGranted(c)
                    setIsAdultConfirmed(a)
                  }}
                  onCaptureComplete={(img) => {
                    handleRunSkinScan(img, activeStage)
                  }}
                  isAnalyzing={isScanning}
                />
              </DialogContent>
            </Dialog>

            {/* Share Card Modal Trigger (Only active once scan & plan exist) */}
            {currentScan && vtoLook && plan && (
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      title="Share Plan Card"
                      className="inline-flex size-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
                    />
                  }
                >
                  <IconShare className="size-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Your Event Countdown</DialogTitle>
                    <DialogDescription>
                      Biometric photos & scores are hidden by default.
                    </DialogDescription>
                  </DialogHeader>
                  <ShareCardBuilder
                    eventName={eventName || "My Event Countdown"}
                    eventDate={eventDate}
                    daysRemaining={daysRemaining}
                    scan={currentScan}
                    look={vtoLook}
                    plan={plan}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================
          3-STEP FIRST-TIME USER ONBOARDING WIZARD MODAL
         ========================================================= */}
      <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <Badge variant="secondary" className="font-mono">
                Step {onboardingStep} of 3
              </Badge>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      onboardingStep === s
                        ? "w-6 bg-primary"
                        : onboardingStep > s
                          ? "w-3 bg-emerald-500"
                          : "w-3 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <DialogTitle className="mt-2 text-xl font-bold">
              {onboardingStep === 1 && "1. What Event Are You Getting Ready For?"}
              {onboardingStep === 2 && "2. Choose Your Event Prep Tier"}
              {onboardingStep === 3 && "3. Capture Your Baseline Skin Scan"}
            </DialogTitle>
            <DialogDescription>
              {onboardingStep === 1 &&
                "Your countdown duration sets biological guardrails (including the 7-day pre-event active acid lockout)."}
              {onboardingStep === 2 &&
                "Compare Free vs. Ready Pro. Use the demo paywall switch below to test both tiers."}
              {onboardingStep === 3 &&
                "Take a live selfie or upload a portrait photo for YouCam S2S v2.0 Skin AI analysis."}
            </DialogDescription>
          </DialogHeader>

          {/* STEP 1: EVENT BRIEF */}
          {onboardingStep === 1 && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Event Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Amara's Garden Wedding, Tech Keynote, Graduation"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Event Category
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="gala">Evening Gala</option>
                    <option value="graduation">Graduation</option>
                    <option value="interview">Keynote / Interview</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Wardrobe &amp; Silhouette
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectGender("menswear")}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                      selectedGender === "menswear"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xl">👔</span>
                    <div>
                      <div className="font-heading text-xs font-bold">Men&apos;s Wardrobe</div>
                      <div className="text-[10px] text-muted-foreground">Suits, Tuxedos &amp; Menswear</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectGender("womenswear")}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
                      selectedGender === "womenswear"
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xl">👗</span>
                    <div>
                      <div className="font-heading text-xs font-bold">Women&apos;s Wardrobe</div>
                      <div className="text-[10px] text-muted-foreground">Gowns, Dresses &amp; Tailoring</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground">
                Countdown window:{" "}
                <strong className="font-mono text-foreground">
                  {daysRemaining} days remaining
                </strong>{" "}
                ({Math.max(1, Math.min(6, Math.ceil(daysRemaining / 7)))} weekly
                esthetician phases).
              </div>

              <Button
                size="lg"
                className="w-full font-semibold"
                onClick={() => {
                  if (!eventName.trim()) {
                    setEventName("My Upcoming Event")
                  }
                  setOnboardingStep(2)
                }}
              >
                Continue to Plan Selection
                <IconArrowRight className="size-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: FREE VS PRO PAYWALL SELECTION */}
          {onboardingStep === 2 && (
            <div className="space-y-4 py-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Free Card */}
                <button
                  type="button"
                  onClick={() => handleTogglePro(false)}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                    !isPro
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-bold">
                        Ready Free
                      </span>
                      <Badge variant="outline" className="font-mono">
                        $0
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Essential countdown & baseline skin check.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs">
                      <li className="flex items-center gap-1.5">
                        <IconCheck className="size-3.5 text-emerald-500" />
                        Overall Skin Readiness Score
                      </li>
                      <li className="flex items-center gap-1.5">
                        <IconCheck className="size-3.5 text-emerald-500" />
                        4 Core Skin Markers
                      </li>
                      <li className="flex items-center gap-1.5">
                        <IconCheck className="size-3.5 text-emerald-500" />
                        1 Event Countdown & VTO Look
                      </li>
                      <li className="flex items-center gap-1.5 text-muted-foreground line-through">
                        <IconLock className="size-3.5" />
                        4 Clinical Markers Blurred
                      </li>
                    </ul>
                  </div>
                </button>

                {/* Pro Card */}
                <button
                  type="button"
                  onClick={() => handleTogglePro(true)}
                  className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                    isPro
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-heading text-sm font-bold text-primary">
                        <IconCrown className="size-4" />
                        Ready Pro
                      </span>
                      <Badge className="font-mono">$14.99 / event</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Full clinical telemetry & multi-stage VTO calibration.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs">
                      <li className="flex items-center gap-1.5">
                        <IconCheck className="size-3.5 text-emerald-500" />
                        All 8 YouCam HD Markers Unblurred
                      </li>
                      <li className="flex items-center gap-1.5">
                        <IconCheck className="size-3.5 text-emerald-500" />
                        8-Axis Fourier Radar & Zone Treemap
                      </li>
                      <li className="flex items-center gap-1.5">
                        <IconCheck className="size-3.5 text-emerald-500" />
                        Gemini Esthetician + Stylist Agent
                      </li>
                      <li className="flex items-center gap-1.5">
                        <IconCheck className="size-3.5 text-emerald-500" />
                        Multi-Week Re-Scan Check-In Loop
                      </li>
                    </ul>
                  </div>
                </button>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setOnboardingStep(1)}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1 font-semibold"
                  onClick={() => setOnboardingStep(3)}
                >
                  Continue to Skin Scan
                  <IconArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: BASELINE SKIN SCAN */}
          {onboardingStep === 3 && (
            <div className="space-y-3 py-1">
              <CameraScanner
                stage="baseline"
                consentGranted={consentGranted}
                isAdultConfirmed={isAdultConfirmed}
                onConsentChange={(c, a) => {
                  setConsentGranted(c)
                  setIsAdultConfirmed(a)
                }}
                onCaptureComplete={(img) => {
                  handleRunSkinScan(img, "baseline")
                }}
                isAnalyzing={isScanning}
              />
              <div className="flex justify-start pt-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setOnboardingStep(2)}
                >
                  ← Back to Tier Selection
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* =========================================================
          VIEW 1: FULL-SCREEN HERO (LYCORIS SPECIMEN UNDER FLOATING NAVBAR)
         ========================================================= */}
      {isHero && (
        <div className="w-full">
          <LycorisSpecimen
            name="READY"
            studio="YouCam Skin AI × VTO"
            year="2026"
            height="100svh"
            crimson="#d91b5c"
            links={[
              {
                label: hasCompletedScan
                  ? "OPEN SKIN AI STUDIO →"
                  : "START EVENT ONBOARDING →",
                onClick: () =>
                  hasCompletedScan ? setView("scan") : openOnboardingAt(1),
              },
              {
                label: hasCompletedScan
                  ? "OPEN VTO LOOKS →"
                  : "EXPLORE VTO STUDIO →",
                onClick: () => setView("look"),
              },
            ]}
          />
        </div>
      )}

      {/* =========================================================
          INNER VIEWS
         ========================================================= */}
      {!isHero && (
        <main
          className="w-full flex-1 px-4 py-8 sm:px-6"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in oklab, var(--color-foreground) 7%, transparent) 0 1px, transparent 1.4px)",
            backgroundSize: "20px 13px",
            backgroundPosition: "-6px -1px",
          }}
        >
          <div className="mx-auto max-w-[1240px]">
            {/* ---------------------------------------------------------
                VIEW 2: SKIN AI (EMPTY STATE UNTIL USER SCANS + PRO BLUR ON 4 MARKERS)
               --------------------------------------------------------- */}
            {view === "scan" && (
              <>
                {!currentScan || !activeMakeup ? (
                  renderEmptyJourneyLoop(
                    "Start Your Baseline Skin AI Scan",
                    "Ready doesn't pre-load fake skin scores. Set your event date, choose Free or Pro, and snap a quick selfie to analyze your 8 skin markers with YouCam AI."
                  )
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight">
                          YouCam Skin AI Studio
                        </h1>
                        <p className="text-muted-foreground text-xs">
                          {currentScan.label} · {currentScan.skinTone} ·{" "}
                          <span className="uppercase">
                            {currentScan.undertone}
                          </span>{" "}
                          undertone
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCameraDialogOpen(true)}
                        >
                          <IconCamera className="size-4" />
                          New Scan
                        </Button>
                        <Button size="sm" onClick={() => setView("look")}>
                          Match VTO Look
                          <IconArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid items-start gap-8 lg:grid-cols-12">
                      {/* Left: AR Zone Map */}
                      <div className="lg:col-span-5">
                        <VTOPortraitCanvas
                          scan={currentScan}
                          outfit={selectedOutfit}
                          makeup={activeMakeup}
                          vtoImageUrl={vtoLook?.vtoImageUrl}
                          isGenerating={isGeneratingVto}
                          viewMode="skin-zones"
                        />
                      </div>

                      {/* Right: 8-Marker Score Grid (4 Core Free + 4 Advanced Pro with Paywall Blur) */}
                      <div className="space-y-4 lg:col-span-7">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border bg-card p-5 shadow-xs">
                          <div>
                            <div className="text-muted-foreground text-xs">
                              Overall Skin Readiness
                            </div>
                            <div className="font-heading text-3xl font-extrabold text-primary">
                              {currentScan.overallScore}
                              <span className="text-muted-foreground text-sm font-normal">
                                /100
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="font-mono">
                              Skin Age: {currentScan.skinAge}
                            </Badge>
                            <Button
                              variant="secondary"
                              size="xs"
                              onClick={() => setView("progress")}
                            >
                              View Change Over Time →
                            </Button>
                          </div>
                        </div>

                        {/* Top 4 Core Markers (Always Visible on Free & Pro) */}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {currentScan.metrics.slice(0, 4).map((m) => (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() => setSelectedMetric(m)}
                              className="group flex flex-col justify-between rounded-[20px] border border-border bg-card p-4 text-left shadow-2xs transition hover:border-primary/50"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-heading text-sm font-semibold">
                                  {m.label}
                                </span>
                                <span className="flex items-center gap-1 font-mono text-xs font-bold">
                                  {m.score}/100
                                  <IconChevronRight className="size-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
                                </span>
                              </div>
                              <div className="mt-3">
                                <Progress value={m.score} />
                              </div>
                              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>{m.zone}</span>
                                <span className="font-mono text-primary">
                                  Target {m.targetByEvent}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Bottom 4 Advanced Clinical Markers (Blurred on Free Plan, Unlocked on Pro!) */}
                        <div className="relative">
                          <div
                            className={`grid gap-3 sm:grid-cols-2 transition duration-300 ${
                              !isPro
                                ? "pointer-events-none select-none blur-[6px] opacity-55"
                                : ""
                            }`}
                          >
                            {currentScan.metrics.slice(4, 8).map((m) => (
                              <button
                                key={m.key}
                                type="button"
                                onClick={() => setSelectedMetric(m)}
                                className="group flex flex-col justify-between rounded-[20px] border border-border bg-card p-4 text-left shadow-2xs transition hover:border-primary/50"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-heading text-sm font-semibold">
                                    {m.label}
                                  </span>
                                  <span className="flex items-center gap-1 font-mono text-xs font-bold">
                                    {m.score}/100
                                    <IconChevronRight className="size-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <Progress value={m.score} />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{m.zone}</span>
                                  <span className="font-mono text-primary">
                                    Target {m.targetByEvent}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Pro Lock Overlay on the 4 Advanced Markers */}
                          {!isPro && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[20px] bg-background/50 p-4 backdrop-blur-[3px]">
                              <div className="flex max-w-xs flex-col items-center rounded-2xl border border-border/80 bg-card/95 p-5 text-center shadow-lg">
                                <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-400">
                                  <IconCrown className="size-3.5" />
                                  Ready Pro
                                </div>
                                <h3 className="mt-1 font-heading text-sm font-bold">
                                  Advanced Clinical Markers
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Pore refinement, periorbital brightness, radiance,
                                  and pigment uniformity analysis.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ---------------------------------------------------------
                VIEW 3: VTO LOOK STUDIO
               --------------------------------------------------------- */}
            {view === "look" && (
              <>
                {!currentScan || !vtoLook || !activeMakeup || !compareVtoLook ? (
                  renderEmptyJourneyLoop(
                    "Scan Your Skin First to Calibrate VTO",
                    "Virtual Try-On shades and foundation finishes are dynamically calibrated to your YouCam Skin AI undertone and hydration barrier. Complete your baseline scan to unlock the studio."
                  )
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="font-heading text-2xl font-bold">
                          Virtual Try-On Studio
                        </h1>
                        <p className="text-muted-foreground text-xs">
                          Matched to your {currentScan.undertone} undertone &{" "}
                          {currentScan.label.toLowerCase()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Sheet>
                          <SheetTrigger
                            render={<Button variant="outline" size="sm" />}
                          >
                            <IconInfoCircle className="size-4 text-primary" />
                            Why This Suits My Skin
                          </SheetTrigger>
                          <SheetContent side="right" className="overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Skin-to-Shade Rationale</SheetTitle>
                              <SheetDescription>
                                How YouCam Skin AI configured your makeup for{" "}
                                {selectedOutfit.name}.
                              </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-4 px-6 pb-8">
                              <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Base Finish
                                  </span>
                                  <span className="font-semibold">
                                    {activeMakeup.baseFinish}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Shade
                                  </span>
                                  <span className="font-semibold">
                                    {activeMakeup.foundationShade}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Lip
                                  </span>
                                  <span className="font-semibold">
                                    {activeMakeup.lipShadeName}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Cheek
                                  </span>
                                  <span className="font-semibold">
                                    {activeMakeup.cheekShadeName}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Skin AI Reasoning
                                </div>
                                {activeMakeup.whyItWorksWithSkin.map(
                                  (reason, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-2 rounded-xl border border-border p-3 text-xs"
                                    >
                                      <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                      <span>{reason}</span>
                                    </div>
                                  )
                                )}
                              </div>

                              <div className="rounded-2xl bg-primary/10 p-3.5 text-xs">
                                <strong>Zone Primer:</strong>{" "}
                                {activeMakeup.primerStrategy}
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>

                        <Dialog
                          open={compareDialogOpen}
                          onOpenChange={setCompareDialogOpen}
                        >
                          <DialogTrigger
                            render={<Button variant="secondary" size="sm" />}
                          >
                            <IconScale className="size-4" />
                            Compare Looks
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>
                                Side-by-Side VTO Comparison
                              </DialogTitle>
                              <DialogDescription>
                                Compare two event looks rendered on your skin
                                profile.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <div className="font-heading text-xs font-bold">
                                  Current: {selectedOutfit.name}
                                </div>
                                <VTOPortraitCanvas
                                  scan={currentScan}
                                  outfit={selectedOutfit}
                                  makeup={activeMakeup}
                                  vtoImageUrl={vtoLook?.vtoImageUrl}
                                  compact
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <select
                                    value={compareOutfitId}
                                    onChange={(e) =>
                                      setCompareOutfitId(e.target.value)
                                    }
                                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold"
                                  >
                                    {outfits.map((o) => (
                                      <option key={o.id} value={o.id}>
                                        {o.name}
                                      </option>
                                    ))}
                                  </select>
                                  <Button
                                    size="xs"
                                    onClick={() => {
                                      handleRunVtoOutfit(compareOutfit.id)
                                      setCompareDialogOpen(false)
                                    }}
                                  >
                                    Select This
                                  </Button>
                                </div>
                                <VTOPortraitCanvas
                                  scan={currentScan}
                                  outfit={compareOutfit}
                                  makeup={compareVtoLook.makeup}
                                  vtoImageUrl={compareVtoLook?.vtoImageUrl}
                                  compact
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button size="sm" onClick={() => setView("countdown")}>
                          View Plan
                          <IconArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid items-start gap-8 lg:grid-cols-12">
                      <div className="lg:col-span-6">
                        <VTOPortraitCanvas
                          scan={currentScan}
                          outfit={selectedOutfit}
                          makeup={activeMakeup}
                          vtoImageUrl={vtoLook?.vtoImageUrl}
                          isGenerating={isGeneratingVto}
                          renderEngine={vtoLook?.renderEngine}
                          renderError={vtoLook?.renderError}
                          onGenerate={() => handleRunVtoOutfit(selectedOutfit.id)}
                          badgeText={
                            isGeneratingVto
                              ? "Generating full-body look..."
                              : vtoLook?.vtoImageUrl
                              ? `Wearing ${selectedOutfit.name}`
                              : `${activeMakeup.baseFinish}`
                          }
                        />
                      </div>

                      <div className="space-y-5 lg:col-span-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            1. Choose Event Outfit
                          </span>
                          <div className="flex items-center gap-2">
                            {/* Menswear / Womenswear Gender Pill Toggle */}
                            <div className="flex items-center rounded-full border border-border bg-muted/50 p-0.5 text-xs font-medium">
                              <button
                                type="button"
                                onClick={() => handleSelectGender("menswear")}
                                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] transition ${
                                  selectedGender === "menswear"
                                    ? "bg-background text-foreground font-bold shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <span>👔</span> Men&apos;s
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectGender("womenswear")}
                                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] transition ${
                                  selectedGender === "womenswear"
                                    ? "bg-background text-foreground font-bold shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <span>👗</span> Women&apos;s
                              </button>
                            </div>

                            <input
                              ref={customOutfitInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleCustomOutfitUpload}
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              className="h-7 text-[11px] gap-1 px-2.5 rounded-full border-border/80"
                              title="Upload a photo of your own dress, suit, or blazer to test undertone harmony & virtual drape"
                              onClick={() =>
                                customOutfitInputRef.current?.click()
                              }
                            >
                              <IconHanger className="size-3 text-muted-foreground" />
                              <span>+ Custom Outfit</span>
                            </Button>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground -mt-3">
                          Select a curated look or tap <strong>+ Custom Outfit</strong> to upload your own garment photo and test undertone harmony.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {visibleOutfits.map((o) => {
                            const active = o.id === selectedOutfitId
                            return (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() => handleRunVtoOutfit(o.id)}
                                className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                                  active
                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                    : "border-border bg-card hover:border-primary/40"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="size-4 shrink-0 rounded-full border border-white/40 shadow-2xs"
                                    style={{ backgroundColor: o.primaryHex }}
                                  />
                                  <span className="font-heading text-xs font-bold line-clamp-1">
                                    {o.name}
                                  </span>
                                </div>
                                <div className="text-muted-foreground mt-1.5 text-[11px] line-clamp-1">
                                  {o.primaryColor}
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        <div className="space-y-2 pt-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {selectedGender === "menswear"
                              ? "2. Grooming & Anti-Shine Prescription"
                              : "2. Makeup Prescription Finish"}
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setVtoLook((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        selectedVariant: "primary",
                                      }
                                    : prev
                                )
                              }
                              className={`rounded-2xl border p-4 text-left transition ${
                                vtoLook.selectedVariant === "primary"
                                  ? "border-primary bg-primary/5"
                                  : "border-border bg-card"
                              }`}
                            >
                              <div className="font-heading text-xs font-bold">
                                {vtoLook.makeup.baseFinish}
                              </div>
                              <div className="text-muted-foreground mt-0.5 text-[11px]">
                                {selectedGender === "menswear"
                                  ? "Camera-Ready Anti-Shine"
                                  : "Skin-AI Matched Rx"}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setVtoLook((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        selectedVariant: "alternate",
                                      }
                                    : prev
                                )
                              }
                              className={`rounded-2xl border p-4 text-left transition ${
                                vtoLook.selectedVariant === "alternate"
                                  ? "border-primary bg-primary/5"
                                  : "border-border bg-card"
                              }`}
                            >
                              <div className="font-heading text-xs font-bold">
                                {vtoLook.alternateMakeup.baseFinish}
                              </div>
                              <div className="text-muted-foreground mt-0.5 text-[11px]">
                                {selectedGender === "menswear"
                                  ? "Minimalist Natural Grooming"
                                  : "Statement Lip Alt"}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ---------------------------------------------------------
                VIEW 4: COUNTDOWN PLAN (TABBED WEEKS + SHOPPING SHEET)
               --------------------------------------------------------- */}
            {view === "countdown" && (
              <>
                {!currentScan || !plan || !activeMakeup ? (
                  renderEmptyJourneyLoop(
                    "Build Your Personalized Countdown Roadmap",
                    "Your week-by-week esthetician tasks and biological guardrails are generated right after your baseline YouCam Skin AI scan."
                  )
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-border bg-card p-6 shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className="flex size-20 flex-col items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                          <span className="font-heading text-3xl font-extrabold leading-none">
                            {daysRemaining}
                          </span>
                          <span className="mt-1 font-mono text-[9px] uppercase tracking-wider">
                            Days Left
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono">
                              {currentScan.label}
                            </Badge>
                            <Badge variant="outline" className="font-mono">
                              {activeMakeup.baseFinish}
                            </Badge>
                          </div>
                          <h1 className="mt-1.5 font-heading text-xl font-bold sm:text-2xl">
                            {eventName || "My Event Countdown"}
                          </h1>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Sheet>
                          <SheetTrigger
                            render={<Button variant="outline" size="sm" />}
                          >
                            <IconShoppingBag className="size-4 text-primary" />
                            Shopping List ({plan.shoppingList.length})
                          </SheetTrigger>
                          <SheetContent side="right" className="overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Event Prep Shopping List</SheetTitle>
                              <SheetDescription>
                                Active ingredients matched to your YouCam Skin
                                AI scan.
                              </SheetDescription>
                            </SheetHeader>
                            <div className="space-y-3 px-6 pb-8">
                              {plan.shoppingList.map((item) => (
                                <div
                                  key={item.id}
                                  className="rounded-2xl border border-border p-3.5 text-xs space-y-1.5"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-heading font-bold">
                                      {item.productType}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className="font-mono"
                                    >
                                      {item.priceTier}
                                    </Badge>
                                  </div>
                                  <div className="font-mono text-[10px] text-primary">
                                    {item.keyIngredients}
                                  </div>
                                  <p className="text-muted-foreground">
                                    {item.whyNeeded}
                                  </p>
                                  <div className="pt-1">
                                    <a
                                      href={item.retailerSearchUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                                    >
                                      Find Products
                                      <IconExternalLink className="size-3" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </SheetContent>
                        </Sheet>

                        <Button
                          size="sm"
                          onClick={() => {
                            setView("progress")
                          }}
                        >
                          <IconTimeline className="size-4" />
                          Check-In & Progress
                        </Button>
                      </div>
                    </div>

                    <Tabs
                      value={activeWeekTab}
                      onValueChange={(val) => setActiveWeekTab(String(val))}
                      className="space-y-4"
                    >
                      <TabsList className="w-full justify-start overflow-x-auto">
                        {plan.weeks.map((w) => (
                          <TabsTrigger
                            key={w.weekNumber}
                            value={`week-${w.weekNumber}`}
                          >
                            Week {w.weekNumber}
                            {w.isMilestoneCheckIn && (
                              <span className="size-1.5 rounded-full bg-primary" />
                            )}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {plan.weeks.map((w) => (
                        <TabsContent
                          key={w.weekNumber}
                          value={`week-${w.weekNumber}`}
                        >
                          <div className="rounded-[28px] border border-border bg-card p-6 space-y-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <Badge
                                  variant="secondary"
                                  className="mb-1 font-mono"
                                >
                                  {w.phaseName}
                                </Badge>
                                <h3 className="font-heading text-lg font-bold">
                                  {w.title}
                                </h3>
                              </div>
                              <span className="font-mono text-xs text-muted-foreground">
                                {w.dateRangeLabel}
                              </span>
                            </div>

                            <div className="space-y-2.5">
                              {w.tasks.map((t) => (
                                <label
                                  key={t.id}
                                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition select-none ${
                                    t.completed
                                      ? "border-border/50 bg-muted/30 opacity-70"
                                      : "border-border bg-background hover:border-primary/40"
                                  }`}
                                >
                                  <div className="flex items-center gap-3.5">
                                    <input
                                      type="checkbox"
                                      checked={t.completed}
                                      onChange={() =>
                                        toggleTask(w.weekNumber, t.id)
                                      }
                                      className="size-4 rounded accent-primary"
                                    />
                                    <div>
                                      <div
                                        className={`text-sm font-medium ${
                                          t.completed ? "line-through" : ""
                                        }`}
                                      >
                                        {t.title}
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        {t.whyThisTask}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="font-mono shrink-0"
                                  >
                                    {t.timing}
                                  </Badge>
                                </label>
                              ))}
                            </div>

                            <div className="rounded-2xl bg-muted/40 px-4 py-2.5 font-mono text-xs text-muted-foreground">
                              Guardrail: {w.cautionNote}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </>
            )}

            {/* ---------------------------------------------------------
                VIEW 5: PROGRESS & CHECK-IN (SLIDER + COLORED ANIMATED BENTO WITH PRO BLUR)
               --------------------------------------------------------- */}
            {view === "progress" && (
              <>
                {!baselineScan || !currentScan ? (
                  renderEmptyJourneyLoop(
                    "Track Your Skin Trajectory Over Time",
                    "Complete your Day 1 Baseline Scan first. As your event approaches, re-scan here to measure barrier improvements and recalibrate your VTO base finish."
                  )
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h1 className="font-heading text-2xl font-bold">
                          Milestone Check-In & Change Over Time
                        </h1>
                        <p className="text-muted-foreground text-xs">
                          Comparing Day 1 Baseline vs.{" "}
                          {currentScan.stage === "baseline"
                            ? "Projected Event Trajectory (Re-scan or preview Week 4)"
                            : currentScan.label}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveStage("midpoint")
                            setCameraDialogOpen(true)
                          }}
                        >
                          <IconCamera className="size-4" />
                          Take Check-In Re-Scan
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleSimulateTrajectoryStage(
                              activeStage === "final" ? "midpoint" : "final"
                            )
                          }
                        >
                          <IconSparkles className="size-4" />
                          {activeStage === "final"
                            ? "Preview Week 4 Check-In"
                            : "Preview Event Eve Peak"}
                        </Button>
                      </div>
                    </div>

                    {/* Before/After Drag Slider */}
                    <BeforeAfterSlider
                      beforeScan={baselineScan}
                      afterScan={
                        currentScan.stage !== "baseline"
                          ? currentScan
                          : {
                              ...baselineScan,
                              label: "Projected Week 4 Check-In",
                              overallScore: Math.min(
                                95,
                                baselineScan.overallScore + 11
                              ),
                              metrics: baselineScan.metrics.map((m) => ({
                                ...m,
                                score: Math.min(95, m.score + 11),
                              })),
                            }
                      }
                      outfit={selectedOutfit}
                    />

                    {/* Colored & Animated AnalyticsBento (Bottom row blurred unless isPro is ON!) */}
                    <AnalyticsBento {...checkInBentoProps} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* Global Slide-Over Sheet when any Skin Metric is clicked */}
      <Sheet
        open={Boolean(selectedMetric)}
        onOpenChange={(open) => {
          if (!open) setSelectedMetric(null)
        }}
      >
        <SheetContent side="right">
          {selectedMetric && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono uppercase">
                    {selectedMetric.zone}
                  </Badge>
                  <Badge variant="outline" className="font-mono uppercase">
                    {selectedMetric.concernLevel}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold mt-1">
                  {selectedMetric.label}
                </SheetTitle>
                <SheetDescription>
                  {selectedMetric.plainSummary}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-6">
                <div className="rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="flex justify-between font-mono text-xs">
                    <span>Current: {selectedMetric.score}/100</span>
                    <span className="text-primary font-semibold">
                      Event Target: {selectedMetric.targetByEvent}/100
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={selectedMetric.score} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Impact on Event-Day Makeup & VTO
                  </div>
                  <p className="text-sm leading-relaxed">
                    {selectedMetric.whatItMeans}
                  </p>
                </div>

                <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 space-y-1">
                  <div className="font-mono text-[10px] font-semibold uppercase text-primary">
                    Recommended Active Ingredient
                  </div>
                  <div className="font-heading text-sm font-bold">
                    {selectedMetric.activeIngredient}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
