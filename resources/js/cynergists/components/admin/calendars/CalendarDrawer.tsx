import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@cy/components/ui/sheet';
import { Button } from '@cy/components/ui/button';
import { Input } from '@cy/components/ui/input';
import { Label } from '@cy/components/ui/label';
import { Textarea } from '@cy/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@cy/components/ui/select';
import { Badge } from '@cy/components/ui/badge';
import { Separator } from '@cy/components/ui/separator';
import { Copy, Check, ExternalLink, Calendar, Settings, Info, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Calendar as CalendarType, CalendarFormData } from '@cy/hooks/useCalendarsList';
import { useAutoSave } from '@cy/hooks/useAutoSave';
import { applyHeadlineGradient, stripHeadlineGradient } from '@cy/utils/headlineGradient';

interface CalendarDrawerProps {
  calendar: CalendarType | null;
  open: boolean;
  onClose: () => void;
  onSave?: (data: CalendarFormData) => void;
  onUpdate?: (id: string, data: Partial<CalendarFormData>) => void;
  onDelete?: (id: string) => void;
}

const CALENDAR_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'shared', label: 'Shared' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const DEFAULT_PARAGRAPH = 'Growth should not depend on heroics. Cynergists helps your team move faster, stay aligned, and get more done without the constant friction. No pitch. Just a quick chat to see if you are a fit.';

export function CalendarDrawer({ calendar, open, onClose, onSave, onUpdate, onDelete }: CalendarDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<Partial<CalendarFormData>>({
    calendar_name: '',
    site_location: '',
    participants: '',
    calendar_type: 'individual',
    status: 'active',
    slug: '',
    owner: '',
    headline: '',
    paragraph: DEFAULT_PARAGRAPH,
    ghl_calendar_id: '',
    ghl_embed_code: '',
    internal_notes: '',
  });

  useEffect(() => {
    if (calendar) {
      setFormData({
        calendar_name: calendar.calendar_name,
        site_location: calendar.site_location || '',
        participants: calendar.participants || '',
        calendar_type: calendar.calendar_type,
        status: calendar.status,
        slug: calendar.slug,
        owner: calendar.owner || '',
        headline: stripHeadlineGradient(calendar.headline || ''),
        paragraph: calendar.paragraph || DEFAULT_PARAGRAPH,
        ghl_calendar_id: calendar.ghl_calendar_id || '',
        ghl_embed_code: calendar.ghl_embed_code || '',
        internal_notes: calendar.internal_notes || '',
      });
    } else {
      setFormData({
        calendar_name: '',
        site_location: '',
        participants: '',
        calendar_type: 'individual',
        status: 'active',
        slug: '',
        owner: '',
        headline: '',
        paragraph: DEFAULT_PARAGRAPH,
        ghl_calendar_id: '',
        ghl_embed_code: '',
        internal_notes: '',
      });
    }
  }, [calendar]);

  const handleChange = (field: keyof CalendarFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Memoize initial data for autosave comparison
  const initialFormData = useMemo(() => {
    if (!calendar) return null;
    return {
      calendar_name: calendar.calendar_name,
      site_location: calendar.site_location || '',
      participants: calendar.participants || '',
      calendar_type: calendar.calendar_type,
      status: calendar.status,
      slug: calendar.slug,
      owner: calendar.owner || '',
      headline: calendar.headline || '',
      paragraph: calendar.paragraph || DEFAULT_PARAGRAPH,
      ghl_calendar_id: calendar.ghl_calendar_id || '',
      ghl_embed_code: calendar.ghl_embed_code || '',
      internal_notes: calendar.internal_notes || '',
    };
  }, [calendar]);

  // Autosave handler - applies gradient styling to headline before saving
  const handleAutoSave = useCallback(async (data: Partial<CalendarFormData>): Promise<boolean> => {
    if (!calendar || !onUpdate) return false;
    if (!data.calendar_name || !data.slug) {
      return false; // Don't save if required fields are missing
    }
    try {
      // Apply gradient styling to headline before saving
      const dataToSave = {
        ...data,
        headline: data.headline ? applyHeadlineGradient(data.headline) : data.headline,
      };
      onUpdate(calendar.id, dataToSave);
      return true;
    } catch {
      return false;
    }
  }, [calendar, onUpdate]);

  // Enable autosave only when editing existing calendar
  const { isSaving } = useAutoSave({
    data: formData as Record<string, unknown>,
    onSave: handleAutoSave as (data: Record<string, unknown>) => Promise<boolean>,
    enabled: !!calendar && open,
    initialData: initialFormData as Record<string, unknown> | undefined,
  });

  const handleDelete = () => {
    if (calendar && onDelete) {
      onDelete(calendar.id);
      onClose();
    }
  };

  const copyToClipboard = async () => {
    const url = `https://cynergists.com/${formData.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const publicUrl = `https://cynergists.com/${formData.slug}`;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {calendar ? 'Edit Calendar' : 'New Calendar'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Section A: Calendar Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Calendar Details
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="calendar_name">Calendar Name *</Label>
                <Input
                  id="calendar_name"
                  value={formData.calendar_name}
                  onChange={(e) => handleChange('calendar_name', e.target.value)}
                  placeholder="e.g., Ryan's Strategy Call"
                />
              </div>

              <div>
                <Label htmlFor="site_location">Website Location</Label>
                <Input
                  id="site_location"
                  value={formData.site_location}
                  onChange={(e) => handleChange('site_location', e.target.value)}
                  placeholder="e.g., Colorado Springs, CO"
                />
              </div>

              <div>
                <Label htmlFor="participants">Participants</Label>
                <Input
                  id="participants"
                  value={formData.participants}
                  onChange={(e) => handleChange('participants', e.target.value)}
                  placeholder="e.g., Ryan + Chris"
                />
              </div>

              <div>
                <Label htmlFor="calendar_type">Calendar Type</Label>
                <div className="flex gap-2 mt-1.5">
                  {CALENDAR_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChange('calendar_type', opt.value as CalendarType['calendar_type'])}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.calendar_type === opt.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as CalendarType['status'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <Badge variant={opt.value === 'active' ? 'default' : 'secondary'}>
                          {opt.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g., meetryan"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Changing the slug will change the public URL
                </p>
              </div>

              <div>
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => handleChange('owner', e.target.value)}
                  placeholder="e.g., Ryan"
                />
              </div>

              <div>
                <Label>Public URL</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={publicUrl} readOnly className="font-mono text-sm bg-muted" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => handleChange('headline', e.target.value)}
                  placeholder="e.g., Lead Like a Hero, Leave the Heavy Lifting to Us"
                />
              </div>

              <div>
                <Label htmlFor="paragraph">Paragraph</Label>
                <Textarea
                  id="paragraph"
                  value={formData.paragraph}
                  onChange={(e) => handleChange('paragraph', e.target.value)}
                  placeholder="Enter landing page paragraph..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section B: GHL Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Settings className="h-4 w-4" />
              GHL Configuration
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="ghl_calendar_id">GHL Calendar ID</Label>
                <Input
                  id="ghl_calendar_id"
                  value={formData.ghl_calendar_id}
                  onChange={(e) => handleChange('ghl_calendar_id', e.target.value)}
                  placeholder="Enter GHL Calendar ID"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="ghl_embed_code">GHL Embed Code</Label>
                <Textarea
                  id="ghl_embed_code"
                  value={formData.ghl_embed_code}
                  onChange={(e) => handleChange('ghl_embed_code', e.target.value)}
                  placeholder="Paste your GHL calendar embed code here..."
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Section C: Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Info className="h-4 w-4" />
              Notes
            </h3>

            <div>
              <Label htmlFor="internal_notes">Internal Notes</Label>
              <Textarea
                id="internal_notes"
                value={formData.internal_notes}
                onChange={(e) => handleChange('internal_notes', e.target.value)}
                placeholder="Internal notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Section D: System Metadata */}
          {calendar && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">System Metadata</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{format(new Date(calendar.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{format(new Date(calendar.updated_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions - Full width Delete and Close buttons */}
          <div className="flex items-center gap-2">
            {calendar && onDelete && (
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
                {isSaving && <Loader2 className="h-3 w-3 ml-2 animate-spin" />}
              </Button>
            )}
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
