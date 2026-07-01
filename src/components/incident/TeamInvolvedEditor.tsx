"use client";

import { useEffect, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { Trash2, MessageCircle } from "lucide-react";
import { openWhatsAppLink } from "@/lib/open-whatsapp";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 backdrop-blur-xl shadow-xl"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h3 className="text-base font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-1 opacity-70">{label}</div>
      <div className="text-sm">{value ?? <span className="opacity-50">N/A</span>}</div>
    </div>
  );
}

type TeamMember = {
  id: string;
  name: string;
  designation: string;
  signature?: string | null;
  signedAt?: string | null;
  createdAt?: string;
};

type Props = {
  incidentId: string;
  incidentTitle?: string;
  showCompleteButton?: boolean;
  onCompleted?: () => void;
};

export default function TeamInvolvedEditor({
  incidentId,
  incidentTitle,
  showCompleteButton = true,
  onCompleted,
}: Props) {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSignature, setNewSignature] = useState("");
  const [padRef, setPadRef] = useState<SignaturePad | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    loadTeam();
  }, [incidentId]);

  async function loadTeam() {
    const res = await fetch(`/api/incidents/${incidentId}`, { cache: "no-store" });
    const json = await res.json();
    if (json.team && Array.isArray(json.team)) {
      const sorted = [...json.team].sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
      setTeam(sorted);
    }
  }

  async function addMember() {
    if (!newName || !newDesignation) {
      alert("Name and designation are required.");
      return;
    }
    const signatureToSend =
      padRef?.getTrimmedCanvas?.()?.toDataURL?.("image/png") ?? newSignature ?? "";

    const res = await fetch(`/api/incidents/team/add/${incidentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        designation: newDesignation,
        signature: signatureToSend || null,
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      alert(json.error || "Failed to add member.");
      return;
    }

    const member = json.member;
    setTeam((prev) =>
      [...prev, { ...member, signature: signatureToSend || member.signature }].sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      )
    );

    setNewName("");
    setNewDesignation("");
    setNewSignature("");
    padRef?.clear();
  }

  async function removeMember(id: string) {
    if (!confirm("Remove this team member?")) return;
    await fetch(`/api/incidents/team/add/delete/${id}`, { method: "DELETE" });
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  async function sendWhatsApp(member: TeamMember, phone: string) {
    setSendingId(member.id);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/send-signature-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, teamId: member.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send");
      if (data.whatsappUrl) openWhatsAppLink(data.whatsappUrl);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to send WhatsApp message.");
    } finally {
      setSendingId(null);
    }
  }

  async function sendWhatsAppForNewMember() {
    if (!newName || !newDesignation) {
      alert("Enter name and designation first.");
      return;
    }
    const digits = newPhone.replace(/\D/g, "");
    if (digits.length < 9) {
      alert("Enter a valid WhatsApp number.");
      return;
    }

    const res = await fetch(`/api/incidents/team/add/${incidentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        designation: newDesignation,
        signature: null,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.member?.id) {
      alert(json.error || "Failed to add member.");
      return;
    }

    const member = json.member as TeamMember;
    setTeam((prev) => [...prev, member]);
    setNewName("");
    setNewDesignation("");
    setNewPhone("");
    await sendWhatsApp(member, newPhone);
  }

  async function completeIncident() {
    await fetch(`/api/incidents/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (onCompleted) onCompleted();
    else window.location.href = "/incidents/list";
  }

  return (
    <Section title="Investigation team & signatures">
      {incidentTitle && (
        <p className="text-sm opacity-70 mb-4">
          Report: <strong>{incidentTitle}</strong> — add team members, capture signatures here, or send a WhatsApp link for remote signing.
        </p>
      )}

      <div
        className="mb-6 p-4 rounded-xl"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <Grid>
          <div>
            <label className="text-xs uppercase tracking-wide opacity-70">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border text-sm mt-1"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide opacity-70">Designation</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border text-sm mt-1"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide opacity-70">
              WhatsApp number (for remote signature)
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 rounded-lg border text-sm mt-1"
              placeholder="e.g. 0821234567"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </div>
        </Grid>

        <div className="mt-4">
          <label className="text-sm">Signature (optional — sign here or send via WhatsApp)</label>
          <SignaturePad
            penColor="black"
            canvasProps={{
              width: 350,
              height: 120,
              className: "bg-white rounded-xl border border-gray-300 shadow-md mt-1",
            }}
            ref={(ref) => setPadRef(ref)}
          />
          <button
            type="button"
            onClick={() => {
              if (padRef) {
                setNewSignature(padRef.getTrimmedCanvas().toDataURL("image/png"));
              }
            }}
            className="button button-save mt-2"
          >
            Capture signature
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button type="button" onClick={addMember} className="button button-save">
            + Add team member
          </button>
          <button
            type="button"
            onClick={sendWhatsAppForNewMember}
            className="button button-neutral flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Add &amp; send WhatsApp
          </button>
        </div>
      </div>

      {team.map((member) => (
        <div
          key={member.id}
          className="relative mb-6 p-4 rounded-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <button
            type="button"
            onClick={() => removeMember(member.id)}
            className="absolute top-3 right-3"
            style={{ color: "var(--button-delete-bg)" }}
          >
            <Trash2 size={20} />
          </button>

          <Grid>
            <Field label="Name" value={member.name} />
            <Field label="Designation" value={member.designation} />
          </Grid>

          {member.signature ? (
            <img
              src={member.signature}
              alt="Signature"
              className="mt-4 w-48 border border-gray-300 rounded-lg bg-white"
            />
          ) : (
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs opacity-70">Send WhatsApp signature request</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 rounded-lg border text-sm mt-1"
                  placeholder="Phone number"
                  id={`phone-${member.id}`}
                />
              </div>
              <button
                type="button"
                disabled={sendingId === member.id}
                onClick={() => {
                  const input = document.getElementById(`phone-${member.id}`) as HTMLInputElement;
                  sendWhatsApp(member, input?.value || "");
                }}
                className="button button-neutral flex items-center gap-2"
              >
                <MessageCircle size={16} />
                {sendingId === member.id ? "Sending…" : "Send WhatsApp"}
              </button>
            </div>
          )}
        </div>
      ))}

      {showCompleteButton && (
        <button type="button" onClick={completeIncident} className="button button-save w-full mt-4">
          Mark completed &amp; signed
        </button>
      )}
    </Section>
  );
}
