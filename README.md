# Ready: Event Prep Countdown (`YouCam Skin AI` × `eCommerce VTO`)

> **One-line pitch:** Ready builds a personalized skin and look plan for any upcoming event, then keeps you on track with progress scans and virtual try-on until the big day.

Built for the **YouCam API Skin AI & eCommerce VTO Hackathon**.

---

## Why Ready Stands Out

People don't think about their skin and their outfit in isolation—they think about both right before a major life event (a wedding in 6 weeks, a keynote portrait in 10 days, a commencement gala in 4 weeks).

1. **Connected YouCam API Pipeline (`Skin AI` $\rightarrow$ `eCommerce VTO`):**
   - **YouCam Skin AI (`/s2s/v2.0/task/skin-analysis`)** evaluates 8 key markers (`moisture`, `oiliness`, `redness`, `texture`, `pores`, `darkCircles`, `radiance`, `spots`) along with skin tone and undertone.
   - **Skin-Driven VTO (`/s2s/v2.0/task/cloth` + Makeup Prescription):** Unlike standalone try-on tools, Ready uses the actual skin scan metrics to dictate the makeup finish and color correction paired with the outfit (e.g., prescribing a *Soft-Matte Velvet* base + green-cica primer when Day 1 T-zone sebum is high and cheek redness contrasts with an *Emerald Silk Midi* dress).
2. **Agentic Esthetician & Stylist Countdown (`Gemini 2.5 Flash` + Biological Guardrails):**
   - Generates a week-by-week countdown plan that respects dermatological biology—leveraging cellular turnover (Lactic/PHA + Azelaic Acid) in Weeks 1–4, while enforcing a strict **7-Day "Zero New Actives" Lockout** before event day so skin never purges or flakes before photos.
3. **Milestone Check-In & Dynamic VTO Upgrade:**
   - When the user re-scans at the **Week 4 Milestone Check-In**, Ready renders an interactive **Before/After split slider**, computes metric deltas (`Hydration +19 pts`, `Redness +16 pts`), tapers corrective actives, and **unlocks a Golden-Hour Luminous Satin VTO finish** for event day.

---

## Quick Start

```bash
# Install dependencies from the monorepo root
bun install

# Copy environment variables (optional — app includes full SHA-256 cached demo mode out of the box)
cp apps/web/.env.example apps/web/.env.local

# Run development server
bun run dev
```

Open `http://localhost:3000`. You can also paste your `YCE_API_KEY` and `GEMINI_API_KEY` live inside the app under **API & Privacy (S13)**.
