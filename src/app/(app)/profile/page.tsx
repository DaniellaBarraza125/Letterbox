import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Volver al buzón
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Mi Perfil</h1>
      <ProfileForm profile={profile} userEmail={user.email!} />
    </div>
  );
}
