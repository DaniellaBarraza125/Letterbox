"use client";

import { useState } from "react";

type Item = {
  url: string;
  caption?: string;
};

export default function PhotoStack({
  items,
  note,
}: {
  items: Item[];
  note?: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!items.length) return null;

  return (
    <div className="mt-8 space-y-3">
      {note && <p className="text-sm italic text-muted-foreground">{note}</p>}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative h-44 w-36 group"
          title="Abrir fotos"
        >
          {items.slice(0, 3).map((item, i) => (
            <img
              key={item.url}
              src={item.url}
              alt=""
              className="absolute inset-0 h-44 w-36 rounded-lg object-cover border shadow-md"
              style={{
                transform: `rotate(${(i - 1) * 4}deg) translateY(${i * 2}px)`,
                zIndex: 10 - i,
              }}
            />
          ))}
          <span className="absolute -bottom-6 left-0 text-xs text-muted-foreground group-hover:underline">
            {items.length} foto{items.length > 1 ? "s" : ""} · clic para ver
          </span>
        </button>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-muted-foreground hover:underline"
          >
            Cerrar álbum
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <figure key={item.url} className="space-y-2">
                <img
                  src={item.url}
                  alt=""
                  className="w-full rounded-lg object-cover border"
                />
                {item.caption && (
                  <figcaption className="text-xs italic text-muted-foreground">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
