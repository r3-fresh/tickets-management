"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading1, Heading2, Quote, Code, Palette } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
    value: string;
    onChange?: (content: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

const EDITOR_EXTENSIONS = [
    StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
        },
        link: false,
    }),
    TextStyle,
    Color,
    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-foreground underline cursor-pointer hover:text-foreground/80',
        },
    }),
];

const COLOR_PALETTE = ['#000000', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#64748b'];

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: EDITOR_EXTENSIONS,
        immediatelyRender: false,
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none p-3 min-h-[60px] outline-none break-words [&_a]:break-all [&_p]:my-1",
            },
        },
    });

    // Reset editor content when value prop changes to empty (e.g. after comment submission)
    useEffect(() => {
        if (editor && value === "" && editor.getHTML() !== "<p></p>") {
            editor.commands.setContent("");
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={`border border-border rounded-md bg-white dark:bg-input overflow-hidden ${disabled ? 'border-none bg-transparent dark:bg-transparent' : ''}`}>
            {!disabled && (
                <div className="flex flex-wrap items-center gap-1 p-1 border-b border-input bg-muted/50">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("bold")}
                        onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("italic")}
                        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>

                    <Separator orientation="vertical" className="h-6" />

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("heading", { level: 2 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Toggle>

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("bulletList")}
                        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive("orderedList")}
                        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>

                    <Separator orientation="vertical" className="h-6" />

                    <Toggle
                        size="sm"
                        pressed={editor.isActive("blockquote")}
                        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote className="h-4 w-4" />
                    </Toggle>

                    <Separator orientation="vertical" className="h-6" />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Palette className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 p-2" align="start">
                            <div className="grid grid-cols-5 gap-1">
                                {COLOR_PALETTE.map((color) => (
                                    <button
                                        key={color}
                                        className="h-6 w-6 rounded-md border border-muted"
                                        style={{ backgroundColor: color }}
                                        onClick={() => editor.chain().focus().setColor(color).run()}
                                    />
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="col-span-5 text-[10px] h-6 mt-1"
                                    onClick={() => editor.chain().focus().unsetColor().run()}
                                >
                                    Limpiar color
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
            <EditorContent editor={editor} className={disabled ? "" : "min-h-[60px]"} />
        </div>
    );
}
