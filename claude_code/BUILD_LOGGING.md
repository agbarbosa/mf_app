# Docker Build Warning Logging

This document explains how to capture and review warnings from the Docker build process.

## Overview

The Dockerfile is configured to automatically capture and log warnings from:
- **npm install** - Dependency warnings and deprecations
- **Prisma generate** - Schema and generation warnings
- **Next.js build** - Compilation and runtime warnings

All warnings are saved inside the Docker image at `/app/logs/` for later inspection.

## Log Files

Three log files are created during the build:

1. **npm-warnings.log** - Warnings from npm package installation
2. **build-warnings.log** - Warnings from Prisma and Next.js build
3. **build-summary.log** - Consolidated summary of all warnings with timestamp

## Viewing Logs During Build

Warnings are displayed during the build process at two points:

```bash
# Build the image - warnings will be shown in console
docker build -t my-app:latest .

# You'll see output like:
# === NPM Install Warnings ===
# npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
#
# === Build Warnings ===
# No build warnings found
```

## Extracting Logs After Build

### Option 1: Use the Helper Script (Recommended)

```bash
# Extract logs from built image
./extract-build-logs.sh my-app:latest

# Logs will be saved to ./docker-build-logs/
# - npm-warnings.log
# - build-warnings.log
# - build-summary.log
```

### Option 2: Manual Extraction

```bash
# Create temporary container
CONTAINER_ID=$(docker create my-app:latest)

# Copy logs out
docker cp $CONTAINER_ID:/app/logs ./docker-build-logs

# Clean up
docker rm $CONTAINER_ID
```

### Option 3: Inspect Running Container

```bash
# Start container
docker run -d --name my-app my-app:latest

# View logs
docker exec my-app cat /app/logs/build-summary.log

# Stop container
docker stop my-app && docker rm my-app
```

## Capturing Full Build Output

To save the complete Docker build output (including all stages):

```bash
# Capture everything to a file
docker build -t my-app:latest . 2>&1 | tee full-build.log

# Extract only warnings
grep -iE "warn|deprecated" full-build.log > extracted-warnings.log

# View warnings
cat extracted-warnings.log
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Build Docker image
  run: docker build -t my-app:latest . 2>&1 | tee build.log

- name: Extract build warnings
  run: |
    ./extract-build-logs.sh my-app:latest

- name: Upload build logs
  uses: actions/upload-artifact@v3
  with:
    name: docker-build-logs
    path: docker-build-logs/
```

### GitLab CI Example

```yaml
build:
  script:
    - docker build -t my-app:latest .
    - ./extract-build-logs.sh my-app:latest
  artifacts:
    paths:
      - docker-build-logs/
    expire_in: 7 days
```

## Automated Warning Monitoring

Create a script to fail builds if warnings are detected:

```bash
#!/bin/bash
# check-build-warnings.sh

./extract-build-logs.sh my-app:latest

# Check if any real warnings exist (not just "No warnings found")
if grep -v "No.*warnings found" docker-build-logs/build-summary.log | grep -iE "warn|deprecated" > /dev/null; then
    echo "⚠️  Build warnings detected!"
    cat docker-build-logs/build-summary.log
    exit 1
else
    echo "✓ No build warnings found"
    exit 0
fi
```

## Troubleshooting

### Logs not found in container

If you get "file not found" errors, check that:
1. The Docker build completed successfully
2. The image name is correct
3. The logs directory exists: `docker run --rm my-app:latest ls -la /app/logs/`

### Warnings not captured

If warnings aren't being logged:
1. Verify the warning messages match the grep patterns in Dockerfile
2. Check if warnings are going to stderr: use `2>&1` to capture both
3. Update the grep pattern if needed: `grep -iE "warn|warning|deprecated|error"`

## Customization

To capture additional types of messages, edit the Dockerfile grep patterns:

```dockerfile
# Capture errors as well
RUN grep -iE "warn|warning|deprecated|error" /tmp/build.log >> /app/build-warnings.log

# Capture specific package warnings
RUN grep "specific-package" /tmp/npm-install.log >> /app/package-warnings.log
```
