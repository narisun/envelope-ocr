# Envelope OCR PWA (Azure-ready)

A minimal PWA that lets users:
- Open the camera (mobile/desktop)
- Scan an envelope with **printed** address and an **alphanumeric code**
- Do **in-browser OCR** (Tesseract.js, two passes: code + address)
- Validate / edit results
- Save rows to a **local table** (IndexedDB)
- **Auto-delete** local rows after **24 hours**
- Export/share a **CSV** at the end of the day (Web Share API w/ file; fallback download)

No backend required. You can host this as a static site (e.g., **Azure Static Web Apps**).

---

## Tech
- **Vite + React + TypeScript**
- **PWA** via `vite-plugin-pwa` (offline shell, caching of OCR assets)
- **Tesseract.js** (CDN core + English language)
- **IndexedDB** (`zustand` persistence) + **24h TTL cleanup** on app open
- **Web Share API** for sending the CSV via email or any share target

> Optional: Add OpenCV.js for auto deskew/edge detection. This starter ships with a simple capture; you can extend it later.

---

## Prereqs
- Node.js 18+
- pnpm / npm / yarn

## Run locally
```bash
pnpm i      # or: npm install
pnpm dev    # or: npm run dev
# open http://localhost:5173
```

> On iOS, use the **Add to Home Screen** option in Safari for the best camera experience.

---

## Build
```bash
pnpm build  # or: npm run build
pnpm preview
```

Build output goes to `dist/`.

---

## Deploy to Azure (Static Web Apps)

### Option A: GitHub → Azure Static Web Apps (recommended)
1. Create a **new GitHub repo** and push this project.
2. In Azure Portal, create **Static Web App** (free tier is fine):
   - **Source**: GitHub
   - **Build Presets**: `Vite`
   - **App location**: `/`
   - **Output location**: `dist`
3. Azure will create a **GitHub Actions** workflow. The included file in `.github/workflows/azure-static-web-apps.yml` is a working template.
4. On first deployment, Azure gives you a public **URL** (e.g., `https://<random-name>.azurestaticapps.net`). Share this with your users.

### Option B: Static website on Azure Storage
1. Build locally (`pnpm build`).
2. Create a Storage Account → enable **Static website**.
3. Upload the `dist/` contents to the `$web` container.
4. Optionally front with Azure Front Door / CDN.

---

## Data retention (24-hour auto-delete)

- Each saved row stores a `scannedAt` ISO timestamp.
- On app startup (or hydration), we delete rows older than **24 hours** automatically.
- You can change the window in `src/lib/ttl.ts` if needed.

> Reminder: Photos are processed **in-browser**. The app stores only the text and an optional **small thumbnail** (data URL). You can turn thumbnails off entirely for stricter privacy.

---

## CSV export / email

- Tap **Export / Share CSV** to create a `envelopes.csv` file.
- If your device supports the **Web Share API with files**, the native share sheet opens (Mail, Gmail, etc.).
- Otherwise the CSV **downloads**; attach it to email manually.

---

## Notes & Extensibility
- **Code OCR vs Address OCR**: We run two passes; the code pass whitelists `A–Z0–9` to reduce errors like `O/0`, `I/1`, `B/8`.
- **Address parsing**: A simple US parser extracts `street/city/state/zip`. Edit `src/lib/address.ts` to improve heuristics.
- **Deskew/edge-detect**: Add OpenCV.js (CDN) and run preprocessing in a Web Worker before OCR.
- **Security**: Serve over **HTTPS**. Set a strict **CSP** and limit network requests to `cdn.jsdelivr.net` and `tessdata.projectnaptha.com` if you keep the defaults.

---

## Troubleshooting
- **Camera not available**: iOS may require using Safari and adding to Home Screen. Fallback file upload is provided.
- **OCR slow**: First run downloads WASM + language data; it’s cached by the service worker. Subsequent scans are faster.
- **Sharing not available**: The app will download the CSV if Web Share with files is not supported.

---
## Two-step capture (Address then QR)

- **Step 1:** Capture **Name & USA Address** using the camera. The app OCRs and extracts the name and address heuristically; you can edit before continuing.
- **Step 2:** Scan a **QR code** to fill the Code field with the QR payload (editable).
- **Save mapping:** Stores name, address, and QR as a row in the local table, which auto-deletes after 24 hours.

QR scanning uses `@zxing/browser`. If scanning is not available, you can type/paste the QR payload in the provided field.
## License
MIT
