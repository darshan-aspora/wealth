"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompareHeaderProps {
  symbolCount: number;
  isSaved: boolean;
  listName: string | null;
  canSave: boolean;
  onSave: () => void;
  onShare: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onClearAll: () => void;
  onViewSaved: () => void;
}

export function CompareHeader({
  symbolCount,
  isSaved,
  canSave,
  onSave,
  onShare,
}: CompareHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-3 py-2">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-muted-foreground"
        onClick={() => router.back()}
        aria-label="Back"
      >
        <ArrowLeft size={20} strokeWidth={2} />
      </Button>

      <h1 className="flex-1 text-[17px] font-bold tracking-tight text-foreground ml-1">
        Compare Stocks
      </h1>

      {symbolCount > 0 && (
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full",
              isSaved
                ? "text-foreground"
                : canSave
                  ? "text-muted-foreground"
                  : "text-muted-foreground/40",
            )}
            onClick={canSave ? onSave : undefined}
            disabled={!canSave}
            aria-label={isSaved ? "Saved" : "Save"}
          >
            {isSaved ? (
              <Check size={18} strokeWidth={2.5} />
            ) : (
              <Save size={18} strokeWidth={2} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            onClick={onShare}
            aria-label="Share"
          >
            <Share2 size={18} strokeWidth={2} />
          </Button>
        </div>
      )}
    </header>
  );
}
