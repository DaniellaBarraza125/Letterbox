"use client";

import { DELIVERY_METHODS } from "@/lib/delivery-methods";

type Method = (typeof DELIVERY_METHODS)[number] | undefined;

const METHOD_ANIMATION: Record<string, string> = {
  walking: "animate-bounce",
  crow: "animate-pulse",
  letter: "animate-pulse",
  motorcycle: "animate-bounce",
  ship: "animate-pulse",
  plane: "animate-[float_2s_ease-in-out_infinite]",
  email: "animate-ping",
};

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
  const anim = method
    ? METHOD_ANIMATION[method.id] || "animate-pulse"
    : "animate-pulse";

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center">
      <div className={`text-7xl ${anim}`}>{method?.icon || "✉️"}</div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {title || "Tu carta"} está en camino
        </h1>
        <p className="max-w-md text-muted-foreground">
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

      <p className="text-sm italic text-muted-foreground">
        La espera también forma parte del mensaje.
      </p>
    </div>
  );
}
