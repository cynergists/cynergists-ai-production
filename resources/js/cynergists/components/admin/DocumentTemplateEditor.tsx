import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DocumentSection {
  id?: string;
  section_key: string;
  section_number: number;
  section_title: string;
  section_summary: string | null;
  requires_initials: boolean;
  display_order: number;
}

interface DocumentTemplate {
  id: string;
  document_type: "msa" | "terms" | "privacy";
  title: string;
  content: string;
  version: number;
  is_active: boolean;
  document_template_sections?: DocumentSection[];
}

interface DocumentTemplateEditorProps {
  documentType: "msa" | "terms" | "privacy";
  template: DocumentTemplate | null;
  defaultContent: string;
  onSave: (data: { title: string; content: string; sections?: DocumentSection[] }) => void;
  onCancel: () => void;
}

const documentTypeLabels: Record<string, string> = {
  msa: "Master Service Agreement",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

export default function DocumentTemplateEditor({
  documentType,
  template,
  defaultContent,
  onSave,
  onCancel,
}: DocumentTemplateEditorProps) {
  const [title, setTitle] = useState(template?.title || documentTypeLabels[documentType] || "Document");
  const [content, setContent] = useState(template?.content || defaultContent);
  const [sections, setSections] = useState<DocumentSection[]>(
    template?.document_template_sections || []
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setContent(template.content);
      setSections(template.document_template_sections || []);
    } else {
      setTitle(documentTypeLabels[documentType] || "Document");
      setContent(defaultContent);
      setSections([]);
    }
  }, [template, documentType, defaultContent]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ title, content, sections });
    } finally {
      setIsSaving(false);
    }
  };

  const addSection = () => {
    const newSection: DocumentSection = {
      section_key: `section_${Date.now()}`,
      section_number: sections.length + 1,
      section_title: `Section ${sections.length + 1}`,
      section_summary: "",
      requires_initials: false,
      display_order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (index: number, updates: Partial<DocumentSection>) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], ...updates };
    setSections(updated);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    
    // Update display orders
    updated.forEach((section, i) => {
      section.display_order = i;
      section.section_number = i + 1;
    });
    
    setSections(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {template ? "Edit" : "Create"} {documentTypeLabels[documentType]}
            </h1>
            {template && (
              <p className="text-sm text-muted-foreground">Version {template.version}</p>
            )}
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Document Content</TabsTrigger>
          <TabsTrigger value="sections">Signature Sections</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Document Content (Markdown)</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter document content in Markdown format"
                  className="min-h-[500px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Signature Sections</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define sections that require client initials or signature
                  </p>
                </div>
                <Button onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No signature sections defined</p>
                  <p className="text-sm mt-1">
                    Add sections that require client initials during the signing process
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <Card key={section.section_key} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-1 pt-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(index, "up")}
                              disabled={index === 0}
                              className="h-6 w-6 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(index, "down")}
                              disabled={index === sections.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Section Number</Label>
                                <Input
                                  type="number"
                                  value={section.section_number}
                                  onChange={(e) =>
                                    updateSection(index, {
                                      section_number: parseInt(e.target.value) || 1,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Section Key</Label>
                                <Input
                                  value={section.section_key}
                                  onChange={(e) =>
                                    updateSection(index, { section_key: e.target.value })
                                  }
                                  placeholder="e.g., compensation"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Section Title</Label>
                              <Input
                                value={section.section_title}
                                onChange={(e) =>
                                  updateSection(index, { section_title: e.target.value })
                                }
                                placeholder="e.g., Compensation Terms"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Summary (shown to client)</Label>
                              <Textarea
                                value={section.section_summary || ""}
                                onChange={(e) =>
                                  updateSection(index, { section_summary: e.target.value })
                                }
                                placeholder="Brief description of what the client is agreeing to"
                                className="min-h-[80px]"
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={section.requires_initials}
                                  onCheckedChange={(checked) =>
                                    updateSection(index, { requires_initials: checked })
                                  }
                                />
                                <Label>Requires Initials</Label>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSection(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <h1>{title}</h1>
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
              {sections.length > 0 && (
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Signature Sections Preview</h3>
                  <div className="space-y-4">
                    {sections
                      .filter((s) => s.requires_initials)
                      .map((section) => (
                        <div
                          key={section.section_key}
                          className="border rounded-lg p-4 bg-muted/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold">Section {section.section_number}:</span>
                            <span>{section.section_title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{section.section_summary}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <div className="w-16 h-10 border-2 border-dashed rounded flex items-center justify-center text-xs text-muted-foreground">
                              Initials
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
