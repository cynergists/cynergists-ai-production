export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: '14.1';
    };
    public: {
        Tables: {
            admin_approval_requests: {
                Row: {
                    approval_token: string;
                    created_at: string | null;
                    id: string;
                    requester_email: string;
                    requester_name: string;
                    review_notes: string | null;
                    reviewed_at: string | null;
                    reviewed_by: string | null;
                    status: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    approval_token?: string;
                    created_at?: string | null;
                    id?: string;
                    requester_email: string;
                    requester_name: string;
                    review_notes?: string | null;
                    reviewed_at?: string | null;
                    reviewed_by?: string | null;
                    status?: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    approval_token?: string;
                    created_at?: string | null;
                    id?: string;
                    requester_email?: string;
                    requester_name?: string;
                    review_notes?: string | null;
                    reviewed_at?: string | null;
                    reviewed_by?: string | null;
                    status?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            admin_notes: {
                Row: {
                    admin_user_id: string | null;
                    content: string | null;
                    created_at: string;
                    id: string;
                    note_type: string | null;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    admin_user_id?: string | null;
                    content?: string | null;
                    created_at?: string;
                    id?: string;
                    note_type?: string | null;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    admin_user_id?: string | null;
                    content?: string | null;
                    created_at?: string;
                    id?: string;
                    note_type?: string | null;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            admin_settings: {
                Row: {
                    created_at: string;
                    email_on_agreement_signed: boolean | null;
                    email_on_new_session: boolean | null;
                    email_on_plan_click: boolean | null;
                    id: string;
                    notification_email: string | null;
                    theme: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    email_on_agreement_signed?: boolean | null;
                    email_on_new_session?: boolean | null;
                    email_on_plan_click?: boolean | null;
                    id?: string;
                    notification_email?: string | null;
                    theme?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    email_on_agreement_signed?: boolean | null;
                    email_on_new_session?: boolean | null;
                    email_on_plan_click?: boolean | null;
                    id?: string;
                    notification_email?: string | null;
                    theme?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            admin_users: {
                Row: {
                    admin_user_type:
                        | Database['public']['Enums']['admin_user_type']
                        | null;
                    created_at: string;
                    email: string;
                    id: string;
                    is_active: boolean;
                    is_super_admin: boolean;
                    name: string;
                };
                Insert: {
                    admin_user_type?:
                        | Database['public']['Enums']['admin_user_type']
                        | null;
                    created_at?: string;
                    email: string;
                    id?: string;
                    is_active?: boolean;
                    is_super_admin?: boolean;
                    name: string;
                };
                Update: {
                    admin_user_type?:
                        | Database['public']['Enums']['admin_user_type']
                        | null;
                    created_at?: string;
                    email?: string;
                    id?: string;
                    is_active?: boolean;
                    is_super_admin?: boolean;
                    name?: string;
                };
                Relationships: [];
            };
            agent_access: {
                Row: {
                    agent_name: string;
                    agent_type: string;
                    configuration: Json;
                    created_at: string;
                    customer_id: string;
                    id: string;
                    is_active: boolean;
                    last_used_at: string | null;
                    subscription_id: string;
                    tenant_id: string | null;
                    updated_at: string;
                    usage_count: number;
                    usage_limit: number | null;
                };
                Insert: {
                    agent_name: string;
                    agent_type: string;
                    configuration?: Json;
                    created_at?: string;
                    customer_id: string;
                    id?: string;
                    is_active?: boolean;
                    last_used_at?: string | null;
                    subscription_id: string;
                    tenant_id?: string | null;
                    updated_at?: string;
                    usage_count?: number;
                    usage_limit?: number | null;
                };
                Update: {
                    agent_name?: string;
                    agent_type?: string;
                    configuration?: Json;
                    created_at?: string;
                    customer_id?: string;
                    id?: string;
                    is_active?: boolean;
                    last_used_at?: string | null;
                    subscription_id?: string;
                    tenant_id?: string | null;
                    updated_at?: string;
                    usage_count?: number;
                    usage_limit?: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agent_access_customer_id_fkey';
                        columns: ['customer_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'agent_access_subscription_id_fkey';
                        columns: ['subscription_id'];
                        isOneToOne: false;
                        referencedRelation: 'customer_subscriptions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'agent_access_tenant_id_fkey';
                        columns: ['tenant_id'];
                        isOneToOne: false;
                        referencedRelation: 'portal_tenants';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agent_categories: {
                Row: {
                    created_at: string;
                    display_order: number | null;
                    id: string;
                    name: string;
                };
                Insert: {
                    created_at?: string;
                    display_order?: number | null;
                    id?: string;
                    name: string;
                };
                Update: {
                    created_at?: string;
                    display_order?: number | null;
                    id?: string;
                    name?: string;
                };
                Relationships: [];
            };
            agent_conversations: {
                Row: {
                    agent_access_id: string;
                    created_at: string;
                    customer_id: string;
                    id: string;
                    messages: Json;
                    status: string;
                    tenant_id: string | null;
                    title: string | null;
                    updated_at: string;
                };
                Insert: {
                    agent_access_id: string;
                    created_at?: string;
                    customer_id: string;
                    id?: string;
                    messages?: Json;
                    status?: string;
                    tenant_id?: string | null;
                    title?: string | null;
                    updated_at?: string;
                };
                Update: {
                    agent_access_id?: string;
                    created_at?: string;
                    customer_id?: string;
                    id?: string;
                    messages?: Json;
                    status?: string;
                    tenant_id?: string | null;
                    title?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agent_conversations_agent_access_id_fkey';
                        columns: ['agent_access_id'];
                        isOneToOne: false;
                        referencedRelation: 'agent_access';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'agent_conversations_customer_id_fkey';
                        columns: ['customer_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'agent_conversations_tenant_id_fkey';
                        columns: ['tenant_id'];
                        isOneToOne: false;
                        referencedRelation: 'portal_tenants';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agent_memory: {
                Row: {
                    agent_source: string | null;
                    created_at: string;
                    customer_id: string;
                    expires_at: string | null;
                    id: string;
                    memory_key: string;
                    memory_value: Json;
                    updated_at: string;
                };
                Insert: {
                    agent_source?: string | null;
                    created_at?: string;
                    customer_id: string;
                    expires_at?: string | null;
                    id?: string;
                    memory_key: string;
                    memory_value: Json;
                    updated_at?: string;
                };
                Update: {
                    agent_source?: string | null;
                    created_at?: string;
                    customer_id?: string;
                    expires_at?: string | null;
                    id?: string;
                    memory_key?: string;
                    memory_value?: Json;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agent_memory_customer_id_fkey';
                        columns: ['customer_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agent_suggestions: {
                Row: {
                    admin_notes: string | null;
                    agent_name: string;
                    category: string;
                    created_at: string;
                    customer_id: string | null;
                    description: string;
                    id: string;
                    status: string;
                    updated_at: string;
                    use_case: string | null;
                    user_id: string;
                };
                Insert: {
                    admin_notes?: string | null;
                    agent_name: string;
                    category: string;
                    created_at?: string;
                    customer_id?: string | null;
                    description: string;
                    id?: string;
                    status?: string;
                    updated_at?: string;
                    use_case?: string | null;
                    user_id: string;
                };
                Update: {
                    admin_notes?: string | null;
                    agent_name?: string;
                    category?: string;
                    created_at?: string;
                    customer_id?: string | null;
                    description?: string;
                    id?: string;
                    status?: string;
                    updated_at?: string;
                    use_case?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            agreement_access_log: {
                Row: {
                    action: string;
                    created_at: string;
                    id: string;
                    ip_address: string;
                    token_hash: string;
                };
                Insert: {
                    action: string;
                    created_at?: string;
                    id?: string;
                    ip_address: string;
                    token_hash: string;
                };
                Update: {
                    action?: string;
                    created_at?: string;
                    id?: string;
                    ip_address?: string;
                    token_hash?: string;
                };
                Relationships: [];
            };
            agreement_activity: {
                Row: {
                    action: string;
                    agreement_id: string;
                    created_at: string;
                    details: Json | null;
                    id: string;
                    ip_address: string | null;
                    user_agent: string | null;
                };
                Insert: {
                    action: string;
                    agreement_id: string;
                    created_at?: string;
                    details?: Json | null;
                    id?: string;
                    ip_address?: string | null;
                    user_agent?: string | null;
                };
                Update: {
                    action?: string;
                    agreement_id?: string;
                    created_at?: string;
                    details?: Json | null;
                    id?: string;
                    ip_address?: string | null;
                    user_agent?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agreement_activity_agreement_id_fkey';
                        columns: ['agreement_id'];
                        isOneToOne: false;
                        referencedRelation: 'agreements';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agreement_audit_log: {
                Row: {
                    actor_email: string | null;
                    actor_id: string | null;
                    actor_type: string;
                    agreement_id: string;
                    created_at: string;
                    event_details: Json | null;
                    event_type: string;
                    id: string;
                    ip_address: string | null;
                    user_agent: string | null;
                };
                Insert: {
                    actor_email?: string | null;
                    actor_id?: string | null;
                    actor_type: string;
                    agreement_id: string;
                    created_at?: string;
                    event_details?: Json | null;
                    event_type: string;
                    id?: string;
                    ip_address?: string | null;
                    user_agent?: string | null;
                };
                Update: {
                    actor_email?: string | null;
                    actor_id?: string | null;
                    actor_type?: string;
                    agreement_id?: string;
                    created_at?: string;
                    event_details?: Json | null;
                    event_type?: string;
                    id?: string;
                    ip_address?: string | null;
                    user_agent?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agreement_audit_log_agreement_id_fkey';
                        columns: ['agreement_id'];
                        isOneToOne: false;
                        referencedRelation: 'agreements';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agreement_field_values: {
                Row: {
                    agreement_id: string;
                    captured_at: string;
                    field_id: string;
                    field_value: string;
                    id: string;
                    ip_address: string | null;
                    signer_id: string;
                    user_agent: string | null;
                };
                Insert: {
                    agreement_id: string;
                    captured_at?: string;
                    field_id: string;
                    field_value: string;
                    id?: string;
                    ip_address?: string | null;
                    signer_id: string;
                    user_agent?: string | null;
                };
                Update: {
                    agreement_id?: string;
                    captured_at?: string;
                    field_id?: string;
                    field_value?: string;
                    id?: string;
                    ip_address?: string | null;
                    signer_id?: string;
                    user_agent?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agreement_field_values_agreement_id_fkey';
                        columns: ['agreement_id'];
                        isOneToOne: false;
                        referencedRelation: 'agreements';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'agreement_field_values_field_id_fkey';
                        columns: ['field_id'];
                        isOneToOne: false;
                        referencedRelation: 'template_signing_fields';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'agreement_field_values_signer_id_fkey';
                        columns: ['signer_id'];
                        isOneToOne: false;
                        referencedRelation: 'agreement_signers';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agreement_sections: {
                Row: {
                    agreement_id: string;
                    created_at: string;
                    id: string;
                    initialed_at: string | null;
                    initials: string | null;
                    section_key: string;
                    section_title: string;
                };
                Insert: {
                    agreement_id: string;
                    created_at?: string;
                    id?: string;
                    initialed_at?: string | null;
                    initials?: string | null;
                    section_key: string;
                    section_title: string;
                };
                Update: {
                    agreement_id?: string;
                    created_at?: string;
                    id?: string;
                    initialed_at?: string | null;
                    initials?: string | null;
                    section_key?: string;
                    section_title?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agreement_sections_agreement_id_fkey';
                        columns: ['agreement_id'];
                        isOneToOne: false;
                        referencedRelation: 'agreements';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agreement_signers: {
                Row: {
                    access_token: string;
                    agreement_id: string;
                    created_at: string;
                    decline_reason: string | null;
                    declined_at: string | null;
                    email: string;
                    id: string;
                    invited_at: string | null;
                    name: string;
                    signature_data: string | null;
                    signature_ip: string | null;
                    signature_user_agent: string | null;
                    signed_at: string | null;
                    signer_role: Database['public']['Enums']['signer_role'];
                    signing_order: number;
                    title: string | null;
                    viewed_at: string | null;
                };
                Insert: {
                    access_token?: string;
                    agreement_id: string;
                    created_at?: string;
                    decline_reason?: string | null;
                    declined_at?: string | null;
                    email: string;
                    id?: string;
                    invited_at?: string | null;
                    name: string;
                    signature_data?: string | null;
                    signature_ip?: string | null;
                    signature_user_agent?: string | null;
                    signed_at?: string | null;
                    signer_role: Database['public']['Enums']['signer_role'];
                    signing_order?: number;
                    title?: string | null;
                    viewed_at?: string | null;
                };
                Update: {
                    access_token?: string;
                    agreement_id?: string;
                    created_at?: string;
                    decline_reason?: string | null;
                    declined_at?: string | null;
                    email?: string;
                    id?: string;
                    invited_at?: string | null;
                    name?: string;
                    signature_data?: string | null;
                    signature_ip?: string | null;
                    signature_user_agent?: string | null;
                    signed_at?: string | null;
                    signer_role?: Database['public']['Enums']['signer_role'];
                    signing_order?: number;
                    title?: string | null;
                    viewed_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agreement_signers_agreement_id_fkey';
                        columns: ['agreement_id'];
                        isOneToOne: false;
                        referencedRelation: 'agreements';
                        referencedColumns: ['id'];
                    },
                ];
            };
            agreements: {
                Row: {
                    activated_at: string | null;
                    agreement_type: string | null;
                    archived_at: string | null;
                    archived_reason: string | null;
                    client_company: string | null;
                    client_email: string;
                    client_name: string;
                    content: string;
                    content_hash: string | null;
                    created_at: string;
                    effective_date: string | null;
                    expires_at: string | null;
                    id: string;
                    lifecycle_status: string | null;
                    msa_version_id: string | null;
                    plan_name: string;
                    plan_price: number;
                    signature: string | null;
                    signed_at: string | null;
                    signed_ip: string | null;
                    signer_name: string | null;
                    signer_names: string[] | null;
                    status: Database['public']['Enums']['agreement_status'];
                    superseded_by: string | null;
                    terminated_at: string | null;
                    termination_reason: string | null;
                    title: string;
                    token: string;
                    updated_at: string;
                    version: string | null;
                };
                Insert: {
                    activated_at?: string | null;
                    agreement_type?: string | null;
                    archived_at?: string | null;
                    archived_reason?: string | null;
                    client_company?: string | null;
                    client_email: string;
                    client_name: string;
                    content: string;
                    content_hash?: string | null;
                    created_at?: string;
                    effective_date?: string | null;
                    expires_at?: string | null;
                    id?: string;
                    lifecycle_status?: string | null;
                    msa_version_id?: string | null;
                    plan_name: string;
                    plan_price: number;
                    signature?: string | null;
                    signed_at?: string | null;
                    signed_ip?: string | null;
                    signer_name?: string | null;
                    signer_names?: string[] | null;
                    status?: Database['public']['Enums']['agreement_status'];
                    superseded_by?: string | null;
                    terminated_at?: string | null;
                    termination_reason?: string | null;
                    title: string;
                    token?: string;
                    updated_at?: string;
                    version?: string | null;
                };
                Update: {
                    activated_at?: string | null;
                    agreement_type?: string | null;
                    archived_at?: string | null;
                    archived_reason?: string | null;
                    client_company?: string | null;
                    client_email?: string;
                    client_name?: string;
                    content?: string;
                    content_hash?: string | null;
                    created_at?: string;
                    effective_date?: string | null;
                    expires_at?: string | null;
                    id?: string;
                    lifecycle_status?: string | null;
                    msa_version_id?: string | null;
                    plan_name?: string;
                    plan_price?: number;
                    signature?: string | null;
                    signed_at?: string | null;
                    signed_ip?: string | null;
                    signer_name?: string | null;
                    signer_names?: string[] | null;
                    status?: Database['public']['Enums']['agreement_status'];
                    superseded_by?: string | null;
                    terminated_at?: string | null;
                    termination_reason?: string | null;
                    title?: string;
                    token?: string;
                    updated_at?: string;
                    version?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'agreements_msa_version_id_fkey';
                        columns: ['msa_version_id'];
                        isOneToOne: false;
                        referencedRelation: 'msa_template_versions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'agreements_superseded_by_fkey';
                        columns: ['superseded_by'];
                        isOneToOne: false;
                        referencedRelation: 'agreements';
                        referencedColumns: ['id'];
                    },
                ];
            };
            analytics_rate_limits: {
                Row: {
                    id: string;
                    ip_address: string;
                    request_count: number;
                    window_start: string;
                };
                Insert: {
                    id?: string;
                    ip_address: string;
                    request_count?: number;
                    window_start?: string;
                };
                Update: {
                    id?: string;
                    ip_address?: string;
                    request_count?: number;
                    window_start?: string;
                };
                Relationships: [];
            };
            attribution_events: {
                Row: {
                    block_reason: string | null;
                    blocked: boolean | null;
                    cookie_present: boolean;
                    created_at: string;
                    event_type: string;
                    id: string;
                    ip_address: string | null;
                    landing_page_url: string | null;
                    local_storage_present: boolean;
                    partner_id: string | null;
                    partner_slug: string | null;
                    referrer_url: string | null;
                    user_agent: string | null;
                    utm_campaign: string | null;
                    utm_content: string | null;
                    utm_medium: string | null;
                    utm_source: string | null;
                    utm_term: string | null;
                };
                Insert: {
                    block_reason?: string | null;
                    blocked?: boolean | null;
                    cookie_present?: boolean;
                    created_at?: string;
                    event_type: string;
                    id?: string;
                    ip_address?: string | null;
                    landing_page_url?: string | null;
                    local_storage_present?: boolean;
                    partner_id?: string | null;
                    partner_slug?: string | null;
                    referrer_url?: string | null;
                    user_agent?: string | null;
                    utm_campaign?: string | null;
                    utm_content?: string | null;
                    utm_medium?: string | null;
                    utm_source?: string | null;
                    utm_term?: string | null;
                };
                Update: {
                    block_reason?: string | null;
                    blocked?: boolean | null;
                    cookie_present?: boolean;
                    created_at?: string;
                    event_type?: string;
                    id?: string;
                    ip_address?: string | null;
                    landing_page_url?: string | null;
                    local_storage_present?: boolean;
                    partner_id?: string | null;
                    partner_slug?: string | null;
                    referrer_url?: string | null;
                    user_agent?: string | null;
                    utm_campaign?: string | null;
                    utm_content?: string | null;
                    utm_medium?: string | null;
                    utm_source?: string | null;
                    utm_term?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'attribution_events_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            audit_completions: {
                Row: {
                    answers: Json;
                    completed_at: string | null;
                    contact_email: string | null;
                    contact_name: string | null;
                    contact_submitted_at: string | null;
                    geo_city: string | null;
                    geo_country: string | null;
                    geo_region: string | null;
                    id: string;
                    ip_address: string | null;
                    page_path: string | null;
                    referrer: string | null;
                    result_tier: string;
                    score: number;
                    session_id: string;
                    user_agent: string | null;
                };
                Insert: {
                    answers: Json;
                    completed_at?: string | null;
                    contact_email?: string | null;
                    contact_name?: string | null;
                    contact_submitted_at?: string | null;
                    geo_city?: string | null;
                    geo_country?: string | null;
                    geo_region?: string | null;
                    id?: string;
                    ip_address?: string | null;
                    page_path?: string | null;
                    referrer?: string | null;
                    result_tier: string;
                    score: number;
                    session_id: string;
                    user_agent?: string | null;
                };
                Update: {
                    answers?: Json;
                    completed_at?: string | null;
                    contact_email?: string | null;
                    contact_name?: string | null;
                    contact_submitted_at?: string | null;
                    geo_city?: string | null;
                    geo_country?: string | null;
                    geo_region?: string | null;
                    id?: string;
                    ip_address?: string | null;
                    page_path?: string | null;
                    referrer?: string | null;
                    result_tier?: string;
                    score?: number;
                    session_id?: string;
                    user_agent?: string | null;
                };
                Relationships: [];
            };
            blog_post_tags: {
                Row: {
                    created_at: string;
                    id: string;
                    post_id: string;
                    tag_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    post_id: string;
                    tag_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    post_id?: string;
                    tag_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'blog_post_tags_post_id_fkey';
                        columns: ['post_id'];
                        isOneToOne: false;
                        referencedRelation: 'blog_posts';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'blog_post_tags_tag_id_fkey';
                        columns: ['tag_id'];
                        isOneToOne: false;
                        referencedRelation: 'blog_tags';
                        referencedColumns: ['id'];
                    },
                ];
            };
            blog_posts: {
                Row: {
                    author_name: string;
                    content: string | null;
                    created_at: string;
                    excerpt: string | null;
                    featured_image_url: string | null;
                    id: string;
                    published_at: string | null;
                    read_time: string | null;
                    slug: string;
                    status: string;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    author_name: string;
                    content?: string | null;
                    created_at?: string;
                    excerpt?: string | null;
                    featured_image_url?: string | null;
                    id?: string;
                    published_at?: string | null;
                    read_time?: string | null;
                    slug: string;
                    status?: string;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    author_name?: string;
                    content?: string | null;
                    created_at?: string;
                    excerpt?: string | null;
                    featured_image_url?: string | null;
                    id?: string;
                    published_at?: string | null;
                    read_time?: string | null;
                    slug?: string;
                    status?: string;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            blog_tags: {
                Row: {
                    created_at: string;
                    description: string | null;
                    display_order: number | null;
                    id: string;
                    name: string;
                    slug: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    display_order?: number | null;
                    id?: string;
                    name: string;
                    slug: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    display_order?: number | null;
                    id?: string;
                    name?: string;
                    slug?: string;
                };
                Relationships: [];
            };
            calendar_templates: {
                Row: {
                    background_image_url: string | null;
                    created_at: string;
                    created_by: string | null;
                    cta_text: string | null;
                    headline: string;
                    id: string;
                    is_default: boolean;
                    paragraph: string | null;
                    template_name: string;
                    updated_at: string;
                };
                Insert: {
                    background_image_url?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    cta_text?: string | null;
                    headline?: string;
                    id?: string;
                    is_default?: boolean;
                    paragraph?: string | null;
                    template_name: string;
                    updated_at?: string;
                };
                Update: {
                    background_image_url?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    cta_text?: string | null;
                    headline?: string;
                    id?: string;
                    is_default?: boolean;
                    paragraph?: string | null;
                    template_name?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            calendar_view_preferences: {
                Row: {
                    active_filters: Json | null;
                    active_view_name: string | null;
                    column_order: string[] | null;
                    column_widths: Json | null;
                    created_at: string;
                    default_view_name: string | null;
                    hidden_columns: string[] | null;
                    id: string;
                    rows_per_page: number | null;
                    saved_views: Json | null;
                    sort_column: string | null;
                    sort_direction: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            calendars: {
                Row: {
                    calendar_name: string;
                    calendar_type: Database['public']['Enums']['calendar_type'];
                    created_at: string;
                    created_by: string | null;
                    ghl_calendar_id: string | null;
                    ghl_embed_code: string | null;
                    headline: string | null;
                    id: string;
                    intended_use: string | null;
                    internal_notes: string | null;
                    owner: string | null;
                    paragraph: string | null;
                    participants: string | null;
                    site_location: string | null;
                    slug: string;
                    status: Database['public']['Enums']['calendar_status'];
                    template_id: string | null;
                    updated_at: string;
                };
                Insert: {
                    calendar_name: string;
                    calendar_type?: Database['public']['Enums']['calendar_type'];
                    created_at?: string;
                    created_by?: string | null;
                    ghl_calendar_id?: string | null;
                    ghl_embed_code?: string | null;
                    headline?: string | null;
                    id?: string;
                    intended_use?: string | null;
                    internal_notes?: string | null;
                    owner?: string | null;
                    paragraph?: string | null;
                    participants?: string | null;
                    site_location?: string | null;
                    slug: string;
                    status?: Database['public']['Enums']['calendar_status'];
                    template_id?: string | null;
                    updated_at?: string;
                };
                Update: {
                    calendar_name?: string;
                    calendar_type?: Database['public']['Enums']['calendar_type'];
                    created_at?: string;
                    created_by?: string | null;
                    ghl_calendar_id?: string | null;
                    ghl_embed_code?: string | null;
                    headline?: string | null;
                    id?: string;
                    intended_use?: string | null;
                    internal_notes?: string | null;
                    owner?: string | null;
                    paragraph?: string | null;
                    participants?: string | null;
                    site_location?: string | null;
                    slug?: string;
                    status?: Database['public']['Enums']['calendar_status'];
                    template_id?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'calendars_template_id_fkey';
                        columns: ['template_id'];
                        isOneToOne: false;
                        referencedRelation: 'calendar_templates';
                        referencedColumns: ['id'];
                    },
                ];
            };
            categories: {
                Row: {
                    created_at: string;
                    id: string;
                    name: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    name: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    name?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            chat_rate_limits: {
                Row: {
                    id: string;
                    ip_address: string;
                    request_count: number;
                    window_start: string;
                };
                Insert: {
                    id?: string;
                    ip_address: string;
                    request_count?: number;
                    window_start?: string;
                };
                Update: {
                    id?: string;
                    ip_address?: string;
                    request_count?: number;
                    window_start?: string;
                };
                Relationships: [];
            };
            client_view_preferences: {
                Row: {
                    active_filters: Json | null;
                    active_view_name: string | null;
                    column_order: string[] | null;
                    column_widths: Json | null;
                    created_at: string;
                    default_view_name: string | null;
                    hidden_columns: string[] | null;
                    id: string;
                    rows_per_page: number | null;
                    saved_views: Json | null;
                    sort_column: string | null;
                    sort_direction: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            clients: {
                Row: {
                    company: string | null;
                    company_updated_at: string | null;
                    company_updated_by: string | null;
                    created_at: string;
                    email: string | null;
                    email_updated_at: string | null;
                    email_updated_by: string | null;
                    first_name: string | null;
                    first_successful_payment_at: string | null;
                    ghl_contact_id: string | null;
                    ghl_synced_at: string | null;
                    id: string;
                    last_activity: string | null;
                    last_activity_updated_at: string | null;
                    last_activity_updated_by: string | null;
                    last_contact: string | null;
                    last_contact_updated_at: string | null;
                    last_contact_updated_by: string | null;
                    last_name: string | null;
                    last_payment_date: string | null;
                    name: string;
                    name_updated_at: string | null;
                    name_updated_by: string | null;
                    next_meeting: string | null;
                    next_meeting_updated_at: string | null;
                    next_meeting_updated_by: string | null;
                    next_payment_due_date: string | null;
                    nick_name: string | null;
                    partner_name: string | null;
                    partner_name_updated_at: string | null;
                    partner_name_updated_by: string | null;
                    payment_amount: number | null;
                    payment_type: string | null;
                    phone: string | null;
                    phone_updated_at: string | null;
                    phone_updated_by: string | null;
                    sales_rep: string | null;
                    sales_rep_updated_at: string | null;
                    sales_rep_updated_by: string | null;
                    square_customer_id: string | null;
                    square_plan_name: string | null;
                    square_subscription_id: string | null;
                    square_synced_at: string | null;
                    status: string | null;
                    tags: string[] | null;
                    tags_updated_at: string | null;
                    tags_updated_by: string | null;
                    updated_at: string;
                };
                Insert: {
                    company?: string | null;
                    company_updated_at?: string | null;
                    company_updated_by?: string | null;
                    created_at?: string;
                    email?: string | null;
                    email_updated_at?: string | null;
                    email_updated_by?: string | null;
                    first_name?: string | null;
                    first_successful_payment_at?: string | null;
                    ghl_contact_id?: string | null;
                    ghl_synced_at?: string | null;
                    id?: string;
                    last_activity?: string | null;
                    last_activity_updated_at?: string | null;
                    last_activity_updated_by?: string | null;
                    last_contact?: string | null;
                    last_contact_updated_at?: string | null;
                    last_contact_updated_by?: string | null;
                    last_name?: string | null;
                    last_payment_date?: string | null;
                    name: string;
                    name_updated_at?: string | null;
                    name_updated_by?: string | null;
                    next_meeting?: string | null;
                    next_meeting_updated_at?: string | null;
                    next_meeting_updated_by?: string | null;
                    next_payment_due_date?: string | null;
                    nick_name?: string | null;
                    partner_name?: string | null;
                    partner_name_updated_at?: string | null;
                    partner_name_updated_by?: string | null;
                    payment_amount?: number | null;
                    payment_type?: string | null;
                    phone?: string | null;
                    phone_updated_at?: string | null;
                    phone_updated_by?: string | null;
                    sales_rep?: string | null;
                    sales_rep_updated_at?: string | null;
                    sales_rep_updated_by?: string | null;
                    square_customer_id?: string | null;
                    square_plan_name?: string | null;
                    square_subscription_id?: string | null;
                    square_synced_at?: string | null;
                    status?: string | null;
                    tags?: string[] | null;
                    tags_updated_at?: string | null;
                    tags_updated_by?: string | null;
                    updated_at?: string;
                };
                Update: {
                    company?: string | null;
                    company_updated_at?: string | null;
                    company_updated_by?: string | null;
                    created_at?: string;
                    email?: string | null;
                    email_updated_at?: string | null;
                    email_updated_by?: string | null;
                    first_name?: string | null;
                    first_successful_payment_at?: string | null;
                    ghl_contact_id?: string | null;
                    ghl_synced_at?: string | null;
                    id?: string;
                    last_activity?: string | null;
                    last_activity_updated_at?: string | null;
                    last_activity_updated_by?: string | null;
                    last_contact?: string | null;
                    last_contact_updated_at?: string | null;
                    last_contact_updated_by?: string | null;
                    last_name?: string | null;
                    last_payment_date?: string | null;
                    name?: string;
                    name_updated_at?: string | null;
                    name_updated_by?: string | null;
                    next_meeting?: string | null;
                    next_meeting_updated_at?: string | null;
                    next_meeting_updated_by?: string | null;
                    next_payment_due_date?: string | null;
                    nick_name?: string | null;
                    partner_name?: string | null;
                    partner_name_updated_at?: string | null;
                    partner_name_updated_by?: string | null;
                    payment_amount?: number | null;
                    payment_type?: string | null;
                    phone?: string | null;
                    phone_updated_at?: string | null;
                    phone_updated_by?: string | null;
                    sales_rep?: string | null;
                    sales_rep_updated_at?: string | null;
                    sales_rep_updated_by?: string | null;
                    square_customer_id?: string | null;
                    square_plan_name?: string | null;
                    square_subscription_id?: string | null;
                    square_synced_at?: string | null;
                    status?: string | null;
                    tags?: string[] | null;
                    tags_updated_at?: string | null;
                    tags_updated_by?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            companies: {
                Row: {
                    created_at: string;
                    id: string;
                    name: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    name: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    name?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            customer_subscriptions: {
                Row: {
                    auto_renew: boolean;
                    created_at: string;
                    customer_id: string;
                    end_date: string | null;
                    id: string;
                    payment_id: string | null;
                    product_id: string;
                    start_date: string;
                    status: string;
                    tenant_id: string | null;
                    tier: string;
                    updated_at: string;
                };
                Insert: {
                    auto_renew?: boolean;
                    created_at?: string;
                    customer_id: string;
                    end_date?: string | null;
                    id?: string;
                    payment_id?: string | null;
                    product_id: string;
                    start_date?: string;
                    status?: string;
                    tenant_id?: string | null;
                    tier?: string;
                    updated_at?: string;
                };
                Update: {
                    auto_renew?: boolean;
                    created_at?: string;
                    customer_id?: string;
                    end_date?: string | null;
                    id?: string;
                    payment_id?: string | null;
                    product_id?: string;
                    start_date?: string;
                    status?: string;
                    tenant_id?: string | null;
                    tier?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'customer_subscriptions_customer_id_fkey';
                        columns: ['customer_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'customer_subscriptions_payment_id_fkey';
                        columns: ['payment_id'];
                        isOneToOne: false;
                        referencedRelation: 'payments';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'customer_subscriptions_product_id_fkey';
                        columns: ['product_id'];
                        isOneToOne: false;
                        referencedRelation: 'products';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'customer_subscriptions_tenant_id_fkey';
                        columns: ['tenant_id'];
                        isOneToOne: false;
                        referencedRelation: 'portal_tenants';
                        referencedColumns: ['id'];
                    },
                ];
            };
            disputes: {
                Row: {
                    commission_id: string;
                    created_at: string;
                    details: string | null;
                    id: string;
                    partner_id: string;
                    prior_commission_status: string | null;
                    reason: string;
                    resolution_notes: string | null;
                    resolved_at: string | null;
                    resolved_by_admin_id: string | null;
                    status: string;
                    ticket_id: string | null;
                };
                Insert: {
                    commission_id: string;
                    created_at?: string;
                    details?: string | null;
                    id?: string;
                    partner_id: string;
                    prior_commission_status?: string | null;
                    reason: string;
                    resolution_notes?: string | null;
                    resolved_at?: string | null;
                    resolved_by_admin_id?: string | null;
                    status?: string;
                    ticket_id?: string | null;
                };
                Update: {
                    commission_id?: string;
                    created_at?: string;
                    details?: string | null;
                    id?: string;
                    partner_id?: string;
                    prior_commission_status?: string | null;
                    reason?: string;
                    resolution_notes?: string | null;
                    resolved_at?: string | null;
                    resolved_by_admin_id?: string | null;
                    status?: string;
                    ticket_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'disputes_commission_id_fkey';
                        columns: ['commission_id'];
                        isOneToOne: true;
                        referencedRelation: 'partner_commissions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'disputes_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'disputes_ticket_fkey';
                        columns: ['ticket_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_tickets';
                        referencedColumns: ['id'];
                    },
                ];
            };
            document_template_sections: {
                Row: {
                    created_at: string;
                    display_order: number;
                    id: string;
                    requires_initials: boolean;
                    section_key: string;
                    section_number: number;
                    section_summary: string | null;
                    section_title: string;
                    template_id: string;
                };
                Insert: {
                    created_at?: string;
                    display_order?: number;
                    id?: string;
                    requires_initials?: boolean;
                    section_key: string;
                    section_number: number;
                    section_summary?: string | null;
                    section_title: string;
                    template_id: string;
                };
                Update: {
                    created_at?: string;
                    display_order?: number;
                    id?: string;
                    requires_initials?: boolean;
                    section_key?: string;
                    section_number?: number;
                    section_summary?: string | null;
                    section_title?: string;
                    template_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'document_template_sections_template_id_fkey';
                        columns: ['template_id'];
                        isOneToOne: false;
                        referencedRelation: 'document_templates';
                        referencedColumns: ['id'];
                    },
                ];
            };
            document_templates: {
                Row: {
                    content: string;
                    created_at: string;
                    created_by: string | null;
                    document_type: string;
                    id: string;
                    is_active: boolean;
                    signing_fields: Json | null;
                    title: string;
                    updated_at: string;
                    version: number;
                };
                Insert: {
                    content: string;
                    created_at?: string;
                    created_by?: string | null;
                    document_type: string;
                    id?: string;
                    is_active?: boolean;
                    signing_fields?: Json | null;
                    title: string;
                    updated_at?: string;
                    version?: number;
                };
                Update: {
                    content?: string;
                    created_at?: string;
                    created_by?: string | null;
                    document_type?: string;
                    id?: string;
                    is_active?: boolean;
                    signing_fields?: Json | null;
                    title?: string;
                    updated_at?: string;
                    version?: number;
                };
                Relationships: [];
            };
            launch_checks: {
                Row: {
                    check_category: string;
                    check_name: string;
                    details: string | null;
                    id: string;
                    ran_at: string;
                    ran_by_admin_id: string | null;
                    status: string;
                };
                Insert: {
                    check_category: string;
                    check_name: string;
                    details?: string | null;
                    id?: string;
                    ran_at?: string;
                    ran_by_admin_id?: string | null;
                    status?: string;
                };
                Update: {
                    check_category?: string;
                    check_name?: string;
                    details?: string | null;
                    id?: string;
                    ran_at?: string;
                    ran_by_admin_id?: string | null;
                    status?: string;
                };
                Relationships: [];
            };
            login_history: {
                Row: {
                    created_at: string;
                    id: string;
                    ip_address: string | null;
                    user_agent: string | null;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            msa_template_versions: {
                Row: {
                    change_summary: string | null;
                    changelog: string | null;
                    content: string;
                    content_hash: string;
                    created_at: string;
                    created_by: string | null;
                    effective_date: string | null;
                    execution_count: number | null;
                    id: string;
                    notification_sent: boolean | null;
                    notification_sent_at: string | null;
                    published_at: string | null;
                    published_by: string | null;
                    status: string;
                    supersedes_version_id: string | null;
                    template_id: string;
                    title: string;
                    version_number: number;
                };
                Insert: {
                    change_summary?: string | null;
                    changelog?: string | null;
                    content: string;
                    content_hash: string;
                    created_at?: string;
                    created_by?: string | null;
                    effective_date?: string | null;
                    execution_count?: number | null;
                    id?: string;
                    notification_sent?: boolean | null;
                    notification_sent_at?: string | null;
                    published_at?: string | null;
                    published_by?: string | null;
                    status?: string;
                    supersedes_version_id?: string | null;
                    template_id: string;
                    title: string;
                    version_number: number;
                };
                Update: {
                    change_summary?: string | null;
                    changelog?: string | null;
                    content?: string;
                    content_hash?: string;
                    created_at?: string;
                    created_by?: string | null;
                    effective_date?: string | null;
                    execution_count?: number | null;
                    id?: string;
                    notification_sent?: boolean | null;
                    notification_sent_at?: string | null;
                    published_at?: string | null;
                    published_by?: string | null;
                    status?: string;
                    supersedes_version_id?: string | null;
                    template_id?: string;
                    title?: string;
                    version_number?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'msa_template_versions_supersedes_version_id_fkey';
                        columns: ['supersedes_version_id'];
                        isOneToOne: false;
                        referencedRelation: 'msa_template_versions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'msa_template_versions_template_id_fkey';
                        columns: ['template_id'];
                        isOneToOne: false;
                        referencedRelation: 'document_templates';
                        referencedColumns: ['id'];
                    },
                ];
            };
            notification_email_templates: {
                Row: {
                    body: string;
                    created_at: string;
                    document_type: string;
                    id: string;
                    subject: string;
                    updated_at: string;
                    updated_by: string | null;
                };
                Insert: {
                    body: string;
                    created_at?: string;
                    document_type: string;
                    id?: string;
                    subject: string;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Update: {
                    body?: string;
                    created_at?: string;
                    document_type?: string;
                    id?: string;
                    subject?: string;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Relationships: [];
            };
            notifications: {
                Row: {
                    category: string;
                    created_at: string;
                    details: string | null;
                    id: string;
                    resolution_notes: string | null;
                    resolved_at: string | null;
                    resolved_by: string | null;
                    resource_id: string | null;
                    resource_type: string | null;
                    severity: string;
                    title: string;
                };
                Insert: {
                    category: string;
                    created_at?: string;
                    details?: string | null;
                    id?: string;
                    resolution_notes?: string | null;
                    resolved_at?: string | null;
                    resolved_by?: string | null;
                    resource_id?: string | null;
                    resource_type?: string | null;
                    severity?: string;
                    title: string;
                };
                Update: {
                    category?: string;
                    created_at?: string;
                    details?: string | null;
                    id?: string;
                    resolution_notes?: string | null;
                    resolved_at?: string | null;
                    resolved_by?: string | null;
                    resource_id?: string | null;
                    resource_type?: string | null;
                    severity?: string;
                    title?: string;
                };
                Relationships: [];
            };
            page_views: {
                Row: {
                    created_at: string;
                    id: string;
                    page_path: string;
                    page_title: string | null;
                    session_id: string;
                    time_on_page: number | null;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    page_path: string;
                    page_title?: string | null;
                    session_id: string;
                    time_on_page?: number | null;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    page_path?: string;
                    page_title?: string | null;
                    session_id?: string;
                    time_on_page?: number | null;
                };
                Relationships: [];
            };
            partner_assets: {
                Row: {
                    auto_append_partner_url: boolean;
                    category: Database['public']['Enums']['asset_category'];
                    content: string | null;
                    created_at: string;
                    description: string | null;
                    display_order: number;
                    file_type: string | null;
                    file_url: string | null;
                    id: string;
                    is_active: boolean;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    auto_append_partner_url?: boolean;
                    category: Database['public']['Enums']['asset_category'];
                    content?: string | null;
                    created_at?: string;
                    description?: string | null;
                    display_order?: number;
                    file_type?: string | null;
                    file_url?: string | null;
                    id?: string;
                    is_active?: boolean;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    auto_append_partner_url?: boolean;
                    category?: Database['public']['Enums']['asset_category'];
                    content?: string | null;
                    created_at?: string;
                    description?: string | null;
                    display_order?: number;
                    file_type?: string | null;
                    file_url?: string | null;
                    id?: string;
                    is_active?: boolean;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            partner_audit_logs: {
                Row: {
                    action: string;
                    created_at: string;
                    id: string;
                    ip_address: string | null;
                    new_value: Json | null;
                    old_value: Json | null;
                    partner_id: string;
                    resource_id: string | null;
                    resource_type: string;
                    user_agent: string | null;
                    user_id: string | null;
                };
                Insert: {
                    action: string;
                    created_at?: string;
                    id?: string;
                    ip_address?: string | null;
                    new_value?: Json | null;
                    old_value?: Json | null;
                    partner_id: string;
                    resource_id?: string | null;
                    resource_type: string;
                    user_agent?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    action?: string;
                    created_at?: string;
                    id?: string;
                    ip_address?: string | null;
                    new_value?: Json | null;
                    old_value?: Json | null;
                    partner_id?: string;
                    resource_id?: string | null;
                    resource_type?: string;
                    user_agent?: string | null;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_audit_logs_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_commissions: {
                Row: {
                    clawback_eligible_until: string | null;
                    commission_rate: number;
                    created_at: string;
                    customer_id: string | null;
                    deal_id: string | null;
                    earned_at: string | null;
                    gross_amount: number;
                    id: string;
                    net_amount: number;
                    notes: string | null;
                    paid_at: string | null;
                    partner_id: string;
                    payable_at: string | null;
                    payment_id: string | null;
                    payout_id: string | null;
                    product_name: string | null;
                    status: Database['public']['Enums']['commission_status'];
                    updated_at: string;
                };
                Insert: {
                    clawback_eligible_until?: string | null;
                    commission_rate?: number;
                    created_at?: string;
                    customer_id?: string | null;
                    deal_id?: string | null;
                    earned_at?: string | null;
                    gross_amount: number;
                    id?: string;
                    net_amount: number;
                    notes?: string | null;
                    paid_at?: string | null;
                    partner_id: string;
                    payable_at?: string | null;
                    payment_id?: string | null;
                    payout_id?: string | null;
                    product_name?: string | null;
                    status?: Database['public']['Enums']['commission_status'];
                    updated_at?: string;
                };
                Update: {
                    clawback_eligible_until?: string | null;
                    commission_rate?: number;
                    created_at?: string;
                    customer_id?: string | null;
                    deal_id?: string | null;
                    earned_at?: string | null;
                    gross_amount?: number;
                    id?: string;
                    net_amount?: number;
                    notes?: string | null;
                    paid_at?: string | null;
                    partner_id?: string;
                    payable_at?: string | null;
                    payment_id?: string | null;
                    payout_id?: string | null;
                    product_name?: string | null;
                    status?: Database['public']['Enums']['commission_status'];
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'fk_commissions_payout';
                        columns: ['payout_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_payouts';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_commissions_customer_id_fkey';
                        columns: ['customer_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_commissions_deal_id_fkey';
                        columns: ['deal_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_deals';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_commissions_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_commissions_payment_id_fkey';
                        columns: ['payment_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_payments';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_deals: {
                Row: {
                    client_company: string | null;
                    client_email: string | null;
                    client_id: string | null;
                    client_name: string;
                    client_phone: string | null;
                    closed_at: string | null;
                    created_at: string;
                    deal_value: number;
                    expected_close_date: string | null;
                    id: string;
                    notes: string | null;
                    partner_id: string;
                    referral_id: string | null;
                    stage: Database['public']['Enums']['deal_stage'];
                    timeline: Json | null;
                    updated_at: string;
                };
                Insert: {
                    client_company?: string | null;
                    client_email?: string | null;
                    client_id?: string | null;
                    client_name: string;
                    client_phone?: string | null;
                    closed_at?: string | null;
                    created_at?: string;
                    deal_value?: number;
                    expected_close_date?: string | null;
                    id?: string;
                    notes?: string | null;
                    partner_id: string;
                    referral_id?: string | null;
                    stage?: Database['public']['Enums']['deal_stage'];
                    timeline?: Json | null;
                    updated_at?: string;
                };
                Update: {
                    client_company?: string | null;
                    client_email?: string | null;
                    client_id?: string | null;
                    client_name?: string;
                    client_phone?: string | null;
                    closed_at?: string | null;
                    created_at?: string;
                    deal_value?: number;
                    expected_close_date?: string | null;
                    id?: string;
                    notes?: string | null;
                    partner_id?: string;
                    referral_id?: string | null;
                    stage?: Database['public']['Enums']['deal_stage'];
                    timeline?: Json | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_deals_client_id_fkey';
                        columns: ['client_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_deals_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_deals_referral_id_fkey';
                        columns: ['referral_id'];
                        isOneToOne: false;
                        referencedRelation: 'referrals';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_payments: {
                Row: {
                    amount: number;
                    captured_at: string | null;
                    client_id: string | null;
                    created_at: string;
                    currency: string;
                    deal_id: string | null;
                    id: string;
                    partner_id: string;
                    refunded_at: string | null;
                    square_payment_id: string | null;
                    status: Database['public']['Enums']['payment_status'];
                    updated_at: string;
                };
                Insert: {
                    amount: number;
                    captured_at?: string | null;
                    client_id?: string | null;
                    created_at?: string;
                    currency?: string;
                    deal_id?: string | null;
                    id?: string;
                    partner_id: string;
                    refunded_at?: string | null;
                    square_payment_id?: string | null;
                    status?: Database['public']['Enums']['payment_status'];
                    updated_at?: string;
                };
                Update: {
                    amount?: number;
                    captured_at?: string | null;
                    client_id?: string | null;
                    created_at?: string;
                    currency?: string;
                    deal_id?: string | null;
                    id?: string;
                    partner_id?: string;
                    refunded_at?: string | null;
                    square_payment_id?: string | null;
                    status?: Database['public']['Enums']['payment_status'];
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_payments_client_id_fkey';
                        columns: ['client_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_payments_deal_id_fkey';
                        columns: ['deal_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_deals';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_payments_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_payout_methods: {
                Row: {
                    bank_name: string | null;
                    created_at: string;
                    id: string;
                    is_default: boolean;
                    is_verified: boolean;
                    last_four_digits: string | null;
                    method_type: Database['public']['Enums']['payout_method_type'];
                    partner_id: string;
                    token_reference: string | null;
                    updated_at: string;
                };
                Insert: {
                    bank_name?: string | null;
                    created_at?: string;
                    id?: string;
                    is_default?: boolean;
                    is_verified?: boolean;
                    last_four_digits?: string | null;
                    method_type?: Database['public']['Enums']['payout_method_type'];
                    partner_id: string;
                    token_reference?: string | null;
                    updated_at?: string;
                };
                Update: {
                    bank_name?: string | null;
                    created_at?: string;
                    id?: string;
                    is_default?: boolean;
                    is_verified?: boolean;
                    last_four_digits?: string | null;
                    method_type?: Database['public']['Enums']['payout_method_type'];
                    partner_id?: string;
                    token_reference?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_payout_methods_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_payouts: {
                Row: {
                    batch_date: string;
                    commission_count: number;
                    created_at: string;
                    id: string;
                    notes: string | null;
                    paid_at: string | null;
                    partner_id: string;
                    payout_method_id: string | null;
                    reference_id: string | null;
                    status: Database['public']['Enums']['payout_status'];
                    total_amount: number;
                    updated_at: string;
                };
                Insert: {
                    batch_date: string;
                    commission_count?: number;
                    created_at?: string;
                    id?: string;
                    notes?: string | null;
                    paid_at?: string | null;
                    partner_id: string;
                    payout_method_id?: string | null;
                    reference_id?: string | null;
                    status?: Database['public']['Enums']['payout_status'];
                    total_amount: number;
                    updated_at?: string;
                };
                Update: {
                    batch_date?: string;
                    commission_count?: number;
                    created_at?: string;
                    id?: string;
                    notes?: string | null;
                    paid_at?: string | null;
                    partner_id?: string;
                    payout_method_id?: string | null;
                    reference_id?: string | null;
                    status?: Database['public']['Enums']['payout_status'];
                    total_amount?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_payouts_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_payouts_payout_method_id_fkey';
                        columns: ['payout_method_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_payout_methods';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_scheduled_reports: {
                Row: {
                    created_at: string;
                    day_of_month: number | null;
                    day_of_week: number | null;
                    detail_level: string | null;
                    email_to: string | null;
                    format_csv: boolean | null;
                    format_pdf: boolean | null;
                    id: string;
                    include_statuses: string[] | null;
                    is_active: boolean;
                    last_run_at: string | null;
                    next_run_at: string;
                    partner_id: string;
                    report_type: string | null;
                    schedule_type: string;
                    timezone: string | null;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    day_of_month?: number | null;
                    day_of_week?: number | null;
                    detail_level?: string | null;
                    email_to?: string | null;
                    format_csv?: boolean | null;
                    format_pdf?: boolean | null;
                    id?: string;
                    include_statuses?: string[] | null;
                    is_active?: boolean;
                    last_run_at?: string | null;
                    next_run_at: string;
                    partner_id: string;
                    report_type?: string | null;
                    schedule_type: string;
                    timezone?: string | null;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    day_of_month?: number | null;
                    day_of_week?: number | null;
                    detail_level?: string | null;
                    email_to?: string | null;
                    format_csv?: boolean | null;
                    format_pdf?: boolean | null;
                    id?: string;
                    include_statuses?: string[] | null;
                    is_active?: boolean;
                    last_run_at?: string | null;
                    next_run_at?: string;
                    partner_id?: string;
                    report_type?: string | null;
                    schedule_type?: string;
                    timezone?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_scheduled_reports_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_settings: {
                Row: {
                    created_at: string;
                    global_discount_percent: number;
                    id: string;
                    updated_at: string;
                    updated_by: string | null;
                };
                Insert: {
                    created_at?: string;
                    global_discount_percent?: number;
                    id?: string;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Update: {
                    created_at?: string;
                    global_discount_percent?: number;
                    id?: string;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Relationships: [];
            };
            partner_ticket_messages: {
                Row: {
                    created_at: string;
                    id: string;
                    message: string;
                    sender_id: string | null;
                    sender_type: Database['public']['Enums']['ticket_sender_type'];
                    ticket_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    message: string;
                    sender_id?: string | null;
                    sender_type: Database['public']['Enums']['ticket_sender_type'];
                    ticket_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    message?: string;
                    sender_id?: string | null;
                    sender_type?: Database['public']['Enums']['ticket_sender_type'];
                    ticket_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_ticket_messages_ticket_id_fkey';
                        columns: ['ticket_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_tickets';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_tickets: {
                Row: {
                    assigned_to: string | null;
                    attachments: Json | null;
                    category: string | null;
                    commission_id: string | null;
                    created_at: string;
                    created_by: string | null;
                    deal_id: string | null;
                    description: string | null;
                    id: string;
                    partner_id: string;
                    priority: Database['public']['Enums']['ticket_priority'];
                    resolved_at: string | null;
                    status: Database['public']['Enums']['ticket_status'];
                    subject: string;
                    updated_at: string;
                };
                Insert: {
                    assigned_to?: string | null;
                    attachments?: Json | null;
                    category?: string | null;
                    commission_id?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    deal_id?: string | null;
                    description?: string | null;
                    id?: string;
                    partner_id: string;
                    priority?: Database['public']['Enums']['ticket_priority'];
                    resolved_at?: string | null;
                    status?: Database['public']['Enums']['ticket_status'];
                    subject: string;
                    updated_at?: string;
                };
                Update: {
                    assigned_to?: string | null;
                    attachments?: Json | null;
                    category?: string | null;
                    commission_id?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    deal_id?: string | null;
                    description?: string | null;
                    id?: string;
                    partner_id?: string;
                    priority?: Database['public']['Enums']['ticket_priority'];
                    resolved_at?: string | null;
                    status?: Database['public']['Enums']['ticket_status'];
                    subject?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_tickets_commission_id_fkey';
                        columns: ['commission_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_commissions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_tickets_deal_id_fkey';
                        columns: ['deal_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_deals';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'partner_tickets_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_users: {
                Row: {
                    created_at: string;
                    id: string;
                    partner_id: string;
                    role: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    partner_id: string;
                    role?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    partner_id?: string;
                    role?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partner_users_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            partner_view_preferences: {
                Row: {
                    active_filters: Json | null;
                    active_view_name: string | null;
                    column_order: string[] | null;
                    column_widths: Json | null;
                    created_at: string;
                    default_view_name: string | null;
                    hidden_columns: string[] | null;
                    id: string;
                    rows_per_page: number | null;
                    saved_views: Json | null;
                    sort_column: string | null;
                    sort_direction: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            partners: {
                Row: {
                    access_level: string | null;
                    address_line1: string | null;
                    address_line2: string | null;
                    agreement_sent: boolean;
                    agreement_sent_date: string | null;
                    agreement_signed: boolean;
                    agreement_signed_date: string | null;
                    agreement_version: string | null;
                    city: string | null;
                    closed_won_deals: number;
                    commission_rate: number;
                    company_name: string | null;
                    country: string | null;
                    created_at: string;
                    created_by: string | null;
                    email: string;
                    email_verified: boolean | null;
                    first_name: string;
                    fraud_notes: string | null;
                    has_fraud_flag: boolean;
                    id: string;
                    internal_owner_id: string | null;
                    last_activity_date: string | null;
                    last_commission_payout_date: string | null;
                    last_login_date: string | null;
                    last_name: string;
                    last_referral_date: string | null;
                    linked_user_id: string | null;
                    mfa_enabled: boolean | null;
                    next_follow_up_date: string | null;
                    outstanding_commission_balance: number;
                    partner_notes: string | null;
                    partner_start_date: string | null;
                    partner_status: string;
                    partner_type: string;
                    payout_account_type: string | null;
                    payout_bank_name: string | null;
                    payout_change_active_after: string | null;
                    payout_change_confirmation_token: string | null;
                    payout_change_confirmed: boolean | null;
                    payout_email_confirmed: boolean | null;
                    payout_last4: string | null;
                    payout_method_verified: boolean;
                    payout_provider: string | null;
                    payout_rejection_reason: string | null;
                    payout_status: string | null;
                    payout_token: string | null;
                    payout_token_reference: string | null;
                    payout_verified_at: string | null;
                    pending_payout_last4: string | null;
                    pending_payout_provider: string | null;
                    pending_payout_requested_at: string | null;
                    pending_payout_token: string | null;
                    phone: string | null;
                    portal_access_enabled: boolean;
                    postal_code: string | null;
                    profile_complete: boolean;
                    qualified_referrals: number;
                    referrals_given: number;
                    report_schedule: Json | null;
                    revenue_generated: number;
                    risk_level: string | null;
                    risk_score: number | null;
                    slug: string | null;
                    state: string | null;
                    tax_rejection_reason: string | null;
                    tax_status: string | null;
                    total_commissions_earned: number;
                    updated_at: string;
                    w9_file_url: string | null;
                    w9_status: string;
                    website: string | null;
                };
                Insert: {
                    access_level?: string | null;
                    address_line1?: string | null;
                    address_line2?: string | null;
                    agreement_sent?: boolean;
                    agreement_sent_date?: string | null;
                    agreement_signed?: boolean;
                    agreement_signed_date?: string | null;
                    agreement_version?: string | null;
                    city?: string | null;
                    closed_won_deals?: number;
                    commission_rate?: number;
                    company_name?: string | null;
                    country?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    email: string;
                    email_verified?: boolean | null;
                    first_name: string;
                    fraud_notes?: string | null;
                    has_fraud_flag?: boolean;
                    id?: string;
                    internal_owner_id?: string | null;
                    last_activity_date?: string | null;
                    last_commission_payout_date?: string | null;
                    last_login_date?: string | null;
                    last_name: string;
                    last_referral_date?: string | null;
                    linked_user_id?: string | null;
                    mfa_enabled?: boolean | null;
                    next_follow_up_date?: string | null;
                    outstanding_commission_balance?: number;
                    partner_notes?: string | null;
                    partner_start_date?: string | null;
                    partner_status?: string;
                    partner_type?: string;
                    payout_account_type?: string | null;
                    payout_bank_name?: string | null;
                    payout_change_active_after?: string | null;
                    payout_change_confirmation_token?: string | null;
                    payout_change_confirmed?: boolean | null;
                    payout_email_confirmed?: boolean | null;
                    payout_last4?: string | null;
                    payout_method_verified?: boolean;
                    payout_provider?: string | null;
                    payout_rejection_reason?: string | null;
                    payout_status?: string | null;
                    payout_token?: string | null;
                    payout_token_reference?: string | null;
                    payout_verified_at?: string | null;
                    pending_payout_last4?: string | null;
                    pending_payout_provider?: string | null;
                    pending_payout_requested_at?: string | null;
                    pending_payout_token?: string | null;
                    phone?: string | null;
                    portal_access_enabled?: boolean;
                    postal_code?: string | null;
                    profile_complete?: boolean;
                    qualified_referrals?: number;
                    referrals_given?: number;
                    report_schedule?: Json | null;
                    revenue_generated?: number;
                    risk_level?: string | null;
                    risk_score?: number | null;
                    slug?: string | null;
                    state?: string | null;
                    tax_rejection_reason?: string | null;
                    tax_status?: string | null;
                    total_commissions_earned?: number;
                    updated_at?: string;
                    w9_file_url?: string | null;
                    w9_status?: string;
                    website?: string | null;
                };
                Update: {
                    access_level?: string | null;
                    address_line1?: string | null;
                    address_line2?: string | null;
                    agreement_sent?: boolean;
                    agreement_sent_date?: string | null;
                    agreement_signed?: boolean;
                    agreement_signed_date?: string | null;
                    agreement_version?: string | null;
                    city?: string | null;
                    closed_won_deals?: number;
                    commission_rate?: number;
                    company_name?: string | null;
                    country?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    email?: string;
                    email_verified?: boolean | null;
                    first_name?: string;
                    fraud_notes?: string | null;
                    has_fraud_flag?: boolean;
                    id?: string;
                    internal_owner_id?: string | null;
                    last_activity_date?: string | null;
                    last_commission_payout_date?: string | null;
                    last_login_date?: string | null;
                    last_name?: string;
                    last_referral_date?: string | null;
                    linked_user_id?: string | null;
                    mfa_enabled?: boolean | null;
                    next_follow_up_date?: string | null;
                    outstanding_commission_balance?: number;
                    partner_notes?: string | null;
                    partner_start_date?: string | null;
                    partner_status?: string;
                    partner_type?: string;
                    payout_account_type?: string | null;
                    payout_bank_name?: string | null;
                    payout_change_active_after?: string | null;
                    payout_change_confirmation_token?: string | null;
                    payout_change_confirmed?: boolean | null;
                    payout_email_confirmed?: boolean | null;
                    payout_last4?: string | null;
                    payout_method_verified?: boolean;
                    payout_provider?: string | null;
                    payout_rejection_reason?: string | null;
                    payout_status?: string | null;
                    payout_token?: string | null;
                    payout_token_reference?: string | null;
                    payout_verified_at?: string | null;
                    pending_payout_last4?: string | null;
                    pending_payout_provider?: string | null;
                    pending_payout_requested_at?: string | null;
                    pending_payout_token?: string | null;
                    phone?: string | null;
                    portal_access_enabled?: boolean;
                    postal_code?: string | null;
                    profile_complete?: boolean;
                    qualified_referrals?: number;
                    referrals_given?: number;
                    report_schedule?: Json | null;
                    revenue_generated?: number;
                    risk_level?: string | null;
                    risk_score?: number | null;
                    slug?: string | null;
                    state?: string | null;
                    tax_rejection_reason?: string | null;
                    tax_status?: string | null;
                    total_commissions_earned?: number;
                    updated_at?: string;
                    w9_file_url?: string | null;
                    w9_status?: string;
                    website?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'partners_internal_owner_id_fkey';
                        columns: ['internal_owner_id'];
                        isOneToOne: false;
                        referencedRelation: 'profiles';
                        referencedColumns: ['id'];
                    },
                ];
            };
            payment_settings: {
                Row: {
                    credit_card_fee_rate: number;
                    id: string;
                    payment_mode: string;
                    test_mode: boolean;
                    updated_at: string;
                    updated_by: string | null;
                };
                Insert: {
                    credit_card_fee_rate?: number;
                    id?: string;
                    payment_mode?: string;
                    test_mode?: boolean;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Update: {
                    credit_card_fee_rate?: number;
                    id?: string;
                    payment_mode?: string;
                    test_mode?: boolean;
                    updated_at?: string;
                    updated_by?: string | null;
                };
                Relationships: [];
            };
            payments: {
                Row: {
                    amount: number;
                    captured_at: string | null;
                    client_id: string | null;
                    created_at: string | null;
                    currency: string;
                    deal_id: string | null;
                    id: string;
                    is_first_successful: boolean | null;
                    partner_id: string | null;
                    provider: string;
                    raw_json: Json;
                    reference_id: string | null;
                    refund_amount: number | null;
                    refunded_at: string | null;
                    square_customer_id: string | null;
                    square_order_id: string | null;
                    square_payment_id: string;
                    status: string;
                    updated_at: string | null;
                };
                Insert: {
                    amount: number;
                    captured_at?: string | null;
                    client_id?: string | null;
                    created_at?: string | null;
                    currency?: string;
                    deal_id?: string | null;
                    id?: string;
                    is_first_successful?: boolean | null;
                    partner_id?: string | null;
                    provider?: string;
                    raw_json: Json;
                    reference_id?: string | null;
                    refund_amount?: number | null;
                    refunded_at?: string | null;
                    square_customer_id?: string | null;
                    square_order_id?: string | null;
                    square_payment_id: string;
                    status?: string;
                    updated_at?: string | null;
                };
                Update: {
                    amount?: number;
                    captured_at?: string | null;
                    client_id?: string | null;
                    created_at?: string | null;
                    currency?: string;
                    deal_id?: string | null;
                    id?: string;
                    is_first_successful?: boolean | null;
                    partner_id?: string | null;
                    provider?: string;
                    raw_json?: Json;
                    reference_id?: string | null;
                    refund_amount?: number | null;
                    refunded_at?: string | null;
                    square_customer_id?: string | null;
                    square_order_id?: string | null;
                    square_payment_id?: string;
                    status?: string;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'payments_client_id_fkey';
                        columns: ['client_id'];
                        isOneToOne: false;
                        referencedRelation: 'clients';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'payments_deal_id_fkey';
                        columns: ['deal_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_deals';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'payments_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            permissions: {
                Row: {
                    created_at: string;
                    description: string | null;
                    id: string;
                    key: string;
                    label: string;
                    module: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    key: string;
                    label: string;
                    module: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    key?: string;
                    label?: string;
                    module?: string;
                };
                Relationships: [];
            };
            plan_interactions: {
                Row: {
                    created_at: string;
                    id: string;
                    interaction_type: string;
                    page_path: string | null;
                    plan_id: string | null;
                    plan_name: string;
                    session_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    interaction_type?: string;
                    page_path?: string | null;
                    plan_id?: string | null;
                    plan_name: string;
                    session_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    interaction_type?: string;
                    page_path?: string | null;
                    plan_id?: string | null;
                    plan_name?: string;
                    session_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'plan_interactions_plan_id_fkey';
                        columns: ['plan_id'];
                        isOneToOne: false;
                        referencedRelation: 'plans';
                        referencedColumns: ['id'];
                    },
                ];
            };
            plans: {
                Row: {
                    billing_period: string | null;
                    category_id: string | null;
                    created_at: string;
                    cta_text: string | null;
                    description: string | null;
                    display_order: number | null;
                    features: Json | null;
                    hours: string | null;
                    id: string;
                    image_url: string | null;
                    is_popular: boolean | null;
                    name: string;
                    price: number;
                    sku: string | null;
                    slug: string;
                    status: Database['public']['Enums']['plan_status'];
                    tagline: string | null;
                    type: string | null;
                    updated_at: string;
                    url: string | null;
                };
                Insert: {
                    billing_period?: string | null;
                    category_id?: string | null;
                    created_at?: string;
                    cta_text?: string | null;
                    description?: string | null;
                    display_order?: number | null;
                    features?: Json | null;
                    hours?: string | null;
                    id?: string;
                    image_url?: string | null;
                    is_popular?: boolean | null;
                    name: string;
                    price?: number;
                    sku?: string | null;
                    slug: string;
                    status?: Database['public']['Enums']['plan_status'];
                    tagline?: string | null;
                    type?: string | null;
                    updated_at?: string;
                    url?: string | null;
                };
                Update: {
                    billing_period?: string | null;
                    category_id?: string | null;
                    created_at?: string;
                    cta_text?: string | null;
                    description?: string | null;
                    display_order?: number | null;
                    features?: Json | null;
                    hours?: string | null;
                    id?: string;
                    image_url?: string | null;
                    is_popular?: boolean | null;
                    name?: string;
                    price?: number;
                    sku?: string | null;
                    slug?: string;
                    status?: Database['public']['Enums']['plan_status'];
                    tagline?: string | null;
                    type?: string | null;
                    updated_at?: string;
                    url?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'plans_category_id_fkey';
                        columns: ['category_id'];
                        isOneToOne: false;
                        referencedRelation: 'categories';
                        referencedColumns: ['id'];
                    },
                ];
            };
            policy_update_emails: {
                Row: {
                    document_type: string;
                    id: string;
                    recipients_count: number;
                    sent_at: string;
                    sent_by: string | null;
                    status: string;
                    template_id: string;
                };
                Insert: {
                    document_type: string;
                    id?: string;
                    recipients_count?: number;
                    sent_at?: string;
                    sent_by?: string | null;
                    status?: string;
                    template_id: string;
                };
                Update: {
                    document_type?: string;
                    id?: string;
                    recipients_count?: number;
                    sent_at?: string;
                    sent_by?: string | null;
                    status?: string;
                    template_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'policy_update_emails_template_id_fkey';
                        columns: ['template_id'];
                        isOneToOne: false;
                        referencedRelation: 'document_templates';
                        referencedColumns: ['id'];
                    },
                ];
            };
            portal_available_agents: {
                Row: {
                    card_media: Json | null;
                    category: string;
                    created_at: string;
                    description: string | null;
                    features: Json | null;
                    icon: string | null;
                    id: string;
                    image_url: string | null;
                    integrations: Json | null;
                    is_active: boolean;
                    is_popular: boolean;
                    job_title: string | null;
                    long_description: string | null;
                    name: string;
                    perfect_for: Json | null;
                    price: number;
                    product_media: Json | null;
                    section_order: number | null;
                    slug: string;
                    sort_order: number;
                    tiers: Json | null;
                    updated_at: string;
                    website_category: string[] | null;
                };
                Insert: {
                    card_media?: Json | null;
                    category?: string;
                    created_at?: string;
                    description?: string | null;
                    features?: Json | null;
                    icon?: string | null;
                    id?: string;
                    image_url?: string | null;
                    integrations?: Json | null;
                    is_active?: boolean;
                    is_popular?: boolean;
                    job_title?: string | null;
                    long_description?: string | null;
                    name: string;
                    perfect_for?: Json | null;
                    price?: number;
                    product_media?: Json | null;
                    section_order?: number | null;
                    slug: string;
                    sort_order?: number;
                    tiers?: Json | null;
                    updated_at?: string;
                    website_category?: string[] | null;
                };
                Update: {
                    card_media?: Json | null;
                    category?: string;
                    created_at?: string;
                    description?: string | null;
                    features?: Json | null;
                    icon?: string | null;
                    id?: string;
                    image_url?: string | null;
                    integrations?: Json | null;
                    is_active?: boolean;
                    is_popular?: boolean;
                    job_title?: string | null;
                    long_description?: string | null;
                    name?: string;
                    perfect_for?: Json | null;
                    price?: number;
                    product_media?: Json | null;
                    section_order?: number | null;
                    slug?: string;
                    sort_order?: number;
                    tiers?: Json | null;
                    updated_at?: string;
                    website_category?: string[] | null;
                };
                Relationships: [];
            };
            portal_faq_items: {
                Row: {
                    answer: string;
                    created_at: string;
                    id: string;
                    is_active: boolean;
                    question: string;
                    sort_order: number;
                    updated_at: string;
                };
                Insert: {
                    answer: string;
                    created_at?: string;
                    id?: string;
                    is_active?: boolean;
                    question: string;
                    sort_order?: number;
                    updated_at?: string;
                };
                Update: {
                    answer?: string;
                    created_at?: string;
                    id?: string;
                    is_active?: boolean;
                    question?: string;
                    sort_order?: number;
                    updated_at?: string;
                };
                Relationships: [];
            };
            portal_integrations: {
                Row: {
                    category: string | null;
                    created_at: string;
                    description: string | null;
                    icon: string | null;
                    id: string;
                    is_active: boolean;
                    name: string;
                    sort_order: number;
                    updated_at: string;
                };
                Insert: {
                    category?: string | null;
                    created_at?: string;
                    description?: string | null;
                    icon?: string | null;
                    id?: string;
                    is_active?: boolean;
                    name: string;
                    sort_order?: number;
                    updated_at?: string;
                };
                Update: {
                    category?: string | null;
                    created_at?: string;
                    description?: string | null;
                    icon?: string | null;
                    id?: string;
                    is_active?: boolean;
                    name?: string;
                    sort_order?: number;
                    updated_at?: string;
                };
                Relationships: [];
            };
            portal_roadmap_items: {
                Row: {
                    category: string | null;
                    created_at: string;
                    description: string | null;
                    eta: string | null;
                    id: string;
                    is_active: boolean;
                    progress: number | null;
                    sort_order: number;
                    status: string;
                    title: string;
                    updated_at: string;
                };
                Insert: {
                    category?: string | null;
                    created_at?: string;
                    description?: string | null;
                    eta?: string | null;
                    id?: string;
                    is_active?: boolean;
                    progress?: number | null;
                    sort_order?: number;
                    status?: string;
                    title: string;
                    updated_at?: string;
                };
                Update: {
                    category?: string | null;
                    created_at?: string;
                    description?: string | null;
                    eta?: string | null;
                    id?: string;
                    is_active?: boolean;
                    progress?: number | null;
                    sort_order?: number;
                    status?: string;
                    title?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            portal_tenants: {
                Row: {
                    company_name: string;
                    created_at: string | null;
                    id: string;
                    is_temp_subdomain: boolean | null;
                    logo_url: string | null;
                    onboarding_completed_at: string | null;
                    primary_color: string | null;
                    settings: Json | null;
                    status: string | null;
                    subdomain: string;
                    updated_at: string | null;
                    user_id: string;
                };
                Insert: {
                    company_name: string;
                    created_at?: string | null;
                    id?: string;
                    is_temp_subdomain?: boolean | null;
                    logo_url?: string | null;
                    onboarding_completed_at?: string | null;
                    primary_color?: string | null;
                    settings?: Json | null;
                    status?: string | null;
                    subdomain: string;
                    updated_at?: string | null;
                    user_id: string;
                };
                Update: {
                    company_name?: string;
                    created_at?: string | null;
                    id?: string;
                    is_temp_subdomain?: boolean | null;
                    logo_url?: string | null;
                    onboarding_completed_at?: string | null;
                    primary_color?: string | null;
                    settings?: Json | null;
                    status?: string | null;
                    subdomain?: string;
                    updated_at?: string | null;
                    user_id?: string;
                };
                Relationships: [];
            };
            products: {
                Row: {
                    access_duration: Database['public']['Enums']['product_access_duration'];
                    billing_type: Database['public']['Enums']['product_billing_type'];
                    cancellation_policy: string | null;
                    category_id: string | null;
                    created_at: string;
                    data_ai_disclaimer: string | null;
                    delivery_method: Database['public']['Enums']['product_delivery_method'];
                    disclaimers: string | null;
                    estimated_time_to_value: Database['public']['Enums']['product_time_to_value'];
                    full_description: string | null;
                    hourly_rate: number | null;
                    id: string;
                    image_url: string | null;
                    internal_notes: string | null;
                    license_type: Database['public']['Enums']['product_license_type'];
                    part_time_price: number | null;
                    prerequisites: string | null;
                    price: number;
                    product_name: string;
                    product_sku: string | null;
                    product_status: Database['public']['Enums']['product_status'];
                    refund_policy: Database['public']['Enums']['product_refund_policy'];
                    short_description: string | null;
                    slug: string | null;
                    support_level: Database['public']['Enums']['product_support_level'];
                    tags: string[] | null;
                    term_length: Database['public']['Enums']['product_term_length'];
                    type: string | null;
                    updated_at: string;
                    url: string | null;
                    version_date: string | null;
                    whats_included: string | null;
                    who_this_is_for: string | null;
                    who_this_is_not_for: string | null;
                };
                Insert: {
                    access_duration?: Database['public']['Enums']['product_access_duration'];
                    billing_type?: Database['public']['Enums']['product_billing_type'];
                    cancellation_policy?: string | null;
                    category_id?: string | null;
                    created_at?: string;
                    data_ai_disclaimer?: string | null;
                    delivery_method?: Database['public']['Enums']['product_delivery_method'];
                    disclaimers?: string | null;
                    estimated_time_to_value?: Database['public']['Enums']['product_time_to_value'];
                    full_description?: string | null;
                    hourly_rate?: number | null;
                    id?: string;
                    image_url?: string | null;
                    internal_notes?: string | null;
                    license_type?: Database['public']['Enums']['product_license_type'];
                    part_time_price?: number | null;
                    prerequisites?: string | null;
                    price?: number;
                    product_name: string;
                    product_sku?: string | null;
                    product_status?: Database['public']['Enums']['product_status'];
                    refund_policy?: Database['public']['Enums']['product_refund_policy'];
                    short_description?: string | null;
                    slug?: string | null;
                    support_level?: Database['public']['Enums']['product_support_level'];
                    tags?: string[] | null;
                    term_length?: Database['public']['Enums']['product_term_length'];
                    type?: string | null;
                    updated_at?: string;
                    url?: string | null;
                    version_date?: string | null;
                    whats_included?: string | null;
                    who_this_is_for?: string | null;
                    who_this_is_not_for?: string | null;
                };
                Update: {
                    access_duration?: Database['public']['Enums']['product_access_duration'];
                    billing_type?: Database['public']['Enums']['product_billing_type'];
                    cancellation_policy?: string | null;
                    category_id?: string | null;
                    created_at?: string;
                    data_ai_disclaimer?: string | null;
                    delivery_method?: Database['public']['Enums']['product_delivery_method'];
                    disclaimers?: string | null;
                    estimated_time_to_value?: Database['public']['Enums']['product_time_to_value'];
                    full_description?: string | null;
                    hourly_rate?: number | null;
                    id?: string;
                    image_url?: string | null;
                    internal_notes?: string | null;
                    license_type?: Database['public']['Enums']['product_license_type'];
                    part_time_price?: number | null;
                    prerequisites?: string | null;
                    price?: number;
                    product_name?: string;
                    product_sku?: string | null;
                    product_status?: Database['public']['Enums']['product_status'];
                    refund_policy?: Database['public']['Enums']['product_refund_policy'];
                    short_description?: string | null;
                    slug?: string | null;
                    support_level?: Database['public']['Enums']['product_support_level'];
                    tags?: string[] | null;
                    term_length?: Database['public']['Enums']['product_term_length'];
                    type?: string | null;
                    updated_at?: string;
                    url?: string | null;
                    version_date?: string | null;
                    whats_included?: string | null;
                    who_this_is_for?: string | null;
                    who_this_is_not_for?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'products_category_id_fkey';
                        columns: ['category_id'];
                        isOneToOne: false;
                        referencedRelation: 'categories';
                        referencedColumns: ['id'];
                    },
                ];
            };
            profiles: {
                Row: {
                    access_level:
                        | Database['public']['Enums']['access_level']
                        | null;
                    agreement_status: string | null;
                    commission_rate: number | null;
                    commission_structure: string | null;
                    company_name: string | null;
                    contract_signed: boolean | null;
                    contract_signed_date: string | null;
                    created_at: string;
                    created_by: string | null;
                    email: string;
                    employment_type: string | null;
                    first_name: string | null;
                    hire_date: string | null;
                    id: string;
                    last_login: string | null;
                    last_name: string | null;
                    nick_name: string | null;
                    partnership_interest: string | null;
                    phone: string | null;
                    primary_company_id: string | null;
                    referral_volume: string | null;
                    rep_status: string | null;
                    revenue_attributed: number | null;
                    start_date: string | null;
                    status: Database['public']['Enums']['user_status'];
                    subscription_status: string | null;
                    timezone: string | null;
                    title: string | null;
                    total_revenue_influenced: number | null;
                    two_factor_status:
                        | Database['public']['Enums']['two_factor_status']
                        | null;
                    updated_at: string;
                    user_id: string;
                    user_type: Database['public']['Enums']['user_type'] | null;
                };
                Insert: {
                    access_level?:
                        | Database['public']['Enums']['access_level']
                        | null;
                    agreement_status?: string | null;
                    commission_rate?: number | null;
                    commission_structure?: string | null;
                    company_name?: string | null;
                    contract_signed?: boolean | null;
                    contract_signed_date?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    email: string;
                    employment_type?: string | null;
                    first_name?: string | null;
                    hire_date?: string | null;
                    id?: string;
                    last_login?: string | null;
                    last_name?: string | null;
                    nick_name?: string | null;
                    partnership_interest?: string | null;
                    phone?: string | null;
                    primary_company_id?: string | null;
                    referral_volume?: string | null;
                    rep_status?: string | null;
                    revenue_attributed?: number | null;
                    start_date?: string | null;
                    status?: Database['public']['Enums']['user_status'];
                    subscription_status?: string | null;
                    timezone?: string | null;
                    title?: string | null;
                    total_revenue_influenced?: number | null;
                    two_factor_status?:
                        | Database['public']['Enums']['two_factor_status']
                        | null;
                    updated_at?: string;
                    user_id: string;
                    user_type?: Database['public']['Enums']['user_type'] | null;
                };
                Update: {
                    access_level?:
                        | Database['public']['Enums']['access_level']
                        | null;
                    agreement_status?: string | null;
                    commission_rate?: number | null;
                    commission_structure?: string | null;
                    company_name?: string | null;
                    contract_signed?: boolean | null;
                    contract_signed_date?: string | null;
                    created_at?: string;
                    created_by?: string | null;
                    email?: string;
                    employment_type?: string | null;
                    first_name?: string | null;
                    hire_date?: string | null;
                    id?: string;
                    last_login?: string | null;
                    last_name?: string | null;
                    nick_name?: string | null;
                    partnership_interest?: string | null;
                    phone?: string | null;
                    primary_company_id?: string | null;
                    referral_volume?: string | null;
                    rep_status?: string | null;
                    revenue_attributed?: number | null;
                    start_date?: string | null;
                    status?: Database['public']['Enums']['user_status'];
                    subscription_status?: string | null;
                    timezone?: string | null;
                    title?: string | null;
                    total_revenue_influenced?: number | null;
                    two_factor_status?:
                        | Database['public']['Enums']['two_factor_status']
                        | null;
                    updated_at?: string;
                    user_id?: string;
                    user_type?: Database['public']['Enums']['user_type'] | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'profiles_primary_company_id_fkey';
                        columns: ['primary_company_id'];
                        isOneToOne: false;
                        referencedRelation: 'companies';
                        referencedColumns: ['id'];
                    },
                ];
            };
            prospect_view_preferences: {
                Row: {
                    active_filters: Json | null;
                    active_view_name: string | null;
                    column_order: string[] | null;
                    column_widths: Json | null;
                    created_at: string;
                    default_view_name: string | null;
                    hidden_columns: string[] | null;
                    id: string;
                    rows_per_page: number | null;
                    saved_views: Json | null;
                    sort_column: string | null;
                    sort_direction: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            prospects: {
                Row: {
                    company: string | null;
                    company_updated_at: string | null;
                    company_updated_by: string | null;
                    created_at: string;
                    email: string | null;
                    email_updated_at: string | null;
                    email_updated_by: string | null;
                    est_closing_date: string | null;
                    est_closing_date_updated_at: string | null;
                    est_closing_date_updated_by: string | null;
                    estimated_value: number | null;
                    first_name: string | null;
                    ghl_contact_id: string | null;
                    ghl_synced_at: string | null;
                    id: string;
                    interested_plan: string | null;
                    last_activity: string | null;
                    last_activity_updated_at: string | null;
                    last_activity_updated_by: string | null;
                    last_contact: string | null;
                    last_contact_updated_at: string | null;
                    last_contact_updated_by: string | null;
                    last_meeting: string | null;
                    last_meeting_updated_at: string | null;
                    last_meeting_updated_by: string | null;
                    last_name: string | null;
                    last_outreach: string | null;
                    last_outreach_updated_at: string | null;
                    last_outreach_updated_by: string | null;
                    lead_source: string | null;
                    name: string;
                    name_updated_at: string | null;
                    name_updated_by: string | null;
                    next_meeting: string | null;
                    next_meeting_updated_at: string | null;
                    next_meeting_updated_by: string | null;
                    next_outreach: string | null;
                    next_outreach_updated_at: string | null;
                    next_outreach_updated_by: string | null;
                    nick_name: string | null;
                    notes: string | null;
                    partner_name: string | null;
                    partner_name_updated_at: string | null;
                    partner_name_updated_by: string | null;
                    phone: string | null;
                    phone_updated_at: string | null;
                    phone_updated_by: string | null;
                    sales_rep: string | null;
                    sales_rep_updated_at: string | null;
                    sales_rep_updated_by: string | null;
                    sdr_set: boolean | null;
                    services: string | null;
                    status: string | null;
                    tags: string[] | null;
                    tags_updated_at: string | null;
                    tags_updated_by: string | null;
                    updated_at: string;
                };
                Insert: {
                    company?: string | null;
                    company_updated_at?: string | null;
                    company_updated_by?: string | null;
                    created_at?: string;
                    email?: string | null;
                    email_updated_at?: string | null;
                    email_updated_by?: string | null;
                    est_closing_date?: string | null;
                    est_closing_date_updated_at?: string | null;
                    est_closing_date_updated_by?: string | null;
                    estimated_value?: number | null;
                    first_name?: string | null;
                    ghl_contact_id?: string | null;
                    ghl_synced_at?: string | null;
                    id?: string;
                    interested_plan?: string | null;
                    last_activity?: string | null;
                    last_activity_updated_at?: string | null;
                    last_activity_updated_by?: string | null;
                    last_contact?: string | null;
                    last_contact_updated_at?: string | null;
                    last_contact_updated_by?: string | null;
                    last_meeting?: string | null;
                    last_meeting_updated_at?: string | null;
                    last_meeting_updated_by?: string | null;
                    last_name?: string | null;
                    last_outreach?: string | null;
                    last_outreach_updated_at?: string | null;
                    last_outreach_updated_by?: string | null;
                    lead_source?: string | null;
                    name: string;
                    name_updated_at?: string | null;
                    name_updated_by?: string | null;
                    next_meeting?: string | null;
                    next_meeting_updated_at?: string | null;
                    next_meeting_updated_by?: string | null;
                    next_outreach?: string | null;
                    next_outreach_updated_at?: string | null;
                    next_outreach_updated_by?: string | null;
                    nick_name?: string | null;
                    notes?: string | null;
                    partner_name?: string | null;
                    partner_name_updated_at?: string | null;
                    partner_name_updated_by?: string | null;
                    phone?: string | null;
                    phone_updated_at?: string | null;
                    phone_updated_by?: string | null;
                    sales_rep?: string | null;
                    sales_rep_updated_at?: string | null;
                    sales_rep_updated_by?: string | null;
                    sdr_set?: boolean | null;
                    services?: string | null;
                    status?: string | null;
                    tags?: string[] | null;
                    tags_updated_at?: string | null;
                    tags_updated_by?: string | null;
                    updated_at?: string;
                };
                Update: {
                    company?: string | null;
                    company_updated_at?: string | null;
                    company_updated_by?: string | null;
                    created_at?: string;
                    email?: string | null;
                    email_updated_at?: string | null;
                    email_updated_by?: string | null;
                    est_closing_date?: string | null;
                    est_closing_date_updated_at?: string | null;
                    est_closing_date_updated_by?: string | null;
                    estimated_value?: number | null;
                    first_name?: string | null;
                    ghl_contact_id?: string | null;
                    ghl_synced_at?: string | null;
                    id?: string;
                    interested_plan?: string | null;
                    last_activity?: string | null;
                    last_activity_updated_at?: string | null;
                    last_activity_updated_by?: string | null;
                    last_contact?: string | null;
                    last_contact_updated_at?: string | null;
                    last_contact_updated_by?: string | null;
                    last_meeting?: string | null;
                    last_meeting_updated_at?: string | null;
                    last_meeting_updated_by?: string | null;
                    last_name?: string | null;
                    last_outreach?: string | null;
                    last_outreach_updated_at?: string | null;
                    last_outreach_updated_by?: string | null;
                    lead_source?: string | null;
                    name?: string;
                    name_updated_at?: string | null;
                    name_updated_by?: string | null;
                    next_meeting?: string | null;
                    next_meeting_updated_at?: string | null;
                    next_meeting_updated_by?: string | null;
                    next_outreach?: string | null;
                    next_outreach_updated_at?: string | null;
                    next_outreach_updated_by?: string | null;
                    nick_name?: string | null;
                    notes?: string | null;
                    partner_name?: string | null;
                    partner_name_updated_at?: string | null;
                    partner_name_updated_by?: string | null;
                    phone?: string | null;
                    phone_updated_at?: string | null;
                    phone_updated_by?: string | null;
                    sales_rep?: string | null;
                    sales_rep_updated_at?: string | null;
                    sales_rep_updated_by?: string | null;
                    sdr_set?: boolean | null;
                    services?: string | null;
                    status?: string | null;
                    tags?: string[] | null;
                    tags_updated_at?: string | null;
                    tags_updated_by?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            referral_rate_limits: {
                Row: {
                    blocked_until: string | null;
                    created_at: string | null;
                    id: string;
                    ip_address: string;
                    partner_slug: string | null;
                    request_count: number | null;
                    window_start: string | null;
                };
                Insert: {
                    blocked_until?: string | null;
                    created_at?: string | null;
                    id?: string;
                    ip_address: string;
                    partner_slug?: string | null;
                    request_count?: number | null;
                    window_start?: string | null;
                };
                Update: {
                    blocked_until?: string | null;
                    created_at?: string | null;
                    id?: string;
                    ip_address?: string;
                    partner_slug?: string | null;
                    request_count?: number | null;
                    window_start?: string | null;
                };
                Relationships: [];
            };
            referrals: {
                Row: {
                    attribution_type: Database['public']['Enums']['attribution_type'];
                    converted_at: string | null;
                    created_at: string;
                    deal_id: string | null;
                    duplicate: boolean | null;
                    event_type: string | null;
                    first_name: string | null;
                    id: string;
                    ip_address: string | null;
                    landing_page: string | null;
                    last_name: string | null;
                    lead_company: string | null;
                    lead_email: string;
                    lead_name: string | null;
                    lead_phone: string | null;
                    needs_approval: boolean | null;
                    notes: string | null;
                    partner_id: string;
                    source: Database['public']['Enums']['referral_source'];
                    status: Database['public']['Enums']['referral_status'];
                    updated_at: string;
                    user_agent: string | null;
                    utm_params: Json | null;
                };
                Insert: {
                    attribution_type?: Database['public']['Enums']['attribution_type'];
                    converted_at?: string | null;
                    created_at?: string;
                    deal_id?: string | null;
                    duplicate?: boolean | null;
                    event_type?: string | null;
                    first_name?: string | null;
                    id?: string;
                    ip_address?: string | null;
                    landing_page?: string | null;
                    last_name?: string | null;
                    lead_company?: string | null;
                    lead_email: string;
                    lead_name?: string | null;
                    lead_phone?: string | null;
                    needs_approval?: boolean | null;
                    notes?: string | null;
                    partner_id: string;
                    source: Database['public']['Enums']['referral_source'];
                    status?: Database['public']['Enums']['referral_status'];
                    updated_at?: string;
                    user_agent?: string | null;
                    utm_params?: Json | null;
                };
                Update: {
                    attribution_type?: Database['public']['Enums']['attribution_type'];
                    converted_at?: string | null;
                    created_at?: string;
                    deal_id?: string | null;
                    duplicate?: boolean | null;
                    event_type?: string | null;
                    first_name?: string | null;
                    id?: string;
                    ip_address?: string | null;
                    landing_page?: string | null;
                    last_name?: string | null;
                    lead_company?: string | null;
                    lead_email?: string;
                    lead_name?: string | null;
                    lead_phone?: string | null;
                    needs_approval?: boolean | null;
                    notes?: string | null;
                    partner_id?: string;
                    source?: Database['public']['Enums']['referral_source'];
                    status?: Database['public']['Enums']['referral_status'];
                    updated_at?: string;
                    user_agent?: string | null;
                    utm_params?: Json | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'referrals_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                ];
            };
            report_runs: {
                Row: {
                    created_at: string;
                    csv_commissions_url: string | null;
                    csv_payouts_url: string | null;
                    error_message: string | null;
                    generated_at: string | null;
                    id: string;
                    partner_id: string;
                    pdf_url: string | null;
                    period_end: string;
                    period_start: string;
                    report_id: string | null;
                    status: string;
                };
                Insert: {
                    created_at?: string;
                    csv_commissions_url?: string | null;
                    csv_payouts_url?: string | null;
                    error_message?: string | null;
                    generated_at?: string | null;
                    id?: string;
                    partner_id: string;
                    pdf_url?: string | null;
                    period_end: string;
                    period_start: string;
                    report_id?: string | null;
                    status?: string;
                };
                Update: {
                    created_at?: string;
                    csv_commissions_url?: string | null;
                    csv_payouts_url?: string | null;
                    error_message?: string | null;
                    generated_at?: string | null;
                    id?: string;
                    partner_id?: string;
                    pdf_url?: string | null;
                    period_end?: string;
                    period_start?: string;
                    report_id?: string | null;
                    status?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'report_runs_partner_id_fkey';
                        columns: ['partner_id'];
                        isOneToOne: false;
                        referencedRelation: 'partners';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'report_runs_report_id_fkey';
                        columns: ['report_id'];
                        isOneToOne: false;
                        referencedRelation: 'partner_scheduled_reports';
                        referencedColumns: ['id'];
                    },
                ];
            };
            role_permissions: {
                Row: {
                    created_at: string;
                    enabled: boolean;
                    id: string;
                    permission_id: string;
                    role: Database['public']['Enums']['admin_user_type'];
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    enabled?: boolean;
                    id?: string;
                    permission_id: string;
                    role: Database['public']['Enums']['admin_user_type'];
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    enabled?: boolean;
                    id?: string;
                    permission_id?: string;
                    role?: Database['public']['Enums']['admin_user_type'];
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'role_permissions_permission_id_fkey';
                        columns: ['permission_id'];
                        isOneToOne: false;
                        referencedRelation: 'permissions';
                        referencedColumns: ['id'];
                    },
                ];
            };
            sales_rep_view_preferences: {
                Row: {
                    active_filters: Json | null;
                    active_view_name: string | null;
                    column_order: string[] | null;
                    column_widths: Json | null;
                    created_at: string;
                    default_view_name: string | null;
                    hidden_columns: string[] | null;
                    id: string;
                    rows_per_page: number | null;
                    saved_views: Json | null;
                    sort_column: string | null;
                    sort_direction: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            sales_reps: {
                Row: {
                    commission_rate: number | null;
                    created_at: string;
                    email: string | null;
                    hire_date: string | null;
                    id: string;
                    monthly_revenue: number | null;
                    name: string;
                    notes: string | null;
                    phone: string | null;
                    status: string;
                    title: string | null;
                    total_clients: number | null;
                    updated_at: string;
                };
                Insert: {
                    commission_rate?: number | null;
                    created_at?: string;
                    email?: string | null;
                    hire_date?: string | null;
                    id?: string;
                    monthly_revenue?: number | null;
                    name: string;
                    notes?: string | null;
                    phone?: string | null;
                    status?: string;
                    title?: string | null;
                    total_clients?: number | null;
                    updated_at?: string;
                };
                Update: {
                    commission_rate?: number | null;
                    created_at?: string;
                    email?: string | null;
                    hire_date?: string | null;
                    id?: string;
                    monthly_revenue?: number | null;
                    name?: string;
                    notes?: string | null;
                    phone?: string | null;
                    status?: string;
                    title?: string | null;
                    total_clients?: number | null;
                    updated_at?: string;
                };
                Relationships: [];
            };
            session_tracking: {
                Row: {
                    created_at: string;
                    id: string;
                    ip_address: string | null;
                    landing_page: string | null;
                    referrer: string | null;
                    session_id: string;
                    user_agent: string | null;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    ip_address?: string | null;
                    landing_page?: string | null;
                    referrer?: string | null;
                    session_id: string;
                    user_agent?: string | null;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    ip_address?: string | null;
                    landing_page?: string | null;
                    referrer?: string | null;
                    session_id?: string;
                    user_agent?: string | null;
                };
                Relationships: [];
            };
            staff: {
                Row: {
                    account_number: string | null;
                    account_type: string | null;
                    bank_name: string | null;
                    city: string | null;
                    commission_percent: number | null;
                    commission_status: string | null;
                    commission_type:
                        | Database['public']['Enums']['commission_type']
                        | null;
                    country: string | null;
                    created_at: string;
                    department: string | null;
                    email: string | null;
                    employment_type:
                        | Database['public']['Enums']['employment_type']
                        | null;
                    end_date: string | null;
                    expected_hours_week: number | null;
                    first_name: string | null;
                    hourly_pay: number | null;
                    hours_per_week: number | null;
                    id: string;
                    kpis: Json | null;
                    last_name: string | null;
                    last_review_date: string | null;
                    manager_id: string | null;
                    monthly_pay: number | null;
                    monthly_revenue: number | null;
                    name: string;
                    next_review_date: string | null;
                    notes: string | null;
                    pay_type: Database['public']['Enums']['pay_type'] | null;
                    performance_status: string | null;
                    phone: string | null;
                    portal_user_linked: boolean | null;
                    primary_user_email: string | null;
                    quota: number | null;
                    routing_number: string | null;
                    salary: number | null;
                    staff_type: Database['public']['Enums']['staff_type'];
                    start_date: string | null;
                    status: Database['public']['Enums']['staff_status'];
                    termination_notes: string | null;
                    termination_reason: string | null;
                    timezone: string | null;
                    title: string | null;
                    total_clients: number | null;
                    training_completed: Json | null;
                    updated_at: string;
                    user_id: string | null;
                };
                Insert: {
                    account_number?: string | null;
                    account_type?: string | null;
                    bank_name?: string | null;
                    city?: string | null;
                    commission_percent?: number | null;
                    commission_status?: string | null;
                    commission_type?:
                        | Database['public']['Enums']['commission_type']
                        | null;
                    country?: string | null;
                    created_at?: string;
                    department?: string | null;
                    email?: string | null;
                    employment_type?:
                        | Database['public']['Enums']['employment_type']
                        | null;
                    end_date?: string | null;
                    expected_hours_week?: number | null;
                    first_name?: string | null;
                    hourly_pay?: number | null;
                    hours_per_week?: number | null;
                    id?: string;
                    kpis?: Json | null;
                    last_name?: string | null;
                    last_review_date?: string | null;
                    manager_id?: string | null;
                    monthly_pay?: number | null;
                    monthly_revenue?: number | null;
                    name: string;
                    next_review_date?: string | null;
                    notes?: string | null;
                    pay_type?: Database['public']['Enums']['pay_type'] | null;
                    performance_status?: string | null;
                    phone?: string | null;
                    portal_user_linked?: boolean | null;
                    primary_user_email?: string | null;
                    quota?: number | null;
                    routing_number?: string | null;
                    salary?: number | null;
                    staff_type?: Database['public']['Enums']['staff_type'];
                    start_date?: string | null;
                    status?: Database['public']['Enums']['staff_status'];
                    termination_notes?: string | null;
                    termination_reason?: string | null;
                    timezone?: string | null;
                    title?: string | null;
                    total_clients?: number | null;
                    training_completed?: Json | null;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Update: {
                    account_number?: string | null;
                    account_type?: string | null;
                    bank_name?: string | null;
                    city?: string | null;
                    commission_percent?: number | null;
                    commission_status?: string | null;
                    commission_type?:
                        | Database['public']['Enums']['commission_type']
                        | null;
                    country?: string | null;
                    created_at?: string;
                    department?: string | null;
                    email?: string | null;
                    employment_type?:
                        | Database['public']['Enums']['employment_type']
                        | null;
                    end_date?: string | null;
                    expected_hours_week?: number | null;
                    first_name?: string | null;
                    hourly_pay?: number | null;
                    hours_per_week?: number | null;
                    id?: string;
                    kpis?: Json | null;
                    last_name?: string | null;
                    last_review_date?: string | null;
                    manager_id?: string | null;
                    monthly_pay?: number | null;
                    monthly_revenue?: number | null;
                    name?: string;
                    next_review_date?: string | null;
                    notes?: string | null;
                    pay_type?: Database['public']['Enums']['pay_type'] | null;
                    performance_status?: string | null;
                    phone?: string | null;
                    portal_user_linked?: boolean | null;
                    primary_user_email?: string | null;
                    quota?: number | null;
                    routing_number?: string | null;
                    salary?: number | null;
                    staff_type?: Database['public']['Enums']['staff_type'];
                    start_date?: string | null;
                    status?: Database['public']['Enums']['staff_status'];
                    termination_notes?: string | null;
                    termination_reason?: string | null;
                    timezone?: string | null;
                    title?: string | null;
                    total_clients?: number | null;
                    training_completed?: Json | null;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'staff_manager_id_fkey';
                        columns: ['manager_id'];
                        isOneToOne: false;
                        referencedRelation: 'staff';
                        referencedColumns: ['id'];
                    },
                ];
            };
            staff_hours: {
                Row: {
                    created_at: string;
                    hours_worked: number;
                    id: string;
                    period_end: string;
                    period_start: string;
                    staff_id: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    hours_worked?: number;
                    id?: string;
                    period_end: string;
                    period_start: string;
                    staff_id: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    hours_worked?: number;
                    id?: string;
                    period_end?: string;
                    period_start?: string;
                    staff_id?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'staff_hours_staff_id_fkey';
                        columns: ['staff_id'];
                        isOneToOne: false;
                        referencedRelation: 'staff';
                        referencedColumns: ['id'];
                    },
                ];
            };
            staff_view_preferences: {
                Row: {
                    active_filters: Json | null;
                    active_view_name: string | null;
                    column_order: string[] | null;
                    column_widths: Json | null;
                    created_at: string;
                    default_view_name: string | null;
                    hidden_columns: string[] | null;
                    id: string;
                    rows_per_page: number | null;
                    saved_views: Json | null;
                    sort_column: string | null;
                    sort_direction: string | null;
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    active_filters?: Json | null;
                    active_view_name?: string | null;
                    column_order?: string[] | null;
                    column_widths?: Json | null;
                    created_at?: string;
                    default_view_name?: string | null;
                    hidden_columns?: string[] | null;
                    id?: string;
                    rows_per_page?: number | null;
                    saved_views?: Json | null;
                    sort_column?: string | null;
                    sort_direction?: string | null;
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            system_config: {
                Row: {
                    description: string | null;
                    key: string;
                    updated_at: string;
                    updated_by: string | null;
                    value: Json;
                };
                Insert: {
                    description?: string | null;
                    key: string;
                    updated_at?: string;
                    updated_by?: string | null;
                    value?: Json;
                };
                Update: {
                    description?: string | null;
                    key?: string;
                    updated_at?: string;
                    updated_by?: string | null;
                    value?: Json;
                };
                Relationships: [];
            };
            template_signer_config: {
                Row: {
                    created_at: string;
                    display_name: string;
                    id: string;
                    is_required: boolean;
                    signer_role: Database['public']['Enums']['signer_role'];
                    signing_order: number;
                    template_version_id: string;
                };
                Insert: {
                    created_at?: string;
                    display_name: string;
                    id?: string;
                    is_required?: boolean;
                    signer_role: Database['public']['Enums']['signer_role'];
                    signing_order?: number;
                    template_version_id: string;
                };
                Update: {
                    created_at?: string;
                    display_name?: string;
                    id?: string;
                    is_required?: boolean;
                    signer_role?: Database['public']['Enums']['signer_role'];
                    signing_order?: number;
                    template_version_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'template_signer_config_template_version_id_fkey';
                        columns: ['template_version_id'];
                        isOneToOne: false;
                        referencedRelation: 'msa_template_versions';
                        referencedColumns: ['id'];
                    },
                ];
            };
            template_signing_fields: {
                Row: {
                    created_at: string;
                    display_order: number;
                    field_label: string;
                    field_type: Database['public']['Enums']['signing_field_type'];
                    height: number;
                    id: string;
                    is_required: boolean;
                    page_number: number;
                    position_x: number;
                    position_y: number;
                    signer_role: Database['public']['Enums']['signer_role'];
                    template_version_id: string;
                    width: number;
                };
                Insert: {
                    created_at?: string;
                    display_order?: number;
                    field_label: string;
                    field_type: Database['public']['Enums']['signing_field_type'];
                    height?: number;
                    id?: string;
                    is_required?: boolean;
                    page_number?: number;
                    position_x?: number;
                    position_y?: number;
                    signer_role: Database['public']['Enums']['signer_role'];
                    template_version_id: string;
                    width?: number;
                };
                Update: {
                    created_at?: string;
                    display_order?: number;
                    field_label?: string;
                    field_type?: Database['public']['Enums']['signing_field_type'];
                    height?: number;
                    id?: string;
                    is_required?: boolean;
                    page_number?: number;
                    position_x?: number;
                    position_y?: number;
                    signer_role?: Database['public']['Enums']['signer_role'];
                    template_version_id?: string;
                    width?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'template_signing_fields_template_version_id_fkey';
                        columns: ['template_version_id'];
                        isOneToOne: false;
                        referencedRelation: 'msa_template_versions';
                        referencedColumns: ['id'];
                    },
                ];
            };
            user_associated_accounts: {
                Row: {
                    company_id: string;
                    created_at: string;
                    id: string;
                    user_id: string;
                };
                Insert: {
                    company_id: string;
                    created_at?: string;
                    id?: string;
                    user_id: string;
                };
                Update: {
                    company_id?: string;
                    created_at?: string;
                    id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_associated_accounts_company_id_fkey';
                        columns: ['company_id'];
                        isOneToOne: false;
                        referencedRelation: 'companies';
                        referencedColumns: ['id'];
                    },
                ];
            };
            user_roles: {
                Row: {
                    created_at: string;
                    id: string;
                    role: Database['public']['Enums']['app_role'];
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    role: Database['public']['Enums']['app_role'];
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    role?: Database['public']['Enums']['app_role'];
                    user_id?: string;
                };
                Relationships: [];
            };
            webhook_events: {
                Row: {
                    created_at: string;
                    error_message: string | null;
                    event_type: string;
                    external_event_id: string | null;
                    id: string;
                    idempotency_key: string;
                    payload_json: Json;
                    processed_at: string | null;
                    provider: string;
                    received_at: string;
                    replay_count: number;
                    status: string;
                };
                Insert: {
                    created_at?: string;
                    error_message?: string | null;
                    event_type: string;
                    external_event_id?: string | null;
                    id?: string;
                    idempotency_key: string;
                    payload_json: Json;
                    processed_at?: string | null;
                    provider: string;
                    received_at?: string;
                    replay_count?: number;
                    status?: string;
                };
                Update: {
                    created_at?: string;
                    error_message?: string | null;
                    event_type?: string;
                    external_event_id?: string | null;
                    id?: string;
                    idempotency_key?: string;
                    payload_json?: Json;
                    processed_at?: string | null;
                    provider?: string;
                    received_at?: string;
                    replay_count?: number;
                    status?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            activate_agreement_if_complete: {
                Args: { p_agreement_id: string };
                Returns: boolean;
            };
            append_deal_timeline: {
                Args: { p_deal_id: string; p_entry: Json };
                Returns: undefined;
            };
            calculate_next_run_at: {
                Args: {
                    p_cadence: string;
                    p_day_of_month: number;
                    p_day_of_week: number;
                    p_timezone?: string;
                };
                Returns: string;
            };
            calculate_payable_at: {
                Args: { p_earned_at: string };
                Returns: string;
            };
            calculate_risk_level: {
                Args: { p_risk_score: number };
                Returns: string;
            };
            cancel_payout: { Args: { p_payout_id: string }; Returns: boolean };
            check_agreement_fully_signed: {
                Args: { p_agreement_id: string };
                Returns: boolean;
            };
            check_email_exists: { Args: { p_email: string }; Returns: boolean };
            check_partner_profile_complete: {
                Args: { _partner_id: string };
                Returns: boolean;
            };
            check_referral_rate_limit: {
                Args: { p_ip_address: string; p_partner_slug: string };
                Returns: Json;
            };
            cleanup_old_rate_limits: { Args: never; Returns: undefined };
            create_commission_for_payment: {
                Args: { p_payment_id: string };
                Returns: string;
            };
            create_payout_batch_for_partner: {
                Args: {
                    p_partner_id: string;
                    p_payout_date: string;
                    p_period_end: string;
                    p_period_start: string;
                };
                Returns: string;
            };
            find_duplicate_referral: {
                Args: {
                    p_email: string;
                    p_partner_id: string;
                    p_phone: string;
                };
                Returns: {
                    deal_id: string;
                    referral_id: string;
                }[];
            };
            find_matching_deal: {
                Args: { p_company: string; p_email: string; p_phone: string };
                Returns: {
                    deal_id: string;
                    match_type: string;
                }[];
            };
            generate_content_hash: {
                Args: { content: string };
                Returns: string;
            };
            generate_partner_slug: {
                Args: { p_first_name: string; p_last_name: string };
                Returns: string;
            };
            generate_temp_subdomain: { Args: never; Returns: string };
            get_agreement_by_token: {
                Args: { agreement_token: string };
                Returns: {
                    client_company: string;
                    client_email: string;
                    client_name: string;
                    content: string;
                    expires_at: string;
                    id: string;
                    plan_name: string;
                    plan_price: number;
                    signature: string;
                    signed_at: string;
                    signer_name: string;
                    status: string;
                    title: string;
                }[];
            };
            get_agreement_sections_by_token: {
                Args: { agreement_token: string };
                Returns: {
                    id: string;
                    initialed_at: string;
                    initials: string;
                    section_key: string;
                    section_title: string;
                }[];
            };
            get_credit_card_fee_rate: { Args: never; Returns: number };
            get_critical_notification_count: { Args: never; Returns: number };
            get_partner_by_slug: {
                Args: { _slug: string };
                Returns: {
                    company_name: string;
                    first_name: string;
                    id: string;
                    last_name: string;
                    slug: string;
                }[];
            };
            get_partner_by_user_id: {
                Args: { _user_id: string };
                Returns: {
                    closed_won_deals: number;
                    commission_rate: number;
                    company_name: string;
                    email: string;
                    email_verified: boolean;
                    first_name: string;
                    id: string;
                    last_name: string;
                    mfa_enabled: boolean;
                    outstanding_commission_balance: number;
                    partner_status: string;
                    qualified_referrals: number;
                    referrals_given: number;
                    revenue_generated: number;
                    slug: string;
                    total_commissions_earned: number;
                }[];
            };
            get_partner_dashboard_stats: {
                Args: { _partner_id: string };
                Returns: {
                    closed_won_deals: number;
                    deals_closed_lost: number;
                    deals_closed_won: number;
                    deals_in_progress: number;
                    deals_new: number;
                    earned_commissions: number;
                    earned_this_month: number;
                    next_payout_amount: number;
                    next_payout_date: string;
                    open_deals: number;
                    paid_commissions: number;
                    paid_ytd: number;
                    payable_commissions: number;
                    pending_commissions: number;
                    pending_referrals: number;
                    qualified_referrals: number;
                    referrals_last_30_days: number;
                    total_deal_value: number;
                    total_deals: number;
                    total_referrals: number;
                }[];
            };
            get_partners: {
                Args: never;
                Returns: {
                    company_name: string;
                    created_at: string;
                    email: string;
                    first_name: string;
                    id: string;
                    last_name: string;
                    partnership_interest: string;
                    phone: string;
                    referral_volume: string;
                    status: Database['public']['Enums']['user_status'];
                    title: string;
                    updated_at: string;
                    user_id: string;
                }[];
            };
            get_payment_mode: { Args: never; Returns: string };
            get_tenant_by_subdomain: {
                Args: { subdomain_input: string };
                Returns: {
                    company_name: string;
                    id: string;
                    is_temp_subdomain: boolean;
                    logo_url: string;
                    primary_color: string;
                    settings: Json;
                    status: string;
                    subdomain: string;
                }[];
            };
            get_test_mode: { Args: never; Returns: boolean };
            get_unresolved_notification_count: { Args: never; Returns: number };
            get_user_permissions: {
                Args: { user_email: string };
                Returns: {
                    enabled: boolean;
                    permission_key: string;
                }[];
            };
            get_user_profile: {
                Args: { _user_id: string };
                Returns: {
                    company_name: string;
                    email: string;
                    first_name: string;
                    id: string;
                    last_name: string;
                    phone: string;
                    roles: Database['public']['Enums']['app_role'][];
                    status: Database['public']['Enums']['user_status'];
                    title: string;
                    user_id: string;
                }[];
            };
            get_user_roles: {
                Args: { _user_id: string };
                Returns: Database['public']['Enums']['app_role'][];
            };
            has_role: {
                Args: {
                    _role: Database['public']['Enums']['app_role'];
                    _user_id: string;
                };
                Returns: boolean;
            };
            is_subdomain_available: {
                Args: { subdomain_input: string };
                Returns: boolean;
            };
            log_agreement_event: {
                Args: {
                    p_actor_email?: string;
                    p_actor_id?: string;
                    p_actor_type: string;
                    p_agreement_id: string;
                    p_event_details?: Json;
                    p_event_type: string;
                    p_ip_address?: string;
                    p_user_agent?: string;
                };
                Returns: string;
            };
            log_partner_audit: {
                Args: {
                    p_action: string;
                    p_new_value?: Json;
                    p_old_value?: Json;
                    p_partner_id: string;
                    p_resource_id?: string;
                    p_resource_type: string;
                };
                Returns: string;
            };
            mark_agreement_viewed: {
                Args: {
                    agreement_token: string;
                    p_ip_address?: string;
                    p_user_agent?: string;
                };
                Returns: boolean;
            };
            mark_payout_paid: {
                Args: { p_payout_id: string };
                Returns: boolean;
            };
            normalize_phone: { Args: { phone: string }; Returns: string };
            process_commission_clawback: {
                Args: {
                    p_is_full_refund: boolean;
                    p_payment_id: string;
                    p_refund_amount: number;
                };
                Returns: string;
            };
            reconcile_payout: { Args: { p_payout_id: string }; Returns: Json };
            set_test_mode: { Args: { enabled: boolean }; Returns: boolean };
            sign_agreement: {
                Args: {
                    agreement_token: string;
                    p_ip_address?: string;
                    p_signature: string;
                    p_signer_name: string;
                };
                Returns: boolean;
            };
            update_commission_status_to_payable: {
                Args: never;
                Returns: number;
            };
            update_partner_risk: {
                Args: {
                    p_partner_id: string;
                    p_reason?: string;
                    p_score_delta: number;
                };
                Returns: {
                    new_level: string;
                    new_score: number;
                    was_suspended: boolean;
                }[];
            };
            update_section_initials: {
                Args: {
                    agreement_token: string;
                    p_initials: string;
                    p_section_id: string;
                };
                Returns: boolean;
            };
            user_has_permission: {
                Args: { permission_key: string; user_email: string };
                Returns: boolean;
            };
        };
        Enums: {
            access_level: 'admin' | 'manager' | 'standard' | 'limited';
            admin_user_type: 'employee' | 'sales_rep' | 'admin';
            agreement_lifecycle_status:
                | 'draft'
                | 'published'
                | 'sent'
                | 'viewed'
                | 'partially_signed'
                | 'active'
                | 'expired'
                | 'terminated'
                | 'cancelled';
            agreement_status:
                | 'draft'
                | 'sent'
                | 'viewed'
                | 'signed'
                | 'expired'
                | 'cancelled';
            app_role: 'client' | 'partner' | 'admin' | 'sales_rep' | 'employee';
            asset_category: 'copy' | 'creative' | 'template';
            attribution_type: 'deal_registration' | 'last_touch';
            calendar_status: 'active' | 'inactive' | 'archived';
            calendar_type:
                | 'individual'
                | 'interview'
                | 'partnership'
                | 'podcast'
                | 'shared';
            commission_status:
                | 'pending'
                | 'earned'
                | 'payable'
                | 'paid'
                | 'clawed_back'
                | 'disputed';
            commission_type: 'percentage' | 'flat_fee' | 'tiered';
            deal_stage: 'new' | 'in_progress' | 'closed_won' | 'closed_lost';
            employment_type:
                | 'full_time'
                | 'part_time'
                | 'contractor'
                | 'intern';
            pay_type: 'hourly' | 'salary' | 'commission_only';
            payment_status: 'captured' | 'refunded' | 'failed';
            payout_method_type: 'ach' | 'check';
            payout_status:
                | 'pending'
                | 'processing'
                | 'completed'
                | 'failed'
                | 'scheduled'
                | 'ready'
                | 'paid'
                | 'canceled';
            plan_status: 'draft' | 'active' | 'hidden' | 'test';
            product_access_duration:
                | 'lifetime_access'
                | 'x_months_access'
                | 'active_subscription_only'
                | 'access_ends_upon_cancellation';
            product_billing_type:
                | 'one_time'
                | 'monthly_subscription'
                | 'annual_subscription'
                | 'subscription_with_minimum_commitment'
                | 'usage_based';
            product_delivery_method:
                | 'instant_download'
                | 'email_delivery'
                | 'account_access'
                | 'platform_access'
                | 'onboarding_call_required';
            product_license_type:
                | 'personal_use_only'
                | 'internal_business_use'
                | 'commercial_use'
                | 'resale_prohibited';
            product_refund_policy:
                | 'no_refunds'
                | 'refund_within_x_days'
                | 'conditional_refund';
            product_status: 'draft' | 'active' | 'hidden' | 'test';
            product_support_level:
                | 'no_support'
                | 'email_support'
                | 'office_hours'
                | 'slack_chat_support'
                | 'dedicated_support';
            product_term_length:
                | 'month_to_month'
                | 'three_month_minimum'
                | 'six_month_minimum'
                | 'fixed_term';
            product_time_to_value:
                | 'immediate'
                | 'one_two_weeks'
                | 'thirty_days'
                | 'after_onboarding';
            referral_source:
                | 'form_submit'
                | 'booked_call'
                | 'paid_checkout'
                | 'deal_registration';
            referral_status:
                | 'new'
                | 'needs_approval'
                | 'qualified'
                | 'converted'
                | 'rejected'
                | 'accepted';
            signer_role:
                | 'primary_signer'
                | 'secondary_signer'
                | 'company_rep'
                | 'witness'
                | 'approver';
            signing_field_type:
                | 'signature'
                | 'initials'
                | 'date'
                | 'name'
                | 'title'
                | 'text'
                | 'checkbox';
            staff_status: 'active' | 'inactive';
            staff_type: 'operational' | 'sales_rep' | 'contractor' | 'intern';
            template_version_status:
                | 'draft'
                | 'published'
                | 'archived'
                | 'superseded';
            ticket_priority: 'low' | 'medium' | 'high';
            ticket_sender_type: 'partner' | 'admin';
            ticket_status: 'open' | 'in_progress' | 'resolved' | 'closed';
            two_factor_status: 'disabled' | 'enabled' | 'required';
            user_status: 'active' | 'pending' | 'suspended';
            user_type:
                | 'client'
                | 'partner'
                | 'employee'
                | 'sales_rep'
                | 'admin';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
    keyof Database,
    'public'
>];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
              DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
          DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
            DefaultSchema['Views'])
      ? (DefaultSchema['Tables'] &
            DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema['Tables']
        | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
        : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
      ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema['Enums']
        | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
      ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
      : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema['CompositeTypes']
        | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals;
    }
        ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
      ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
      : never;

export const Constants = {
    public: {
        Enums: {
            access_level: ['admin', 'manager', 'standard', 'limited'],
            admin_user_type: ['employee', 'sales_rep', 'admin'],
            agreement_lifecycle_status: [
                'draft',
                'published',
                'sent',
                'viewed',
                'partially_signed',
                'active',
                'expired',
                'terminated',
                'cancelled',
            ],
            agreement_status: [
                'draft',
                'sent',
                'viewed',
                'signed',
                'expired',
                'cancelled',
            ],
            app_role: ['client', 'partner', 'admin', 'sales_rep', 'employee'],
            asset_category: ['copy', 'creative', 'template'],
            attribution_type: ['deal_registration', 'last_touch'],
            calendar_status: ['active', 'inactive', 'archived'],
            calendar_type: [
                'individual',
                'interview',
                'partnership',
                'podcast',
                'shared',
            ],
            commission_status: [
                'pending',
                'earned',
                'payable',
                'paid',
                'clawed_back',
                'disputed',
            ],
            commission_type: ['percentage', 'flat_fee', 'tiered'],
            deal_stage: ['new', 'in_progress', 'closed_won', 'closed_lost'],
            employment_type: ['full_time', 'part_time', 'contractor', 'intern'],
            pay_type: ['hourly', 'salary', 'commission_only'],
            payment_status: ['captured', 'refunded', 'failed'],
            payout_method_type: ['ach', 'check'],
            payout_status: [
                'pending',
                'processing',
                'completed',
                'failed',
                'scheduled',
                'ready',
                'paid',
                'canceled',
            ],
            plan_status: ['draft', 'active', 'hidden', 'test'],
            product_access_duration: [
                'lifetime_access',
                'x_months_access',
                'active_subscription_only',
                'access_ends_upon_cancellation',
            ],
            product_billing_type: [
                'one_time',
                'monthly_subscription',
                'annual_subscription',
                'subscription_with_minimum_commitment',
                'usage_based',
            ],
            product_delivery_method: [
                'instant_download',
                'email_delivery',
                'account_access',
                'platform_access',
                'onboarding_call_required',
            ],
            product_license_type: [
                'personal_use_only',
                'internal_business_use',
                'commercial_use',
                'resale_prohibited',
            ],
            product_refund_policy: [
                'no_refunds',
                'refund_within_x_days',
                'conditional_refund',
            ],
            product_status: ['draft', 'active', 'hidden', 'test'],
            product_support_level: [
                'no_support',
                'email_support',
                'office_hours',
                'slack_chat_support',
                'dedicated_support',
            ],
            product_term_length: [
                'month_to_month',
                'three_month_minimum',
                'six_month_minimum',
                'fixed_term',
            ],
            product_time_to_value: [
                'immediate',
                'one_two_weeks',
                'thirty_days',
                'after_onboarding',
            ],
            referral_source: [
                'form_submit',
                'booked_call',
                'paid_checkout',
                'deal_registration',
            ],
            referral_status: [
                'new',
                'needs_approval',
                'qualified',
                'converted',
                'rejected',
                'accepted',
            ],
            signer_role: [
                'primary_signer',
                'secondary_signer',
                'company_rep',
                'witness',
                'approver',
            ],
            signing_field_type: [
                'signature',
                'initials',
                'date',
                'name',
                'title',
                'text',
                'checkbox',
            ],
            staff_status: ['active', 'inactive'],
            staff_type: ['operational', 'sales_rep', 'contractor', 'intern'],
            template_version_status: [
                'draft',
                'published',
                'archived',
                'superseded',
            ],
            ticket_priority: ['low', 'medium', 'high'],
            ticket_sender_type: ['partner', 'admin'],
            ticket_status: ['open', 'in_progress', 'resolved', 'closed'],
            two_factor_status: ['disabled', 'enabled', 'required'],
            user_status: ['active', 'pending', 'suspended'],
            user_type: ['client', 'partner', 'employee', 'sales_rep', 'admin'],
        },
    },
} as const;
