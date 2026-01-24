<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() != 'pgsql') {
            return;
        }

        DB::unprepared(<<<'SQL'
-- Update sign_agreement to replace signature placeholders in content
CREATE OR REPLACE FUNCTION public.sign_agreement(
  agreement_token text, 
  p_signer_name text, 
  p_signature text, 
  p_ip_address text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agreement_id uuid;
  v_current_status text;
  v_expires_at timestamp with time zone;
  v_content text;
  v_signed_date text;
  v_signature_html text;
  v_font_class text;
  v_signature_name text;
BEGIN
  -- Validate signer name (minimum 2 chars, maximum 100)
  IF p_signer_name IS NULL OR length(trim(p_signer_name)) < 2 OR length(p_signer_name) > 100 THEN
    RETURN false;
  END IF;
  
  -- Validate signature (minimum 3 chars for name|font format)
  IF p_signature IS NULL OR length(p_signature) < 3 THEN
    RETURN false;
  END IF;
  
  -- Verify token and get agreement info
  SELECT id, status::text, expires_at, content INTO v_agreement_id, v_current_status, v_expires_at, v_content
  FROM public.agreements
  WHERE token = agreement_token;
  
  IF v_agreement_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Prevent re-signing - only allow signing if status is sent or viewed
  IF v_current_status NOT IN ('sent', 'viewed') THEN
    RETURN false;
  END IF;
  
  -- Check expiration
  IF v_expires_at IS NOT NULL AND v_expires_at < now() THEN
    UPDATE public.agreements SET status = 'expired' WHERE id = v_agreement_id AND status NOT IN ('signed', 'expired');
    RETURN false;
  END IF;
  
  -- Format the signed date
  v_signed_date := to_char(now(), 'FMMonth FMDD, YYYY');
  
  -- Parse the signature to get name and font class (format: "Name|font-class")
  IF position('|' IN p_signature) > 0 THEN
    v_signature_name := split_part(p_signature, '|', 1);
    v_font_class := split_part(p_signature, '|', 2);
  ELSE
    v_signature_name := p_signature;
    v_font_class := 'font-dancing';
  END IF;
  
  -- Create styled signature HTML
  v_signature_html := '<span class="signature-display ' || v_font_class || '" style="font-size: 1.5em;">' || v_signature_name || '</span>';
  
  -- Replace signature placeholders in content
  v_content := regexp_replace(v_content, '<span class="signature-placeholder"[^>]*>\[Awaiting Signature\]</span>', v_signature_html, 'gi');
  v_content := regexp_replace(v_content, '\{\{SIGNATURE\}\}', v_signature_html, 'gi');
  v_content := regexp_replace(v_content, '\{\{CLIENT_SIGNATURE\}\}', v_signature_html, 'gi');
  v_content := regexp_replace(v_content, '<span class="signature-date-placeholder"[^>]*>\[Date will appear here\]</span>', v_signed_date, 'gi');
  v_content := regexp_replace(v_content, '\{\{SIGNATURE_DATE\}\}', v_signed_date, 'gi');
  
  -- Sign the agreement and update content
  UPDATE public.agreements
  SET 
    signer_name = trim(p_signer_name),
    signature = p_signature,
    signed_at = now(),
    signed_ip = p_ip_address,
    status = 'signed',
    content = v_content
  WHERE id = v_agreement_id AND status IN ('sent', 'viewed');
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Log the activity
  INSERT INTO public.agreement_activity (agreement_id, action, ip_address, details)
  VALUES (v_agreement_id, 'signed', p_ip_address, jsonb_build_object('signer_name', trim(p_signer_name)));
  
  RETURN true;
END;
$$;
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
