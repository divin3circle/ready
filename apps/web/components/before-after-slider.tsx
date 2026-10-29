"use client"

import * as React from "react"
import {
  IconArrowsLeftRight,
  IconSparkles,
} from "@tabler/icons-react"
import type { OutfitOption, SkinScanResult } from "@/lib/types"
import { buildLookForSkinAndOutfit } from "@/lib/demo-data"

interface BeforeAfterSliderProps {
  beforeScan: SkinScanResult
  afterScan: SkinScanResult
  outfit: OutfitOption
}

export function BeforeAfterSlider({
  beforeScan,
  afterScan,
  outfit,
}: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = React.useState(52)

  const beforeLook = React.useMemo(
    () => buildLookForSkinAndOutfit(beforeScan, outfit),
    [beforeScan, outfit]
  )
  const afterLook = React.useMemo(
    () => buildLookForSkinAndOutfit(afterScan, outfit),
    [afterScan, outfit]
  )

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border bg-stone-950 text-white shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-3 text-xs">
        <span className="rounded-full bg-stone-800 px-3 py-1 font-mono text-[11px] text-stone-300">
          BEFORE · {beforeScan.label} ({beforeScan.overallScore}/100)
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
          <IconArrowsLeftRight className="size-3.5" /> Drag slider to compare
        </span>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-mono text-[11px] text-emerald-300">
          AFTER · {afterScan.label} ({afterScan.overallScore}/100)
        </span>
      </div>

      <div className="relative h-80 w-full overflow-hidden sm:h-96">
        {/* AFTER LAYER (Full width underneath) */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-stone-950 p-6">
          {afterScan.imageDataUrl && (
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={afterScan.imageDataUrl}
                alt="After trajectory portrait"
                className="h-full w-full object-contain filter contrast-[1.05] brightness-[1.04] saturate-[1.08]"
              />
              <div
                className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                style={{
                  background: `radial-gradient(circle at 50% 40%, rgba(255,255,255,0.35) 0%, transparent 65%)`,
                }}
              />
            </div>
          )}

          <div className="relative z-10 ml-auto max-w-[240px] rounded-2xl border border-emerald-400/30 bg-black/65 p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
              <IconSparkles className="size-3.5" />
              <span>{afterScan.label}</span>
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-white">
              {afterScan.overallScore}
              <span className="text-xs font-normal text-white/60"> / 100</span>
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-xs text-emerald-300">
                +{afterScan.overallScore - beforeScan.overallScore} pts
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-white/80">
              VTO unlocked:{" "}
              <strong className="text-amber-300">
                {afterLook.makeup.baseFinish}
              </strong>
            </p>
          </div>

          {!afterScan.imageDataUrl && (
            <div className="relative z-10 mx-auto flex items-center gap-4">
              <div
                className="relative flex size-32 items-center justify-center rounded-full border-2 border-emerald-400/50 shadow-2xl sm:size-36"
                style={{
                  background: `radial-gradient(circle at 38% 35%, #F2D5BE, ${afterScan.skinToneHex} 68%, #B58667 100%)`,
                }}
              >
                <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[10px] text-emerald-300 backdrop-blur-xs">
                  Luminous Satin Glow
                </span>
              </div>
            </div>
          )}

          <div className="relative z-10 flex justify-end font-mono text-xs text-emerald-200/90">
            <span className="rounded-full bg-black/60 px-3 py-1 backdrop-blur-xs">
              Hydration {afterScan.metrics[0]?.score}/100 · Sebum{" "}
              {afterScan.metrics[1]?.score}/100 · Redness{" "}
              {afterScan.metrics[2]?.score}/100
            </span>
          </div>
        </div>

        {/* BEFORE LAYER (Clipped by sliderPos) */}
        <div
          className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-stone-950 p-6"
          style={{
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
          }}
        >
          {beforeScan.imageDataUrl && (
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={beforeScan.imageDataUrl}
                alt="Before trajectory portrait"
                className="h-full w-full object-contain filter contrast-[1.02] saturate-[0.98]"
              />
              <div
                className="pointer-events-none absolute inset-0 mix-blend-color"
                style={{
                  background: `radial-gradient(circle at 50% 50%, rgba(225, 75, 90, 0.15) 0%, transparent 60%)`,
                }}
              />
            </div>
          )}

          <div className="relative z-10 max-w-[240px] rounded-2xl border border-rose-400/30 bg-black/65 p-3.5 backdrop-blur-md">
            <div className="text-[11px] font-semibold text-rose-300">
              {beforeScan.label}
            </div>
            <div className="mt-1 font-heading text-2xl font-bold text-white">
              {beforeScan.overallScore}
              <span className="text-xs font-normal text-white/60"> / 100</span>
            </div>
            <p className="mt-1.5 text-[11px] text-white/80">
              VTO set to:{" "}
              <strong className="text-rose-200">
                {beforeLook.makeup.baseFinish}
              </strong>
            </p>
          </div>

          {!beforeScan.imageDataUrl && (
            <div className="relative z-10 mx-auto flex items-center gap-4">
              <div
                className="relative flex size-32 items-center justify-center rounded-full border-2 border-rose-400/50 shadow-2xl sm:size-36"
                style={{
                  background: `radial-gradient(circle at 60% 60%, rgba(225, 75, 90, 0.42), transparent 55%), radial-gradient(circle at 38% 35%, #E5B99A, ${beforeScan.skinToneHex} 70%, #9E6E52 100%)`,
                }}
              >
                <span className="rounded-full bg-black/65 px-2.5 py-1 font-mono text-[10px] text-rose-200 backdrop-blur-xs">
                  Cheek Redness + Oil
                </span>
              </div>
            </div>
          )}

          <div className="relative z-10 font-mono text-xs text-rose-200/90">
            <span className="rounded-full bg-black/60 px-3 py-1 backdrop-blur-xs">
              Hydration {beforeScan.metrics[0]?.score}/100 · Sebum{" "}
              {beforeScan.metrics[1]?.score}/100 · Redness{" "}
              {beforeScan.metrics[2]?.score}/100
            </span>
          </div>
        </div>

        {/* Vertical Divider Line */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -left-4 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-stone-900 text-white shadow-lg">
            <IconArrowsLeftRight className="size-4" />
          </div>
        </div>

        <input
          type="range"
          min={5}
          max={95}
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          aria-label="Before and after skin comparison slider"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  )
}
