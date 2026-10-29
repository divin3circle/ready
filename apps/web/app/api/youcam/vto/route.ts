import { createHash } from "crypto"
import { NextResponse } from "next/server"
import {
  BASELINE_SKIN_SCAN,
  buildLookForSkinAndOutfit,
  CURATED_OUTFITS,
} from "@/lib/demo-data"
import { resolveYouCamToken } from "@/lib/youcam-auth"
import type { OutfitOption, SkinScanResult, VTOLookResult } from "@/lib/types"

const vtoCache = new Map<string, VTOLookResult>()

const YCE_BASE_URL =
  process.env.YCE_API_BASE_URL || "https://yce-api-01.perfectcorp.com"

async function tryLiveYouCamClothVTO(
  userImageBase64: string,
  outfit: OutfitOption,
  apiKey: string
): Promise<{ resultImageUrl?: string; unitsUsed: number } | null> {
  try {
    const cleanBase64 = userImageBase64.replace(/^data:image\/\w+;base64,/, "")
    const imageBuffer = Buffer.from(cleanBase64, "base64")

    const mimeMatch = userImageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/)
    const contentType = mimeMatch?.[1] === "image/png" ? "image/png" : "image/jpeg"

    let bearerToken = await resolveYouCamToken(apiKey, false)
    let fileInitRes = await fetch(`${YCE_BASE_URL}/s2s/v2.0/file/cloth`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: [
          {
            content_type: contentType,
            file_name: `ready-vto-src-${Date.now()}.${contentType === "image/png" ? "png" : "jpg"}`,
            file_size: imageBuffer.byteLength,
          },
        ],
      }),
    })

    if (fileInitRes.status === 401 && process.env.YCE_SECRET_KEY) {
      bearerToken = await resolveYouCamToken(apiKey, true)
      fileInitRes = await fetch(`${YCE_BASE_URL}/s2s/v2.0/file/cloth`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: [
            {
              content_type: contentType,
              file_name: `ready-vto-src-${Date.now()}.${contentType === "image/png" ? "png" : "jpg"}`,
              file_size: imageBuffer.byteLength,
            },
          ],
        }),
      })
    }

    if (!fileInitRes.ok) return null
    const fileInitData = await fileInitRes.json()
    const fileEntry = fileInitData?.data?.files?.[0]
    const srcFileId = fileEntry?.file_id
    const uploadReq = fileEntry?.requests?.[0]

    if (!srcFileId || !uploadReq?.url) return null

    await fetch(uploadReq.url, {
      method: "PUT",
      headers: {
        "Content-Type": uploadReq.headers?.["Content-Type"] || contentType,
      },
      body: imageBuffer,
    })

    const taskRes = await fetch(`${YCE_BASE_URL}/s2s/v2.0/task/cloth`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        src_file_id: srcFileId,
        ref_url: outfit.imageUrl,
        garment_category: "full_body",
      }),
    })

    if (!taskRes.ok) return null
    const taskData = await taskRes.json()
    const taskId = taskData?.data?.task_id
    if (!taskId) return null

    for (let attempt = 0; attempt < 6; attempt++) {
      await new Promise((r) => setTimeout(r, 1200))
      const pollRes = await fetch(
        `${YCE_BASE_URL}/s2s/v2.0/task/cloth/${encodeURIComponent(taskId)}`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      )
      if (!pollRes.ok) continue
      const pollData = await pollRes.json()
      if (pollData?.data?.task_status === "success") {
        return {
          resultImageUrl: pollData?.data?.results?.url,
          unitsUsed: 2,
        }
      }
      if (
        pollData?.data?.task_status === "error" ||
        pollData?.data?.task_status === "failed"
      ) {
        break
      }
    }
    return null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const scan: SkinScanResult = body.scan || BASELINE_SKIN_SCAN
    const outfitId: string = body.outfitId || "emerald-silk-midi"
    const customOutfit: OutfitOption | undefined = body.customOutfit
    const userImageBase64: string | undefined = body.userImageBase64

    const outfit: OutfitOption =
      customOutfit ||
      CURATED_OUTFITS.find((o) => o.id === outfitId) ||
      CURATED_OUTFITS[0]!

    const clientYouCamKey = request.headers.get("x-youcam-key")?.trim()
    const apiKey = clientYouCamKey || process.env.YCE_API_KEY?.trim() || ""

    const cacheKey = createHash("sha256")
      .update(`${scan.scanId}:${scan.stage}:${outfit.id}:${outfit.primaryHex}`)
      .digest("hex")
      .slice(0, 16)

    const cached = vtoCache.get(cacheKey)
    if (cached && !body.forceLive) {
      return NextResponse.json({
        look: {
          ...cached,
          unitsConsumed: 0,
        },
        cacheHit: true,
      })
    }

    const baseLook = buildLookForSkinAndOutfit(scan, outfit)

    if (apiKey && userImageBase64) {
      const liveVto = await tryLiveYouCamClothVTO(
        userImageBase64,
        outfit,
        apiKey
      )
      if (liveVto?.resultImageUrl) {
        const liveResult: VTOLookResult = {
          ...baseLook,
          outfit: {
            ...outfit,
            imageUrl: liveVto.resultImageUrl,
          },
          source: "youcam-live",
          unitsConsumed: liveVto.unitsUsed,
        }
        vtoCache.set(cacheKey, liveResult)
        return NextResponse.json({ look: liveResult, cacheHit: false })
      }
    }

    vtoCache.set(cacheKey, baseLook)
    return NextResponse.json({ look: baseLook, cacheHit: false })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate VTO look.",
      },
      { status: 500 }
    )
  }
}
