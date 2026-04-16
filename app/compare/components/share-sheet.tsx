"use client";

import { useState } from "react";
import { Copy, Share2, MessageCircle, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ShareSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbols: string[];
  listName: string | null;
  insight: string;
}

export function ShareSheet({ open, onOpenChange, symbols, listName, insight }: ShareSheetProps) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null);

  const title = listName ?? `Comparing ${symbols.join(" · ")}`;
  const previewText = `Comparing ${symbols.join(" · ")} on Aspora\n${insight}`;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/compare/shared?symbols=${symbols.join(",")}`
      : "";

  const copyToClipboard = async (text: string, kind: "link" | "text") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title,
          text: previewText,
          url: shareUrl,
        });
        onOpenChange(false);
      } catch {
        /* user cancelled */
      }
    } else {
      copyToClipboard(`${previewText}\n${shareUrl}`, "text");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-3xl border-t-0 px-5 pb-8 pt-5"
      >
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="text-[20px] font-bold">Share this comparison</SheetTitle>
        </SheetHeader>

        {/* Preview card */}
        <div className="mt-4 rounded-2xl bg-muted p-4">
          <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/60">
            Preview
          </p>
          <p className="mt-2 text-[15px] font-bold text-foreground">
            {title}
          </p>
          <p className="mt-1.5 text-[14px] leading-snug text-muted-foreground">
            {insight}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-1">
          <ShareAction
            icon={<Share2 size={18} strokeWidth={2} />}
            label="Share via…"
            sublabel="Messages, email, any app"
            onClick={nativeShare}
          />
          <ShareAction
            icon={copied === "link" ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2} />}
            label={copied === "link" ? "Link copied" : "Copy link"}
            sublabel={shareUrl.replace(/^https?:\/\//, "")}
            onClick={() => copyToClipboard(shareUrl, "link")}
            highlight={copied === "link"}
          />
          <ShareAction
            icon={copied === "text" ? <Check size={18} strokeWidth={2.5} /> : <MessageCircle size={18} strokeWidth={2} />}
            label={copied === "text" ? "Text copied" : "Copy as text"}
            sublabel="Preview + link for chat apps"
            onClick={() => copyToClipboard(`${previewText}\n${shareUrl}`, "text")}
            highlight={copied === "text"}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ShareAction({
  icon,
  label,
  sublabel,
  onClick,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 py-3 px-2 -mx-2 text-left rounded-xl active:bg-muted/50 transition-colors"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
          highlight ? "bg-[hsl(var(--gain))]/15 text-[hsl(var(--gain))]" : "bg-muted text-foreground",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-foreground truncate">{label}</span>
        <span className="block text-[13px] text-muted-foreground truncate">{sublabel}</span>
      </span>
    </button>
  );
}
