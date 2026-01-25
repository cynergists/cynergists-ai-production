import { useState, useCallback } from 'react';
import { supabase } from '@cy/integrations/supabase/client';
import { useToast } from '@cy/hooks/use-toast';
import { formatErrorMessage } from '@cy/utils/errorMessages';
import type { Client } from './useClientsList';

interface UseUpdateClientResult {
  updateClient: (clientId: string, updates: Partial<Client>) => Promise<Client | null>;
  deleteClient: (clientId: string) => Promise<boolean>;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

export function useUpdateClient(): UseUpdateClientResult {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>): Promise<Client | null> => {
    setUpdating(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return null;
      }

      const { data, error: fnError } = await supabase.functions.invoke('update-client', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { clientId, updates },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Client updated',
        description: 'Changes have been saved',
      });

      return data.client;

    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Failed to update client';
      const message = formatErrorMessage(rawMessage, 'client');
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUpdating(false);
    }
  }, [toast]);

  const deleteClient = useCallback(async (clientId: string): Promise<boolean> => {
    setDeleting(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        return false;
      }

      const { data, error: fnError } = await supabase.functions.invoke('delete-client', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { clientId },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Client deleted',
        description: 'Client has been removed',
      });

      return true;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setDeleting(false);
    }
  }, [toast]);

  return {
    updateClient,
    deleteClient,
    updating,
    deleting,
    error,
  };
}
