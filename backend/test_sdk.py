import os
import asyncio
from google import genai
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))
    print("Connecting...")
    async with client.aio.live.connect(model='gemini-3.1-flash-live-preview') as session:
        print("Connected!")
        print([m for m in dir(session) if not m.startswith('_')])

asyncio.run(main())
