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
-- Create staff_view_preferences table
CREATE TABLE public.staff_view_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    column_order TEXT[] NULL,
    hidden_columns TEXT[] NULL,
    column_widths JSONB NULL,
    sort_column TEXT NULL,
    sort_direction TEXT NULL,
    active_filters JSONB NULL,
    rows_per_page INTEGER NULL DEFAULT 50,
    saved_views JSONB NULL,
    active_view_name TEXT NULL,
    default_view_name TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- Create sales_rep_view_preferences table
CREATE TABLE public.sales_rep_view_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    column_order TEXT[] NULL,
    hidden_columns TEXT[] NULL,
    column_widths JSONB NULL,
    sort_column TEXT NULL,
    sort_direction TEXT NULL,
    active_filters JSONB NULL,
    rows_per_page INTEGER NULL DEFAULT 50,
    saved_views JSONB NULL,
    active_view_name TEXT NULL,
    default_view_name TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.staff_view_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_rep_view_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for staff_view_preferences
CREATE POLICY "Users can view their own staff view preferences" 
ON public.staff_view_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own staff view preferences" 
ON public.staff_view_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staff view preferences" 
ON public.staff_view_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own staff view preferences" 
ON public.staff_view_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for sales_rep_view_preferences
CREATE POLICY "Users can view their own sales rep view preferences" 
ON public.sales_rep_view_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sales rep view preferences" 
ON public.sales_rep_view_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales rep view preferences" 
ON public.sales_rep_view_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales rep view preferences" 
ON public.sales_rep_view_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_staff_view_preferences_updated_at
BEFORE UPDATE ON public.staff_view_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_rep_view_preferences_updated_at
BEFORE UPDATE ON public.sales_rep_view_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
SQL
        );
    }

    public function down(): void
    {
        // No automatic down migration available for imported Supabase SQL.
    }
};
