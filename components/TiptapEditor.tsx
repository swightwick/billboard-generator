'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';
import { useEffect } from 'react';

// Custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily,
      FontSize,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none p-3 min-h-[150px] focus:outline-none bg-gray-700 text-white rounded',
        style: 'text-transform: uppercase;'
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-600 rounded bg-gray-700">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-gray-600 flex-wrap">
        <button
          onClick={() => editor.chain().focus().setFontFamily('Oswald').run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive('textStyle', { fontFamily: 'Oswald' }) ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-500`}
          style={{ fontFamily: 'var(--font-oswald)', fontWeight: 500 }}
        >
          Oswald
        </button>
        <button
          onClick={() => editor.chain().focus().setFontFamily('Playfair Display').run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive('textStyle', { fontFamily: 'Playfair Display' }) ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-500`}
          style={{ fontFamily: 'var(--font-playfair-display)' }}
        >
          Playfair Display
        </button>
        <div className="w-px bg-gray-600 mx-1"></div>
        <select
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          defaultValue="24"
          className="px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-blue-500"
        >
          <option value="16">16px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
          <option value="32">32px</option>
          <option value="40">40px</option>
          <option value="48">48px</option>
          <option value="64">64px</option>
          <option value="80">80px</option>
        </select>
        <div className="w-px bg-gray-600 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs rounded italic ${editor.isActive('italic') ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-500`}
        >
          I
        </button>
        <div className="w-px bg-gray-600 mx-1"></div>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-500`}
        >
          ⬅
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-500`}
        >
          ↔
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-600' : 'bg-gray-600'} text-white hover:bg-blue-500`}
        >
          ➡
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
