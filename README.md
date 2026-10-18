# catchdaride.github.io 🚌🗺️

> **Frontend Gateway & Location-Centric SEO Storefront** for **Catch Da Ride!**  
> Live Production URL: **[https://catchdaride.github.io/](https://catchdaride.github.io/)**

This repository serves as the public-facing gateway and SEO storefront for Catch Da Ride!, decoupled from the PythonAnywhere backend engine.

---

## 🏛️ Decoupled Architecture

Catch Da Ride! operates as a **split/decoupled hybrid application**:

1. **Frontend Gateway & SEO Storefront (`catchdaride.github.io` - GitHub Pages):**
   * **Host:** GitHub Pages (backed by Fastly Global CDN).
   * **Purpose:** Serves vanity branding, 34+ location-centric static landing pages (e.g. `/london/kings-cross/`), Schema.org JSON-LD structured data, Open Graph social cards, and `sitemap.xml`.
   * **Benefit:** Unlimited bandwidth, instant sub-50ms global delivery, and zero server CPU cost.

2. **Backend Spatial Engine & Database (`geohoo.pythonanywhere.com` - PythonAnywhere):**
   * **Host:** PythonAnywhere WSGI container.
   * **Purpose:** Runs Python backend (`server.py`, `wsgi.py`) and queries the 320 MB SQLite spatial database (`melbourne_buses.db`) for isochronic walking catchments (`/api/routes`).
   * **Benefit:** PythonAnywhere worker CPU is conserved exclusively for spatial calculations rather than serving static files.

---

## 📁 Repository Structure

```
catchdaride.github.io/
├── index.html                 # Root gateway with global transit directory & 100dvh map
├── sitemap.xml                # 48+ indexed URLs with weekly update frequencies
├── robots.txt                 # Search engine crawler directives pointing to sitemap
├── .nojekyll                  # Disables Jekyll processing for direct asset delivery
│
├── melbourne/                 # Melbourne & Victoria hub landing pages
│   ├── index.html             # City overview
│   ├── flinders-street/       # Flinders Street Station transit catchment
│   ├── southern-cross/        # Southern Cross Station transit catchment
│   └── box-hill/              # Box Hill Central Interchange
│
├── london/                    # Greater London hub landing pages
│   ├── index.html             # City overview
│   ├── kings-cross/           # King's Cross St. Pancras catchment
│   ├── waterloo/              # London Waterloo catchment
│   └── wimbledon/             # Wimbledon Station catchment
│
├── toronto/                   # Toronto & GTHA hub landing pages
│   ├── index.html             # City overview
│   └── union-station/         # Toronto Union Station catchment
│
├── vancouver/                 # Vancouver & Metro Vancouver
│   ├── index.html             # City overview
│   └── waterfront/            # Vancouver Waterfront Station catchment
│
├── hong-kong/                 # Hong Kong transit hubs
│   ├── index.html             # City overview
│   └── central-station/       # Central MTR & Hong Kong Station catchment
│
└── [other regions]...         # Sydney, Brisbane, Adelaide, Perth, Canberra, Hobart, Darwin
```

---

## 🚀 Deployment

Files in this repository are synced directly via the automated `deploy-github` skill using GitHub's REST API:

```bash
python3 .agents/skills/deploy-github/scripts/deploy.py
```
