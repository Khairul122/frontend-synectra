import { useEditor, EditorContent } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '../../utils/cn';

/* ─── Toolbar button ────────────────────────────────────────────────────── */
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={cn(
        'w-8 h-8 flex items-center justify-center border-2 border-neu-black font-mono text-xs transition-all duration-100',
        active
          ? 'bg-neu-black text-neu-white translate-x-[1px] translate-y-[1px] shadow-none'
          : 'bg-neu-white text-neu-black shadow-neu-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-neu-black/20 mx-0.5" />;
}

/* ─── Custom Link Input (pengganti window.prompt) ───────────────────────── */
function LinkPopover({ onConfirm, onCancel, initialUrl }) {
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); onConfirm(url); }
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
  };

  return (
    <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-neu-white border-2 border-neu-black shadow-neu">
      <div className="px-3 py-2 border-b-2 border-neu-black bg-neu-bg">
        <p className="font-display font-bold text-xs text-neu-black uppercase tracking-wide">Tambah Link</p>
      </div>
      <div className="p-3 space-y-2">
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://contoh.com"
          className="w-full px-3 py-2 border-2 border-neu-black font-body text-sm text-neu-black bg-neu-white outline-none focus:shadow-neu-sm transition-all duration-150"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onConfirm(url); }}
            className="flex-1 py-1.5 bg-neu-primary border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Simpan
          </button>
          {initialUrl && (
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); onConfirm(''); }}
              className="py-1.5 px-3 bg-neu-accent border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-white hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
              Hapus
            </button>
          )}
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onCancel(); }}
            className="py-1.5 px-3 bg-neu-white border-2 border-neu-black shadow-neu-sm font-display font-bold text-xs uppercase text-neu-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main editor ───────────────────────────────────────────────────────── */
export function RichTextEditor({ value, onChange, placeholder = 'Tulis deskripsi proyek...' }) {
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const linkBtnRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-neu-blue underline' } }),
      Placeholder.configure({ placeholder, emptyEditorClass: 'is-editor-empty' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[160px] px-4 py-3 font-body text-sm text-neu-black prose prose-sm max-w-none',
      },
    },
  });

  if (!editor) return null;

  const currentHref = editor.getAttributes('link').href ?? '';

  const handleLinkConfirm = (url) => {
    setShowLinkPopover(false);
    editor.chain().focus().extendMarkRange('link');
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-col border-2 border-neu-black shadow-neu-sm focus-within:shadow-neu focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 transition-all duration-150">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b-2 border-neu-black bg-neu-bg">

        {/* Format teks */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><strong>B</strong></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><em>I</em></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><span className="underline">U</span></ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><span className="line-through">S</span></ToolBtn>

        <Divider />

        {/* Heading */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolBtn>

        <Divider />

        {/* List */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
        </ToolBtn>

        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 6h18M3 12h12M3 18h15" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 6h18M6 12h12M4.5 18h15" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" d="M3 6h18M9 12h12M6 18h15" /></svg>
        </ToolBtn>

        <Divider />

        {/* Blockquote & code */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.748-9.57 9.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h3.983v10h-9.966z" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </ToolBtn>

        {/* Link button — dengan custom popover */}
        <div className="relative" ref={linkBtnRef}>
          <ToolBtn
            onClick={() => setShowLinkPopover(v => !v)}
            active={editor.isActive('link') || showLinkPopover}
            title="Tambah link">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </ToolBtn>
          {showLinkPopover && (
            <LinkPopover
              initialUrl={currentHref}
              onConfirm={handleLinkConfirm}
              onCancel={() => setShowLinkPopover(false)}
            />
          )}
        </div>

        <Divider />

        {/* Undo / Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" /></svg>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
        </ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="bg-neu-white" />
    </div>
  );
}
