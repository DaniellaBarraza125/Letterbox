import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DELIVERY_METHODS } from "@/lib/delivery-methods";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: letters } = await supabase
    .from("letters")
    .select(
      "*, sender:profiles!letters_sender_id_fkey(display_name, avatar_url)",
    )
    .or(
      `recipient_id.eq.${user.id},and(visibility.eq.shared,sender_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: false });

  const now = new Date();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            Nuestro Buzón
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/write">
              <Button size="sm">Escribir carta</Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Perfil
              </Button>
            </Link>
            <Link href="/stamps">
              <Button variant="ghost" size="sm">
                Estampas
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button type="submit" variant="outline" size="sm">
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-3xl font-medium">
            Hola, {profile?.display_name || user.email?.split("@")[0]}
          </h2>
          <p className="text-muted-foreground">
            {profile?.location
              ? `Desde ${profile.location}`
              : "Añade tu ubicación en el perfil"}
          </p>
        </div>

        {!letters || letters.length === 0 ? (
          <div className="border border-dashed rounded-xl p-12 text-center text-muted-foreground">
            <p className="text-lg">Todavía no hay cartas</p>
            <p className="text-sm mt-2">
              Escribe la primera carta a tu persona especial
            </p>
            <Link href="/write" className="inline-block mt-6">
              <Button>Escribir carta</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {letters.map((letter) => {
              const method = DELIVERY_METHODS.find(
                (m) => m.id === letter.delivery_method,
              );
              const hasArrived = new Date(letter.estimated_arrival_at) <= now;
              const isInTransit = letter.status === "in_transit" && !hasArrived;
              return (
                <Link
                  href={`/letter/${letter.id}`}
                  className="block border rounded-xl p-5 hover:bg-muted/30"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {letter.title || "Sin título"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        De: {letter.sender?.display_name || "Alguien especial"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-lg">{method?.icon}</span>
                      <p className="text-muted-foreground mt-1">
                        {isInTransit ? "En camino..." : "Ha llegado"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-muted">
                      {letter.letter_type === "postcard"
                        ? "Postal"
                        : letter.visibility === "shared"
                          ? "Buzón"
                          : "Carta privada"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
