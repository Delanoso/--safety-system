"use client";

import { useEffect, useState, useRef } from "react";

type Person = { id: number; name: string; email: string | null; phone: string | null };
type ItemType = { id: number; name: string };
type Issue = {
  id: number;
  personId: number;
  itemTypeId: number;
  quantity: number;
  issueDate: string;
  signature: string | null;
  signedAt: string | null;
  status: string;
  person: Person;
  itemType: ItemType;
};

export default function PPEIssueRegisterPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ personId: "", itemTypeId: "", quantity: 1 });
  const [signingIssueId, setSigningIssueId] = useState<number | null>(null);
  const [sendLinkIssueId, setSendLinkIssueId] = useState<number | null>(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function load() {
    Promise.all([
      fetch("/api/ppe/persons").then((r) => r.ok ? r.json() : []).then((data) => (Array.isArray(data) ? data : [])),
      fetch("/api/ppe/item-types").then((r) => r.ok ? r.json() : []).then((data) => (Array.isArray(data) ? data : [])),
      fetch("/api/ppe/issues").then((r) => r.ok ? r.json() : []).then((data) => (Array.isArray(data) ? data : [])),
    ])
      .then(([p, t, i]) => {
        setPersons(Array.isArray(p) ? p : []);
        setItemTypes(Array.isArray(t) ? t : []);
        setIssues(Array.isArray(i) ? i : []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleAddIssue(e: React.FormEvent) {
    e.preventDefault();
    const personId = parseInt(addForm.personId, 10);
    const itemTypeId = parseInt(addForm.itemTypeId, 10);
    if (!personId || !itemTypeId) {
      alert("Select a person and an item.");
      return;
    }
    fetch("/api/ppe/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        itemTypeId,
        quantity: addForm.quantity || 1,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then((issue: Issue) => {
        setAddForm({ personId: "", itemTypeId: "", quantity: 1 });
        setSigningIssueId(issue.id);
      })
      .catch((err) => alert(err?.error || "Failed to add issue."));
  }

  function handleSignNow(issueId: number) {
    setSigningIssueId(issueId);
  }

  const [isDrawing, setIsDrawing] = useState(false);
  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };
  const stopDraw = () => setIsDrawing(false);
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  function submitSignature(issueId: number) {
    const dataUrl = canvasRef.current?.toDataURL();
    if (!dataUrl) {
      alert("Please sign in the box.");
      return;
    }
    fetch(`/api/ppe/issues/${issueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: dataUrl }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then(() => {
        setSigningIssueId(null);
        clearCanvas();
        load();
      })
      .catch((err) => alert(err?.error || "Failed to save signature."));
  }

  function requestSignToken(issueId: number) {
    fetch(`/api/ppe/issues/${issueId}/send-for-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: sendEmail.trim() || undefined,
        phone: sendPhone.trim() || undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSignUrl(data.signUrl || null);
        setSendLinkIssueId(null);
        setSendEmail("");
        setSendPhone("");
        load();
      })
      .catch((err) => alert(err?.message || err?.error || "Failed to send."));
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  const signingIssue = issues.find((i) => i.id === signingIssueId);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">PPE Issue Register</h1>
        <p className="text-black/70">
          Issue PPE to people. They sign per item. Send the signing link to their email or phone for electronic signature.
        </p>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <h2 className="text-lg font-bold text-black mb-4">Add issue (then sign or send for signature)</h2>
          <form onSubmit={handleAddIssue} className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Person</label>
              <select
                value={addForm.personId}
                onChange={(e) => setAddForm((f) => ({ ...f, personId: e.target.value }))}
                className="p-2 rounded-lg border border-white/40 bg-white/70 min-w-[180px]"
              >
                <option value="">Select person</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Item</label>
              <select
                value={addForm.itemTypeId}
                onChange={(e) => setAddForm((f) => ({ ...f, itemTypeId: e.target.value }))}
                className="p-2 rounded-lg border border-white/40 bg-white/70 min-w-[140px]"
              >
                <option value="">
                  {itemTypes.length === 0 ? "No items — add in Stock List first" : "Select item"}
                </option>
                {itemTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {itemTypes.length === 0 && (
                <p className="text-sm text-amber-700 mt-1">
                  Go to <a href="/ppe-management/stock-list" className="underline font-semibold">Stock List</a> and add item types (e.g. Shoes, Gloves) first.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={addForm.quantity}
                onChange={(e) => setAddForm((f) => ({ ...f, quantity: parseInt(e.target.value, 10) || 1 }))}
                className="p-2 rounded-lg border border-white/40 bg-white/70 w-20"
              />
            </div>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
              Add & sign
            </button>
          </form>
        </div>

        {signingIssueId != null && signingIssue && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
            <h2 className="text-lg font-bold text-black mb-2">
              Sign: {signingIssue.person.name} – {signingIssue.quantity} x {signingIssue.itemType.name}
            </h2>
            <p className="text-sm text-black/60 mb-4">Draw your signature below, then click Save. Or close and use &quot;Send for signature&quot; to send a link.</p>
            <canvas
              ref={canvasRef}
              width={350}
              height={120}
              className="border rounded bg-white shadow block mb-2"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
            />
            <div className="flex gap-2">
              <button
                onClick={() => submitSignature(signingIssueId)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold"
              >
                Save signature
              </button>
              <button onClick={clearCanvas} className="px-4 py-2 rounded-lg bg-gray-300 text-black">Clear</button>
              <button onClick={() => setSigningIssueId(null)} className="px-4 py-2 rounded-lg bg-gray-400 text-black">Cancel</button>
            </div>
          </div>
        )}

        {sendLinkIssueId != null && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
            <h2 className="text-lg font-bold text-black mb-4">Send signing link</h2>
            <p className="text-sm text-black/60 mb-4">Enter email and/or phone. Link will be sent by email if Resend is configured, or copy the link to send via SMS/WhatsApp.</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <input
                type="email"
                placeholder="Email"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                className="p-2 rounded border bg-white/80 min-w-[200px]"
              />
              <input
                type="text"
                placeholder="Phone"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                className="p-2 rounded border bg-white/80 min-w-[160px]"
              />
              <button
                onClick={() => requestSignToken(sendLinkIssueId)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                Send link
              </button>
              <button onClick={() => setSendLinkIssueId(null)} className="px-4 py-2 rounded bg-gray-300">Cancel</button>
            </div>
          </div>
        )}

        {signUrl && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
            <p className="font-semibold text-black mb-2">Signing link (share with the person):</p>
            <a href={signUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">
              {signUrl}
            </a>
            <button onClick={() => setSignUrl(null)} className="ml-4 text-black/70">Dismiss</button>
          </div>
        )}

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/40">
                <th className="p-4 font-semibold text-black">Person</th>
                <th className="p-4 font-semibold text-black">Item</th>
                <th className="p-4 font-semibold text-black">Qty</th>
                <th className="p-4 font-semibold text-black">Date</th>
                <th className="p-4 font-semibold text-black">Status</th>
                <th className="p-4 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-black/60">
                    No issues yet. Add an issue above.
                  </td>
                </tr>
              )}
              {issues.map((i) => (
                <tr key={i.id} className="border-t border-white/40">
                  <td className="p-4 text-black">{i.person.name}</td>
                  <td className="p-4 text-black">{i.itemType.name}</td>
                  <td className="p-4 text-black">{i.quantity}</td>
                  <td className="p-4 text-black/80">{new Date(i.issueDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    {i.status === "signed" ? (
                      <span className="text-green-600 font-semibold">Signed</span>
                    ) : (
                      <span className="text-orange-600 font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="p-4">
                    {i.status === "signed" && i.signature && (
                      <img src={i.signature} alt="Signature" className="h-10 w-24 object-contain border rounded" />
                    )}
                    {i.status === "pending_signature" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSignNow(i.id)}
                          className="px-2 py-1 rounded bg-blue-600 text-white text-sm"
                        >
                          Sign here
                        </button>
                        <button
                          onClick={() => setSendLinkIssueId(i.id)}
                          className="px-2 py-1 rounded bg-green-600 text-white text-sm"
                        >
                          Send for signature
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
