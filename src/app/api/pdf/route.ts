import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json(
      { error: "Missing type or id" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const htmlUrl = `${baseUrl}/pdf-renderer?type=${encodeURIComponent(
    type
  )}&id=${encodeURIComponent(id)}`;

  const isVercel = !!process.env.VERCEL;

  let executablePath: string;
  let launchArgs: string[];
  if (isVercel) {
    executablePath = await chromium.executablePath();
    launchArgs = chromium.args;
  } else {
    executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH ||
      (process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : "/usr/bin/google-chrome");
    launchArgs = ["--no-sandbox", "--disable-setuid-sandbox"];
  }

  const browser = await puppeteer.launch({
    args: launchArgs,
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Forward cookies so pdf-renderer can access session (for company logo etc.)
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.split("=");
        const value = valueParts.join("=").trim();
        if (name && value) {
          try {
            await page.setCookie({
              name,
              value: decodeURIComponent(value),
              url: baseUrl,
            });
          } catch {
            // Ignore invalid cookies
          }
        }
      }
    }

    await page.goto(htmlUrl, { waitUntil: "networkidle0", timeout: 30000 });

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
  } finally {
    await browser.close();
  }
}
