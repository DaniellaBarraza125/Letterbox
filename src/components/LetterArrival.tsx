"use client";

import { DELIVERY_METHODS } from "@/lib/delivery-methods";

type Method = (typeof DELIVERY_METHODS)[number] | undefined;

export default function LetterArrival({
  method,
  arrivalDate,
  title,
}: {
  method: Method;
  arrivalDate: string;
  title: string | null;
}) {
  const arrival = new Date(arrivalDate);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
      <div className="text-6xl animate-bounce">{method?.icon || "✉️"}</div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {title || "Tu carta"} está en camino
        </h1>
        <p className="text-muted-foreground max-w-md">
          Viaja {method?.name ? `en ${method.name.toLowerCase()}` : "hacia ti"}.
          <br />
          Llegará el{" "}
          <span className="font-medium text-foreground">
            {arrival.toLocaleString("es-ES", {
              dateStyle: "full",
              timeStyle: "short",
            })}
          </span>
        </p>
      </div>

      <p className="text-sm text-muted-foreground italic">
        La espera también forma parte del mensaje.
      </p>
    </div>
  );
}
