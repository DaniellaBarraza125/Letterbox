"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizableImageExtension } from "@/components/editor/ResizableImageExtension";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Image as ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
} from "lucide-react";

type Props = {
  content: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
};

const COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function RichEditor({
  content,
  onChange,
  placeholder = "Escribe con el corazón...",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showVideoUrl, setShowVideoUrl] = useState(false);
  const supabase = createClient();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      ResizableImageExtension.configure({
        inline: false,
        allowBase64: false,
      }),
      Youtube.configure({
        controls: true,
        modestBranding: true,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg my-4",
        },
      }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
  });

  const uploadVideoFile = async (file: File) => {
    if (!editor) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("El vídeo no puede superar 20MB");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `letters/videos/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(fileName, file);
    if (error) {
      alert("Error al subir vídeo: " + error.message);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    editor
      .chain()
      .focus()
      .insertContent(
        `<div class="my-4"><video controls src="${data.publicUrl}" class="w-full rounded-lg"></video></div>`,
      )
      .run();
  };

  const uploadImage = async (file: File) => {
    if (!editor) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `letters/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("media")
      .upload(fileName, file);
    if (error) {
      alert("Error al subir imagen: " + error.message);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(fileName);
    editor
      .chain()
      .focus()
      .insertContent(
        `<div class="my-4"><img src="${data.publicUrl}" class="w-full rounded-lg" /></div>`,
      )
      .run();
  };

  const addVideo = () => {
    if (!editor || !videoUrl.trim()) return;
    editor.commands.setYoutubeVideo({ src: videoUrl.trim() });
    setVideoUrl("");
    setShowVideoInput(false);
  };

  if (!editor) return null;

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border rounded-md p-2 bg-muted/30">
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* colores... */}

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()
          }
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && uploadImage(e.target.files[0])
          }
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => videoInputRef.current?.click()}
        >
          <Video className="h-4 w-4" />
        </Button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && uploadVideoFile(e.target.files[0])
          }
        />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setShowVideoUrl((v) => !v)}
          title="Vídeo por URL"
        >
          <Video className="h-4 w-4 opacity-70" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
      {/* Input de vídeo */}
      {showVideoInput && (
        <div className="flex gap-2">
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Pega una URL de YouTube..."
          />
          <Button type="button" onClick={addVideo}>
            Añadir
          </Button>
        </div>
      )}

      <EditorContent editor={editor} />

      <p className="text-xs text-muted-foreground">
        Tip: puedes redimensionar imágenes seleccionándolas y usando los
        controles del navegador / estilos. El arrastre libre de bloques lo
        añadimos en el siguiente paso.
      </p>
    </div>
  );
}
