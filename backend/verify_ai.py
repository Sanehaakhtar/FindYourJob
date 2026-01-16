import asyncio
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

key = os.environ.get("CEREBRAS_API_KEY")
base_url = os.environ.get("CEREBRAS_BASE_URL")
model = os.environ.get("CEREBRAS_MODEL")

async def verify_cerebras():
    print(f"Checking Cerebras AI...")
    print(f"Model: {model}")
    print(f"Key: {key[:5]}..." if key else "Key: Not found")

    client = OpenAI(api_key=key, base_url=base_url)

    try:
        print("Sending test request to AI...")
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": "Say hello!"}
            ],
            max_tokens=10
        )
        print(f"[OK] AI Response: {response.choices[0].message.content}")
        
    except Exception as e:
        print(f"[ERROR] AI Verification failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify_cerebras())
