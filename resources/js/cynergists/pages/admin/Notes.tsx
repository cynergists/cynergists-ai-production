import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminNotes, useCreateNote, useUpdateNote, useDeleteNote, type AdminNote } from "@/hooks/useAdminQueries";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, StickyNote, GitCommit, Lightbulb } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminNotes() {
  const { toast } = useToast();
  const { data: notes = [], isLoading } = useAdminNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AdminNote | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    note_type: "note",
  });

  const isMutating = createNote.isPending || updateNote.isPending || deleteNote.isPending;

  const resetForm = () => {
    setFormData({ title: "", content: "", note_type: "note" });
    setEditingNote(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (note: AdminNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content || "",
      note_type: note.note_type || "note",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingNote) {
        await updateNote.mutateAsync({ id: editingNote.id, ...formData });
      } else {
        await createNote.mutateAsync(formData);
      }
      
      toast({
        title: editingNote ? "Note Updated" : "Note Created",
        description: `"${formData.title}" has been saved.`,
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (note: AdminNote) => {
    if (!confirm(`Are you sure you want to delete "${note.title}"?`)) return;

    try {
      await deleteNote.mutateAsync(note.id);
      toast({
        title: "Note Deleted",
        description: `"${note.title}" has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getNoteIcon = (type: string | null) => {
    switch (type) {
      case "changelog":
        return <GitCommit className="h-4 w-4" />;
      case "idea":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <StickyNote className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string | null) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      note: "secondary",
      changelog: "default",
      idea: "outline",
    };
    return (
      <Badge variant={variants[type || "note"] || "secondary"} className="gap-1">
        {getNoteIcon(type)}
        {type || "note"}
      </Badge>
    );
  };

  return (
    <>
      <Helmet>
        <title>Notes | Admin</title>
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notes & Changelog</h1>
            <p className="text-muted-foreground">Track ideas, changes, and notes for your site</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNote ? "Edit Note" : "Create New Note"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note_type">Type</Label>
                  <Select
                    value={formData.note_type}
                    onValueChange={(value) => setFormData({ ...formData, note_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="changelog">Changelog</SelectItem>
                      <SelectItem value="idea">Idea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isMutating}>
                    {isMutating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingNote ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && notes.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No notes yet. Click "Add Note" to create your first note.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(note)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(note)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(note.note_type)}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {note.content || "No content"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
