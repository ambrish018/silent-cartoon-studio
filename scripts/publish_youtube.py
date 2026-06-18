#!/usr/bin/env python3
"""Uploads the final video to YouTube using the Data API v3."""
import sys, os, json
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

GENRE = sys.argv[1] if len(sys.argv) > 1 else "comedy"

# ── Credentials ── you will fill these in via GitHub Secrets later
YOUTUBE_CLIENT_ID     = os.environ.get("YOUTUBE_CLIENT_ID",     "YOUR_CLIENT_ID_HERE")
YOUTUBE_CLIENT_SECRET = os.environ.get("YOUTUBE_CLIENT_SECRET", "YOUR_CLIENT_SECRET_HERE")
YOUTUBE_REFRESH_TOKEN = os.environ.get("YOUTUBE_REFRESH_TOKEN", "YOUR_REFRESH_TOKEN_HERE")

video_path = f"out/{GENRE}_final.mp4"
meta_path  = f"out/{GENRE}_meta.json"
SCOPES     = ["https://www.googleapis.com/auth/youtube.upload"]

if not os.path.exists(video_path):
    raise FileNotFoundError(f"Video not found: {video_path}")

if not os.path.exists(meta_path):
    raise FileNotFoundError(f"Metadata not found: {meta_path}")

with open(meta_path) as f:
    meta = json.load(f)

print(f"Uploading to YouTube: {meta.get('youtube_title')}")

creds = Credentials(
    token=None,
    refresh_token=YOUTUBE_REFRESH_TOKEN,
    token_uri="https://oauth2.googleapis.com/token",
    client_id=YOUTUBE_CLIENT_ID,
    client_secret=YOUTUBE_CLIENT_SECRET,
    scopes=SCOPES,
)
creds.refresh(Request())

youtube = build("youtube", "v3", credentials=creds)

request = youtube.videos().insert(
    part="snippet,status",
    body={
        "snippet": {
            "title":       meta["youtube_title"],
            "description": meta["youtube_description"],
            "tags":        meta["youtube_tags"],
            "categoryId":  meta.get("category_id", "23"),
        },
        "status": {
            "privacyStatus":          os.environ.get("YOUTUBE_PRIVACY", "public"),
            "selfDeclaredMadeForKids": False,
        },
    },
    media_body=MediaFileUpload(
        video_path,
        chunksize=-1,
        resumable=True,
        mimetype="video/mp4",
    ),
)

response = None
while response is None:
    status, response = request.next_chunk()
    if status:
        print(f"Uploading: {int(status.progress() * 100)}%")

watch_url = f"https://youtube.com/watch?v={response['id']}"
with open("out/youtube_url.txt", "w") as f:
    f.write(watch_url)
print(f"Done! Video live at: {watch_url}")
