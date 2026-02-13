# app/services/gpt_service.py
import os
import json
from datetime import datetime
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2025-01-01-preview",
)


def parse_pill_tag(tag_name: str):
    try:
        name, mark = tag_name.split(",")
        return name.strip(), mark.strip()
    except ValueError:
        return tag_name.strip(), None


def generate_pill_info_from_tag(tag_name: str, context: dict):
    pill_name, pill_mark = parse_pill_tag(tag_name)
    return generate_pill_info(pill_name, pill_mark, context)


def generate_pill_info(pill_name: str, pill_mark: str | None, context: dict):
    today = datetime.now().strftime("%Y-%m-%d")

    mfds = context.get("mfds")  # ← 추가

    mfds_block = ""
    if mfds:
        mfds_block = f"""
[식약처 공식 정보]
- 효능: {mfds.get('effect')}
- 복용법: {mfds.get('usage')}
- 주의사항: {mfds.get('warning')}
- 부작용: {mfds.get('sideEffect')}
- 기준일: {mfds.get('updatedAt')}
"""

    prompt = f"""
너는 신중한 의약품 정보 안내 시스템이다.
오늘 날짜는 {today}이다.

아래는 '{pill_name}'에 대해
현재 시점 기준으로 확인된 참고 정보이다.

[실시간 컨텍스트]
- 확인 시각: {context['verified_at']}
- 참고 사항:
{chr(10).join(context['reference_notes'])}

{mfds_block}

위 정보 범위 안에서만 판단하여,
추측하거나 단정하지 말고
일반적으로 안전한 수준의 설명만 작성하라.

반드시 JSON만 반환하라.
설명 문장, 코드블록, 마크다운은 포함하지 마라.

반환 형식:
{{
  "pill_name": "{pill_name}",
  "appearance": {{
    "shape": "알약의 일반적인 형태",
    "color": "대표 색상",
    "mark": "{pill_mark}"
  }},
  "usage": "공식 정보에 근거한 복용 목적 요약",
  "warning": "공식 정보에 근거한 주의사항 요약",
  "verified_at": "{context['verified_at']}",
  "source": "MFDS + AI"
}}
"""

    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
        messages=[{"role": "system", "content": prompt}],
        temperature=0.3,
    )

    raw = response.choices[0].message.content

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        print("[GPT] JSON 파싱 실패 원본 ↓↓↓")
        print(raw)
        raise
