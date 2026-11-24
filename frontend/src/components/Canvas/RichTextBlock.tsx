import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { useNotebook } from '../../context/NotebookContext';

interface RichTextBlockProps {
  id: string;
  initialContent: string;
  isLocked: boolean;
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({
  id,
  initialContent,
  isLocked
}) => {
  const { updateBlock, deleteBlock, setActiveEditor } = useNotebook();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Link.configure({ openOnClick: false }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent || '<p></p>',
    editable: !isLocked,
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[44px] text-[#242424] leading-relaxed select-text cursor-text',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Backspace' && editor && editor.isEmpty) {
          deleteBlock(id);
          return true;
        }
        return false;
      }
    },
    onFocus: ({ editor }) => {
      setActiveEditor(editor);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateBlock(id, { content: html });
    },
  });

  useEffect(() => {
    if (editor) {
      setActiveEditor(editor);
    }
  }, [editor, setActiveEditor]);

  // Sync external content changes (e.g. clear content or AI inserts)
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      if (editor.getHTML() !== initialContent && (initialContent === '' || initialContent === '<p></p>')) {
        editor.commands.setContent(initialContent || '<p></p>');
      }
    }
  }, [initialContent, editor]);

  useEffect(() => {
    if (editor && editor.isEditable === isLocked) {
      editor.setEditable(!isLocked);
    }
  }, [editor, isLocked]);

  return (
    <div className="rich-text-block">
      <EditorContent editor={editor} />
    </div>
  );
};

