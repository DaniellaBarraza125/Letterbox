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

  // Cartas que me han enviado y ya llegaron o están en camino
  const { data: letters } = await supabase
    .from("letters")
    .select(
      "*, sender:profiles!letters_sender_id_fkey(display_name, avatar_url)",
    )
    .eq("recipient_id", user.id)
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
                <div
                  key={letter.id}
                  className="border rounded-xl p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
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

                  {isInTransit ? (
                    <p className="text-sm text-muted-foreground mt-3 italic">
                      La carta todavía está viajando. Llegará el{" "}
                      {new Date(letter.estimated_arrival_at).toLocaleString(
                        "es-ES",
                      )}
                    </p>
                  ) : (
                    <p className="text-sm mt-3 line-clamp-2">
                      {letter.content_text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
