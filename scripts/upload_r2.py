#!/usr/bin/env python3
"""Uploads the final MP4 to Cloudflare R2 and saves the public URL."""
import sys, os
import boto3
from botocore.config import Config

GENRE      = sys.argv[1] if len(sys.argv) > 1 else "comedy"
R2_KEY     = os.environ["R2_ACCESS_KEY_ID"]
R2_SECRET  = os.environ["R2_SECRET_ACCESS_KEY"]
R2_BUCKET  = os.environ["R2_BUCKET_NAME"]
R2_ACCOUNT = os.environ["R2_ACCOUNT_ID"]
R2_PUBLIC  = os.environ["R2_PUBLIC_URL"]

video_path = f"out/{GENRE}_final.mp4"
object_key = f"videos/{GENRE}_latest.mp4"

if not os.path.exists(video_path):
    raise FileNotFoundError(f"Video not found: {video_path}")

print(f"Uploading {video_path} to Cloudflare R2...")

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{R2_ACCOUNT}.r2.cloudflarestorage.com",
    aws_access_key_id=R2_KEY,
    aws_secret_access_key=R2_SECRET,
    config=Config(signature_version="s3v4"),
)

s3.upload_file(
    video_path,
    R2_BUCKET,
    object_key,
    ExtraArgs={
        "ContentType": "video/mp4",
        "ACL":         "public-read",
    },
)

public_url = f"{R2_PUBLIC}/{object_key}"

with open("out/public_url.txt", "w") as f:
    f.write(public_url)

print(f"Uploaded successfully.")
print(f"Public URL: {public_url}")
