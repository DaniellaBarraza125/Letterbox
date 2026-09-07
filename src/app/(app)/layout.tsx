import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader profile={profile} email={user.email} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
