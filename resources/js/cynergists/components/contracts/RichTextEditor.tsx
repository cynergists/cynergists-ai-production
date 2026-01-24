import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useCallback } from "react";
import {
  Bold,
  AlignLeft,
  AlignCenter,
  List,
  ListOrdered,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Pilcrow,
  RemoveFormatting,
  ChevronDown,
  Type,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FONT_OPTIONS = [
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Great Vibes", value: "'Great Vibes', cursive" },
  { label: "Pacifico", value: "Pacifico, cursive" },
  { label: "Satisfy", value: "Satisfy, cursive" },
];

const MERGE_FIELDS = [
  { label: "Client Email Address", value: "{{CLIENT_EMAIL}}" },
  { label: "Client First Name", value: "{{CLIENT_FIRST_NAME}}" },
  { label: "Client Initials", value: "{{CLIENT_INITIALS}}" },
  { label: "Client Job Title", value: "{{CLIENT_TITLE}}" },
  { label: "Client Last Name", value: "{{CLIENT_LAST_NAME}}" },
  { label: "Client Phone Number", value: "{{CLIENT_PHONE}}" },
  { label: "Client Signature", value: "{{CLIENT_SIGNATURE}}" },
  { label: "Company City", value: "{{COMPANY_CITY}}" },
  { label: "Company Name", value: "{{COMPANY_NAME}}" },
  { label: "Company State", value: "{{COMPANY_STATE}}" },
  { label: "Company Street Address", value: "{{COMPANY_STREET}}" },
  { label: "Company Zip Code", value: "{{COMPANY_ZIP}}" },
  { label: "Today's Date", value: "{{TODAYS_DATE}}" },
];

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, tooltip, children }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={isActive ? "secondary" : "ghost"}
          size="sm"
          className={`h-8 w-8 p-0 ${isActive ? "bg-gray-200 text-gray-900" : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"} ${disabled ? "opacity-40" : ""}`}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

interface EditorToolbarProps {
  editor: Editor;
  onSetLink: () => void;
}

function EditorToolbar({ editor, onSetLink }: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-gray-50 sticky top-0 z-10">
      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        tooltip="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        tooltip="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-300" />

      {/* Paragraph Styles - H1 (34px), H2 (21px), Paragraph (16px) */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        tooltip="Document Title - H1 (34px)"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        tooltip="Section Heading - H2 (21px)"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph") && !editor.isActive("heading")}
        tooltip="Paragraph (16px)"
      >
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-300" />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        tooltip="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        tooltip="Clear formatting"
      >
        <RemoveFormatting className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-300" />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        tooltip="Align left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        tooltip="Align center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-300" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        tooltip="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        tooltip="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-300" />

      {/* Link Button */}
      <ToolbarButton
        onClick={onSetLink}
        isActive={editor.isActive("link")}
        tooltip="Insert/Edit Link"
      >
        <LinkIcon className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="h-6 mx-1 bg-gray-300" />

      {/* Font Picker Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1"
          >
            <Type className="h-4 w-4" />
            Font
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white z-50 shadow-lg border text-gray-900">
          {FONT_OPTIONS.map((font) => (
            <DropdownMenuItem
              key={font.value}
              onClick={() => editor.chain().focus().setFontFamily(font.value).run()}
              className="cursor-pointer text-gray-900 hover:bg-gray-100"
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetFontFamily().run()}
            className="cursor-pointer text-gray-500 hover:bg-gray-100 border-t"
          >
            Reset to default
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Insert Merge Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 gap-1"
          >
            Insert Merge
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white z-50 shadow-lg border text-gray-900">
          {MERGE_FIELDS.map((field) => (
            <DropdownMenuItem
              key={field.value}
              onClick={() => editor.chain().focus().insertContent(field.value).run()}
              className="cursor-pointer text-gray-900 hover:bg-gray-100"
            >
              {field.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const isInternalChange = useRef(false);
  const initialContentSet = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 no-underline hover:underline cursor-pointer",
          style: "color: #2563eb; text-decoration: none;",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] p-6 focus:outline-none text-black agreement-content",
        style: "font-family: Roboto, sans-serif;",
      },
    },
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      const html = editor.getHTML();
      onChange(html);
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl || "https://");

    // cancelled
    if (url === null) {
      return;
    }

    // empty - remove link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // set link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  // Only update content from props on initial load or when content changes externally
  useEffect(() => {
    if (!editor) return;
    
    // Skip if this change came from the editor itself
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    
    // Set initial content once
    if (!initialContentSet.current && content) {
      editor.commands.setContent(content, { emitUpdate: false });
      initialContentSet.current = true;
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border-0 flex flex-col h-full min-h-0">
      {/* Agreement Typography Styles - Web View & PDF Export */}
      <style>{`
        /* Base font family */
        .ProseMirror,
        .agreement-content {
          font-family: 'Roboto', sans-serif;
        }
        
        /* H1 - Document Title: 34px for web */
        .ProseMirror h1 {
          font-size: 34px;
          font-weight: 700;
          line-height: 1.6;
          margin-top: 0;
          margin-bottom: 0;
          color: inherit;
        }
        
        /* H2 - Section Heading: 21px for web */
        .ProseMirror h2 {
          font-size: 21px;
          font-weight: 600;
          line-height: 1.6;
          margin-top: 0;
          margin-bottom: 0;
          color: inherit;
        }
        
        /* Paragraph: 16px for web */
        .ProseMirror p {
          font-size: 16px;
          font-weight: 400;
          line-height: 1.6;
          margin-top: 0;
          margin-bottom: 0;
          color: inherit;
        }
        
        /* Empty paragraphs should still take up space for line breaks */
        .ProseMirror p:empty,
        .ProseMirror p br:only-child {
          min-height: 1.6em;
        }
        
        .ProseMirror p:has(br:only-child) {
          min-height: 1.6em;
        }
        
        /* Lists inherit paragraph styling */
        .ProseMirror ul {
          font-size: 16px;
          line-height: 1.6;
          margin-top: 0;
          margin-bottom: 0;
          padding-left: 24px;
          list-style-type: disc;
        }
        
        .ProseMirror ol {
          font-size: 16px;
          line-height: 1.6;
          margin-top: 0;
          margin-bottom: 0;
          padding-left: 24px;
          list-style-type: decimal;
        }
        
        .ProseMirror li {
          margin-bottom: 0;
          display: list-item;
        }
        
        .ProseMirror li::marker {
          color: inherit;
        }
        
        .ProseMirror li p {
          margin-bottom: 0;
        }
        
        /* Hide horizontal rules/dividers */
        .ProseMirror hr {
          display: none;
        }
        
        /* Link styles - Blue with no underline */
        .ProseMirror a {
          color: #2563eb;
          text-decoration: none;
        }
        
        .ProseMirror a:hover {
          text-decoration: underline;
        }
        
        /* PDF Print Styles */
        @media print {
          .ProseMirror,
          .agreement-content {
            font-family: 'Roboto', sans-serif;
          }
          
          /* H1 - Document Title: 19pt for PDF */
          .ProseMirror h1 {
            font-size: 19pt;
            line-height: 1.2;
            margin-top: 0;
            margin-bottom: 0;
          }
          
          /* H2 - Section Heading: 13.5pt for PDF */
          .ProseMirror h2 {
            font-size: 13.5pt;
            line-height: 1.2;
            margin-top: 0;
            margin-bottom: 0;
          }
          
          /* Paragraph: 12pt for PDF */
          .ProseMirror p {
            font-size: 12pt;
            line-height: 1.2;
            margin-top: 0;
            margin-bottom: 0;
          }
          
          .ProseMirror ul,
          .ProseMirror ol {
            font-size: 12pt;
            line-height: 1.2;
            margin-top: 0;
            margin-bottom: 0;
          }
          
          .ProseMirror li {
            margin-bottom: 0;
          }
        }
      `}</style>
      <div className="shrink-0 sticky top-0 z-10 bg-gray-50">
        <EditorToolbar editor={editor} onSetLink={setLink} />
      </div>
      <div className="flex-1 min-h-0 overflow-auto bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
