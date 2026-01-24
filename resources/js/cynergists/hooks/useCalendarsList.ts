import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Calendar {
  id: string;
  calendar_name: string;
  site_location: string | null;
  participants: string | null;
  owner: string | null;
  calendar_type: 'individual' | 'interview' | 'partnership' | 'podcast' | 'shared';
  slug: string;
  status: 'active' | 'inactive';
  ghl_calendar_id: string | null;
  ghl_embed_code: string | null;
  internal_notes: string | null;
  headline: string | null;
  paragraph: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarFormData {
  calendar_name: string;
  site_location?: string;
  participants?: string;
  owner?: string;
  calendar_type: Calendar['calendar_type'];
  slug: string;
  status?: Calendar['status'];
  ghl_calendar_id?: string;
  ghl_embed_code?: string;
  internal_notes?: string;
  headline?: string;
  paragraph?: string;
}

interface UseCalendarsListParams {
  search?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  filters?: {
    status?: string;
    calendar_type?: string;
  };
}

export function useCalendarsList(params: UseCalendarsListParams = {}) {
  const { search = '', sortColumn = 'calendar_name', sortDirection = 'asc', page = 1, pageSize = 50, filters = {} } = params;

  return useQuery({
    queryKey: ['calendars', { search, sortColumn, sortDirection, page, pageSize, filters }],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: {
          action: 'get_calendars',
          search,
          sortColumn,
          sortDirection,
          page,
          pageSize,
          filters,
        },
      });

      if (error) throw error;
      return data as { calendars: Calendar[]; total: number };
    },
  });
}

export function useCalendar(id: string | null) {
  return useQuery({
    queryKey: ['calendar', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action: 'get_calendar', id },
      });
      if (error) throw error;
      return data as Calendar;
    },
    enabled: !!id,
  });
}

export function useCreateCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calendarData: CalendarFormData) => {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action: 'create_calendar', ...calendarData },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
      toast.success('Calendar created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create calendar');
    },
  });
}

export function useUpdateCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarFormData> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action: 'update_calendar', id, ...updates },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
      toast.success('Calendar updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update calendar');
    },
  });
}

export function useDeleteCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action: 'delete_calendar', id },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendars'] });
      toast.success('Calendar deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete calendar');
    },
  });
}

export function useCheckSlugUnique() {
  return useMutation({
    mutationFn: async ({ slug, excludeId }: { slug: string; excludeId?: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-data', {
        body: { action: 'check_calendar_slug', slug, excludeId },
      });
      if (error) throw error;
      return data as { isUnique: boolean };
    },
  });
}
