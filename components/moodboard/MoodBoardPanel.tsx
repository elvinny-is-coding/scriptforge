// components/moodboard/MoodBoardPanel.tsx
"use client";

import { useState } from "react";
import { useMoodBoard } from "@/hooks/useMoodBoard";
import { ImageCard } from "./ImageCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

interface MoodBoardPanelProps {
  projectId: string;
}

export function MoodBoardPanel({ projectId }: MoodBoardPanelProps) {
  const { images, loading, deleteImage } = useMoodBoard(projectId);
  const [modalImage, setModalImage] = useState<(typeof images)[number] | null>(
    null,
  );

  if (loading)
    return (
      <div className="p-4 flex justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="h-full flex flex-col p-2">
      <h3 className="font-medium mb-1 text-sm">Mood Board</h3>
      <p className="text-xs text-muted-foreground mb-2">
        Right‑click any scene text in the editor and choose &quot;Generate
        Concept Art&quot; to add images.
      </p>

      {images.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Right‑click any scene text → Generate Concept Art"
        />
      ) : (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 gap-2">
            {images.map((img) => (
              <ImageCard
                key={img.id}
                url={`data:image/png;base64,${img.url}`}
                prompt={img.refined_prompt || img.original_text || ""}
                isSelected={false}
                onClick={() => setModalImage(img)}
                onDelete={() => deleteImage(img.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Full‑view modal */}
      <Dialog open={!!modalImage} onOpenChange={() => setModalImage(null)}>
        {/* 1. Override default Shadcn limits with sm:max-w-[90vw] & w-[90vw] */}
        <DialogContent className="max-w-[90vw] sm:max-w-[90vw] w-[90vw] p-2 sm:p-4">
          <DialogTitle className="sr-only">Concept Art</DialogTitle>
          {modalImage && (
            /* 2. Swap aspect-[4/3] for viewport height to maximize size */
            <div className="relative w-full h-[80vh]">
              <Image
                src={`data:image/png;base64,${modalImage.url}`}
                alt={
                  modalImage.refined_prompt || modalImage.original_text || ""
                }
                fill
                unoptimized
                className="object-contain" /* Stretches image to fully fill the container */
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
