import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@cy/components/ui/dialog';
import { Button } from '@cy/components/ui/button';
import { Input } from '@cy/components/ui/input';
import { Label } from '@cy/components/ui/label';
import { Textarea } from '@cy/components/ui/textarea';

import { toast } from 'sonner';
import { useCheckSlugUnique, type CalendarFormData } from '@cy/hooks/useCalendarsList';
import { applyHeadlineGradient } from '@cy/utils/headlineGradient';

interface CreateCalendarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarFormData) => void;
}

const CALENDAR_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'shared', label: 'Shared' },
];

export function CreateCalendarForm({ open, onClose, onSubmit }: CreateCalendarFormProps) {
  const checkSlug = useCheckSlugUnique();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    calendar_name: '',
    calendar_type: 'individual' as const,
    site_location: '',
    participants: '',
    slug: '',
    headline: 'Lead Like a Hero, Leave the Heavy Lifting to Us',
    paragraph: 'Growth should not depend on heroics. Cynergists helps your team move faster, stay aligned, and get more done without the constant friction. No pitch. Just a quick chat to see if you are a fit.',
    ghl_embed_code: '',
  });
  const [slugError, setSlugError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'slug') {
      setSlugError(null);
    }
  };

  const validateSlug = async () => {
    if (!formData.slug) return;
    
    try {
      const result = await checkSlug.mutateAsync({ slug: formData.slug });
      if (!result.isUnique) {
        setSlugError('This slug is already in use');
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    }
  };

  const handleSubmit = () => {
    if (!formData.calendar_name) {
      toast.error('Calendar name is required');
      return;
    }
    if (!formData.slug) {
      toast.error('Slug is required');
      return;
    }
    if (slugError) {
      toast.error('Please fix the slug error');
      return;
    }

    const calendarData: CalendarFormData = {
      calendar_name: formData.calendar_name,
      owner: `${formData.first_name} ${formData.last_name}`.trim(),
      calendar_type: formData.calendar_type,
      site_location: formData.site_location || undefined,
      participants: formData.participants || undefined,
      slug: formData.slug,
      status: 'active',
      ghl_embed_code: formData.ghl_embed_code,
      headline: formData.headline ? applyHeadlineGradient(formData.headline) : undefined,
      paragraph: formData.paragraph || undefined,
    };

    onSubmit(calendarData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      calendar_name: '',
      calendar_type: 'individual',
      site_location: '',
      participants: '',
      slug: '',
      headline: 'Lead Like a Hero, Leave the Heavy Lifting to Us',
      paragraph: 'Growth should not depend on heroics. Cynergists helps your team move faster, stay aligned, and get more done without the constant friction. No pitch. Just a quick chat to see if you are a fit.',
      ghl_embed_code: '',
    });
    setSlugError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Calendar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Row 1: Calendar Name | Calendar Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calendar_name">Calendar Name *</Label>
              <Input
                id="calendar_name"
                value={formData.calendar_name}
                onChange={(e) => handleChange('calendar_name', e.target.value)}
                placeholder="e.g., Strategy Call with Ryan"
              />
            </div>
            <div>
              <Label htmlFor="calendar_type">Calendar Type</Label>
              <div className="flex gap-2 mt-1.5">
                {CALENDAR_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange('calendar_type', opt.value)}
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
          </div>

          {/* Row 2: Owner First Name | Owner Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Owner First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Owner Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Row 3: Site Location | Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site_location">Site Location</Label>
              <Input
                id="site_location"
                value={formData.site_location}
                onChange={(e) => handleChange('site_location', e.target.value)}
                placeholder="e.g., Header, Footer, Contact Page"
              />
            </div>
            <div>
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                value={formData.participants}
                onChange={(e) => handleChange('participants', e.target.value)}
                placeholder="e.g., Ryan, Chris"
              />
            </div>
          </div>

          {/* Row 4: Slug (full width) */}
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              onBlur={validateSlug}
              placeholder="e.g., meetryan"
              className={`font-mono ${slugError ? 'border-destructive' : ''}`}
            />
            {slugError && (
              <p className="text-xs text-destructive mt-1">{slugError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              URL: https://cynergists.com/{formData.slug || 'your-slug'}
            </p>
          </div>

          {/* Row 4: Headline (full width) */}
          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="Lead Like a Hero, Leave the Heavy Lifting to Us"
            />
          </div>

          {/* Row 5: Paragraph (full width, textarea) */}
          <div>
            <Label htmlFor="paragraph">Paragraph</Label>
            <Textarea
              id="paragraph"
              value={formData.paragraph}
              onChange={(e) => handleChange('paragraph', e.target.value)}
              placeholder="Growth should not depend on heroics..."
              rows={3}
            />
          </div>

          {/* Row 6: GHL Embed Code */}
          <div>
            <Label htmlFor="ghl_embed_code">GHL Embed Code</Label>
            <Textarea
              id="ghl_embed_code"
              value={formData.ghl_embed_code}
              onChange={(e) => handleChange('ghl_embed_code', e.target.value)}
              placeholder="Paste your GHL calendar embed code here..."
              rows={4}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Calendar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
