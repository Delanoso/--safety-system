import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json();

    const companyId = current.companyId ?? null;
    if (!companyId && current.role !== "super") {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    const { industrySector, assessmentType, description } = body;
    if (!industrySector || !assessmentType) {
      return NextResponse.json(
        { error: "Industry sector and assessment type are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local to enable AI generation.",
        },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `You are a health and safety professional. Generate a workplace risk assessment in JSON format.

Input:
- Industry sector: ${industrySector}
- Assessment type: ${assessmentType}
- Additional context/description: ${description || "None provided"}

Return a valid JSON object with exactly these keys (no extra keys):
{
  "title": "Short descriptive title for the risk assessment",
  "riskLevel": "Low" or "Medium" or "High" or "Critical",
  "controls": "Detailed risk controls and mitigations. Use bullet points or numbered list. Cover: identified hazards, risk controls, PPE requirements, training needs, monitoring. Be specific to the industry and assessment type.",
  "department": "Suggested department if applicable, or null",
  "location": "Suggested location/area if applicable, or null"
}

Output only valid JSON, no markdown or extra text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let parsed: {
      title?: string;
      riskLevel?: string;
      controls?: string;
      department?: string | null;
      location?: string | null;
    };
    try {
      const clean = content.replace(/^```json?\s*|\s*```$/g, "");
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const validRiskLevels = ["Low", "Medium", "High", "Critical"];
    const riskLevel = validRiskLevels.includes(parsed.riskLevel || "")
      ? parsed.riskLevel!
      : "Medium";

    const assessment = await prisma.riskAssessment.create({
      data: {
        title: parsed.title || `${assessmentType} – ${industrySector}`,
        department: parsed.department ?? null,
        location: parsed.location ?? null,
        assessor: null,
        riskLevel,
        controls: parsed.controls ?? null,
        industrySector: String(industrySector).trim(),
        assessmentType: String(assessmentType).trim(),
        description: description ? String(description).trim() : null,
        status: "draft",
        companyId: companyId ?? body.companyId ?? null,
      },
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (err) {
    console.error("Risk assessment generate:", err);
    const message = err instanceof Error ? err.message : "Failed to generate";
    const isQuota = String(message).toLowerCase().includes("quota") || String(message).includes("429");
    const userMessage = isQuota
      ? "OpenAI quota exceeded. Add payment info at platform.openai.com or use 'Add Manually' instead."
      : message;
    return NextResponse.json(
      { error: "Failed to generate", details: userMessage },
      { status: isQuota ? 503 : 500 }
    );
  }
}
