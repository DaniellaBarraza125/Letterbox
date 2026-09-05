import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { DELIVERY_METHODS } from "@/lib/delivery-methods";
import { LETTER_CLOSINGS, formatLetterHeader } from "@/lib/letter-styles";
import LetterArrival from "@/components/LetterArrival";
import PhotoStack from "@/components/PhotoStack";
import PostcardFlip from "@/components/PostcardFlip";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LetterPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: letter } = await supabase
    .from("letters")
    .select(
      "*, sender:profiles!letters_sender_id_fkey(display_name, avatar_url, email, location)",
    )
    .eq("id", id)
    .single();

  if (!letter) notFound();

  if (letter.sender_id !== user.id && letter.recipient_id !== user.id) {
    redirect("/");
  }

  const method = DELIVERY_METHODS.find((m) => m.id === letter.delivery_method);
  const hasArrived = new Date(letter.estimated_arrival_at) <= new Date();
  const canRead =
    letter.letter_type === "postcard" ||
    letter.visibility === "shared" ||
    letter.sender_id === user.id ||
    hasArrived;

  // Marcar como abierta (opcional, best-effort)
  if (canRead && letter.recipient_id === user.id && !letter.opened_at) {
    await supabase
      .from("letters")
      .update({ opened_at: new Date().toISOString(), status: "read" })
      .eq("id", letter.id);
  }

  const closing = LETTER_CLOSINGS.find((c) => c.id === letter.closing_style);
  const carouselUrls: string[] = Array.isArray(letter.carousel_urls)
    ? letter.carousel_urls
    : [];
  const carouselCaptions: string[] = Array.isArray(letter.carousel_captions)
    ? letter.carousel_captions
    : [];

  const typeLabel =
    letter.letter_type === "postcard"
      ? "Postal"
      : letter.visibility === "shared"
        ? "Buzón"
        : "Carta privada";

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Volver al buzón
        </Link>
      </div>

      {!canRead ? (
        <LetterArrival
          method={method}
          arrivalDate={letter.estimated_arrival_at}
          title={letter.title}
        />
      ) : (
        <div className="space-y-6">
          {/* Metadatos fuera de la carta */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
              {method?.icon} {method?.name}
            </span>
            <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
              {typeLabel}
            </span>
            {letter.is_express && (
              <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                Correo express
              </span>
            )}
          </div>
          {/* POSTAL */}
          {letter.letter_type === "postcard" && letter.postcard_image_url ? (
            <PostcardFlip
              imageUrl={letter.postcard_image_url}
              message={letter.postcard_message || letter.content_text || ""}
              stamp={letter.postcard_stamp || "📮"}
              fromAddress={letter.postcard_from_address}
              toAddress={letter.postcard_to_address}
              isExpress={!!letter.is_express}
            />
          ) : (
            /* CARTA / POST DELIMITADA */
            <article className="rounded-xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
              <header className="space-y-3">
                <pre className="text-sm text-muted-foreground whitespace-pre-line">
                  {formatLetterHeader(
                    letter.opening_style || "classic",
                    new Date(letter.letter_date || letter.created_at),
                    letter.letter_location || letter.sender?.location || "",
                  )}
                </pre>

                <h1 className="text-3xl font-semibold">
                  {letter.title || "Sin título"}
                </h1>

                <p className="text-muted-foreground">
                  De:{" "}
                  {letter.sender?.display_name ||
                    letter.sender?.email ||
                    "Alguien especial"}
                </p>
              </header>

              {letter.content?.html ? (
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: letter.content.html }}
                />
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {letter.content_text}
                </div>
              )}

              <p className="pt-6 text-right italic">
                {closing?.label || "Cordialmente"},{" "}
                {letter.sender?.display_name || "—"}
              </p>
            </article>
          )}
          {/* Carrusel / álbum */}
          {letter.letter_type !== "postcard" && (
            <PhotoStack
              note={letter.carousel_note}
              items={carouselUrls.map((url, i) => ({
                url,
                caption: carouselCaptions[i] || "",
              }))}
            />
          )}
        </div>
      )}
    </div>
  );
}
