"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
type Profile = {
  id: string;
  display_name: string | null;
  location: string | null;
  avatar_url: string | null;
};

export default function ProfileForm({
  profile,
  userEmail,
}: {
  profile: Profile | null;
  userEmail: string;
}) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !profile?.id) return;

      setLoading(true);
      setMessage("");

      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      // Subir (upsert = true para sobrescribir si ya existe)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Añadimos un timestamp para evitar caché
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(publicUrl);

      setMessage('Foto subida correctamente. Ahora pulsa "Guardar cambios".');
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || "Error al subir la foto");
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        location: location,
        avatar_url: avatarUrl,
      })
      .eq("id", profile?.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Perfil actualizado correctamente");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl">
                {displayName?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <Input type="file" accept="image/*" onChange={handleUpload} />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={userEmail} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="¿Cómo te llamas?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad o país (ej: Madrid, España)"
            />
          </div>

          {message && (
            <p className="text-sm text-center text-muted-foreground">
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
