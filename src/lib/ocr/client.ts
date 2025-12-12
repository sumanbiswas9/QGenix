type OCRParams = {
  imageUrl?: string;
  fileKey?: string;
};

export async function extractTextFromImage(params: OCRParams) {
  if (!params.imageUrl && !params.fileKey) {
    throw new Error("imageUrl or fileKey is required for OCR");
  }

  const baseUrl = process.env.OCR_PROVIDER_BASE_URL;
  const apiKey = process.env.OCR_PROVIDER_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error("OCR provider is not configured");
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      imageUrl: params.imageUrl,
      fileKey: params.fileKey,
    }),
  });

  if (!response.ok) {
    throw new Error("OCR request failed");
  }

  const data = await response.json();
  return {
    text: data.text as string,
    raw: data,
  };
}

