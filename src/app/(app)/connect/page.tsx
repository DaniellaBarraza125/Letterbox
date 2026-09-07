import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ConnectForm from "@/components/ConnectForm";

export default async function ConnectPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: connections } = await supabase
    .from("connections")
    .select("*")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Volver al buzón
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">Conectar persona</h1>
      <p className="mt-2 text-muted-foreground mb-6">
        Escribe el email de la otra persona (debe haberse registrado antes).
      </p>

      <ConnectForm currentUserId={user.id} />

      <div className="mt-10 space-y-3">
        <h2 className="font-medium">Tus conexiones</h2>
        {!connections?.length ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay nadie vinculado.
          </p>
        ) : (
          connections.map((c) => {
            const other = c.user_a === user.id ? c.profile_b : c.profile_a;
            return (
              <div key={c.id} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">
                  {(other as any)?.display_name ||
                    (other as any)?.email ||
                    "Persona"}
                </p>
                <p className="text-muted-foreground">{c.status}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
