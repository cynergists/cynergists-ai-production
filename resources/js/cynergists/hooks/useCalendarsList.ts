import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { callAdminApi } from '@/lib/admin-api';

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
      return callAdminApi<{ calendars: Calendar[]; total: number }>('get_calendars', undefined, {
        search,
        sortColumn,
        sortDirection,
        page,
        pageSize,
        filters,
      });
    },
  });
}

export function useCalendar(id: string | null) {
  return useQuery({
    queryKey: ['calendar', id],
    queryFn: async () => {
      if (!id) return null;
      return callAdminApi<Calendar>('get_calendar', { id });
    },
    enabled: !!id,
  });
}

export function useCreateCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calendarData: CalendarFormData) => {
      return callAdminApi('create_calendar', undefined, calendarData);
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
      return callAdminApi('update_calendar', { id }, updates);
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
      return callAdminApi('delete_calendar', { id });
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
      return callAdminApi<{ isUnique: boolean }>('check_calendar_slug', undefined, {
        slug,
        excludeId,
      });
    },
  });
}
