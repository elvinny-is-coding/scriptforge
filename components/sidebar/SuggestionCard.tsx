// components/sidebar/SuggestionCard.tsx
import { Button } from "@/components/ui/button";

interface SuggestionCardProps {
  original: string;
  suggestion: string;
  explanation?: string;
  onApply: () => void;
}

export function SuggestionCard({
  original,
  suggestion,
  explanation,
  onApply,
}: SuggestionCardProps) {
  return (
    <div className="border rounded-md p-3 text-sm space-y-2">
      <div className="flex justify-between gap-2">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Original</p>
          <p className="line-through">{original}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Suggestion</p>
          <p>{suggestion}</p>
        </div>
      </div>
      {explanation && <p className="text-xs italic">{explanation}</p>}
      <Button size="sm" variant="outline" onClick={onApply}>
        Apply
      </Button>
    </div>
  );
}
