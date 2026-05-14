import os
import tempfile
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import get_current_user, supabase
from media_service import extract_audio
from ai_service import process_audio_with_gemini

app = FastAPI(title="AI CV Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ProcessMediaRequest(BaseModel):
    file_path: str

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.get("/api/protected")
def protected_route(user = Depends(get_current_user)):
    """
    This route requires a valid Supabase JWT token.
    """
    return {
        "message": "You have access to this protected route!",
        "user_id": user.id,
        "email": user.email
    }

@app.post("/api/process-media")
def process_media(request: ProcessMediaRequest, user = Depends(get_current_user)):
    """
    Endpoint triggered by the frontend after a file is uploaded to Supabase Storage.
    """
    file_path = request.file_path
    
    # Security Check: Ensure the user is only processing files in their own folder
    if not file_path.startswith(f"{user.id}/"):
        raise HTTPException(status_code=403, detail="Unauthorized file access")

    temp_input_path = None
    temp_audio_path = None
    
    try:
        print(f"Downloading {file_path} from Supabase...")
        file_ext = os.path.splitext(file_path)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            res = supabase.storage.from_('temp_media').download(file_path)
            tmp.write(res)
            temp_input_path = tmp.name

        temp_audio_path = extract_audio(temp_input_path)

        cv_json = process_audio_with_gemini(temp_audio_path)

        print("Saving result to database...")
        db_res = supabase.table("conversion_history").insert({
            "user_id": user.id,
            "original_filename": os.path.basename(file_path),
            "json_data": cv_json
        }).execute()

        return {
            "status": "success",
            "data": cv_json,
            "history_id": db_res.data[0]['id']
        }

    except Exception as e:
        print(f"Error in process_media: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        for path in [temp_input_path, temp_audio_path]:
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except:
                    pass