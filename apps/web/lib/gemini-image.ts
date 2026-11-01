import type { OutfitOption } from "@/lib/types"

// Identity-preserving image models, tried in order until one succeeds.
const IMAGE_MODELS = [
  "gemini-3.1-flash-image",
  "gemini-2.5-flash-image",
  "gemini-3-pro-image",
  "nano-banana-pro-preview",
]

export type FullBodyResult =
  | { ok: true; imageDataUrl: string; model: string }
  | { ok: false; reason: "quota" | "blocked" | "error"; detail: string }

function splitDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.*)$/)
  if (match) return { mimeType: match[1]!, data: match[2]! }
  return { mimeType: "image/jpeg", data: dataUrl }
}

function buildPrompt(outfit: OutfitOption, hasGarmentReference: boolean) {
  const wardrobe =
    outfit.gender === "menswear"
      ? "This is menswear, tailored for a man."
      : "This is womenswear, tailored for a woman."

  return [
    "The first image is a selfie. Use it strictly as the identity reference.",
    "Generate ONE photorealistic full-body fashion photograph of THIS SAME PERSON:",
    "keep the identical face, facial features, skin tone, hairstyle and natural body type.",
    "Framing: head-to-toe, the entire body visible including shoes, centered in the frame.",
    "Pose: standing straight and facing the camera in a simple, relaxed neutral pose with arms relaxed at the sides,",
    "regardless of the pose, angle or crop of the selfie.",
    `Outfit: ${outfit.name} — ${outfit.fabricAndCut}. Main colour: ${outfit.primaryColor}. ${wardrobe}`,
    hasGarmentReference
      ? "The second image shows the exact garment; reproduce its design, colour and fabric faithfully."
      : "",
    "Setting: clean minimalist studio backdrop, soft even editorial lighting, lookbook style, 3:4 portrait.",
    "No text, no logos, no watermark, no collage — a single photo.",
  ]
    .filter(Boolean)
    .join(" ")
}

export async function generateFullBodyLook(params: {
  selfieDataUrl: string
  outfit: OutfitOption
  apiKey: string
}): Promise<FullBodyResult> {
  const { selfieDataUrl, outfit, apiKey } = params
  const selfie = splitDataUrl(selfieDataUrl)

  // Only send a garment reference for user-uploaded outfits (the image IS the garment).
  const garmentRef =
    outfit.garmentOverlaySvg === "custom" && outfit.imageUrl.startsWith("data:")
      ? splitDataUrl(outfit.imageUrl)
      : null

  const parts: Array<Record<string, unknown>> = [
    { text: buildPrompt(outfit, Boolean(garmentRef)) },
    { inlineData: { mimeType: selfie.mimeType, data: selfie.data } },
  ]
  if (garmentRef) {
    parts.push({ inlineData: { mimeType: garmentRef.mimeType, data: garmentRef.data } })
  }

  let lastFailure: FullBodyResult = {
    ok: false,
    reason: "error",
    detail: "No image model attempted",
  }

  for (const model of IMAGE_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
              imageConfig: { aspectRatio: "3:4" },
            },
          }),
        }
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        lastFailure = {
          ok: false,
          reason: res.status === 429 ? "quota" : "error",
          detail: `${model}: ${res.status} ${data?.error?.message?.slice(0, 160) ?? ""}`,
        }
        continue
      }

      const outParts: Array<{ inlineData?: { mimeType?: string; data?: string } }> =
        data?.candidates?.[0]?.content?.parts ?? []
      const img = outParts.find((p) => p.inlineData?.data)
      if (img?.inlineData?.data) {
        return {
          ok: true,
          model,
          imageDataUrl: `data:${img.inlineData.mimeType || "image/png"};base64,${img.inlineData.data}`,
        }
      }

      lastFailure = {
        ok: false,
        reason: data?.promptFeedback?.blockReason ? "blocked" : "error",
        detail: `${model}: no image returned (${data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "unknown"})`,
      }
    } catch (err) {
      lastFailure = {
        ok: false,
        reason: "error",
        detail: `${model}: ${err instanceof Error ? err.message : String(err)}`,
      }
    }
  }

  return lastFailure
}
