#!/usr/bin/env bash
# Download raw datasets for Naija-Twin.
# Usage: bash scripts/download_datasets.sh

set -euo pipefail

echo "Downloading Amazon Reviews 2023 (Electronics)..."
# TODO: implement download from McAuley-Lab/Amazon-Reviews-2023

echo "Downloading Amazon Reviews 2023 (Fashion)..."
# TODO: implement download

echo "Downloading Naija Twitter Sentiment dataset..."
# TODO: implement download from HuggingFace

echo "Done. Raw data saved to data/raw/"
