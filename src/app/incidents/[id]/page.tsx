// --- PART 1: Imports & Types ---
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type InvestigationTeamMember = {
  id: string;
  name: string;
  designation: string;
  signature: string | null;
  createdAt: string;
};

type IncidentImage = {
  id: string;
  url: string;
  createdAt: string;
};

type IncidentDetails = {
  basic?: {
    incidentTypes?: string[];
  };
  injuredPerson?: {
    name?: string;
    surname?: string;
    idNumber?: string;
    employeeNumber?: string;
    occupation?: string;
    department?: string;
    supervisor?: string;
    contactNumber?: string;
    address?: string;
  };
  injuryBodyParts?: string[];
  injuryEffects?: string[];
  injuryNature?: string[];
  hazards?: string[];
  rootCauses?: string[];
  correctiveActions?: string[];
  correctiveNotes?: string;
  narrative?: string;
};

type Incident = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  department: string | null;
  employee: string | null;
  employeeId: string | null;
  location: string | null;
  date: string;
  severity: string;
  status: string;
  linkId: string | null;
  details: string | null;
  images: IncidentImage[];
  team: InvestigationTeamMember[];
  createdAt: string;
  updatedAt: string;
};

// --- PART 2: Helpers & API calls ---

async function fetchIncident(id: string): Promise<Incident> {
  const res = await fetch(`/api/incidents/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load incident");
  return res.json();
}

async function patchSignature(incidentId: string, teamId: string, value: string) {
  const res = await fetch(`/api/incidents/${incidentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamId, value }),
  });
  if (!res.ok) throw new Error("Failed to save signature");
  return res.json();
}

async function sendSignatureRequest(incidentId: string, email: string, teamId: string) {
  const res = await fetch(`/api/incidents/${incidentId}/send-signature-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, teamId }),
  });
  if (!res.ok) throw new Error("Failed to send signature request");
  return res.json();
}

function parseDetails(details: string | null): IncidentDetails {
  if (!details) return {};
  try {
    return JSON.parse(details);
  } catch {
    return {};
  }
}

// --- PART 3: Signature Pad Component (simple canvas) ---

type SignaturePadProps = {
  onChange: (dataUrl: string) => void;
  clearTrigger?: number;
};

const SignaturePad: React.FC<SignaturePadProps> = ({ onChange, clearTrigger }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }, [clearTrigger, onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (e instanceof MouseEvent) {
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      } else {
        const t = e.touches[0];
        return { x: t.clientX - rect.left, y: t.clientY - rect.top };
      }
    };

    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastX = pos.x;
      lastY = pos.y;
    };

    const end = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      e.preventDefault();
      drawing = false;
      const dataUrl = canvas.toDataURL("image/png");
      onChange(dataUrl);
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseleave", end);

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", end);
      canvas.removeEventListener("mouseleave", end);

      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
    };
  }, [onChange]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full h-48 bg-white rounded-lg shadow-inner border border-gray-200"
    />
  );
};

// --- PART 4: Full-screen Slide-up Modals (Signature & Send-for-Signature) ---

type SignatureModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => Promise<void>;
  member?: InvestigationTeamMember | null;
};

const SignatureModal: React.FC<SignatureModalProps> = ({ open, onClose, onSave, member }) => {
  const [signature, setSignature] = useState("");
  const [clearKey, setClearKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSignature("");
      setClearKey((k) => k + 1);
      setError(null);
      setSaving(false);
    }
  }, [open]);

  if (!open || !member) return null;

  const handleSave = async () => {
    if (!signature) {
      setError("Please provide a signature before saving.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(signature);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to save signature.");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setClearKey((k) => k + 1);
    setSignature("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-t-2xl shadow-2xl p-6 animate-[slide-up_0.25s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Sign Investigation Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            disabled={saving}
          >
            ✕
          </button>
        </div>

        <div className="mb-3 text-sm text-gray-700">
          <div className="font-medium">
            {member.name} — {member.designation}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Please sign below to confirm your participation in this investigation.
          </div>
        </div>

        <SignaturePad onChange={setSignature} clearTrigger={clearKey} />

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition"
            disabled={saving}
          >
            Clear
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Signature"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type SendForSignatureModalProps = {
  open: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
  member?: InvestigationTeamMember | null;
};

const SendForSignatureModal: React.FC<SendForSignatureModalProps> = ({
  open,
  onClose,
  onSend,
  member,
}) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setError(null);
      setSending(false);
    }
  }, [open]);

  if (!open || !member) return null;

  const handleSend = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onSend(email);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to send signature request.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-t-2xl shadow-2xl p-6 animate-[slide-up_0.25s_ease-out]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Send for Signature
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            disabled={sending}
          >
            ✕
          </button>
        </div>

        <div className="mb-3 text-sm text-gray-700">
          <div className="font-medium">
            Request signature from: {member.name} — {member.designation}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            A branded email will be sent with a secure link to view and sign this incident.
          </div>
        </div>

        <label className="block text-sm text-gray-700 mb-1">
          Recipient email address
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          placeholder="recipient@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sending}
        />

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition"
            disabled={sending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PART 5: Investigation Team Table ---

type InvestigationTeamTableProps = {
  team: InvestigationTeamMember[];
  onSignClick: (member: InvestigationTeamMember) => void;
  onSendForSignatureClick: (member: InvestigationTeamMember) => void;
  highlightTeamId?: string | null;
};

const InvestigationTeamTable: React.FC<InvestigationTeamTableProps> = ({
  team,
  onSignClick,
  onSendForSignatureClick,
  highlightTeamId,
}) => {
  if (!team || team.length === 0) return null;

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">
          Investigation Team
        </h2>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <span>Send for signature:</span>
          <select
            className="bg-white/10 border border-white/30 text-xs text-gray-100 rounded-lg px-2 py-1 focus:outline-none"
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return;
              const member = team.find((m) => m.id === id);
              if (member) onSendForSignatureClick(member);
              e.target.value = "";
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Select team member
            </option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.designation}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-100">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-gray-300">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Designation</th>
              <th className="py-2 pr-4">Signature</th>
              <th className="py-2 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => {
              const hasSignature = !!member.signature;
              const isHighlighted = highlightTeamId === member.id;
              return (
                <tr
                  key={member.id}
                  className={`border-b border-white/5 last:border-0 ${
                    isHighlighted ? "bg-emerald-500/10" : "hover:bg-white/5"
                  }`}
                >
                  <td className="py-2 pr-4 align-top">
                    <div className="font-medium">{member.name}</div>
                  </td>
                  <td className="py-2 pr-4 align-top">
                    <div>{member.designation}</div>
                  </td>
                  <td className="py-2 pr-4 align-top">
                    {hasSignature ? (
                      <img
                        src={member.signature || ""}
                        alt="Signature"
                        className="h-12 max-w-xs object-contain bg-white rounded-md border border-gray-200"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">
                        No signature captured
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 align-top text-right">
                    {!hasSignature && (
                      <button
                        type="button"
                        onClick={() => onSignClick(member)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition"
                      >
                        Sign
                      </button>
                    )}
                    {hasSignature && (
                      <span className="text-xs text-emerald-300 font-medium">
                        Signed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- PART 6: Incident Sections Rendering Helpers ---

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mt-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-5">
    <h2 className="text-base font-semibold text-gray-100 mb-3">{title}</h2>
    <div className="text-sm text-gray-100">{children}</div>
  </div>
);

const PillList: React.FC<{ items?: string[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs text-gray-100"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

// --- PART 7: Main Incident View Page Component ---

const IncidentViewPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const incidentId = params?.id as string | undefined;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [details, setDetails] = useState<IncidentDetails>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<InvestigationTeamMember | null>(null);

  const highlightTeamId = searchParams.get("teamId");
  const token = searchParams.get("token");

  // ⭐ FIX: Prevent infinite loading when there is NO incidentId
  useEffect(() => {
    let cancelled = false;

    // No ID → this is NOT a view page → stop loading immediately
    if (!incidentId) {
      setLoading(false);
      setError("No incident ID provided.");
      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchIncident(incidentId);
        if (cancelled) return;
        setIncident(data);
        setDetails(parseDetails(data.details));
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to load incident.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [incidentId]);

  useEffect(() => {
    if (!incident || !highlightTeamId) return;
    const el = document.getElementById(`team-row-${highlightTeamId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [incident, highlightTeamId]);

  const handleOpenSignature = (member: InvestigationTeamMember) => {
    setActiveMember(member);
    setSignatureModalOpen(true);
  };

  const handleOpenSendForSignature = (member: InvestigationTeamMember) => {
    setActiveMember(member);
    setSendModalOpen(true);
  };

  const handleSaveSignature = async (dataUrl: string) => {
    if (!incident || !activeMember) return;
    await patchSignature(incident.id, activeMember.id, dataUrl);
    const updated = await fetchIncident(incident.id);
    setIncident(updated);
    setDetails(parseDetails(updated.details));
  };

  const handleSendSignatureRequest = async (email: string) => {
    if (!incident || !activeMember) return;
    await sendSignatureRequest(incident.id, email, activeMember.id);
  };

  const hasBasic = useMemo(
    () => !!details.basic && !!details.basic?.incidentTypes?.length,
    [details]
  );
  const hasInjuredPerson = useMemo(
    () => !!details.injuredPerson && Object.values(details.injuredPerson!).some(Boolean),
    [details]
  );
  const hasBodyParts = !!details.injuryBodyParts?.length;
  const hasEffects = !!details.injuryEffects?.length;
  const hasNature = !!details.injuryNature?.length;
  const hasHazards = !!details.hazards?.length;
  const hasRootCauses = !!details.rootCauses?.length;
  const hasCorrectiveActions = !!details.correctiveActions?.length;
  const hasCorrectiveNotes = !!details.correctiveNotes;
  const hasNarrative = !!details.narrative;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-900 flex items-center justify-center">
        <div className="text-gray-200 text-sm">Loading incident...</div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-sm text-red-200">
          {error || "Incident not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-900 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-300 mb-1">
                Incident #{incident.id.slice(0, 8)}
              </div>
              <h1 className="text-2xl font-semibold text-white mb-1">
                {incident.title}
              </h1>
              <div className="text-sm text-gray-200">
                {incident.type} • {incident.severity} •{" "}
                {new Date(incident.date).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 text-sm">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  incident.status === "closed"
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                    : incident.status === "draft"
                    ? "bg-yellow-500/20 text-yellow-200 border border-yellow-400/40"
                    : "bg-sky-500/20 text-sky-200 border border-sky-400/40"
                }`}
              >
                {incident.status.toUpperCase()}
              </span>
              {incident.department && (
                <div className="text-xs text-gray-300">
                  Department: {incident.department}
                </div>
              )}
              {incident.location && (
                <div className="text-xs text-gray-300">
                  Location: {incident.location}
                </div>
              )}
            </div>
          </div>
          {incident.description && (
            <div className="mt-4 text-sm text-gray-100">
              {incident.description}
            </div>
          )}
        </div>

        {/* Investigation Team */}
        <InvestigationTeamTable
          team={incident.team}
          onSignClick={handleOpenSignature}
          onSendForSignatureClick={handleOpenSendForSignature}
          highlightTeamId={highlightTeamId}
        />

        {/* Sections */}
        {hasBasic && (
          <SectionCard title="Incident Types">
            <PillList items={details.basic?.incidentTypes} />
          </SectionCard>
        )}

        {hasInjuredPerson && (
          <SectionCard title="Injured Person Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {details.injuredPerson?.name && (
                <div>
                  <div className="text-xs text-gray-300">Name</div>
                  <div>{details.injuredPerson.name}</div>
                </div>
              )}
              {details.injuredPerson?.surname && (
                <div>
                  <div className="text-xs text-gray-300">Surname</div>
                  <div>{details.injuredPerson.surname}</div>
                </div>
              )}
              {details.injuredPerson?.idNumber && (
                <div>
                  <div className="text-xs text-gray-300">ID Number</div>
                  <div>{details.injuredPerson.idNumber}</div>
                </div>
              )}
              {details.injuredPerson?.employeeNumber && (
                <div>
                  <div className="text-xs text-gray-300">Employee Number</div>
                  <div>{details.injuredPerson.employeeNumber}</div>
                </div>
              )}
              {details.injuredPerson?.occupation && (
                <div>
                  <div className="text-xs text-gray-300">Occupation</div>
                  <div>{details.injuredPerson.occupation}</div>
                </div>
              )}
              {details.injuredPerson?.department && (
                <div>
                  <div className="text-xs text-gray-300">Department</div>
                  <div>{details.injuredPerson.department}</div>
                </div>
              )}
              {details.injuredPerson?.supervisor && (
                <div>
                  <div className="text-xs text-gray-300">Supervisor</div>
                  <div>{details.injuredPerson.supervisor}</div>
                </div>
              )}
              {details.injuredPerson?.contactNumber && (
                <div>
                  <div className="text-xs text-gray-300">Contact Number</div>
                  <div>{details.injuredPerson.contactNumber}</div>
                </div>
              )}
              {details.injuredPerson?.address && (
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-300">Address</div>
                  <div>{details.injuredPerson.address}</div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {hasBodyParts && (
          <SectionCard title="Injury Body Parts">
            <PillList items={details.injuryBodyParts} />
          </SectionCard>
        )}

        {hasEffects && (
          <SectionCard title="Injury Effects">
            <PillList items={details.injuryEffects} />
          </SectionCard>
        )}

        {hasNature && (
          <SectionCard title="Nature of Injury">
            <PillList items={details.injuryNature} />
          </SectionCard>
        )}

        {hasHazards && (
          <SectionCard title="Hazards">
            <PillList items={details.hazards} />
          </SectionCard>
        )}

        {hasRootCauses && (
          <SectionCard title="Root Causes">
            <PillList items={details.rootCauses} />
          </SectionCard>
        )}

        {hasCorrectiveActions && (
          <SectionCard title="Corrective Actions">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {details.correctiveActions?.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </SectionCard>
        )}

        {hasCorrectiveNotes && (
          <SectionCard title="Corrective Notes">
            <p className="text-sm whitespace-pre-wrap">
              {details.correctiveNotes}
            </p>
          </SectionCard>
        )}

        {hasNarrative && (
          <SectionCard title="Incident Narrative">
            <p className="text-sm whitespace-pre-wrap">
              {details.narrative}
            </p>
          </SectionCard>
        )}

        {incident.images && incident.images.length > 0 && (
          <SectionCard title="Photos">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {incident.images.map((img) => (
                <div
                  key={img.id}
                  className="bg-black/20 rounded-xl overflow-hidden border border-white/20"
                >
                  <img
                    src={img.url}
                    alt="Incident"
                    className="w-full h-40 object-cover"
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Modals */}
      <SignatureModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        onSave={handleSaveSignature}
        member={activeMember}
      />
      <SendForSignatureModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onSend={handleSendSignatureRequest}
        member={activeMember}
      />
    </div>
  );
};

export default IncidentViewPage;


