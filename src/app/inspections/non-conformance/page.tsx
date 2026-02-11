"use client";

import { useState, useEffect } from "react";

// Safe ID generator (no SSR mismatch)
const generateId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type NcrImage = {
  id: string;
  url: string;
};

type NcrItem = {
  id: string;
  description: string;
  date: string;
  comment: string;
  department: string;
  images: NcrImage[];
  expanded: boolean;
};

const createEmptyItem = (): NcrItem => ({
  id: generateId(),
  description: "",
  date: new Date().toISOString().slice(0, 10),
  comment: "",
  department: "",
  images: [],
  expanded: true,
});

export default function NonConformancePage() {
  const [items, setItems] = useState<NcrItem[]>([]);
  const [email, setEmail] = useState("");

  // Department memory
  const [departments, setDepartments] = useState<string[]>([]);
  const [deptQuery, setDeptQuery] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState<string | null>(null);

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load saved departments
  useEffect(() => {
    const stored = localStorage.getItem("ncrDepartments");
    if (stored) setDepartments(JSON.parse(stored));
  }, []);

  const saveDepartment = (dept: string) => {
    if (!dept.trim()) return;
    const updated = Array.from(new Set([...departments, dept.trim()]));
    setDepartments(updated);
    localStorage.setItem("ncrDepartments", JSON.stringify(updated));
  };

  const filteredDepartments = (query: string) =>
    departments.filter((d) =>
      d.toLowerCase().includes(query.toLowerCase())
    );

  // ⭐ Load NCR report from Prisma
  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch("/api/ncr/latest");
        const data = await res.json();

        if (data && data.items) {
          setItems(
            data.items.map((item: any) => ({
              id: item.id,
              description: item.description,
              date: item.date.slice(0, 10),
              comment: item.comment || "",
              department: item.department || "",
              images: item.images.map((img: any) => ({
                id: img.id,
                url: img.url,
              })),
              expanded: false,
            }))
          );
        } else {
          setItems([createEmptyItem()]);
        }
      } catch (err) {
        console.error("Failed to load NCR report:", err);
        setItems([createEmptyItem()]);
      }
    }

    loadReport();
  }, []);

  const toggleExpanded = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  const updateItemField = (
    id: string,
    field: keyof Omit<NcrItem, "images" | "expanded" | "id">,
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleImagesChange = (id: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    Promise.all(
      fileArray.map(
        (file) =>
          new Promise<NcrImage>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: generateId(),
                url: reader.result as string,
              });
            };
            reader.readAsDataURL(file);
          })
      )
    ).then((newImages) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, images: [...item.images, ...newImages] }
            : item
        )
      );
    });
  };

  const deleteImage = (itemId: string, imageId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              images: item.images.filter((img) => img.id !== imageId),
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // ⭐ Save NCR report to Prisma
  const handleSaveReport = async () => {
    const res = await fetch("/api/ncr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      alert("Failed to save report.");
      return;
    }

    alert("Report saved to database.");
  };

  const handleSavePdf = async () => {
    const res = await fetch("/api/ncr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      alert("Failed to save report for PDF.");
      return;
    }

    const report = await res.json();

    if (!report?.id) {
      alert("Report saved, but could not determine report ID for PDF.");
      return;
    }

    const url = `/api/pdf?type=ncr&id=${encodeURIComponent(report.id)}`;
    window.open(url, "_blank");
  };

  const handleSendEmail = () => {
    alert(`Report will be sent to: ${email} (stub).`);
  };

  return (
    <div
      className="
        min-h-screen w-full 
        bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300
        dark:bg-[#0f172a]
        p-8
      "
    >
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            Non-Conformance Report
          </h1>
          <p className="text-black dark:text-white opacity-80">
            Capture and track issues identified during inspections.
          </p>
        </div>

        {/* NCR ITEMS */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="
                bg-white/40 backdrop-blur-xl rounded-2xl p-4 shadow-xl 
                border border-white/30
              "
            >
              {/* COLLAPSED HEADER */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <span className="text-sm font-semibold text-black dark:text-white">
                    Item #{item.id.slice(-5)}
                  </span>
                  <span className="text-sm text-black dark:text-white">
                    {item.description || <span className="opacity-60">No description yet</span>}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-black/70 dark:text-white/70 max-w-xs line-clamp-1">
                    {item.comment || <span className="opacity-60">No comment yet</span>}
                  </span>
                  <span className="text-xl text-black dark:text-white">
                    {item.expanded ? "▴" : "▾"}
                  </span>
                </div>
              </div>

              {/* EXPANDED CONTENT */}
              {item.expanded && (
                <div className="mt-4 space-y-4">

                  {/* DESCRIPTION */}
                  <div>
                    <label className="block text-black dark:text-white font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        updateItemField(item.id, "description", e.target.value)
                      }
                      className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black h-24"
                      placeholder="Describe the non-conformance"
                    />
                  </div>

                  {/* COMMENT */}
                  <div>
                    <label className="block text-black dark:text-white font-medium mb-1">
                      Comment
                    </label>
                    <input
                      type="text"
                      value={item.comment}
                      onChange={(e) =>
                        updateItemField(item.id, "comment", e.target.value)
                      }
                      className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                      placeholder="Add a comment or action note"
                    />
                  </div>

                  {/* DATE + DEPARTMENT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* DATE */}
                    <div>
                      <label className="block text-black dark:text-white font-medium mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) =>
                          updateItemField(item.id, "date", e.target.value)
                        }
                        className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                      />
                    </div>

                    {/* DEPARTMENT WITH MEMORY */}
                    <div className="relative">
                      <label className="block text-black dark:text-white font-medium mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={item.department}
                        onChange={(e) => {
                          updateItemField(item.id, "department", e.target.value);
                          setDeptQuery(e.target.value);
                          setShowDeptDropdown(item.id);
                        }}
                        onFocus={() => setShowDeptDropdown(item.id)}
                        className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                        placeholder="Enter department"
                      />

                      {/* DROPDOWN */}
                      {showDeptDropdown === item.id &&
                        filteredDepartments(deptQuery).length > 0 && (
                          <div className="absolute z-20 mt-1 w-full rounded-xl bg-white/70 backdrop-blur-md shadow-lg border border-white/30">
                            {filteredDepartments(deptQuery).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => {
                                  updateItemField(item.id, "department", d);
                                  saveDepartment(d);
                                  setShowDeptDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-white/90 text-black"
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* IMAGE UPLOAD + THUMBNAILS */}
                  <div className="space-y-2">
                    <label className="block text-black dark:text-white font-medium mb-1">
                      Pictures
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImagesChange(item.id, e.target.files)}
                      className="block w-full text-sm text-black
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                      "
                    />
                    {item.images.length > 0 && (
                      <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                        {item.images.map((img) => (
                          <div
                            key={img.id}
                            className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-white/40 shadow"
                          >
                            <img
                              src={img.url}
                              alt="NCR"
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => {
                                setPreviewImage(img.url);
                                setShowPreview(true);
                              }}
                            />

                            {/* DELETE ONLY THIS IMAGE */}
                            <button
                              type="button"
                              onClick={() => deleteImage(item.id, img.id)}
                              className="
                                absolute top-1 right-1 
                                w-6 h-6 flex items-center justify-center
                                rounded-full 
                                bg-white/40 backdrop-blur-md
                                border border-white/50
                                text-red-700 font-bold
                                hover:bg-red-600 hover:text-white hover:border-red-600
                                transition
                              "
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DELETE ITEM BUTTON */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition text-sm"
                    >
                      Delete Item
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ADD ITEM BUTTON */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addItem}
              className="
                flex items-center gap-2 px-5 py-3 
                bg-blue-600 text-white rounded-full shadow 
                hover:bg-blue-700 transition
              "
            >
              <span className="text-xl">＋</span>
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1.5fr] gap-6 items-start">

          {/* SAVE REPORT + PDF */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Report Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveReport}
                className="px-5 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm"
              >
                Save Report
              </button>
              <button
                type="button"
                onClick={handleSavePdf}
                className="px-5 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-sm"
              >
                Save as PDF
              </button>
            </div>
          </div>

          {/* SEND BY EMAIL */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Send by Email
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
              placeholder="recipient@example.com"
            />
            <button
              type="button"
              onClick={handleSendEmail}
              className="mt-2 w-full px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm"
            >
              Send Report
            </button>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN IMAGE PREVIEW MODAL */}
      {showPreview && previewImage && (
        <div
          className="
            fixed inset-0 z-50 
            bg-black/70 backdrop-blur-md 
            flex items-center justify-center
            p-4
          "
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] rounded-xl shadow-2xl"
            />

            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="
                absolute top-3 right-3 
                w-10 h-10 flex items-center justify-center
                rounded-full 
                bg-white/40 backdrop-blur-md
                border border-white/50
                text-black text-2xl font-bold
                hover:bg-red-600 hover:text-white hover:border-red-600
                transition
              "
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

