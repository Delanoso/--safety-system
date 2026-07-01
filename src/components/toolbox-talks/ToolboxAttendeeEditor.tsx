"use client";

import { useState } from "react";
import PersonAutocomplete, {
  type CompanyPersonRecord,
  PersonDetailsCard,
} from "@/components/PersonAutocomplete";
import SignatureCapture from "@/components/SignatureCapture";
import {
  attendeeDisplayName,
  isAttendeeSigned,
  type ToolboxAttendeeDraft,
  type ToolboxAttendeeRecord,
} from "@/lib/toolbox-talk-attendees";
import { Check, Copy, Link2, PenLine } from "lucide-react";

type Props = {
  talkId?: string;
  attendees: ToolboxAttendeeRecord[];
  onChange?: (attendees: ToolboxAttendeeDraft[]) => void;
  onAddPersisted?: (attendee: ToolboxAttendeeDraft) => Promise<boolean>;
  onRemovePersisted?: (attendeeId: string) => Promise<boolean>;
  onSigned?: () => void;
};

const emptyDraft = (): ToolboxAttendeeDraft => ({
  name: "",
  surname: "",
  idNumber: "",
  department: "",
  companyPersonId: null,
});

export default function ToolboxAttendeeEditor({
  talkId,
  attendees,
  onChange,
  onAddPersisted,
  onRemovePersisted,
  onSigned,
}: Props) {
  const [draft, setDraft] = useState<ToolboxAttendeeDraft>(emptyDraft());
  const [adding, setAdding] = useState(false);
  const [loadedPerson, setLoadedPerson] = useState<CompanyPersonRecord | null>(null);
  const [searchReset, setSearchReset] = useState(0);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [submittingSign, setSubmittingSign] = useState(false);
  const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null);

  function setDraftField<K extends keyof ToolboxAttendeeDraft>(
    key: K,
    value: ToolboxAttendeeDraft[K]
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function addAttendee() {
    const name = draft.name.trim();
    if (!name) {
      alert("Enter at least a first name for the attendee.");
      return;
    }
    const entry: ToolboxAttendeeDraft = {
      name,
      surname: draft.surname.trim(),
      idNumber: draft.idNumber.trim(),
      department: draft.department.trim(),
      companyPersonId: draft.companyPersonId,
    };

    setAdding(true);
    try {
      if (onAddPersisted) {
        const ok = await onAddPersisted(entry);
        if (!ok) return;
      } else if (onChange) {
        onChange([...attendees, entry]);
      }
      setDraft(emptyDraft());
      setLoadedPerson(null);
      setSearchReset((n) => n + 1);
    } finally {
      setAdding(false);
    }
  }

  async function removeAttendee(index: number, attendeeId?: string) {
    if (onRemovePersisted && attendeeId) {
      const ok = await onRemovePersisted(attendeeId);
      if (!ok) return;
      return;
    }
    if (onChange) {
      onChange(attendees.filter((_, i) => i !== index));
    }
  }

  function signUrl(attendee: ToolboxAttendeeRecord): string | null {
    if (!talkId || !attendee.id || !attendee.signToken) return null;
    if (typeof window === "undefined") return null;
    return `${window.location.origin}/toolbox-talks/sign/${talkId}/${attendee.id}?token=${attendee.signToken}`;
  }

  async function copySignLink(attendee: ToolboxAttendeeRecord) {
    const url = signUrl(attendee);
    if (!url) {
      alert("Signing link is not available for this attendee.");
      return;
    }
    await navigator.clipboard.writeText(url);
    if (attendee.id) {
      setLinkCopiedId(attendee.id);
      setTimeout(() => setLinkCopiedId(null), 2000);
    }
  }

  async function saveSignature(attendeeId: string, signature: string) {
    if (!talkId) return;
    setSubmittingSign(true);
    try {
      const res = await fetch(`/api/toolbox-talks/${talkId}/attendees/${attendeeId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error ?? "Failed to save signature");
        return;
      }
      setSigningId(null);
      onSigned?.();
    } finally {
      setSubmittingSign(false);
    }
  }

  const signedCount = attendees.filter((a) => isAttendeeSigned(a)).length;

  return (
    <div className="space-y-4 rounded-xl border border-white/50 bg-white/40 p-4 overflow-visible">
      <div>
        <h3 className="text-sm font-semibold text-black mb-1">Attendees & signatures</h3>
        <p className="text-xs text-black/60">
          Add each person who attended, then capture their signature on this device or send them a signing link.
        </p>
        {onAddPersisted && attendees.length > 0 && (
          <p className="text-xs text-black/60 mt-1">
            {signedCount} of {attendees.length} signed
            {signedCount < attendees.length ? " — unsigned attendees should sign before audit export." : ""}
          </p>
        )}
      </div>

      <PersonAutocomplete
        label="Search employee on system"
        placeholder="Type name or employee number…"
        resetToken={searchReset}
        onSelect={(person: CompanyPersonRecord) => {
          setLoadedPerson(person);
          setDraft({
            name: person.name,
            surname: person.surname ?? "",
            idNumber: person.idNumber ?? "",
            department: person.department ?? "",
            companyPersonId: person.id,
          });
        }}
      />

      {loadedPerson && <PersonDetailsCard person={loadedPerson} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1">First name *</label>
          <input
            value={draft.name}
            onChange={(e) => setDraftField("name", e.target.value)}
            className="w-full p-2.5 rounded-lg border border-white/40 bg-white/70 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Surname</label>
          <input
            value={draft.surname}
            onChange={(e) => setDraftField("surname", e.target.value)}
            className="w-full p-2.5 rounded-lg border border-white/40 bg-white/70 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">ID number</label>
          <input
            value={draft.idNumber}
            onChange={(e) => setDraftField("idNumber", e.target.value)}
            className="w-full p-2.5 rounded-lg border border-white/40 bg-white/70 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Department</label>
          <input
            value={draft.department}
            onChange={(e) => setDraftField("department", e.target.value)}
            className="w-full p-2.5 rounded-lg border border-white/40 bg-white/70 text-sm"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={addAttendee}
        disabled={adding}
        className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50"
      >
        {adding ? "Adding…" : "Add attendee"}
      </button>

      {attendees.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/40">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead>
              <tr className="bg-white/50">
                <th className="p-2 font-semibold">Name</th>
                <th className="p-2 font-semibold">ID number</th>
                <th className="p-2 font-semibold">Department</th>
                <th className="p-2 font-semibold">Signature</th>
                <th className="p-2 font-semibold w-36"></th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a, index) => {
                const signed = isAttendeeSigned(a);
                return (
                  <tr
                    key={a.id ?? `${a.companyPersonId ?? "manual"}-${index}`}
                    className="border-t border-white/40 align-top"
                  >
                    <td className="p-2">
                      <div className="font-medium">{attendeeDisplayName(a)}</div>
                      {a.surname && a.name && (
                        <div className="text-xs text-black/50 sr-only">{a.surname}</div>
                      )}
                    </td>
                    <td className="p-2">{a.idNumber || "—"}</td>
                    <td className="p-2">{a.department || "—"}</td>
                    <td className="p-2">
                      {signed && a.signature ? (
                        <div className="space-y-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={a.signature}
                            alt={`Signature of ${attendeeDisplayName(a)}`}
                            className="h-10 max-w-[120px] border border-black/10 rounded bg-white object-contain"
                          />
                          {a.signedAt && (
                            <p className="text-xs text-green-700 flex items-center gap-1">
                              <Check size={12} />
                              {new Date(a.signedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : talkId && a.id ? (
                        signingId === a.id ? (
                          <SignatureCapture
                            submitting={submittingSign}
                            onSubmit={(sig) => saveSignature(a.id!, sig)}
                            className="max-w-sm"
                          />
                        ) : (
                          <span className="text-xs text-orange-700 font-medium">Awaiting signature</span>
                        )
                      ) : (
                        <span className="text-xs text-black/50">Sign after saving talk</span>
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        {talkId && a.id && !signed && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setSigningId((cur) => (cur === a.id ? null : a.id!))
                              }
                              className="text-xs text-left text-blue-700 hover:underline flex items-center gap-1"
                            >
                              <PenLine size={12} />
                              {signingId === a.id ? "Cancel" : "Sign here"}
                            </button>
                            {a.signToken && (
                              <button
                                type="button"
                                onClick={() => copySignLink(a)}
                                className="text-xs text-left text-blue-700 hover:underline flex items-center gap-1"
                              >
                                {linkCopiedId === a.id ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                                {linkCopiedId === a.id ? "Copied!" : "Copy sign link"}
                              </button>
                            )}
                            {signUrl(a) && (
                              <a
                                href={signUrl(a)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-700 hover:underline flex items-center gap-1"
                              >
                                <Link2 size={12} />
                                Open sign page
                              </a>
                            )}
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttendee(index, a.id)}
                          className="text-red-600 hover:underline text-xs text-left"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
