"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useRouter } from "next/navigation";

/* -----------------------------
   Collapsible Section (no reset)
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
   Near Miss Form Page
------------------------------ */
export default function NearMissFormPage() {
  const router = useRouter();

  const [basic, setBasic] = useState({
    personName: "",
    date: "",
    time: "",
    department: "",
    location: "",
  });

  const [description, setDescription] = useState("");

  const [hazardOther, setHazardOther] = useState(false);
  const [hazardOtherText, setHazardOtherText] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleBasicChange = (field: keyof typeof basic, value: string) => {
    setBasic((prev) => ({ ...prev, [field]: value }));
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

  const derivedTitle = useMemo(() => {
    if (basic.personName && basic.date) {
      return `Near Miss involving ${basic.personName} on ${basic.date}`;
    }
    if (basic.personName) return `Near Miss involving ${basic.personName}`;
    if (basic.department) return `Near Miss in ${basic.department}`;
    return "Near Miss Report";
  }, [basic.personName, basic.date, basic.department]);

  const buildDetails = () => {
    return {
      basic,
      narrative: description,
      hazards: {
        hazardOther: hazardOther ? hazardOtherText : null,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("Saving...");

    try {
      const payload = {
        type: "near_miss",
        title: derivedTitle,
        description: description || "Near miss captured via detailed form.",
        department: basic.department,
        employee: basic.personName,
        employeeId: null,
        location: basic.location,
        date: basic.date || new Date().toISOString(),
        severity: "Medium",
        status: "ongoing",
        linkId: null,
        details: JSON.stringify(buildDetails()), // IMPORTANT
      };

      const incidentRes = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!incidentRes.ok) {
        const data = await incidentRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save near miss");
      }

      const incident = await incidentRes.json();
      const incidentId = incident.id as string;

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch(`/api/incidents/${incidentId}/images`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json().catch(() => ({}));
          throw new Error(
            data.error || "Near miss saved, but image upload failed"
          );
        }
      }

      setMessage("Saved successfully. Redirecting...");
      router.push("/incidents");
    } catch (err: any) {
      setMessage(err.message || "Failed to save near miss.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 dark:bg-[#0f172a]">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            Near Miss Report
          </h1>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Near Miss"}
          </button>
        </div>

        {message && (
          <p className="text-sm text-black dark:text-white">{message}</p>
        )}

        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="p-3 rounded bg-white/70"
              placeholder="Name of Person Involved"
              value={basic.personName}
              onChange={(e) => handleBasicChange("personName", e.target.value)}
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
              placeholder="Department"
              value={basic.department}
              onChange={(e) => handleBasicChange("department", e.target.value)}
            />
            <input
              className="p-3 rounded bg-white/70"
              placeholder="Exact Location"
              value={basic.location}
              onChange={(e) => handleBasicChange("location", e.target.value)}
            />
          </div>
        </Section>

        <Section title="Hazards / Causes">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "Slip / Trip",
              "Falling Object",
              "Unsafe Condition",
              "Unsafe Act",
              "Equipment Failure",
              "Environmental Hazard",
            ].map((label) => (
              <label key={label} className="flex items-center gap-2">
                <input type="checkbox" />
                {label}
              </label>
            ))}

            <label className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                checked={hazardOther}
                onChange={(e) => setHazardOther(e.target.checked)}
              />
              Other
            </label>

            {hazardOther && (
              <input
                className="col-span-2 p-2 rounded bg-white/70"
                placeholder="Specify other hazard"
                value={hazardOtherText}
                onChange={(e) => setHazardOtherText(e.target.value)}
              />
            )}
          </div>
        </Section>

        <Section title="Description of Near Miss">
          <textarea
            className="w-full p-3 rounded bg-white/70 h-40"
            placeholder="Describe what almost happened..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Section>

        <Section title="Photos">
          <div>
            <label className="block font-semibold mb-2 text-black dark:text-white">
              Upload Photos
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
      </form>
    </div>
  );
}

