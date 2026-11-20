import os
from dotenv import load_dotenv

# Reads backend/.env into environment variables (if the file exists)
load_dotenv()


class Settings:
    llm_provider: str = os.getenv("LLM_PROVIDER", "gemini")
    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "gemini-3.8-flash")
    # How much the model "thinks" before answering. Lower = faster and cheaper.
    # Set LLM_THINKING_LEVEL= (empty) in .env to not send this setting at all.
    llm_thinking_level: str = os.getenv("LLM_THINKING_LEVEL", "low")
    allowed_origin: str = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")


settings = Settings()