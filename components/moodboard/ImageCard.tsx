// components/moodboard/ImageCard.tsx
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import Image from "next/image";

interface ImageCardProps {
  url: string;
  prompt: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function ImageCard({
  url,
  prompt,
  isSelected,
  onClick,
  onDelete,
}: ImageCardProps) {
  return (
    <div
      className={`relative rounded-md overflow-hidden border-2 cursor-pointer group h-32 ${
        isSelected ? "border-primary" : "border-transparent"
      }`}
      onClick={onClick}
    >
      <Image
        src={url}
        alt={prompt || "Concept art"}
        fill
        unoptimized
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}
