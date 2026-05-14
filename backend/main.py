from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import get_current_user

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
    print(f"DEBUG: Request received from user {user.email}")
    print(f"DEBUG: File path: {request.file_path}")

    file_path = request.file_path
    
    # Security Check: Ensure the user is only processing files in their own folder
    if not file_path.startswith(f"{user.id}/"):
        print(f"DEBUG: Path mismatch! User ID: {user.id}, Path: {file_path}")
        raise HTTPException(status_code=403, detail="Unauthorized file access")

    # --- PLACEHOLDER FOR PHASE 4 ---
    # 1. Download file from Supabase Storage using file_path
    # 2. If video, extract audio using ffmpeg
    # 3. Send audio to Gemini API (google-genai) to extract CV JSON
    # 4. Save JSON to Supabase conversion_history table
    # 5. Return JSON to frontend
    
    print(f"Received request to process file: {file_path} for user: {user.email}")
    
    # Simulating processing time for now
    import time
    time.sleep(3)

    return {
        "message": "File received successfully",
        "file_path": file_path,
        "status": "processing_simulated"
    }