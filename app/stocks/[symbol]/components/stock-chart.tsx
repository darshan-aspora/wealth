"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";
import type { IChartApi, UTCTimestamp } from "lightweight-charts";
import { useTheme } from "@/components/theme-provider";
import { type CandleData } from "./mock-data";

interface StockChartProps {
  data: CandleData[];
  chartType: "line" | "candle";
  showVolume: boolean;
  isGain: boolean;
}

export function StockChart({ data, chartType, showVolume, isGain }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gainColor = "hsl(142, 71%, 45%)";
  const lossColor = "hsl(0, 72%, 51%)";
  const lineColor = isGain ? gainColor : lossColor;

  const createChartInstance = useCallback(() => {
    if (!containerRef.current) return;

    // Cleanup
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 220,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: isDark ? "hsl(240, 5%, 55%)" : "hsl(240, 3.8%, 46.1%)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: isDark ? "hsl(240, 4%, 14%)" : "hsl(240, 5.9%, 90%)", style: 3 },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: showVolume ? 0.25 : 0.05 },
      },
      timeScale: {
        borderVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        horzLine: { visible: true, labelVisible: true, style: 3, color: isDark ? "hsl(240, 5%, 30%)" : "hsl(240, 5%, 70%)" },
        vertLine: { visible: true, labelVisible: true, style: 3, color: isDark ? "hsl(240, 5%, 30%)" : "hsl(240, 5%, 70%)" },
      },
      handleScroll: false,
      handleScale: false,
    });

    if (chartType === "line") {
      const lineSeries = chart.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBackgroundColor: lineColor,
      });

      lineSeries.setData(
        data.map((d) => ({ time: d.time as unknown as import("lightweight-charts").Time, value: d.close })),
      );
    } else {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: gainColor,
        downColor: lossColor,
        borderUpColor: gainColor,
        borderDownColor: lossColor,
        wickUpColor: gainColor,
        wickDownColor: lossColor,
        priceLineVisible: false,
        lastValueVisible: false,
      });

      candleSeries.setData(
        data.map((d) => ({
          time: d.time as UTCTimestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        })),
      );
    }

    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: isDark ? "hsl(240, 5%, 20%)" : "hsl(240, 5%, 85%)",
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
        priceLineVisible: false,
        lastValueVisible: false,
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      volumeSeries.setData(
        data.map((d) => ({
          time: d.time as UTCTimestamp,
          value: d.volume,
          color: d.close >= d.open
            ? (isDark ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.3)")
            : (isDark ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.3)"),
        })),
      );
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;
  }, [data, chartType, showVolume, isDark, lineColor]);

  useEffect(() => {
    createChartInstance();
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [createChartInstance]);

  // Resize handler
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && chartRef.current) {
        chartRef.current.applyOptions({ width: entry.contentRect.width });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return <div ref={containerRef} className="w-full" />;
}
