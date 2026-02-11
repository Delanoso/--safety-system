"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useRouter } from "next/navigation";

/* -----------------------------
   Collapsible Section
------------------------------ */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left text-xl font-semibold text-black dark:text-white"
      >
        {title}
        {open ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300
          ${open ? "max-h-[2000px] mt-6 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="transition-opacity duration-300 opacity-100">
          {children}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   Types
------------------------------ */
type CurrencyCode = "ZAR" | "USD" | "EUR";

interface TimeCostRow {
  label: string;
  hours: string;
  rate: string;
}

interface DamageRow {
  description: string;
  cost: string;
}

interface ProductLossRow {
  description: string;
  quantity: string;
  cost: string;
}

interface EnvironmentalRow {
  description: string;
  itemAffected: string;
  cost: string;
}

/* -----------------------------
   Cost Analysis Page
------------------------------ */
export default function CostAnalysisPage() {
  const router = useRouter();

  const [currency, setCurrency] = useState<CurrencyCode>("ZAR");

  const [classification, setClassification] = useState({
    firstAid: false,
    hijacking: false,
    minorMedical: false,
    disabling: false,
    reportable24: false,
    propertyDamage: false,
    environmentalIncident: false,
  });

  const [basic, setBasic] = useState({
    personName: "",
    age: "",
    date: "",
    time: "",
    department: "",
  });

  const [natureOfInjury, setNatureOfInjury] = useState("");

  const [clinicCost, setClinicCost] = useState("");
  const [doctorCost, setDoctorCost] = useState("");
  const [hospitalCost, setHospitalCost] = useState("");

  const [timeCosts, setTimeCosts] = useState<TimeCostRow[]>([
    {
      label: "Injured person time off due to injury",
      hours: "",
      rate: "",
    },
    {
      label: "First aider rendering first aid",
      hours: "",
      rate: "",
    },
    {
      label: "Incident investigator's time",
      hours: "",
      rate: "",
    },
    {
      label: "Witnesses at investigation - wages",
      hours: "",
      rate: "",
    },
    {
      label: "Witnesses at investigation - salaries",
      hours: "",
      rate: "",
    },
  ]);

  const [overtimeCost, setOvertimeCost] = useState("");
  const [replacementCost, setReplacementCost] = useState("");

  const [damageRows, setDamageRows] = useState<DamageRow[]>([
    { description: "", cost: "" },
  ]);

  const [productLossRows, setProductLossRows] = useState<ProductLossRow[]>([
    { description: "", quantity: "", cost: "" },
  ]);

  const [environmentalRows, setEnvironmentalRows] = useState<
    EnvironmentalRow[]
  >([{ description: "", itemAffected: "", cost: "" }]);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* -----------------------------
     Helpers
  ------------------------------ */
  const currencySymbol = useMemo(() => {
    if (currency === "USD") return "$";
    if (currency === "EUR") return "€";
    return "R";
  }, [currency]);

  const handleBasicChange = (field: keyof typeof basic, value: string) => {
    setBasic((prev) => ({ ...prev, [field]: value }));
  };

  const handleClassificationChange = (
    field: keyof typeof classification,
    value: boolean
  ) => {
    setClassification((prev) => ({ ...prev, [field]: value }));
  };

  const handleTimeCostChange = (
    index: number,
    field: keyof TimeCostRow,
    value: string
  ) => {
    setTimeCosts((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleDamageRowChange = (
    index: number,
    field: keyof DamageRow,
    value: string
  ) => {
    setDamageRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleProductLossRowChange = (
    index: number,
    field: keyof ProductLossRow,
    value: string
  ) => {
    setProductLossRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const handleEnvironmentalRowChange = (
    index: number,
    field: keyof EnvironmentalRow,
    value: string
  ) => {
    setEnvironmentalRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addDamageRow = () => {
    setDamageRows((prev) => [...prev, { description: "", cost: "" }]);
  };

  const removeDamageRow = (index: number) => {
    setDamageRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addProductLossRow = () => {
    setProductLossRows((prev) => [
      ...prev,
      { description: "", quantity: "", cost: "" },
    ]);
  };

  const removeProductLossRow = (index: number) => {
    setProductLossRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addEnvironmentalRow = () => {
    setEnvironmentalRows((prev) => [
      ...prev,
      { description: "", itemAffected: "", cost: "" },
    ]);
  };

  const removeEnvironmentalRow = (index: number) => {
    setEnvironmentalRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles = Array.from(selected);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const parseNumber = (value: string): number =>
    value.trim() === "" ? 0 : Number(value) || 0;

  const timeRowTotal = (row: TimeCostRow): number =>
    parseNumber(row.hours) * parseNumber(row.rate);

  const timeCostsSubtotal = useMemo(
    () => timeCosts.reduce((sum, row) => sum + timeRowTotal(row), 0),
    [timeCosts]
  );

  const medicalSubtotal = useMemo(
    () =>
      parseNumber(clinicCost) +
      parseNumber(doctorCost) +
      parseNumber(hospitalCost),
    [clinicCost, doctorCost, hospitalCost]
  );

  const additionalSubtotal = useMemo(
    () => parseNumber(overtimeCost) + parseNumber(replacementCost),
    [overtimeCost, replacementCost]
  );

  const damageSubtotal = useMemo(
    () => damageRows.reduce((sum, row) => sum + parseNumber(row.cost), 0),
    [damageRows]
  );

  const productLossSubtotal = useMemo(
    () => productLossRows.reduce((sum, row) => sum + parseNumber(row.cost), 0),
    [productLossRows]
  );

  const environmentalSubtotal = useMemo(
    () =>
      environmentalRows.reduce((sum, row) => sum + parseNumber(row.cost), 0),
    [environmentalRows]
  );

  const grandTotal = useMemo(
    () =>
      medicalSubtotal +
      timeCostsSubtotal +
      additionalSubtotal +
      damageSubtotal +
      productLossSubtotal +
      environmentalSubtotal,
    [
      medicalSubtotal,
      timeCostsSubtotal,
      additionalSubtotal,
      damageSubtotal,
      productLossSubtotal,
      environmentalSubtotal,
    ]
  );

  const derivedTitle = useMemo(() => {
    if (basic.personName && basic.date) {
      return `Cost Analysis for ${basic.personName} on ${basic.date}`;
    }
    if (basic.personName) return `Cost Analysis for ${basic.personName}`;
    if (basic.department) return `Cost Analysis for ${basic.department}`;
    return "Incident Cost Analysis";
  }, [basic.personName, basic.date, basic.department]);

  /* -----------------------------
     RENDER
  ------------------------------ */
  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 dark:bg-[#0f172a]">
      <form className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Incident Cost Analysis
          </h1>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Cost Analysis"}
          </button>
        </div>

        {message && (
          <p className="text-sm text-black dark:text-white">{message}</p>
        )}

        {/* Currency Selector */}
        <Section title="Currency">
          <div className="flex items-center gap-4">
            <label className="text-black dark:text-white font-semibold">
              Select Currency:
            </label>
            <select
              className="p-2 rounded bg-white/80"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            >
              <option value="ZAR">Rand (R)</option>
              <option value="USD">Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </Section>

        {/* Basic Information */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="p-3 rounded bg-white/70"
              placeholder="Name of Person Involved"
              value={basic.personName}
              onChange={(e) => handleBasicChange("personName", e.target.value)}
            />
            <input
              className="p-3 rounded bg-white/70"
              placeholder="Age"
              value={basic.age}
              onChange={(e) => handleBasicChange("age", e.target.value)}
            />
            <input
              type="date"
              className="p-3 rounded bg-white/70"
              value={basic.date}
              onChange={(e) => handleBasicChange("date", e.target.value)}
            />
            <input
              type="time"
              className="p-3 rounded bg-white/70"
              value={basic.time}
              onChange={(e) => handleBasicChange("time", e.target.value)}
            />
            <input
              className="p-3 rounded bg-white/70"
              placeholder="Department Where Incident/Accident Occurred"
              value={basic.department}
              onChange={(e) => handleBasicChange("department", e.target.value)}
            />
          </div>
        </Section>

        {/* Classification */}
        <Section title="Incident Classification (Tick if applicable)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-black dark:text-white">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classification.firstAid}
                onChange={(e) =>
                  handleClassificationChange("firstAid", e.target.checked)
                }
              />
              First Aid Case
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classification.hijacking}
                onChange={(e) =>
                  handleClassificationChange("hijacking", e.target.checked)
                }
              />
              Hijacking
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classification.minorMedical}
                onChange={(e) =>
                  handleClassificationChange("minorMedical", e.target.checked)
                }
              />
              Minor Medical
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classification.disabling}
                onChange={(e) =>
                  handleClassificationChange("disabling", e.target.checked)
                }
              />
              Disabling
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classification.reportable24}
                onChange={(e) =>
                  handleClassificationChange("reportable24", e.target.checked)
                }
              />
              Reportable Section 24
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classification.propertyDamage}
                onChange={(e) =>
                  handleClassificationChange("propertyDamage", e.target.checked)
                }
              />
              Property Damage Or Loss
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={classification.environmentalIncident}
                onChange={(e) =>
                  handleClassificationChange(
                    "environmentalIncident",
                    e.target.checked
                  )
                }
              />
              Environmental Incident
            </label>
          </div>
        </Section>

        {/* Nature of Injury */}
        <Section title="Nature of Injury (Describe the injury)">
          <textarea
            className="w-full p-3 rounded bg-white/70 h-40"
            placeholder="Describe the injury..."
            value={natureOfInjury}
            onChange={(e) => setNatureOfInjury(e.target.value)}
          />
        </Section>

        {/* Medical Costs */}
        <Section title="Medical Costs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-black dark:text-white">
            <div>
              <label className="font-semibold">Clinic Cost</label>
              <input
                className="p-2 rounded bg-white/70 w-full"
                placeholder="0"
                value={clinicCost}
                onChange={(e) => setClinicCost(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Doctor Cost</label>
              <input
                className="p-2 rounded bg-white/70 w-full"
                placeholder="0"
                value={doctorCost}
                onChange={(e) => setDoctorCost(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold">Hospital Cost</label>
              <input
                className="p-2 rounded bg-white/70 w-full"
                placeholder="0"
                value={hospitalCost}
                onChange={(e) => setHospitalCost(e.target.value)}
              />
            </div>
          </div>

          <p className="mt-4 font-semibold text-black dark:text-white">
            Subtotal: {currencySymbol} {medicalSubtotal.toFixed(2)}
          </p>
        </Section>

        {/* Time-Based Costs */}
        <Section title="Time-Based Costs">
          <div className="space-y-6">
            {timeCosts.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
              >
                <div className="md:col-span-2">
                  <label className="font-semibold text-black dark:text-white">
                    {row.label}
                  </label>
                </div>

                <input
                  className="p-2 rounded bg-white/70"
                  placeholder="Hours"
                  value={row.hours}
                  onChange={(e) =>
                    handleTimeCostChange(index, "hours", e.target.value)
                  }
                />

                <input
                  className="p-2 rounded bg-white/70"
                  placeholder="Rate per hour"
                  value={row.rate}
                  onChange={(e) =>
                    handleTimeCostChange(index, "rate", e.target.value)
                  }
                />

                <p className="md:col-span-4 text-black dark:text-white">
                  Total: {currencySymbol} {timeRowTotal(row).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 font-semibold text-black dark:text-white">
            Subtotal: {currencySymbol} {timeCostsSubtotal.toFixed(2)}
          </p>
        </Section>

        {/* Additional Direct Costs */}
        <Section title="Additional Direct Costs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-black dark:text-white">
                Cost of Overtime Hours
              </label>
              <input
                className="p-2 rounded bg-white/70 w-full"
                placeholder="0"
                value={overtimeCost}
                onChange={(e) => setOvertimeCost(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-black dark:text-white">
                Replacement for Injured Person
              </label>
              <input
                className="p-2 rounded bg-white/70 w-full"
                placeholder="0"
                value={replacementCost}
                onChange={(e) => setReplacementCost(e.target.value)}
              />
            </div>
          </div>

          <p className="mt-4 font-semibold text-black dark:text-white">
            Subtotal: {currencySymbol} {additionalSubtotal.toFixed(2)}
          </p>
        </Section>

        {/* Damage Incident */}
        <Section title="Damage Incident">
          <div className="space-y-4">
            {damageRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
              >
                <input
                  className="p-2 rounded bg-white/70 md:col-span-3"
                  placeholder="Description of property damage"
                  value={row.description}
                  onChange={(e) =>
                    handleDamageRowChange(index, "description", e.target.value)
                  }
                />

                <input
                  className="p-2 rounded bg-white/70"
                  placeholder="Cost"
                  value={row.cost}
                  onChange={(e) =>
                    handleDamageRowChange(index, "cost", e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() => removeDamageRow(index)}
                  className="text-red-600 font-bold"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addDamageRow}
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
            >
              Add Damage Row
            </button>

            <p className="mt-4 font-semibold text-black dark:text-white">
              Subtotal: {currencySymbol} {damageSubtotal.toFixed(2)}
            </p>
          </div>
        </Section>

        {/* Product Loss */}
        <Section title="Product Loss">
          <div className="space-y-4">
            {productLossRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center"
              >
                <input
                  className="p-2 rounded bg-white/70 md:col-span-3"
                  placeholder="Description of product loss"
                  value={row.description}
                  onChange={(e) =>
                    handleProductLossRowChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                />

                <input
                  className="p-2 rounded bg-white/70"
                  placeholder="Quantity"
                  value={row.quantity}
                  onChange={(e) =>
                    handleProductLossRowChange(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                />

                <input
                  className="p-2 rounded bg-white/70"
                  placeholder="Cost"
                  value={row.cost}
                  onChange={(e) =>
                    handleProductLossRowChange(index, "cost", e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() => removeProductLossRow(index)}
                  className="text-red-600 font-bold"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addProductLossRow}
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
            >
              Add Product Loss Row
            </button>

            <p className="mt-4 font-semibold text-black dark:text-white">
              Subtotal: {currencySymbol} {productLossSubtotal.toFixed(2)}
            </p>
          </div>
        </Section>

        {/* Environmental Impact */}
        <Section title="Environmental Impact">
          <div className="space-y-4">
            {environmentalRows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center"
              >
                <input
                  className="p-2 rounded bg-white/70 md:col-span-2"
                  placeholder="Description of environmental impact"
                  value={row.description}
                  onChange={(e) =>
                    handleEnvironmentalRowChange(
                      index,
                      "description",
                      e.target.value
                    )
                  }
                />

                <input
                  className="p-2 rounded bg-white/70 md:col-span-2"
                  placeholder="Item affected"
                  value={row.itemAffected}
                  onChange={(e) =>
                    handleEnvironmentalRowChange(
                      index,
                      "itemAffected",
                      e.target.value
                    )
                  }
                />

                <input
                  className="p-2 rounded bg-white/70"
                  placeholder="Cost"
                  value={row.cost}
                  onChange={(e) =>
                    handleEnvironmentalRowChange(index, "cost", e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() => removeEnvironmentalRow(index)}
                  className="text-red-600 font-bold"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addEnvironmentalRow}
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
            >
              Add Environmental Impact Row
            </button>

            <p className="mt-4 font-semibold text-black dark:text-white">
              Subtotal: {currencySymbol} {environmentalSubtotal.toFixed(2)}
            </p>
          </div>
        </Section>

        {/* File Uploads */}
        <Section title="Supporting Documents / Photos">
          <div>
            <label className="block font-semibold mb-2 text-black dark:text-white">
              Upload Files
            </label>

            <div className="flex items-center gap-4">
              <label className="inline-flex items-center px-4 py-2 bg-white/80 rounded-lg shadow cursor-pointer hover:bg-white">
                <span className="text-sm font-medium text-black">
                  Choose Files
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <span className="text-sm text-black/70 dark:text-white/70">
                {files.length === 0
                  ? "No files chosen"
                  : `${files.length} file(s) selected`}
              </span>
            </div>

            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((src, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl overflow-hidden shadow-lg bg-black/10"
                  >
                    <img
                      src={src}
                      alt={`Upload preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Grand Total */}
        <Section title="Grand Total">
          <p className="text-2xl font-bold text-black dark:text-white">
            Total Cost: {currencySymbol} {grandTotal.toFixed(2)}
          </p>
        </Section>

        {/* Submit Handler */}
        <button
          type="button"
          onClick={async () => {
            setSaving(true);
            setMessage("Saving...");

            try {
              const payload = {
                type: "cost_analysis",
                title: derivedTitle,
                description:
                  "Cost analysis for incident, including medical, time, damage, product loss, and environmental impact.",
                department: basic.department,
                employee: basic.personName,
                employeeId: null,
                location: basic.department,
                date: basic.date || new Date().toISOString(),
                severity: "Low",
                status: "completed",
                linkId: null,
                details: JSON.stringify({
                  currency,
                  classification,
                  basic,
                  natureOfInjury,
                  medicalCosts: {
                    clinicCost,
                    doctorCost,
                    hospitalCost,
                    subtotal: medicalSubtotal,
                  },
                  timeCosts: {
                    rows: timeCosts,
                    subtotal: timeCostsSubtotal,
                  },
                  additionalCosts: {
                    overtimeCost,
                    replacementCost,
                    subtotal: additionalSubtotal,
                  },
                  damage: {
                    rows: damageRows,
                    subtotal: damageSubtotal,
                  },
                  productLoss: {
                    rows: productLossRows,
                    subtotal: productLossSubtotal,
                  },
                  environmentalImpact: {
                    rows: environmentalRows,
                    subtotal: environmentalSubtotal,
                  },
                  grandTotal,
                }),
              };

              const incidentRes = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!incidentRes.ok) {
                const data = await incidentRes.json().catch(() => ({}));
                throw new Error(data.error || "Failed to save cost analysis");
              }

              const incident = await incidentRes.json();
              const incidentId = incident.id as string;

              if (files.length > 0) {
                const formData = new FormData();
                files.forEach((file) => formData.append("files", file));

                const uploadRes = await fetch(
                  `/api/incidents/${incidentId}/images`,
                  {
                    method: "POST",
                    body: formData,
                  }
                );

                if (!uploadRes.ok) {
                  const data = await uploadRes.json().catch(() => ({}));
                  throw new Error(
                    data.error ||
                      "Cost analysis saved, but file upload failed"
                  );
                }
              }

              setMessage("Saved successfully. Redirecting...");
              router.push("/incidents");
            } catch (err: any) {
              setMessage(err.message || "Failed to save cost analysis.");
            } finally {
              setSaving(false);
            }
          }}
          className="w-full py-4 bg-blue-700 text-white font-bold rounded-xl shadow hover:bg-blue-800 transition"
        >
          {saving ? "Saving..." : "Submit Cost Analysis"}
        </button>
      </form>
    </div>
  );
}

