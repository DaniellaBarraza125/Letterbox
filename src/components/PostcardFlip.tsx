"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  imageUrl: string;
  message: string;
  stamp?: string | null;
  fromAddress?: string | null;
  toAddress?: string | null;
  isExpress?: boolean;
};

export default function PostcardFlip({
  imageUrl,
  message,
  stamp,
  fromAddress,
  toAddress,
  isExpress,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="mx-auto w-full space-y-4" style={{ maxWidth: 900 }}>
      {/* Postal grande y horizontal */}
      <div
        className="relative w-full [perspective:1200px]"
        style={{ aspectRatio: "3 / 2", minHeight: 420 }}
      >
        <div
          className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* FRENTE */}
          <div className="absolute inset-0 overflow-hidden rounded-xl border bg-card shadow-md [backface-visibility:hidden]">
            <img
              src={imageUrl}
              alt="Postal"
              className="h-full w-full object-cover"
            />

            {stamp?.startsWith("http") ? (
              <img
                src={stamp}
                alt="Estampa"
                className="absolute right-4 top-4 h-16 w-12 rounded-sm border border-white/80 object-cover shadow"
              />
            ) : (
              <div className="absolute right-4 top-4 text-4xl drop-shadow">
                {stamp || "📮"}
              </div>
            )}

            {isExpress && (
              <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-wide text-white">
                Express
              </div>
            )}
          </div>

          {/* DORSO */}
          <div className="absolute inset-0 overflow-hidden rounded-xl border bg-[#f7f3ea] p-6 text-neutral-800 shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="grid h-full min-h-0 grid-cols-[1.5fr_1px_1fr] gap-6">
              {/* Mensaje */}
              <div className="min-h-0 overflow-auto pr-2">
                <p className="mb-3 text-xs uppercase tracking-wider text-neutral-500">
                  Mensaje
                </p>
                <p className="whitespace-pre-wrap break-words text-base leading-7 md:text-lg md:leading-8">
                  {message}
                </p>
              </div>

              <div className="bg-neutral-300" />

              {/* Direcciones */}
              <div className="flex min-h-0 flex-col justify-between gap-6 overflow-auto pl-1">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-neutral-500">
                    De
                  </p>
                  <p className="whitespace-pre-wrap break-words text-base font-medium leading-7">
                    {fromAddress || "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-neutral-500">
                    Para
                  </p>
                  <p className="whitespace-pre-wrap break-words text-base leading-7">
                    {toAddress || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFlipped((v) => !v)}
        >
          {flipped ? "Ver foto" : "Girar postal"}
        </Button>
      </div>
    </div>
  );
}
