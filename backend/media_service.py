import ffmpeg
import os
import tempfile

def extract_audio(input_path: str) -> str:
    """
    Extracts audio from a video file and saves it as an mp3.
    If the input is already an audio file, it returns the original path.
    """
    ext = os.path.splitext(input_path)[1].lower()
    audio_extensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac']
    
    if ext in audio_extensions:
        return input_path

    # Create a temporary file for the audio
    temp_audio = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
    temp_audio_path = temp_audio.name
    temp_audio.close()

    try:
        print(f"Extracting audio from {input_path} to {temp_audio_path}...")
        (
            ffmpeg
            .input(input_path)
            .output(temp_audio_path, acodec='libmp3lame', ac=1, ar='16k')
            .overwrite_output()
            .run(quiet=True)
        )
        return temp_audio_path
    except ffmpeg.Error as e:
        print(f"FFmpeg error: {e.stderr.decode()}")
        raise Exception("Failed to extract audio from video.")