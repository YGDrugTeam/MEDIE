// services/api.js
import axios from 'axios';

export const API_URL =
  'https://mediclens-backend.azurewebsites.net';

export const analyzePill = async (photoUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: photoUri,
    name: 'pill.jpg',
    type: 'image/jpeg',
  });

  const res = await fetch(`${API_URL}/pill/analyze`, {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();
  return JSON.parse(text);
};

// 복용 히스토리
export const syncHistory = async (record, deviceId) => {
  await fetch(`${API_URL}/api/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: deviceId,
      pill_name: record.pillName,
      scheduled_time: record.scheduledTime,
      taken_at: record.takenAt,
    }),
  });
};

export const loadHistory = async (deviceId) => {
  const res = await fetch(`${API_URL}/api/history/${deviceId}`);
  return res.json();
};