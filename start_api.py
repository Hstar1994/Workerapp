import os
import sys
import uvicorn

# Change to the API directory
api_dir = r"C:\Worker App1\services\api"
os.chdir(api_dir)
sys.path.insert(0, api_dir)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)