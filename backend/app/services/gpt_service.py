import os
import json
import re
from openai import AzureOpenAI

# 🔥 api_version은 하드코딩 (검증된 버전)
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version="2025-01-01-preview",
)


def parse_pill_tag(tag_name: str):
    """
    tagName 예시:
    - 타이레놀,ttx
    - 하원아스피린장용정,hwo7
    """
    try:
        name, mark = tag_name.split(",")
        return name.strip(), mark.strip()
    except ValueError:
        return tag_name.strip(), None


def generate_pill_info_from_tag(tag_name: str):
    pill_name, pill_mark = parse_pill_tag(tag_name)
    return generate_pill_info(pill_name, pill_mark)


def generate_pill_info(pill_name: str, pill_mark: str | None):
    print(f"[GPT] 알약 설명 생성 요청: {pill_name},{pill_mark}")

    prompt = f"""
너는 의약품 정보 시스템이다.

아래에 제공된 알약 이름과 알약에 새겨진 음각 정보를 바탕으로,
일반적으로 알려진 의약품 정보를 추론하여
각 필드를 빈 문자열이 아닌 실제 정보로 채워라.

정보가 불확실한 경우에도,
일반적인 의약품 특성을 기반으로 가장 가능성이 높은 내용을 작성하라.
절대로 모든 필드를 빈 문자열("")로 반환하지 마라.

반드시 JSON만 반환해라.
설명 문장, 코드블록, 마크다운, 추가 텍스트는 절대 포함하지 마라.

알약 이름: {pill_name}
알약 음각: {pill_mark}

반환 형식 (아래 형식은 구조만 참고하고, 값은 반드시 채워라):
{{
  "pill_name": "{pill_name}",
  "appearance": {{
    "shape": "알약의 형태를 자연어로 작성",
    "color": "알약의 대표 색상",
    "mark": "{pill_mark}"
  }},
  "usage": "이 알약의 일반적인 복용 목적과 사용법",
  "warning": "복용 시 주의사항 및 금기 사항"
}}
"""
    print("before responses")
    # ✅ gpt-4o-2는 responses API 사용
    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),  # gpt-4o-2
        messages=[{"role": "system", "content": prompt}],
        temperature=0.2,
    )
    # print(response)
    # 🔥 responses API는 output_text가 가장 안전
    raw = response.choices[0].message.content

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        print("[GPT] JSON 파싱 실패 원본 ↓↓↓")
        print(raw)
        raise
