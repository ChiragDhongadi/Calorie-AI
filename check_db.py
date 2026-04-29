import os
import dotenv
from supabase import create_client

dotenv.load_dotenv()

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Supabase credentials missing in .env")
    exit(1)

supabase = create_client(url, key)

print("--- Checking daily_activities Table ---")
try:
    # Get a few rows to see columns
    response = supabase.table("daily_activities").select("*").limit(1).execute()
    if response.data:
        print("Columns found:", response.data[0].keys())
    else:
        print("Table is empty, checking schema via RPC or just printing expected names...")
        # Since I can't easily get schema via anon key if restricted, I'll try to insert a dummy.
except Exception as e:
    print(f"Error: {e}")
