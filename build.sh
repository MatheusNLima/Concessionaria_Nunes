#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies using pip
pip install -r requirements.txt

# Install uvicorn explicitly
pip install uvicorn