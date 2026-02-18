#!/bin/bash
# Quick script to update imports in remaining files

FILES=(
  "resources/js/cynergists/pages/partner/Referrals.tsx"
  "resources/js/cynergists/pages/partner/Deals.tsx"
  "resources/js/cynergists/pages/partner/Marketing.tsx"
  "resources/js/cynergists/pages/partner/Marketplace.tsx"
  "resources/js/cynergists/pages/partner/Reports.tsx"
)

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "Updating: $FILE"
    sed -i '' "s|from '@/integrations/supabase/client'|from '@/lib/api-client'|g" "$FILE"
    sed -i '' "s|import { supabase }|import { apiClient }|g" "$FILE"
  fi
done

echo "Import updates complete"
