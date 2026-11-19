import os
from dotenv import load_dotenv

# Reads backend/.env into environment variables (if the file exists)
load_dotenv()


class Settings:
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    allowed_origin: str = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")


settings = Settings()
