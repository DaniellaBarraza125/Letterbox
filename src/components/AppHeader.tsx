import Link from "next/link";
import { Button } from "@/components/ui/button";

type Profile = {
  display_name: string | null;
  avatar_url: string | null;
} | null;

export default function AppHeader({
  profile,
  email,
}: {
  profile: Profile;
  email?: string | null;
}) {
  const initial =
    profile?.display_name?.charAt(0)?.toUpperCase() ||
    email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Nuestro Buzón
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/write">
            <Button size="sm">Escribir</Button>
          </Link>

          <Link href="/connect">
            <Button variant="ghost" size="sm">
              Conectar
            </Button>
          </Link>

          <Link href="/stamps">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Estampas
            </Button>
          </Link>

          <Link
            href="/profile"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border bg-muted"
            title="Mi perfil"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium">{initial}</span>
            )}
          </Link>

          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Salir
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
