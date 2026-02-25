"use client";

import { useState } from "react";
import Link from "next/link";

const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

type StepRow = {
  task: string;
  riskAspect: string;
  riskIdentified: string;
  potentialHazard: string;
  preSeverity: string;
  preProbability: string;
  preRating: string;
  existingControls: string;
  postSeverity: string;
  postProbability: string;
  postRating: string;
};

export default function AddRiskAssessmentPage() {
  const [form, setForm] = useState({
    depot: "",
    preparedDate: "",
    department: "",
    raNumber: "",
    taskOperation: "",
    issueNumber: "",
    assessor: "",
    riskLevel: "",
    reviewDate: "",
    fileUrl: "",
    whatProduced: "",
    rawMaterials: "",
    materialsAdded: "",
    byProductsSolids: "",
    byProductsLiquids: "",
    equipment: "",
    wastesControlled: "",
    requiredPpe: "",
  });

  const [steps, setSteps] = useState<StepRow[]>([
    {
      task: "",
      riskAspect: "",
      riskIdentified: "",
      potentialHazard: "",
      preSeverity: "",
      preProbability: "",
      preRating: "",
      existingControls: "",
      postSeverity: "",
      postProbability: "",
      postRating: "",
    },
  ]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleStepChange(
    index: number,
    field: keyof StepRow,
    value: string
  ) {
    setSteps((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addStepRow() {
    setSteps((prev) => [
      ...prev,
      {
        task: "",
        riskAspect: "",
        riskIdentified: "",
        potentialHazard: "",
        preSeverity: "",
        preProbability: "",
        preRating: "",
        existingControls: "",
        postSeverity: "",
        postProbability: "",
        postRating: "",
      },
    ]);
  }

  function removeStepRow(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function buildControlsText(): string {
    const lines: string[] = [];

    lines.push("RISK ASSESSMENT HEADER");
    lines.push(`Depot: ${form.depot || "-"}`);
    lines.push(`Date Prepared or Revised: ${form.preparedDate || "-"}`);
    lines.push(`Department: ${form.department || "-"}`);
    lines.push(`Risk Assessment Number: ${form.raNumber || "-"}`);
    lines.push(`Task / Operation Identified: ${form.taskOperation || "-"}`);
    lines.push(`Issue Number: ${form.issueNumber || "-"}`);
    lines.push("");

    lines.push("POST-RISK AREA IDENTIFICATION");
    lines.push(`What is produced: ${form.whatProduced || "-"}`);
    lines.push(`What raw materials are used: ${form.rawMaterials || "-"}`);
    lines.push(`What materials are added: ${form.materialsAdded || "-"}`);
    lines.push(`What by-products are used – solids: ${form.byProductsSolids || "-"}`);
    lines.push(`What by-products are used – liquids: ${form.byProductsLiquids || "-"}`);
    lines.push(`What equipment/machinery are involved: ${form.equipment || "-"}`);
    lines.push(`Are wastes controlled / clean up etc: ${form.wastesControlled || "-"}`);
    lines.push(`What PPE is required for this task: ${form.requiredPpe || "-"}`);
    lines.push("");

    lines.push("TASK / STEP / ACTIVITY TABLE");
    steps
      .filter(
        (s) =>
          s.task.trim() ||
          s.riskAspect.trim() ||
          s.riskIdentified.trim() ||
          s.potentialHazard.trim()
      )
      .forEach((s, idx) => {
        lines.push(
          `${idx + 1}. Task/Step/Activity: ${s.task || "-"}, Risk aspect: ${
            s.riskAspect || "-"
          }, Risk identified: ${s.riskIdentified || "-"}, Potential hazard: ${
            s.potentialHazard || "-"
          }`
        );
        lines.push(
          `   Uncontrolled: Severity=${s.preSeverity || "-"}, Probability/Frequency=${
            s.preProbability || "-"
          }, Rating=${s.preRating || "-"}`
        );
        lines.push(`   Existing controls: ${s.existingControls || "-"}`);
        lines.push(
          `   Residual: Severity=${s.postSeverity || "-"}, Probability/Frequency=${
            s.postProbability || "-"
          }, Rating=${s.postRating || "-"}`
        );
        lines.push("");
      });

    return lines.join("\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const controlsText = buildControlsText();

    const res = await fetch("/api/risk-assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: (form.taskOperation || form.raNumber || "Risk Assessment").trim(),
        department: form.department.trim() || null,
        location: form.depot.trim() || null,
        assessor: form.assessor.trim() || null,
        riskLevel: form.riskLevel.trim(),
        reviewDate: form.reviewDate || null,
        controls: controlsText,
        fileUrl: form.fileUrl.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to save");
      return;
    }

    alert("Risk assessment saved successfully!");
    window.location.href = "/risk-assessments";
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-10">
        <Link href="/risk-assessments" className="text-black/70 hover:text-black">
          ← Risk Assessments
        </Link>

        <h1 className="text-4xl font-bold text-black">Add Risk Assessment</h1>
        <p className="text-black/70">
          Capture a manual risk assessment in the same structure as your paper form.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          {/* Header block: Depot / Date / Department / RA number / Task / Issue */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-black border-b border-black/10 pb-1">
              Risk Assessment Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Depot
                </label>
                <input
                  type="text"
                  name="depot"
                  value={form.depot}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Date prepared or revised
                </label>
                <input
                  type="date"
                  name="preparedDate"
                  value={form.preparedDate}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Risk assessment number
                </label>
                <input
                  type="text"
                  name="raNumber"
                  value={form.raNumber}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-black mb-1">
                  Task / Operation identified
                </label>
                <input
                  type="text"
                  name="taskOperation"
                  value={form.taskOperation}
                  onChange={handleChange}
                  placeholder="e.g. Loading and offloading pallets"
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Issue number
                </label>
                <input
                  type="text"
                  name="issueNumber"
                  value={form.issueNumber}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Assessor
                </label>
                <input
                  type="text"
                  name="assessor"
                  value={form.assessor}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
            </div>
          </section>

          {/* Risk level + matrix helper */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-black border-b border-black/10 pb-1">
              Risk level
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,3fr] gap-4 items-start">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-black mb-1">
                  Overall risk rating
                </label>
                <select
                  name="riskLevel"
                  value={form.riskLevel}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
                  required
                >
                  <option value="">Select level...</option>
                  {RISK_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Review date
                  </label>
                  <input
                    type="date"
                    name="reviewDate"
                    value={form.reviewDate}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                  />
                </div>
              </div>

              <div className="text-xs text-black/80 rounded-xl border border-white/60 bg-white/70 overflow-hidden">
                <div className="px-3 py-2 font-semibold bg-black/5">
                  Severity and probability matrix (reference)
                </div>
                <div className="p-3 space-y-2">
                  <p className="font-semibold">Severity scale</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>1 – Near miss / minor cost / irritant / environmental near miss</li>
                    <li>2 – Minor first aid / temporary discomfort / minor impact</li>
                    <li>3 – Medical treatment case / reversible illness / average impact</li>
                    <li>4 – Disabling injury / irreversible illness / major impact</li>
                    <li>5 – Fatality / catastrophic cost / catastrophic occurrence</li>
                  </ul>
                  <p className="font-semibold pt-2">Probability scale</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>1 – Rare (hear say)</li>
                    <li>2 – Uncommon (heard it happened)</li>
                    <li>3 – Occasional (has happened before)</li>
                    <li>4 – Regular (could happen any time)</li>
                    <li>5 – Frequent (cannot control or manage)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Post-risk questions */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-black border-b border-black/10 pb-1">
              Post‑risk area identification
            </h2>
            <div className="space-y-3">
              {[
                ["whatProduced", "What is produced?"],
                ["rawMaterials", "What raw materials are used?"],
                ["materialsAdded", "What materials are added?"],
                ["byProductsSolids", "What by-products are used – solids?"],
                ["byProductsLiquids", "What by-products are used – liquids?"],
                ["equipment", "What equipment/machinery are involved?"],
                ["wastesControlled", "Are wastes controlled, clean up etc?"],
                ["requiredPpe", "What PPE is required for this task?"],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-black mb-1">
                    {label}
                  </label>
                  <textarea
                    name={name}
                    value={(form as any)[name]}
                    onChange={handleChange}
                    rows={2}
                    className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Task / Step / Activity table (simplified online version) */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-black border-b border-black/10 pb-1">
              Task / step / activity breakdown
            </h2>
            <p className="text-sm text-black/70">
              Capture each step of the task, the risk aspect and hazard, and the risk
              ratings before and after controls.
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/60 bg-white/70">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-black/5">
                  <tr>
                    <th className="p-2 text-left font-semibold">Task / step / activity</th>
                    <th className="p-2 text-left font-semibold">Risk aspect</th>
                    <th className="p-2 text-left font-semibold">Risk identified</th>
                    <th className="p-2 text-left font-semibold">
                      Potential hazard / incident / impact
                    </th>
                    <th className="p-2 text-left font-semibold">
                      <span
                        className="underline decoration-dotted cursor-help"
                        title={
                          "Uncontrolled (pre-control) risk rating.\n" +
                          "S – Severity (1–5)\n" +
                          "P – Probability of exposure (1–5)\n" +
                          "Rating – combined risk rating (1–5)."
                        }
                      >
                        Uncontrolled
                        <br />
                        (S / P / Rating)
                      </span>
                    </th>
                    <th className="p-2 text-left font-semibold">Existing controls</th>
                    <th className="p-2 text-left font-semibold">
                      <span
                        className="underline decoration-dotted cursor-help"
                        title={
                          "Residual (post-control) risk rating.\n" +
                          "S – Severity (1–5)\n" +
                          "P – Probability of exposure (1–5)\n" +
                          "Rating – combined risk rating (1–5)."
                        }
                      >
                        Residual
                        <br />
                        (S / P / Rating)
                      </span>
                    </th>
                    <th className="p-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s, idx) => (
                    <tr key={idx} className="border-t border-white/60 align-top">
                      <td className="p-2 min-w-[160px]">
                        <textarea
                          value={s.task}
                          onChange={(e) => handleStepChange(idx, "task", e.target.value)}
                          rows={2}
                          className="w-full p-1 rounded border border-white/60 bg-white/90"
                        />
                      </td>
                      <td className="p-2 min-w-[140px]">
                        <textarea
                          value={s.riskAspect}
                          onChange={(e) =>
                            handleStepChange(idx, "riskAspect", e.target.value)
                          }
                          rows={2}
                          className="w-full p-1 rounded border border-white/60 bg:white/90"
                        />
                      </td>
                      <td className="p-2 min-w-[140px]">
                        <textarea
                          value={s.riskIdentified}
                          onChange={(e) =>
                            handleStepChange(idx, "riskIdentified", e.target.value)
                          }
                          rows={2}
                          className="w-full p-1 rounded border border:white/60 bg-white/90"
                        />
                      </td>
                      <td className="p-2 min-w-[180px]">
                        <textarea
                          value={s.potentialHazard}
                          onChange={(e) =>
                            handleStepChange(idx, "potentialHazard", e.target.value)
                          }
                          rows={2}
                          className="w-full p-1 rounded border border-white/60 bg-white/90"
                        />
                      </td>
                      <td className="p-2 min-w-[120px]">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            placeholder="S"
                            value={s.preSeverity}
                            onChange={(e) =>
                              handleStepChange(idx, "preSeverity", e.target.value)
                            }
                            className="w-full p-1 rounded border border-white/60 bg-white/90"
                          />
                          <input
                            type="text"
                            placeholder="P/F"
                            value={s.preProbability}
                            onChange={(e) =>
                              handleStepChange(idx, "preProbability", e.target.value)
                            }
                            className="w-full p-1 rounded border border-white/60 bg-white/90"
                          />
                          <input
                            type="text"
                            placeholder="Rating"
                            value={s.preRating}
                            onChange={(e) =>
                              handleStepChange(idx, "preRating", e.target.value)
                            }
                            className="w-full p-1 rounded border border-white/60 bg-white/90"
                          />
                        </div>
                      </td>
                      <td className="p-2 min-w-[180px]">
                        <textarea
                          value={s.existingControls}
                          onChange={(e) =>
                            handleStepChange(idx, "existingControls", e.target.value)
                          }
                          rows={3}
                          className="w-full p-1 rounded border border-white/60 bg-white/90"
                        />
                      </td>
                      <td className="p-2 min-w-[120px]">
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            placeholder="S"
                            value={s.postSeverity}
                            onChange={(e) =>
                              handleStepChange(idx, "postSeverity", e.target.value)
                            }
                            className="w-full p-1 rounded border border-white/60 bg-white/90"
                          />
                          <input
                            type="text"
                            placeholder="P/F"
                            value={s.postProbability}
                            onChange={(e) =>
                              handleStepChange(idx, "postProbability", e.target.value)
                            }
                            className="w-full p-1 rounded border border-white/60 bg-white/90"
                          />
                          <input
                            type="text"
                            placeholder="Rating"
                            value={s.postRating}
                            onChange={(e) =>
                              handleStepChange(idx, "postRating", e.target.value)
                            }
                            className="w-full p-1 rounded border border-white/60 bg-white/90"
                          />
                        </div>
                      </td>
                      <td className="p-2 min-w-[80px]">
                        <button
                          type="button"
                          onClick={() => removeStepRow(idx)}
                          className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                          disabled={steps.length === 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={addStepRow}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Add step
            </button>
          </section>

          {/* Optional attachment */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-black border-b border-black/10 pb-1">
              Supporting document (optional)
            </h2>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Document URL
              </label>
              <input
                type="url"
                name="fileUrl"
                value={form.fileUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </section>

          <button type="submit" className="button button-save w-full py-3">
            Save assessment
          </button>
        </form>
      </div>
    </div>
  );
}
