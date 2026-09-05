import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import WriteLetterForm from "@/components/WriteLetterForm";

export default async function WritePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("display_name, location")
    .eq("id", user.id)
    .single();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, email, location")
    .neq("id", user.id);

  const recipient = profiles?.[0] || null;

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
