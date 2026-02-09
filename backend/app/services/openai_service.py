import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("AZURE_OPENAI_API_KEY"))


async def analyze_pill_with_gpt(system_prompt: str, user_prompt: str):
    response = client.chat.completions.create(
        model="gpt-4o-2",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content
