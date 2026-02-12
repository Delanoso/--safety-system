# Upload & Email Setup Guide

This guide explains what was fixed and how to configure uploads and email in your Safety System.

## Issues Fixed

### 1. **Contractors Portal Uploads**
- **Cause:** Cloudinary was used without checking if credentials were set.
- **Fix:** Added validation and clearer errors. If Cloudinary is not configured, the upload now fails with a clear message instead of "must supply API_Key".
- **Frontend:** Upload errors are now shown to the user when an upload fails.

### 2. **Near Miss Report – "must supply API_Key"**
- **Cause:** Same Cloudinary issue when uploading images with a near miss.
- **Fix:** Incident image uploads now validate Cloudinary config and return clear 503 errors when not configured.

### 3. **Incident Report – Images Not Saving**
- **Cause:** The `/api/incidents/[id]/images` route had no PATCH handler; the incident form expected one to save image URLs after upload.
- **Fix:** Added a PATCH handler to persist image URLs to the database. Incident images should now save correctly.

### 4. **Appointment Email Send for Signature**
- **Cause:** Resend was used but failed if `RESEND_API_KEY` was missing. `notify-appointee` used `no-reply@yourdomain.com`, which fails with Resend until your domain is verified.
- **Fix:** Both `send-for-signature` and `notify-appointee` now use `RESEND_FROM` from env, with fallback to `onboarding@resend.dev`. Errors are surfaced in the UI.

### 5. **Monthly Inspections Not Showing in Ongoing**
- **Cause:** The monthly inspection page only showed an alert on save; it did not write to localStorage or call the API. Ongoing inspections read from localStorage.
- **Fix:** Monthly inspections now save to localStorage and the API, like daily and weekly. Weekly was also updated to call the API (it previously only used localStorage).

---

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in:

### Cloudinary (for uploads: contractors, incidents, certificates, medicals, docs)
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Get these from https://cloudinary.com/console (Dashboard → API Keys).

If you keep placeholder values like `your_cloud_name`, uploads will fail with a clear message instead of "must supply API_Key".

### Resend (for appointment signatures, PPE signatures, SHE vote links)
```
RESEND_API_KEY=re_xxxx
RESEND_FROM=onboarding@resend.dev
```
Get the API key from https://resend.com. Use `onboarding@resend.dev` until your domain is verified.

### Base URL (for signature/vote links)
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
In production, use your actual domain (e.g. `https://your-app.vercel.app`).

---

## Upload Modules Checked

| Module | Cloudinary | Status |
|--------|------------|--------|
| Contractors portal | Yes | Fixed – validation + error display |
| Incident images | Yes | Fixed – validation + PATCH handler |
| Near miss images | Yes | Fixed – same incident images API |
| Certificates | Yes | Already validated |
| Medicals | Yes | Already validated |
| Docs/files | Yes | Fixed – now uses shared validation |

## Email / Link Modules Checked

| Module | Resend | Status |
|--------|--------|--------|
| Appointment send-for-signature | Yes | Fixed – RESEND_FROM + clearer errors |
| Appointment notify-appointee | Yes | Fixed – uses onboarding@resend.dev |
| PPE send-for-signature | Yes | Already uses RESEND_FROM |
| SHE vote links | Yes | Already handles missing key |
