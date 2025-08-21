#!/usr/bin/env bash
# Exit on error
set -o errexit

# Create and activate virtual environment with Python 3.9
python3.9 -m venv venv
source venv/bin/activate

# Install dependencies using pip
pip install -r requirements.txt

# Install uvicorn explicitly
pip install uvicorn