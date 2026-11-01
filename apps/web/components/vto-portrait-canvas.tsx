"use client"

import * as React from "react"
import {
  IconSparkles,
  IconEye,
  IconPalette,
  IconHanger,
  IconShieldCheck,
} from "@tabler/icons-react"
import type {
  MakeupPrescription,
  OutfitOption,
  SkinScanResult,
} from "@/lib/types"

interface VTOPortraitCanvasProps {
  scan: SkinScanResult
  outfit: OutfitOption
  makeup: MakeupPrescription
  vtoImageUrl?: string
  isGenerating?: boolean
  viewMode?: "vto" | "skin-zones"
  badgeText?: string
  compact?: boolean
}

export function VTOPortraitCanvas({
  scan,
  outfit,
  makeup,
  vtoImageUrl,
  isGenerating = false,
  viewMode = "vto",
  badgeText,
  compact = false,
}: VTOPortraitCanvasProps) {
  const [overlayMode, setOverlayMode] = React.useState<"vto" | "skin-zones">(
    viewMode
  )

  React.useEffect(() => {
    setOverlayMode(viewMode)
  }, [viewMode])

  const moisture =
    scan.metrics.find((m) => m.key === "moisture")?.score ?? 70
  const redness =
    scan.metrics.find((m) => m.key === "redness")?.score ?? 70
  const oiliness =
    scan.metrics.find((m) => m.key === "oiliness")?.score ?? 70

  const isLuminous =
    makeup.baseFinish === "Luminous Satin" ||
    makeup.baseFinish === "Sheer Dewy Skin-Tint"

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white shadow-xl">
      {/* Ambient studio lighting tinted by the selected outfit */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-35 blur-3xl transition-all duration-700"
        style={{ backgroundColor: outfit.primaryHex }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 right-4 h-48 w-48 rounded-full opacity-25 blur-3xl transition-all duration-700"
        style={{ backgroundColor: makeup.lipHex }}
      />

      {/* Top status bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] font-medium tracking-tight text-white/90 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {badgeText ||
              (overlayMode === "vto"
                ? "YouCam VTO • Skin + Apparel Sync"
                : "YouCam Skin AI • Zone Topography")}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setOverlayMode("vto")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              overlayMode === "vto"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <IconSparkles className="size-3" />
            VTO Look
          </button>
          <button
            type="button"
            onClick={() => setOverlayMode("skin-zones")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
              overlayMode === "skin-zones"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-white/70 hover:text-white"
            }`}
          >
            <IconEye className="size-3" />
            Skin Map
          </button>
        </div>
      </div>

      {/* Main Studio Portrait & Garment Composite */}
      <div
        className={`relative mx-auto flex w-full flex-col items-center justify-center overflow-hidden bg-stone-950/90 ${
          compact ? "h-80" : "h-[460px] sm:h-[540px]"
        }`}
      >
        {/* Loading HUD: Neural Cloth Transfer in Progress */}
        {isGenerating && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-xs transition-all">
            <div className="relative flex flex-col items-center gap-3 px-6 text-center">
              <div className="relative size-16">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
                <div className="flex size-16 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/15 backdrop-blur-md">
                  <IconSparkles className="size-7 text-emerald-300 animate-spin" />
                </div>
              </div>
              <div>
                <div className="font-heading text-sm font-bold text-white tracking-wide">
                  YouCam Cloth VTO Engine
                </div>
                <div className="font-mono text-xs text-emerald-300/90 mt-0.5">
                  Fitting {outfit.name}...
                </div>
              </div>
              <div className="w-48 overflow-hidden rounded-full bg-white/10 p-0.5">
                <div className="h-1 rounded-full bg-emerald-400 animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

        {/* CASE 1: Photorealistic Live YouCam Cloth VTO Try-On Result */}
        {overlayMode === "vto" && vtoImageUrl ? (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vtoImageUrl}
              alt={`YouCam VTO - ${outfit.name}`}
              className="h-full w-full object-contain transition-all duration-500"
            />
            {/* Subtle cosmetic finish glow */}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              style={{
                background: `radial-gradient(circle at 50% 30%, ${makeup.foundationHex}44, transparent 65%)`,
              }}
            />
            {/* Verified YouCam Cloth VTO Badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-stone-900/85 px-2.5 py-1 text-[10px] font-medium text-emerald-400 backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>YouCam Neural Cloth VTO Active</span>
            </div>
          </div>
        ) : overlayMode === "skin-zones" && scan.imageDataUrl ? (
          /* CASE 2: Skin Zones HUD on User Raw Photo */
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scan.imageDataUrl}
              alt="User scan portrait"
              className="h-full w-full object-contain transition-all duration-500 contrast(1.08)"
            />
            {/* AR Skin Zones HUD Overlay directly on user photo */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {/* T-Zone Reticle */}
              <div className="absolute top-[28%] flex items-center gap-1.5 rounded-full border border-emerald-400/70 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] text-emerald-200 backdrop-blur-xs animate-pulse">
                <span>T-Zone Sebum • {oiliness}/100</span>
              </div>
              {/* Cheeks Reticle */}
              <div className="absolute top-[48%] flex w-[68%] justify-between px-2">
                <span className="rounded-full border border-pink-400/70 bg-pink-500/20 px-2 py-0.5 font-mono text-[9px] text-pink-200 backdrop-blur-xs">
                  Cheek • {moisture}/100
                </span>
                <span className="rounded-full border border-amber-400/70 bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] text-amber-200 backdrop-blur-xs">
                  Redness • {redness}/100
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* CASE 3: High-Fashion Garment Drape Rig (Dressing the silhouette with Outfit + Skin AI Rx) */
          <>
            <svg
              viewBox="0 0 360 420"
              className="h-full w-full max-w-[360px] select-none"
              aria-label={`Virtual try-on preview wearing ${outfit.name} with ${makeup.lookName}`}
            >
            <defs>
              <radialGradient id={`skinGrad-${scan.scanId}`} cx="50%" cy="40%" r="55%">
                <stop
                  offset="0%"
                  stopColor={ isLuminous ? "#ECCBB1" : scan.skinToneHex || "#D5A787" }
                />
                <stop offset="70%" stopColor={scan.skinToneHex || "#D5A787"} />
                <stop offset="100%" stopColor="#B38364" />
              </radialGradient>

              <linearGradient id={`dressGrad-${outfit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={outfit.primaryHex} />
                <stop
                  offset="55%"
                  stopColor={outfit.primaryHex}
                  stopOpacity="0.92"
                />
                <stop offset="100%" stopColor="#091310" />
              </linearGradient>

              <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
                <stop
                  offset="0%"
                  stopColor={
                    overlayMode === "skin-zones" && redness < 72
                      ? "#E05353"
                      : makeup.cheekHex
                  }
                  stopOpacity={
                    overlayMode === "skin-zones" && redness < 72 ? "0.48" : "0.34"
                  }
                />
                <stop offset="100%" stopColor={makeup.cheekHex} stopOpacity="0" />
              </radialGradient>

              <radialGradient id="satinHighlight" cx="50%" cy="35%" r="40%">
                <stop
                  offset="0%"
                  stopColor="#FFFFFF"
                  stopOpacity={isLuminous ? "0.42" : "0.14"}
                />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Editorial Studio Arch Backdrop */}
            <path
              d="M 60 420 L 60 150 A 120 120 0 0 1 300 150 L 300 420 Z"
              fill={outfit.primaryHex}
              fillOpacity="0.16"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />

            {/* Hair Silhouette Back */}
            <path
              d="M 102 150 C 92 220, 98 285, 112 315 L 248 315 C 262 285, 268 220, 258 150 C 252 80, 222 52, 180 52 C 138 52, 108 80, 102 150 Z"
              fill="#1E1612"
            />

            {/* Neck & Décolletage */}
            <path
              d="M 152 225 L 152 288 L 100 315 L 260 315 L 208 288 L 208 225 Z"
              fill={`url(#skinGrad-${scan.scanId})`}
            />

            {/* Collarbone subtle highlight */}
            <path
              d="M 132 302 Q 160 310 175 304 M 228 302 Q 200 310 185 304"
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Apparel VTO Garment Drape */}
            {outfit.garmentOverlaySvg === "navy-blazer" ? (
              <g>
                {/* Inner Silk Camisole */}
                <path
                  d="M 145 305 Q 180 332 215 305 L 225 420 L 135 420 Z"
                  fill={outfit.secondaryHex}
                />
                {/* Tailored Blazer Jacket & Sharp Lapels */}
                <path
                  d="M 70 420 L 88 302 L 146 286 L 176 365 L 180 420 Z"
                  fill={`url(#dressGrad-${outfit.id})`}
                />
                <path
                  d="M 290 420 L 272 302 L 214 286 L 184 365 L 180 420 Z"
                  fill={`url(#dressGrad-${outfit.id})`}
                />
                {/* Lapel Fold Lines */}
                <path
                  d="M 146 286 L 132 332 L 176 365 M 214 286 L 228 332 L 184 365"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </g>
            ) : (
              <g>
                {/* Silk / Satin Cowl & Draped Evening Bodice */}
                <path
                  d="M 74 420 C 78 345, 96 306, 128 295 Q 180 335 232 295 C 264 306, 282 345, 286 420 Z"
                  fill={`url(#dressGrad-${outfit.id})`}
                />
                {/* Silk Charmeuse Light Folds */}
                <path
                  d="M 128 295 Q 180 348 232 295 M 118 328 Q 180 375 242 328 M 136 365 Q 180 395 224 365"
                  stroke={outfit.secondaryHex}
                  strokeOpacity="0.38"
                  strokeWidth="2"
                  fill="none"
                />
                {/* Delicate Spaghetti / Asymmetric Straps */}
                <path
                  d="M 132 296 L 138 272 M 228 296 L 222 272"
                  stroke={outfit.secondaryHex}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Face Contour */}
            <path
              d="M 122 142 C 122 96, 146 74, 180 74 C 214 74, 238 96, 238 142 C 238 192, 212 242, 180 246 C 148 242, 122 192, 122 142 Z"
              fill={`url(#skinGrad-${scan.scanId})`}
            />

            {/* Luminous Satin Cheekbone Glow */}
            <ellipse
              cx="145"
              cy="166"
              rx="22"
              ry="14"
              fill="url(#satinHighlight)"
            />
            <ellipse
              cx="215"
              cy="166"
              rx="22"
              ry="14"
              fill="url(#satinHighlight)"
            />

            {/* Makeup VTO Cheek Blush Drape */}
            <ellipse cx="142" cy="174" rx="22" ry="15" fill="url(#cheekBlush)" />
            <ellipse cx="218" cy="174" rx="22" ry="15" fill="url(#cheekBlush)" />

            {/* Eyebrows */}
            <path
              d="M 136 132 Q 152 124 168 130 M 192 130 Q 208 124 224 132"
              stroke="#2A1D17"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Makeup VTO Eyeshadow Wash */}
            <path
              d="M 138 145 Q 153 134 167 145 Z M 193 145 Q 207 134 222 145 Z"
              fill={makeup.eyeHex}
              fillOpacity={overlayMode === "vto" ? "0.45" : "0.15"}
            />

            {/* Eyes */}
            <ellipse cx="153" cy="147" rx="11" ry="5.5" fill="#FFFFFF" />
            <circle cx="153" cy="147" r="4.8" fill="#3B261D" />
            <circle cx="154.5" cy="145.5" r="1.5" fill="#FFFFFF" />

            <ellipse cx="207" cy="147" rx="11" ry="5.5" fill="#FFFFFF" />
            <circle cx="207" cy="147" r="4.8" fill="#3B261D" />
            <circle cx="208.5" cy="145.5" r="1.5" fill="#FFFFFF" />

            {/* Eyeliner Wing */}
            <path
              d="M 140 146 Q 153 139 166 146 M 194 146 Q 207 139 220 146"
              stroke="#1C130F"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Nose Bridge & Tip */}
            <path
              d="M 180 142 L 178 180 Q 180 185 185 182"
              stroke="rgba(110,70,45,0.45)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Makeup VTO Lip Color & Finish */}
            <path
              d="M 161 204 Q 171 197 180 201 Q 189 197 199 204 Q 189 207 180 207 Q 171 207 161 204 Z"
              fill={overlayMode === "vto" ? makeup.lipHex : "#C47A74"}
            />
            <path
              d="M 161 204 Q 180 220 199 204 Q 180 207 161 204 Z"
              fill={overlayMode === "vto" ? makeup.lipHex : "#C47A74"}
              fillOpacity="0.92"
            />
            {/* Satin Lip Highlight */}
            {overlayMode === "vto" && (
              <path
                d="M 172 209 Q 180 212 188 209"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {/* Hair Front Framing Strands */}
            <path
              d="M 122 125 C 128 88, 162 72, 180 72 C 198 72, 232 88, 238 125 C 228 96, 202 84, 180 84 C 158 84, 132 96, 122 125 Z"
              fill="#1E1612"
            />

            {/* AR Skin Diagnostic Zone Overlays when in "skin-zones" mode */}
            {overlayMode === "skin-zones" && (
              <g>
                {/* T-Zone Sebum Mesh */}
                <path
                  d="M 152 102 L 208 102 L 196 126 L 185 180 L 175 180 L 164 126 Z"
                  fill="rgba(245, 158, 11, 0.18)"
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                {/* Cheek Moisture / Redness Zones */}
                <circle
                  cx="145"
                  cy="174"
                  r="18"
                  fill="rgba(56, 189, 248, 0.16)"
                  stroke="#38BDF8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <circle
                  cx="215"
                  cy="174"
                  r="18"
                  fill="rgba(244, 63, 94, 0.16)"
                  stroke="#FB7185"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                {/* Callout Pills */}
                <g transform="translate(18, 96)">
                  <rect
                    width="106"
                    height="24"
                    rx="12"
                    fill="rgba(15,15,15,0.82)"
                    stroke="rgba(245,158,11,0.5)"
                  />
                  <text
                    x="10"
                    y="15"
                    fill="#FDE68A"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    Sebum: {oiliness}/100
                  </text>
                </g>
                <g transform="translate(14, 165)">
                  <rect
                    width="108"
                    height="24"
                    rx="12"
                    fill="rgba(15,15,15,0.82)"
                    stroke="rgba(56,189,248,0.5)"
                  />
                  <text
                    x="10"
                    y="15"
                    fill="#BAE6FD"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    Hydration: {moisture}/100
                  </text>
                </g>
                <g transform="translate(234, 165)">
                  <rect
                    width="112"
                    height="24"
                    rx="12"
                    fill="rgba(15,15,15,0.82)"
                    stroke="rgba(251,113,133,0.5)"
                  />
                  <text
                    x="10"
                    y="15"
                    fill="#FECDD3"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    Redness: {redness}/100
                  </text>
                </g>
              </g>
            )}
          </svg>
          {scan.imageDataUrl && overlayMode === "vto" && !vtoImageUrl && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 rounded-2xl border border-white/15 bg-black/70 p-1.5 shadow-lg backdrop-blur-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scan.imageDataUrl}
                alt="Uploaded scan selfie"
                className="size-10 rounded-xl object-cover border border-white/20"
              />
              <div className="pr-1.5 text-left">
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Your Skin AI
                </div>
                <div className="text-[11px] font-semibold text-white">
                  {scan.undertone} • {scan.stage}
                </div>
              </div>
            </div>
          )}
          </>
        )}

        {/* Bottom Floating Look & Shade Swatch Bar */}
        <div className="relative z-10 w-full bg-gradient-to-t from-black/95 via-black/80 to-transparent px-4 pt-6 pb-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300/90">
                <IconShieldCheck className="size-3.5" />
                <span>{makeup.vibeTag}</span>
              </div>
              <h4 className="font-heading text-sm font-semibold tracking-tight text-white">
                {makeup.lookName}
              </h4>
              <p className="text-[11px] text-white/70">
                Wearing <span className="text-white font-medium">{outfit.name}</span> •{" "}
                {makeup.baseFinish}
              </p>
            </div>

            {/* Live Swatches */}
            <div className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/10 px-2.5 py-1.5 backdrop-blur-md">
              <div className="flex items-center gap-1" title={`Outfit: ${outfit.primaryColor}`}>
                <IconHanger className="size-3 text-white/70" />
                <span
                  className="size-4 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: outfit.primaryHex }}
                />
              </div>
              <span className="text-white/25">|</span>
              <div className="flex items-center gap-1" title={`Base: ${makeup.foundationShade}`}>
                <IconPalette className="size-3 text-white/70" />
                <span
                  className="size-4 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: makeup.foundationHex }}
                />
                <span
                  className="size-4 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: makeup.cheekHex }}
                  title={`Cheek: ${makeup.cheekShadeName}`}
                />
                <span
                  className="size-4 rounded-full border border-white/40 shadow-xs"
                  style={{ backgroundColor: makeup.lipHex }}
                  title={`Lip: ${makeup.lipShadeName}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
