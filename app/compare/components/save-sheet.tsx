"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { suggestedName } from "../lib/insights";

interface SaveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbols: string[];
  onSave: (name: string) => void;
}

export function SaveSheet({ open, onOpenChange, symbols, onSave }: SaveSheetProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(suggestedName(symbols));
  }, [open, symbols]);

  const handleSave = () => {
    onSave(name);
    onOpenChange(false);
  };

  const handleSaveWithoutName = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    onSave(`Untitled (${today})`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-3xl border-t-0 px-5 pb-8 pt-5"
      >
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="text-[20px] font-bold">Name this comparison</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={60}
            className="h-12 rounded-xl border border-border/50 bg-muted/30 px-4 text-[17px] font-semibold focus-visible:ring-0 focus-visible:border-foreground/30"
          />
        </div>

        <p className="mt-3 text-[14px] text-muted-foreground">
          {symbols.join(" · ")}
        </p>

        <Button
          onClick={handleSave}
          className="mt-5 w-full rounded-2xl py-4 text-[16px] font-bold active:scale-[0.98]"
        >
          Save
        </Button>

        <button
          type="button"
          onClick={handleSaveWithoutName}
          className="mt-3 w-full text-center text-[14px] font-medium text-muted-foreground active:opacity-60 transition-opacity"
        >
          Don&rsquo;t name it — just save
        </button>
      </SheetContent>
    </Sheet>
  );
}
