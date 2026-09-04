import { api } from "@/lib/api";

type Signature = {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
};

export async function uploadListingImage(file: File, onProgress?: (pct: number) => void) {
  const sig = await api<Signature>("/uploads/signature", { method: "POST" });
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;

  const json = await new Promise<Record<string, unknown>>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as Record<string, unknown>;
        if (xhr.status >= 400) reject(new Error(String(body.error || "Upload failed")));
        else resolve(body);
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(form);
  });

  return {
    publicId: String(json.public_id),
    url: String(json.secure_url),
    width: Number(json.width || 0),
    height: Number(json.height || 0),
    isPrimary: false,
  };
}
