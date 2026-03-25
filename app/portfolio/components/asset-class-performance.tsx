"use client";

import { TrendingUp, FolderOpen, Sparkles, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ASSET_CLASSES, type AssetClass } from "./portfolio-mock-data";

const ICON_MAP: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp size={18} />,
  FolderOpen: <FolderOpen size={18} />,
  Sparkles: <Sparkles size={18} />,
  BarChart3: <BarChart3 size={18} />,
};

function AssetRow({
  asset,
  maxCurrent,
}: {
  asset: AssetClass;
  maxCurrent: number;
}) {
  const barWidth = (asset.current / maxCurrent) * 100;

  return (
    <div className="py-3">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white",
            asset.color
          )}
        >
          {ICON_MAP[asset.icon]}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-semibold text-foreground">
              {asset.name}
            </p>
            <p className="text-[15px] font-semibold tabular-nums text-foreground">
              {asset.current.toLocaleString("en-US")}
            </p>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[13px] text-muted-foreground">{asset.count}</p>
            <p
              className={cn(
                "text-[14px] font-semibold tabular-nums",
                asset.xirr >= 0 ? "text-gain" : "text-loss"
              )}
            >
              {asset.xirr >= 0 ? "+" : ""}
              {asset.xirr}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 ml-12 h-1.5 rounded-full bg-muted/40 overflow-hidden">
        <div
          className={cn("h-full rounded-full", asset.color, "opacity-60")}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

export function AssetClassPerformance() {
  const maxCurrent = Math.max(...ASSET_CLASSES.map((a) => a.current));

  return (
    <Card className="border-border/50 shadow-none">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[15px]">By Asset Class</CardTitle>
        <CardDescription>
          Performance across your investment types
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {ASSET_CLASSES.map((asset, i) => (
          <div key={asset.name}>
            {i > 0 && <Separator className="bg-border/30" />}
            <AssetRow asset={asset} maxCurrent={maxCurrent} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
