/**
 * Unified Contact Type
 *
 * This is the single source of truth for customer-facing contact records
 * across Prospects, Clients, and Partners. Any changes to contact structure
 * should be made here and will affect all sections.
 */

export type ContactType = 'prospect' | 'client' | 'partner';

export type ContactStatus =
    // Common statuses
    | 'active'
    | 'pending'
    | 'suspended'
    | 'terminated'
    // Prospect-specific
    | 'cold'
    | 'warm'
    | 'hot'
    // Client-specific
    | 'past_due'
    | 'paused';

/**
 * Field tracking metadata for audit trail
 */
export interface FieldMetadata {
    updatedAt?: string | null;
    updatedBy?: string | null;
}

/**
 * Core contact fields shared across all contact types
 */
export interface ContactCore {
    id: string;
    contactType: ContactType;

    // Basic info - split name fields
    name: string; // Full name (legacy or computed)
    firstName?: string | null;
    lastName?: string | null;
    nickName?: string | null; // Display name for communications
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    title?: string | null;

    // Assignment
    salesRep?: string | null;
    partnerName?: string | null;
    tags: string[];

    // Status
    status: ContactStatus;

    // Notes
    notes?: string | null;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

/**
 * Extended fields for Prospects
 */
export interface ProspectFields {
    services?: string | null;
    estimatedValue?: number | null;
    leadSource?: string | null;
    interestedPlan?: string | null;
    sdrSet?: boolean | null;

    // Prospect dates
    estClosingDate?: string | null;
    lastMeeting?: string | null;
    lastOutreach?: string | null;
    nextOutreach?: string | null;
    nextMeeting?: string | null;
    lastActivity?: string | null;
    lastContact?: string | null;

    // GHL integration
    ghlContactId?: string | null;
    ghlSyncedAt?: string | null;

    // Field metadata
    nameMetadata?: FieldMetadata;
    emailMetadata?: FieldMetadata;
    phoneMetadata?: FieldMetadata;
    companyMetadata?: FieldMetadata;
    salesRepMetadata?: FieldMetadata;
    partnerNameMetadata?: FieldMetadata;
    tagsMetadata?: FieldMetadata;
    estClosingDateMetadata?: FieldMetadata;
    lastMeetingMetadata?: FieldMetadata;
    lastOutreachMetadata?: FieldMetadata;
    nextOutreachMetadata?: FieldMetadata;
    nextMeetingMetadata?: FieldMetadata;
    lastActivityMetadata?: FieldMetadata;
    lastContactMetadata?: FieldMetadata;
}

/**
 * Extended fields for Clients
 */
export interface ClientFields {
    // Payment info
    paymentType?: string | null;
    paymentAmount?: number | null;
    lastPaymentDate?: string | null;
    nextPaymentDueDate?: string | null;

    // Square integration
    squareCustomerId?: string | null;
    squareSubscriptionId?: string | null;
    squarePlanName?: string | null;
    squareSyncedAt?: string | null;

    // Activity dates
    lastActivity?: string | null;
    lastContact?: string | null;
    nextMeeting?: string | null;

    // GHL integration
    ghlContactId?: string | null;
    ghlSyncedAt?: string | null;

    // Field metadata
    nameMetadata?: FieldMetadata;
    emailMetadata?: FieldMetadata;
    phoneMetadata?: FieldMetadata;
    companyMetadata?: FieldMetadata;
    salesRepMetadata?: FieldMetadata;
    partnerNameMetadata?: FieldMetadata;
    tagsMetadata?: FieldMetadata;
    lastActivityMetadata?: FieldMetadata;
    lastContactMetadata?: FieldMetadata;
    nextMeetingMetadata?: FieldMetadata;
}

/**
 * Extended fields for Partners
 */
export interface PartnerFields {
    userId?: string;
}

/**
 * Unified Contact type - union of all contact types with their specific fields
 */
export type Contact = ContactCore &
    Partial<ProspectFields> &
    Partial<ClientFields> &
    Partial<PartnerFields>;

/**
 * Form data for creating/updating contacts
 */
export interface ContactFormData {
    // Core fields - split name
    name?: string; // Legacy full name or computed
    firstName?: string;
    lastName?: string;
    nickName?: string; // Preferred name for communications
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
    salesRep?: string;
    partnerName?: string;
    tags?: string[];
    status?: ContactStatus;
    notes?: string;

    // Prospect-specific
    services?: string;
    estimatedValue?: number;
    leadSource?: string;
    interestedPlan?: string;
    sdrSet?: boolean;
    estClosingDate?: string;
    lastMeeting?: string;
    lastOutreach?: string;
    nextOutreach?: string;
    nextMeeting?: string;
}

// ============================================================================
// Mapper functions to convert between database types and unified Contact type
// ============================================================================

import type { Client } from '@cy/hooks/useClientsList';
import type { Partner } from '@cy/hooks/usePartnersList';
import type { Prospect } from '@cy/hooks/useProspectsList';

/**
 * Convert a Prospect to unified Contact
 */
export function prospectToContact(prospect: Prospect): Contact {
    return {
        id: prospect.id,
        contactType: 'prospect',
        name: prospect.name,
        firstName: prospect.first_name,
        lastName: prospect.last_name,
        nickName: prospect.nick_name,
        email: prospect.email,
        phone: prospect.phone,
        company: prospect.company,
        salesRep: prospect.sales_rep,
        partnerName: prospect.partner_name,
        tags: prospect.tags || [],
        status: (prospect.status as ContactStatus) || 'cold',
        notes: prospect.notes,
        createdAt: prospect.created_at,
        updatedAt: prospect.updated_at,

        // Prospect-specific
        services: prospect.services,
        estimatedValue: prospect.estimated_value,
        leadSource: prospect.lead_source,
        interestedPlan: prospect.interested_plan,
        sdrSet: prospect.sdr_set,
        estClosingDate: prospect.est_closing_date,
        lastMeeting: prospect.last_meeting,
        lastOutreach: prospect.last_outreach,
        nextOutreach: prospect.next_outreach,
        nextMeeting: prospect.next_meeting,
        lastActivity: prospect.last_activity,
        lastContact: prospect.last_contact,
        ghlContactId: prospect.ghl_contact_id,
        ghlSyncedAt: prospect.ghl_synced_at,

        // Metadata
        nameMetadata: {
            updatedAt: prospect.name_updated_at,
            updatedBy: prospect.name_updated_by,
        },
        emailMetadata: {
            updatedAt: prospect.email_updated_at,
            updatedBy: prospect.email_updated_by,
        },
        phoneMetadata: {
            updatedAt: prospect.phone_updated_at,
            updatedBy: prospect.phone_updated_by,
        },
        companyMetadata: {
            updatedAt: prospect.company_updated_at,
            updatedBy: prospect.company_updated_by,
        },
        salesRepMetadata: {
            updatedAt: prospect.sales_rep_updated_at,
            updatedBy: prospect.sales_rep_updated_by,
        },
        partnerNameMetadata: {
            updatedAt: prospect.partner_name_updated_at,
            updatedBy: prospect.partner_name_updated_by,
        },
        tagsMetadata: {
            updatedAt: prospect.tags_updated_at,
            updatedBy: prospect.tags_updated_by,
        },
        estClosingDateMetadata: {
            updatedAt: prospect.est_closing_date_updated_at,
            updatedBy: prospect.est_closing_date_updated_by,
        },
        lastMeetingMetadata: {
            updatedAt: prospect.last_meeting_updated_at,
            updatedBy: prospect.last_meeting_updated_by,
        },
        lastOutreachMetadata: {
            updatedAt: prospect.last_outreach_updated_at,
            updatedBy: prospect.last_outreach_updated_by,
        },
        nextOutreachMetadata: {
            updatedAt: prospect.next_outreach_updated_at,
            updatedBy: prospect.next_outreach_updated_by,
        },
        nextMeetingMetadata: {
            updatedAt: prospect.next_meeting_updated_at,
            updatedBy: prospect.next_meeting_updated_by,
        },
        lastActivityMetadata: {
            updatedAt: prospect.last_activity_updated_at,
            updatedBy: prospect.last_activity_updated_by,
        },
        lastContactMetadata: {
            updatedAt: prospect.last_contact_updated_at,
            updatedBy: prospect.last_contact_updated_by,
        },
    };
}

/**
 * Convert a Client to unified Contact
 */
export function clientToContact(client: Client): Contact {
    return {
        id: client.id,
        contactType: 'client',
        name: client.name,
        firstName: client.first_name,
        lastName: client.last_name,
        nickName: client.nick_name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        salesRep: client.sales_rep,
        partnerName: client.partner_name,
        tags: client.tags || [],
        status: (client.status as ContactStatus) || 'active',
        createdAt: client.created_at,
        updatedAt: client.updated_at,

        // Client-specific
        paymentType: client.payment_type,
        paymentAmount: client.payment_amount,
        lastPaymentDate: client.last_payment_date,
        nextPaymentDueDate: client.next_payment_due_date,
        squareCustomerId: client.square_customer_id,
        squareSubscriptionId: client.square_subscription_id,
        squarePlanName: client.square_plan_name,
        squareSyncedAt: client.square_synced_at,
        lastActivity: client.last_activity,
        lastContact: client.last_contact,
        nextMeeting: client.next_meeting,
        ghlContactId: client.ghl_contact_id,
        ghlSyncedAt: client.ghl_synced_at,

        // Metadata
        nameMetadata: {
            updatedAt: client.name_updated_at,
            updatedBy: client.name_updated_by,
        },
        emailMetadata: {
            updatedAt: client.email_updated_at,
            updatedBy: client.email_updated_by,
        },
        phoneMetadata: {
            updatedAt: client.phone_updated_at,
            updatedBy: client.phone_updated_by,
        },
        companyMetadata: {
            updatedAt: client.company_updated_at,
            updatedBy: client.company_updated_by,
        },
        salesRepMetadata: {
            updatedAt: client.sales_rep_updated_at,
            updatedBy: client.sales_rep_updated_by,
        },
        partnerNameMetadata: {
            updatedAt: client.partner_name_updated_at,
            updatedBy: client.partner_name_updated_by,
        },
        tagsMetadata: {
            updatedAt: client.tags_updated_at,
            updatedBy: client.tags_updated_by,
        },
        lastActivityMetadata: {
            updatedAt: client.last_activity_updated_at,
            updatedBy: client.last_activity_updated_by,
        },
        lastContactMetadata: {
            updatedAt: client.last_contact_updated_at,
            updatedBy: client.last_contact_updated_by,
        },
        nextMeetingMetadata: {
            updatedAt: client.next_meeting_updated_at,
            updatedBy: client.next_meeting_updated_by,
        },
    };
}

/**
 * Convert a Partner to unified Contact
 */
export function partnerToContact(partner: Partner): Contact {
    const fullName =
        [partner.first_name, partner.last_name].filter(Boolean).join(' ') ||
        partner.email;

    return {
        id: partner.id,
        contactType: 'partner',
        name: fullName,
        firstName: partner.first_name,
        lastName: partner.last_name,
        nickName: null,
        email: partner.email,
        phone: partner.phone,
        company: partner.company_name,
        title: null,
        salesRep: null,
        partnerName: null,
        tags: [],
        status: partner.partner_status as ContactStatus,
        createdAt: partner.created_at,
        updatedAt: partner.updated_at,

        // Partner-specific
        userId: null,
    };
}

/**
 * Convert unified Contact back to Prospect update format
 */
export function contactToProspectUpdate(
    contact: Partial<ContactFormData>,
): Partial<Prospect> {
    const update: Record<string, unknown> = {};

    if (contact.name !== undefined) update.name = contact.name;
    if (contact.firstName !== undefined) update.first_name = contact.firstName;
    if (contact.lastName !== undefined) update.last_name = contact.lastName;
    if (contact.nickName !== undefined) update.nick_name = contact.nickName;
    if (contact.email !== undefined) update.email = contact.email;
    if (contact.phone !== undefined) update.phone = contact.phone;
    if (contact.company !== undefined) update.company = contact.company;
    if (contact.salesRep !== undefined) update.sales_rep = contact.salesRep;
    if (contact.partnerName !== undefined)
        update.partner_name = contact.partnerName;
    if (contact.tags !== undefined) update.tags = contact.tags;
    if (contact.status !== undefined) update.status = contact.status;
    if (contact.notes !== undefined) update.notes = contact.notes;
    if (contact.services !== undefined) update.services = contact.services;
    if (contact.estimatedValue !== undefined)
        update.estimated_value = contact.estimatedValue;
    if (contact.leadSource !== undefined)
        update.lead_source = contact.leadSource;
    if (contact.interestedPlan !== undefined)
        update.interested_plan = contact.interestedPlan;
    if (contact.sdrSet !== undefined) update.sdr_set = contact.sdrSet;
    if (contact.estClosingDate !== undefined)
        update.est_closing_date = contact.estClosingDate;
    if (contact.lastMeeting !== undefined)
        update.last_meeting = contact.lastMeeting;
    if (contact.lastOutreach !== undefined)
        update.last_outreach = contact.lastOutreach;
    if (contact.nextOutreach !== undefined)
        update.next_outreach = contact.nextOutreach;
    if (contact.nextMeeting !== undefined)
        update.next_meeting = contact.nextMeeting;

    return update as Partial<Prospect>;
}

/**
 * Convert unified Contact back to Client update format
 */
export function contactToClientUpdate(
    contact: Partial<ContactFormData>,
): Partial<Client> {
    const update: Record<string, unknown> = {};

    if (contact.name !== undefined) update.name = contact.name;
    if (contact.firstName !== undefined) update.first_name = contact.firstName;
    if (contact.lastName !== undefined) update.last_name = contact.lastName;
    if (contact.nickName !== undefined) update.nick_name = contact.nickName;
    if (contact.email !== undefined) update.email = contact.email;
    if (contact.phone !== undefined) update.phone = contact.phone;
    if (contact.company !== undefined) update.company = contact.company;
    if (contact.salesRep !== undefined) update.sales_rep = contact.salesRep;
    if (contact.partnerName !== undefined)
        update.partner_name = contact.partnerName;
    if (contact.tags !== undefined) update.tags = contact.tags;
    if (contact.status !== undefined) update.status = contact.status;

    return update as Partial<Client>;
}

/**
 * Convert unified Contact back to Partner update format
 */
export function contactToPartnerUpdate(
    contact: Partial<ContactFormData>,
): Record<string, unknown> {
    const update: Record<string, unknown> = {};

    if (contact.firstName !== undefined) update.first_name = contact.firstName;
    if (contact.lastName !== undefined) update.last_name = contact.lastName;
    if (contact.email !== undefined) update.email = contact.email;
    if (contact.phone !== undefined) update.phone = contact.phone;
    if (contact.company !== undefined) update.company_name = contact.company;
    if (contact.status !== undefined) update.partner_status = contact.status;

    return update;
}

/**
 * Get display name for a contact (uses nickName for communications if available)
 */
export function getContactDisplayName(
    contact: Contact,
    forCommunication = false,
): string {
    if (forCommunication && contact.nickName) {
        return contact.nickName;
    }
    if (contact.firstName || contact.lastName) {
        return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    }
    return contact.name;
}

/**
 * Get the preferred name for communications (nickName if set, otherwise firstName)
 */
export function getContactCommunicationName(contact: Contact): string {
    if (contact.nickName) {
        return contact.nickName;
    }
    if (contact.firstName) {
        return contact.firstName;
    }
    // Fall back to first word of full name
    return contact.name.split(' ')[0];
}

/**
 * Get status badge variant for a contact
 */
export function getStatusVariant(
    status: ContactStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'active':
            return 'default';
        case 'hot':
            return 'destructive';
        case 'warm':
            return 'default';
        case 'cold':
            return 'secondary';
        case 'pending':
        case 'paused':
            return 'outline';
        case 'past_due':
        case 'suspended':
        case 'terminated':
            return 'destructive';
        default:
            return 'secondary';
    }
}

/**
 * Get formatted status label
 */
export function getStatusLabel(status: ContactStatus): string {
    switch (status) {
        case 'past_due':
            return 'Past Due';
        default:
            return status.charAt(0).toUpperCase() + status.slice(1);
    }
}
