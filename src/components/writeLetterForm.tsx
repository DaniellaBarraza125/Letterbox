"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DELIVERY_METHODS, DeliveryMethodId } from "@/lib/delivery-methods";
import { calculateArrivalDate } from "@/lib/calculate-arrival";
import {
  LETTER_OPENING_STYLES,
  LETTER_CLOSINGS,
  formatLetterHeader,
} from "@/lib/letter-styles";
import RichEditor from "@/components/RichEditor";
import PostcardComposer, {
  type PostcardData,
} from "@/components/PostCardComposer";

type Props = {
  senderId: string;
  recipientId: string;
  recipientName: string;
  senderName: string;
  senderLocation: string;
};

const emptyPostcard: PostcardData = {
  imageUrl: "",
  message: "",
  stampId: null,
  stampUrl: null,
  fromAddress: "",
  toAddress: "",
  isExpress: false,
};

export default function WriteLetterForm({
  senderId,
  recipientId,
  recipientName,
  senderName,
  senderLocation,
}: Props) {
  const [letterType, setLetterType] = useState<"letter" | "post" | "postcard">(
    "letter",
  );

  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [contentText, setContentText] = useState("");
  const [method, setMethod] = useState<DeliveryMethodId>("letter");
  const [openingStyle, setOpeningStyle] = useState<
    "classic" | "executive" | "victorian"
  >("classic");
  const [closingId, setClosingId] = useState("cordially");
  const [carouselFiles, setCarouselFiles] = useState<string[]>([]);
  const [carouselCaptions, setCarouselCaptions] = useState<string[]>([]);
  const [carouselNote, setCarouselNote] = useState("");
  const [uploadingCarousel, setUploadingCarousel] = useState(false);

  const [postcardData, setPostcardData] = useState<PostcardData>({
    ...emptyPostcard,
    fromAddress: senderLocation || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleCarouselUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingCarousel(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `letters/carousel/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }

    setCarouselFiles((prev) => [...prev, ...urls]);
    setCarouselCaptions((prev) => [...prev, ...urls.map(() => "")]);
    setUploadingCarousel(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (letterType === "postcard") {
        if (!postcardData.imageUrl) {
          setMessage("La postal necesita una imagen");
          setLoading(false);
          return;
        }
        if (!postcardData.message.trim()) {
          setMessage("Escribe un mensaje corto en el dorso");
          setLoading(false);
          return;
        }

        const { error } = await supabase.from("letters").insert({
          sender_id: senderId,
          recipient_id: recipientId,
          title: "Postal",
          content: { text: postcardData.message },
          content_text: postcardData.message,
          delivery_method: "letter",
          estimated_arrival_at: new Date().toISOString(), // pruebas: inmediato
          status: "delivered",
          visibility: "private",
          letter_type: "postcard",
          postcard_image_url: postcardData.imageUrl,
          postcard_message: postcardData.message,
          postcard_stamp: postcardData.stampUrl,
          postcard_from_address: postcardData.fromAddress || null,
          postcard_to_address: postcardData.toAddress || null,
          is_express: postcardData.isExpress,
          letter_date: new Date().toISOString().slice(0, 10),
          letter_location: senderLocation || null,
        });

        if (error) throw error;
      } else {
        if (!contentText.trim()) {
          setMessage("La carta no puede estar vacía");
          setLoading(false);
          return;
        }

        const distanceKm = 800;
        const estimatedArrival = calculateArrivalDate(method, distanceKm);

        const { error } = await supabase.from("letters").insert({
          sender_id: senderId,
          recipient_id: recipientId,
          title: title || null,
          content: contentHtml ? { html: contentHtml } : { text: contentText },
          content_text: contentText,
          delivery_method: method,
          estimated_arrival_at: estimatedArrival.toISOString(),
          status: "in_transit",
          visibility: letterType === "post" ? "shared" : "private",
          letter_type: letterType === "post" ? "post" : "letter",
          opening_style: openingStyle,
          closing_style: closingId,
          letter_date: new Date().toISOString().slice(0, 10),
          letter_location: senderLocation || null,
          carousel_urls: carouselFiles,
          carousel_captions: carouselCaptions,
          carousel_note: carouselNote || null,
        });

        if (error) throw error;
      }

      setMessage("¡Enviado!");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setMessage(err.message || "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>¿Qué quieres enviar?</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setLetterType("letter")}
                className={`rounded-lg border p-3 text-left ${
                  letterType === "letter" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="font-medium">Carta privada</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Solo cuando llegue
                </p>
              </button>
              <button
                type="button"
                onClick={() => setLetterType("post")}
                className={`rounded-lg border p-3 text-left ${
                  letterType === "post" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="font-medium">Buzón / blog</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Espacio compartido
                </p>
              </button>
              <button
                type="button"
                onClick={() => setLetterType("postcard")}
                className={`rounded-lg border p-3 text-left ${
                  letterType === "postcard" ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className="font-medium">Postal</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Foto + mensaje al dorso
                </p>
              </button>
            </div>
          </div>

          {letterType === "postcard" ? (
            <PostcardComposer
              senderLocation={senderLocation}
              recipientName={recipientName}
              value={postcardData}
              onChange={setPostcardData}
            />
          ) : (
            <>
              <div className="whitespace-pre-line rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                {formatLetterHeader(openingStyle, new Date(), senderLocation)}
              </div>

              <div className="space-y-2">
                <Label>Estilo de apertura</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {LETTER_OPENING_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setOpeningStyle(s.id)}
                      className={`rounded-lg border p-3 text-left text-sm ${
                        openingStyle === s.id
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                    >
                      <div className="font-medium">{s.name}</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título (opcional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Una carta para ti..."
                />
              </div>

              <div className="space-y-2">
                <Label>Contenido</Label>
                <RichEditor
                  content={contentText}
                  onChange={(html, text) => {
                    setContentHtml(html);
                    setContentText(text);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Cierre</Label>
                <div className="grid grid-cols-2 gap-2">
                  {LETTER_CLOSINGS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClosingId(c.id)}
                      className={`rounded-lg border p-2 text-sm ${
                        closingId === c.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      {c.label}, {senderName || "yo"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Carrusel de fotos (opcional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleCarouselUpload}
                />
                {uploadingCarousel && (
                  <p className="text-xs text-muted-foreground">Subiendo...</p>
                )}
                <Input
                  value={carouselNote}
                  onChange={(e) => setCarouselNote(e.target.value)}
                  placeholder="Nota del álbum (opcional)"
                />
                {carouselFiles.map((url, i) => (
                  <div key={url} className="flex items-center gap-3">
                    <img
                      src={url}
                      alt=""
                      className="h-14 w-14 rounded border object-cover"
                    />
                    <Input
                      value={carouselCaptions[i] || ""}
                      onChange={(e) => {
                        const next = [...carouselCaptions];
                        next[i] = e.target.value;
                        setCarouselCaptions(next);
                      }}
                      placeholder="Pie de foto..."
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Label>Método de envío</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {DELIVERY_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`rounded-lg border p-3 text-left ${
                        method === m.id ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <span>{m.icon}</span>
                        <span>{m.name}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {m.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {message && (
            <p className="text-center text-sm text-muted-foreground">
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading
              ? "Enviando..."
              : letterType === "postcard"
                ? `Enviar postal a ${recipientName}`
                : `Enviar a ${recipientName}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
