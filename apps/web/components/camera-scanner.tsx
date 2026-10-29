"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Switch } from "@workspace/ui/components/switch"
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
  IconCamera,
  IconUpload,
  IconSparkles,
  IconSun,
  IconAlertTriangle,
  IconShieldLock,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react"

interface CameraScannerProps {
  stage: "baseline" | "midpoint" | "final"
  consentGranted: boolean
  isAdultConfirmed: boolean
  onConsentChange: (consent: boolean, adult: boolean) => void
  onCaptureComplete: (imageDataUrl?: string) => void
  isAnalyzing: boolean
}

export function CameraScanner({
  stage,
  consentGranted,
  isAdultConfirmed,
  onConsentChange,
  onCaptureComplete,
  isAnalyzing,
}: CameraScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const [cameraActive, setCameraActive] = React.useState(false)
  const [cameraError, setCameraError] = React.useState<string | null>(null)
  const [lightingStatus, setLightingStatus] = React.useState<
    "optimal" | "too-dark" | "too-bright"
  >("optimal")
  const [previewDataUrl, setPreviewDataUrl] = React.useState<string | null>(
    null
  )
  const [consentDialogOpen, setConsentDialogOpen] = React.useState(false)

  const stopStream = React.useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  React.useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  React.useEffect(() => {
    if (!cameraActive) return
    const interval = setInterval(() => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = 64
      canvas.height = 64
      ctx.drawImage(video, 0, 0, 64, 64)
      const pixels = ctx.getImageData(0, 0, 64, 64).data
      let sum = 0
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i] ?? 128
        const g = pixels[i + 1] ?? 128
        const b = pixels[i + 2] ?? 128
        sum += 0.299 * r + 0.587 * g + 0.114 * b
      }
      const avg = Math.round(sum / (pixels.length / 4))
      if (avg < 58) {
        setLightingStatus("too-dark")
      } else if (avg > 218) {
        setLightingStatus("too-bright")
      } else {
        setLightingStatus("optimal")
      }
    }, 600)
    return () => clearInterval(interval)
  }, [cameraActive])

  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
      }
    } catch {
      setCameraError(
        "Camera unavailable—use Upload Selfie or Instant Scan below."
      )
    }
  }

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 800
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88)
    setPreviewDataUrl(dataUrl)
    stopStream()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewDataUrl(reader.result)
        stopStream()
      }
    }
    reader.readAsDataURL(file)
  }

  const canProceed = consentGranted && isAdultConfirmed

  return (
    <div className="space-y-4">
      {/* Top Status Row (Blends directly into Dialog, no inner container box!) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <IconSun className="size-4 text-amber-500" />
          {lightingStatus === "optimal" && (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              Lighting Optimal
            </span>
          )}
          {lightingStatus === "too-dark" && (
            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
              <IconAlertTriangle className="size-3.5" /> Low Light
            </span>
          )}
          {lightingStatus === "too-bright" && (
            <span className="flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400">
              <IconAlertTriangle className="size-3.5" /> Too Bright
            </span>
          )}
        </div>

        {/* Consent Modal Trigger Pill */}
        <Dialog open={consentDialogOpen} onOpenChange={setConsentDialogOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-medium text-foreground transition hover:bg-muted"
              />
            }
          >
            <IconShieldLock className="size-3.5 text-emerald-500" />
            <span>{canProceed ? "Consent Active" : "Review Consent"}</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Biometric Privacy & Consent</DialogTitle>
              <DialogDescription>
                YouCam Skin AI analyzes 8 cosmetic skin markers to personalize
                your countdown routine and VTO shade match. Raw photos
                auto-delete after 30 days and are never used to train models.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-3.5">
                <div>
                  <div className="text-sm font-medium">
                    Cosmetic Analysis Consent
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Non-medical skincare & VTO shade matching
                  </div>
                </div>
                <Switch
                  checked={consentGranted}
                  onCheckedChange={(checked) =>
                    onConsentChange(Boolean(checked), isAdultConfirmed)
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border p-3.5">
                <div>
                  <div className="text-sm font-medium">Age Confirmation</div>
                  <div className="text-muted-foreground text-xs">
                    I confirm I am 18 years or older
                  </div>
                </div>
                <Switch
                  checked={isAdultConfirmed}
                  onCheckedChange={(checked) =>
                    onConsentChange(consentGranted, Boolean(checked))
                  }
                />
              </div>
            </div>

            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>
      </div>

      {/* Single Theme-Aware Camera Mirror Frame */}
      <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-muted/50">
        <canvas ref={canvasRef} className="hidden" />

        {previewDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewDataUrl}
            alt="Captured face scan"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full w-full object-cover ${
              cameraActive ? "block" : "hidden"
            }`}
          />
        )}

        {/* Clean Oval Face Guide */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative h-48 w-36 rounded-[50%] border-2 border-dashed border-primary/55" />
        </div>

        {!cameraActive && !previewDataUrl && (
          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <Badge variant="secondary" className="mb-2">
              {stage === "baseline" ? "Day 1 Baseline" : "Milestone Check-In"}
            </Badge>
            <p className="font-heading text-sm font-medium text-foreground">
              Align your face in natural light
            </p>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="rounded-xl bg-amber-500/15 px-3 py-2 text-center text-xs text-amber-700 dark:text-amber-300">
          {cameraError}
        </div>
      )}

      {/* Action Buttons Directly in Modal Flow */}
      <div className="space-y-2.5 pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {previewDataUrl ? (
          <div className="space-y-2">
            <Button
              size="lg"
              className="w-full font-semibold"
              disabled={!canProceed || isAnalyzing}
              onClick={() => onCaptureComplete(previewDataUrl)}
            >
              <IconSparkles className="size-4" />
              {isAnalyzing
                ? "Analyzing with YouCam Skin AI..."
                : "Analyze My Skin Scan"}
            </Button>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="outline"
                disabled={isAnalyzing}
                onClick={() => setPreviewDataUrl(null)}
              >
                <IconRefresh className="size-4" />
                Retake
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isAnalyzing}
                onClick={() => fileInputRef.current?.click()}
              >
                <IconUpload className="size-4" />
                Upload Different Photo
              </Button>
            </div>
          </div>
        ) : cameraActive ? (
          <div className="space-y-2">
            <Button
              type="button"
              size="lg"
              className="w-full font-semibold"
              onClick={captureFrame}
            >
              <IconCheck className="size-4" />
              Snap Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload className="size-4" />
              Or Upload Selfie Photo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              type="button"
              size="lg"
              className="font-semibold"
              disabled={!canProceed || isAnalyzing}
              onClick={startCamera}
            >
              <IconCamera className="size-4" />
              Live Camera
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="font-semibold"
              disabled={!canProceed || isAnalyzing}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload className="size-4" />
              Upload Selfie
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
