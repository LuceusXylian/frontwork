#!/bin/bash

# Requires:
    # deno login (JSR: https://jsr.io)
    # cargo login
    # gh auth login

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

# Check if there are any uncommitted changes
# if [[ ! -z $(git diff --minimal) ]]; then
#     echo "There are uncommitted changes. Please commit or stash them first."
#     exit 1
# fi


# checks if a string uses invalid semitic version pattern
is_invalid_version() {
    # Check if input matches the pattern: one or more digits, dot, one or more digits, dot, one or more digits
    if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        return 1
    else
        return 0
    fi
}

# Get current version from deno.json (JSR package manifest)
CURRENT_VERSION=$(grep '"version":' ../frontwork-std/deno.json | head -n 1 | sed 's/.*: "\(.*\)",\?/\1/')
if is_invalid_version "$CURRENT_VERSION"; then
    echo "✗ CURRENT_VERSION '$CURRENT_VERSION' is NOT a valid semitic version. Please check \"../frontwork-std/deno.json\""
    exit 1
else
    echo "✓ CURRENT_VERSION is '$CURRENT_VERSION'"
fi

# Get user input and validate
echo "Please enter a version number (format: x.y.z): "
read -r NEW_VERSION

while is_invalid_version "$NEW_VERSION"; do
    echo "Invalid version format. Please enter a version like '1.2.3': "
    read -r NEW_VERSION
done

echo "✓ NEW_VERSION is '$NEW_VERSION'"

# Update deno.json (JSR package manifest)
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" ../frontwork-std/deno.json

# Update Cargo.toml
sed -i "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" ../frontwork-cli/Cargo.toml

# Update template files
FILES=(
    "../frontwork-cli/template/src/dependencies.ts"
    "../frontwork-cli/template/src/main.service.ts"
    "../frontwork-cli/template/src/main.testworker.ts"
    "../frontwork-cli/template/bundle.ts"
)

for file in "${FILES[@]}"; do
    sed -i "s|jsr:@frontwork-org/frontwork@$CURRENT_VERSION|jsr:@frontwork-org/frontwork@$NEW_VERSION|g" "$file"
done


# Clean deno.lock: remove old JSR package entries of the framework.
# With JSR the lockfile is package-level ("jsr:@frontwork-org/frontwork@x.y.z"),
# so no per-file entries have to be removed anymore.
DENO_LOCK_FILE="../frontwork-cli/template/deno.lock"

sed -i "/@frontwork-org\/frontwork@$CURRENT_VERSION/d" "$DENO_LOCK_FILE"

# Remove trailing comma
sed -i ':a;N;$!ba;s/,\n  }\n}/\n  }\n}/g' "$DENO_LOCK_FILE"


git add -A
git commit -m "push v$NEW_VERSION"
git push


# Create pull request
MY_GIT_REPO=$(git config --get remote.origin.url | sed 's/.*[\/:]\/\/github\.com\/\([a-zA-Z0-9_]+\/frontwork\)\.git/\1/')
gh pr create --repo frontwork-org/frontwork \
    --title "Merge changes for v$NEW_VERSION." \
    --body "Creating a pull request to merge changes for v$NEW_VERSION from $MY_GIT_REPO into frontwork-org/frontwork"

# Merge it
if ! gh pr merge --merge; then
    echo "Error: Failed to merge PR. Please try to set default repository"
    echo "gh repo set-default frontwork-org/frontwork"
    exit 1
fi

# Create and push tag
git tag -a "$NEW_VERSION" -m "Release v$NEW_VERSION"
git push origin "$NEW_VERSION"

# Publish framework to JSR (https://jsr.io/@frontwork-org/frontwork)
echo ""
echo ""
echo "Publishing @frontwork-org/frontwork to JSR."
echo ""
cd ../frontwork-std
if ! deno publish; then
    echo "Error: Failed to publish to JSR. Please run 'deno login' first."
    cd ../scripts
    exit 1
fi
cd ../scripts

# Remove bloat from template
rm -rf ../frontwork-cli/template/node_modules/
rm -rf ../frontwork-cli/template/dist/*

# Compile Rust project
cd ../frontwork-cli
cargo build --release
cd ../scripts

# Create release with binary
if ! gh release create "$NEW_VERSION" \
  --title "Frontwork v$NEW_VERSION" \
  --notes "Release notes for version $NEW_VERSION" \
  --target master \
  "../frontwork-cli/target/release/frontwork"; then
    echo "Error: Failed to create release"
    exit 1
fi


echo "Version updated from $CURRENT_VERSION to $NEW_VERSION"

echo ""
echo ""
echo "Starting cargo to publish crate and then installing new version."
echo ""

cd ../frontwork-cli
cargo publish
cargo install --path .


# Reload cache
deno cache --reload --lock=deno.lock ../frontwork-cli/template/src/main.testworker.ts
deno cache --reload --lock=deno.lock ../frontwork-cli/template/src/main.client.ts

echo "deno.lock has been updated with new versions and integrity hashes"
