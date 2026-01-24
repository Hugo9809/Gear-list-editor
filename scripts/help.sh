#!/usr/bin/env sh
set -e

HELP_FILE="$(dirname "$0")/../HELP.md"

if [ -f "$HELP_FILE" ]; then
  # Print the help surface to stdout for quick access via CLI-like invocation
  sed -n '1,400p' "$HELP_FILE"
else
  echo "Help file not found: $HELP_FILE" >&2
  exit 1
fi
