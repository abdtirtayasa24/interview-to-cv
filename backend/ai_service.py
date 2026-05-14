import os
import json
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

CV_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "personal_info": {
            "type": "OBJECT",
            "properties": {
                "full_name": {"type": "STRING"},
                "email": {"type": "STRING"},
                "phone": {"type": "STRING"},
                "location": {"type": "STRING"},
                "linkedin": {"type": "STRING"}
            },
            "required": ["full_name"]
        },
        "summary": {"type": "STRING"},
        "work_experience": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "job_title": {"type": "STRING"},
                    "company": {"type": "STRING"},
                    "location": {"type": "STRING"},
                    "start_date": {"type": "STRING"},
                    "end_date": {"type": "STRING"},
                    "description": {"type": "STRING"}
                }
            }
        },
        "education": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "degree": {"type": "STRING"},
                    "institution": {"type": "STRING"},
                    "graduation_year": {"type": "STRING"}
                }
            }
        },
        "skills": {"type": "ARRAY", "items": {"type": "STRING"}},
        "languages": {"type": "ARRAY", "items": {"type": "STRING"}}
    },
    "required": ["personal_info", "summary", "work_experience", "education", "skills"]
}

CV_PROMPT = """
Analyze the provided interview audio between a candidate and an HR representative. 
Extract the candidate's professional information, work history, education, and skills.
Ensure the summary is professional and highlights their key strengths mentioned in the interview.
"""

def load_system_prompt():
    try:
        current_dir = Path(__file__).parent
        prompt_path = current_dir / "prompt" / "SYSTEM_PROMPT.md"
        
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        print(f"Error loading SYSTEM_PROMPT.md: {e}")
        return CV_PROMPT

def process_audio_with_gemini(audio_path: str) -> dict:
    try:
        system_prompt = load_system_prompt()
        print("Uploading audio to Gemini...")
        uploaded_file = client.files.upload(file=audio_path)

        print("Gemini is analyzing audio with structured output...")
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                uploaded_file,
                system_prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CV_SCHEMA,
            )
        )

        return json.loads(response.text)
        
    except Exception as e:
        print(f"Gemini Processing Error: {str(e)}")
        raise Exception(f"AI failed to process the interview audio: {str(e)}")