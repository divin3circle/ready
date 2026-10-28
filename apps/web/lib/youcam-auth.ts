import { constants, publicEncrypt } from "crypto"

const YCE_BASE_URL =
  process.env.YCE_API_BASE_URL || "https://yce-api-01.perfectcorp.com"

let cachedBearerToken: { token: string; expiresAt: number } | null = null

/**
 * Resolves a valid Bearer token for Perfect Corp YouCam S2S v2.0 APIs.
 * - For v2.0 `sk-...` keys, uses the key directly (and falls back to RSA `/s2s/v1.0/client/auth`
 *   if `YCE_SECRET_KEY` is configured and token exchange is required).
 */
export async function resolveYouCamToken(
  rawApiKey?: string,
  forceExchange = false
): Promise<string> {
  const apiKey = rawApiKey?.trim() || process.env.YCE_API_KEY?.trim() || ""
  const secretKey = process.env.YCE_SECRET_KEY?.trim() || ""

  if (!apiKey) return ""

  if (!forceExchange && apiKey.startsWith("sk-")) {
    return apiKey
  }

  if (cachedBearerToken && Date.now() < cachedBearerToken.expiresAt) {
    return cachedBearerToken.token
  }

  if (!secretKey) {
    return apiKey
  }

  try {
    const pem = `-----BEGIN PUBLIC KEY-----\n${
      secretKey.match(/.{1,64}/g)?.join("\n") || secretKey
    }\n-----END PUBLIC KEY-----`
    const payload = `client_id=${apiKey}&timestamp=${Date.now()}`
    const encrypted = publicEncrypt(
      {
        key: pem,
        padding: constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(payload, "utf8")
    )
    const idToken = encrypted.toString("base64")

    const authRes = await fetch(`${YCE_BASE_URL}/s2s/v1.0/client/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: apiKey,
        id_token: idToken,
      }),
    })

    if (authRes.ok) {
      const authData = await authRes.json()
      const accessToken = authData?.data?.access_token
      if (accessToken) {
        cachedBearerToken = {
          token: accessToken,
          expiresAt: Date.now() + 50 * 60 * 1000,
        }
        return accessToken
      }
    }
  } catch {
    // Fallback to direct key
  }

  return apiKey
}
