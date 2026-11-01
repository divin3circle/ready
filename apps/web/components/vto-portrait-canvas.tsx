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
          compact ? "h-80" : "h-[520px] sm:h-[620px]"
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
              viewBox="0 0 320 600"
              className="h-full w-full max-w-[340px] select-none"
              aria-label={`Virtual try-on preview wearing ${outfit.name} with ${makeup.lookName}`}
            >
              <defs>
                <radialGradient id={`skinGrad-${scan.scanId}`} cx="50%" cy="40%" r="55%">
                  <stop
                    offset="0%"
                    stopColor={isLuminous ? "#ECCBB1" : scan.skinToneHex || "#D5A787"}
                  />
                  <stop offset="70%" stopColor={scan.skinToneHex || "#D5A787"} />
                  <stop offset="100%" stopColor="#9E6B4A" />
                </radialGradient>

                <linearGradient id={`dressGrad-${outfit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={outfit.primaryHex} />
                  <stop offset="55%" stopColor={outfit.primaryHex} stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#080C14" />
                </linearGradient>

                <linearGradient id={`trouserGrad-${outfit.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={outfit.primaryHex} />
                  <stop offset="85%" stopColor={outfit.primaryHex} stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#080A0F" />
                </linearGradient>

                <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
                  <stop
                    offset="0%"
                    stopColor={overlayMode === "skin-zones" && redness < 72 ? "#E05353" : makeup.cheekHex}
                    stopOpacity={overlayMode === "skin-zones" && redness < 72 ? "0.48" : "0.34"}
                  />
                  <stop offset="100%" stopColor={makeup.cheekHex} stopOpacity="0" />
                </radialGradient>

                <radialGradient id="satinHighlight" cx="50%" cy="35%" r="40%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity={isLuminous ? "0.42" : "0.14"} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Editorial Studio Arch Backdrop */}
              <path
                d="M 40 600 L 40 85 A 120 120 0 0 1 280 85 L 280 600 Z"
                fill={outfit.primaryHex}
                fillOpacity="0.15"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />

              {/* -------------------------------------------------------------
                  MENSWEAR FULL-BODY EDITORIAL SILHOUETTE (Clean Straight Pose)
                 ------------------------------------------------------------- */}
              {outfit.gender === "menswear" ? (
                <g>
                  {/* Tailored Straight Trousers (y=295..545) */}
                  <g>
                    {/* Left Leg */}
                    <path
                      d="M 124 298 L 118 545 L 152 545 L 158 350 Z"
                      fill={`url(#trouserGrad-${outfit.id})`}
                    />
                    {/* Right Leg */}
                    <path
                      d="M 196 298 L 202 545 L 168 545 L 162 350 Z"
                      fill={`url(#trouserGrad-${outfit.id})`}
                    />
                    {/* Center Trouser Ironed Crease Lines */}
                    <line x1="135" y1="310" x2="135" y2="542" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
                    <line x1="185" y1="310" x2="185" y2="542" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
                    {/* Tuxedo Satin Side Stripe */}
                    {outfit.id === "mens-bespoke-tuxedo" && (
                      <>
                        <line x1="124" y1="298" x2="118" y2="545" stroke="#090A0D" strokeWidth="2.5" />
                        <line x1="196" y1="298" x2="202" y2="545" stroke="#090A0D" strokeWidth="2.5" />
                      </>
                    )}
                  </g>

                  {/* Polished Dress Shoes / Loafers (y=545..572) */}
                  <g>
                    {/* Left Shoe */}
                    <path d="M 112 545 L 112 568 Q 134 574 154 568 L 154 545 Z" fill="#0A0A0D" />
                    {/* Right Shoe */}
                    <path d="M 166 545 L 166 568 Q 186 574 208 568 L 208 545 Z" fill="#0A0A0D" />
                    {/* Leather Sole Highlights */}
                    <path d="M 110 568 Q 134 575 156 568 M 164 568 Q 186 575 210 568" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" />
                  </g>

                  {/* Crisp Poplin Shirt Bib & Neckwear (y=136..298) */}
                  <path d="M 148 136 L 172 136 L 166 295 L 154 295 Z" fill="#F8F9FA" />
                  {/* Collar Points */}
                  <path d="M 146 136 L 154 150 L 160 144 L 166 150 L 174 136 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.8" />

                  {/* Neckwear based on suit style */}
                  {outfit.garmentOverlaySvg === "mens-tuxedo" || outfit.garmentOverlaySvg === "mens-velvet-dinner" ? (
                    <>
                      {/* Black Satin Bow-Tie */}
                      <path d="M 152 144 L 160 147 L 168 144 L 168 152 L 160 149 L 152 152 Z" fill="#090A0D" />
                      {/* Black Satin Cummerbund / Waistcoat */}
                      <path d="M 146 280 L 174 280 L 172 298 L 148 298 Z" fill="#090A0D" />
                    </>
                  ) : outfit.garmentOverlaySvg === "mens-suit-terracotta" ? (
                    /* Open knit polo collar */
                    <path d="M 148 136 L 160 156 L 172 136 Z" fill="#F0E5D8" />
                  ) : (
                    /* Executive Silk Tie */
                    <path d="M 157 146 L 163 146 L 164 260 L 160 270 L 156 260 Z" fill={outfit.accentHex} />
                  )}

                  {/* Tailored Suit Jacket (y=140..325) */}
                  <g>
                    {/* Left Jacket Body */}
                    <path d="M 82 148 L 148 140 L 162 275 L 100 322 L 82 148 Z" fill={`url(#dressGrad-${outfit.id})`} />
                    {/* Right Jacket Body */}
                    <path d="M 238 148 L 172 140 L 158 275 L 220 322 L 238 148 Z" fill={`url(#dressGrad-${outfit.id})`} />

                    {/* Lapels with Contrast Satin / Texture */}
                    <path
                      d="M 148 140 L 124 195 L 160 275 L 153 275 L 136 182 L 148 140 Z"
                      fill={outfit.secondaryHex}
                      fillOpacity={outfit.id === "mens-bespoke-tuxedo" || outfit.id === "mens-emerald-velvet-dinner" ? 0.95 : 0.35}
                    />
                    <path
                      d="M 172 140 L 196 195 L 160 275 L 167 275 L 184 182 L 172 140 Z"
                      fill={outfit.secondaryHex}
                      fillOpacity={outfit.id === "mens-bespoke-tuxedo" || outfit.id === "mens-emerald-velvet-dinner" ? 0.95 : 0.35}
                    />

                    {/* Pocket Square in Breast Pocket */}
                    <rect x="108" y="192" width="16" height="2" fill="rgba(255,255,255,0.4)" />
                    <polygon points="112,192 116,183 120,192" fill="#F8F9FA" />

                    {/* Waist Button */}
                    <circle cx="160" cy="278" r="2.5" fill="#0A0A0D" stroke="#D1D5DB" strokeWidth="0.8" />
                  </g>

                  {/* Arms & Hands in Natural Straight Relaxed Pose (y=148..342) */}
                  <g>
                    {/* Left Sleeve */}
                    <path d="M 82 148 L 100 156 L 94 318 L 76 318 Z" fill={`url(#dressGrad-${outfit.id})`} />
                    {/* Right Sleeve */}
                    <path d="M 238 148 L 220 156 L 226 318 L 244 318 Z" fill={`url(#dressGrad-${outfit.id})`} />

                    {/* Shirt Cuffs */}
                    <rect x="76" y="318" width="18" height="4" fill="#F8F9FA" rx="1" />
                    <rect x="226" y="318" width="18" height="4" fill="#F8F9FA" rx="1" />

                    {/* Hands with Calibrated Skin AI Tone */}
                    <path d="M 77 322 L 93 322 Q 95 342 85 342 Q 75 342 77 322 Z" fill={`url(#skinGrad-${scan.scanId})`} />
                    <path d="M 227 322 L 243 322 Q 245 342 235 342 Q 225 342 227 322 Z" fill={`url(#skinGrad-${scan.scanId})`} />
                  </g>

                  {/* Neck */}
                  <path d="M 149 106 L 149 138 L 171 138 L 171 106 Z" fill={`url(#skinGrad-${scan.scanId})`} />

                  {/* Head & Masculine Haircut */}
                  <path
                    d="M 136 70 C 136 46, 146 42, 160 42 C 174 42, 184 46, 184 70 C 184 92, 175 110, 160 114 C 145 110, 136 92, 136 70 Z"
                    fill={`url(#skinGrad-${scan.scanId})`}
                  />
                  {/* Clean masculine hairline & fade */}
                  <path
                    d="M 134 72 C 132 42, 144 32, 160 32 C 176 32, 188 42, 186 72 C 186 78, 184 82, 182 86 L 180 86 L 180 64 Q 160 54 140 64 L 140 86 L 138 86 Z"
                    fill="#151210"
                  />

                  {/* Groomed Facial Features (Straight Forward Expression) */}
                  <path d="M 142 66 Q 152 63 158 66 M 162 66 Q 168 63 178 66" stroke="#221814" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <ellipse cx="150" cy="74" rx="4.5" ry="2.5" fill="#2B1A13" />
                  <ellipse cx="170" cy="74" rx="4.5" ry="2.5" fill="#2B1A13" />
                  <path d="M 160 72 L 159 86 Q 160 88 163 87" stroke="rgba(110,70,45,0.45)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                  <path d="M 152 98 Q 160 101 168 98" stroke={makeup.lipHex || "#A8705C"} strokeWidth="2.2" strokeLinecap="round" fill="none" />

                  {/* Zone reticles if in skin-zones mode */}
                  {overlayMode === "skin-zones" && (
                    <g>
                      <rect x="148" y="58" width="24" height="28" fill="rgba(245, 158, 11, 0.22)" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="145" cy="80" r="10" fill="rgba(56, 189, 248, 0.2)" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="175" cy="80" r="10" fill="rgba(244, 63, 94, 0.2)" stroke="#FB7185" strokeWidth="1" strokeDasharray="2 2" />
                    </g>
                  )}
                </g>
              ) : (
                /* ---------------------------------------------------------------
                   WOMENSWEAR FULL-BODY EDITORIAL SILHOUETTE (Clean Straight Pose)
                   --------------------------------------------------------------- */
                <g>
                  {/* Full-Length Draped Evening Gown / Midi Skirt (y=265..545) */}
                  <g>
                    <path
                      d="M 132 265 Q 160 272 188 265 L 210 545 Q 160 555 110 545 Z"
                      fill={`url(#dressGrad-${outfit.id})`}
                    />
                    {/* Fluid Silk Charmeuse Drape Lines */}
                    <path
                      d="M 142 270 Q 146 410 138 545 M 178 270 Q 174 410 182 545"
                      stroke={outfit.secondaryHex}
                      strokeOpacity="0.35"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </g>

                  {/* Evening Shoes / Heels (y=545..568) */}
                  <g>
                    <path d="M 132 545 L 132 566 Q 142 570 152 566 L 152 545 Z" fill="#0C0A0D" />
                    <path d="M 168 545 L 168 566 Q 178 570 188 566 L 188 545 Z" fill="#0C0A0D" />
                  </g>

                  {/* Bodice / Top Drape (y=140..268) */}
                  <g>
                    {/* Décolletage */}
                    <path d="M 148 110 L 148 142 L 172 142 L 172 110 Z" fill={`url(#skinGrad-${scan.scanId})`} />
                    <path
                      d="M 105 152 C 110 200, 128 265, 132 268 Q 160 274 188 268 C 192 265, 210 200, 215 152 Z"
                      fill={`url(#dressGrad-${outfit.id})`}
                    />
                    {/* Cowl Neck / Satin Drape Fold */}
                    <path d="M 125 152 Q 160 178 195 152" stroke={outfit.secondaryHex} strokeWidth="2.5" fill="none" />
                  </g>

                  {/* Arms & Hands Straight Relaxed Pose (y=152..342) */}
                  <g>
                    <path d="M 105 152 Q 95 240 92 322" stroke={`url(#skinGrad-${scan.scanId})`} strokeWidth="12" strokeLinecap="round" fill="none" />
                    <path d="M 215 152 Q 225 240 228 322" stroke={`url(#skinGrad-${scan.scanId})`} strokeWidth="12" strokeLinecap="round" fill="none" />
                    <circle cx="92" cy="330" r="5" fill={`url(#skinGrad-${scan.scanId})`} />
                    <circle cx="228" cy="330" r="5" fill={`url(#skinGrad-${scan.scanId})`} />
                  </g>

                  {/* Head & Elegant Swept Hair */}
                  <path
                    d="M 136 70 C 136 46, 146 42, 160 42 C 174 42, 184 46, 184 70 C 184 92, 175 110, 160 114 C 145 110, 136 92, 136 70 Z"
                    fill={`url(#skinGrad-${scan.scanId})`}
                  />
                  <path
                    d="M 132 78 C 128 44, 142 34, 160 34 C 178 34, 192 44, 188 78 C 190 100, 184 112, 160 112 C 136 112, 130 100, 132 78 Z"
                    fill="#1C1512"
                  />

                  {/* Feminine Facial Features */}
                  <ellipse cx="145" cy="78" rx="8" ry="5" fill="url(#cheekBlush)" />
                  <ellipse cx="175" cy="78" rx="8" ry="5" fill="url(#cheekBlush)" />
                  <path d="M 144 68 Q 152 64 158 68 M 162 68 Q 168 64 176 68" stroke="#251A15" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <ellipse cx="150" cy="74" rx="4" ry="2.2" fill="#251A15" />
                  <ellipse cx="170" cy="74" rx="4" ry="2.2" fill="#251A15" />
                  <path d="M 152 98 Q 160 104 168 98 Q 160 101 152 98 Z" fill={makeup.lipHex} />
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
