/**
 * ClientContactCard
 * 
 * Wrapper component that uses the unified contact system for clients.
 * This maintains backwards compatibility with existing code while using
 * the shared Contact type and UnifiedContactCard component.
 */

import { useState, useCallback } from "react";
import { CreditCard } from "lucide-react";
import { UnifiedContactCard } from "@/components/admin/contacts/UnifiedContactCard";
import { useUpdateClient } from "@/hooks/useUpdateClient";
import { clientToContact, contactToClientUpdate } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { ClientPaymentsDialog } from "./ClientPaymentsDialog";
import type { Client } from "@/hooks/useClientsList";
import type { ContactFormData } from "@/types/contact";

interface ClientContactCardProps {
  client: Client;
  onClose: () => void;
  onUpdated: () => void;
}

export function ClientContactCard({ 
  client, 
  onClose, 
  onUpdated 
}: ClientContactCardProps) {
  const { updateClient, deleteClient, updating, deleting } = useUpdateClient();
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  
  // Convert client to unified contact type
  const contact = clientToContact(client);

  const handleSave = useCallback(async (formData: ContactFormData): Promise<boolean> => {
    // Convert unified form data to client format for update
    const updates = contactToClientUpdate(formData);
    const result = await updateClient(client.id, updates);
    if (result) {
      onUpdated();
      return true;
    }
    return false;
  }, [client.id, updateClient, onUpdated]);

  const handleDelete = useCallback(async (): Promise<boolean> => {
    const success = await deleteClient(client.id);
    if (success) {
      onClose();
      onUpdated();
    }
    return success;
  }, [client.id, deleteClient, onClose, onUpdated]);

  return (
    <>
      {/* Payments Button */}
      <div className="mt-4 mb-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsPaymentsOpen(true)}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          View Payments
        </Button>
      </div>

      <UnifiedContactCard
        contact={contact}
        contactType="client"
        onClose={onClose}
        onSave={handleSave}
        onDelete={handleDelete}
        isCreating={false}
        saving={updating}
        deleting={deleting}
      />

      {/* Payments Dialog */}
      <ClientPaymentsDialog
        isOpen={isPaymentsOpen}
        onClose={() => setIsPaymentsOpen(false)}
        clientId={client.id}
        clientName={client.name}
        clientEmail={client.email}
        squareCustomerId={client.square_customer_id}
      />
    </>
  );
}
