"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Quote, Code } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
    value: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
                },
            }),
        ],
        immediatelyRender: false,
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none p-3 min-h-[100px] outline-none break-words [&_a]:break-all",
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-input rounded-md bg-transparent">
            <div className="flex flex-wrap items-center gap-1 p-1 border-b border-input bg-muted/50">
                <Toggle
                    size="sm"
                    pressed={editor.isActive("bold")}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    disabled={disabled}
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("italic")}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    disabled={disabled}
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Separator orientation="vertical" className="h-6" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive("heading", { level: 2 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    disabled={disabled}
                >
                    <Heading1 className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("bulletList")}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    disabled={disabled}
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("orderedList")}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    disabled={disabled}
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
                <Separator orientation="vertical" className="h-6" />
                <Toggle
                    size="sm"
                    pressed={editor.isActive("blockquote")}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    disabled={disabled}
                >
                    <Quote className="h-4 w-4" />
                </Toggle>
            </div>
            <EditorContent editor={editor} className="disabled:opacity-50" />
        </div>
    );
}
