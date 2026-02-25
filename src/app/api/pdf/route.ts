import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { existsSync, realpathSync } from "fs";
import path from "path";
import { execSync } from "child_process";

/** On Windows, build 8.3 short path using "dir /x" so Puppeteer gets a path without spaces. */
function getWindowsShortPath(longPath: string): string | null {
  if (process.platform !== "win32" || !longPath || !existsSync(longPath)) return null;
  try {
    const normalized = path.normalize(longPath);
    const parts = normalized.split(path.sep).filter(Boolean);
    if (parts.length === 0) return null;
    const isUnc = normalized.startsWith("\\\\");
    const built: string[] = parts[0].includes(":") ? [parts[0] + path.sep] : isUnc ? ["\\\\", parts[0] + path.sep] : [];
    const startIdx = built.length;
    for (let i = startIdx; i < parts.length; i++) {
      const parent = path.join(...built.slice(0, i).map((b) => b.replace(/[/\\]+$/, "")));
      const segment = parts[i];
      const full = path.join(parent, segment);
      if (!existsSync(full)) break;
      if (!segment.includes(" ")) {
        built.push(segment + (i < parts.length - 1 ? path.sep : ""));
        continue;
      }
      let shortName: string | null = null;
      try {
        const out = execSync(`cmd /c dir /x "${parent}"`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
        const escaped = segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const match = new RegExp(`(\\S+)\\s+${escaped}`, "i").exec(out);
        if (match) shortName = match[1].trim();
      } catch {
        // ignore
      }
      built.push((shortName || segment) + (i < parts.length - 1 ? path.sep : ""));
    }
    const shortPath = path.normalize(built.join(""));
    if (shortPath && shortPath !== longPath && existsSync(shortPath)) return shortPath;
  } catch {
    // ignore
  }
  return null;
}

/** Resolve to a canonical path so Puppeteer gets a path that works (handles spaces, symlinks). */
function resolveExecutablePath(p: string): string {
  if (!p || !existsSync(p)) return p;
  try {
    const resolved = realpathSync.native ? realpathSync.native(p) : realpathSync(p);
    // On Windows, paths with spaces often break Puppeteer; use 8.3 short path when possible
    if (process.platform === "win32" && resolved.includes(" ")) {
      const shortPath = getWindowsShortPath(resolved);
      if (shortPath) return shortPath;
    }
    return resolved;
  } catch {
    return path.normalize(p);
  }
}

export const maxDuration = 60;

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
  )}&id=${encodeURIComponent(id)}`;

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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Could not load PDF content: ${message}` },
      { status: 502 }
    );
  }

  // Inject base tag so relative URLs (e.g. images) resolve correctly
  const baseTag = `<base href="${baseUrl}/">`;
  const htmlWithBase = html.includes("<head>")
    ? html.replace("<head>", `<head>${baseTag}`)
    : html.replace("<!DOCTYPE", `${baseTag}<!DOCTYPE`);

  const isVercel = !!process.env.VERCEL;
  let executablePath: string;
  let launchArgs: string[];
  if (isVercel) {
    executablePath = await chromium.executablePath();
    launchArgs = chromium.args;
  } else {
    const candidates = getChromeCandidatePaths();
    launchArgs = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--no-first-run"];
    const found = candidates.find((p) => p && existsSync(p)) ?? candidates[0] ?? "";
    executablePath = resolveExecutablePath(found) || found;
  }

  let browser;
  const launchOptions = {
    args: launchArgs,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    headless: true,
  };

  try {
    browser = await puppeteer.launch({
      ...launchOptions,
      executablePath,
    });
  } catch (firstErr) {
    // If env path or first candidate failed, try other candidates (e.g. Chrome in (x86) or Edge)
    if (!isVercel && getChromeCandidatePaths().length > 1) {
      const candidates = getChromeCandidatePaths();
      let lastErr = firstErr;
      for (const p of candidates) {
        if (!p || p === executablePath) continue;
        const resolved = resolveExecutablePath(p);
        if (!resolved && !existsSync(p)) continue;
        try {
          browser = await puppeteer.launch({
            ...launchOptions,
            executablePath: resolved || p,
          });
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (lastErr) {
        const message = lastErr instanceof Error ? lastErr.message : String(lastErr);
        return NextResponse.json(
          {
            error: "PDF engine unavailable. No Chrome, Edge, or Brave found.",
            detail: message,
            hint: "Add to .env.local: PUPPETEER_EXECUTABLE_PATH=C:\\path\\to\\chrome.exe (right‑click your browser shortcut → Open file location to find the .exe)",
          },
          { status: 503 }
        );
      }
    } else {
      const message = firstErr instanceof Error ? firstErr.message : String(firstErr);
      return NextResponse.json(
        {
          error: "PDF engine unavailable. Install Chrome/Edge or set PUPPETEER_EXECUTABLE_PATH.",
          detail: message,
          hint: "In .env.local set PUPPETEER_EXECUTABLE_PATH to your browser .exe path (e.g. Chrome or Edge).",
        },
        { status: 503 }
      );
    }
  }

  try {
    const page = await browser.newPage();
    await page.setContent(htmlWithBase, {
      waitUntil: "networkidle0",
      timeout: 20000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

    return new NextResponse(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}-${id}.pdf"`,
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
