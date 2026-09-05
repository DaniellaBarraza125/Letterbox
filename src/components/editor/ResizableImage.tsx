"use client";

import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useState, useRef, useCallback } from "react";

export default function ResizableImage({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startX.current = e.clientX;
      startWidth.current = imgRef.current?.width || node.attrs.width || 300;

      const onMouseMove = (ev: MouseEvent) => {
        const diff = ev.clientX - startX.current;
        const newWidth = Math.max(
          100,
          Math.min(800, startWidth.current + diff),
        );
        updateAttributes({ width: Math.round(newWidth) });
      };

      const onMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [node.attrs.width, updateAttributes],
  );

  return (
    <NodeViewWrapper className="relative inline-block my-3" data-drag-handle>
      <div
        className={`relative inline-block ${
          selected ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""
        }`}
      >
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          width={node.attrs.width || undefined}
          className="rounded-lg max-w-full h-auto block"
          draggable={false}
        />

        {selected && (
          <div
            onMouseDown={onMouseDown}
            className={`absolute bottom-1 right-1 w-4 h-4 bg-primary rounded-sm cursor-se-resize border-2 border-white shadow ${
              isResizing ? "scale-110" : ""
            }`}
            title="Arrastra para redimensionar"
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
