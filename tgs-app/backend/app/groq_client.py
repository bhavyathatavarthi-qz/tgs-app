from groq import Groq
from app import config

_client_singleton = None

def get_client() -> Groq:
    global _client_singleton
    if not config.GROQ_API_KEY:
        raise ValueError(
            "GROQ_API_KEY is not set. Copy .env.example to .env and add your key from https://console.groq.com/keys"
        )
    if _client_singleton is None:
        _client_singleton = Groq(api_key=config.GROQ_API_KEY)
    return _client_singleton

def call_groq_json(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
    """Sends a system + user prompt pair to Groq and returns raw text response in JSON mode."""
    client = get_client()
    completion = client.chat.completions.create(
        model=config.GROQ_MODEL,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )
    
    content = completion.choices[0].message.content
    if not content:
        raise ValueError("Groq returned an empty response.")
    return content
