#!/bin/bash

# Extract Docker build logs from the container image
# Usage: ./extract-build-logs.sh <image-name>

IMAGE_NAME=${1:-"my-app:latest"}
OUTPUT_DIR="./docker-build-logs"

echo "Extracting build logs from image: $IMAGE_NAME"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Create a temporary container (don't run it)
CONTAINER_ID=$(docker create "$IMAGE_NAME")

if [ -z "$CONTAINER_ID" ]; then
    echo "Error: Failed to create container from image $IMAGE_NAME"
    exit 1
fi

echo "Created temporary container: $CONTAINER_ID"

# Copy log files from container
docker cp "$CONTAINER_ID:/app/logs/npm-warnings.log" "$OUTPUT_DIR/npm-warnings.log" 2>/dev/null
docker cp "$CONTAINER_ID:/app/logs/build-warnings.log" "$OUTPUT_DIR/build-warnings.log" 2>/dev/null
docker cp "$CONTAINER_ID:/app/logs/build-summary.log" "$OUTPUT_DIR/build-summary.log" 2>/dev/null

# Remove temporary container
docker rm "$CONTAINER_ID" > /dev/null

if [ -f "$OUTPUT_DIR/build-summary.log" ]; then
    echo "✓ Build logs extracted successfully to: $OUTPUT_DIR/"
    echo ""
    echo "=== Build Summary ==="
    cat "$OUTPUT_DIR/build-summary.log"
else
    echo "✗ Failed to extract build logs"
    exit 1
fi
