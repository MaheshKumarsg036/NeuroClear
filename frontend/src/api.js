const defaultBaseUrl = "http://127.0.0.1:8000";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? defaultBaseUrl;
export async function transformPdf(mode, file) {
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
        }
        catch {
            detail = await response.text();
        }
        throw new Error(detail || "Backend returned an error.");
    }
    return response.json();
}
