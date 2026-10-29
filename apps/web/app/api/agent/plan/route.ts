import { NextResponse } from "next/server"
import {
  BASELINE_SKIN_SCAN,
  CURATED_OUTFITS,
  generateDeterministicPlan,
} from "@/lib/demo-data"
import type {
  CountdownPlan,
  EventType,
  OutfitOption,
  SkinScanResult,
} from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const scan: SkinScanResult = body.scan || BASELINE_SKIN_SCAN
    const eventName: string = body.eventName || "Upcoming Event"
    const eventType: EventType = body.eventType || "wedding"
    const daysRemaining: number = Math.max(
      7,
      Math.min(180, Number(body.daysRemaining) || 42)
    )
    const outfit: OutfitOption =
      body.outfit || CURATED_OUTFITS[0]!

    const basePlan: CountdownPlan = generateDeterministicPlan(
      scan,
      eventName,
      eventType,
      daysRemaining,
      outfit
    )

    const clientGeminiKey = request.headers.get("x-gemini-key")?.trim()
    const geminiKey =
      clientGeminiKey || process.env.GEMINI_API_KEY?.trim() || ""

    if (!geminiKey) {
      return NextResponse.json({ plan: basePlan })
    }

    // Call Gemini to synthesize custom Esthetician + Stylist reasoning
    const prompt = `You are Ready's Lead Cosmetic Chemist, Licensed Esthetician, and Editorial VTO Stylist Agent.
A user is preparing for "${eventName}" (${eventType}) in ${daysRemaining} days.
Their YouCam Skin AI scan (${scan.label}, stage: ${scan.stage}) returned:
- Overall Score: ${scan.overallScore}/100, Undertone: ${scan.undertone}, Skin Tone: ${scan.skinTone}
- Metrics: ${scan.metrics.map((m) => `${m.label}: ${m.score}/100 (${m.zone})`).join(", ")}
- Selected VTO Outfit: ${outfit.name} (${outfit.primaryColor}, ${outfit.fabricAndCut})

Return ONLY valid JSON with these 3 fields (concise, warm, authoritative, non-medical cosmetic guidance):
{
  "agentSummary": "2-3 sentences connecting their specific YouCam skin scores, the ${daysRemaining}-day biological timeline, and why their skin prep + makeup finish harmonizes with the ${outfit.name}.",
  "biologicalGuardrail": "1-2 sentences explaining the biological constraint of ${daysRemaining} days (e.g., epidermal turnover and the 7-day Zero-New-Actives lockout before event day).",
  "adaptationNote": "1 sentence explaining how their routine or VTO base finish was calibrated for stage=${scan.stage}."
}`

    // Try gemini-3-flash-preview first, fallback to gemini-2.5-flash-lite
    const modelsToTry = ["gemini-3-flash-preview", "gemini-2.5-flash-lite"]
    for (const model of modelsToTry) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
            geminiKey
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4,
              },
            }),
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const rawText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""
          if (rawText) {
            const parsed = JSON.parse(rawText)
            const enrichedPlan: CountdownPlan = {
              ...basePlan,
              agentSummary: parsed.agentSummary || basePlan.agentSummary,
              biologicalGuardrail:
                parsed.biologicalGuardrail || basePlan.biologicalGuardrail,
              adaptationNote: parsed.adaptationNote || basePlan.adaptationNote,
              source: "gemini-agent",
            }
            return NextResponse.json({ plan: enrichedPlan })
          }
        }
      } catch {
        continue
      }
    }

    return NextResponse.json({ plan: basePlan })
  } catch {
    const fallbackPlan = generateDeterministicPlan(
      BASELINE_SKIN_SCAN,
      "Upcoming Event",
      "wedding",
      42,
      CURATED_OUTFITS[0]!
    )
    return NextResponse.json({ plan: fallbackPlan })
  }
}
