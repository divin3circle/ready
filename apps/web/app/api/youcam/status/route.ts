import { NextResponse } from "next/server"

export async function GET() {
  const hasEnvYouCamKey = Boolean(process.env.YCE_API_KEY?.trim())
  const hasEnvGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim())

  return NextResponse.json({
    hasEnvYouCamKey,
    hasEnvGeminiKey,
    youcamBaseUrl:
      process.env.YCE_API_BASE_URL || "https://yce-api-01.perfectcorp.com",
    freeTierUnitAllocation: 1000,
    endpoints: {
      skinAnalysis: "/s2s/v2.0/task/skin-analysis",
      clothVto: "/s2s/v2.0/task/cloth",
      agentPlanner: "gemini-2.5-flash",
    },
  })
}
