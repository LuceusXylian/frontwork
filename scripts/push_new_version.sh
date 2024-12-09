#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Check if there are any uncommitted changes
if [[ ! -z $(git diff --minimal) ]]; then
    echo "There are uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(grep '"version":' ../frontwork-std/package.json | sed 's/.*: "\(.*\)",/\1/')

# Split version into components
IFS='.' read -r -a version_parts <<< "$CURRENT_VERSION"
MAJOR="${version_parts[0]}"
MINOR="${version_parts[1]}"
PATCH="${version_parts[2]}"

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

# Update package.json
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" ../frontwork-std/package.json

# Update Cargo.toml
sed -i "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" ../frontwork-cli/Cargo.toml

# Update template files
FILES=(
    "../frontwork-cli/template/src/dependencies.ts"
    "../frontwork-cli/template/src/main.service.ts"
    "../frontwork-cli/template/src/main.testworker.ts"
)

for file in "${FILES[@]}"; do
    sed -i "s/@$CURRENT_VERSION/@$NEW_VERSION/g" "$file"
done

echo "Version updated from $CURRENT_VERSION to $NEW_VERSION"
