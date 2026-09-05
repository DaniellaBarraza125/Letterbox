"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Stamp = {
  id: string;
  name: string;
  image_url: string;
  country: string | null;
  mail_type: string;
  is_active: boolean;
};

export default function StampsManager({
  initialStamps,
}: {
  initialStamps: Stamp[];
}) {
  const supabase = createClient();
  const [stamps, setStamps] = useState(initialStamps);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [mailType, setMailType] = useState<"normal" | "express" | "any">("any");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) {
      setMessage("Nombre e imagen son obligatorios");
      return;
    }
    setLoading(true);
    setMessage("");

    const ext = file.name.split(".").pop();
    const path = `stamps/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("media")
      .upload(path, file);
    if (upErr) {
      setMessage(upErr.message);
      setLoading(false);
      return;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);

    const { data: created, error } = await supabase
      .from("stamps")
      .insert({
        name,
        country: country || null,
        mail_type: mailType,
        image_url: data.publicUrl,
      })
      .select()
      .single();

    if (error) setMessage(error.message);
    else {
      setStamps((prev) => [created, ...prev]);
      setName("");
      setCountry("");
      setFile(null);
      setMessage("Estampa creada");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="space-y-4 rounded-xl border p-4">
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="España correo 2026"
          />
        </div>
        <div className="space-y-2">
          <Label>País (opcional)</Label>
          <Input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="España"
          />
        </div>
        <div className="space-y-2">
          <Label>Tipo de correo</Label>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={mailType}
            onChange={(e) => setMailType(e.target.value as any)}
          >
            <option value="any">Cualquiera</option>
            <option value="normal">Normal</option>
            <option value="express">Express</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Imagen rectangular</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Añadir estampa"}
        </Button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stamps.map((s) => (
          <div key={s.id} className="rounded-lg border p-2">
            <img
              src={s.image_url}
              alt={s.name}
              className="aspect-[3/4] w-full rounded object-cover"
            />
            <p className="mt-2 text-sm font-medium">{s.name}</p>
            <p className="text-xs text-muted-foreground">
              {s.country || "Sin país"} · {s.mail_type}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
