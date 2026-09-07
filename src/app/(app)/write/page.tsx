import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import WriteLetterForm from "../../../components/WriteLetterForm";

export default async function WritePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("display_name, location, lat, lng")
    .eq("id", user.id)
    .single();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, email, location, lat, lng")
    .neq("id", user.id);

  const { data: connection } = await supabase
    .from("connections")
    .select("*")
    .eq("status", "accepted")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  let recipient = null;

  if (connection) {
    const otherId =
      connection.user_a === user.id ? connection.user_b : connection.user_a;

    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, email, location, lat, lng")
      .eq("id", otherId)
      .single();

    recipient = data;
  }

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

      <h1 className="text-2xl font-semibold mb-2">Escribir carta</h1>
      <p className="text-muted-foreground mb-8">
        {recipient
          ? `Para: ${recipient.display_name || recipient.email}`
          : "Aún no hay otra persona registrada"}
      </p>

      {recipient ? (
        <WriteLetterForm
          senderId={user.id}
          recipientId={recipient.id}
          recipientName={
            recipient.display_name || recipient.email || "Destinatario"
          }
          senderName={
            myProfile?.display_name || user.email?.split("@")[0] || "Yo"
          }
          senderLocation={myProfile?.location || ""}
          senderLat={myProfile?.lat ?? null}
          senderLng={myProfile?.lng ?? null}
          recipientLat={recipient.lat ?? null}
          recipientLng={recipient.lng ?? null}
        />
      ) : (
        <p className="text-muted-foreground">
          Necesitas que la otra persona también tenga cuenta para enviarle
          cartas.
        </p>
      )}
    </div>
  );
}
