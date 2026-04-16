"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RenameSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (name: string) => void;
}

export function RenameSheet({ open, onOpenChange, currentName, onRename }: RenameSheetProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onRename(trimmed);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-[430px] rounded-t-3xl border-t-0 px-5 pb-8 pt-5"
      >
        <SheetHeader className="text-left pb-2">
          <SheetTitle className="text-[20px] font-bold">Rename comparison</SheetTitle>
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

        <Button
          onClick={handleSave}
          disabled={!name.trim()}
          className="mt-5 w-full rounded-2xl py-4 text-[16px] font-bold active:scale-[0.98]"
        >
          Save
        </Button>
      </SheetContent>
    </Sheet>
  );
}
