import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StampsManager from "@/components/StampsManager";

export default async function StampsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: stamps } = await supabase
    .from("stamps")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Volver
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Estampas</h1>
      <p className="text-muted-foreground mb-6">
        Sube estampas rectangulares según país y tipo de correo.
      </p>
      <StampsManager initialStamps={stamps || []} />
    </div>
  );
}
