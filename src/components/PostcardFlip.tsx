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
    <div
      className="mx-auto w-full max-w-md space-y-4"
      style={{ width: "900px" }}
    >
      <div className="relative h-64 sm:h-80 [perspective:1000px]">
        <div
          className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Frente */}
          <div className="absolute inset-0 overflow-hidden rounded-xl border bg-card shadow-sm [backface-visibility:hidden]">
            <img
              src={imageUrl}
              alt="Postal"
              className="h-full w-full object-cover"
            />

            {stamp?.startsWith("http") ? (
              <img
                src={stamp}
                alt="Estampa"
                className="absolute right-3 top-3 h-14 w-10 rounded-sm border border-white/70 object-cover shadow"
              />
            ) : (
              <div className="absolute right-3 top-3 text-3xl drop-shadow">
                {stamp || "📮"}
              </div>
            )}

            {isExpress && (
              <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wide text-white">
                Express
              </div>
            )}
          </div>

          {/* Dorso */}
          <div className="absolute inset-0 rounded-xl border bg-[#f7f3ea] p-4 text-sm text-neutral-800 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="grid h-full grid-cols-[65fr_auto_35fr] gap-4">
              <div className="flex min-h-0 flex-col overflow-hidden">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-neutral-500">
                  Mensaje
                </p>
                <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="w-px bg-neutral-300" />

              <div className="flex min-h-0 flex-col gap-4 overflow-hidden px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-neutral-500">
                    De
                  </p>
                  <p className="whitespace-pre-wrap break-words font-medium">
                    {fromAddress || "—"}
                  </p>
                </div>
                <div className="min-w-0 mt-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wider text-neutral-500">
                    Para
                  </p>
                  <p className="whitespace-pre-wrap break-words">
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
