"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ConnectForm({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const clean = email.trim().toLowerCase();

      const { data: other, error: findError } = await supabase
        .from("profiles")
        .select("id, email, display_name")
        .eq("email", clean)
        .maybeSingle();

      if (findError) throw findError;

      if (!other) {
        setMessage(
          "No hay ninguna cuenta con ese email. Que se registre primero.",
        );
        setLoading(false);
        return;
      }

      if (other.id === currentUserId) {
        setMessage("No puedes conectarte contigo misma.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("connections").insert({
        user_a: currentUserId,
        user_b: other.id,
        status: "accepted",
      });

      if (error) {
        if (error.code === "23505") {
          setMessage("Ya estáis conectadas.");
        } else {
          throw error;
        }
      } else {
        setMessage(`Conectada con ${other.display_name || other.email}`);
        setEmail("");
        router.refresh();
      }
    } catch (err: any) {
      setMessage(err.message || "Error al conectar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleConnect} className="space-y-4 rounded-xl border p-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email de la otra persona</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="amigo@email.com"
          required
        />
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Conectando..." : "Vincular"}
      </Button>
    </form>
  );
}
