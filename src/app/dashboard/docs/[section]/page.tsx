"use client";

import { use, useEffect, useState } from "react";

const FOLDER_TYPES = [
  "Service Certificates",
  "Repairs",
  "Maintenance",
  "Testing",
  "Logs",
  "Lockout / Tagout",
  "Calibration",
  "External Inspections",
  "Warranties",
  "SOPs",
  "Risk Assessments",
  "Certificates of Compliance",
];

type Folder = {
  id: string;
  name: string;
  section: string;
  createdAt: string;
};

type FileItem = {
  id: string;
  name: string;
  url: string;
  size?: number;
  createdAt: string;
  folderId: string;
};

function getIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📄";
  if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) return "🖼️";
  return "📁";
}

function formatSize(size?: number | null) {
  if (!size || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentManager({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = use(params);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderType, setNewFolderType] = useState("");
  const [folderSearch, setFolderSearch] = useState("");

  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState("");

  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [fileRenameValue, setFileRenameValue] = useState("");

  useEffect(() => {
    loadFolders();
  }, [section]);

  async function loadFolders() {
    const res = await fetch(`/api/docs/folders?section=${section}`);
    const data = await res.json();
    setFolders(data);
    setSelectedFolder(null);
    setFiles([]);
  }

  async function loadFiles(folderId: string) {
    setSelectedFolder(folderId);
    const res = await fetch(`/api/docs/files?folderId=${folderId}`);
    const data = await res.json();
    setFiles(data);
  }

  async function createFolder() {
    if (!newFolderType) return;

    await fetch(`/api/docs/folders`, {
      method: "POST",
      body: JSON.stringify({ name: newFolderType, section }),
    });

    setNewFolderType("");
    loadFolders();
  }

  async function deleteFolder(id: string) {
    await fetch(`/api/docs/folders/${id}`, { method: "DELETE" });
    if (selectedFolder === id) {
      setSelectedFolder(null);
      setFiles([]);
    }
    loadFolders();
  }

  async function renameFolder(id: string) {
    if (!folderRenameValue.trim()) {
      setRenamingFolder(null);
      return;
    }

    await fetch(`/api/docs/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderRenameValue.trim() }),
    });

    setRenamingFolder(null);
    setFolderRenameValue("");
    loadFolders();
  }

  async function uploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedFolder) return;
    const list = e.target.files;
    if (!list || list.length === 0) return;

    const filesArr = Array.from(list);

    for (const f of filesArr) {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("folderId", selectedFolder);

      await fetch(`/api/docs/files`, {
        method: "POST",
        body: formData,
      });
    }

    loadFiles(selectedFolder);
    e.target.value = "";
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!selectedFolder) return;

    const list = e.dataTransfer.files;
    if (!list || list.length === 0) return;

    const filesArr = Array.from(list);

    for (const f of filesArr) {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("folderId", selectedFolder);

      await fetch(`/api/docs/files`, {
        method: "POST",
        body: formData,
      });
    }

    loadFiles(selectedFolder);
  }

  async function deleteFile(id: string) {
    await fetch(`/api/docs/files/${id}`, { method: "DELETE" });
    if (selectedFolder) loadFiles(selectedFolder);
  }

  async function renameFile(id: string) {
    if (!fileRenameValue.trim()) {
      setRenamingFile(null);
      return;
    }

    await fetch(`/api/docs/files/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fileRenameValue.trim() }),
    });

    setRenamingFile(null);
    setFileRenameValue("");
    if (selectedFolder) loadFiles(selectedFolder);
  }

  const filteredFolders = folders
    .filter((f) =>
      f.name.toLowerCase().includes(folderSearch.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex gap-6 p-6">
      <div className="w-1/3 bg-white/10 p-4 rounded-xl backdrop-blur-md">
        <h2 className="text-xl font-semibold mb-4">Folders</h2>

        <div className="flex gap-2 mb-3">
          <select
            className="bg-white/20 p-2 rounded w-full"
            value={newFolderType}
            onChange={(e) => setNewFolderType(e.target.value)}
          >
            <option value="">Select folder type</option>
            {FOLDER_TYPES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <button
            onClick={createFolder}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>

        <input
          className="p-2 rounded bg-white/20 w-full mb-3"
          placeholder="Search folders..."
          value={folderSearch}
          onChange={(e) => setFolderSearch(e.target.value)}
        />

        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
          {filteredFolders.map((folder) => (
            <li
              key={folder.id}
              className="p-2 rounded flex justify-between items-center bg-white/10"
            >
              <div
                className={`flex-1 mr-2 cursor-pointer ${
                  selectedFolder === folder.id ? "text-blue-300" : ""
                }`}
                onClick={() => loadFiles(folder.id)}
              >
                {renamingFolder === folder.id ? (
                  <input
                    autoFocus
                    className="bg-white/20 p-1 rounded w-full"
                    value={folderRenameValue}
                    onChange={(e) =>
                      setFolderRenameValue(e.target.value)
                    }
                    onBlur={() => renameFolder(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") renameFolder(folder.id);
                      if (e.key === "Escape") {
                        setRenamingFolder(null);
                        setFolderRenameValue("");
                      }
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setRenamingFolder(folder.id);
                      setFolderRenameValue(folder.name);
                    }}
                  >
                    {folder.name}
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.id);
                }}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-2/3 bg-white/10 p-4 rounded-xl backdrop-blur-md">
        <h2 className="text-xl font-semibold mb-4">Files</h2>

        {selectedFolder ? (
          <>
            <div className="mb-4 flex items-center gap-4">
              <label className="px-4 py-2 bg-purple-600 text-white rounded cursor-pointer hover:bg-purple-700 transition">
                Choose Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={uploadFiles}
                />
              </label>
              <span className="text-sm opacity-70">
                Only PDF and images (JPG, PNG, WEBP)
              </span>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-purple-400 p-6 rounded-lg text-center mb-4 cursor-pointer text-sm text-purple-100"
            >
              Drag & drop files here
            </div>
          </>
        ) : (
          <p className="text-sm opacity-70 mb-4">
            Select a folder to upload and view files.
          </p>
        )}

        <ul className="space-y-2 max-h-[65vh] overflow-y-auto">
          {files.map((file) => (
            <li
              key={file.id}
              className="p-2 bg-white/10 rounded flex justify-between items-center"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span>{getIcon(file.name)}</span>

                  {renamingFile === file.id ? (
                    <input
                      autoFocus
                      className="bg-white/20 p-1 rounded"
                      value={fileRenameValue}
                      onChange={(e) =>
                        setFileRenameValue(e.target.value)
                      }
                      onBlur={() => renameFile(file.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameFile(file.id);
                        if (e.key === "Escape") {
                          setRenamingFile(null);
                          setFileRenameValue("");
                        }
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => {
                        setRenamingFile(file.id);
                        setFileRenameValue(file.name);
                      }}
                    >
                      {file.name}
                    </span>
                  )}
                </div>

                <div className="text-xs opacity-70 mt-1">
                  {formatSize(file.size)}{" "}
                  {file.createdAt &&
                    `• ${new Date(file.createdAt).toLocaleDateString()}`}
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={file.url}
                  target="_blank"
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  View
                </a>

                <a
                  href={file.url}
                  download
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Download
                </a>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

