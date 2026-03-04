"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type TickerVisibilityCtx = {
  tickerVisible: boolean;
  showTicker: () => void;
  hideTicker: () => void;
};

const Ctx = createContext<TickerVisibilityCtx>({
  tickerVisible: true,
  showTicker: () => {},
  hideTicker: () => {},
});

export function TickerVisibilityProvider({ children }: { children: ReactNode }) {
  const [tickerVisible, setTickerVisible] = useState(true);
  return (
    <Ctx.Provider
      value={{
        tickerVisible,
        showTicker: () => setTickerVisible(true),
        hideTicker: () => setTickerVisible(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTickerVisibility() {
  return useContext(Ctx);
}
