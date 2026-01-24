import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatErrorMessage } from '@/utils/errorMessages';
import type { Prospect } from './useProspectsList';

export function useUpdateProspect() {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'Not authenticated',
          variant: 'destructive',
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-prospect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, updates }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prospect');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: 'Prospect updated successfully',
      });
      return result.prospect;
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Failed to update prospect';
      const message = formatErrorMessage(rawMessage, 'prospect');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const createProspect = async (prospectData: Partial<Prospect>) => {
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'Not authenticated',
          variant: 'destructive',
        });
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-prospect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(prospectData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prospect');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: 'Prospect created successfully',
      });
      return result.prospect;
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : 'Failed to create prospect';
      const message = formatErrorMessage(rawMessage, 'prospect');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUpdating(false);
    }
  };

  const deleteProspect = async (id: string): Promise<boolean> => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'Not authenticated',
          variant: 'destructive',
        });
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-prospect`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prospect');
      }

      toast({
        title: 'Success',
        description: 'Prospect deleted successfully',
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete prospect';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { updateProspect, createProspect, deleteProspect, updating, deleting };
}