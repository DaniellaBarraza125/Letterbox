"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Stamp = {
  id: string;
  name: string;
  image_url: string;
  country: string | null;
  mail_type: "normal" | "express" | "any";
};

export type PostcardData = {
  imageUrl: string;
  message: string;
  stampId: string | null;
  stampUrl: string | null;
  fromAddress: string;
  toAddress: string;
  isExpress: boolean;
};

type Props = {
  senderLocation: string;
  recipientName: string;
  value: PostcardData;
  onChange: (data: PostcardData) => void;
};

const MAX_WORDS = 40;

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function PostcardComposer({
  senderLocation,
  recipientName,
  value,
  onChange,
}: Props) {
  const supabase = createClient();
  const [flipped, setFlipped] = useState(false);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [uploading, setUploading] = useState(false);

  const words = countWords(value.message);

  const selectedStamp = useMemo(
    () => stamps.find((s) => s.id === value.stampId) || null,
    [stamps, value.stampId],
  );

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("stamps")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setStamps((data as Stamp[]) || []);
    };
    load();
  }, []);

  // Si no hay dirección de origen, usa la del perfil
  useEffect(() => {
    if (!value.fromAddress && senderLocation) {
      onChange({ ...value, fromAddress: senderLocation });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [senderLocation]);

  const update = (patch: Partial<PostcardData>) => {
    onChange({ ...value, ...patch });
  };

  const filteredStamps = stamps.filter(
    (s) =>
      s.mail_type === "any" ||
      s.mail_type === (value.isExpress ? "express" : "normal"),
  );

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `letters/postcards/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);

    if (!error) {
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      update({ imageUrl: data.publicUrl });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() =>
            update({ isExpress: false, stampId: null, stampUrl: null })
          }
          className={`rounded-lg border p-3 text-left ${
            !value.isExpress ? "border-primary bg-primary/5" : ""
          }`}
        >
          <div className="font-medium">Correo normal</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Estampas estándar
          </p>
        </button>
        <button
          type="button"
          onClick={() =>
            update({ isExpress: true, stampId: null, stampUrl: null })
          }
          className={`rounded-lg border p-3 text-left ${
            value.isExpress ? "border-primary bg-primary/5" : ""
          }`}
        >
          <div className="font-medium">Correo express</div>
          <p className="mt-1 text-xs text-muted-foreground">Estampas express</p>
        </button>
      </div>

      <div className="mx-auto w-full max-w-xl">
        <div className="relative aspect-[3/2] rounded-xl border-2 border-dashed border-muted-foreground/40 p-2">
          <div className="relative h-full w-full [perspective:1200px]">
            <div
              className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
              style={{
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Frente */}
              <div className="absolute inset-0 overflow-hidden rounded-lg bg-muted/20 [backface-visibility:hidden]">
                {value.imageUrl ? (
                  <img
                    src={value.imageUrl}
                    alt="Postal"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>
                      {uploading
                        ? "Subiendo..."
                        : "Haz clic para cargar la imagen"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file);
                      }}
                    />
                  </label>
                )}

                {(value.stampUrl || selectedStamp?.image_url) && (
                  <img
                    src={value.stampUrl || selectedStamp?.image_url}
                    alt="Estampa"
                    className="absolute right-3 top-3 h-14 w-10 rounded-sm border border-white/70 object-cover shadow"
                  />
                )}
              </div>

              {/* Dorso */}
              <div className="absolute inset-0 rounded-lg bg-[#f7f3ea] p-4 text-neutral-800 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="grid h-full grid-cols-2 gap-3">
                  <div className="flex min-h-0 flex-col">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-neutral-500">
                      Mensaje
                    </p>
                    <Textarea
                      value={value.message}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (countWords(next) <= MAX_WORDS)
                          update({ message: next });
                      }}
                      className="min-h-0 flex-1 resize-none bg-transparent text-sm"
                      placeholder="Texto corto de la postal..."
                    />
                    <p className="mt-1 text-right text-[10px] text-neutral-500">
                      {words}/{MAX_WORDS} palabras
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 border-l border-neutral-300 pl-3">
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-neutral-500">
                        De
                      </p>
                      <Textarea
                        value={value.fromAddress}
                        onChange={(e) =>
                          update({ fromAddress: e.target.value })
                        }
                        rows={3}
                        className="resize-none bg-transparent text-xs"
                        placeholder="Tu dirección / ciudad"
                      />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] uppercase tracking-wider text-neutral-500">
                        Para
                      </p>
                      <Textarea
                        value={value.toAddress}
                        onChange={(e) => update({ toAddress: e.target.value })}
                        rows={3}
                        className="resize-none bg-transparent text-xs"
                        placeholder={`Para ${recipientName}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFlipped((v) => !v)}
          >
            {flipped ? "Ver frente" : "Girar al dorso"}
          </Button>

          {value.imageUrl && (
            <label className="inline-flex">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file);
                }}
                id="image-upload"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                Cambiar imagen
              </Button>
            </label>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Estampa</Label>
        {filteredStamps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay estampas. Añádelas en{" "}
            <a href="/stamps" className="underline">
              /stamps
            </a>
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredStamps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ stampId: s.id, stampUrl: s.image_url })}
                className={`shrink-0 rounded-md border p-1 ${
                  value.stampId === s.id
                    ? "border-primary ring-2 ring-primary/30"
                    : ""
                }`}
                title={`${s.name}${s.country ? ` · ${s.country}` : ""}`}
              >
                <img
                  src={s.image_url}
                  alt={s.name}
                  className="h-16 w-12 rounded-sm object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
