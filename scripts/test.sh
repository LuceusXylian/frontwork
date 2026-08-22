#!/bin/bash

# Refreshes the template's deno.lock: rebuilds it from scratch out of the
# dependency specifiers referenced in the template source files.
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR/../frontwork-cli/template"


# Remove the lockfile so 'deno cache' rebuilds it without stale framework entries.
rm -f "deno.lock"

# Reload cache
# --minimum-dependency-age 0 allows resolving freshly published framework versions
# (Deno >=2.9 refuses by default to resolve versions younger than 24 hours).
deno cache --reload --minimum-dependency-age 0 --lock="$DENO_LOCK_FILE" src/main.testworker.ts
deno cache --reload --minimum-dependency-age 0 --lock="$DENO_LOCK_FILE" src/main.client.ts

echo "deno.lock has been updated with new versions and integrity hashes"
