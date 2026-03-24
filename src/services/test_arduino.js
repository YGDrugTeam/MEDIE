// import axios from 'axios';

// export const API_URL = 'http://20.106.40.121';

// // 1. 단순 연결 테스트 함수 (추가됨)
// export const testArduinoConnection = async () => {
//   try {
//     // 백엔드 엔드포인트 대소문자에 맞춰 /Arduino로 호출
//     const res = await fetch(`${API_URL}/Arduino`, {
//       method: 'GET',
//     });
//     const data = await res.json();
//     console.log("연결 성공:", data.message);
//     return data;
//   } catch (error) {
//     console.error("연결 실패:", error);
//     throw error;
//   }
// };

// // 2. 기존 분석 함수 (엔드포인트 경로 수정)
// export const analyzePill = async (photoUri) => {
//   // 테스트를 위해 임시로 /Arduino를 호출하도록 수정하셨던 부분입니다.
//   const res = await fetch(`${API_URL}/Arduino`, {
//     method: 'GET',
//   });

//   const data = await res.json();
//   return data;
// };

// // --- 이하 기존 코드 동일 ---
// export const syncHistory = async (record, deviceId) => {
//   await fetch(`${API_URL}/api/history`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       user_id: deviceId,
//       pill_name: record.pillName,
//       scheduled_time: record.scheduledTime,
//       taken_at: record.takenAt,
//     }),
//   });
// };

// export const loadHistory = async (deviceId) => {
//   const res = await fetch(`${API_URL}/api/history/${deviceId}`);
//   return res.json();
// };