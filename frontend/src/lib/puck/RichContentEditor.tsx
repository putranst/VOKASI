"use client";
/**
 * VOKASI2 — TipTap WYSIWYG + raw HTML toggle
 * Used by Puck's RichContent block field override.
 */
import React, { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list";
import HardBreak from "@tiptap/extension-hard-break";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import History from "@tiptap/extension-history";

function ToolBtn({ active, disabled, onClick, title, children }: {
  active?: boolean; disabled?: boolean; onClick: () => void;
  title: string; children: React.ReactNode;
}) {
  return (
    <button type="button" title={title} onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-semibold transition-colors
        ${active ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}
        disabled:opacity-30`}>
      {children}
    </button>
  );
}
function Divider() { return <div className="mx-0.5 h-5 w-px bg-zinc-200" />; }

const extensions = [
  Document, Paragraph, Text, Bold, Italic, Underline, Strike,
  Heading.configure({ levels: [1, 2, 3] }),
  BulletList, OrderedList, ListItem, HardBreak, CodeBlock,
  Blockquote, HorizontalRule, History,
];

export type RichContentEditorProps = { value: string; onChange: (html: string) => void; };

export function RichContentEditor({ value, onChange }: RichContentEditorProps) {
  const [rawMode, setRawMode] = useState(false);
  const [rawValue, setRawValue] = useState(value ?? "");

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: value ?? "",
    onUpdate({ editor }: { editor: Editor }) {
      const html = editor.getHTML();
      setRawValue(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value, { emitUpdate: false });
      setRawValue(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const applyRaw = useCallback(() => {
    if (editor) {
      editor.commands.setContent(rawValue, { emitUpdate: false });
      onChange(rawValue);
    }
    setRawMode(false);
  }, [editor, rawValue, onChange]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></ToolBtn>
        <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolBtn>
        <ToolBtn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline">U</span></ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><span className="line-through">S</span></ToolBtn>
        <Divider />
        <ToolBtn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</ToolBtn>
        <ToolBtn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolBtn>
        <ToolBtn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolBtn>
        <Divider />
        <ToolBtn title="Bullet List" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</ToolBtn>
        <ToolBtn title="Ordered List" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1≡</ToolBtn>
        <Divider />
        <ToolBtn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</ToolBtn>
        <ToolBtn title="Code Block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"}</ToolBtn>
        <ToolBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolBtn>
        <Divider />
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↩</ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↪</ToolBtn>
        <div className="ml-auto">
          <button type="button"
            onClick={() => { if (rawMode) { applyRaw(); } else { setRawValue(editor.getHTML()); setRawMode(true); } }}
            className={`rounded px-2 py-0.5 text-xs font-mono transition-colors ${rawMode ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}>
            {rawMode ? "Apply HTML" : "<html>"}
          </button>
        </div>
      </div>
      {rawMode ? (
        <textarea value={rawValue} onChange={(e) => setRawValue(e.target.value)}
          className="w-full bg-zinc-50 p-3 font-mono text-xs text-zinc-700 outline-none resize-none border-0" rows={10} spellCheck={false} />
      ) : (
        <EditorContent editor={editor} className="
          tiptap-editor min-h-[180px] cursor-text p-5 text-[15px] text-zinc-800 outline-none
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p]:my-2 [&_.ProseMirror_p]:leading-8
          [&_.ProseMirror_h1]:text-[32px] [&_.ProseMirror_h1]:leading-[1.2] [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-zinc-900 [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h1]:mt-5
          [&_.ProseMirror_h2]:text-[26px] [&_.ProseMirror_h2]:leading-[1.25] [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-zinc-900 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4
          [&_.ProseMirror_h3]:text-[20px] [&_.ProseMirror_h3]:leading-[1.3] [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-zinc-800 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-3
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-3
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-3
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-zinc-300 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-zinc-500 [&_.ProseMirror_blockquote]:my-3
          [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-zinc-100 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-zinc-700 [&_.ProseMirror_code]:text-[12px]
          [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:bg-zinc-50 [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-zinc-200 [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-zinc-700 [&_.ProseMirror_pre]:text-[13px] [&_.ProseMirror_pre]:my-2
          [&_.ProseMirror_hr]:border-zinc-200 [&_.ProseMirror_hr]:my-4
          [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_strong]:text-zinc-900
          [&_.ProseMirror_em]:italic [&_.ProseMirror_em]:text-zinc-600" />
      )}
    </div>
  );
}