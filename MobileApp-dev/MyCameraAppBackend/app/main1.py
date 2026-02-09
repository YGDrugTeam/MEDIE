import os
import requests
import pandas as pd
import xml.etree.ElementTree as ET

# app/main.py
from fastapi import FastAPI
from app.routers import custom_vision_router, pill_agent_router
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.pill import router as pill_router


load_dotenv()

app = FastAPI()


# pip install azure-cognitiveservices-vision-customvision 커스텀 비전
app.include_router(custom_vision_router.router)
app.include_router(pill_agent_router.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pill_router, prefix="/api/v1/pill")

# 1. 설정 (인증키와 경로)
# encoding_key = "940b88c7d03a653c76851dda7e8b9db654b495fb18a3c9dc923b32dd202da2e9"
# folder_path = r"C:\Users\UserK\Downloads\piles"  # 폴더 저장된 경로로 수정
# endpoint = "https://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList"

# # 2. 내 폴더 리스트 가져오기
# my_folders = [
#     f for f in os.listdir(folder_path) if os.path.isdir(os.path.join(folder_path, f))
# ]

# results = []
# total = len(my_folders)

# print(f"총 {total}개의 데이터를 조회합니다...")

# # 3. API 호출 및 매칭
# for i, code in enumerate(my_folders, 1):
#     params = {
#         "serviceKey": encoding_key,
#         "itemSeq": code,  # 품목기준코드로 검색
#         "type": "json",  # 결과 포맷
#     }

#     try:
#         response = requests.get(endpoint, params=params)
#         data = response.json()

#         # 데이터가 있는지 확인하고 제품명 추출
#         if data["header"]["resultCode"] == "00" and data["body"]["totalCount"] > 0:
#             item_name = data["body"]["items"][0]["itemName"]
#             entp_name = data["body"]["items"][0]["entpName"]
#             # 효능효과
#             efcyqesitm = data["body"]["items"][0]["efcyQesitm"]
#             # 용법용량
#             use_method_qesitm = data["body"]["items"][0]["useMethodQesitm"]
#             # 사용상의 경고사항
#             atpnWarnQesitm = data["body"]["items"][0]["atpnWarnQesitm"]
#             # 사용상의 주의사항
#             atpn_qesitm = data["body"]["items"][0]["atpnQesitm"]
#             # 상호작용 사항
#             intrc_qesitm = data["body"]["items"][0]["intrcQesitm"]
#             # 부작용
#             se_qesitm = data["body"]["items"][0]["seQesitm"]
#             # 보관방법
#             depositMethodQesitm = data["body"]["items"][0]["depositMethodQesitm"]

#             results.append(
#                 {
#                     "품목기준코드": code,
#                     "품목명": item_name,
#                     "제조사": entp_name,
#                     "효능효과": efcyqesitm,
#                     "용법용량": use_method_qesitm,
#                     "사용상의 경고사항": atpnWarnQesitm,
#                     "사용상의 주의사항": atpn_qesitm,
#                     "상호작용 사항": intrc_qesitm,
#                     "부작용": se_qesitm,
#                     "보관방법": depositMethodQesitm,
#                 }
#             )

#             # 진행 상황 출력
#             print(f"[{i}/{total}] 성공: {item_name}")
#         else:
#             results.append(
#                 {
#                     "품목기준코드": code,
#                     "품목명": "찾을 수 없음",
#                     "제조사": "-",
#                     "효능효과": "-",
#                     "용법용량": "-",
#                     "사용상의 경고사항": "-",
#                     "사용상의 주의사항": "-",
#                     "상호작용 사항": "-",
#                     "부작용": "-",
#                     "보관방법": "-",
#                 }
#             )
#             print(f"[{i}/{total}] 데이터 없음: {code}")

#     except Exception as e:
#         print(f"에러 발생 ({code}): {e}")
#         results.append(
#             {
#                 "품목기준코드": code,
#                 "품목명": "조회 실패",
#                 "제조사": "-",
#                 "효능효과": "-",
#                 "용법용량": "-",
#                 "사용상의 경고사항": "-",
#                 "사용상의 주의사항": "-",
#                 "상호작용 사항": "-",
#                 "부작용": "-",
#                 "보관방법": "-",
#             }
#         )

# # 4. 엑셀 저장
# df = pd.DataFrame(results)
# df.to_excel("의약품_상세정보2_리스트.xlsx", index=False)
# print("모든 작업이 완료되었습니다! '의약품_상세정보2_리스트.xlsx' 파일을 확인하세요.")
