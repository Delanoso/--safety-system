export type IncidentImageCategory = "photo" | "relevant";

export type IncidentImageRecord = {
  id: string;
  url: string;
  category?: string | null;
  comment?: string | null;
  createdAt?: string | Date;
};

export type PendingIncidentImage = {
  file: File;
  category: IncidentImageCategory;
  comment?: string;
};

export function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function sortIncidentImages<T extends { createdAt?: string | Date }>(
  images: T[]
): T[] {
  return [...images].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return ta - tb;
  });
}

export async function uploadAndSaveIncidentImages(
  incidentId: string,
  items: PendingIncidentImage[]
): Promise<void> {
  if (items.length === 0) return;

  const formData = new FormData();
  items.forEach(({ file }) => formData.append("images", file));

  const uploadRes = await fetch(`/api/incidents/${incidentId}/upload-images`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData.error || "Image upload failed");
  }

  const uploadJson = await uploadRes.json();
  const urls = uploadJson.urls as string[];

  const saveRes = await fetch(`/api/incidents/${incidentId}/images`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      images: urls.map((url, index) => ({
        url,
        category: items[index]?.category ?? "photo",
        comment: items[index]?.comment?.trim() || null,
      })),
    }),
  });

  if (!saveRes.ok) {
    const errData = await saveRes.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to save image records");
  }
}

export async function deleteIncidentImage(
  incidentId: string,
  imageId: string
): Promise<void> {
  const res = await fetch(`/api/incidents/${incidentId}/images/${imageId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to delete image");
  }
}
