"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Optional: dynamic folder types per section
const DEFAULT_FOLDER_TYPES = [
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
  "Quotations",
  "Invoices",
  "Other",
  "Certificates of Compliance",
];

export default function DocumentManager() {
  const params = useParams();
  const section = params.section as string;

  const [folders, setFolders] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderType, setNewFolderType] = useState("");

  useEffect(() => {
    loadFolders();
  }, [section]);

  async function loadFolders() {
    const res = await fetch(`/api/docs/folders?section=${section}`);
    const data = await res.json();
    setFolders(data);
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
    setSelectedFolder(null);
    setFiles([]);
    loadFolders();
  }

  async function uploadFile(e: any) {
    const file = e.target.files[0];
    if (!file || !selectedFolder) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", selectedFolder);

    await fetch(`/api/docs/files`, {
      method: "POST",
      body: formData,
    });

    loadFiles(selectedFolder);
  }

  async function deleteFile(id: string) {
    await fetch(`/api/docs/files/${id}`, { method: "DELETE" });
    loadFiles(selectedFolder!);
  }

  return (
    <div className="flex gap-6 p-6">
      {/* FOLDERS */}
      <div className="w-1/3 bg-white/10 p-4 rounded-xl backdrop-blur-md">
        <h2 className="text-xl font-semibold mb-4 capitalize">
          {section.replace(/-/g, " ")} — Folders
        </h2>

        <div className="flex gap-2 mb-4">
          <select
            className="bg-white/20 p-2 rounded"
            value={newFolderType}
            onChange={(e) => setNewFolderType(e.target.value)}
          >
            <option value="">Select folder type</option>
            {DEFAULT_FOLDER_TYPES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <button
            onClick={createFolder}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {folders.map((folder) => (
            <li
              key={folder.id}
              className="p-2 rounded flex justify-between items-center bg-white/10"
            >
              <span
                className="cursor-pointer"
                onClick={() => loadFiles(folder.id)}
              >
                {folder.name}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder.id);
                }}
                className="text-red-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* FILES */}
      <div className="w-2/3 bg-white/10 p-4 rounded-xl backdrop-blur-md">
        <h2 className="text-xl font-semibold mb-4">Files</h2>

        {selectedFolder && (
          <div className="mb-4">
            <input type="file" onChange={uploadFile} />
          </div>
        )}

        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="p-2 bg-white/10 rounded flex justify-between items-center"
            >
              <span>{file.name}</span>

              <div className="flex gap-3">
                <a
                  href={file.url}
                  target="_blank"
                  className="text-blue-400"
                >
                  View
                </a>

                <a
                  href={file.url}
                  download
                  className="text-green-400"
                >
                  Download
                </a>

                <button
                  onClick={() => deleteFile(file.id)}
                  className="text-red-400"
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

