'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  projectId: any
}

export default function RichTextEditor({ value, onChange, projectId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value])

  const handleUploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId.toString())

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    if (data.url) {
      editor?.chain().focus().setImage({ src: data.url }).run()
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUploadImage(file)
    e.target.value = ''
  }

  if (!editor) return null

  return (
    <div className="border p-2 rounded bg-white">
        <EditorContent editor={editor} className="p-2 min-h-[200px]" />
      <div className="flex gap-2 mb-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="font-bold">B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="italic">I</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button onClick={triggerFileInput}>📤 Tải ảnh</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
