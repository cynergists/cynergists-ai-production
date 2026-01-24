import { Lock } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface MSAEditorStepProps {
  content: string;
  onChange: (content: string) => void;
  isLocked: boolean;
}

export default function MSAEditorStep({ content, onChange, isLocked }: MSAEditorStepProps) {
  return (
    <div className="flex h-full bg-white p-6 overflow-hidden">
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg border overflow-hidden">
        {isLocked && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-2 shrink-0">
            <Lock className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800 font-medium">
              Document is locked. Go back to Step 1 to edit content.
            </span>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLocked ? (
            <div 
              className="prose prose-sm max-w-none p-6 text-black pointer-events-none opacity-75"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <RichTextEditor
              content={content}
              onChange={onChange}
              placeholder="Enter your MSA content here..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
