"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StockRow = {
  id: number;
  itemTypeId: number;
  quantity: number;
  itemType: { id: number; name: string; minStockThreshold: number | null; reorderLevel: number | null };
};

type Movement = {
  id: number;
  movementType: string;
  quantityDelta: number;
  quantityAfter: number;
  reason: string | null;
  createdAt: string;
  itemType: { name: string };
};

const ADJUST_REASONS = [
  "Goods Received",
  "Initial Stock Load",
  "Cycle Count Correction",
  "Damaged on Receipt",
  "Damaged in Use",
  "Expired Stock Removal",
  "Lost Item Replacement",
  "Theft/Loss Adjustment",
  "Other",
];

const PPE_SIZE_ITEMS = [
  "Overall",
  "Conti Suit Pants",
  "Conti Suit Top",
  "Dust Coat",
  "Apron",
  "Hard Hat",
  "Gum Boots",
  "Safety Shoes",
  "Gloves",
  "Safety Goggles",
  "Face Shield",
  "Welding Hood",
  "Self Cont. Respirator",
  "Respirator",
  "Dust Mask",
  "Hearing Protection",
  "Safety Belt",
  "Thermal Suit",
  "Thermal Jacket",
  "Jersey",
  "Socks",
  "T-Shirt",
  "Golf Shirt",
  "Pants",
];

export default function PPEStockListPage() {
  const [stock, setStock] = useState<StockRow[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [editingQty, setEditingQty] = useState<Record<number, number>>({});
  const [receiveItemId, setReceiveItemId] = useState<number | "">("");
  const [receiveQty, setReceiveQty] = useState("");
  const [receiveNotes, setReceiveNotes] = useState("");
  const [adjustItemId, setAdjustItemId] = useState<number | "">("");
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState(ADJUST_REASONS[0]);
  const [adjustNotes, setAdjustNotes] = useState("");
  const [showMovements, setShowMovements] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<Record<number, string>>({});

  async function parseJsonResponse<T>(r: Response): Promise<T> {
    const text = await r.text();
    if (!text) return null as T;
    try {
      return JSON.parse(text) as T;
    } catch {
      if (!r.ok) throw { error: r.statusText || "Server error" };
      throw { error: "Invalid response from server." };
    }
  }

  function load() {
    fetch("/api/ppe/stock")
      .then(async (r) => {
        const data = await parseJsonResponse<StockRow[]>(r);
        if (!r.ok) return Promise.reject(typeof data === "object" && data !== null && "error" in data ? data : { error: r.statusText });
        return Array.isArray(data) ? data : [];
      })
      .then(setStock)
      .catch(() => setStock([]))
      .finally(() => setLoading(false));
  }

  function loadMovements() {
    fetch("/api/ppe/stock/movements?limit=100")
      .then(async (r) => {
        const data = await parseJsonResponse<Movement[]>(r);
        if (!r.ok) return Promise.reject(typeof data === "object" && data !== null && "error" in data ? data : { error: r.statusText });
        return Array.isArray(data) ? data : [];
      })
      .then(setMovements)
      .catch(() => setMovements([]));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (showMovements) loadMovements();
  }, [showMovements]);

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    fetch("/api/ppe/item-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          let err: { error?: string } = {};
          try {
            if (text) err = JSON.parse(text);
          } catch {
            err = { error: r.statusText || "Server error" };
          }
          return Promise.reject(err);
        }
        try {
          return text ? JSON.parse(text) : null;
        } catch {
          return Promise.reject({ error: "Invalid response from server." });
        }
      })
      .then(() => {
        setNewItemName("");
        load();
      })
      .catch((err) => alert(err?.error ?? "Failed to add item."));
  }

  function handleSetQuantity(itemTypeId: number, quantity: number) {
    fetch("/api/ppe/stock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemTypeId, quantity }),
    })
      .then(async (r) => {
        const data = await parseJsonResponse<{ error?: string }>(r);
        if (!r.ok) return Promise.reject(typeof data === "object" && data !== null && "error" in data ? data : { error: r.statusText });
        return data;
      })
      .then(() => {
        setEditingQty((prev) => ({ ...prev, [itemTypeId]: undefined }));
        load();
      })
      .catch((err) => alert(err?.error || "Failed to update stock."));
  }

  function handleDeleteItemType(id: number, name: string) {
    if (!confirm(`Remove item type "${name}"? This will remove its stock entry and any issue history.`)) return;
    fetch(`/api/ppe/item-types/${id}`, { method: "DELETE" }).then(() => load());
  }

  function handleReceive(e: React.FormEvent) {
    e.preventDefault();
    const itemTypeId = receiveItemId === "" ? 0 : Number(receiveItemId);
    const qty = parseInt(receiveQty, 10);
    if (!itemTypeId || !Number.isInteger(qty) || qty < 1) {
      alert("Select an item and enter a positive quantity.");
      return;
    }
    fetch("/api/ppe/stock/receive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemTypeId, quantity: qty, notes: receiveNotes.trim() || null }),
    })
      .then(async (r) => {
        const data = await parseJsonResponse<{ error?: string }>(r);
        if (!r.ok) return Promise.reject(typeof data === "object" && data !== null && "error" in data ? data : { error: r.statusText });
        return data;
      })
      .then(() => {
        setReceiveItemId("");
        setReceiveQty("");
        setReceiveNotes("");
        load();
        if (showMovements) loadMovements();
      })
      .catch((err) => alert(err?.error || "Failed to receive stock."));
  }

  function saveMinThreshold(itemTypeId: number, value: string) {
    const num = value === "" ? null : Math.floor(Number(value));
    fetch(`/api/ppe/item-types/${itemTypeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minStockThreshold: num === null || Number.isNaN(num) ? null : num,
      }),
    })
      .then(async (r) => {
        const data = await parseJsonResponse<{ error?: string }>(r);
        if (!r.ok) return Promise.reject(typeof data === "object" && data !== null && "error" in data ? data : { error: r.statusText });
        return data;
      })
      .then(() => {
        setEditingThreshold((prev) => ({ ...prev, [itemTypeId]: undefined }));
        load();
      })
      .catch((err) => alert(err?.error || "Failed to update threshold."));
  }

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    const itemTypeId = adjustItemId === "" ? 0 : Number(adjustItemId);
    const delta = parseInt(adjustDelta, 10);
    if (!itemTypeId || !Number.isInteger(delta)) {
      alert("Select an item and enter a quantity change (positive or negative).");
      return;
    }
    fetch("/api/ppe/stock/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemTypeId,
        quantityDelta: delta,
        reason: adjustReason,
        notes: adjustNotes.trim() || null,
      }),
    })
      .then(async (r) => {
        const data = await parseJsonResponse<{ error?: string }>(r);
        if (!r.ok) return Promise.reject(typeof data === "object" && data !== null && "error" in data ? data : { error: r.statusText });
        return data;
      })
      .then(() => {
        setAdjustItemId("");
        setAdjustDelta("");
        setAdjustNotes("");
        load();
        if (showMovements) loadMovements();
      })
      .catch((err) => alert(err?.error || "Failed to adjust stock."));
  }

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 min-w-0">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">Stock List</h1>
            <p className="text-black/70 mt-1 text-sm sm:text-base">
              Track PPE in stock. Receive stock, adjust quantities, and view movement history. Stock deducts when someone signs for an issue.
            </p>
          </div>
          <Link
            href="/ppe-management"
            className="px-3 py-2 sm:px-4 rounded-xl bg-white/60 border border-white/40 text-black font-semibold hover:bg-white/80 transition text-sm sm:text-base shrink-0"
          >
            ← Back to PPE Management
          </Link>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-black mb-4">Add PPE Item Type</h2>
          <form onSubmit={handleAddItem} className="flex gap-2 flex-wrap items-center">
            <select
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 min-w-0 sm:min-w-[220px] p-2.5 sm:p-3 rounded-lg border border-white/40 bg-white/70 text-black text-sm sm:text-base"
            >
              <option value="">
                {PPE_SIZE_ITEMS.filter(
                  (item) => !stock.some((s) => s.itemType.name === item)
                ).length === 0
                  ? "All predefined PPE items are already added"
                  : "Select PPE item type…"}
              </option>
              {PPE_SIZE_ITEMS.filter(
                (item) => !stock.some((s) => s.itemType.name === item)
              ).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newItemName}
              className="px-3 py-2 sm:px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Add Item
            </button>
          </form>
          <p className="text-xs text-black/50 mt-2">
            Item list matches the PPE Size List (Overall, Conti Suit, Hard Hat, Shoes, Gloves, etc.).
          </p>
        </div>

        {stock.length > 0 && (
          <>
            <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-black mb-4">Receive stock</h2>
              <form onSubmit={handleReceive} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Item</label>
                  <select
                    value={receiveItemId === "" ? "" : receiveItemId}
                    onChange={(e) => setReceiveItemId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[180px]"
                  >
                    <option value="">Select item…</option>
                    {stock.map((s) => (
                      <option key={s.itemTypeId} value={s.itemTypeId}>
                        {s.itemType.name} (current: {s.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={receiveQty}
                    onChange={(e) => setReceiveQty(e.target.value)}
                    className="w-24 p-2 rounded-lg border border-white/40 bg-white/70 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={receiveNotes}
                    onChange={(e) => setReceiveNotes(e.target.value)}
                    placeholder="e.g. Delivery note"
                    className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[160px]"
                  />
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">
                  Receive stock
                </button>
              </form>
            </div>

            <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-black mb-4">Adjust stock</h2>
              <p className="text-sm text-black/60 mb-3">Use a positive or negative number to add or subtract from current stock.</p>
              <form onSubmit={handleAdjust} className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Item</label>
                  <select
                    value={adjustItemId === "" ? "" : adjustItemId}
                    onChange={(e) => setAdjustItemId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[180px]"
                  >
                    <option value="">Select item…</option>
                    {stock.map((s) => (
                      <option key={s.itemTypeId} value={s.itemTypeId}>
                        {s.itemType.name} (current: {s.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Change (+ / −)</label>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(e.target.value)}
                    placeholder="e.g. -2 or +5"
                    className="w-28 p-2 rounded-lg border border-white/40 bg-white/70 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Reason</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[180px]"
                  >
                    {ADJUST_REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black/70 mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[140px]"
                  />
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700">
                  Adjust
                </button>
              </form>
            </div>
          </>
        )}

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px] sm:min-w-0 text-sm sm:text-base">
            <thead>
              <tr className="bg-white/40">
                <th className="p-2 sm:p-4 font-semibold text-black">Item</th>
                <th className="p-2 sm:p-4 font-semibold text-black">Quantity in stock</th>
                <th className="p-2 sm:p-4 font-semibold text-black">Low-stock alert below</th>
                <th className="p-2 sm:p-4 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stock.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-2 sm:p-4 text-center text-black/60 text-sm sm:text-base">
                    No items yet. Add item types above (e.g. Shoes, Gloves).
                  </td>
                </tr>
              )}
              {stock.map((s) => (
                <tr key={s.id} className="border-t border-white/40">
                  <td className="p-2 sm:p-4 font-medium text-black">{s.itemType.name}</td>
                  <td className="p-2 sm:p-4">
                    {editingQty[s.itemTypeId] !== undefined ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min={0}
                          value={editingQty[s.itemTypeId]}
                          onChange={(e) => setEditingQty((prev) => ({ ...prev, [s.itemTypeId]: parseInt(e.target.value, 10) || 0 }))}
                          className="w-24 p-2 rounded border bg-white/80"
                        />
                        <button
                          onClick={() => handleSetQuantity(s.itemTypeId, editingQty[s.itemTypeId] ?? 0)}
                          className="px-2 py-1 rounded bg-green-600 text-white text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingQty((prev) => ({ ...prev, [s.itemTypeId]: undefined }))}
                          className="px-2 py-1 rounded bg-gray-300 text-black text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-black/80">{s.quantity}</span>
                    )}
                  </td>
                  <td className="p-2 sm:p-4">
                    {editingThreshold[s.itemType.id] !== undefined ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min={0}
                          value={editingThreshold[s.itemType.id]}
                          onChange={(e) => setEditingThreshold((prev) => ({ ...prev, [s.itemType.id]: e.target.value }))}
                          className="w-16 p-2 rounded border bg-white/80 text-black"
                        />
                        <button
                          onClick={() => saveMinThreshold(s.itemType.id, editingThreshold[s.itemType.id] ?? "")}
                          className="px-2 py-1 rounded bg-green-600 text-white text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingThreshold((prev) => ({ ...prev, [s.itemType.id]: undefined }))}
                          className="px-2 py-1 rounded bg-gray-300 text-black text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-black/80">
                          {s.itemType.minStockThreshold ?? "—"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingThreshold((prev) => ({
                              ...prev,
                              [s.itemType.id]: String(s.itemType.minStockThreshold ?? ""),
                            }))
                          }
                          className="ml-2 text-xs text-blue-700 hover:underline"
                        >
                          Set
                        </button>
                      </>
                    )}
                  </td>
                  <td className="p-2 sm:p-4 flex gap-2 flex-wrap">
                    {editingQty[s.itemTypeId] === undefined && (
                      <button
                        onClick={() => setEditingQty((prev) => ({ ...prev, [s.itemTypeId]: s.quantity }))}
                        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Set quantity
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItemType(s.itemType.id, s.itemType.name)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Remove item
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        <div id="movements" className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden min-w-0">
          <button
            type="button"
            onClick={() => setShowMovements((v) => !v)}
            className="w-full p-4 text-left font-bold text-black flex items-center justify-between bg-white/40 hover:bg-white/60"
          >
            Stock movement history
            {showMovements ? " ▲" : " ▼"}
          </button>
          {showMovements && (
            <div className="p-4">
              {movements.length === 0 ? (
                <p className="text-black/60 text-sm">No movements recorded yet. Receive or adjust stock to see history.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/40">
                      <th className="p-2 font-semibold text-black">Date</th>
                      <th className="p-2 font-semibold text-black">Item</th>
                      <th className="p-2 font-semibold text-black">Type</th>
                      <th className="p-2 font-semibold text-black">Change</th>
                      <th className="p-2 font-semibold text-black">After</th>
                      <th className="p-2 font-semibold text-black">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => (
                      <tr key={m.id} className="border-b border-white/30">
                        <td className="p-2 text-black/80">{new Date(m.createdAt).toLocaleString()}</td>
                        <td className="p-2 text-black/80">{m.itemType.name}</td>
                        <td className="p-2 text-black/80">{m.movementType}</td>
                        <td className="p-2">{m.quantityDelta >= 0 ? `+${m.quantityDelta}` : m.quantityDelta}</td>
                        <td className="p-2 text-black/80">{m.quantityAfter}</td>
                        <td className="p-2 text-black/60">{m.reason ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
