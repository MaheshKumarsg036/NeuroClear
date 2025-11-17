export interface TransformResult {
  rewrite: string;
  highlights: string[];
  reading_time_minutes: number;
}

export interface TransformResponse {
  status: string;
  mode: string;
  pages: number;
  characters: number;
  result: TransformResult;
}

const defaultBaseUrl = "http://127.0.0.1:8000";
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? defaultBaseUrl;

export async function transformPdf(mode: string, file: File): Promise<TransformResponse> {
  const formData = new FormData();
  formData.append("mode", mode);
  formData.append("pdf", file, file.name || "document.pdf");

  const response = await fetch(`${apiBaseUrl}/api/v1/pdf-transform`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "Unable to transform document.";
    try {
      const payload = await response.json();
      detail = payload.detail ?? JSON.stringify(payload);
    } catch {
      detail = await response.text();
    }
    throw new Error(detail || "Backend returned an error.");
  }

  return response.json();
}
