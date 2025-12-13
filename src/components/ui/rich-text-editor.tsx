"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Bold, Italic, ImageIcon, Loader2, List, ListOrdered, Table as TableIcon } from 'lucide-react';
import { Button } from './button';
import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [, forceUpdate] = useState({});

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: 'outline-none min-h-[150px] p-3'
            }
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
            forceUpdate({});
        },
        onSelectionUpdate: () => {
            forceUpdate({});
        },
        onTransaction: () => {
            forceUpdate({});
        },
    });

    const addImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const src = event.target?.result as string;
            editor?.chain().focus().setImage({ src }).run();
            setIsUploading(false);
        };
        reader.readAsDataURL(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!editor) {
        return null;
    }

    return (
        <div className={cn("border border-white/10 rounded-md bg-[#252525] overflow-hidden flex flex-col rich-text-content", className)}>
            <div className="flex flex-wrap items-center gap-1 p-1 border-b border-white/10 bg-[#2a2a2a]">
                {/* Headings */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white font-bold text-xs",
                        editor.isActive('heading', { level: 1 }) ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                >
                    H1
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white font-bold text-xs",
                        editor.isActive('heading', { level: 2 }) ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                >
                    H2
                </Button>

                <div className="w-[1px] h-4 bg-white/10 mx-1" />

                {/* Basic Format */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white",
                        editor.isActive('bold') ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white",
                        editor.isActive('italic') ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                >
                    <Italic className="w-4 h-4" />
                </Button>

                <div className="w-[1px] h-4 bg-white/10 mx-1" />

                {/* Lists */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white",
                        editor.isActive('bulletList') ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white",
                        editor.isActive('orderedList') ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>

                <div className="w-[1px] h-4 bg-white/10 mx-1" />

                {/* Table */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    className={cn(
                        "h-8 w-8 p-0 hover:bg-white/10 hover:text-white",
                        editor.isActive('table') ? "bg-white/10 text-white" : "text-gray-400"
                    )}
                >
                    <TableIcon className="w-4 h-4" />
                </Button>

                <div className="w-[1px] h-4 bg-white/10 mx-1" />

                {/* Image */}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addImage}
                    disabled={isUploading}
                    className="h-8 w-8 p-0 hover:bg-white/10 hover:text-white text-gray-400"
                >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
