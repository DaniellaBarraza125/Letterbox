"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DELIVERY_METHODS, DeliveryMethodId } from "@/lib/delivery-methods";
import { calculateArrivalDate } from "@/lib/calculate-arrival";

type Props = {
  senderId: string;
  recipientId: string;
  recipientName: string;
};

export default function WriteLetterForm({
  senderId,
  recipientId,
  recipientName,
}: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [method, setMethod] = useState<DeliveryMethodId>("letter");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage("La carta no puede estar vacía");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Por ahora usamos una distancia fija de prueba (800 km)
      const distanceKm = 800;
      const estimatedArrival = calculateArrivalDate(method, distanceKm);

      const { error } = await supabase.from("letters").insert({
        sender_id: senderId,
        recipient_id: recipientId,
        title: title || null,
        content: {
          type: "doc",
          content: [
            { type: "paragraph", content: [{ type: "text", text: content }] },
          ],
        },
        content_text: content,
        delivery_method: method,
        estimated_arrival_at: estimatedArrival.toISOString(),
        status: "in_transit",
      });

      if (error) throw error;

      setMessage("¡Carta enviada!");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setMessage(err.message || "Error al enviar la carta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Una carta para ti..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Tu carta</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe con el corazón..."
              rows={10}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Método de envío</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERY_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    method === m.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <span>{m.icon}</span>
                    <span>{m.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {m.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {message && (
            <p className="text-sm text-center text-muted-foreground">
              {message}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando..." : `Enviar a ${recipientName}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
