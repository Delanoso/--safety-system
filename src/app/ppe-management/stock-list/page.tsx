"use client";

import { useEffect, useState } from "react";

type StockRow = {
  id: number;
  itemTypeId: number;
  quantity: number;
  itemType: { id: number; name: string };
};

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
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [editingQty, setEditingQty] = useState<Record<number, number>>({});

  function load() {
    fetch("/api/ppe/stock")
      .then((r) => r.json())
      .then(setStock)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const name = newItemName.trim();
    if (!name) return;
    fetch("/api/ppe/item-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then(() => {
        setNewItemName("");
        load();
      })
      .catch((err) => alert(err?.error || "Failed to add item."));
  }

  function handleSetQuantity(itemTypeId: number, quantity: number) {
    fetch("/api/ppe/stock", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemTypeId, quantity }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
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

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Stock List</h1>
        <p className="text-black/70">
          Set stock levels for each PPE item. When someone signs for an issue in the Issue Register, stock is deducted automatically.
        </p>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <h2 className="text-lg font-bold text-black mb-4">Add PPE Item Type</h2>
          <form onSubmit={handleAddItem} className="flex gap-2 flex-wrap items-center">
            <select
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 min-w-[220px] p-3 rounded-lg border border-white/40 bg-white/70 text-black"
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </form>
          <p className="text-xs text-black/50 mt-2">
            Item list matches the PPE Size List (Overall, Conti Suit, Hard Hat, Shoes, Gloves, etc.).
          </p>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/40">
                <th className="p-4 font-semibold text-black">Item</th>
                <th className="p-4 font-semibold text-black">Quantity in stock</th>
                <th className="p-4 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stock.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-black/60">
                    No items yet. Add item types above (e.g. Shoes, Gloves).
                  </td>
                </tr>
              )}
              {stock.map((s) => (
                <tr key={s.id} className="border-t border-white/40">
                  <td className="p-4 font-medium text-black">{s.itemType.name}</td>
                  <td className="p-4">
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
                  <td className="p-4 flex gap-2">
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
    </div>
  );
}
