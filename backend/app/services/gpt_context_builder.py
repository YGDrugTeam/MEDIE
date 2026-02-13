def build_drug_context(drug: dict) -> str:
    return f"""
다음 정보는 대한민국 식품의약품안전처(MFDS) 공식 의약품 정보입니다.
이 정보만을 근거로 사용자에게 설명하세요.

[의약품명]
{drug.get("name")}

[제조사]
{drug.get("company")}

[효능]
{drug.get("effect")}

[복용법]
{drug.get("usage")}

[주의사항]
{drug.get("warning")}
{drug.get("caution")}

[상호작용]
{drug.get("interaction")}

[부작용]
{drug.get("sideEffect")}

[보관방법]
{drug.get("storage")}

[정보 기준일]
{drug.get("updatedAt")}
"""
