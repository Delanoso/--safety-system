import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { existsSync, realpathSync } from "fs";
import path from "path";
import { execSync } from "child_process";

/** Resolve to a canonical path so Puppeteer gets a stable absolute path. */
function resolveExecutablePath(p: string): string {
  if (!p || !existsSync(p)) return p;
  try {
    return realpathSync.native ? realpathSync.native(p) : realpathSync(p);
  } catch {
    return path.normalize(p);
  }
}


/** @sparticuz/chromium only works on Linux (Docker / serverless). Never use on Windows/macOS. */
function shouldUseBundledChromium(): boolean {
  if (process.platform !== "linux") return false;
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return false;
  return (
    !!process.env.VERCEL ||
    process.env.USE_BUNDLED_CHROMIUM === "1"
  );
}

/** Remove Next.js scripts so headless Chrome renders SSR HTML only (no hydration errors). */
function prepareHtmlForPdf(html: string, baseUrl: string): string {
  let cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<script\b[^>]*\/>/gi, "");

  const baseTag = `<base href="${baseUrl}/">`;
  cleaned = cleaned.includes("<head>")
    ? cleaned.replace("<head>", `<head>${baseTag}`)
    : `${baseTag}${cleaned}`;

  return cleaned;
}

function pdfHtmlLooksBroken(html: string): boolean {
  return (
    html.includes("Application error") ||
    html.includes("client-side exception") ||
    html.includes("Something went wrong")
  );
}

/**
 * Resolve base URL for server-side fetch (avoid self-request issues on localhost).
 * Prefer Host header so PDF generation works when NEXT_PUBLIC_BASE_URL is not set.
 */
function getBaseUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") === "https" ? "https" : "http";
  return `${proto}://${host}`;
}

/** Try to get Chrome or Edge path from Windows registry (App Paths). */
function getWindowsBrowserPathFromRegistry(): string | null {
  if (process.platform !== "win32") return null;
  const keys = [
    "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe",
    "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe",
    "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe",
    "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe",
    "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe",
    "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\brave.exe",
    "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\brave.exe",
  ];
  for (const regKey of keys) {
    try {
      const out = execSync(`reg query "${regKey}" /ve`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      const match = out.match(/REG_SZ\s+(.+)/);
      if (match && match[1]) {
        const exePath = match[1].trim();
        if (exePath.endsWith(".exe") && existsSync(exePath)) return exePath;
      }
    } catch {
      // key missing or access denied
    }
  }
  return null;
}

/** Common Chrome/Chromium/Edge paths to try when PUPPETEER_EXECUTABLE_PATH is not set. */
function getChromeCandidatePaths(): string[] {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return [process.env.PUPPETEER_EXECUTABLE_PATH];
  }
  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || "";
    const programFiles = process.env.PROGRAMFILES || "C:\\Program Files";
    const programFilesX86 = process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";
    const candidates = [
      getWindowsBrowserPathFromRegistry(),
      path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(programFiles, "Google", "Chrome Beta", "Application", "chrome.exe"),
      path.join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
      path.join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
      path.join(localAppData, "Microsoft", "Edge", "Application", "msedge.exe"),
      path.join(programFiles, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),
      path.join(localAppData, "BraveSoftware", "Brave-Browser", "Application", "brave.exe"),
      path.join(localAppData, "BraveSoftware", "Brave Browser", "Application", "brave.exe"),
    ];
    return candidates.filter((p): p is string => !!p && typeof p === "string");
  }
  if (process.platform === "darwin") {
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ];
  }
  return [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json(
      { error: "Missing type or id" },
      { status: 400 }
    );
  }

  const baseUrl = getBaseUrl(req);
  const htmlUrl = `${baseUrl}/pdf-renderer?type=${encodeURIComponent(
    type
  )}&id=${encodeURIComponent(id)}&embed=1`;

  // Fetch HTML server-side so we don't rely on Puppeteer navigating to the same server
  // (avoids deadlock/timeout and works when Chrome path is custom)
  const cookieHeader = req.headers.get("cookie") || "";
  let html: string;
  try {
    const res = await fetch(htmlUrl, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `PDF render failed: ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }
    html = await res.text();
    if (pdfHtmlLooksBroken(html)) {
      return NextResponse.json(
        { error: "PDF content failed to render on the server." },
        { status: 502 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Could not load PDF content: ${message}` },
      { status: 502 }
    );
  }

  const htmlWithBase = prepareHtmlForPdf(html, baseUrl);

  const useBundledChromium = shouldUseBundledChromium();
  const winLaunchArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--no-first-run",
    "--disable-dev-shm-usage",
  ];

  let browser;
  const launchOptions = {
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    headless: true as const,
  };

  async function tryLaunch(executablePath: string, args: string[]) {
    return puppeteer.launch({
      ...launchOptions,
      executablePath,
      args,
    });
  }

  try {
    if (useBundledChromium) {
      browser = await tryLaunch(await chromium.executablePath(), chromium.args);
    } else {
      const candidates = getChromeCandidatePaths()
        .map((p) => (p && existsSync(p) ? resolveExecutablePath(p) : null))
        .filter((p): p is string => !!p && existsSync(p));

      const unique = [...new Set(candidates)];
      let lastErr: unknown = null;

      for (const exe of unique) {
        try {
          browser = await tryLaunch(exe, winLaunchArgs);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!browser) {
        const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
        return NextResponse.json(
          {
            error: "PDF engine unavailable. No Chrome, Edge, or Brave found.",
            detail: message,
            hint: "Add to .env.local: PUPPETEER_EXECUTABLE_PATH=C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          },
          { status: 503 }
        );
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "PDF engine unavailable.",
        detail: message,
        hint: "Set PUPPETEER_EXECUTABLE_PATH in .env.local to your Chrome or Edge .exe path.",
      },
      { status: 503 }
    );
  }

  if (!browser) {
    return NextResponse.json(
      { error: "PDF engine unavailable." },
      { status: 503 }
    );
  }

  try {
    const page = await browser.newPage();
    await page.setContent(htmlWithBase, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pageText = await page.evaluate(() => document.body?.innerText ?? "");
    if (pdfHtmlLooksBroken(pageText)) {
      return NextResponse.json(
        { error: "PDF generation produced an error page instead of the document." },
        { status: 500 }
      );
    }

    await page.evaluate(async () => {
      await document.fonts.ready;
      const images = Array.from(document.images);
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.onload = () => resolve();
              img.onerror = () => resolve();
            })
        )
      );
    });

    const safeName = `${type}-${id}`.replace(/[/\\:*?"<>|]/g, "-");
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: "8mm",
        bottom: "8mm",
        left: "12mm",
        right: "12mm",
      },
    });

    return new NextResponse(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "PDF generation failed", detail: message },
      { status: 500 }
    );
  } finally {
    await browser.close();
  }
}
