"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Switch } from "@workspace/ui/components/switch"
import {
  IconDownload,
  IconShare,
  IconLock,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react"
import type {
  CountdownPlan,
  SkinScanResult,
  VTOLookResult,
} from "@/lib/types"

interface ShareCardBuilderProps {
  eventName: string
  eventDate: string
  daysRemaining: number
  scan: SkinScanResult
  look: VTOLookResult
  plan: CountdownPlan
}

export function ShareCardBuilder({
  eventName,
  eventDate,
  daysRemaining,
  scan,
  look,
  plan,
}: ShareCardBuilderProps) {
  const [includeSkinScores, setIncludeSkinScores] = React.useState(false)
  const [includeRoutineFocus, setIncludeRoutineFocus] = React.useState(true)
  const [copiedNotice, setCopiedNotice] = React.useState(false)

  const downloadPlanCardPng = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const grad = ctx.createLinearGradient(0, 0, 1080, 1350)
    grad.addColorStop(0, "#191412")
    grad.addColorStop(0.6, "#241B18")
    grad.addColorStop(1, look.outfit.primaryHex)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1350)

    ctx.strokeStyle = "rgba(255,255,255,0.18)"
    ctx.lineWidth = 3
    ctx.strokeRect(48, 48, 984, 1254)

    ctx.fillStyle = "#F43F5E"
    ctx.font = "600 26px sans-serif"
    ctx.fillText("READY • EVENT PREP COUNTDOWN", 96, 130)

    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 120px sans-serif"
    ctx.fillText(`${daysRemaining} DAYS TO GO`, 96, 275)

    ctx.fillStyle = "#F5E9E2"
    ctx.font = "bold 46px sans-serif"
    ctx.fillText(eventName.slice(0, 38), 96, 360)

    ctx.fillStyle = "rgba(255,255,255,0.68)"
    ctx.font = "30px sans-serif"
    ctx.fillText(`Event Date: ${eventDate}`, 96, 415)

    ctx.fillStyle = "rgba(255,255,255,0.08)"
    ctx.fillRect(96, 480, 888, 340)

    ctx.fillStyle = "#FCD34D"
    ctx.font = "600 26px sans-serif"
    ctx.fillText("SELECTED YOUCAM VTO EVENT LOOK", 136, 540)

    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 38px sans-serif"
    ctx.fillText(look.outfit.name, 136, 605)

    ctx.fillStyle = "rgba(255,255,255,0.85)"
    ctx.font = "30px sans-serif"
    ctx.fillText(`Makeup Prescription: ${look.makeup.lookName}`, 136, 665)
    ctx.fillText(
      `Base: ${look.makeup.baseFinish} • Lip: ${look.makeup.lipShadeName}`,
      136,
      720
    )

    const swatches = [
      look.outfit.primaryHex,
      look.makeup.foundationHex,
      look.makeup.cheekHex,
      look.makeup.lipHex,
    ]
    swatches.forEach((hex, idx) => {
      ctx.beginPath()
      ctx.arc(160 + idx * 74, 775, 22, 0, Math.PI * 2)
      ctx.fillStyle = hex
      ctx.fill()
      ctx.strokeStyle = "#FFFFFF"
      ctx.lineWidth = 3
      ctx.stroke()
    })

    if (includeSkinScores) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.16)"
      ctx.fillRect(96, 860, 888, 190)
      ctx.fillStyle = "#6EE7B7"
      ctx.font = "bold 28px sans-serif"
      ctx.fillText(
        `OPT-IN SKIN READINESS SCORE: ${scan.overallScore}/100 (${scan.label})`,
        136,
        920
      )
      ctx.fillStyle = "#FFFFFF"
      ctx.font = "26px sans-serif"
      ctx.fillText(
        `Undertone: ${scan.undertone.toUpperCase()} • Hydration: ${
          scan.metrics[0]?.score
        }/100 • Redness: ${scan.metrics[2]?.score}/100`,
        136,
        980
      )
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.06)"
      ctx.fillRect(96, 860, 888, 140)
      ctx.fillStyle = "rgba(255,255,255,0.7)"
      ctx.font = "26px sans-serif"
      ctx.fillText(
        "🔒 Skin Scan Photos & Diagnostic Metrics Hidden by Default",
        136,
        940
      )
    }

    if (includeRoutineFocus) {
      ctx.fillStyle = "rgba(255,255,255,0.85)"
      ctx.font = "28px sans-serif"
      ctx.fillText(
        `Current Phase: ${plan.weeks[0]?.phaseName || "Barrier Reset"}`,
        96,
        1140
      )
    }

    ctx.fillStyle = "rgba(255,255,255,0.5)"
    ctx.font = "24px sans-serif"
    ctx.fillText(
      "Powered by YouCam Skin AI & eCommerce VTO • Built with Ready",
      96,
      1250
    )

    const link = document.createElement("a")
    link.download = `ready-countdown-${eventName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const copyShareSummary = async () => {
    const text = `Counting down ${daysRemaining} days until ${eventName}! ✨ My event look: ${look.outfit.name} paired with ${look.makeup.lookName} (${look.makeup.baseFinish}), matched via YouCam Skin AI & VTO.`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedNotice(true)
      setTimeout(() => setCopiedNotice(false), 2500)
    } catch {
      setCopiedNotice(true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Live Visual Preview Card */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/15 p-6 text-white shadow-xl"
        style={{
          background: `linear-gradient(145deg, #171210 0%, #241A17 55%, ${look.outfit.primaryHex} 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-amber-300">
            <IconSparkles className="size-3" /> READY COUNTDOWN
          </span>
          <span className="font-mono text-xs text-white/65">{eventDate}</span>
        </div>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="font-heading text-5xl font-extrabold tracking-tight">
            {daysRemaining}
          </span>
          <span className="font-heading text-xs font-semibold tracking-wider text-white/80 uppercase">
            Days Left
          </span>
        </div>

        <h3 className="mt-1 font-heading text-lg font-bold text-white">
          {eventName}
        </h3>

        <div className="mt-4 rounded-2xl border border-white/15 bg-black/40 p-3.5 backdrop-blur-md">
          <div className="font-heading text-sm font-bold">{look.outfit.name}</div>
          <div className="text-xs text-white/75">
            {look.makeup.lookName} • {look.makeup.baseFinish}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            {[
              look.outfit.primaryHex,
              look.makeup.foundationHex,
              look.makeup.cheekHex,
              look.makeup.lipHex,
            ].map((hex, i) => (
              <span
                key={i}
                className="size-4 rounded-full border border-white/50"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {includeSkinScores ? (
          <div className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs text-emerald-200">
            Skin Readiness: <strong>{scan.overallScore}/100</strong> •{" "}
            {scan.undertone.toUpperCase()} undertone
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/60">
            <IconLock className="size-3 text-emerald-400" />
            <span>Skin scan & scores hidden by default</span>
          </div>
        )}
      </div>

      {/* Compact Privacy Switchers */}
      <div className="space-y-2.5 rounded-2xl border border-border bg-muted/30 p-3.5 text-xs">
        <div className="flex items-center justify-between">
          <span>Include Skin Readiness Score ({scan.overallScore}/100)</span>
          <Switch
            size="sm"
            checked={includeSkinScores}
            onCheckedChange={(v) => setIncludeSkinScores(Boolean(v))}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Include Current Prep Phase Tag</span>
          <Switch
            size="sm"
            checked={includeRoutineFocus}
            onCheckedChange={(v) => setIncludeRoutineFocus(Boolean(v))}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button type="button" onClick={downloadPlanCardPng}>
          <IconDownload className="size-4" />
          Download PNG
        </Button>
        <Button type="button" variant="secondary" onClick={copyShareSummary}>
          {copiedNotice ? (
            <>
              <IconCheck className="size-4" />
              Copied!
            </>
          ) : (
            <>
              <IconShare className="size-4" />
              Copy Caption
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
