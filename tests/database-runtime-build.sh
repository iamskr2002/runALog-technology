#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/../.zscripts" && pwd)"
TEST_ROOT="$(mktemp -d)"
trap 'rm -rf "$TEST_ROOT"' EXIT

PROJECT_DIR="$TEST_ROOT/project" BUILD_DIR="$TEST_ROOT/build" \
    bash "$SCRIPT_DIR/database-runtime-build.sh"

[[ ! -e "$TEST_ROOT/build/db/custom.db" ]]

echo "database runtime build tests passed: no local database is packaged"
