const API_BASE_URL = "http://172.16.30.167:8000";

export async function analyzePill(imageUri: string) {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "pill.jpg",
    type: "image/jpeg",
  } as any);

  const res = await fetch(`${API_BASE_URL}/pill/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("서버 요청 실패");
  }

  return res.json();
}
