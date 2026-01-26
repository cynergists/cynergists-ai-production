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
-- Create notification_email_templates table for storing editable email templates
CREATE TABLE public.notification_email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_email_templates ENABLE ROW LEVEL SECURITY;

-- Service role only policy (admins use edge functions)
CREATE POLICY "Service role only - notification_email_templates" 
ON public.notification_email_templates 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER update_notification_email_templates_updated_at
BEFORE UPDATE ON public.notification_email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates for each document type
INSERT INTO public.notification_email_templates (document_type, subject, body) VALUES
('privacy', 'Important Update: Privacy Policy Has Been Updated', '<p>Hello,</p>
<p>We are writing to let you know that Cynergists has updated its Privacy Policy.</p>
<p>These updates are part of our ongoing commitment to transparency and to ensuring we clearly explain how information is collected, used, and protected when you interact with our services, website, and platforms.</p>
<p><strong>What this means for you:</strong></p>
<ul>
<li>The updated Privacy Policy clarifies how data is handled across our services.</li>
<li>No action is required from you at this time.</li>
<li>Your continued use of Cynergists services indicates acceptance of the updated policy.</li>
</ul>
<p>You can review the full Privacy Policy here:<br>
<a href="https://cynergists.ai/privacy">Privacy Policy Link</a></p>
<p>If you have any questions or would like additional clarification, you are welcome to contact us at <a href="mailto:hello@cynergists.com">hello@cynergists.com</a>.</p>
<p>Thank you for your continued trust in Cynergists.</p>
<p>Best regards,<br>The Cynergists Team</p>'),
('terms', 'Important Update: Terms & Conditions Have Been Updated', '<p>Hello,</p>
<p>We are writing to let you know that Cynergists has updated its Terms & Conditions.</p>
<p>These updates are part of our ongoing commitment to transparency and to ensuring we clearly explain the terms of our services.</p>
<p><strong>What this means for you:</strong></p>
<ul>
<li>The updated Terms & Conditions clarify how our services are provided.</li>
<li>No action is required from you at this time.</li>
<li>Your continued use of Cynergists services indicates acceptance of the updated terms.</li>
</ul>
<p>You can review the full Terms & Conditions here:<br>
<a href="https://cynergists.ai/terms">Terms & Conditions Link</a></p>
<p>If you have any questions or would like additional clarification, you are welcome to contact us at <a href="mailto:hello@cynergists.com">hello@cynergists.com</a>.</p>
<p>Thank you for your continued trust in Cynergists.</p>
<p>Best regards,<br>The Cynergists Team</p>'),
('msa', 'Important Update: Master Services Agreement Has Been Updated', '<p>Hello,</p>
<p>We are writing to let you know that Cynergists has updated its Master Services Agreement.</p>
<p>These updates are part of our ongoing commitment to transparency and to ensuring we clearly explain the terms of our services.</p>
<p><strong>What this means for you:</strong></p>
<ul>
<li>The updated MSA clarifies how our services are provided.</li>
<li>No action is required from you at this time.</li>
<li>Your continued use of Cynergists services indicates acceptance of the updated agreement.</li>
</ul>
<p>You can review the full Master Services Agreement here:<br>
<a href="https://cynergists.ai/terms">Master Services Agreement Link</a></p>
<p>If you have any questions or would like additional clarification, you are welcome to contact us at <a href="mailto:hello@cynergists.com">hello@cynergists.com</a>.</p>
<p>Thank you for your continued trust in Cynergists.</p>
<p>Best regards,<br>The Cynergists Team</p>');
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
