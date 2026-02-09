from dotenv import load_dotenv
from app.services.gpt_service import generate_pill_description_with_gpt
import os


print("CWD:", os.getcwd())
print("load_dotenv result:", load_dotenv(verbose=True))
print("AZURE_OPENAI_API_KEY =", os.getenv("AZURE_OPENAI_API_KEY"))
print("-" * 60)


load_dotenv()  # ✅ 무조건 제일 위


print("AZURE_OPENAI_API_KEY =", os.getenv("AZURE_OPENAI_API_KEY"))
print("--------------------------------------------------------------------")


if __name__ == "__main__":
    result = generate_pill_description_with_gpt("타이레놀")
    print(result)
