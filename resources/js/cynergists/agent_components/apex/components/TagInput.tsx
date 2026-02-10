import { Badge } from '@/cynergists/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useState } from 'react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInput({ value, onChange, placeholder }: TagInputProps) {
    const [input, setInput] = useState('');

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInput('');
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
        }
        if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((tag, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            className="gap-1 pr-1"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(i)}
                                className="rounded-full p-0.5 hover:bg-foreground/10"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                    if (input.trim()) addTag(input);
                }}
                placeholder={placeholder}
                className="h-9 border-primary/15 bg-background text-sm"
            />
        </div>
    );
}
