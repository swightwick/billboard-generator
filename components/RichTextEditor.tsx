'use client';

import { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
      document.execCommand('insertLineBreak');
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const applyFont = (font: string) => {
    applyFormat('fontName', font);
    setShowFontMenu(false);
  };

  const applySize = (size: string) => {
    applyFormat('fontSize', size);
    setShowSizeMenu(false);
  };

  const applyAlign = (align: string) => {
    applyFormat(`justify${align}`);
  };

  const fonts = ['Oswald', 'Arial', 'Impact', 'Bebas Neue'];
  const sizes = ['1', '2', '3', '4', '5', '6', '7'];
  const sizeLabels: { [key: string]: string } = {
    '1': '10px',
    '2': '13px',
    '3': '16px',
    '4': '18px',
    '5': '24px',
    '6': '32px',
    '7': '48px'
  };

  return (
    <div className="border border-gray-600 rounded bg-gray-700">
      {/* Toolbar */}
      <div className="flex gap-2 p-2 border-b border-gray-600 flex-wrap">
        {/* Font selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          >
            Font ▼
          </button>
          {showFontMenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 min-w-[120px]">
              {fonts.map(font => (
                <button
                  key={font}
                  type="button"
                  onClick={() => applyFont(font)}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-gray-700 text-sm"
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSizeMenu(!showSizeMenu)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          >
            Size ▼
          </button>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 min-w-[100px]">
              {sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => applySize(size)}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-gray-700 text-sm"
                >
                  {sizeLabels[size]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bold */}
        <button
          type="button"
          onClick={() => applyFormat('bold')}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 font-bold text-sm"
        >
          B
        </button>

        {/* Alignment */}
        <button
          type="button"
          onClick={() => applyAlign('Left')}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          title="Align Left"
        >
          ⬅
        </button>
        <button
          type="button"
          onClick={() => applyAlign('Center')}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => applyAlign('Right')}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 text-sm"
          title="Align Right"
        >
          ➡
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="p-3 text-white min-h-[100px] outline-none"
        style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}
        suppressContentEditableWarning
      />
    </div>
  );
}
