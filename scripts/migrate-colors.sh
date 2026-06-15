#!/bin/bash
# RURALIZE Design Token Migration Script
# Applies color token replacements across all remaining component files

set -e

RURALIZE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$RURALIZE_DIR"

echo "🎨 RURALIZE Color Token Migration Script"
echo "=========================================="
echo ""
echo "This script will update all remaining components with new design tokens."
echo ""

# List of files to update (excluding those already done)
FILES_TO_UPDATE=(
  "app/components/FollowButton.tsx"
  "app/components/feed/SideCards.tsx"
  "app/components/AuthCard.tsx"
  "app/components/AuthInput.tsx"
  "app/components/UserCard.tsx"
  "app/components/UserSearch.tsx"
  "app/components/CourseSelect.tsx"
  "app/components/ProfileCompletionModal.tsx"
  "app/components/appointments/EventRegistrationForm.tsx"
  "app/components/appointments/RegistrationActions.tsx"
  "app/components/appointments/RegistrationCancelModal.tsx"
  "app/components/appointments/RegistrationConfirmationModal.tsx"
  "app/components/appointments/RegistrationMissingFormModal.tsx"
  "app/feed/page.tsx"
  "app/perfil/page.tsx"
  "app/pontos/page.tsx"
  "app/explore/page.tsx"
  "app/components/Toast.tsx"
  "app/components/auth/RequireAuth.tsx"
  "app/components/feed/FeedTabs.tsx"
)

# Color mapping function
apply_color_replacements() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo "⏭️  Skipping (not found): $file"
    return
  fi

  echo "🔄 Updating: $file"

  # Create temporary file
  local temp_file="${file}.tmp"
  cp "$file" "$temp_file"

  # Apply all replacements using sed
  sed -i \
    -e 's/rounded-\[28px\]/rounded-3xl/g' \
    -e 's/rounded-\[24px\]/rounded-2xl/g' \
    -e 's/rounded-\[18px\]/rounded-xl/g' \
    -e 's/rounded-\[14px\]/rounded-lg/g' \
    -e 's/bg-\[#287630\]/bg-primary-dark/g' \
    -e 's/text-\[#287630\]/text-primary-dark/g' \
    -e 's/bg-\[#1f6f2a\]/bg-primary-dark/g' \
    -e 's/text-\[#1f6f2a\]/text-primary-dark/g' \
    -e 's/bg-\[#205f36\]/bg-primary-dark/g' \
    -e 's/text-\[#205f36\]/text-primary-dark/g' \
    -e 's/bg-\[#1f6428\]/bg-primary-darker/g' \
    -e 's/text-\[#1f6428\]/text-primary-darker/g' \
    -e 's/hover:bg-\[#1f6428\]/hover:bg-primary-darker/g' \
    -e 's/bg-\[#fbfcf7\]/bg-neutral-lighter/g' \
    -e 's/bg-\[#f4f5f0\]/bg-neutral-light/g' \
    -e 's/bg-\[#f8f8f3\]/bg-neutral-lighter/g' \
    -e 's/bg-\[#e7f3e8\]/bg-secondary-light/g' \
    -e 's/bg-\[#e0e5d8\]/bg-pastel-support/g' \
    -e 's/border-\[#e0e5d8\]/border-pastel-support/g' \
    -e 's/border-\[#d9e0d4\]/border-pastel-support/g' \
    -e 's/border-\[#e4e8df\]/border-neutral-light/g' \
    -e 's/border-\[#e4ebdf\]/border-neutral-light/g' \
    -e 's/border-\[#eff1eb\]/border-neutral-light/g' \
    -e 's/border-\[#e7eadf\]/border-neutral-light/g' \
    -e 's/text-\[#8a9186\]/text-neutral-muted/g' \
    -e 's/text-\[#687266\]/text-neutral-muted/g' \
    -e 's/text-\[#7a877b\]/text-neutral-muted/g' \
    -e 's/text-\[#8b998d\]/text-neutral-muted/g' \
    -e 's/text-\[#4f5b4e\]/text-neutral-muted/g' \
    -e 's/text-\[#65705f\]/text-neutral-muted/g' \
    -e 's/text-\[#a4aaa0\]/text-neutral-muted/g' \
    -e 's/text-\[#1e261e\]/text-neutral-darker/g' \
    -e 's/text-\[#20281f\]/text-neutral-darker/g' \
    -e 's/text-\[#1f281f\]/text-neutral-darker/g' \
    -e 's/text-\[#b92828\]/text-danger-primary/g' \
    -e 's/text-\[#c63a3a\]/text-danger-primary/g' \
    -e 's/bg-\[#fff3f3\]/bg-danger-light/g' \
    -e 's/bg-\[#fde8e8\]/bg-danger-light/g' \
    -e 's/bg-\[#e4f5df\]/bg-success-light/g' \
    -e 's/bg-\[#eef0ea\]/bg-neutral-lighter/g' \
    -e 's/bg-\[#e3e7dd\]/bg-neutral-light/g' \
    -e 's/bg-\[#f4f6f1\]/bg-neutral-lighter/g' \
    -e 's/bg-\[#e8efdf\]/bg-neutral-lighter/g' \
    -e 's/hover:bg-\[#f4f6f1\]/hover:bg-neutral-lighter/g' \
    -e 's/hover:bg-\[#f0f2ea\]/hover:bg-neutral-light/g' \
    -e 's/focus:border-\[#9ac89c\]/focus:border-pastel-support/g' \
    -e 's/focus:border-\[#287630\]/focus:border-primary-dark/g' \
    -e 's/ring-\[#e8efdf\]/ring-neutral-lighter/g' \
    -e 's/shadow-\[0_1px_0_rgba(33,55,30,0.04)\]/shadow-soft-xs/g' \
    -e 's/shadow-\[0_24px_50px_rgba(33,55,30,0.24)\]/shadow-soft-lg/g' \
    -e 's/shadow-\[0_24px_50px_rgba(33,55,30,0.22)\]/shadow-soft-lg/g' \
    -e 's/shadow-\[0_10px_18px_rgba(40,118,48,0.18)\]/shadow-soft-sm/g' \
    -e 's/shadow-\[0_10px_18px_rgba(185,40,40,0.18)\]/shadow-soft-sm/g' \
    -e 's/bg-\[#1f281f\]\/35/bg-neutral-darker\/35/g' \
    -e 's/bg-\[#1f281f\]\/25/bg-neutral-darker\/25/g' \
    -e 's/hover:bg-\[#9f2020\]/hover:bg-danger-darker/g' \
    -e 's/placeholder:text-\[#a4aaa0\]/placeholder:text-neutral-muted/g' \
    -e 's/bg-\[#225f35\]/bg-primary-dark/g' \
    -e 's/bg-\[#d0e5c2\]/hover:bg-pastel-support/g' \
    -e 's/ring-\[#e7f1df\]/ring-secondary-light/g' \
    -e 's/ring-\[#e8efdf\]/ring-neutral-lighter/g' \
    "$temp_file"

  # Check if file was modified
  if ! diff -q "$file" "$temp_file" > /dev/null 2>&1; then
    mv "$temp_file" "$file"
    echo "✅ Updated successfully"
  else
    rm "$temp_file"
    echo "⏭️  No changes needed"
  fi
}

# Process all files
echo "Processing ${#FILES_TO_UPDATE[@]} files..."
echo ""

for file in "${FILES_TO_UPDATE[@]}"; do
  apply_color_replacements "$file"
done

echo ""
echo "✨ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Test the app: npm run dev"
echo "3. Verify all components render correctly with new colors"
echo "4. Check for any remaining hardcoded colors: grep -r '#[0-9a-f]\{6\}' app/"
