/**
 * ProspectContactCard
 * 
 * Wrapper component that uses the unified contact system for prospects.
 * This maintains backwards compatibility with existing code while using
 * the shared Contact type and UnifiedContactCard component.
 */

import { useCallback } from "react";
import { UnifiedContactCard } from "@/components/admin/contacts/UnifiedContactCard";
import { useUpdateProspect } from "@/hooks/useUpdateProspect";
import { prospectToContact, contactToProspectUpdate } from "@/types/contact";
import type { Prospect } from "@/hooks/useProspectsList";
import type { ContactFormData } from "@/types/contact";

interface ProspectContactCardProps {
  prospect: Prospect | null;
  onClose: () => void;
  onUpdated: () => void;
  isCreating?: boolean;
}

export function ProspectContactCard({ 
  prospect, 
  onClose, 
  onUpdated, 
  isCreating = false 
}: ProspectContactCardProps) {
  const { updateProspect, createProspect, deleteProspect, updating, deleting } = useUpdateProspect();
  
  // Convert prospect to unified contact type
  const contact = prospect ? prospectToContact(prospect) : null;

  const handleSave = useCallback(async (formData: ContactFormData): Promise<boolean> => {
    if (isCreating) {
      // Convert unified form data to prospect format for creation
      const prospectData = contactToProspectUpdate(formData);
      const result = await createProspect(prospectData);
      if (result) {
        onUpdated();
        return true;
      }
      return false;
    }

    if (!prospect) return false;

    // Convert unified form data to prospect format for update
    const updates = contactToProspectUpdate(formData);
    const result = await updateProspect(prospect.id, updates);
    if (result) {
      onUpdated();
      return true;
    }
    return false;
  }, [isCreating, prospect, createProspect, updateProspect, onUpdated]);

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!prospect) return false;
    const success = await deleteProspect(prospect.id);
    if (success) {
      onClose();
      onUpdated();
    }
    return success;
  }, [prospect, deleteProspect, onClose, onUpdated]);

  return (
    <UnifiedContactCard
      contact={contact}
      contactType="prospect"
      onClose={onClose}
      onSave={handleSave}
      onDelete={!isCreating ? handleDelete : undefined}
      isCreating={isCreating}
      saving={updating}
      deleting={deleting}
    />
  );
}
