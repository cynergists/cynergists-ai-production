import { Lock } from 'lucide-react';
import RichTextEditor from './RichTextEditor';

interface MSAEditorStepProps {
    content: string;
    onChange: (content: string) => void;
    isLocked: boolean;
}

export default function MSAEditorStep({
    content,
    onChange,
    isLocked,
}: MSAEditorStepProps) {
    return (
        <div className="flex h-full overflow-hidden bg-white p-6">
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-white shadow-lg">
                {isLocked && (
                    <div className="flex shrink-0 items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3">
                        <Lock className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                            Document is locked. Go back to Step 1 to edit
                            content.
                        </span>
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto">
                    {isLocked ? (
                        <div
                            className="prose prose-sm pointer-events-none max-w-none p-6 text-black opacity-75"
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
