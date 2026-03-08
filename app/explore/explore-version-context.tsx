"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ExploreVersion = "ftux" | "not-funded" | "funded-not-traded";

interface ExploreVersionContextType {
  currentVersion: ExploreVersion;
  setCurrentVersion: (v: ExploreVersion) => void;
  showVersionPicker: boolean;
  setShowVersionPicker: (show: boolean) => void;
}

const ExploreVersionContext = createContext<ExploreVersionContextType | null>(
  null
);

export function useExploreVersion() {
  return useContext(ExploreVersionContext);
}

export function ExploreVersionProvider({ children }: { children: ReactNode }) {
  const [currentVersion, setCurrentVersion] = useState<ExploreVersion>("funded-not-traded");
  const [showVersionPicker, setShowVersionPicker] = useState(false);

  return (
    <ExploreVersionContext.Provider
      value={{
        currentVersion,
        setCurrentVersion,
        showVersionPicker,
        setShowVersionPicker,
      }}
    >
      {children}
    </ExploreVersionContext.Provider>
  );
}
